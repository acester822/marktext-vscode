/**
 * Standalone Excalidraw editor webview (separate bundle from main.ts).
 * Hosts a full-window Excalidraw canvas, used by the "Edit diagram" button on
 * an ```excalidraw block. The host opens this panel (and moves it into a new
 * VS Code window) so the user gets a real standalone diagram editor.
 *
 * Contract with the host (openExcalidrawEditor in src/excalidraw-editor.ts):
 * - document.body[data-excalidraw-uri]   -> source markdown file URI
 * - document.body[data-excalidraw-scene] -> URI-encoded scene JSON
 * - document.body[data-excalidraw-theme] -> 'light' | 'dark'
 * - outgoing: postMessage({command:'updateExcalidrawData', args:[{uri,data}]})
 * - incoming: {command:'setExcalidrawData', data} -> replace the scene
 */
import { Excalidraw } from '@excalidraw/excalidraw';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { createRoot } from 'react-dom/client';

declare const acquireVsCodeApi: () => {
  postMessage: (message: unknown) => void;
};

const vscodeApi =
  typeof acquireVsCodeApi === 'function' ? acquireVsCodeApi() : null;

function readAttr(name: string): string {
  return document.body.getAttribute(name) ?? '';
}

function parseScene(raw: string): {
  elements: unknown[];
  appState: Record<string, unknown> | undefined;
  files: unknown;
} {
  try {
    const parsed = JSON.parse(decodeURIComponent(raw));
    if (Array.isArray(parsed)) {
      return { elements: parsed, appState: undefined, files: undefined };
    }
    return {
      elements: parsed.elements ?? [],
      appState: parsed.appState
        ? { ...parsed.appState, collaborators: undefined }
        : undefined,
      files: parsed.files,
    };
  } catch {
    return { elements: [], appState: undefined, files: undefined };
  }
}

function ExcalidrawEditorApp() {
  const uri = useMemo(() => readAttr('data-excalidraw-uri'), []);
  const theme = useMemo(
    () => (readAttr('data-excalidraw-theme') === 'dark' ? 'dark' : 'light'),
    [],
  );
  const initial = useMemo(
    () => parseScene(readAttr('data-excalidraw-scene')),
    [],
  );

  const apiRef = useRef<any>(null);
  const lastSentRef = useRef<string>('');
  const saveTimerRef = useRef<any>(null);

  const post = useCallback((command: string, args: unknown[]) => {
    if (vscodeApi) {
      vscodeApi.postMessage({ command, args });
    }
  }, []);

  // The host pushes scene updates when the markdown file changes underneath us.
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      const message = event.data;
      if (!message || message.command !== 'setExcalidrawData') {
        return;
      }
      const api = apiRef.current;
      if (!api) {
        return;
      }
      const incoming = String(message.data ?? '');
      if (!incoming || incoming === lastSentRef.current) {
        return;
      }
      const scene = parseScene(encodeURIComponent(incoming));
      lastSentRef.current = incoming;
      api.updateScene({
        elements: scene.elements as any,
        appState: scene.appState as any,
      });
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  const onChange = useCallback(() => {
    const api = apiRef.current;
    if (!api) {
      return;
    }
    let data: string;
    try {
      data = JSON.stringify({
        elements: api.getSceneElements(),
        appState: { ...api.getAppState(), collaborators: undefined },
        files: api.getFiles(),
      });
      JSON.parse(data);
    } catch {
      return;
    }
    if (data === lastSentRef.current) {
      return;
    }
    lastSentRef.current = data;
    clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      post('updateExcalidrawData', [{ uri, data }]);
    }, 1000);
  }, [post, uri]);

  // Flush any pending (debounced, not-yet-saved) scene immediately. Without
  // this, closing the editor before the 1s debounce fires would silently lose
  // the last few seconds of edits — the markdown file (and the inline SVG)
  // would never see them.
  const flushSave = useCallback(() => {
    const api = apiRef.current;
    if (!api) return;
    let data: string;
    try {
      data = JSON.stringify({
        elements: api.getSceneElements(),
        appState: { ...api.getAppState(), collaborators: undefined },
        files: api.getFiles(),
      });
      JSON.parse(data);
    } catch {
      return;
    }
    if (data === lastSentRef.current) {
      return;
    }
    lastSentRef.current = data;
    clearTimeout(saveTimerRef.current);
    post('updateExcalidrawData', [{ uri, data }]);
  }, [post, uri]);

  // On this webview being torn down we can't rely on the debounced save firing,
  // so flush synchronously. Clearing the ref beforehand makes the flush idempotent.
  useEffect(() => {
    const onUnload = () => flushSave();
    window.addEventListener('beforeunload', onUnload);
    return () => window.removeEventListener('beforeunload', onUnload);
  }, [flushSave]);

  return React.createElement(Excalidraw, {
    theme,
    autoFocus: true,
    initialData: {
      elements: initial.elements as any,
      appState: initial.appState as any,
      files: initial.files as any,
    },
    excalidrawAPI: (api: any) => {
      apiRef.current = api;
      try {
        lastSentRef.current = JSON.stringify({
          elements: api.getSceneElements(),
          appState: { ...api.getAppState(), collaborators: undefined },
          files: api.getFiles(),
        });
      } catch {
        /* ignore */
      }
    },
    onChange,
  });
}

const mount = document.createElement('div');
mount.className = 'excalidraw-standalone-mount';
document.body.appendChild(mount);
createRoot(mount).render(React.createElement(ExcalidrawEditorApp));

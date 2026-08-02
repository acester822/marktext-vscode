/**
 * Contract tests for the extension's declared settings & commands (package.json
 * `contributes`). The user asks that the settings "currently set up" don't break
 * as code evolves — this test pins the public configuration surface so that a
 * docs/JSON change (or a half-removed setting) is caught instead of silently
 * shipping a dead or orphaned setting/command.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, it, expect } from 'vitest';

const pkg = JSON.parse(readFileSync(resolve(__dirname, '../package.json'), 'utf8'));

describe('package.json contributes.configuration', () => {
  it('declares marktext.editor.defaultForMarkdown as boolean, default false (opt-in)', () => {
    const prop = pkg.contributes.configuration.properties['marktext.editor.defaultForMarkdown'];
    expect(prop).toBeDefined();
    expect(prop.type).toBe('boolean');
    // New default-behavior changes must be opt-in (default false), never forced.
    expect(prop.default).toBe(false);
  });

  it('has exactly the settings the extension reads', () => {
    // extension.ts reads: marktext.editor.defaultForMarkdown (via
    // `marktext.editor` namespace + workbench.editorAssociations managed by it)
    // and marktext.editor.maxContentWidth.
    const keys = Object.keys(pkg.contributes.configuration.properties);
    expect(keys.sort()).toEqual(['marktext.editor.defaultForMarkdown', 'marktext.editor.maxContentWidth']);
  });

  it('maxContentWidth is a non-negative number, default 0 (opt-in full width)', () => {
    const prop = pkg.contributes.configuration.properties['marktext.editor.maxContentWidth'];
    expect(prop.type).toBe('number');
    expect(prop.default).toBe(0);
    expect(prop.minimum).toBe(0);
  });
});

describe('package.json contributes.commands', () => {
  const commands: string[] = pkg.contributes.commands.map((c: { command: string }) => c.command);

  it('registers every command the host wires up', () => {
    // These are the commands registered via vscode.commands.registerCommand in
    // src/extension.ts. Keep them in sync when adding/removing commands.
    const expected = [
      'marktext-editor.open',
      'marktext-editor.reloadWebview',
      'marktext-editor.toggleDev',
      'marktext-editor.useClassic',
      'marktext-editor.useWysiwyg',
    ];
    for (const c of expected) {
      expect(commands, `command ${c} missing from package.json`).toContain(c);
    }
  });

  it('has no orphaned commands (declared but unwired)', () => {
    // All declared commands should appear in the source. This catches a command
    // that was removed from code but left in package.json.
    const src = readFileSync(resolve(__dirname, '../src/extension.ts'), 'utf8');
    for (const c of commands) {
      expect(src, `command ${c} declared in package.json but not in extension.ts`).toContain(c);
    }
  });
});

describe('package.json activation & custom editor', () => {
  it('activationEvents cover the custom editor and commands', () => {
    expect(pkg.activationEvents).toContain('onCustomEditor:marktext-vscode.marktextEditor');
    expect(pkg.activationEvents).toContain('onCommand:marktext-editor.open');
    expect(pkg.activationEvents).toContain('onCommand:marktext-editor.reloadWebview');
  });

  it('custom editor selector targets markdown files', () => {
    const sel = pkg.contributes.customEditors[0];
    expect(sel.viewType).toBe('marktext-vscode.marktextEditor');
    expect(sel.selector).toEqual([{ filenamePattern: '*.md' }]);
  });

  it('mirrors the VIEW_TYPE constant used in code', () => {
    const src = readFileSync(resolve(__dirname, '../src/extension.ts'), 'utf8');
    expect(src).toContain(`const VIEW_TYPE = 'marktext-vscode.marktextEditor'`);
  });
});

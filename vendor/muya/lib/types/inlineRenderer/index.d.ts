import { default as Format } from '../block/base/format';
import { default as ParagraphContent } from '../block/content/paragraphContent';
import { Muya } from '../muya';
import { IRenderCursor } from '../selection/types';
import { IParagraphState } from '../state/types';
import { IHighlight, Labels } from './types';
import { default as Renderer } from './renderer';
declare class InlineRenderer {
    muya: Muya;
    labels: Labels;
    renderer: Renderer;
    constructor(muya: Muya);
    private _tokenizer;
    /**
     * Flush every cached image and force inline images to reload.
     *
     * The renderer memoises loaded images in `loadImageMap` (keyed by src,
     * skipped on the next render once `isSuccess` is true) and resolved URLs
     * in `urlMap`. When an image file changes on disk the cached entry would
     * otherwise keep the stale bitmap, so clearing both maps and re-rendering
     * every content block re-runs `loadImageAsync`, which loads the source
     * afresh.
     */
    invalidateImageCache(): void;
    patch(block: Format, cursor?: IRenderCursor, highlights?: IHighlight[]): void;
    private _collectReferenceDefinitions;
    getLabelInfo(blockOrState: ParagraphContent | IParagraphState): {
        label: string | null;
        info: {
            href: string;
            title: string;
        } | null;
    };
}
export default InlineRenderer;

import { Muya } from '../muya';
export declare class MarkdownToHtml {
    markdown: string;
    private _muya?;
    private _exportContainer;
    constructor(markdown: string, _muya?: Muya | undefined);
    private _renderMermaid;
    private _renderDiagram;
    private _injectHeadingIds;
    renderHtml(): Promise<string>;
    /**
     * Get HTML with style.
     *
     * @param options Document options.
     * @param options.title Document `<title>`.
     * @param options.extraCSS Extra CSS appended after the base stylesheets.
     * @param options.inlineStyles Inline the core stylesheets so the output is
     * self-contained and renders offline (default `true`); pass `false` to fall
     * back to CDN `<link>` tags.
     * @param options.dir Text direction set on the root `<html>` (`rtl` / `auto`);
     * `ltr` is the HTML default and stays implicit.
     */
    generate(options?: {
        title?: string;
        extraCSS?: string;
        inlineStyles?: boolean;
        dir?: string;
    }): Promise<string>;
}

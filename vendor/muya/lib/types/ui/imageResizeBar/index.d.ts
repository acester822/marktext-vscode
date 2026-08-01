import { Muya } from '../../index';
export declare class ImageResizeBar {
    muya: Muya;
    static pluginName: string;
    private _reference;
    private _block;
    private _imageInfo;
    private _movingAnchor;
    private _status;
    private _width;
    private _eventId;
    private _lastScrollTop;
    private _resizing;
    private _cleanup;
    private _container;
    constructor(muya: Muya);
    private _listen;
    private _render;
    private _createElements;
    private _update;
    private _mouseDown;
    private _mouseMove;
    private _mouseUp;
    hide(): void;
    destroy(): void;
}

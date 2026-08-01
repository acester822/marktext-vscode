import { ReferenceElement } from '@floating-ui/dom';
import { Muya } from '../../index';
import { IBaseOptions } from '../types';
declare abstract class BaseFloat {
    muya: Muya;
    name: string;
    protected options: IBaseOptions;
    status: boolean;
    capturesContentKeydown: boolean;
    floatBox: HTMLElement | null;
    container: HTMLElement | null;
    private _lastScrollTop;
    protected cb: (...args: unknown[]) => void;
    private _cleanup;
    private _resizeObserver;
    constructor(muya: Muya, name: string, options?: {});
    init(): void;
    listen(): void;
    hide(): void;
    show(reference: ReferenceElement, cb?: (...args: never[]) => void): void;
    destroy(): void;
}
export default BaseFloat;

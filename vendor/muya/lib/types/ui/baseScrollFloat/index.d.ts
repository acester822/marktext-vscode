import { ReferenceElement } from '@floating-ui/dom';
import { Muya } from '../../muya';
import { default as BaseFloat } from '../baseFloat';
declare abstract class BaseScrollFloat extends BaseFloat {
    scrollElement: HTMLElement | null;
    private _reference;
    activeItem: unknown | null;
    renderArray: unknown[];
    constructor(muya: Muya, name: string, options?: {});
    private _createScrollElement;
    protected activeEleScrollIntoView(ele: HTMLElement): void;
    listen(): void;
    hide(): void;
    show(reference: Element | ReferenceElement, cb?: (...args: never[]) => void): void;
    step(direction: 'previous' | 'next'): void;
    selectItem(item: unknown): void;
    abstract render(): void;
    abstract getItemElement(item: unknown): HTMLElement | null;
}
export default BaseScrollFloat;

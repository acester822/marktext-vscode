import { default as Content } from '../block/base/content';
import { default as Parent } from '../block/base/parent';
import { IAttributes, IDatasets } from './types';
interface ICreateDomOptions {
    classList: string[];
    attributes: IAttributes;
    datasets: IDatasets;
}
export declare function query<T extends Element = HTMLElement>(selector: string, parent?: ParentNode): T | null;
export declare function queryAll<T extends Element = HTMLElement>(selector: string, parent?: ParentNode): T[];
export declare function findScrollContainer(node: HTMLElement): HTMLElement;
export declare function getBlock(el: Element | null | undefined): Parent | Content | undefined;
export declare function createDomNode(tagName: string, { classList, attributes, datasets }?: ICreateDomOptions): HTMLElement;
/**
 * [description `add` or `remove` className of element
 */
export declare function operateClassName(element: HTMLElement, ctrl: 'add' | 'remove', className: string): void;
export declare function insertBefore(newNode: HTMLElement, originNode: HTMLElement): void;
export declare function insertAfter(newNode: HTMLElement, originNode: HTMLElement): void;
export {};

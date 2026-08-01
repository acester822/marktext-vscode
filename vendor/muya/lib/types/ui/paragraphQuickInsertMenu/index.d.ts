import { VNode } from 'snabbdom';
import { Muya } from '../../index';
import { IQuickInsertMenuItem } from './config';
import { default as BaseScrollFloat } from '../baseScrollFloat';
export declare class ParagraphQuickInsertMenu extends BaseScrollFloat {
    static pluginName: string;
    capturesContentKeydown: boolean;
    oldVNode: VNode | null;
    private _block;
    activeItem: IQuickInsertMenuItem['children'][number] | null;
    renderArray: IQuickInsertMenuItem['children'];
    private _renderData;
    constructor(muya: Muya);
    get renderData(): IQuickInsertMenuItem[];
    set renderData(data: IQuickInsertMenuItem[]);
    listen(): void;
    render(): void;
    private _search;
    selectItem({ label }: IQuickInsertMenuItem['children'][number]): void;
    getItemElement(item: IQuickInsertMenuItem['children'][number]): HTMLElement | null;
}

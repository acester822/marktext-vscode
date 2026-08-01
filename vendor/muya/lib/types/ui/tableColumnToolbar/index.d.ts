import { Muya } from '../../index';
import { TableColumnToolIcon } from './config';
import { default as BaseFloat } from '../baseFloat';
export declare class TableColumnToolbar extends BaseFloat {
    private _oldVNode;
    private _block;
    private _icons;
    private _toolsContainer;
    static pluginName: string;
    capturesContentKeydown: boolean;
    constructor(muya: Muya, options?: {});
    listen(): void;
    render(): void;
    selectItem(event: Event, item: TableColumnToolIcon): void;
}

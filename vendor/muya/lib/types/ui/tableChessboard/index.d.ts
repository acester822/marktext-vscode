import { Muya } from '../../index';
import { default as BaseFloat } from '../baseFloat';
declare class TablePicker extends BaseFloat {
    static pluginName: string;
    capturesContentKeydown: boolean;
    private _checkerCount;
    private _oldVNode;
    private _current;
    private _select;
    private _tableContainer;
    constructor(muya: Muya);
    listen(): void;
    render(): void;
    private _keyupHandler;
    private _showPicker;
    selectItem(): void;
}
export default TablePicker;

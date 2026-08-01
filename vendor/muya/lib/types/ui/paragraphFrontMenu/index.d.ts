import { Muya } from '../../index';
import { default as BaseFloat } from '../baseFloat';
export declare class ParagraphFrontMenu extends BaseFloat {
    static pluginName: string;
    capturesContentKeydown: boolean;
    private _oldVNode;
    private _block;
    private _frontMenuContainer;
    constructor(muya: Muya, options?: {});
    listen(): void;
    private _renderSubMenu;
    render(): void;
    selectItem(event: Event, { label }: {
        label: string;
    }): void;
    private _applyMetaAction;
    private _turnIntoBlock;
    private _turnIntoList;
}

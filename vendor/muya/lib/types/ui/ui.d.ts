import { Muya } from '../muya';
import { default as BaseFloat } from './baseFloat';
export declare class Ui {
    muya: Muya;
    shownFloat: Set<BaseFloat>;
    private _shownButton;
    constructor(muya: Muya);
    private _listen;
    hideAllFloatTools(): void;
    handleContentKeydown(event: KeyboardEvent): boolean;
}

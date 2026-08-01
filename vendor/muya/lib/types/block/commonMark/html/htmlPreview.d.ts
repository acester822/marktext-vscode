import { Muya } from '../../../muya';
import { IHtmlBlockState, TState } from '../../../state/types';
import { default as Parent } from '../../base/parent';
export declare function isEmptyHtmlBlock(html: string): boolean;
declare class HTMLPreview extends Parent {
    private _html;
    static blockName: string;
    static create(muya: Muya, state: IHtmlBlockState): HTMLPreview;
    get path(): never[];
    constructor(muya: Muya, { text }: IHtmlBlockState);
    update(html?: string): void;
    getState(): TState;
}
export default HTMLPreview;

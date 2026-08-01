import { Muya } from '../../../muya';
import { IMathBlockState, TState } from '../../../state/types';
import { default as Parent } from '../../base/parent';
declare class MathPreview extends Parent {
    private _math;
    static blockName: string;
    static create(muya: Muya, state: IMathBlockState): MathPreview;
    get path(): never[];
    constructor(muya: Muya, { text }: IMathBlockState);
    getState(): TState;
    private _attachDOMEvents;
    clickHandler(event: Event): void;
    update(math?: string): void;
}
export default MathPreview;

import { Muya } from '../../../muya';
import { IDiagramState, TState } from '../../../state/types';
import { default as Parent } from '../../base/parent';
declare class DiagramPreview extends Parent {
    private _code;
    private _type;
    static blockName: string;
    static create(muya: Muya, state: IDiagramState): DiagramPreview;
    get path(): never[];
    constructor(muya: Muya, { text, meta }: IDiagramState);
    getState(): TState;
    private _attachDOMEvents;
    clickHandler(event: Event): void;
    update(code?: string): Promise<void>;
}
export default DiagramPreview;

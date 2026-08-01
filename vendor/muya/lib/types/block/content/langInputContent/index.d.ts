import { Muya } from '../../../muya';
import { IRenderCursor } from '../../../selection/types';
import { ICodeBlockState } from '../../../state/types';
import { default as CodeBlock } from '../../commonMark/codeBlock';
import { default as Content } from '../../base/content';
declare class LangInputContent extends Content {
    parent: CodeBlock | null;
    static blockName: string;
    static create(muya: Muya, state: ICodeBlockState): LangInputContent;
    constructor(muya: Muya, { meta }: ICodeBlockState);
    getAnchor(): CodeBlock | null;
    update(_cursor?: IRenderCursor, highlights?: never[]): void;
    /**
     * Update this block lang and parent's lang, and show/hide language selector.
     * @param lang
     */
    private _updateLanguage;
    updateLanguage(lang: string): void;
    inputHandler(): void;
    enterHandler(event: Event): void;
    backspaceHandler(event: Event): void;
}
export default LangInputContent;

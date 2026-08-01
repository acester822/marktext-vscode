import { Muya } from '../../../muya';
import { default as TreeNode } from '../../base/treeNode';
declare class HeadingCopyLink extends TreeNode {
    private _eventIds;
    static blockName: string;
    static create(muya: Muya, _state?: unknown): HeadingCopyLink;
    get isContainerBlock(): boolean;
    constructor(muya: Muya);
    private _listen;
    private _activate;
    private _detachDOMEvents;
    remove(_source: string): this;
    getState(): void;
}
export default HeadingCopyLink;

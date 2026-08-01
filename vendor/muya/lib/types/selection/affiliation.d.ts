import { default as Content } from '../block/base/content';
/**
 * One ancestor block in the affiliation chain. `type` is the markdown
 * block type; the remaining fields carry the list-context the desktop menu
 * needs.
 */
export interface IAffiliationEntry {
    /** Markdown block type: `p`, `h1`…`h6`, `ul`, `ol`, `li`, `pre`, `figure`, `blockquote`, `hr`. */
    type: string;
    /** Engine block name (`bullet-list`, `code-block`, …) for callers that want the precise block. */
    blockName: string;
    /** Present on list ancestors (`ul` / `ol`): `bullet` | `order` | `task`. */
    listType?: string;
    /**
     * Present on list-item ancestors (`li`): the parent list's discriminator
     * (`bullet` | `order` | `task`). Read from the parent list because both
     * bullet and ordered lists share the `list-item` block.
     */
    listItemType?: string;
    /**
     * Whether the enclosing list is rendered loose (blank-line separated). For
     * `li` entries this reflects the parent list's `meta.loose`, since the
     * looseness flag lives on the list, not the item.
     */
    isLooseListItem?: boolean;
}
/**
 * Per-endpoint block info for one selection end. `type` is always `span` for a
 * content leaf; `functionType` distinguishes code / table-cell / language-input
 * content.
 */
export interface IEndpointBlockInfo {
    /** Engine block name of the content leaf, e.g. `codeblock.content`. */
    blockName: string;
    /** Content-block type — always `span` for a content leaf. */
    type: string;
    /** `functionType`: `codeContent` | `cellContent` | `languageInput` | `paragraphContent`. */
    functionType?: string;
}
/**
 * Walk from a content leaf up to the outermost block, collecting the
 * paragraph-type ancestors into an affiliation chain (outermost-first).
 */
export declare function buildAffiliation(leaf: Content | null): IAffiliationEntry[];
/**
 * Compute the shared-ancestor affiliation for a selection. When both endpoints
 * sit in the same block the anchor chain is returned; otherwise the chain is
 * trimmed to the ancestor block instances shared by both endpoints.
 */
export declare function buildSelectionAffiliation(anchorLeaf: Content | null, focusLeaf: Content | null): IAffiliationEntry[];
/**
 * Describe one selection endpoint's content leaf in the legacy
 * `{ type, functionType }` shape.
 */
export declare function endpointBlockInfo(leaf: Content | null): IEndpointBlockInfo | null;

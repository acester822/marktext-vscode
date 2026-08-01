import { Muya } from '../muya';
import { IFrontmatterMeta } from '../state/types';
import { default as Parent } from './base/parent';
/**
 * Derive the frontmatter `lang`/`style` from the user's `frontmatterType`
 * preference: `-` -> yaml `---`, `+` -> toml `+++`,
 * `;`/`{` -> json (`;;;`/`{}`). The serializer (`serializeFrontMatter`)
 * switches on `lang`, so getting `lang` right is what makes YAML/TOML emit
 * their fences instead of falling through to JSON braces.
 */
export declare function frontmatterMeta(frontmatterType: string): IFrontmatterMeta;
/**
 * Prepend a front matter block at the very start of the document. Front matter
 * is only valid as the first
 * block, so this never replaces the block at the cursor. Idempotent: a no-op
 * when the document already starts with front matter, so it never duplicates
 * the block. Shared by `Muya.updateParagraph('front-matter')` and the
 * quick-insert menu's `frontmatter` entry so both follow identical semantics.
 */
export declare function insertFrontMatterAtStart(muya: Muya): boolean;
/**
 * Show the in-editor table grid picker. The in-editor "table" insert (the `/`
 * quick-insert menu and the paragraph front-menu) must offer a hover-grid
 * dimension picker rather than dropping a fixed-size table — the picker UI
 * (`TableChessboard`) subscribes to `muya-table-picker` and invokes the
 * dispatched callback with the zero-based `(row, column)` the user picked, so
 * the table is created at `row + 1 × column + 1` to match legacy semantics.
 *
 * The float anchors to the caret (`getCursorReference`); when the cursor has
 * no coords (e.g. the front-menu took focus) it falls back to the block's DOM
 * node. No-op if neither is available.
 */
export declare function showTablePicker(muya: Muya, block: Parent): void;
export declare function buildReplacementBlock(label: string, muya: Muya, text: string): any;
export declare function replaceBlockByLabel({ block, muya, label, text }: {
    block: Parent;
    muya: Muya;
    label: string;
    text?: string;
}): void;
export declare function insertBlockBelowByLabel({ block, muya, label }: {
    block: Parent;
    muya: Muya;
    label: string;
}): void;
export declare function canTurnInto(block: Parent, label: string): boolean;

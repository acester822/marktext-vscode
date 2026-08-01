import { default as Parent } from '../block/base/parent';
import { Muya } from '../muya';
export interface ITocItem {
    content: string;
    lvl: number;
    slug: string;
    githubSlug: string;
}
export declare function stableSlug(block: Parent): string;
export declare function getTOC(muya: Muya): ITocItem[];

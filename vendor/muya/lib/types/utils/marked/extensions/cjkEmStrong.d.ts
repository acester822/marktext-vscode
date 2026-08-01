import { MarkedExtension } from 'marked';
/**
 * marked extension that makes the emphasis/strong flanking check treat CJK
 * characters as punctuation. Register via `marked.use(cjkEmStrongExtension())`
 * on every Marked instance that renders inline emphasis.
 */
export default function cjkEmStrongExtension(): MarkedExtension;

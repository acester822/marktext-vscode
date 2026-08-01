import { IAtxHeadingState, IBlockQuoteState, IBulletListState, ICodeBlockState, IDiagramState, IFrontmatterState, IHtmlBlockState, IMathBlockState, IOrderListState, IParagraphState, ITableState, ITaskListState, IThematicBreakState } from '../state/types';
interface IEmptyStates {
    'paragraph': IParagraphState;
    'thematic-break': IThematicBreakState;
    'frontmatter': IFrontmatterState;
    'atx-heading': IAtxHeadingState;
    'table': ITableState;
    'math-block': IMathBlockState;
    'html-block': IHtmlBlockState;
    'code-block': ICodeBlockState;
    'block-quote': IBlockQuoteState;
    'order-list': IOrderListState;
    'bullet-list': IBulletListState;
    'task-list': ITaskListState;
    'diagram': IDiagramState;
}
declare const emptyStates: IEmptyStates;
export default emptyStates;

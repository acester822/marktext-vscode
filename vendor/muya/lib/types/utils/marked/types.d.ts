import { MarkedToken, Tokens } from 'marked';
export interface ILexOption {
    footnote?: boolean;
    math?: boolean;
    isGitlabCompatibilityEnabled?: boolean;
    frontMatter?: boolean;
    superSubScript?: boolean;
}
export type Heading = Tokens.Heading & {
    headingStyle: 'setext' | 'atx';
    marker: string;
};
export type ListItemToken = Tokens.ListItem & {
    listItemType: 'order' | 'bullet' | 'task';
    bulletMarkerOrDelimiter: '.' | ')' | '*' | '+' | '-' | '';
};
export type ListToken = Tokens.List & {
    listType: 'order' | 'bullet' | 'task';
    items: ListItemToken[];
};
export interface IFootnoteToken {
    type: 'footnote';
    raw: string;
    identifier: string;
    tokens: Tokens.Generic[];
}
export interface IMultipleMathToken {
    type: 'multiplemath';
    raw: string;
    text: string;
    displayMode: boolean;
    mathStyle: '' | 'gitlab';
}
export interface IFrontmatterToken {
    type: 'frontmatter';
    raw: string;
    text: string;
    style: '-' | '+' | ';' | '{';
    lang: 'yaml' | 'toml' | 'json';
}
export interface IBlockEndToken {
    type: 'block-end';
    tokenType: 'blockquote' | 'list' | 'list-item' | 'footnote';
}
export type TLexedToken = Exclude<MarkedToken, Tokens.Heading | Tokens.List | Tokens.ListItem> | Heading | ListToken | ListItemToken | IFootnoteToken | IMultipleMathToken | IFrontmatterToken;
export type TBlockToken = TLexedToken | IBlockEndToken;

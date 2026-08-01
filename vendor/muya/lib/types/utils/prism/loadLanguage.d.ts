interface ILangLoadStatus {
    lang: string;
    status: 'noexist' | 'cached' | 'loaded';
}
/**
 * The set of all languages which have been loaded using the below function.
 *
 * @type {Set<string>}
 */
export declare const loadedLanguages: Set<string>;
export declare function transformAliasToOrigin(langs: string[]): string[];
interface IPrismLike {
    languages: Record<string, unknown>;
}
declare function initLoadLanguage(Prism: IPrismLike): (langs?: string[] | string) => Promise<ILangLoadStatus[]>;
export default initLoadLanguage;

import { Muya } from '../muya';
import { ILocale } from './types';
declare class I18n {
    lang: string;
    private _resources;
    constructor(_muya: Muya, object: ILocale);
    t(key: string): string;
    locale(object: ILocale): void;
}
export default I18n;

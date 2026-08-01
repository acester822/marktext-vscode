import { Muya } from '../muya';
export interface IConstructor<T> {
    blockName: string;
    create: (muya: Muya, state: any) => any;
    new (...args: never[]): T;
}
export type TBlockPath = (string | number)[];

declare function simpleflake (date?: number, sequence?: number): Buffer;

declare namespace simpleflake {
    export function parse(snowflake: string, encoding?: string): number[];
    export const options: {
        epoch: number;
        timebits: number;
    }
}

declare module "simpleflake" {
    export = simpleflake;
}
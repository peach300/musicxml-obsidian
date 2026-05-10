import { FontStyles } from "opensheetmusicdisplay";

export type OptionType =
    | { kind: 'color'; hasSystemDefault?: boolean }
    | { kind: 'number'; min: number; max: number; step: number }
    | { kind: 'boolean' }
    | { kind: 'select'; choices: string[] }
    | { kind: 'text'; placeholder?: string; hasSystemDefault?: boolean }
    | { kind: 'font-style'; choices: FontStyles[] }

export interface OptionSchema<T> {
    label: string;
    description?: string;
    type: OptionType;
    default: T;
}

// Schema map — key matches option key, value describes everything about it
export type SchemaMap<TOptions> = {
    [K in keyof TOptions]: OptionSchema<TOptions[K]>;
};

export function defaultsFromSchema<T>(schema: SchemaMap<T>): T {
    return Object.fromEntries(
        Object.entries(schema).map(([k, v]) => [k, (v as OptionSchema<T>).default])
    ) as T;
}
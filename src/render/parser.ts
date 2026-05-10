import * as yaml from 'js-yaml'; // already in obsidian's bundle
import { MusicXMLOptions } from '../settings/options';

export interface ParsedBlock {
    xml: string | null;     // inline XML or null if src used
    src: string | null;     // filepath or null if inline
    options: Partial<MusicXMLOptions>;
}

export function parseCodeBlock(source: string): ParsedBlock {
    const fenceMatch = source.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);

    if (!fenceMatch) {
        // no frontmatter — source is XML
        return { xml: source.trim(), src: null, options: {} };
    }

    const frontmatter = (yaml.load(fenceMatch[1]!) ?? {}) as Record<string, any>;
    const remainder = fenceMatch[2]!.trim();
    const { src, ...options } = frontmatter;

    return {
        xml: remainder.length ? remainder : null,
        src: src ?? null,
        options: options as Partial<MusicXMLOptions>,
    };
}
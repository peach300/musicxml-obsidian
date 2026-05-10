import { App } from "obsidian";
import { SchemaMap, defaultsFromSchema } from "settings/schema";
import { PluginSettings } from "./settings";
import { Fonts, FontStyles } from 'opensheetmusicdisplay';

export interface MusicXMLOptions extends MusicXMLColorOptions, MusicXMLFontOptions, MusicXMLLayoutOptions { }

export interface MusicXMLColorOptions {
    defaultColorMusic: string | 'default';
    defaultColorTitle: string | 'default';
    defaultColorStem: string | 'default';
    defaultColorRest: string | 'default';
    defaultColorNote: string | 'default';
    defaultColorLabel: string | 'default';
    defaultColorBeam: string | 'default';
    defaultColorSlur: string | 'default';
    defaultColorTie: string | 'default';
    pageBackgroundColor: string | 'default';
}

export interface MusicXMLFontOptions {
    defaultFontFamily: string | 'default';
    defaultFontStyle: FontStyles | 'default';
}

export interface MusicXMLLayoutOptions {
    zoom: number;
    pageFormat: string;
    drawingParameters: string;
    autoResize: boolean;
    fitLastSystemToPageWidth: boolean;
    maxWidth: string;
    maxHeight: string;
}

export const COLOR_SCHEMA: SchemaMap<MusicXMLColorOptions> = {
    defaultColorMusic: {
        label: 'Notes & barlines', type: { kind: 'color', hasSystemDefault: true }, default: 'default',
        description: 'Applies to notes, barlines, and ledger lines.'
    },
    defaultColorTitle: { label: 'Title', type: { kind: 'color', hasSystemDefault: true }, default: 'default' },
    defaultColorStem: { label: 'Stems', type: { kind: 'color', hasSystemDefault: true }, default: 'default' },
    defaultColorRest: { label: 'Rests', type: { kind: 'color', hasSystemDefault: true }, default: 'default' },
    defaultColorNote: { label: 'Noteheads', type: { kind: 'color', hasSystemDefault: true }, default: 'default' },
    defaultColorLabel: {
        label: 'Labels & dynamics', type: { kind: 'color', hasSystemDefault: true }, default: 'default',
        description: 'Dynamics, tempo markings, rehearsal letters.'
    },
    defaultColorBeam: { label: 'Beams', type: { kind: 'color', hasSystemDefault: true }, default: 'default' },
    defaultColorSlur: { label: 'Slurs', type: { kind: 'color', hasSystemDefault: true }, default: 'default' },
    defaultColorTie: { label: 'Ties', type: { kind: 'color', hasSystemDefault: true }, default: 'default' },
    pageBackgroundColor: {
        label: 'Background', type: { kind: 'color', hasSystemDefault: true }, default: 'default',
        description: 'Score background. Default follows --background-primary.'
    }
};

export const FONT_SCHEMA: SchemaMap<MusicXMLFontOptions> = {
    defaultFontFamily: {
        label: 'Font family',
        description: 'Font used for text elements. "Default" follows Obsidian\'s text font.',
        type: { kind: 'text', placeholder: 'e.g. Comic sans', hasSystemDefault: true },
        default: 'default',
    },
    defaultFontStyle: {
        label: 'Font style',
        type: { kind: 'font-style', choices: [FontStyles.Regular, FontStyles.Bold, FontStyles.Italic, FontStyles.BoldItalic, FontStyles.Underlined] },
        default: FontStyles.Regular,
    }
};

export const FONT_STYLE_NAMES: Record<FontStyles, string> = {
    [FontStyles.Regular]: 'Regular',
    [FontStyles.Bold]: 'Bold',
    [FontStyles.Italic]: 'Italic',
    [FontStyles.BoldItalic]: 'Bold Italic',
    [FontStyles.Underlined]: 'Underlined',
};

export const LAYOUT_SCHEMA: SchemaMap<MusicXMLLayoutOptions> = {
    zoom: {
        label: 'Zoom',
        description: 'Scale factor for the rendered score.',
        type: { kind: 'number', min: 0.25, max: 4, step: 0.25 },
        default: 1.0,
    },
    pageFormat: {
        label: 'Page format',
        description: '"Endless" renders as a single scrollable column. Other values simulate page sizes.',
        type: { kind: 'select', choices: ['Endless', 'A4 P', 'A4 L', 'Letter P', 'Letter L'] },
        default: 'Endless',
    },
    drawingParameters: {
        label: 'Drawing parameters',
        description: '"compact" reduces whitespace. "default" follows MusicXML spacing exactly.',
        type: { kind: 'select', choices: ['compact', 'default', 'leadsheet'] },
        default: 'compact',
    },
    autoResize: {
        label: 'Auto resize',
        description: 'Re-render when the container width changes.',
        type: { kind: 'boolean' },
        default: true,
    },
    fitLastSystemToPageWidth: {
        label: 'Fit last system to width',
        type: { kind: 'boolean' },
        default: true,
    },
    maxWidth: {
        label: 'Max width',
        description: 'CSS value e.g. 100%, 800px, 50vw. Leave blank for no limit.',
        type: { kind: 'text', placeholder: '100%' },
        default: '',
    },
    maxHeight: {
        label: 'Max height',
        description: 'CSS value e.g. 600px, 80vh. Leave blank for no limit.',
        type: { kind: 'text', placeholder: '100%' },
        default: '',
    },
};

export const DEFAULT_COLORS: MusicXMLColorOptions = defaultsFromSchema(COLOR_SCHEMA);
export const DEFAULT_FONTS: MusicXMLFontOptions = defaultsFromSchema(FONT_SCHEMA);
export const DEFAULT_LAYOUT: MusicXMLLayoutOptions = defaultsFromSchema(LAYOUT_SCHEMA);

export const DEFAULT_OPTIONS: MusicXMLOptions = {
    ...DEFAULT_LAYOUT,
    ...DEFAULT_COLORS,
    ...DEFAULT_FONTS,
};

export const CSS_VARS: Record<string, string> = {
    defaultColorMusic: '--text-normal',
    defaultColorTitle: '--text-normal',
    defaultColorStem: '--text-normal',
    defaultColorRest: '--text-normal',
    defaultColorNote: '--text-normal',
    defaultColorLabel: '--text-muted',
    defaultColorBeam: '--text-normal',
    defaultColorSlur: '--text-normal',
    defaultColorTie: '--text-normal',
    pageBackgroundColor: '--background-primary',
    defaultFontFamily: '--font-text',
};

export function mergeOptions(...layers: Partial<MusicXMLOptions>[]): MusicXMLOptions {
    return Object.assign({}, ...layers);
}

export function resolveStyles<T extends Record<string, any>>(options: T) {
    const styles = getComputedStyle(document.body);

    return Object.fromEntries(
        Object.entries(options).map(([key, value]) => [
            key,
            value === 'default' && CSS_VARS[key]
                ? styles.getPropertyValue(CSS_VARS[key]).trim()
                : value,
        ])
    ) as { [K in keyof T]: any };
}

export function resolveOptions(
    app: App,
    defaults: Partial<MusicXMLOptions>,
    sourcePath: string,
    blockOptions: Partial<MusicXMLOptions>
): MusicXMLOptions {
    const fileFrontmatter =
        app.metadataCache.getCache(sourcePath)?.frontmatter?.musicxml ?? {};

    return mergeOptions(
        defaults,
        fileFrontmatter,
        blockOptions,
    );
}
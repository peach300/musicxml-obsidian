import { App, TFile } from 'obsidian';

export async function resolveContent(app: App, src: string, sourcePath: string): Promise<string | Blob> {
    // try absolute vault path first, then relative to current file
    const resolved =
        app.vault.getAbstractFileByPath(src) ??
        app.vault.getAbstractFileByPath(
            `${sourcePath.substring(0, sourcePath.lastIndexOf('/'))}/${src}`
        );

    if (!resolved || !(resolved instanceof TFile)) {
        throw new Error(`MusicXML: cannot find file "${src}"`);
    }

    if (resolved.extension === 'mxl') {
        const buffer = await app.vault.adapter.readBinary(resolved.path);
        return new Blob([buffer], { type: 'application/vnd.recordare.musicxml' });
    }

    return await app.vault.read(resolved);
}
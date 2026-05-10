import { MarkdownRenderChild } from 'obsidian';
import { OpenSheetMusicDisplay } from 'opensheetmusicdisplay';
import { MusicXMLOptions, resolveStyles } from 'settings/options';

export class MusicXMLRenderer extends MarkdownRenderChild {
    private osmd: OpenSheetMusicDisplay | undefined;
    private source: string | Blob;
    private options: MusicXMLOptions;
    private queue: Promise<void> = Promise.resolve();

    constructor(container: HTMLElement, source: string | Blob, options: MusicXMLOptions) {
        super(container);
        this.source = source;
        this.options = options;
    }

    async onload() {
        await this.load();
    }

    private enqueue(fn: () => Promise<void>) {
        this.queue = this.queue.then(fn).catch(() => { });
    }

    async updateOptions(options: MusicXMLOptions) {
        this.options = options;
        await this.render();
    }

    async load() {
        this.enqueue(() => this.doLoad());
    }

    async render() {
        this.enqueue(() => this.doRender());
    }

    async doLoad() {
        try {
            this.containerEl.empty();
            const options = this.buildOptions();
            this.applyOtherOptions(options.other);
            this.osmd = new OpenSheetMusicDisplay(this.containerEl, {
                backend: 'svg',
                ...options.osmd
            });
            await this.osmd.load(this.source);
            this.osmd.render();
        } catch (e) {
            if (e instanceof Error) {
                this.containerEl.createEl('pre', {
                    text: `MusicXML load failed:\n${e.message}`,
                    cls: 'musicxml-error',
                });
            }
        }
    }

    async doRender() {
        try {
            if (!this.osmd || !this.osmd.IsReadyToRender()) return this.load();

            const options = this.buildOptions();
            this.applyOtherOptions(options.other);
            this.osmd.setOptions(options.osmd);
            this.osmd.render();
        } catch (e) {
            if (e instanceof Error) {
                this.containerEl.createEl('pre', {
                    text: `MusicXML render failed:\n${e.message}`,
                    cls: 'musicxml-error',
                });
            }
        }
    }

    private buildOptions() {
        const resolved = resolveStyles(this.options);
        const { maxWidth, maxHeight, ...osmdOptions } = resolved;

        console.log('Resolved options:', resolved);

        return {
            other: { maxWidth, maxHeight },
            osmd: { ...osmdOptions }
        };
    }

    private applyOtherOptions(options: any) {
        const { maxWidth, maxHeight } = options;
        if (maxWidth) this.containerEl.style.maxWidth = maxWidth;
        if (maxHeight) this.containerEl.style.maxHeight = maxHeight;
    }

    onunload() {
        this.osmd?.clear();
        this.containerEl.empty();
    }
}
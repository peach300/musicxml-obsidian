import { Plugin, MarkdownPostProcessorContext, App } from 'obsidian';
import { MusicXMLRenderer } from './renderer';
import { parseCodeBlock } from './parser';
import { resolveContent } from './fileResolver';
import { MusicXMLOptions, resolveOptions } from '../settings/options';
import { PluginSettings } from '../settings/settings';

const renderers: Set<MusicXMLRendererEntry> = new Set();

export interface MusicXMLRendererEntry {
    renderer: MusicXMLRenderer;
    sourcePath: string;
    blockOptions: Partial<MusicXMLOptions>;
}

export function registerMusicXMLProcessor(
    plugin: Plugin,
    pluginSettings: PluginSettings,
) {
    plugin.registerMarkdownCodeBlockProcessor(
        'musicxml',
        async (source, el, ctx: MarkdownPostProcessorContext) => {
            const container = el.createDiv({ cls: 'musicxml-container' });
            try {
                const { xml, src, options: blockOptions } = parseCodeBlock(source);

                const options = resolveOptions(
                    plugin.app,
                    pluginSettings.defaults,
                    ctx.sourcePath,
                    blockOptions
                );

                const content = xml ?? await resolveContent(plugin.app, src!, ctx.sourcePath);

                const renderer = new MusicXMLRenderer(container, content, options);
                const entry: MusicXMLRendererEntry = { renderer, sourcePath: ctx.sourcePath, blockOptions };

                renderers.add(entry);
                ctx.addChild(renderer);
                renderer.register(() => renderers.delete(entry));
                renderer.load();
            } catch (e) {
                container.createEl('pre', {
                    text: e instanceof Error ? e.message : String(e),
                    cls: 'musicxml-error',
                });
            }
        }
    );
}

function debounce<TArgs extends unknown[]>(fn: (...args: TArgs) => void, ms: number) {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: TArgs) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

export const rerender = debounce((app: App, defaults: Partial<MusicXMLOptions>) => {
    renderers.forEach(r => {
        if (app && defaults) {
            const options = resolveOptions(
                app,
                defaults,
                r.sourcePath,
                r.blockOptions
            );
            r.renderer.updateOptions(options);
        }
        r.renderer.render();
    });
}, 150);

export function registerRenderReload(plugin: Plugin, pluginSettings: PluginSettings) {
    plugin.registerEvent(
        plugin.app.metadataCache.on('changed', () => {
            rerender(plugin.app, pluginSettings.defaults);
        })
    );

    const observer = new MutationObserver(() => {
        rerender(plugin.app, pluginSettings.defaults);
    });

    observer.observe(document.body, {
        attributes: true,
        attributeFilter: ['class', 'data-theme'],
    });

    plugin.register(() => observer.disconnect());
}
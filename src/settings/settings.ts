import { App, ColorComponent, PluginSettingTab, Setting, TextComponent } from 'obsidian';
import { MusicXMLOptions, DEFAULT_OPTIONS, FONT_SCHEMA, COLOR_SCHEMA, LAYOUT_SCHEMA, MusicXMLColorOptions, MusicXMLFontOptions, MusicXMLLayoutOptions, FONT_STYLE_NAMES } from './options';
import MusicXMLPlugin from '../main';
import { OptionType, SchemaMap } from 'settings/schema';
import { FontStyles } from 'opensheetmusicdisplay';

export interface PluginSettings {
	defaults: MusicXMLOptions;
}

export const DEFAULT_PLUGIN_SETTINGS: PluginSettings = {
	defaults: { ...DEFAULT_OPTIONS },
};

export class MusicXMLSettingTab extends PluginSettingTab {
	plugin: MusicXMLPlugin;

	constructor(app: App, plugin: MusicXMLPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display() {
		const { containerEl } = this;
		containerEl.empty();

		buildSettingsSection(
			containerEl, 
			'Font',
			FONT_SCHEMA, 
			this.plugin.settings.defaults as MusicXMLFontOptions,
			async (key, value) => {
				(this.plugin.settings.defaults as any)[key] = value;
				await this.plugin.saveSettings();
			}
		);

		buildSettingsSection(
			containerEl,
			'Colors',
			COLOR_SCHEMA,
			this.plugin.settings.defaults as MusicXMLColorOptions,
			async (key, value) => {
				(this.plugin.settings.defaults as any)[key] = value;
				await this.plugin.saveSettings();
			}
		);

		buildSettingsSection(
			containerEl, 
			'Layout',
			LAYOUT_SCHEMA, 
			this.plugin.settings.defaults as MusicXMLLayoutOptions,
			async (key, value) => {
				(this.plugin.settings.defaults as any)[key] = value;
				await this.plugin.saveSettings();
			}
		);
	}
}

export function buildSettingsSection<T extends Record<string, any>>(
	containerEl: HTMLElement,
	heading: string,
	schema: SchemaMap<T>,
	values: T,
	onChange: (key: keyof T, value: any) => void,
) {
	containerEl.createEl('h3', { text: heading });

	for (const [key, def] of Object.entries(schema) as [keyof T, typeof schema[keyof T]][]) {
		const setting = new Setting(containerEl)
			.setName(def.label);

		if (def.description) setting.setDesc(def.description);

		const type: OptionType = def.type;
		const current = values[key];

		switch (type.kind) {
			case 'color': {
				const isDefault = current === 'default';

				let colorComponent: ColorComponent;

				setting.addColorPicker(picker => {
					colorComponent = picker;
					picker
						.setValue(isDefault ? '#000000' : current)
						.setDisabled(isDefault)
						.onChange(v => onChange(key, v))
				});

				if (type.hasSystemDefault) {
					setting.addToggle(toggle => toggle
						.setTooltip('Use default')
						.setValue(isDefault || false)
						.onChange(v => {
							onChange(key, v ? 'default' : '#000000');
							colorComponent.setDisabled(v);
						})
					);
					setting.controlEl.createEl('span', {
						text: 'Use default',
						cls: 'musicxml-control-label',
					});
				}
				break;
			}
			case 'number': {
				setting.addSlider(slider => slider
					.setLimits(type.min, type.max, type.step)
					.setValue(current)
					.setDynamicTooltip()
					.onChange(v => onChange(key, v))
				);
				break;
			}
			case 'boolean': {
				setting.addToggle(toggle => toggle
					.setValue(current)
					.onChange(v => onChange(key, v))
				);
				break;
			}
			case 'select': {
				setting.addDropdown(drop => {
					type.choices.forEach(c => drop.addOption(c, c));
					drop.setValue(current);
					drop.onChange(v => onChange(key, v));
				});
				break;
			}
			case 'font-style': {
				setting.addDropdown(drop => {
					type.choices.forEach(c => {
						drop.addOption(c.toString(), FONT_STYLE_NAMES[c] || c.toString());
					});
					drop.setValue(current);
					drop.onChange(v => onChange(key, parseInt(v) as FontStyles));
				});
				break;
			}
			case 'text': {
				const isDefault = type.hasSystemDefault && current === 'default';

				let textComponent: TextComponent;

				setting.addText(text => {
					textComponent = text;
					text
						.setPlaceholder(type.placeholder ?? '')
						.setValue(current)
						.setDisabled(isDefault || false)
						.onChange(v => onChange(key, v))
				});
				
				if (type.hasSystemDefault) {
					setting.addToggle(toggle => toggle
						.setTooltip('Use default')
						.setValue(isDefault || false)
						.onChange(v => {
							onChange(key, v ? 'default' : '');
							textComponent.setDisabled(v);
						})
					);
					setting.controlEl.createEl('span', {
						text: 'Use default',
						cls: 'musicxml-control-label',
					});
				}

				break;
			}
		}
	}
}
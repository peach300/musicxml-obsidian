import { App, Editor, MarkdownView, Modal, Notice, Plugin } from 'obsidian';
import { DEFAULT_PLUGIN_SETTINGS, MusicXMLSettingTab, PluginSettings } from "./settings/settings";
import { registerMusicXMLProcessor, registerRenderReload, rerender } from './render/processor';
import { MusicXMLRenderer } from './render/renderer';
import { mergeOptions, MusicXMLOptions } from 'settings/options';

// Remember to rename these classes and interfaces!

export default class MusicXMLPlugin extends Plugin {
	settings!: PluginSettings;

	async onload() {
		await this.loadSettings();

		this.addSettingTab(new MusicXMLSettingTab(this.app, this));
		
		registerMusicXMLProcessor(this, this.settings);
		registerRenderReload(this, this.settings);
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_PLUGIN_SETTINGS, await this.loadData() as Partial<PluginSettings>);
	}

	async saveSettings() {
		await this.saveData(this.settings);
		rerender(this.app, this.settings.defaults);
	}
}
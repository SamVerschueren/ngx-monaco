import {NgModule, ModuleWithProviders} from '@angular/core';
import {CommonModule} from '@angular/common';

import {MonacoEditorComponent} from './containers/monaco-editor/monaco-editor.component';

@NgModule({
	imports: [
		CommonModule
	],
	declarations: [
		MonacoEditorComponent
	],
	exports: [
		MonacoEditorComponent
	]
})
export class MonacoEditorModule {
	static forRoot(): ModuleWithProviders {
		return {
			ngModule: MonacoEditorModule,
			providers: []
		};
	}
}

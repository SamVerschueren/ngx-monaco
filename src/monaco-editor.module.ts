import {NgModule, ModuleWithProviders} from '@angular/core';
import {CommonModule} from '@angular/common';

// Directives
import {MonacoEditorDirective} from './directives/monaco-editor/monaco-editor.directive';

// Services
import {MonacoEditorService} from './services/monaco-editor.service';

@NgModule({
	imports: [
		CommonModule
	],
	declarations: [
		MonacoEditorDirective
	],
	exports: [
		MonacoEditorDirective
	]
})
export class MonacoEditorModule {
	static forRoot(): ModuleWithProviders {
		return {
			ngModule: MonacoEditorModule,
			providers: [
				MonacoEditorService
			]
		};
	}
}

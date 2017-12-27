import {NgModule, ModuleWithProviders} from '@angular/core';
import {CommonModule} from '@angular/common';

// Directives
import {MonacoEditorDirective} from './directives/monaco-editor/monaco-editor.directive';

// Services
import {MonacoEditorService} from './services/monaco-editor.service';

// Tokens
import {MONACO_EDITOR_OPTIONS} from './tokens/editor-options.token';

// Entities
import {MonacoEditorOptions} from './entities/editor-options';

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
	static forRoot(config: {options?: MonacoEditorOptions} = {}): ModuleWithProviders {
		return {
			ngModule: MonacoEditorModule,
			providers: [
				MonacoEditorService,
				{provide: MONACO_EDITOR_OPTIONS, useValue: config.options || {}}
			]
		};
	}
}

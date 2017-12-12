/// <reference path="../typings/monaco-editor/monaco.d.ts" />
export interface CompletionItemProvider extends monaco.languages.CompletionItemProvider {
	readonly language: string;
}

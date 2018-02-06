# ngx-monaco

> [Monaco Editor](https://github.com/Microsoft/monaco-editor) for Angular


## Install

```
$ npm install monaco-editor ngx-monaco
```

> Note: The `monaco-editor` package is a peer dependency of this package.

### angular-cli.json

Add the following lines to the app `assets` array in `.angular-cli.json`.

```json
{
	"glob": "**/*",
	"input": "../node_modules/monaco-editor/min/vs",
	"output": "libs/vs"
}
```

Because of some technical reasons, it's not possible to package the `monaco-editor` together with all the other packages. This module will dynamically load and instantiate the monaco editor.


## Usage

Import the `MonacoEditorModule`.

```ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MonacoEditorModule } from 'ngx-monaco';

@NgModule({
	declarations: [
		AppComponent
	],
	imports: [
		BrowserModule,
		MonacoEditorModule.forRoot()
	],
	bootstrap: [AppComponent]
})
export class AppModule { }
```

Now you're ready to render the editor on your screen.

```ts
import { Component } from '@angular/core';

@Component({
	selector: 'app-root',
	styles: ['monaco-editor { height: 500px; display:block; }'],
	template: `
		<monaco-editor></monaco-editor>
	`
})
export class AppComponent { }
```

### Files

```ts
import { Component } from '@angular/core';
import { MonacoFile } from 'ngx-monaco';

@Component({
	selector: 'app-root',
	styles: ['monaco-editor { height: 500px; display:block; }'],
	template: `
		<monaco-editor
			theme="vs-dark"
			[file]="file"
			(fileChange)="onFileChange($event)">
		</monaco-editor>
	`
})
export class AppComponent {
	file: MonacoFile = {
		uri: 'index.js',
		language: 'javascript',
		content: `console.log('hello world');`
	};

	onFileChange(file: MonacoFile) {
		// Handle file change
	}
}
```

> You can use the `(fileChange)` event to listen to changes in the file.

### Completion providers

The completion item provider interface defines the contract between extensions and the [IntelliSense](https://code.visualstudio.com/docs/editor/intellisense).

```ts
import { Injectable } from '@angular/core';
import { CompletionItemProvider } from 'ngx-monaco';

@Injectable()
export class TravisCompletionProvider implements CompletionItemProvider {
	get language() {
		return 'yaml';
	}

	provideCompletionItems(model: monaco.editor.IReadOnlyModel): any {
		const filename = model.uri.path.split('/').pop();

		if (filename !== '.travis.yaml') {
			return [];
		}

		return [
			{
				label: 'language',
				kind: monaco.languages.CompletionItemKind.Property,
				documentation: 'Set the language',
				insertText: 'language: '
			}
		]
	}
}
```

> You can play around with completion providers in the [Monaco Playground](https://microsoft.github.io/monaco-editor/playground.html#extending-language-services-completion-provider-example).

Register the completion provider in your module.

```ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MonacoEditorModule, COMPLETION_PROVIDERS } from 'ngx-monaco';

import { TravisCompletionProvider } from './providers/travis-completion.provider';

@NgModule({
	declarations: [
		AppComponent
	],
	imports: [
		BrowserModule,
		MonacoEditorModule.forRoot()
	],
	providers: [
		{ provide: COMPLETION_PROVIDERS, useClass: TravisCompletionProvider, multi: true }
	]
	bootstrap: [AppComponent]
})
export class AppModule { }
```


## Related

- [monaco-editor](https://github.com/Microsoft/monaco-editor) - A browser based code editor


## License

MIT © [Sam Verschueren](https://github.com/SamVerschueren)

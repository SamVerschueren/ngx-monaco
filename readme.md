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
	styles: ['monaco-editor { height: 500px; }'],
	template: `
		<monaco-editor></monaco-editor>
	`
})
export class AppComponent { }
```

### Files

```ts
import { Component } from '@angular/core';
import { File } from 'ngx-monaco';

@Component({
	selector: 'app-root',
	styles: ['monaco-editor { height: 500px; }'],
	template: `
		<monaco-editor
			theme="vs-dark"
			[file]="file">
		</monaco-editor>
	`
})
export class AppComponent {
	file: File = {
		uri: 'index.js',
		language: 'javascript',
		content: `console.log('hello world');`
	};
}
```


## Related

- [monaco-editor](https://github.com/Microsoft/monaco-editor) - A browser based code editor


## License

MIT © [Sam Verschueren](https://github.com/SamVerschueren)

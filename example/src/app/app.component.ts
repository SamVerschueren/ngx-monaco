import {Component, ViewChild} from '@angular/core';
import {MonacoFile, MonacoEditorDirective} from 'ngx-monaco';
import {Subject} from 'rxjs';
import {debounceTime, distinctUntilChanged} from 'rxjs/operators';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss']
})
export class AppComponent {theme = 'vs-dark';
	files: MonacoFile[] = [
		{
			uri: 'index.js',
			content: `'use strict';

console.log('Hello World');`
		},
		{
			uri: 'package.json',
			content: `{
	"name": "hello-world",
	"version": "0.0.0"
}`
		}
	];

	file = this.files[0];

	fileChange = new Subject<MonacoFile>();
	contentChange = new Subject<string>();

	@ViewChild(MonacoEditorDirective) editor: MonacoEditorDirective;

	open(file: any) {
		this.file = file;
	}

	onReady(editor: monaco.editor.IEditor) {
		console.log(editor);
		// Bootstrap(editor);
	}

	ngOnInit() {
		this.fileChange.pipe(
			debounceTime(1000),
			distinctUntilChanged((a, b) => a.content === b.content)
		).subscribe(file => {
			console.log(file);
		});
	}

	updateContent() {
		setInterval(() => {
			this.contentChange.next(Date.now().toString());
		}, 3000);
	}
}

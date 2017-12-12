/// <reference path="../../typings/monaco-editor/monaco.d.ts" />
import {Component, ElementRef, OnInit, Input, Inject, Output, EventEmitter, HostListener, OnDestroy, OnChanges, SimpleChanges} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {debounceTime, takeUntil, filter} from 'rxjs/operators';

import {COMPLETION_PROVIDERS} from '../../tokens/completion-provider.token';

import {File} from '../../entities/file';
import {CompletionItemProvider} from '../../entities/completion-item-provider';

declare const window: any;

@Component({
	selector: 'monaco-editor',
	styleUrls: ['monaco-editor.component.scss'],
	template: ''
})
export class MonacoEditorComponent implements OnInit, OnDestroy, OnChanges {
	// Inputs
	@Input() theme: string;
	@Input() file: File;
	@Input() options: monaco.editor.IEditorOptions = {
		minimap: {
			enabled: true
		},
		folding: true
	};

	// Outputs
	@Output() ready = new EventEmitter();

	// Internal
	private editor: monaco.editor.IEditor;
	private resize$ = new Subject<Event>();
	private destroy$ = new Subject();

	constructor(
		@Inject(COMPLETION_PROVIDERS) private completionProviders: CompletionItemProvider[],
		private editorRef: ElementRef
	) {}

	open(file: File) {
		this.file = file;

		if (!this.editor) {
			// Exit early if the editor is not bootstrapped yet. It will automatically open the provided file when ready.
			return;
		}

		const uri = monaco.Uri.file(file.uri);

		let model = monaco.editor.getModel(uri);

		if (!model) {
			model = monaco.editor.createModel(file.content, file.language, uri);
		}

		this.editor.setModel(model);
	}

	@HostListener('window:resize', ['$event']) onResize(event: Event) {
		this.resize$.next(event);
	}

	ngOnInit() {
		const script = document.createElement('script');
		script.type = 'text/javascript';
		script.src = 'libs/vs/loader.js';
		script.onload = () => {
			window.require.config({paths: {vs: 'libs/vs'}});
			window.require(['vs/editor/editor.main'], () => {
				this.editor = monaco.editor.create(this.editorRef.nativeElement, {
					theme: this.theme,
					...this.options
				});

				// Register all the completion providers
				for (const completionProvider of this.completionProviders) {
					monaco.languages.registerCompletionItemProvider(completionProvider.language, completionProvider);
				}

				// Open the file
				if (this.file) {
					this.open(this.file);
				}

				// Emit that we are ready
				this.ready.emit();
			});
		};

		// Add the script tag to the page in order to start loading monaco
		document.body.appendChild(script);

		// Resize automatically
		this.resize$.pipe(
			filter(() => Boolean(this.editor)),
			debounceTime(100),
			takeUntil(this.destroy$)
		).subscribe(() => {
			this.editor.layout({
				width: this.editorRef.nativeElement.clientWidth,
				height: this.editorRef.nativeElement.clientHeight
			});
		});
	}

	ngOnDestroy() {
		this.destroy$.next();
	}

	ngOnChanges(changes: SimpleChanges) {
		if (!window.monaco) {
			return;
		}

		if (changes.options) {
			// Update the monaco editor options
			this.editor.updateOptions(this.options);
		}

		if (changes.theme) {
			// Update the theme
			monaco.editor.setTheme(changes.theme.currentValue);
		}

		if (changes.file) {
			// Update the open file
			this.open(changes.file.currentValue);
		}
	}
}

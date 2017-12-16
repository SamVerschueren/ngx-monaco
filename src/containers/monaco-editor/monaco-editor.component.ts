/// <reference path="../../typings/monaco-editor/monaco.d.ts" />
import {Component, ElementRef, OnInit, Input, Inject, Output, EventEmitter, HostListener, OnDestroy, OnChanges, SimpleChanges, Optional} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {merge} from 'rxjs/observable/merge';
import {debounceTime, takeUntil, filter, take, map} from 'rxjs/operators';

import {COMPLETION_PROVIDERS} from '../../tokens/completion-provider.token';

import {fromDisposable} from '../../utils/observable/from-disposable';

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
	@Output() fileChange = new EventEmitter<File>();

	// Internal
	private editor: monaco.editor.IEditor;
	private resize$ = new Subject<Event>();
	private destroy$ = new Subject();

	constructor(
		@Optional() @Inject(COMPLETION_PROVIDERS) private completionProviders: CompletionItemProvider[],
		private editorRef: ElementRef
	) {}

	@HostListener('window:resize', ['$event']) onResize(event: Event) {
		this.resize$.next(event);
	}

	private registerCompletionProviders() {
		if (!this.completionProviders) {
			return;
		}

		// Register all the completion providers
		for (const completionProvider of this.completionProviders) {
			monaco.languages.registerCompletionItemProvider(completionProvider.language, completionProvider);
		}
	}

	private registerModelChangeListener(file: File, model: monaco.editor.IModel) {
		const destroy = merge(
			this.destroy$,
			fromDisposable(model.onWillDispose.bind(model)).pipe(take(1))
		);

		// Subscribe to changes from the model
		fromDisposable(model.onDidChangeContent.bind(model))
			.pipe(
				map(() => model.getValue()),
				takeUntil(destroy)
			)
			.subscribe(content => {
				this.fileChange.emit({
					...file,
					content
				});
			});
	}

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

			// Listen for changes in the model
			this.registerModelChangeListener(file, model);
		}

		this.editor.setModel(model);
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

				// Register the completion providers
				this.registerCompletionProviders();

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

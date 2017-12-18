/// <reference path="../typings/monaco-editor/monaco.d.ts" />
import {Injectable, ElementRef, Optional, Inject} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import {take, map, takeUntil} from 'rxjs/operators';

import {fromDisposable} from '../utils/observable/from-disposable';

// Tokens
import {COMPLETION_PROVIDERS} from '../tokens/completion-provider.token';

// Entities
import {CompletionItemProvider} from '../entities/completion-item-provider';
import {File} from '../entities/file';

declare const window: any;

@Injectable()
export class MonacoEditorService {
	private file: File;
	private monacoEditor: monaco.editor.IEditor;
	private onFileChange = new Subject<File>();

	fileChange$ = this.onFileChange.asObservable();

	constructor(
		@Optional() @Inject(COMPLETION_PROVIDERS) private completionProviders: CompletionItemProvider[]
	) {}

	get editor() {
		return this.monacoEditor;
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
		const destroy = fromDisposable(model.onWillDispose.bind(model)).pipe(take(1));

		// Subscribe to changes from the model
		fromDisposable(model.onDidChangeContent.bind(model))
			.pipe(
				map(() => model.getValue()),
				takeUntil(destroy)
			)
			.subscribe(content => {
				this.onFileChange.next({
					...file,
					content
				});
			});
	}

	/**
	 * Bootstrap the monaco editor.
	 *
	 * @param container Container of the editor.
	 * @param options Editor options.
	 */
	load(container: ElementRef, options: {theme?: string; editor: monaco.editor.IEditorOptions}): Observable<void> {
		return Observable.create((observer: any) => {
			const script = document.createElement('script');
			script.type = 'text/javascript';
			script.src = 'libs/vs/loader.js';
			script.onload = () => {
				window.require.config({paths: {vs: 'libs/vs'}});
				window.require(['vs/editor/editor.main'], () => {
					this.monacoEditor = monaco.editor.create(container.nativeElement, {
						theme: options.theme,
						...options.editor
					});

					// Register the completion providers
					this.registerCompletionProviders();

					// Open the file
					if (this.file) {
						this.open(this.file);
					}

					// Emit that we are ready
					observer.next();
				});
			};

			// Add the script tag to the page in order to start loading monaco
			document.body.appendChild(script);
		}).pipe(take(1));
	}

	/**
	 * Open the provided file with the editor.
	 *
	 * @param file File to open.
	 */
	open(file: File) {
		this.file = file;

		if (!this.monacoEditor) {
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

		this.monacoEditor.setModel(model);
	}

	/**
	 * Change the options of the editor.
	 *
	 * @param options Editor options.
	 */
	updateOptions(options: monaco.editor.IEditorOptions) {
		if (this.monacoEditor) {
			this.monacoEditor.updateOptions(options);
		}
	}

	/**
	 * Change the theme of the monaco editor.
	 *
	 * @param theme Name of the editor theme.
	 */
	setTheme(theme: string) {
		if (window.monaco) {
			monaco.editor.setTheme(theme);
		}
	}
}

/// <reference path="../typings/monaco-editor/monaco.d.ts" />
import {Injectable, ElementRef, Optional, Inject, NgZone} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {shareReplay, take, map, takeUntil, tap} from 'rxjs/operators';

import {fromDisposable} from '../utils/observable/from-disposable';

// Tokens
import {COMPLETION_PROVIDERS} from '../tokens/completion-provider.token';
import {MONACO_EDITOR_OPTIONS} from '../tokens/editor-options.token';

// Entities
import {CompletionItemProvider} from '../entities/completion-item-provider';
import {MonacoEditorOptions} from '../entities/editor-options';
import {MonacoFile} from '../entities/file';

declare const window: any;

@Injectable()
export class MonacoEditorService {
	private file: MonacoFile;
	private monacoEditor: monaco.editor.IEditor;
	private onFileChange = new Subject<MonacoFile>();

	fileChange$ = this.onFileChange.asObservable();

	bootstrap$ = Observable.create((observer: any) => {
		const script = document.createElement('script');
		script.type = 'text/javascript';
		script.src = 'libs/vs/loader.js';
		script.onload = () => {
			window.require.config({paths: {vs: 'libs/vs'}});
			window.require(['vs/editor/editor.main'], () => {
				// Emit that we are ready
				observer.next();
			});
		};

		// Add the script tag to the page in order to start loading monaco
		document.body.appendChild(script);
	}).pipe(shareReplay(1));

	constructor(
		@Optional() @Inject(COMPLETION_PROVIDERS) private completionProviders: CompletionItemProvider[],
		@Optional() @Inject(MONACO_EDITOR_OPTIONS) private editorOptions: MonacoEditorOptions,
		private zone: NgZone
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

	private registerModelChangeListener(file: MonacoFile, model: monaco.editor.IModel) {
		const destroy = fromDisposable(model.onWillDispose.bind(model)).pipe(take(1));

		// Subscribe to changes from the model
		fromDisposable(model.onDidChangeContent.bind(model))
			.pipe(
				map(() => model.getValue()),
				takeUntil(destroy)
			)
			.subscribe((content: string) => {
				this.zone.run(() => {
					this.onFileChange.next({
						...file,
						content
					});
				});
			});
	}

	/**
	 * Dispose all editor models
	 */
	disposeModels() {
		if (!window.monaco) {
			return;
		}

		for (const model of monaco.editor.getModels()) {
			model.dispose();
		}
	}

	/**
	 * Bootstrap the monaco editor.
	 *
	 * @param container Container of the editor.
	 * @param options Editor options.
	 */
	load(container: ElementRef, options: {theme?: string; editor?: MonacoEditorOptions} = {}): Observable<void> {
		const editorOptions = options.editor || this.editorOptions || {};

		return this.bootstrap$.pipe(
			tap(() => {
				// Dispose all the current models
				this.disposeModels();

				// Create a new monaco editor
				this.monacoEditor = monaco.editor.create(container.nativeElement, {
					theme: options.theme,
					...editorOptions
				});

				// Register the completion providers
				this.registerCompletionProviders();

				// Open the file
				if (this.file) {
					this.open(this.file);
				}
			})
		);
	}

	/**
	 * Open the provided file with the editor.
	 *
	 * @param file File to open.
	 */
	open(file: MonacoFile) {
		this.file = file;

		if (!this.monacoEditor) {
			// Exit early if the editor is not bootstrapped yet. It will automatically open the provided file when ready.
			return;
		}

		const uri = monaco.Uri.file(file.uri);

		let model = monaco.editor.getModel(uri);

		if (model) {
			if (file.language && model.getModeId() !== file.language) {
				model.dispose();

				model = undefined;
			} else {
				model.setValue(file.content);
			}
		}

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

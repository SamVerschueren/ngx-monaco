import {Component, ElementRef, OnInit, Input, Inject, Output, EventEmitter, HostListener, OnDestroy, OnChanges, SimpleChanges} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {debounceTime, takeUntil, filter} from 'rxjs/operators';

import {COMPLETION_PROVIDERS} from '../../tokens/completion-provider.token';

import {File} from '../../entities/file';

declare const window: any;

@Component({
	selector: 'monaco-editor',
	styleUrls: ['monaco-editor.component.scss'],
	template: ''
})
export class MonacoEditorComponent implements OnInit, OnDestroy, OnChanges {
	@Input() theme: string;
	@Input() file: any;
	@Input() options: any = {
		minimap: {
			enabled: true
		},
		folding: true
	};

	@Output() ready = new EventEmitter();

	private editor: any;
	private resize$ = new Subject();
	private destroy$ = new Subject();

	constructor(
		@Inject(COMPLETION_PROVIDERS) private completionProviders: any[],
		private editorRef: ElementRef
	) {}

	open(file: File) {
		let model = window.monaco.editor.getModel(file.uri);

		if (!model) {
			model = window.monaco.editor.createModel(file.content, file.language, file.uri);
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
				this.editor = window.monaco.editor.create(this.editorRef.nativeElement, {
					theme: this.theme,
					...this.options
				});

				for (const completionProvider of this.completionProviders) {
					completionProvider.register(window.monaco.languages);
				}

				if (this.file) {
					this.open(this.file);
				}

				// Emit that we are ready
				this.ready.emit();
			});
		};

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
		this.destroy$.next(true);
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
			window.monaco.editor.setTheme(changes.theme.currentValue);
		}

		if (changes.file) {
			// Update the open file
			this.open(changes.file.currentValue);
		}
	}
}

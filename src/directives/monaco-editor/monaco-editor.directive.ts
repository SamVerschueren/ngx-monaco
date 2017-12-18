/// <reference path="../../typings/monaco-editor/monaco.d.ts" />
import {Directive, ElementRef, OnInit, Input, Output, EventEmitter, HostListener, OnDestroy, OnChanges, SimpleChanges} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {debounceTime, takeUntil, filter} from 'rxjs/operators';

// Services
import {MonacoEditorService} from '../../services/monaco-editor.service';

// Entities
import {File} from '../../entities/file';

@Directive({
	selector: 'monaco-editor,[monaco-editor]'
})
export class MonacoEditorDirective implements OnInit, OnDestroy, OnChanges {
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
	private resize$ = new Subject<Event>();
	private destroy$ = new Subject();

	constructor(
		private monacoEditorService: MonacoEditorService,
		private editorRef: ElementRef
	) {}

	@HostListener('window:resize', ['$event']) onResize(event: Event) {
		this.resize$.next(event);
	}

	/**
	 * Open the provided file with the editor.
	 *
	 * @param file File to open.
	 */
	open(file: File) {
		this.monacoEditorService.open(file);
	}

	ngOnInit() {
		// Load the monaco editor
		this.monacoEditorService.load(this.editorRef, {
			theme: this.theme,
			editor: this.options
		}).subscribe(() => {
			this.ready.emit();
		});

		// Listen for file changes
		this.monacoEditorService.fileChange$.pipe(
			takeUntil(this.destroy$)
		).subscribe(file => {
			this.fileChange.emit(file);
		});

		// Resize the editor when the window resizes
		this.resize$.pipe(
			filter(() => Boolean(this.monacoEditorService.editor)),
			debounceTime(100),
			takeUntil(this.destroy$)
		).subscribe(() => {
			this.monacoEditorService.editor.layout({
				width: this.editorRef.nativeElement.clientWidth,
				height: this.editorRef.nativeElement.clientHeight
			});
		});
	}

	ngOnDestroy() {
		this.destroy$.next();
	}

	ngOnChanges(changes: SimpleChanges) {
		if (changes.options) {
			// Update the monaco editor options
			this.monacoEditorService.updateOptions(changes.options.currentValue);
		}

		if (changes.theme) {
			// Update the theme
			this.monacoEditorService.setTheme(changes.theme.currentValue);
		}

		if (changes.file) {
			// Open the new file
			this.open(changes.file.currentValue);
		}
	}
}

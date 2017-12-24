// Modules
export {MonacoEditorModule} from './monaco-editor.module';

// Directives
export {MonacoEditorDirective} from './directives/monaco-editor/monaco-editor.directive';

// Entities
export {File} from './entities/file';
export {CompletionItemProvider} from './entities/completion-item-provider';

// Tokens
export {COMPLETION_PROVIDERS} from './tokens/completion-provider.token';

// Re-export monaco editor options
export type MonacoEditorOptions = monaco.editor.IEditorOptions;

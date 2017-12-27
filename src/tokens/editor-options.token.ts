import {InjectionToken} from '@angular/core';

import {MonacoEditorOptions} from '../entities/editor-options';

/**
 * Use this token to inject the default monaco editor options.
 */
export const MONACO_EDITOR_OPTIONS = new InjectionToken<MonacoEditorOptions>('Monaco Editor Options');

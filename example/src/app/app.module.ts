import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {MonacoEditorModule} from 'ngx-monaco';

import {AppComponent} from './app.component';

@NgModule({
	declarations: [
		AppComponent
	],
	imports: [
		BrowserModule,
		MonacoEditorModule.forRoot()
	],
	providers: [],
	bootstrap: [AppComponent]
})
export class AppModule { }

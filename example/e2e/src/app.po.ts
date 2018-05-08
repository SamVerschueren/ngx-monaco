import {browser, by, element} from 'protractor';

export class AppPage {
	async navigateTo() {
		return browser.get('/');
	}

	async getParagraphText() {
		return element(by.css('app-root h1')).getText();
	}
}

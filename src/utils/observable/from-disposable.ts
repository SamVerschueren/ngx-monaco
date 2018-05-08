import {Observable, Observer} from 'rxjs';

/**
 * Create an observable from a disposable.
 */
export function fromDisposable<T>(source: (listener: (e: T) => void) => monaco.IDisposable): Observable<T> {
	return Observable.create((observer: Observer<T>) => {
		const disposable = source(e => {
			observer.next(e);
		});

		return () => disposable.dispose();
	});
}

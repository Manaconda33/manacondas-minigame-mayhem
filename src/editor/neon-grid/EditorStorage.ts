export type StorageResult<T> =
  | {
      ok: true;
      value: T;
    }
  | {
      ok: false;
      error: string;
    };
export class EditorStorage {
  public constructor(
    private readonly key: string,
    private readonly factory: () => IDBFactory | undefined = () => globalThis.indexedDB,
  ) {}
  private async database(): Promise<IDBDatabase> {
    const factory = this.factory();
    if (!factory) throw new Error('Local recovery storage is unavailable. Download your edits.');
    return new Promise((resolve, reject) => {
      const request = factory.open('neon-grid-layout-editor', 1);
      request.onupgradeneeded = () => {
        request.result.createObjectStore('sessions');
      };
      request.onsuccess = () => {
        resolve(request.result);
      };
      request.onerror = () => {
        reject(request.error ?? new Error('Local recovery storage could not open.'));
      };
      request.onblocked = () => {
        reject(new Error('Local recovery storage is blocked by another tab.'));
      };
    });
  }
  private async transaction<T>(
    mode: IDBTransactionMode,
    operation: (store: IDBObjectStore) => IDBRequest<T>,
  ): Promise<StorageResult<T>> {
    let database: IDBDatabase | undefined;
    try {
      database = await this.database();
      const db = database;
      const value = await new Promise<T>((resolve, reject) => {
        const transaction = db.transaction('sessions', mode);
        const request = operation(transaction.objectStore('sessions'));
        let result: T;
        request.onsuccess = () => {
          result = request.result;
        };
        transaction.oncomplete = () => {
          resolve(result);
        };
        transaction.onerror = () => {
          reject(transaction.error ?? new Error('Local recovery transaction failed.'));
        };
        transaction.onabort = () => {
          reject(transaction.error ?? new Error('Local recovery transaction was aborted.'));
        };
      });
      return { ok: true, value };
    } catch (error) {
      return { ok: false, error: String(error) };
    } finally {
      database?.close();
    }
  }
  public save(json: string) {
    return this.transaction('readwrite', (store) => store.put(json, this.key));
  }
  public recover(): Promise<StorageResult<unknown>> {
    return this.transaction('readonly', (store) => store.get(this.key));
  }
  public clear() {
    return this.transaction('readwrite', (store) => store.delete(this.key));
  }
}

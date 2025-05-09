export class WebFS {
    private db: IDBDatabase | null = null;
    private readonly DB_NAME = 'webfs';
    private readonly STORE_NAME = 'files';

    constructor() {
        this.init();
    }

    private async init(): Promise<void> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.DB_NAME, 1);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                if (!db.objectStoreNames.contains(this.STORE_NAME)) {
                    db.createObjectStore(this.STORE_NAME, { keyPath: 'path' });
                }
            };
        });
    }

    async writeFile(path: string, data: string | Buffer): Promise<void> {
        await this.ensureInit();
        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([this.STORE_NAME], 'readwrite');
            const store = transaction.objectStore(this.STORE_NAME);
            const request = store.put({
                path,
                data: data.toString(),
                isDirectory: false,
                timestamp: Date.now(),
            });

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve();
        });
    }

    async readFile(path: string): Promise<string> {
        await this.ensureInit();
        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([this.STORE_NAME], 'readonly');
            const store = transaction.objectStore(this.STORE_NAME);
            const request = store.get(path);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                if (request.result) {
                    resolve(request.result.data);
                } else {
                    reject(new Error(`File not found: ${path}`));
                }
            };
        });
    }

    async unlink(path: string): Promise<void> {
        await this.ensureInit();
        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([this.STORE_NAME], 'readwrite');
            const store = transaction.objectStore(this.STORE_NAME);
            const request = store.delete(path);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve();
        });
    }

    async readdir(path: string): Promise<string[]> {
        await this.ensureInit();
        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([this.STORE_NAME], 'readonly');
            const store = transaction.objectStore(this.STORE_NAME);
            const request = store.getAllKeys();

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                const allKeys = request.result as string[];
                let directChildrenPaths: string[] = [];
                
                // Normalize path to ensure consistent handling
                const normalizedPath = path.endsWith('/') && path !== '/' ? path.slice(0, -1) : path;
                
                // Handle root directory as a special case
                if (normalizedPath === '/') {
                    // For root, we want entries like "/file.txt" or "/folder" (direct children)
                    // but not "/folder/file.txt" (nested children)
                    directChildrenPaths = allKeys.filter(key => {
                        // Skip the root itsel
                        if (key === '/') return false;
                        
                        // Remove leading slash for easier path component counting
                        const keyWithoutLeadingSlash = key.startsWith('/') ? key.substring(1) : key;
                        
                        // Check if this is a direct child of root (no slashes or exactly one at the end)
                        const parts = keyWithoutLeadingSlash.split('/');
                        return parts.length === 1 || (parts.length === 2 && parts[1] === '');
                    });
                } else {
                    // For non-root directories
                    const prefix = normalizedPath + '/';
                    
                    directChildrenPaths = allKeys.filter(key => {
                        // Return the directory itself if it exists
                        if (key === normalizedPath) return true;
                        
                        // Check if it's a direct child
                        if (!key.startsWith(prefix)) return false;
                        
                        // Get the part after the prefix
                        const relativePath = key.substring(prefix.length);
                        
                        // Direct children either have no further slashes or just one at the end (directories)
                        const parts = relativePath.split('/');
                        return parts.length === 1 || (parts.length === 2 && parts[1] === '');
                    });
                }
                
                resolve(directChildrenPaths);
            };
        });
    }

    async mkdir(path: string): Promise<void> {
        await this.ensureInit();
        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([this.STORE_NAME], 'readwrite');
            const store = transaction.objectStore(this.STORE_NAME);
            const request = store.put({
                path,
                isDirectory: true,
                timestamp: Date.now(),
            });

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve();
        });
    }

    reset() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.deleteDatabase(this.DB_NAME);
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = null;
                resolve();
            };
        });
    }

    async stat(path: string): Promise<{ isDirectory: boolean } | null> {
        await this.ensureInit();
        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([this.STORE_NAME], 'readonly');
            const store = transaction.objectStore(this.STORE_NAME);
            const request = store.get(path);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                if (request.result) {
                    resolve({
                        isDirectory: !!request.result.isDirectory
                    });
                } else {
                    resolve(null);
                }
            };
        });
    }

    private async ensureInit(): Promise<void> {
        if (!this.db) {
            await this.init();
        }
    }
}
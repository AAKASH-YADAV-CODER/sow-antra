
const DB_NAME = 'SowntraAssets';
const DB_VERSION = 1;
const STORE_ASSETS = 'assets';
const STORE_FOLDERS = 'folders';

class AssetStorage {
    constructor() {
        this.db = null;
        this.initPromise = this.init();
    }

    init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Assets store
                if (!db.objectStoreNames.contains(STORE_ASSETS)) {
                    const assetStore = db.createObjectStore(STORE_ASSETS, { keyPath: 'id' });
                    assetStore.createIndex('folderId', 'folderId', { unique: false });
                    assetStore.createIndex('type', 'type', { unique: false });
                    assetStore.createIndex('createdAt', 'createdAt', { unique: false });
                }

                // Folders store
                if (!db.objectStoreNames.contains(STORE_FOLDERS)) {
                    const folderStore = db.createObjectStore(STORE_FOLDERS, { keyPath: 'id' });
                    folderStore.createIndex('createdAt', 'createdAt', { unique: false });
                }
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                resolve(this.db);
            };

            request.onerror = (event) => {
                console.error('IndexedDB error:', event.target.error);
                reject(event.target.error);
            };
        });
    }

    async getDB() {
        if (!this.db) {
            await this.initPromise;
        }
        return this.db;
    }

    // --- Assets ---

    async addAsset(asset) {
        const db = await this.getDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORE_ASSETS], 'readwrite');
            const store = transaction.objectStore(STORE_ASSETS);
            const request = store.add(asset);

            request.onsuccess = () => resolve(asset);
            request.onerror = () => reject(request.error);
        });
    }

    async getAssets() {
        const db = await this.getDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORE_ASSETS], 'readonly');
            const store = transaction.objectStore(STORE_ASSETS);
            const request = store.getAll();

            request.onsuccess = () => {
                // Sort by createdAt descending
                const assets = request.result.sort((a, b) => b.createdAt - a.createdAt);
                resolve(assets);
            };
            request.onerror = () => reject(request.error);
        });
    }

    async getAssetsByFolder(folderId) {
        const db = await this.getDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORE_ASSETS], 'readonly');
            const store = transaction.objectStore(STORE_ASSETS);
            const index = store.index('folderId');
            // If folderId is null/undefined, we might need a different approach or just filter manually from getAll if index keeps failing for null
            const request = index.getAll(folderId || null); // assuming we store null for root

            request.onsuccess = () => {
                const assets = request.result.sort((a, b) => b.createdAt - a.createdAt);
                resolve(assets);
            };
            request.onerror = () => reject(request.error);
        });
    }

    async deleteAsset(id) {
        const db = await this.getDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORE_ASSETS], 'readwrite');
            const store = transaction.objectStore(STORE_ASSETS);
            const request = store.delete(id);

            request.onsuccess = () => resolve(id);
            request.onerror = () => reject(request.error);
        });
    }

    async moveAssetToFolder(assetId, folderId) {
        const db = await this.getDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORE_ASSETS], 'readwrite');
            const store = transaction.objectStore(STORE_ASSETS);
            const getRequest = store.get(assetId);

            getRequest.onsuccess = () => {
                const asset = getRequest.result;
                if (!asset) {
                    reject(new Error('Asset not found'));
                    return;
                }
                asset.folderId = folderId;
                const updateRequest = store.put(asset);
                updateRequest.onsuccess = () => resolve(asset);
                updateRequest.onerror = () => reject(updateRequest.error);
            };
            getRequest.onerror = () => reject(getRequest.error);
        });
    }

    // --- Folders ---

    async createFolder(name) {
        const db = await this.getDB();
        const folder = {
            id: `folder-${Date.now()}`,
            name,
            createdAt: Date.now()
        };
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORE_FOLDERS], 'readwrite');
            const store = transaction.objectStore(STORE_FOLDERS);
            const request = store.add(folder);

            request.onsuccess = () => resolve(folder);
            request.onerror = () => reject(request.error);
        });
    }

    async getFolders() {
        const db = await this.getDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORE_FOLDERS], 'readonly');
            const store = transaction.objectStore(STORE_FOLDERS);
            const request = store.getAll();

            request.onsuccess = () => {
                const folders = request.result.sort((a, b) => b.createdAt - a.createdAt);
                resolve(folders);
            };
            request.onerror = () => reject(request.error);
        });
    }

    async deleteFolder(id) {
        // Note: In a real app we might want to cascade delete assets or move them to root.
        // For now, let's just delete the folder. Assets with this folderId will effectively be "orphaned" or hidden
        // unless we handle them. Better approach: Move assets to root before delete.
        const db = await this.getDB();

        // 1. Move assets to root
        const assets = await this.getAssetsByFolder(id);
        if (assets.length > 0) {
            const transaction = db.transaction([STORE_ASSETS], 'readwrite');
            const store = transaction.objectStore(STORE_ASSETS);
            assets.forEach(asset => {
                asset.folderId = null;
                store.put(asset);
            });
        }

        // 2. Delete folder
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORE_FOLDERS], 'readwrite');
            const store = transaction.objectStore(STORE_FOLDERS);
            const request = store.delete(id);
            request.onsuccess = () => resolve(id);
            request.onerror = () => reject(request.error);
        });
    }
}

export const storage = new AssetStorage();

function openWordsDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('WordsDB', 1);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('words')) {
                const store = db.createObjectStore('words', { 
                    keyPath: 'id', 
                    autoIncrement: true 
                });
                store.createIndex('timestamp', 'timestamp');
            }
        };
    });
} 
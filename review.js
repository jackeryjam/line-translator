async function loadWords() {
    console.log('Review page loading words...');
    try {
        const response = await chrome.runtime.sendMessage({
            type: 'getWords'
        });
        
        if (!response.success) {
            throw new Error(response.error);
        }
        
        const words = response.words;
        console.log('Retrieved words:', words);
        
        const wordsList = document.getElementById('wordsList');
        
        if (!words || words.length === 0) {
            wordsList.innerHTML = '<p style="text-align: center; color: #666;">还没有保存的单词</p>';
            return;
        }
        
        words.reverse().forEach(wordData => {
            const wordItem = document.createElement('div');
            wordItem.className = 'word-item';
            wordItem.dataset.id = wordData.id;
            
            const wordInfo = document.createElement('div');
            wordInfo.className = 'word-info';
            wordInfo.innerHTML = `
                <div class="word">${wordData.word}</div>
                <div class="translation">${wordData.translation}</div>
                <div class="timestamp">${new Date(wordData.timestamp).toLocaleString()}</div>
            `;
            
            const actionButtons = document.createElement('div');
            actionButtons.className = 'action-buttons';
            
            const showButton = document.createElement('button');
            showButton.className = 'show-translation';
            showButton.innerHTML = `
                <svg viewBox="0 0 24 24" class="eye-open">
                    <path d="M12 5C8.25 5 5.02 7.34 3 11c2.02 3.66 5.25 6 9 6s6.98-2.34 9-6c-2.02-3.66-5.25-6-9-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"/>
                    <circle cx="12" cy="11" r="2"/>
                </svg>
                <svg viewBox="0 0 24 24" class="eye-closed" style="display: none;">
                    <path d="M12 5C8.25 5 5.02 7.34 3 11c2.02 3.66 5.25 6 9 6s6.98-2.34 9-6c-2.02-3.66-5.25-6-9-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"/>
                    <line x1="4" y1="4" x2="20" y2="20" stroke-linecap="round"/>
                </svg>
            `;
            
            const deleteButton = document.createElement('button');
            deleteButton.className = 'delete-button';
            deleteButton.innerHTML = `
                <svg viewBox="0 0 24 24" class="delete-icon">
                    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12z"/>
                    <path d="M19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                    <line x1="9" y1="10" x2="9" y2="18"/>
                    <line x1="15" y1="10" x2="15" y2="18"/>
                </svg>
            `;
            
            let isVisible = false;
            showButton.onclick = () => {
                const translation = wordItem.querySelector('.translation');
                const eyeOpen = showButton.querySelector('.eye-open');
                const eyeClosed = showButton.querySelector('.eye-closed');
                
                isVisible = !isVisible;
                translation.style.display = isVisible ? 'block' : 'none';
                eyeOpen.style.display = isVisible ? 'none' : 'block';
                eyeClosed.style.display = isVisible ? 'block' : 'none';
            };
            
            deleteButton.onclick = async () => {
                try {
                    const response = await chrome.runtime.sendMessage({
                        type: 'deleteWord',
                        id: wordData.id
                    });
                    
                    if (response.success) {
                        wordItem.style.opacity = '0';
                        setTimeout(() => {
                            wordItem.remove();
                            if (wordsList.children.length === 0) {
                                wordsList.innerHTML = '<p style="text-align: center; color: #666;">还没有保存的单词</p>';
                            }
                        }, 300);
                    } else {
                        throw new Error(response.error);
                    }
                } catch (error) {
                    console.error('Error deleting word:', error);
                    alert('删除失败：' + error.message);
                }
            };
            
            actionButtons.appendChild(showButton);
            actionButtons.appendChild(deleteButton);
            
            wordItem.appendChild(wordInfo);
            wordItem.appendChild(actionButtons);
            wordsList.appendChild(wordItem);
        });
    } catch (error) {
        console.error('Error loading words:', error);
        const wordsList = document.getElementById('wordsList');
        wordsList.innerHTML = `<p style="color: red; text-align: center;">加载失败: ${error.message}</p>`;
    }
}

document.addEventListener('DOMContentLoaded', loadWords); 
function splitSentences(text) {
  // 预处理：保护特殊缩写和省略号
  const protectedText = text
    // 保护常见缩写
    .replace(/(?<=\b[A-Z])\./g, '_DOT_') // 处理 U.S.A. 这样的缩写
    .replace(/(?<=\b[a-z])\./g, '_DOT_') // 处理 p.m. 这样的缩写
    .replace(/\.\.\./g, '_ELLIPSIS_') // 处理省略号
    .replace(/…/g, '_ELLIPSIS_')      // 处理中文省略号
    // 保护常见缩写词
    .replace(/Mr\./g, 'Mr_DOT_')
    .replace(/Mrs\./g, 'Mrs_DOT_')
    .replace(/Ms\./g, 'Ms_DOT_')
    .replace(/Dr\./g, 'Dr_DOT_')
    .replace(/Prof\./g, 'Prof_DOT_')
    .replace(/Inc\./g, 'Inc_DOT_')
    .replace(/Ltd\./g, 'Ltd_DOT_')
    .replace(/Corp\./g, 'Corp_DOT_')
    .replace(/i\.e\./g, 'i_DOT_e_DOT_')
    .replace(/e\.g\./g, 'e_DOT_g_DOT_')
    .replace(/etc\./g, 'etc_DOT_')
    .replace(/vs\./g, 'vs_DOT_')
    .replace(/a\.m\./g, 'a_DOT_m_DOT_')
    .replace(/p\.m\./g, 'p_DOT_m_DOT_')
    // 处理数字中的点号（如 3.14）
    .replace(/(\d+)\.(\d+)/g, '$1_DOT_$2');

  // 标准化换行符
  const normalizedText = protectedText
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n+/g, '\n'); // 将多个连续换行符合并为单个换行符
  
  // 按段落分割（两个或更多换行符表示段落分隔）
  const paragraphs = normalizedText.split(/\n\s*\n/).map(p => p.trim()).filter(p => p);
  
  // 对每个段落进行分句
  return paragraphs.map(paragraph => {
    return paragraph
      .split(/(?<=[.。!！?？])\s*(?=[^a-zA-Z]|$)/)
      .map(sentence => {
        // 处理可能存在的前后空格
        let processed = sentence.trim();
        // 还原所有保护的标记
        processed = processed
          .replace(/_DOT_/g, '.')
          .replace(/_ELLIPSIS_/g, '...');
        return processed;
      })
      .filter(sentence => sentence.length > 0); // 过滤掉空字符串
  });
}

function createPopup(text, translation) {
  console.log('Creating popup with:', { text, translation });
  
  const popup = document.createElement('div');
  popup.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 10000;
    max-width: 80%;
    min-width: 240px;
    max-height: 80%;
    overflow-y: auto;
    font-family: Arial, sans-serif;
    border: 1px solid #eee;
  `;
  
  // 分段落和分句处理
  const originalParagraphs = splitSentences(text);
  const translatedParagraphs = splitSentences(translation);
  
  let content = '';
  for (let i = 0; i < originalParagraphs.length; i++) {
    const originalSentences = originalParagraphs[i];
    const translatedSentences = translatedParagraphs[i] || [];
    
    let paragraphContent = '';
    for (let j = 0; j < originalSentences.length; j++) {
      paragraphContent += `
        <div style="
          margin-bottom: 12px; 
          padding: 15px; 
          background: #f8f9fa; 
          border-radius: 8px;
          position: relative;
        ">
          <div class="sentence-container" style="
            position: relative;
            transition: all 0.3s ease;
          ">
            <div style="
              color: #333; 
              margin-bottom: 8px; 
              line-height: 1.5;
            ">
              ${originalSentences[j]}
            </div>
            <div style="
              color: #666; 
              padding-left: 12px; 
              border-left: 3px solid #4a89dc; 
              line-height: 1.5;
              margin: 10px 0;
            ">
              ${translatedSentences[j] || ''}
            </div>
            <button class="save-word-btn" style="
              position: absolute;
              bottom: 0;
              right: 0;
              padding: 6px 12px;
              background: #4a89dc;
              color: white;
              border: none;
              border-radius: 4px;
              cursor: pointer;
              font-size: 13px;
              transition: all 0.3s ease;
              opacity: 0;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              display: flex;
              align-items: center;
              gap: 4px;
            ">
              <svg viewBox="0 0 24 24" style="width: 16px; height: 16px; fill: currentColor;">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
              </svg>
              <span>保存</span>
            </button>
          </div>
        </div>
      `;
    }
    
    // 添加段落分隔
    content += `
      <div style="margin-bottom: 24px;">
        ${paragraphContent}
        ${i < originalParagraphs.length - 1 ? `
          <div style="
            margin: 20px 0;
            height: 2px;
            background: linear-gradient(to right, transparent, #4a89dc, transparent);
            opacity: 0.5;
          "></div>
        ` : ''}
      </div>
    `;
  }
  
  popup.innerHTML = `
    <div style="margin-bottom: 20px;">
      ${content}
    </div>
    <button class="close-popup-btn" style="
      padding: 8px 16px;
      background: #4a89dc;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      float: right;
    ">关闭</button>
    <div style="clear: both;"></div>
  `;
  
  // 修改关闭按钮的选择器
  const closeBtn = popup.querySelector('.close-popup-btn');
  closeBtn.onclick = () => popup.remove();
  
  // 修改保存按钮的悬停效果
  const style = document.createElement('style');
  style.textContent = `
    .sentence-container {
      position: relative;
      transition: all 0.3s ease;
    }
    
    .sentence-container:hover .save-word-btn {
      opacity: 0.9;
    }
    
    .save-word-btn {
      transform: translateY(0);
    }
    
    .save-word-btn:hover {
      opacity: 1 !important;
      background: #357abd !important;
      box-shadow: 0 2px 6px rgba(0,0,0,0.2) !important;
    }
    
    .save-word-btn.saved {
      background: #28a745 !important;
      opacity: 0.9;
    }
    
    .save-word-btn.saved:hover {
      background: #dc3545 !important;
    }
    
    .save-word-btn.saved svg {
      transform: rotate(45deg);
    }
    
    .save-word-btn.error {
      background: #dc3545 !important;
    }
    
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(5px);
      }
      to {
        opacity: 0.9;
        transform: translateY(0);
      }
    }
    
    .sentence-container:hover .save-word-btn {
      animation: fadeIn 0.2s ease forwards;
    }
  `;
  document.head.appendChild(style);
  
  // 修改保存按钮的点击事件
  popup.querySelectorAll('.save-word-btn').forEach((btn, index) => {
    btn.onclick = async (e) => {
      e.stopPropagation();
      const container = btn.closest('.sentence-container');
      const original = container.querySelector('div:first-child').textContent.trim();
      const translated = container.querySelector('div:nth-child(2)').textContent.trim();
      
      if (btn.classList.contains('saved')) {
        // 取消保存
        try {
          await chrome.runtime.sendMessage({
            type: 'deleteWord',
            id: btn.dataset.savedId
          });
          
          btn.innerHTML = `
            <svg viewBox="0 0 24 24" style="width: 16px; height: 16px; fill: currentColor;">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
            <span>保存</span>
          `;
          btn.classList.remove('saved');
          delete btn.dataset.savedId;
          
          // 添加动画效果
          btn.style.transform = 'scale(0.9)';
          setTimeout(() => {
            btn.style.transform = 'scale(1)';
          }, 200);
        } catch (error) {
          console.error('Error deleting word:', error);
          btn.classList.add('error');
          setTimeout(() => {
            btn.classList.remove('error');
          }, 2000);
        }
      } else {
        // 保存
        console.log('Saving word pair:', { original, translated });
        try {
          const result = await saveWord(original, translated);
          btn.innerHTML = `
            <svg viewBox="0 0 24 24" style="width: 16px; height: 16px; fill: currentColor;">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
            <span>取消保存</span>
          `;
          btn.classList.add('saved');
          btn.dataset.savedId = result;
          
          // 添加成功动画
          btn.style.transform = 'scale(1.1)';
          setTimeout(() => {
            btn.style.transform = 'scale(1)';
          }, 200);
        } catch (error) {
          console.error('Error saving word:', error);
          btn.classList.add('error');
          
          setTimeout(() => {
            btn.classList.remove('error');
          }, 2000);
        }
      }
    };
  });
  
  // 点击弹窗外部关闭
  document.addEventListener('click', function closePopup(e) {
    if (!popup.contains(e.target)) {
      popup.remove();
      document.removeEventListener('click', closePopup);
    }
  });
  
  document.body.appendChild(popup);
}

// 监听来自background的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Received message:', request);
  
  if (request.type === 'translate') {
    try {
      createPopup(request.text, request.translation);
    } catch (error) {
      console.error('Error creating popup:', error);
    }
  }
});

// 通知background脚本content script已加载
console.log('Translation content script loaded');

// 在创建翻译弹窗的函数中添加保存按钮
function createTranslationPopup(text, translation, x, y) {
    // 现有的弹窗代码...
    
    const popupContent = document.createElement('div');
    popupContent.className = 'translation-popup';
    
    const translationText = document.createElement('p');
    translationText.textContent = `${text}: ${translation}`;
    
    const saveButton = document.createElement('button');
    saveButton.textContent = '保存';
    saveButton.className = 'save-word-btn';
    saveButton.onclick = () => {
        saveWord(text, translation);
    };
    
    popupContent.appendChild(translationText);
    popupContent.appendChild(saveButton);
    // 其余弹窗代码...
}

// 添加保存单词的函数
async function saveWord(word, translation) {
    console.log('Content script saving word:', { word, translation });
    
    const wordData = {
        word: word,
        translation: translation,
        timestamp: new Date().toISOString()
    };
    
    try {
        const response = await chrome.runtime.sendMessage({
            type: 'saveWord',
            wordData: wordData
        });
        
        if (response.success) {
            console.log('Word saved successfully:', response.result);
            return response.result;
        } else {
            throw new Error(response.error);
        }
    } catch (error) {
        console.error('Error saving word:', error);
        throw error;
    }
}

// 确保 db.js 已被加载
if (typeof openWordsDB === 'undefined') {
    console.error('openWordsDB is not defined! Make sure db.js is loaded.');
}
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
        <div style="margin-bottom: 12px; padding: 10px; background: #f8f9fa; border-radius: 4px;">
          <div style="color: #333; margin-bottom: 8px; line-height: 1.5;">
            ${originalSentences[j]}
          </div>
          <div style="color: #666; padding-left: 12px; border-left: 3px solid #4a89dc; line-height: 1.5;">
            ${translatedSentences[j] || ''}
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
    <button style="
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
  
  const closeBtn = popup.querySelector('button');
  closeBtn.onclick = () => popup.remove();
  
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
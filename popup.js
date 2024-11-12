document.addEventListener('DOMContentLoaded', async () => {
  // 加载已保存的配置
  const config = await chrome.storage.local.get(['baiduAppId', 'baiduKey']);
  if (config.baiduAppId) {
    document.getElementById('appid').value = config.baiduAppId;
  }
  if (config.baiduKey) {
    document.getElementById('key').value = config.baiduKey;
  }

  // 保存配置
  document.getElementById('save').addEventListener('click', async () => {
    const appid = document.getElementById('appid').value.trim();
    const key = document.getElementById('key').value.trim();
    const status = document.getElementById('status');

    if (!appid || !key) {
      status.textContent = 'APP ID 和密钥不能为空';
      status.className = 'status error';
      status.style.display = 'block';
      return;
    }

    try {
      await chrome.storage.local.set({
        baiduAppId: appid,
        baiduKey: key
      });
      
      status.textContent = '配置已保存';
      status.className = 'status success';
      status.style.display = 'block';
      
      setTimeout(() => {
        status.style.display = 'none';
      }, 2000);
    } catch (error) {
      status.textContent = '保存失败：' + error.message;
      status.className = 'status error';
      status.style.display = 'block';
    }
  });

  // 添加生词本按钮点击事件
  document.getElementById('reviewButton').addEventListener('click', () => {
    console.log('Opening review page...');
    chrome.tabs.create({ url: 'review.html' });
  });
}); 
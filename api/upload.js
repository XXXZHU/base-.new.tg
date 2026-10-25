module.exports = async (req, res) => {
  // 设置跨域
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: '没有收到图片数据' });
    }

    const base64Data = imageBase64.split(',')[1];
    const buffer = Buffer.from(base64Data, 'base64');

    // Telegra.ph 需要 form-data
    const formData = new FormData();
    const blob = new Blob([buffer], { type: 'image/jpeg' });
    formData.append('file', blob, 'image.jpg'); // 这里字段名必须是 file

    // 🚀 请求 Telegra.ph 图床
    const response = await fetch('https://telegra.ph/upload', {
      method: 'POST',
      body: formData
    });

    const data = await response.json();

    if (data && data[0] && data[0].src) {
      // Telegra.ph 返回的是相对路径，需要拼接完整域名
      const url = 'https://telegra.ph' + data[0].src;
      return res.status(200).json({ url: url });
    } else {
      return res.status(500).json({ error: '图床返回异常', details: data });
    }
  } catch (error) {
    return res.status(500).json({ error: '代理请求失败：' + error.message });
  }
};

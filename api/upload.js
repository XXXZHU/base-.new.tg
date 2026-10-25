const axios = require('axios');
const FormData = require('form-data');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) return res.status(400).json({ error: '没有收到图片数据' });

    const base64Data = imageBase64.split(',')[1];
    const buffer = Buffer.from(base64Data, 'base64');

    const form = new FormData();
    form.append('file', buffer, { filename: 'image.jpg' });

    // 🚀 使用 0x0.st 图床，极客专属，抗封锁能力极强
    const response = await axios.post('https://0x0.st', form, {
      headers: { 
        ...form.getHeaders(),
        'User-Agent': 'Mozilla/5.0'
      }
    });

    // 0x0.st 返回的是一串纯文本网址
    if (response.data && response.data.startsWith('http')) {
      return res.status(200).json({ url: response.data.trim() });
    } else {
      return res.status(500).json({ error: '图床解析失败' });
    }
  } catch (error) {
    return res.status(500).json({ error: '代理请求失败：' + error.message });
  }
};

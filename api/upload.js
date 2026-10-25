const axios = require('axios');
const FormData = require('form-data');

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

    const form = new FormData();
    form.append('file', buffer, { filename: 'image.jpg', contentType: 'image/jpeg' });

    // 🚀 使用 axios 请求 Telegra.ph 图床，比原生 fetch 稳一万倍
    const response = await axios.post('https://telegra.ph/upload', form, {
      headers: { ...form.getHeaders() }
    });

    const data = response.data;
    if (data && data[0] && data[0].src) {
      const url = 'https://telegra.ph' + data[0].src;
      return res.status(200).json({ url: url });
    } else {
      return res.status(500).json({ error: '图床返回异常', details: data });
    }
  } catch (error) {
    return res.status(500).json({ error: '代理请求失败：' + error.message });
  }
};

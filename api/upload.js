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
    
    // 使用 FormData 发送给 imgbb
    const form = new FormData();
    form.append('image', base64Data);

    // 🚀 请求 imgbb 免费图床（无需 API Key 的公共上传接口）
    const response = await axios.post('https://imgbb.com/json', form, {
      headers: { 
        ...form.getHeaders(),
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    });

    if (response.data && response.data.image && response.data.image.url) {
      return res.status(200).json({ url: response.data.image.url });
    } else {
      return res.status(500).json({ error: '图床解析失败', details: response.data });
    }
  } catch (error) {
    return res.status(500).json({ error: '代理请求失败：' + error.message });
  }
};

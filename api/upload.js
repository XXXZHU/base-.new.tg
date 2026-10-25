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
    // Catbox 要求字段名为 'fileToUpload'
    form.append('fileToUpload', buffer, { filename: 'image.jpg' });
    form.append('reqtype', 'fileupload');

    // 🚀 请求 Catbox 图床
    const response = await axios.post('https://catbox.moe/user/api.php', form, {
      headers: { ...form.getHeaders() }
    });

    // Catbox 返回的是纯文本格式的链接
    if (response.data && response.data.startsWith('https://')) {
      return res.status(200).json({ url: response.data });
    } else {
      return res.status(500).json({ error: '图床返回异常', details: response.data });
    }
  } catch (error) {
    return res.status(500).json({ error: '代理请求失败：' + error.message });
  }
};

export default async function handler(req, res) {
  // 1. 放行跨域限制
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

    // 2. 解析 Base64
    const base64Data = imageBase64.split(',')[1];
    const buffer = Buffer.from(base64Data, 'base64');

    // 3. 打包发给外网图床 (SM.MS)
    const formData = new FormData();
    const blob = new Blob([buffer], { type: 'image/jpeg' });
    formData.append('smfile', blob, 'image.jpg');

    // 4. Vercel 服务器替你发送请求
    const response = await fetch('https://sm.ms/api/v2/upload', {
      method: 'POST',
      body: formData
    });

    const data = await response.json();

    // 5. 把短链接还给你的 App
    if (data.success) {
      return res.status(200).json({ url: data.data.url });
    } else {
      return res.status(500).json({ error: '图床繁忙，稍后再试' });
    }
  } catch (error) {
    return res.status(500).json({ error: '代理请求失败：' + error.message });
  }
}

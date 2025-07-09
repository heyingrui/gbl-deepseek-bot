const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

app.post('/webhook', async (req, res) => {
  try {
    const queryText = req.body.queryResult?.queryText || '你好';
    const prompt = `用户: ${queryText}\nAI:`;

    const response = await fetch(process.env.DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat', // 替换成你的模型名
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.status}`);
    }

    const data = await response.json();
    const fulfillmentText = data.choices?.[0]?.message?.content || 'AI 无响应，请稍后再试。';

    res.json({ fulfillmentText });

  } catch (error) {
    console.error('Webhook Error:', error.message);
    res.json({ fulfillmentText: 'AI 无响应，请稍后再试。' });
  }
});

app.listen(PORT, () => {
  console.log(`Webhook server is running on port ${PORT}`);
});

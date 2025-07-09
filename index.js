// index.js

const express = require('express');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.post('/webhook', async (req, res) => {
  try {
    const { queryResult } = req.body;
    const userQuery = queryResult?.queryText || '你好';

    console.log('收到用户请求:', userQuery);

    // 调用 DeepSeek Chat API
    const response = await axios.post(
      process.env.API_URL,
      {
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: userQuery }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
        }
      }
    );

    const aiReply = response.data.choices[0].message.content;
    console.log('AI 回复:', aiReply);

    res.json({
      fulfillmentText: aiReply
    });
  } catch (error) {
    console.error('Webhook Error:', error.response?.status, error.response?.data || error.message);

    res.json({
      fulfillmentText: 'AI 无响应，请稍后重试。'
    });
  }
});

app.listen(port, () => {
  console.log(`Webhook server is running on port ${port}`);
});

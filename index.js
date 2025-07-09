const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

app.post('/webhook', async (req, res) => {
  const query = req.body.queryResult?.queryText || '你是谁？';
  console.log('收到的请求：', query);

  try {
    const response = await axios.post(
      'https://api.deepseek.com/v1/chat/completions',
      {
        model: 'deepseek-chat',
        messages: [
          {
            role: 'user',
            content: query
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
        }
      }
    );

    const reply = response.data.choices?.[0]?.message?.content || 'AI 无响应';
    return res.json({ fulfillmentText: reply });

  } catch (error) {
    console.error('调用 DeepSeek 出错：', error.response?.data || error.message);
    return res.json({ fulfillmentText: 'AI 无响应，请稍后再试。' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

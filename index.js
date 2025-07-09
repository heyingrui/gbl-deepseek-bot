// index.js

const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());

app.post('/webhook', async (req, res) => {
  const queryResult = req.body.queryResult;
  const language = queryResult.parameters.language || 'Python';
  const topic = queryResult.parameters.topic || '基础';
  const userQuery = queryResult.queryText || '介绍一下';

  try {
    const response = await fetch(process.env.API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: process.env.MODEL_PROVIDER || 'deepseek-chat',
        messages: [
          { role: 'system', content: `你是编程导师，擅长${language}。请用中文讲解${topic}` },
          { role: 'user', content: userQuery }
        ]
      })
    });

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || 'AI 无响应，请稍后再试。';
    res.json({ fulfillmentText: reply });

  } catch (error) {
    console.error('Error calling AI:', error);
    res.json({ fulfillmentText: 'AI 无响应，请稍后再试。' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

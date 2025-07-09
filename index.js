const express = require('express');
const fetch = require('node-fetch');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

app.post('/webhook', async (req, res) => {
  try {
    const intent = req.body?.queryResult?.intent?.displayName || '';
    const parameters = req.body?.queryResult?.parameters || {};
    const userMessage = req.body?.queryResult?.queryText || '';

    let prompt = '';

    switch (intent) {
      case 'start.learning':
        const lang = parameters.language || 'Python';
        const topic = parameters.topic || 'loop';
        prompt = `你是一位温和耐心的编程导师，学生想用${lang}学习${topic}模块，请以鼓励语气介绍这个知识点。`;
        break;

      case 'ask.help':
        prompt = `请解释一下编程中 ${parameters.topic || 'for loop'} 的概念，适合初学者理解。`;
        break;

      case 'request.quiz':
        prompt = `请给我一道关于 ${parameters.topic || 'if statement'} 的简单编程练习题，并附上参考答案与简要解析。`;
        break;

      case 'emotion.low':
        prompt = `用户情绪低落，请发送一段温暖的鼓励语，适合学编程的学生使用。`;
        break;

      case 'farewell':
        prompt = `请用温柔而鼓励的语气说再见，鼓励用户下次继续回来学习编程。`;
        break;

      default:
        prompt = userMessage;
    }

    const apiResponse = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7
      })
    });

    const data = await apiResponse.json();
    const reply = data?.choices?.[0]?.message?.content || 'AI 无响应，请稍后再试。';

    res.json({ fulfillmentText: reply });

  } catch (error) {
    console.error('❌ Webhook Error:', error.message);
    res.json({ fulfillmentText: '抱歉，AI服务器遇到问题，请稍后再试。' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});

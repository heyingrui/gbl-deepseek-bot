const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch'); // 如果使用 Node.js 18+ 可改用 global fetch
const app = express();
const PORT = process.env.PORT || 3000;

// DeepSeek API Key
const DEEPSEEK_API_KEY = 'sk-40e4dfab27b54af5b52e6ff54c734021';  // ←请替换为你的密钥

app.use(bodyParser.json());

app.post('/webhook', async (req, res) => {
  const intent = req.body.queryResult.intent.displayName;
  const parameters = req.body.queryResult.parameters;

  const userMessage = req.body.queryResult.queryText;

  let prompt = '';

  // 构建不同意图的 prompt 逻辑
  if (intent === 'start.learning') {
    const lang = parameters['language'] || 'Python';
    const topic = parameters['topic'] || 'loop';
    prompt = `你是一位温和耐心的编程导师，学生想用${lang}学习${topic}模块，请以鼓励语气介绍这个知识点。`;
  } else if (intent === 'ask.help') {
    const topic = parameters['topic'] || 'for loop';
    prompt = `请解释一下编程中 ${topic} 的概念，适合初学者理解。`;
  } else if (intent === 'request.quiz') {
    const topic = parameters['topic'] || 'if statement';
    prompt = `请给我一道关于 ${topic} 的简单编程练习题，并附上参考答案与简要解析。`;
  } else if (intent === 'emotion.low') {
    prompt = `用户情绪低落，请发送一段温暖的鼓励语，适合学编程的学生使用。`;
  } else if (intent === 'farewell') {
    prompt = `请用温柔而鼓励的语气说再见，鼓励用户下次继续回来学习编程。`;
  } else {
    prompt = userMessage; // 默认直接发送原句
  }

  try {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
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

    const data = await response.json();
    const reply = data.choices[0].message.content;

    res.json({
      fulfillmentText: reply
    });
  } catch (err) {
    console.error('Error calling DeepSeek:', err);
    res.json({
      fulfillmentText: 'Sorry, something went wrong with the AI server.'
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

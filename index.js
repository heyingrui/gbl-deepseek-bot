const express = require("express");
const bodyParser = require("body-parser");
const fetch = require("node-fetch");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());

// Webhook endpoint
app.post("/webhook", async (req, res) => {
  try {
    const queryText = req.body.queryResult.queryText || "请提供问题内容";

    const apiKey = process.env.DEEPSEEK_API_KEY;

    if (!apiKey) {
      return res.json({ fulfillmentText: "未设置 DeepSeek API 密钥。" });
    }

    // 调用 DeepSeek API
    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "user",
            content: queryText
          }
        ]
      })
    });

    if (!response.ok) {
      console.error(`DeepSeek API 请求失败: ${response.status}`);
      return res.json({ fulfillmentText: `AI 无响应，请稍后再试。` });
    }

    const data = await response.json();

    const aiReply = data.choices?.[0]?.message?.content || "AI 无法生成回应，请稍后再试。";

    return res.json({
      fulfillmentText: aiReply
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return res.json({
      fulfillmentText: "AI 无响应，请稍后再试。"
    });
  }
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`Webhook server is running on port ${PORT}`);
});

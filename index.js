const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const fetch = require("node-fetch"); // ✅ 修复 fetch 报错

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
if (!DEEPSEEK_API_KEY) {
  console.error("❌ DeepSeek API Key 未设置，请检查 .env 文件");
}

app.use(bodyParser.json());

app.post("/webhook", async (req, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  
  const queryText = req.body.queryResult?.queryText || "";
  const intentName = req.body.queryResult?.intent?.displayName || "";
  console.log("🎯 queryText:", queryText);
  console.log("📌 intentName:", intentName);
  
  // console.log("🌐 Raw body received:", JSON.stringify(req.body, null, 2));
  // console.log("🎯 Extracted queryText:", queryText);
  // console.log("🤖 Received queryText:", queryText);
  // console.log("📌 Intent displayName:", intentName);

  try {

    // 回复逻辑（保留你的原代码）
    let reply = `你好，你说的是：“${queryText}”`;

    // 如果启用 DeepSeek，只要不属于预设 intent 就调用
  const response = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.DEEPSEEK_API_KEY}`
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: "你是一个编程助教，擅长解释编程知识，语言简洁。" },
        { role: "user", content: queryText }
      ]
    })
  });

  const data = await response.json();
  reply = data.choices?.[0]?.message?.content || "AI 无响应，请稍后重试。";

  res.json({ fulfillmentText: reply });
} catch (error) {
  console.error("❌ DeepSeek 调用失败:", error.stack);
  res.status(500).json({
    fulfillmentText: "AI 无响应，请稍后重试。",
  });
}

app.listen(port, () => {
  console.log(`✅ Webhook server is running on port ${port}`);
});

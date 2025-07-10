const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
// const fetch = require("node-fetch"); // ✅ 修复 fetch 报错, node.js是18以上版本，服务器自动更新，不需要这句代码

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

async function callDeepSeek(queryText) {
  try{
    // 回复逻辑（保留你的原代码）
    let reply = "默认回复。";
     // 判断 intent
    if (intentName === "start.learning") {
      reply = "学习即将开始，加油！";
    } else if (intentName === "ask.help") {
      reply = "请问你需要什么帮助？";
    } else {
      // reply = `你好，你说的是：“${queryText}”`;
      //请求DeepSeek API 获取回复
      const apiResponse = await fetch("https://api.deepseek.com/chat/completions", {
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

    const data = await apiResponse.json();
    const reply = data.choices?.[0]?.message?.content || "AI 无响应，请稍后重试。。。";
    return reply;

  } catch (error) {
    console.error("❌ DeepSeek 请求失败：", error.message);
    return "AI 调用出错，请检查网络或 API 配置。";      
  }catch (error) {
    console.error("❌ Webhook Error:", error);
    res.json({
      fulfillmentText: "AI 无响应，请稍后重试。",
    });
  }
});

app.use(bodyParser.json());

app.post("/webhook", async (req, res) => {
  const queryText = req.body.queryResult?.queryText || "";
  const intentName = req.body.queryResult?.intent?.displayName || "";
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  
  console.log("🌐 Raw body received:", JSON.stringify(req.body, null, 2));
  console.log("🎯 Extracted queryText:", queryText);
  console.log("🤖 Received queryText:", queryText);
  console.log("📌 Intent displayName:", intentName);
  console.log(typeof fetch); // 应该输出 function
  const reply = await callDeepSeek(queryText);
  console.log("✅ AI 回复：", reply);
    }
  
app.listen(port, () => {
  console.log(`✅ Webhook server is running on port ${port}`);
});

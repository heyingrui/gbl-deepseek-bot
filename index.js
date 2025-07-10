const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const fetch = require("node-fetch"); // ✅ 修复 fetch 报错
const { MongoClient } = require("mongodb");

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// MongoDB URI from your MongoDB Atlas
const uri = process.env.MONGODB_URI; // 存储在 .env 文件中

let db;

MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((client) => {
    db = client.db("gbl_database"); // 替换为你的数据库名
    console.log("✅ Connected to MongoDB Atlas");
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
  });

app.use(bodyParser.json());

app.post("/webhook", async (req, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  
  //const queryText = req.body.queryResult?.queryText || "";
  const userQuery = req.body.queryResult.queryText || "";
  const intentName = req.body.queryResult?.intent?.displayName || "";

  const apiResponse = await fetch("https://api.deepseek.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "deepseek-chat", // 或其他你使用的模型名
      messages: [
        { role: "system", content: "你是一个编程教学助手，请用简洁中文回答。" },
        { role: "user", content: userQuery }
      ]
    })
  });  

  const result = await apiResponse.json();
  const reply = result.choices?.[0]?.message?.content || "抱歉，我现在无法回答这个问题。";

  console.log("🌐 Raw body received:", JSON.stringify(req.body, null, 2));
  console.log("🎯 Extracted queryText:", queryText);
  console.log("🤖 Received queryText:", queryText);
  console.log("📌 Intent displayName:", intentName);

  try {
    if (!db) throw new Error("MongoDB 未连接，稍后重试");
    // MongoDB 插入日志
    await db.collection("user_inputs").insertOne({
      queryText,
      intentName,
      timestamp: new Date()
    });

    // 回复逻辑（保留你的原代码）
    let reply = "";

    // 简单条件判断
    if (queryText.includes("条件语句") || queryText.includes("if")) {
      reply = "条件语句用于根据不同的条件来执行不同的代码，例如 if、if-else、switch。";
    } else {
      reply = "对不起，我暂时无法回答这个问题。";
    }
  
    res.json({ fulfillmentText: reply });
  } catch (error) {
    console.error("❌ Webhook Error:", error);
    res.json({
      fulfillmentText: "AI 无响应，请稍后重试。",
    });
  }
});


app.listen(port, () => {
  console.log(`✅ Webhook server is running on port ${port}`);
});

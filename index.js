res.setHeader('Content-Type', 'application/json; charset=utf-8');
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
  const queryText = req.body.queryResult?.queryText || "";
  const intentName = req.body.queryResult?.intent?.displayName || "";

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
    let reply = "默认回复。";

    // 判断 intent
    if (intentName === "start.learning") {
      reply = "学习即将开始，加油！";
    } else if (intentName === "ask.help") {
      reply = "请问你需要什么帮助？";
    } else {
      reply = `你好，你说的是：“${queryText}”`;
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

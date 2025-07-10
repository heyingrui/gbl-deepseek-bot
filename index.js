const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const fetch = require("node-fetch"); // ✅ 修复 fetch 报错
const admin = require("firebase-admin");
const serviceAccount = require("firebase-service-account.json"); 

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

app.post("/webhook", async (req, res) => {
  const queryText = req.body.queryResult?.queryText || "";
  const intentName = req.body.queryResult?.intent?.displayName || "";

  console.log("🤖 Received queryText:", queryText);
  console.log("📌 Intent displayName:", intentName);
  console.log("🛠 正在尝试写入 Firestore 数据...");

  try {
    let reply = "默认回复。";

    // 判断 intent
    if (intentName === "start.learning") {
      reply = "学习即将开始，加油！";
    } else if (intentName === "ask.help") {
      reply = "请问你需要什么帮助？";
    } else {
      reply = `你好，你说的是：“${queryText}”`;
    }

     db.collection("test_collection")
      .add({ test: "ok", timestamp: new Date() })
      .then(() => {
        console.log("✅ Firestore connected and wrote data.");
    })
    
    // ✅ 写入 Firestore
    await db.collection("chat_logs").add({
      queryText,
      intentName,
      timestamp: new Date(),
    });
    
    console.log("✅ Firestore 写入成功");
    
    res.json({ fulfillmentText: reply });
  } catch (error) {
    console.error("❌ Webhook Error:", error);
    console.error("❌ Firestore 写入失败:", error);
    res.json({
      fulfillmentText: "AI 无响应，请稍后重试。",
    });
  }
});


app.listen(port, () => {
  console.log(`✅ Webhook server is running on port ${port}`);
});

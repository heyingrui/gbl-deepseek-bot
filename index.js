const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const admin = require("firebase-admin");
const fetch = require("node-fetch"); // ✅ 修复 fetch 报错
const firebaseConfig = JSON.parse(process.env.FIREBASE_CONFIG);

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const db = admin.firestore();

admin.initializeApp({
  credential: admin.credential.cert(firebaseConfig),
});

const db = admin.firestore();

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

      // ✅ 写入 Firestore
      await db.collection("interactions").add({
      sessionId: sessionId,
      userQuery: queryText,
      botReply: reply,
      intent: intentName,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
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

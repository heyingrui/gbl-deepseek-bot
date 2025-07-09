const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const fetch = require("node-fetch"); // ✅ 修复 fetch 报错

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

app.post("/webhook", async (req, res) => {
  const queryText = req.body.queryResult?.queryText || "";
  const intent = req.body.queryResult?.intent?.displayName || "";

  console.log("🤖 Received intent:", intent);
  console.log("📥 Received queryText:", queryText);

  let reply = "对不起，我还不太明白你的意思。";

  try {
    // 根据意图判断返回内容
    switch (intent) {
      case "ask.help":
        reply = "请问你需要什么帮助？";
        break;
      case "emotion.low":
        reply = "我理解你的心情。如果你愿意，我可以陪你聊聊。";
        break;
      case "farewell":
        reply = "再见，祝你有美好的一天！";
        break;
      case "request.quiz":
        reply = "我们现在开始小测验吧。请准备好！";
        break;
      case "start.learning":
        reply = "学习即将开始，加油！";
        break;
      default:
        reply = `你好！你说的是：“${queryText}”`;
        break;
    }

    res.json({
      fulfillmentText: reply,
    });
  } catch (error) {
    console.error("❌ Webhook Error:", error.message);
    res.json({
      fulfillmentText: "AI 无响应，请稍后重试。",
    });
  }
});

app.listen(port, () => {
  console.log(`✅ Webhook server is running on port ${port}`);
});

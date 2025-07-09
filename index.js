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

  console.log("🤖 Received queryText:", queryText);

  try {
    // 示例：调用外部API（可根据你实际用途修改）
    // const response = await fetch("https://api.example.com/answer?q=" + encodeURIComponent(queryText));
    // const data = await response.json();
    // const reply = data.answer || "暂时无法获取答案。";

    // 如果你不使用外部API，可直接返回固定回复：
    const reply = `你好！你说的是：“${queryText}”`;

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

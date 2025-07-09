const express = require("express");
const bodyParser = require("body-parser");
const fetch = require("node-fetch");
require("dotenv").config();

const app = express();
app.use(bodyParser.json());

app.post("/webhook", async (req, res) => {
  const queryText = req.body.queryResult?.queryText || "Hello";

  try {
    const response = await fetch(process.env.API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [{ role: "user", content: queryText }],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch from DeepSeek API");
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "无结果";

    return res.json({ fulfillmentText: reply });
  } catch (error) {
    console.error("Webhook error:", error.message);
    return res.json({ fulfillmentText: "AI 无响应，请稍后再试。" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Webhook server listening on port ${PORT}`);
});

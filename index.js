const express = require("express");
const app = express();
app.use(express.json());

const GROQ_KEY = process.env.GROQ_API_KEY;
const SECRET = process.env.ROBLOX_SECRET;

app.get("/", (req, res) => {
  res.json({ status: "Deadlands proxy running" });
});

app.post("/claude", async (req, res) => {
  if (req.headers["x-secret"] !== SECRET)
    return res.status(403).json({ error: "Unauthorized" });

  const { system, messages, max_tokens } = req.body;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + GROQ_KEY
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        max_tokens: max_tokens || 150,
        messages: [
          { role: "system", content: system || "" },
          ...messages
        ]
      })
    });

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || "";
    res.json({ text });
  } catch (err) {
    res.status(500).json({ text: "", error: err.message });
  }
});

app.listen(process.env.PORT || 3000);
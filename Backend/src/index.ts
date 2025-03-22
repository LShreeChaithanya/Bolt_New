import { BASE_PROMPT, getSystemPrompt } from "./prompt";

import express from "express";
import fs from "fs";
import { basePrompt as nodeBasePrompt } from "./defaults/node";
import { basePrompt as reactBasePrompt } from "./defaults/react";
import cors from "cors";
const app = express();
// Allow requests from the frontend
app.use(cors({
origin: "http://localhost:5174", // replace with your frontend URL if different
methods: ["GET", "POST"],
allowedHeaders: ["Content-Type", "Authorization"],
}));

require("dotenv").config();

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY; // Output: <OPENROUTER_API_KEY>



app.use(express.json());

app.post("/template", async (req, res) => {
  const prompt =req.body.prompt;

  const response = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        //"HTTP-Referer": "<YOUR_SITE_URL>", // Optional. Site URL for rankings on openrouter.ai.
        //"X-Title": "<YOUR_SITE_NAME>", // Optional. Site title for rankings on openrouter.ai.
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3.1-8b-instruct", //"deepseek/deepseek-r1-zero:free",
        messages: [
          {
            role: "user",
            content: `Return node or react based on what you think this project should be. Only return a single word eg. 'node' or 'react' and nothing extra.${prompt}`,
          },
        ],
        
        temperature: 0.2,
        max_tokens: 100,
      }),
    }
  );
  const data = await response.json();
  //console.log(JSON.stringify(data.choices[0].message, null, 2));

  //console.log("Reasoning: " + data.choices[0].message.reasoning);
  console.log("Content: " + data.choices[0].message.content);

  const answer = data.choices[0].message.content.trim().toLowerCase();
  console.log(answer);
  if (answer === "react") {
    res.json({
      prompts: [
        BASE_PROMPT,
        `The following is a list of all project files and their complete contents that are currently visible and accessible to you.\n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`,
      ],
      uiPrompts: [reactBasePrompt],
    });
    console.log("react");
    return;
  }
  if (answer === "node") {
    res.json({
      prompts: [
        `The following is a list of all project files and their complete contents that are currently visible and accessible to you.\n\n${nodeBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`,
      ],
      uiPrompts: [nodeBasePrompt],
    });
    console.log("Node");
    return;
  }
  res.status(403).json({ message: "You can't access this" });
  return;
});

app.listen(3001, () => {
  console.log("Server is running on port 3001");
});

app.post("/chat", async (req, res) => {
  const message = req.body.message;

  const response = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        //"HTTP-Referer": "<YOUR_SITE_URL>", // Optional. Site URL for rankings on openrouter.ai.
        //"X-Title": "<YOUR_SITE_NAME>", // Optional. Site title for rankings on openrouter.ai.
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3.1-8b-instruct", //"deepseek/deepseek-r1-zero:free",
        messages: [
          {
            role: "user",
            content: message
          },
        ],
        system: getSystemPrompt(),
        temperature: 0.2,
        max_tokens: 1000,
      }),
    }
  );
  console.log(response);
  res.json({});
});

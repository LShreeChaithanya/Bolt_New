"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prompt_1 = require("./prompt");
const express_1 = __importDefault(require("express"));
const node_1 = require("./defaults/node");
const react_1 = require("./defaults/react");
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
// Allow requests from the frontend
app.use((0, cors_1.default)({
    origin: "http://localhost:5174", // replace with your frontend URL if different
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
require("dotenv").config();
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY; // Output: <OPENROUTER_API_KEY>
app.use(express_1.default.json());
app.post("/template", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const prompt = req.body.prompt;
    const response = yield fetch("https://openrouter.ai/api/v1/chat/completions", {
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
    });
    const data = yield response.json();
    //console.log(JSON.stringify(data.choices[0].message, null, 2));
    //console.log("Reasoning: " + data.choices[0].message.reasoning);
    console.log("Content: " + data.choices[0].message.content);
    const answer = data.choices[0].message.content.trim().toLowerCase();
    console.log(answer);
    if (answer === "react") {
        res.json({
            prompts: [
                prompt_1.BASE_PROMPT,
                `The following is a list of all project files and their complete contents that are currently visible and accessible to you.\n\n${react_1.basePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`,
            ],
            uiPrompts: [react_1.basePrompt],
        });
        console.log("react");
        return;
    }
    if (answer === "node") {
        res.json({
            prompts: [
                `The following is a list of all project files and their complete contents that are currently visible and accessible to you.\n\n${node_1.basePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`,
            ],
            uiPrompts: [node_1.basePrompt],
        });
        console.log("Node");
        return;
    }
    res.status(403).json({ message: "You can't access this" });
    return;
}));
app.listen(3001, () => {
    console.log("Server is running on port 3001");
});
app.post("/chat", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const message = req.body.message;
    const response = yield fetch("https://openrouter.ai/api/v1/chat/completions", {
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
            system: (0, prompt_1.getSystemPrompt)(),
            temperature: 0.2,
            max_tokens: 1000,
        }),
    });
    console.log(response);
    res.json({});
}));

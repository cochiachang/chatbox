import { Message } from 'src/shared/types'
import Base, { onResultChange } from './base'
import { ApiError } from './errors'
const { GoogleGenerativeAI } = require("@google/generative-ai");

interface Options {
    geminiAPIKey: string
    geminiModel: string
    temperature: string
}

export default class GeminiAI extends Base {
    
    public name = 'gemini'
    public options: Options
    constructor(options: Options) {
        super()
        this.options = options
    }

    getHeaders() {
        const headers: Record<string, string> = {
            Authorization: `Bearer ${this.options.geminiAPIKey}`,
            'Content-Type': 'application/json',
        }
        return headers
    }

    
    async callChatCompletion(rawMessages: Message[], signal?: AbortSignal, onResultChange?: onResultChange): Promise<string> {
        const genAI = new GoogleGenerativeAI(this.options.geminiAPIKey);
        let messages = rawMessages.map(m => ({ role: m.role == "assistant" ? "model": m.role , parts: [{ text: m.content}] }))
        const msg = messages[messages.length - 1]["parts"][0]["text"];
        const systemMessages = messages.filter(m => m.role === "system")[0]["parts"][0]["text"];
        const model = genAI.getGenerativeModel({ model: this.options.geminiModel, systemInstruction: systemMessages });
        const history = messages.filter(m => m.role !== "system");
        history.pop();
        console.log(history)
        const chat = model.startChat({
            history: history,
            generationConfig: {
              temperature: this.options.temperature,
            },
            
          });
        const result = await chat.sendMessageStream(msg);
        let text = '';
        for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            text += chunkText;
            if (onResultChange) {
                onResultChange(text)
            }
        }
        return text
    }

    //curl https://generativelanguage.googleapis.com/v1beta/models/gemini-pro?key=XXX
    async listModels(): Promise<string[]> {
        return ["gemini-1.0-pro", "gemini-1.5-pro","gemini-1.5-flash"]
    }
}

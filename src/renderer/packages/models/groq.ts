import { Message } from 'src/shared/types'
import Base, { onResultChange } from './base'
import { ApiError } from './errors'
import Groq from "groq-sdk";


// import ollama from 'ollama/browser'

interface Options {
    groqAPIKey: string
    groqModel: string
    temperature: string
}

export default class GroqAI extends Base {
    
    public name = 'groq'
    public options: Options
    constructor(options: Options) {
        super()
        this.options = options
    }

    getHeaders() {
        const headers: Record<string, string> = {
            Authorization: `Bearer ${this.options.groqAPIKey}`,
            'Content-Type': 'application/json',
        }
        return headers
    }

    async callChatCompletion(rawMessages: Message[], signal?: AbortSignal, onResultChange?: onResultChange): Promise<string> {
      const groq = new Groq({ apiKey: this.options.groqAPIKey, dangerouslyAllowBrowser: true })
      const messages = rawMessages.map(m => ({ role: m.role, content: m.content }))
      const stream = await groq.chat.completions.create({
          "messages": messages,
          "model": this.options.groqModel,
          "temperature": this.options.temperature ,
          "stream": true,
      });
      let result = ''
      for await (const chunk of stream) {
        let word = chunk.choices[0]?.delta?.content || ""
        result += word
            if (onResultChange) {
                onResultChange(result)
            }
      }
      return result
    }

    async listModels(): Promise<string[]> {
        const json = {
            "object": "list",
            "data": [
              {
                "id": "gemma2-9b-it",
                "object": "model",
                "created": 1693721698,
                "owned_by": "Google",
                "active": true,
                "context_window": 8192,
                "public_apps": null
              },
              {
                "id": "gemma-7b-it",
                "object": "model",
                "created": 1693721698,
                "owned_by": "Google",
                "active": true,
                "context_window": 8192,
                "public_apps": null
              },
              {
                "id": "llama-3.1-70b-versatile",
                "object": "model",
                "created": 1693721698,
                "owned_by": "Meta",
                "active": true,
                "context_window": 131072,
                "public_apps": null
              },
              {
                "id": "llama-3.1-8b-instant",
                "object": "model",
                "created": 1693721698,
                "owned_by": "Meta",
                "active": true,
                "context_window": 131072,
                "public_apps": null
              },
              {
                "id": "llama3-70b-8192",
                "object": "model",
                "created": 1693721698,
                "owned_by": "Meta",
                "active": true,
                "context_window": 8192,
                "public_apps": null
              },
              {
                "id": "llama3-8b-8192",
                "object": "model",
                "created": 1693721698,
                "owned_by": "Meta",
                "active": true,
                "context_window": 8192,
                "public_apps": null
              },
              {
                "id": "llama3-groq-70b-8192-tool-use-preview",
                "object": "model",
                "created": 1693721698,
                "owned_by": "Groq",
                "active": true,
                "context_window": 8192,
                "public_apps": null
              },
              {
                "id": "llama3-groq-8b-8192-tool-use-preview",
                "object": "model",
                "created": 1693721698,
                "owned_by": "Groq",
                "active": true,
                "context_window": 8192,
                "public_apps": null
              },
              {
                "id": "mixtral-8x7b-32768",
                "object": "model",
                "created": 1693721698,
                "owned_by": "Mistral AI",
                "active": true,
                "context_window": 32768,
                "public_apps": null
              },
              {
                "id": "whisper-large-v3",
                "object": "model",
                "created": 1693721698,
                "owned_by": "OpenAI",
                "active": true,
                "context_window": 1500,
                "public_apps": null
              }
            ]
          }
        return json['data'].map((m: any) => m['id'])
    }
}

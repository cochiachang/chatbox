import { v4 as uuidv4 } from 'uuid'
import { Model } from '../renderer/packages/models/openai'

export const MessageRoleEnum = {
    System: 'system',
    User: 'user',
    Assistant: 'assistant',
} as const

export type MessageRole = (typeof MessageRoleEnum)[keyof typeof MessageRoleEnum]

export interface Message {
    id: string

    role: MessageRole
    content: string
    name?: string

    cancel?: () => void
    generating?: boolean

    aiProvider?: ModelProvider
    model?: string

    errorCode?: number
    error?: string
    errorExtra?: {
        [key: string]: any
    }

    wordCount?: number
    tokenCount?: number
    tokensUsed?: number
    timestamp?: number
}

export type SettingWindowTab = 'ai' | 'display' | 'chat' | 'advanced'

export type SessionType = 'chat'

export function isChatSession(session: Session) {
    return session.type === 'chat' || !session.type
}

export interface Session {
    id: string
    type?: SessionType
    name: string
    picUrl?: string
    messages: Message[]
    copilotId?: string
}

export function createMessage(role: MessageRole = MessageRoleEnum.User, content: string = ''): Message {
    return {
        id: uuidv4(),
        content: content,
        role: role,
        timestamp: new Date().getTime(),
    }
}

export enum ModelProvider {
    OpenAI = 'openai',
    Ollama = 'ollama',
    Groq = 'groq',
    Gemini = 'gemini',
}

export interface ModelSettings {
    aiProvider: ModelProvider

    // openai
    openaiKey: string
    apiHost: string
    model: Model | 'custom-model'
    openaiCustomModel?: string

    // ollama
    ollamaHost: string
    ollamaModel: string


    // groq
    groqAPIKey: string
    groqModel: string


    // gemini
    geminiAPIKey: string
    geminiModel: string

    temperature: number
    topP: number
    openaiMaxContextMessageCount: number
}

export interface Settings extends ModelSettings {
    showWordCount?: boolean
    showTokenCount?: boolean
    showTokenUsed?: boolean
    showModelName?: boolean
    showMessageTimestamp?: boolean

    theme: Theme
    language: Language
    languageInited?: boolean
    fontSize: number
    spellCheck: boolean

    defaultPrompt?: string

    proxy?: string

    allowReportingAndTracking: boolean

    userAvatarKey?: string

    enableMarkdownRendering: boolean
}

export type Language = 'en' | 'zh-Hans' | 'zh-Hant' | 'ja' | 'ko' | 'ru' | 'de' | 'fr'

export interface Config {
    uuid: string
}

export interface SponsorAd {
    text: string
    url: string
}

export interface SponsorAboutBanner {
    type: 'picture' | 'picture-text'
    name: string
    pictureUrl: string
    link: string
    title: string
    description: string
}

export interface CopilotDetail {
    id: string
    name: string
    picUrl?: string
    prompt: string
    demoQuestion?: string
    demoAnswer?: string
    starred?: boolean
    usedCount: number
    shared?: boolean
}

export interface Toast {
    id: string
    content: string
}

export enum Theme {
    DarkMode,
    LightMode,
    FollowSystem,
}

export interface RemoteConfig {
    setting_chatboxai_first: boolean
    product_ids: number[]
}
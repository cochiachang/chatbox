import OpenAI from './openai'
import { Settings, Config, ModelProvider, SessionType, ModelSettings, Session } from '../../../shared/types'
import Ollama from './ollama'

export function getModel(setting: Settings, config: Config) {
    switch (setting.aiProvider) {
        case ModelProvider.OpenAI:
            return new OpenAI(setting)
        case ModelProvider.Ollama:
            return new Ollama(setting)
        default:
            throw new Error('Cannot find model with provider: ' + setting.aiProvider)
    }
}

export const aiProviderNameHash = {
    [ModelProvider.OpenAI]: 'OpenAI API',
    [ModelProvider.Ollama]: 'Ollama',
}

export const AIModelProviderMenuOptionList = [
    {
        value: ModelProvider.OpenAI,
        label: aiProviderNameHash[ModelProvider.OpenAI],
        disabled: false,
    },
    {
        value: ModelProvider.Ollama,
        label: aiProviderNameHash[ModelProvider.Ollama],
        disabled: false,
    },
]

export function getModelDisplayName(settings: Settings, sessionType: SessionType): string {
    if (!settings) {
        return 'unknown'
    }
    switch (settings.aiProvider) {
        case ModelProvider.OpenAI:
            if (settings.model === 'custom-model') {
                let name = settings.openaiCustomModel || ''
                if (name.length >= 10) {
                    name = name.slice(0, 10) + '...'
                }
                return `OpenAI Custom Model (${name})`
            }
            return settings.model || 'unknown'
        case ModelProvider.Ollama:
            return `Ollama (${settings.ollamaModel})`
        default:
            return 'unknown'
    }
}

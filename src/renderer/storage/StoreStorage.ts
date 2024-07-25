import BaseStorage from './BaseStorage'
import { defaultSessions } from '../packages/initial_data'
import platform from '@/packages/platform'

export enum StorageKey {
    ChatSessions = 'chat-sessions',
    Configs = 'configs',
    Settings = 'settings',
    MyCopilots = 'myCopilots',
    ConfigVersion = 'configVersion',
    RemoteConfig = 'remoteConfig',
}

export default class StoreStorage extends BaseStorage {
    constructor() {
        super()
    }
    public async getItem<T>(key: string, initialValue: T): Promise<T> {
        let value: T = await super.getItem(key, initialValue)

        if (key === StorageKey.ChatSessions && value === initialValue) {
            const lang = await platform.getLocale().catch(e => 'en')
            value = defaultSessions as T
            await super.setItem(key, value)
        }
        if (key === StorageKey.Configs && value === initialValue) {
            await super.setItem(key, initialValue)
        }

        return value
    }
}

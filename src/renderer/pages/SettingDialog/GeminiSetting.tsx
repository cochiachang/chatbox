import { Alert, FormControl, InputLabel, MenuItem, Select } from '@mui/material'
import { ModelSettings } from '../../../shared/types'
import { Trans, useTranslation } from 'react-i18next'
import TextFieldReset from '@/components/TextFieldReset'
import { useEffect, useState } from 'react'
import gemini from '@/packages/models/gemini'
import platform from '@/packages/platform'
import { useAtomValue } from 'jotai'
import { languageAtom } from '@/stores/atoms'

export function GeminiAPIKeyInput(props: {
    geminiAPIKey: string
    setGeminiAPIKey: (host: string) => void
    className?: string
}) {
    const { t } = useTranslation()
    const language = useAtomValue(languageAtom)
    return (
        <>
            <TextFieldReset
                label={t('api key')}
                value={props.geminiAPIKey}
                defaultValue=''
                onValueChange={props.setGeminiAPIKey}
                fullWidth
                className={props.className}
            />
        </>
    )
}

export function GeminiModelSelect(props: {
    geminiModel: ModelSettings['geminiModel']
    setGeminiModel: (model: ModelSettings['geminiModel']) => void
    geminiAPIKey: string
    className?: string
}) {
    const { t } = useTranslation()
    const [models, setModels] = useState<string[]>([])
    useEffect(() => {
        const model = new gemini({
            geminiAPIKey: props.geminiAPIKey,
            geminiModel: props.geminiModel,
        })
        model.listModels().then((models) => {
            setModels(models)
        })
        if (props.geminiModel && models.length > 0 && !models.includes(props.geminiModel)) {
            props.setGeminiModel(models[0])
        }
    }, [props.geminiAPIKey])
    return (
        <FormControl fullWidth variant="outlined" margin="dense" className={props.className}>
            <InputLabel htmlFor="gemini-model-select">{t('model')}</InputLabel>
            <Select
                label={t('model')}
                id="gemini-model-select"
                value={props.geminiModel}
                onChange={(e) =>
                    props.setGeminiModel(e.target.value)
                }
            >
                {models.map((model) => (
                    <MenuItem key={model} value={model}>
                        {model}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    )
}

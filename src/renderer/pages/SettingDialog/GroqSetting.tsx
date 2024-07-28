import { Alert, FormControl, InputLabel, MenuItem, Select } from '@mui/material'
import { ModelSettings } from '../../../shared/types'
import { Trans, useTranslation } from 'react-i18next'
import TextFieldReset from '@/components/TextFieldReset'
import { useEffect, useState } from 'react'
import groq from '@/packages/models/groq'
import platform from '@/packages/platform'
import { useAtomValue } from 'jotai'
import { languageAtom } from '@/stores/atoms'

export function GroqHostInput(props: {
    groqAPIKey: string
    setGroqAPIKey: (host: string) => void
    className?: string
}) {
    const { t } = useTranslation()
    const language = useAtomValue(languageAtom)
    return (
        <>
            <TextFieldReset
                label={t('api key')}
                value={props.groqAPIKey}
                defaultValue=''
                onValueChange={props.setGroqAPIKey}
                fullWidth
                className={props.className}
            />
        </>
    )
}

export function GroqModelSelect(props: {
    groqModel: ModelSettings['groqModel']
    setGroqModel: (model: ModelSettings['groqModel']) => void
    groqAPIKey: string
    className?: string
}) {
    const { t } = useTranslation()
    const [models, setModels] = useState<string[]>([])
    useEffect(() => {
        const model = new groq({
            groqAPIKey: props.groqAPIKey,
            groqModel: props.groqModel,
        })
        model.listModels().then((models) => {
            setModels(models)
        })
        if (props.groqModel && models.length > 0 && !models.includes(props.groqModel)) {
            props.setGroqModel(models[0])
        }
    }, [props.groqAPIKey])
    return (
        <FormControl fullWidth variant="outlined" margin="dense" className={props.className}>
            <InputLabel htmlFor="groq-model-select">{t('model')}</InputLabel>
            <Select
                label={t('model')}
                id="groq-model-select"
                value={props.groqModel}
                onChange={(e) =>
                    props.setGroqModel(e.target.value)
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

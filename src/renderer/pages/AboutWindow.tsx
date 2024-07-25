import { useEffect, useState } from 'react'
import {
    Button,
    Paper,
    Badge,
    Box,
    Divider,
    Dialog,
    DialogContent,
    DialogActions,
    DialogTitle,
    useTheme,
} from '@mui/material'
import iconPNG from '../static/icon.png'
import { useTranslation } from 'react-i18next'
import platform from '../packages/platform'
import * as remote from '../packages/remote'
import { SponsorAboutBanner } from '../../shared/types'
import * as i18n from '../i18n'
import useVersion from '../hooks/useVersion'
import * as atoms from '../stores/atoms'
import { useAtomValue } from 'jotai'
import Markdown from '@/components/Markdown'
import { trackingEvent } from '@/packages/event'

interface Props {
    open: boolean
    close(): void
}

export default function AboutWindow(props: Props) {
    const { t } = useTranslation()
    const theme = useTheme()
    const language = useAtomValue(atoms.languageAtom)
    const versionHook = useVersion()
    const [sponsorBanners] = useState<SponsorAboutBanner[]>([])
    useEffect(() => {
        if (props.open) {
            trackingEvent('about_window', { event_category: 'screen_view' })
        }
    }, [props.open])
    return (
        <Dialog open={props.open} onClose={props.close} fullWidth>
            <DialogTitle>{t('About Chatbox')}</DialogTitle>
            <DialogContent>
                <Box sx={{ textAlign: 'center', padding: '0 20px' }}>
                    <img src={iconPNG} style={{ width: '100px', margin: 0, display: 'inline-block' }} />
                    <h3 style={{ margin: '4px 0 5px 0' }}>Chatbox
                        {
                            /\d/.test(versionHook.version)
                                ? `(v${versionHook.version})`
                                : ''
                        }
                    </h3>
                    <p className="p-0 m-0">{t('about-slogan')}</p>
                    <p className="p-0 m-0 opacity-60 text-xs">{t('about-introduction')}</p>
                </Box>
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                    }}
                    className='mt-1'
                >
                    <Badge color="primary" variant="dot" invisible={!versionHook.needCheckUpdate}
                        sx={{ margin: '4px' }}
                    >
                        <Button
                            variant="outlined"
                            onClick={() => platform.openLink(`https://chatboxai.app/redirect_app/check_update/${language}`)}
                        >
                            {t('Check Update')}
                        </Button>
                    </Badge>
                    <Button
                        variant="outlined"
                        sx={{ margin: '4px' }}
                        onClick={() => platform.openLink(`https://chatboxai.app/redirect_app/homepage/${language}`)}
                    >
                        {t('Homepage')}
                    </Button>
                    <Button
                        variant="outlined"
                        sx={{ margin: '4px' }}
                        onClick={() => platform.openLink(`https://chatboxai.app/redirect_app/feedback/${language}`)}
                    >
                        {t('Feedback')}
                    </Button>
                    <Button
                        variant="outlined"
                        sx={{ margin: '4px' }}
                        onClick={() => platform.openLink(`https://chatboxai.app/redirect_app/faqs/${language}`)}
                    >
                        {t('FAQs')}
                    </Button>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={props.close}>{t('close')}</Button>
            </DialogActions>
        </Dialog>
    )
}

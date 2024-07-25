import { useEffect, useState, useRef, useCallback } from 'react'
import Box from '@mui/material/Box'
import Avatar from '@mui/material/Avatar'
import {
    Typography,
    Grid,
    useTheme,
    ButtonGroup,
    Tooltip,
    TextField,
    IconButton
} from '@mui/material'
import MenuItem from '@mui/material/MenuItem'
import FormatQuoteIcon from '@mui/icons-material/FormatQuote'
import EditIcon from '@mui/icons-material/Edit'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import StopIcon from '@mui/icons-material/Stop'
import CopyAllIcon from '@mui/icons-material/CopyAll'
import ReplayIcon from '@mui/icons-material/Replay'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import PersonIcon from '@mui/icons-material/Person'
import SmartToyIcon from '@mui/icons-material/SmartToy'
import SettingsIcon from '@mui/icons-material/Settings'
import { useTranslation } from 'react-i18next'
import { Message, SessionType } from '../../shared/types'
import { useAtomValue, useSetAtom } from 'jotai'
import {
    showMessageTimestampAtom,
    showModelNameAtom,
    showTokenCountAtom,
    showWordCountAtom,
    openSettingDialogAtom,
    enableMarkdownRenderingAtom,
} from '../stores/atoms'
import { currsentSessionPicUrlAtom, showTokenUsedAtom } from '../stores/atoms'
import * as scrollActions from '../stores/scrollActions'
import Markdown from '@/components/Markdown'
import '../static/Block.css'
import MessageErrTips from './MessageErrTips'
import * as dateFns from "date-fns"
import { cn } from '@/lib/utils'
import { estimateTokensFromMessages } from '@/packages/token'
import { countWord } from '@/packages/word-count'
import * as atoms from '../stores/atoms'
import * as sessionActions from '../stores/sessionActions'

export interface Props {
    id?: string
    sessionId: string
    sessionType: SessionType
    msg: Message
    className?: string
    collapseThreshold?: number
    hiddenButtonGroup?: boolean
    small?: boolean
    delMsg?: () => void
    refreshMsg?: () => void
    editMsg?: () => void
}

export default function Message(props: Props) {
    const { t } = useTranslation()
    const theme = useTheme()

    const showMessageTimestamp = useAtomValue(showMessageTimestampAtom)
    const showModelName = useAtomValue(showModelNameAtom)
    const showTokenCount = useAtomValue(showTokenCountAtom)
    const showWordCount = useAtomValue(showWordCountAtom)
    const showTokenUsed = useAtomValue(showTokenUsedAtom)
    const enableMarkdownRendering = useAtomValue(enableMarkdownRenderingAtom)
    const currentSessionPicUrl = useAtomValue(currsentSessionPicUrlAtom)
    const setOpenSettingWindow = useSetAtom(openSettingDialogAtom)
    const setChatConfigDialogSession = useSetAtom(atoms.chatConfigDialogAtom)

    const { msg, className, collapseThreshold, hiddenButtonGroup, small, delMsg, refreshMsg, editMsg } = props

    const needCollapse = collapseThreshold
        && (JSON.stringify(msg.content)).length > collapseThreshold
        && (JSON.stringify(msg.content)).length - collapseThreshold > 50
    const [isCollapsed, setIsCollapsed] = useState(needCollapse)
    const [isHovering, setIsHovering] = useState(false)
    const [isEditing, setIsEditing] = useState(false)

    const onStop = useCallback(() => {
        msg?.cancel?.()
    }, [msg])

    const onRefresh = useCallback(() => {
        onStop()
        refreshMsg && refreshMsg()
    }, [onStop, props.refreshMsg])

    const ref = useRef<HTMLDivElement>(null)

    const tips: string[] = []
    if (props.sessionType === 'chat' || !props.sessionType) {
        if (showWordCount && !msg.generating) {
            tips.push(`word count: ${msg.wordCount !== undefined ? msg.wordCount : countWord(msg.content)}`)
        }
        if (showTokenCount && !msg.generating) {
            if (msg.tokenCount === undefined) {
                msg.tokenCount = estimateTokensFromMessages([msg])
            }
            tips.push(`token count: ${msg.tokenCount}`)
        }
        if (showTokenUsed && msg.role === 'assistant' && !msg.generating) {
            tips.push(`tokens used: ${msg.tokensUsed || 'unknown'}`)
        }
        if (showModelName && props.msg.role === 'assistant') {
            tips.push(`model: ${props.msg.model || 'unknown'}`)
        }
    }

    if (showMessageTimestamp && msg.timestamp !== undefined) {
        let date = new Date(msg.timestamp)
        let messageTimestamp: string
        if (dateFns.isToday(date)) {
            messageTimestamp = dateFns.format(date, 'HH:mm')
        } else if (dateFns.isThisYear(date)) {
            messageTimestamp = dateFns.format(date, 'MM-dd HH:mm')
        } else {
            messageTimestamp = dateFns.format(date, 'yyyy-MM-dd HH:mm')
        }

        tips.push('time: ' + messageTimestamp)
    }

    useEffect(() => {
        if (msg.generating) {
            scrollActions.scrollToBottom()
        }
    }, [msg.content])

    let content = msg.content
    if (typeof msg.content !== 'string') {
        content = JSON.stringify(msg.content)
    }
    if (msg.generating) {
        content += '...'
    }
    if (needCollapse && isCollapsed) {
        content = msg.content.slice(0, collapseThreshold) + '... '
    }

    const CollapseButton = (
        <span
            className='cursor-pointer inline-block font-bold text-blue-500 hover:text-white hover:bg-blue-500'
            onClick={() => setIsCollapsed(!isCollapsed)}
        >
            [{isCollapsed ? t('Expand') : t('Collapse')}]
        </span>
    )

    return (
        <Box
            ref={ref}
            id={props.id}
            key={msg.id}
            className={cn(
                'group/message',
                'msg-block',
                'px-2',
                msg.generating ? 'rendering' : 'render-done',
                {
                    user: 'user-msg',
                    system: 'system-msg',
                    assistant: 'assistant-msg',
                }[msg?.role || 'user'],
                className,
            )}
            sx={{
                margin: '0',
                paddingBottom: '0.1rem',
                paddingX: '1rem',
                [theme.breakpoints.down('sm')]: {
                    paddingX: '0.3rem',
                },
            }}
            
            onMouseEnter={() => {
                setIsHovering(true)
            }}
            onMouseOver={() => {
                setIsHovering(true)
                console.log(msg.role )
            }}
            onMouseLeave={() => {
                setIsHovering(false)
            }}
        >                  
                {(isHovering && !isEditing) || msg.generating ? (
                    <Box sx={{ height: '35px' }}>
                        <ButtonGroup
                            sx={{ height: '35px' }}
                            variant="contained"
                            aria-label="outlined primary button group"
                        >
                            {msg.generating ? (
                                <Tooltip title={t('stop generating')} placement="top">
                                    <IconButton aria-label="edit" color="warning" onClick={onStop}>
                                        <StopIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            ) : null}
                            {msg.role === 'assistant' && !msg.generating ? (
                                <Tooltip title={t('regenerate')} placement="top">
                                    <IconButton aria-label="edit" color="primary" onClick={onRefresh}>
                                        <ReplayIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            ) : null}
                            {msg.role == 'user' ? (
                                <Tooltip title={t('edit')} placement="top">
                                    <IconButton
                                        aria-label="edit"
                                        color="primary"
                                        onClick={() => {
                                            setIsHovering(false)
                                            setIsEditing(true)
                                        }}
                                    >
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            ) : null}
                            {msg.role === 'user' || msg.role === 'assistant' ? (
                                <Tooltip title={t('copy')} placement="top">
                                    <IconButton
                                        aria-label="copy"
                                        color="primary"
                                        onClick={() => {
                                            navigator.clipboard.writeText(msg.content)
                                        }}
                                    >
                                        <CopyAllIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            ) : null}
                            {msg.role === 'user' || msg.role === 'assistant' ? (
                                <Tooltip title={t('delete')} placement="top">
                                    <IconButton
                                        aria-label="delete"
                                        color="primary"
                                        onClick={() => {
                                            setIsEditing(false)
                                            setIsHovering(false)
                                            delMsg && delMsg();
                                        }}
                                    >
                                        <DeleteForeverIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            ) : null}
                        </ButtonGroup>
                    </Box>
                ) : (
                    <Box sx={{ height: '35px' }}></Box>
                )}
            <Grid container wrap="nowrap" spacing={1.5}>
                <Grid item>
                    <Box sx={{ marginTop: '8px' }}>
                        {
                            {
                                assistant: currentSessionPicUrl ? (
                                    <Avatar
                                        src={currentSessionPicUrl}
                                        sx={{
                                            width: '28px',
                                            height: '28px',
                                        }}
                                    />
                                ) : (
                                    <Avatar
                                        sx={{
                                            backgroundColor: theme.palette.primary.main,
                                            width: '28px',
                                            height: '28px',
                                        }}
                                    >
                                        <SmartToyIcon fontSize='small' />
                                    </Avatar>
                                ),
                                user: (
                                    <Avatar
                                        sx={{
                                            width: '28px',
                                            height: '28px',
                                        }}
                                        className='cursor-pointer'
                                        onClick={() => setOpenSettingWindow('chat')}
                                    >
                                        <PersonIcon fontSize='small' />
                                    </Avatar>
                                ),
                                system:
                                        <Avatar onClick={() => setChatConfigDialogSession(sessionActions.getCurrentSession())}
                                            sx={{
                                                backgroundColor: theme.palette.warning.main,
                                                width: '28px',
                                                height: '28px',
                                            }}
                                        >
                                            <SettingsIcon fontSize='small' />
                                        </Avatar>
                            }[msg.role]
                        }
                    </Box>
                </Grid>
                <Grid item xs sm container sx={{ width: '0px', paddingRight: '15px' }}>
                    <Grid item xs>
                        {isEditing ? (
                            <TextField
                                style={{
                                    width: '100%',
                                }}
                                multiline
                                placeholder="prompt"
                                defaultValue={msg.content}
                                onChange={(e) => {
                                    msg.content = e.target.value
                                }}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        setIsEditing(false)
                                        editMsg && editMsg()
                                    }
                                }}
                                id={msg.id + 'input'}
                            />
                        ) :(
                            <Box className={cn('msg-content', { 'msg-content-small': small })} sx={
                                small ? { fontSize: theme.typography.body2.fontSize } : {}
                            }>
                                {
                                    enableMarkdownRendering && !isCollapsed ? (
                                        <Markdown>
                                            {content}
                                        </Markdown>
                                    ) : (
                                        <div>
                                            {content}
                                            {
                                                needCollapse && isCollapsed && (
                                                    CollapseButton
                                                )
                                            }
                                        </div>
                                    )
                                }
                            </Box>
                        )}
                        <MessageErrTips msg={msg} />
                        {
                            needCollapse && !isCollapsed && CollapseButton
                        }
                        <Typography variant="body2" sx={{ opacity: 0.5, paddingBottom: '2rem' }}>
                            {tips.join(', ')}
                        </Typography>
                    </Grid>
                </Grid>
            </Grid>
        </Box>
    )
}

import { useEffect, useRef } from 'react'
import Message from './Message'
import * as atoms from '../stores/atoms'
import { useAtom, useAtomValue, } from 'jotai'
import { cn } from '@/lib/utils'
import * as sessionActions from '../stores/sessionActions'
import { createMessage } from '../../shared/types'

interface Props {
    currentSessionId: string
 }

export default function MessageList(props: Props) {
    const { currentSessionId } = props
    const [currentSession, setCurrentSession] = useAtom(atoms.currentSessionAtom);
    const currentMessageList = useAtomValue(atoms.currentMessageListAtom)
    const ref = useRef<HTMLDivElement | null>(null)
    const [, setMessageListRef] = useAtom(atoms.messageListRefAtom)
    useEffect(() => {
        setMessageListRef(ref)
    }, [ref])
    // 定義刪除消息的函數
    const deleteMessage = (msgId: string) => {
        const updatedMessages = currentSession.messages.filter((m) => m.id !== msgId)
        const updatedSession = { ...currentSession, messages: updatedMessages }
        setCurrentSession(updatedSession);
    }
    const refreshMsg = (msgId: string) => {
        const msgIndex = currentSession.messages.findIndex((m) => m.id === msgId);
        if (msgIndex !== -1 && currentSession.messages[msgIndex].role === 'assistant') {
            sessionActions.generate(currentSessionId, currentSession.messages[msgIndex]);
        }
    }
    
    const editMsg = (msgId: string) => {
        const msgIndex = currentSession.messages.findIndex((m) => m.id === msgId);
        if (msgIndex !== -1 && currentSession.messages[msgIndex].role === 'user') {
            let msg = currentSession.messages[msgIndex].content;
            const updatedMessages = currentSession.messages.slice(0, msgIndex);
            const updatedSession = {
                ...currentSession,
                messages: updatedMessages
            };
            setCurrentSession(updatedSession);
            sessionActions.submitNewUserMessage({
                currentSessionId: props.currentSessionId,
                newUserMsg: createMessage('user', msg),
                needGenerating: true,
            })
        }
    }
    return (
        <div className={cn('w-full h-3/4 mx-auto')}>
            <div className='overflow-y-auto h-full pr-0 pl-0' ref={ref}>
                {
                    currentMessageList.map((msg, index) => (
                        <Message
                            id={msg.id}
                            key={'msg-' + msg.id}
                            msg={msg}
                            sessionId={currentSession.id}
                            sessionType={currentSession.type || 'chat'}
                            className={index === 0 ? 'pt-4' : ''}
                            collapseThreshold={msg.role === 'system' ? 150 : undefined}
                            delMsg={() => deleteMessage(msg.id)} 
                            refreshMsg={() => refreshMsg(msg.id)} 
                            editMsg={() => editMsg(msg.id)}
                        />
                    ))
                }
            </div>
        </div>
    )
}

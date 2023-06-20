import { CSSProperties } from "react"

import './ChatNotification.css'



interface ChatNotificationProps {
  closeChatNotification: (id: string) => void,
  id: string,
  text: string,
  classes: string[],
  style: CSSProperties,
}



function ChatNotification({ id, text, classes, style, closeChatNotification }: ChatNotificationProps) {
  return (
    <div className={['chat-notif-entry', ...classes].join(" ")} style={style}>
      <div className="chat-notif-text">{text}</div>
      <button className="chat-notif-close" onClick={() => closeChatNotification(id)}>X</button>
    </div>
  )
}

export default ChatNotification
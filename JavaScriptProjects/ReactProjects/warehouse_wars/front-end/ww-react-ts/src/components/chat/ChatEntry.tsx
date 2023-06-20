import { CSSProperties } from "react"

import './ChatEntry.css'



interface ChatEntryProps {
  token: string,
  author: string,
  html: JSX.Element,
  classes: string[],
  style: CSSProperties
}


function ChatEntry({token, author, html, classes, style}: ChatEntryProps) {
  return (
    <div className={["chat-entry", ...classes].join(" ")} style={style}>
      <div className={"chat-entry-metadata"}>
        <p>{"author: "+author}</p>
        <p>{"token: "+token}</p>
      </div>
      {html}
    </div>
  )
}

export default ChatEntry
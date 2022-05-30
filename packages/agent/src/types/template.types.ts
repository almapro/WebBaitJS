import { AgentSocket, WebRtcWebsocket } from "../sockets"

export type AgentTemplateProps = {
  title?: string
  agentSocket: AgentSocket
  redirectUrl?: string
  webRtcWebsocket?: WebRtcWebsocket
}

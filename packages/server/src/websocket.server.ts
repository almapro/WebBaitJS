import { Constructor, Context } from '@loopback/context';
import { HttpServer } from '@loopback/http-server';
import { Server, ServerOptions, Socket } from 'socket.io';
import { getWebSocketMetadata } from './decorators';
import { WebSocketControllerFactory } from './websocket-controller-factory';

const debug = require('debug')('loopback:websocket');

/* eslint-disable @typescript-eslint/no-explicit-any */
export type SockIOMiddleware = (
  socket: Socket,
  fn: (err?: any) => void,
) => void;

/**
 * A websocket server
 */
export class WebSocketServer extends Context {
  private io: Server;

  constructor(
    public readonly httpServer: HttpServer,
    private ctx: Context,
    private options?: Partial<ServerOptions>,
  ) {
    super();
    this.io = new Server(options);
  }

  /**
   * Register a sock.io middleware function
   * @param fn
   */
  use(fn: SockIOMiddleware) {
    return this.io.use(fn);
  }

  /**
   * Register a websocket controller
   * @param ControllerClass
   * @param namespace
   */
  route(ControllerClass: Constructor<any>, namespace?: string | RegExp) {
    if (namespace == null) {
      const meta = getWebSocketMetadata(ControllerClass);
      namespace = meta && meta.namespace;
    }

    const nsp = namespace ? this.io.of(namespace) : this.io;
    /* eslint-disable @typescript-eslint/no-misused-promises */
    nsp.on('connection', async socket => {
      debug(
        'Websocket connected: id=%s namespace=%s',
        socket.id,
        socket.nsp.name,
      );
      // Create a request context
      const reqCtx = this.ctx;
      // Bind websocket
      reqCtx.bind('ws.socket').to(socket);
      // Instantiate the controller instance
      await new WebSocketControllerFactory(reqCtx, ControllerClass).create(
        socket,
      );
    });
    return nsp;
  }

  /**
   * Start the websocket server
   */
  async start() {
    this.io.attach(this.httpServer.server, this.options);
  }

  /**
   * Stop the websocket server
   */
  async stop() {
    const close = new Promise<void>((resolve, __) => {
      this.io.close(() => {
        resolve();
      });
    });
    await close;
    await this.httpServer.stop();
  }
}

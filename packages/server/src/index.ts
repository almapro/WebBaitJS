import { ApplicationConfig, WebBaitServer } from './application';
import { AdminsWebSocketController, AgentsWebSocketController } from './controllers';
import { WebSocketServer } from './websocket.server';

export * from './application';

export async function main(options: ApplicationConfig = {}) {
  const app = new WebBaitServer(options);
  await app.boot();
  await app.start();
  // Mount websocket server
  if (app.restServer.httpServer) {
    app.wsServer = new WebSocketServer(app.restServer.httpServer, app, { transports: ['websocket'] });
    // app.bind('servers.websocket.server1').to(app.wsServer);
    app.wsServer.use((socket, next) => {
      console.log('Global middleware - socket:', socket.id);
      next();
    });
    // Add a route
    const ns = app.wsServer.route(AgentsWebSocketController, '/agents/ws');
    ns.use((socket, next) => {
      console.log(
        'Middleware for namespace %s - socket: %s',
        socket.nsp.name,
        socket.id,
      );
      next();
    });
    const ans = app.wsServer.route(AdminsWebSocketController, '/admins');
    ans.use((socket, next) => {
      console.log(
        'Middleware for namespace %s - socket: %s',
        socket.nsp.name,
        socket.id,
      );
      next();
    });
    await app.wsServer.start();
  }

  const url = app.restServer.url;
  console.log(`Server is running at ${url}`);
  console.log(`Try ${url}/ping`);

  return app;
}

if (require.main === module) {
  // Run the application
  const config = {
    rest: {
      port: +(process.env.PORT ?? 3000),
      host: process.env.HOST,
      // The `gracePeriodForClose` provides a graceful close for http/https
      // servers with keep-alive clients. The default value is `Infinity`
      // (don't force-close). If you want to immediately destroy all sockets
      // upon stop, set its value to `0`.
      // See https://www.npmjs.com/package/stoppable
      gracePeriodForClose: 5000, // 5 seconds
      openApiSpec: {
        // useful when used with OpenAPI-to-GraphQL to locate your application
        setServersFromRequest: true,
      },
    },
  };
  main(config).catch(err => {
    console.error('Cannot start the application.', err);
    process.exit(1);
  });
}

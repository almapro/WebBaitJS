import { BootMixin } from '@loopback/boot';
import { ApplicationConfig } from '@loopback/core';
import {
  RestExplorerBindings,
  RestExplorerComponent,
} from '@loopback/rest-explorer';
import { RepositoryMixin } from '@loopback/repository';
import { RestApplication } from '@loopback/rest';
import { ServiceMixin } from '@loopback/service-proxy';
import path from 'path';
import { MySequence } from './sequence';
import { AuthenticationComponent } from '@loopback/authentication';
import {
  JWTAuthenticationComponent,
  TokenServiceBindings,
  UserServiceBindings,
} from '@loopback/authentication-jwt';
import { DbDataSource } from './datasources';
import { JwtService, PasswordHasherBindings, PasswordHasherService, UserAuthenticationService } from './services';
import { AuthorizationBindings, AuthorizationComponent, AuthorizationDecision, AuthorizationOptions, AuthorizationTags } from '@loopback/authorization';
import { AdminAuthorizationProvider, AdminAuthorizationProviderBindings } from './authorizers';
import { WebSocketServer } from './websocket.server';
import { Subject } from 'rxjs';
import { AgentCmdReceived, AgentCommand, AgentCommandResult, AgentConnection } from './controllers';

export { ApplicationConfig };

export class WebBaitServer extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  wsServer: WebSocketServer;
  constructor(options: ApplicationConfig = {}) {
    super(options);

    // Set up the custom sequence
    this.sequence(MySequence);

    // Set up default home page
    this.static('/', path.join(__dirname, '../public'));

    // Customize @loopback/rest-explorer configuration here
    this.configure(RestExplorerBindings.COMPONENT).to({
      path: '/explorer',
    });
    this.component(RestExplorerComponent);

    this.projectRoot = __dirname;
    // Customize @loopback/boot Booter Conventions here
    this.bootOptions = {
      controllers: {
        // Customize ControllerBooter Conventions here
        dirs: ['controllers'],
        extensions: ['.controller.js'],
        nested: true,
      },
    };
    // Mount authentication system
    this.component(AuthenticationComponent);
    // Mount jwt component
    this.component(JWTAuthenticationComponent);
    // Bind datasource
    this.dataSource(DbDataSource, UserServiceBindings.DATASOURCE_NAME);
    this.bind(UserServiceBindings.USER_SERVICE.toString()).toClass(UserAuthenticationService);
    this.bind(PasswordHasherBindings.SERVICE).toClass(PasswordHasherService);
    this.bind(TokenServiceBindings.TOKEN_SERVICE.key).toClass(JwtService);
    // Authorization
    const authorizationOptions: AuthorizationOptions = {
      precedence: AuthorizationDecision.DENY,
      defaultDecision: AuthorizationDecision.ALLOW,
    };
    this.configure(AuthorizationBindings.COMPONENT).to(authorizationOptions);
    this.component(AuthorizationComponent);
    this.bind(AdminAuthorizationProviderBindings.AUTHORIZER).toProvider(AdminAuthorizationProvider).tag(AuthorizationTags.AUTHORIZER);
    this.bind('rxjs.agent-connection').to(new Subject<AgentConnection>());
    this.bind('rxjs.agent-commands').to(new Subject<AgentCommand>());
    this.bind('rxjs.agent-command-received').to(new Subject<AgentCmdReceived>());
    this.bind('rxjs.agent-command-results').to(new Subject<AgentCommandResult>());
  }
}

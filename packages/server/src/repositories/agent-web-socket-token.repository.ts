import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {AgentWebSocketToken, AgentWebSocketTokenRelations} from '../models';

export class AgentWebSocketTokenRepository extends DefaultCrudRepository<
  AgentWebSocketToken,
  typeof AgentWebSocketToken.prototype.id,
  AgentWebSocketTokenRelations
> {
  constructor(
    @inject('datasources.Db') dataSource: DbDataSource,
  ) {
    super(AgentWebSocketToken, dataSource);
  }
}

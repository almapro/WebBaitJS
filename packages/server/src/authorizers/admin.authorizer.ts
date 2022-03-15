import { AuthorizationContext, AuthorizationDecision, AuthorizationMetadata, Authorizer } from "@loopback/authorization";
import { BindingKey, Provider } from "@loopback/core";
import { repository } from "@loopback/repository";
import _ from "lodash";
import { UserRepository } from "../repositories";

export const AdminAuthorizationProviderBindings = {
  AUTHORIZER: BindingKey.create('authorizers.admin-authorizer')
};

export class AdminAuthorizationProvider implements Provider<Authorizer> {
  constructor(
    @repository(UserRepository) private userRepository: UserRepository,
  ) { }
  /**
   * @returns an authorizer function
   *
   */
  value(): Authorizer {
    return this.authorize.bind(this);
  }

  async authorize(
    context: AuthorizationContext,
    __: AuthorizationMetadata,
  ) {
    if (
      context.resource === 'UserController.prototype.signUp'
    ) {
      const foundUser = await this.userRepository.findOne();
      if (!foundUser) return AuthorizationDecision.ALLOW;
      return AuthorizationDecision.DENY;
    }
    return AuthorizationDecision.ABSTAIN;
  }
}

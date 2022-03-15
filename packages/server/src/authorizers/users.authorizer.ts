import { AuthorizationDecision, AuthorizationMetadata, Authorizer } from "@loopback/authorization";
import { securityId } from "@loopback/security";
import _ from "lodash";

export const checkSelfAction: Authorizer<AuthorizationMetadata> = async (ctx, __) => (ctx.principals[0][securityId] === ctx.invocationContext.args[0].toString()) ? AuthorizationDecision.ALLOW : AuthorizationDecision.DENY;

export const checkSelfOrHigherPrivilegeAction: Authorizer<AuthorizationMetadata> = async (ctx, __) => {
  if (ctx.principals[0][securityId] === ctx.invocationContext.args[0] || ctx.principals[0].role.name === 'admin') return AuthorizationDecision.ALLOW;
  return AuthorizationDecision.ABSTAIN;
}

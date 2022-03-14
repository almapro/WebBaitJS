import { injectable, BindingScope, BindingKey } from '@loopback/core';
import { hashSync, compareSync } from 'bcryptjs';

export namespace PasswordHasherBindings {
  export const SERVICE = BindingKey.create<PasswordHasherService>('services.password-hasher');
}

@injectable({ scope: BindingScope.TRANSIENT })
export class PasswordHasherService {
  constructor() { }

  hash = async (pass: string) => {
    return hashSync(pass);
  }
  verify = async (pass: string, hash: string) => {
    return compareSync(pass, hash);
  }
}

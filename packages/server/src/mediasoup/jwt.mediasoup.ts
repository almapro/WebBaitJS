import { promisify } from 'util';

const jwt = require('jsonwebtoken');
const signAsync = promisify(jwt.sign);
const verifyAsync = promisify(jwt.verify);

export type MediasoupJwtPayload = {
  roomId: string;
  admin: boolean;
  peerId?: string;
}

export class MediasoupJWT {
  constructor(
    private secret: string,
    private expiresIn: string,
  ) { }
  verifyToken = (token: string): Promise<MediasoupJwtPayload> => verifyAsync(token, this.secret);
  generateToken = (payload: MediasoupJwtPayload): Promise<string> => signAsync(payload, this.secret, { expiresIn: Number(this.expiresIn) });
}

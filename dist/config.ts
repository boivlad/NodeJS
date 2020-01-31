export type tokenConfig = {
  type: string,
  expiresIn: string
}

export class JWTConfig {
  readonly secret: string = 'SecretKeyForAuth';
  readonly access: tokenConfig = {
    type: 'access',
    expiresIn: '2m',
  };

  readonly refresh: tokenConfig = {
    type: 'refresh',
    expiresIn: '3m',
  };
}
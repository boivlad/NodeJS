export const config: any = {
  appPort: 3000,
  mongoUri: 'mongodb://localhost:27017/nodejs',
  jwt: {
    secret: 'SecretKeyForAuth',
    tokens: {
      access: {
        type: 'access',
        expiresIn: '2m',
      },

      refresh: {
        type: 'refresh',
        expiresIn: '3m',
      },
    },
  },
};
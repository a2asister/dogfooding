export const config = {
  port: 8765,
  jwt: {
    secret: 'university-portal-secret-key-2024',
    expiresIn: '30m',
  },
  database: {
    path: './data/university.db',
  },
  session: {
    timeout: 30 * 60 * 1000,
  },
};

import 'dotenv/config';

export default {
  api_url: `http://localhost:${process.env.PORT || 3001}/api`,
  app_name: 'Bookshelfd',
  log_level: process.env.LOG_LEVEL || 'info',

  port: process.env.PORT || '3001',
  database_url: process.env.DATABASE_URL || 'file:./dev.db',
  node_env: process.env.NODE_ENV || 'development',
  access_token_secret: process.env.ACCESS_TOKEN_SECRET || 'im_insecure',
  refresh_token_secret: process.env.REFRESH_TOKEN_SECRET || 'im_insecure',
};

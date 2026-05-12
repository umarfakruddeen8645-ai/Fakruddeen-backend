require('dotenv').config();

module.exports = {
  db: {
    user: process.env.POSTGRES_USER,
    host: process.env.DB_HOST || 'localhost',   // yanzu zai karɓi DB_HOST daga env
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD,
    port: process.env.DB_PORT || 5432,
  },
  jwtSecret: process.env.JWT_SECRET
};

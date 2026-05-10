require('dotenv').config();

module.exports = {
  db: {
    user: process.env.POSTGRES_USER,
    host: 'localhost',
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD,
    port: 5432,
  },
  jwtSecret: process.env.JWT_SECRET
};

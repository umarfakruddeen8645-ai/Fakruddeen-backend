const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    require: true,              // Render PostgreSQL yana buƙatar SSL
    rejectUnauthorized: false   // certificates ba su da CA
  },
  keepAlive: true,              // hana katsewa
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 10000
});

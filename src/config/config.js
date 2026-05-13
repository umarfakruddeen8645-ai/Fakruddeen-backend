const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    require: true,
    rejectUnauthorized: false
  },
  keepAlive: true,
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 10000
});

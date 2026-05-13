const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.DB_HOST,
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: process.env.DB_PORT || 5432,
  ssl: {
    require: true,              // tabbatar da SSL
    rejectUnauthorized: false   // Render certificates ba su da CA
  },
  keepAlive: true,              // hana katsewa
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 10000
});

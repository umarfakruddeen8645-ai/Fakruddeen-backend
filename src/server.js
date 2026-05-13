require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const multer = require('multer');
const logger = require('./services/logger');

const usersRouter = require('./routes/users');
const tasksRouter = require('./routes/tasks');
const troubleshootRouter = require('./routes/troubleshoot');
const securityRouter = require('./routes/security');
const aiRouter = require('./routes/ai');

const app = express();
app.use(bodyParser.json());

// Morgan logging
app.use(morgan('combined', {
  stream: { write: (message) => logger.info(message.trim()) }
}));

// CORS
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['https://fakruddeen-backend-roip.onrender.com'],
  methods: ['GET','POST','PUT','DELETE'],
  credentials: true
}));

// Multer uploads
const upload = multer({ dest: 'uploads/' });

// Root route
app.get("/", (req, res) => {
  logger.info("Root endpoint accessed");
  res.send("Fakruddeen backend is live 🚀");
});

// Routers
app.use('/', usersRouter);
app.use('/', tasksRouter);
app.use('/', troubleshootRouter);
app.use('/', securityRouter);
app.use('/', aiRouter);

// Error handling
app.use((err, req, res, next) => {
  logger.error("Unhandled error: %o", err);
  res.status(500).json({ error: "Internal server error" });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`Fakruddeen backend running on port ${PORT}`);
});

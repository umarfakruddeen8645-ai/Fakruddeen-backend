const express = require('express');
const router = express.Router();
const { runDiagnostics } = require('../server/troubleshooting');

router.post('/troubleshoot', (req, res) => {
  const report = runDiagnostics(req.body.deviceInfo);
  res.json(report);
});

module.exports = router;

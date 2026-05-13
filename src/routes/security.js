const express = require('express');
const router = express.Router();
const { encryptData, decryptData, detectAnomaly, aiAnomalyDetection } = require('../services/security');

router.post('/security-check', (req, res) => {
  const anomalies = aiAnomalyDetection(req.body.requestData);
  res.json({ anomalies });
});

router.post('/encrypt', (req, res) => {
  const { data, secretKey } = req.body;
  const encrypted = encryptData(data, secretKey);
  res.json(encrypted);
});

router.post('/decrypt', (req, res) => {
  const { encryptedData, secretKey } = req.body;
  const decrypted = decryptData(encryptedData, secretKey);
  res.json({ decrypted });
});

module.exports = router;

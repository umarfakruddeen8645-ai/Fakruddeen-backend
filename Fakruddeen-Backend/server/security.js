// server/security.js
const crypto = require('crypto');

// Encrypt data
function encryptData(data, secretKey) {
  const cipher = crypto.createCipher('aes-256-cbc', secretKey);
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

// Decrypt data
function decryptData(encrypted, secretKey) {
  const decipher = crypto.createDecipher('aes-256-cbc', secretKey);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// Intrusion detection (basic anomaly detection)
function detectAnomaly(logs) {
  let anomalies = [];
  logs.forEach(log => {
    if (log.action === "failed_login" && log.count > 5) {
      anomalies.push("Multiple failed login attempts detected");
    }
    if (log.action === "suspicious_request") {
      anomalies.push("Suspicious request pattern detected");
    }
  });
  return anomalies;
}

// AI anomaly detection (simple heuristic)
function aiAnomalyDetection(requestData) {
  if (requestData.requestsPerSecond > 100) {
    return "Possible DDoS attack detected";
  }
  if (requestData.dataSize > 1000000) {
    return "Unusually large data transfer detected";
  }
  return "Normal activity";
}

module.exports = { encryptData, decryptData, detectAnomaly, aiAnomalyDetection };

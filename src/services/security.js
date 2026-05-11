const crypto = require('crypto');

// Encrypt data
function encryptData(data, secretKey) {
  const iv = crypto.randomBytes(16);
  const key = crypto.createHash('sha256').update(secretKey).digest();
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return { iv: iv.toString('hex'), encrypted };
}

// Decrypt data
function decryptData(encryptedData, secretKey) {
  const iv = Buffer.from(encryptedData.iv, 'hex');
  const key = crypto.createHash('sha256').update(secretKey).digest();
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
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

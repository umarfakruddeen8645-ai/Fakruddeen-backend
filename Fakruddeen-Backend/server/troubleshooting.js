// server/troubleshooting.js
const fs = require('fs');

function runDiagnostics(deviceInfo) {
  let report = {
    status: "ok",
    issues: [],
    recommendations: []
  };

  if (!deviceInfo.cpu || deviceInfo.cpu < 2) {
    report.status = "warning";
    report.issues.push("Low CPU power");
    report.recommendations.push("Upgrade CPU or optimize processes");
  }

  if (deviceInfo.memory < 4) {
    report.status = "warning";
    report.issues.push("Low RAM");
    report.recommendations.push("Close unused apps or upgrade RAM");
  }

  if (!deviceInfo.network || deviceInfo.network === "disconnected") {
    report.status = "error";
    report.issues.push("No internet connection");
    report.recommendations.push("Check router or reconnect to network");
  }

  fs.writeFileSync('./logs/diagnostics.json', JSON.stringify(report, null, 2));
  return report;
}

module.exports = { runDiagnostics };

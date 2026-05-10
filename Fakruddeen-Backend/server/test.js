// server/test.js
const axios = require('axios');

async function runTests() {
  try {
    // Test user creation
    let user = await axios.post('http://localhost:3000/users', {
      name: "Test User",
      email: "test@example.com",
      password: "password123"
    });
    console.log("User created:", user.data);

    // Test task creation
    let task = await axios.post('http://localhost:3000/tasks', {
      title: "First Task",
      description: "Testing Fakruddeen backend",
      status: "pending"
    });
    console.log("Task created:", task.data);

    // Test troubleshooting
    let diagnostics = await axios.post('http://localhost:3000/troubleshoot', {
      deviceInfo: { cpu: 1, memory: 2, network: "disconnected" }
    });
    console.log("Diagnostics:", diagnostics.data);

    // Test security check
    let security = await axios.post('http://localhost:3000/security-check', {
      requestData: { requestsPerSecond: 200, dataSize: 500 }
    });
    console.log("Security check:", security.data);

  } catch (error) {
    console.error("Test failed:", error.message);
  }
}

runTests();

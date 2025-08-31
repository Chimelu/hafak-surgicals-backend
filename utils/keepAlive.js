const cron = require('node-cron');
const https = require('https');
const http = require('http');

// Function to ping the server
const pingServer = () => {
  const url = process.env.RENDER_EXTERNAL_URL || `http://localhost:${process.env.PORT || 5000}`;
  const protocol = url.startsWith('https') ? https : http;
  
  console.log(`🔄 Pinging server at: ${url}/api/health`);
  
  protocol.get(`${url}/api/health`, (res) => {
    console.log(`✅ Server ping successful - Status: ${res.statusCode}`);
  }).on('error', (err) => {
    console.log(`❌ Server ping failed: ${err.message}`);
  });
};

// Initialize keep-alive cron job
const initKeepAlive = () => {
  // Run every 14 minutes to keep Render from sleeping
  // Render free tier sleeps after 15 minutes of inactivity
  cron.schedule('*/14 * * * *', () => {
    pingServer();
  }, {
    scheduled: true,
    timezone: "UTC"
  });
  
  console.log('🕐 Keep-alive cron job initialized - pinging every 14 minutes');
  
  // Also ping immediately when server starts
  setTimeout(() => {
    pingServer();
  }, 5000); // Wait 5 seconds after server starts
};

module.exports = { initKeepAlive, pingServer };

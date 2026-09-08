const app = require('./app');
const { testConnection } = require('./config/db');

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`=================================`);
  console.log(`Server running on port ${PORT}`);
  console.log(`Health Check: http://localhost:${PORT}/api/health`);
  console.log(`=================================`);

  const dbOk = await testConnection();
  if (dbOk) {
    console.log('MySQL Database status: CONNECTED');
  } else {
    console.warn('MySQL Database status: DISCONNECTED (Check your .env settings)');
  }
});

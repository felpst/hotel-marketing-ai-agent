import app from './app';

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('API endpoints:');
  console.log(`- POST /api/campaign/generate - Generate a new marketing campaign`);
  console.log(`- POST /api/campaign/optimize - Optimize an existing campaign`);
  console.log(`- GET /health - Health check endpoint`);
}); 
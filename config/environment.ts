const ENV = {
  development: {
    apiUrl: 'http://localhost:3000',
  },
  production: {
    apiUrl: 'https://icas-asl-backend-e5703a4c3200.herokuapp.com', // Replace with your actual production server URL
  },
};

const getEnvVars = () => {
  // Check if we're running in development or production
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Return the appropriate environment variables
  return ENV.production;
};

export default getEnvVars; 
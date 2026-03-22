const cors = require('cors');

const getOrigins = () => {
  const origins = ['http://localhost:3000', 'http://localhost:5173'];
  if (process.env.CLIENT_URL) {
    process.env.CLIENT_URL.split(',').forEach(o => origins.push(o.trim()));
  }
  return origins;
};

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin || getOrigins().includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: origin ${origin} not allowed`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200,
};

module.exports = cors(corsOptions);
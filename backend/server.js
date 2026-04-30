const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

const allowedOrigins = ['http://localhost:5173', 'http://localhost:3000', 'https://electricity-billing-system-4kubld9ff.vercel.app'];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth',            require('./routes/authRoutes'));
app.use('/api/customers',       require('./routes/customerRoutes'));
app.use('/api/bills',           require('./routes/billRoutes'));
app.use('/api/readings',        require('./routes/readingRoutes'));
app.use('/api/tariffs',         require('./routes/tariffRoutes'));
app.use('/api/reports',         require('./routes/reportRoutes'));
app.use('/api/dashboard',       require('./routes/dashboardRoutes'));
app.use('/api/customer',        require('./routes/customerPortalRoutes'));
app.use('/api/registrations',   require('./routes/registrationRoutes'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'OK', timestamp: new Date() }));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`⚡ Server running on port ${PORT}`));

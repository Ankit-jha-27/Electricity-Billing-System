const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/api/auth',      require('./routes/authRoutes'));
app.use('/api/customers', require('./routes/customerRoutes'));
app.use('/api/bills',     require('./routes/billRoutes'));
app.use('/api/readings',  require('./routes/readingRoutes'));
app.use('/api/tariffs',   require('./routes/tariffRoutes'));
app.use('/api/reports',   require('./routes/reportRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));


app.get('/', (req, res) => res.json("SERVER RUNNING"));
app.get('/api/health', (req, res) => res.json({ status: 'OK', timestamp: new Date() }));


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
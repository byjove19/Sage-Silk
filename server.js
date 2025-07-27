require('dotenv').config();

const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const jwt = require('jsonwebtoken');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const passport = require('passport');
const { OpenAI } = require('openai');
const flash = require('connect-flash');

// Database and Models
const db = require('./database');
const Product = require('./models/products');

// Routes
const adminRoutes = require('./routes/adminRoutes');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const categoryRoutes = require('./routes/categoryRoutes');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Validate required environment variables
const requiredEnvVars = ['JWT_SECRET', 'SESSION_SECRET', 'REFRESH_SECRET'];
requiredEnvVars.forEach(envVar => {
  if (!process.env[envVar]) {
    console.error(`ERROR: Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
});

// Initialize OpenAI only if API key exists
const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) 
  : null;

// Middleware Configuration
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(flash());

// Security Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || true,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000
  }
}));
app.use(passport.initialize());
app.use(passport.session());

// JWT Authentication Middleware
app.use((req, res, next) => {
  const token = req.cookies.sagesilkapp;
  if (token) {
    try {
      req.user = jwt.verify(token, process.env.JWT_SECRET);
      res.locals.user = req.user;
    } catch (error) {
      console.error('JWT Verification Failed:', error);
      res.clearCookie('sagesilkapp');
      return res.status(401).json({ error: 'Invalid token' });
    }
  }
  next();
});

// WebSocket Chatbot
if (openai) {
  io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('user message', async (msg) => {
      try {
        const response = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [
            { 
              role: 'system', 
              content: 'You are a helpful assistant for an online clothing store called Sage and Silk.' 
            },
            { role: 'user', content: msg },
          ],
        });
        socket.emit('bot message', response.choices[0].message.content);
      } catch (error) {
        console.error('OpenAI Error:', error);
        socket.emit('bot message', "Sorry, I'm having trouble responding right now.");
      }
    });

    socket.on('disconnect', () => console.log('User disconnected'));
  });
} else {
  console.warn('OpenAI integration disabled - missing API key');
}
// Logging Middleware
app.use((req, res, next) => {
  console.log(`Incoming: ${req.method} ${req.url}`);
  next();
});
// Route Configuration
app.use('/', authRoutes);
app.use('/cart', cartRoutes);
app.use('/products', productRoutes);
app.use('/', categoryRoutes); 
app.use('/admin', adminRoutes);

// Static Pages
app.get('/', (req, res) => res.render('index', { user: req.user }));
app.get('/welcome', (req, res) => res.render('welcome', { username: req.user?.username }));
app.get('/about', (req, res) => res.render('about'));
app.get('/contact', (req, res) => res.render('contact'));
app.get('/wishlist', (req, res) => res.render('wishlist'));
app.get('/checkout', (req, res) => res.render('checkout', { cartItems: req.session.cart || [] }));
app.get('/404', (req, res) => res.render('404'));

// Tracking Route
app.get('/tracking', (req, res) => {
  const { trackingId, address } = req.query;
  const trackingInfo = trackingId === '12345'
    ? {
        id: '12345',
        status: 'Shipped',
        estimatedDelivery: '2024-11-25',
        carrier: 'FedEx',
        shippingAddress: address || 'Not Provided',
      }
    : null;
  res.render('tracking-id', { trackingInfo });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('500');
});

// 404 Handlers
app.use((req, res) => {
  res.status(404).render('404', { 
    user: req.user || null,
    message: 'Page not found'

  });
});

// Start Server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const orderRoutes = require('./src/orderlist/orderlist'); // Import order routes
const bookingRoutes = require('./src/booking/booking'); // Import booking routes
const menuRoutes = require('./src/menu/menu');
const categoryRoutes = require('./src/category/category');
const authRoutes = require('./src/auth/auth').router; // Import admin authentication routes
const { authMiddleware } = require('./src/auth/auth'); // Import middleware for protecting routes
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const { io: ClientIO } = require('socket.io-client');
const http = require('http');
const { Server } = require('socket.io');

// Load environment variables from .env file
dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3001", // Next.js client
      "http://localhost:3000", // React admin client
      // ...other allowed origins
    ],
    methods: ["GET", "POST"],
    credentials: true
  }
});

io.on('connection', (socket) => {
  console.log('Frontend or Next.js client connected:', socket.id);

  // Listen for new-online-booking from Next.js
  socket.on('new-online-booking', (reservation) => {
    console.log('Received new-online-booking from Next.js:', reservation);

    // Broadcast to all connected React clients
    io.emit('newBookingReceived', reservation);
  });

  // (Optional) Listen for other events as needed
});

// Swagger setup
const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'Order Management API',
            description: 'API documentation for Order Management',
            version: '1.0.0',
        },
        servers: [
            {
                url: `http://localhost:${process.env.PORT || 8080}`, // The base URL
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT', // JWT format
                },
            },
        },
        security: [
            {
                bearerAuth: [], // Apply Bearer Token globally
            },
        ],
    },
    apis: ['./src/orderlist/orderlist.js', './src/booking/booking.js','./src/menu/menu.js','./src/auth/auth.js','./src/category/category.js'],
};

// Initialize Swagger JSDoc
const swaggerDocs = swaggerJsdoc(swaggerOptions);

// Serve Swagger UI at /api-docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Redirect root to Swagger UI automatically
app.get('/', (req, res) => {
    res.redirect('/api-docs'); // Redirect to Swagger UI
});

// Middleware
app.use(express.json()); // Middleware to parse JSON request bodies
// app.use(cors()); // Middleware to enable CORS
app.use(cors
    ({
    origin: function (origin, callback) {
        const allowedOrigins = [
            'https://admindashboard.indiantadka.eu',
            'http://localhost:3000',
            'http://localhost:3001',
            'https://testing.indiantadka.eu',
            'https://theindiantadka.vercel.app',
        ];
        
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true  // Enable credentials if using cookies or authentication
}));

// Mount the routes for orders and bookings with the /api prefix
app.use('/api', orderRoutes); // All routes in orderRoutes will be prefixed with /api
app.use('/api', bookingRoutes); // All routes in bookingRoutes will be prefixed with /api
app.use('/api', menuRoutes); // All routes in bookingRoutes will be prefixed with /api
app.use('/api',categoryRoutes);
app.use('/api/auth', authRoutes); // Admin authentication routes

app.use('/api/secure', authMiddleware, (req, res) => {
    res.json({ message: "Access granted to secure route" });
});

// MongoDB connection using Mongoose
mongoose.connect(process.env.MONGODB_URI, {
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
})
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((error) => {
        console.error('Error connecting to MongoDB:', error);
    });

// Start the server
const port = process.env.PORT || 8080;
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

// // Replace with your Next.js server's Socket.IO URL
// const NEXTJS_SOCKET_URL = 'http://localhost:3001'; // or your deployed Next.js server

// // Connect as a client to the Next.js server
// const nextSocket = ClientIO(NEXTJS_SOCKET_URL, {
//   transports: ['websocket'],
//   reconnection: true,
// });

// nextSocket.on('connect', () => {
//   console.log('Connected to Next.js Socket.IO server as client');
// });

// // Listen for reservation:new event from Next.js
// nextSocket.on('reservation:new', (reservation) => {
//   console.log('Received reservation:new from Next.js:', reservation);
//   io.emit('newBookingReceived', reservation);
// });

// // (Optional) Listen for other events as needed
// nextSocket.on('booking-status-updated', (reservation) => {
//   io.emit('bookingStatusUpdated', reservation);
// });

// nextSocket.on('disconnect', () => {
//   console.log('Disconnected from Next.js Socket.IO server');
// });

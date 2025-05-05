require("dotenv").config();
const { OpenAI } = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const jwt = require("jsonwebtoken");  
const http = require("http");
const socketIo = require("socket.io");
const bodyParser = require("body-parser"); 
const db = require("./database");
const cors = require('cors');
const Product = require('./models/products');

// Routes
const adminRoutes = require("./routes/adminRoutes");
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");


const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Middleware
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: process.env.SESSION_SECRET || "defaultsecret",
    resave: false,
    saveUninitialized: true,
}));
app.use(cors());
// JWT Authentication Middleware
app.use((req, res, next) => {
    const token = req.cookies.sagesilkapp;
    if (token) {
        try {
            req.user = jwt.verify(token, process.env.JWTSECRET || "defaultjwtsecret");
        } catch (error) {
            console.error("JWT Verification Failed:", error);
            res.clearCookie("sagesilkapp");
            req.user = null;
        }
    } else {
        req.user = null;
    }
    res.locals.user = req.user; 
    next();
});

// Simple Chatbot Responses
io.on("connection", (socket) => {
    console.log("A user connected");

    socket.on("user message", async (msg) => {
        console.log("User:", msg);

        try {
            const response = await openai.chat.completions.create({
                model: "gpt-3.5-turbo", // or "gpt-4" if you have access
                messages: [
                    { role: "system", content: "You are a helpful assistant for an online clothing store called Sage and Silk." },
                    { role: "user", content: msg }
                ],
            });

            const botReply = response.choices[0].message.content;
            socket.emit("bot message", botReply);
        } catch (error) {
            console.error("OpenAI API Error:", error);
            socket.emit("bot message", "Sorry, I'm having trouble responding right now.");
        }
    });

    socket.on("disconnect", () => {
        console.log("User disconnected");
    });
});


// Routes
app.use(authRoutes);
app.use(cartRoutes);
app.use("/products", productRoutes);
app.use(adminRoutes);

// Static Page Routes
app.get("/", (req, res) => res.render("index", { user: req.user }));
app.get("/welcome", (req, res) => res.render("welcome", { username: req.user?.username }));
app.get("/about", (req, res) => res.render("about"));
app.get("/contact", (req, res) => res.render("contact"));
app.get("/wishlist", (req, res) => res.render("wishlist"));
app.get("/wishlist/:id", (req, res) => res.render("wishlist", { productId: req.params.id }));
app.get("/checkout", (req, res) => res.render("checkout", { cartItems: req.session.cart || [] }));
app.get("/tracking.ejs", (req, res) => {
    const { trackingId, address } = req.query;
    const trackingInfo = trackingId === "12345" ? {
        id: "12345",
        status: "Shipped",
        estimatedDelivery: "2024-11-25",
        carrier: "FedEx",
        shippingAddress: address || "Not Provided"
    } : null;
    res.render("tracking-id", { trackingInfo });
});
app.get("/products", async (req, res) => {
    try {
      const products = await Product.find();
      res.render("product", { products });
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  });
  app.get('/product/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).send('Product not found');
        res.render('product-accordion', { product }); 
    } catch (err) {
        res.status(500).send('Server error');
    }
});

  

app.get("/product-layout", (req, res) => res.render("product-layout"));
app.get("/women", (req, res) => res.render("women"));
  
  app.get("/women/:subcategory", (req, res) => {
    const subcategory = req.params.subcategory;
    const validSubcategories = ["bags", "jumpsuits", "makeup","blouses-tops", "dinner-gowns", "footwears","Jackets", "Jumpsuits", "makeup", "skin-care", "skirts-pants", "two-pieces", "wigs", "jeans"
    ]; 
  
    if (!validSubcategories.includes(subcategory)) {
      return res.status(404).render("404"); // optional: custom 404 page
    }
  
    res.render(`women/${subcategory}`); 
  });
  



// Start Server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
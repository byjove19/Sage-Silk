require("dotenv").config();
const { OpenAI } = require("openai");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const jwt = require("jsonwebtoken");
const http = require("http");
const socketIo = require("socket.io");
const bodyParser = require("body-parser");
const cors = require("cors");
const passport = require('passport');

const db = require("./database");
const Product = require("./models/products");

// Routes
const adminRoutes = require("./routes/adminRoutes");
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");

const categoryRoutes = require("./routes/categoryRoutes");

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
app.use(
  session({
    secret: process.env.SESSION_SECRET || "defaultsecret",
    resave: false,
    saveUninitialized: true,
  })
);
app.use(cors());
app.use(passport.initialize());
app.use(passport.session());
// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "your-openai-api-key",
});     

// JWT Auth Middleware
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

// Simple Chatbot
io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("user message", async (msg) => {
    console.log("User:", msg);

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a helpful assistant for an online clothing store called Sage and Silk." },
          { role: "user", content: msg },
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
app.use("/", categoryRoutes);

app.use(adminRoutes);

// Static Pages
app.get("/", (req, res) => res.render("index", { user: req.user }));
app.get("/welcome", (req, res) => res.render("welcome", { username: req.user?.username }));
app.get("/about", (req, res) => res.render("about"));
app.get("/contact", (req, res) => res.render("contact"));
app.get("/wishlist", (req, res) => res.render("wishlist"));
app.get("/wishlist/:id", (req, res) => res.render("wishlist", { productId: req.params.id }));
app.get("/checkout", (req, res) => res.render("checkout", { cartItems: req.session.cart || [] }));
app.get("/product-layout", (req, res) => res.render("product-layout"));
app.get("/women", (req, res) => res.render("women"));
app.get("/men", (req, res) => res.render("men"));
app.get("/404", (req, res) => res.render("404"));
app.get("/tracking.ejs", (req, res) => {
  const { trackingId, address } = req.query;
  const trackingInfo =
    trackingId === "12345"
      ? {
          id: "12345",
          status: "Shipped",
          estimatedDelivery: "2024-11-25",
          carrier: "FedEx",
          shippingAddress: address || "Not Provided",
        }
      : null;
  res.render("tracking-id", { trackingInfo });
});

// Get all products
app.get("/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.render("product", { products });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// ✅ New route using slug
app.get("/product/:slug", async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug });
    if (!product) return res.status(404).render("404");
    res.render("product-accordion", { product });
  } catch (err) {
    res.status(500).send("Server error");
  }
});

// Show multiple products in accordion view
app.get("/product-accordion", async (req, res) => {
  try {
    const products = await Product.find({});
    res.render("product-accordion", { products });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// Women category with subcategories
app.get("/women/:subcategory", (req, res) => {
  const subcategory = req.params.subcategory;
  const validSubcategories = [
    "bags",
    "jumpsuits",
    "makeup",
    "blouses-tops",
    "dinner-gowns",
    "footwears",
    "Jackets",
    "Jumpsuits",
    "makeup",
    "skin-care",
    "skirts-pants",
    "two-pieces",
    "wigs",
    "jeans",
    "dresses-and-gowns",
  ];

  if (!validSubcategories.includes(subcategory)) {
    return res.status(404).render("404");
  }

  res.render(`women/${subcategory}`);
});

app.get("/women/dresses-and-gowns", async (req, res) => {
  try {
    const products = await Product.find({
      category: "Women",
      subcategory: "dresses-and-gowns"
    });
    res.render("women/dresses-and-gowns", { products, user: req.user });
  } catch (err) {
    console.error("Error fetching dresses:", err);
    res.status(500).render("500");
  }
});



// Start Server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

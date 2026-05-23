require("dotenv").config();
const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const Blog = require("./models/blog");

const trendingRoute = require("./routes/trending");
const searchRoute = require("./routes/search");
const userRoute = require("./routes/user");
const blogRoute = require("./routes/blog");
const bookmarkRoute = require("./routes/bookmark");

const { checkForAuthenticationCookie } = require("./middlewares/authentication");

const app = express();

// =====================================
// ✅ PORT for Localhost
// =====================================
const PORT = process.env.PORT || 8000;

// =====================================
// ✅ Local MongoDB Connection Only
// =====================================
const MONGO_URI = process.env.MONGO_URI;

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ Local MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// =====================================
// ✅ Middleware
// =====================================
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());
app.use(checkForAuthenticationCookie("token"));

// =====================================
// ✅ Static Files
// =====================================
app.use(express.static(path.resolve("./public")));

// =====================================
// ✅ Make User Global in Views
// =====================================
app.use((req, res, next) => {
  res.locals.user = req.user || null;
  res.locals.error = null;
  next();
});

// =====================================
// ✅ EJS Setup
// =====================================
app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

// =====================================
// ⭐ HOME ROUTE WITH CATEGORY FILTER ⭐
// =====================================
app.get("/", async (req, res) => {
  const category = req.query.category;

  const filter = category ? { category } : {};

  const allBlogs = await Blog.find(filter)
    .populate("createdBy", "fullname profileImageURL")
    .sort({ createdAt: -1 });

  res.render("home", {
    user: req.user || null,
    blogs: allBlogs,
    category,
  });
});

// =====================================
// ✅ ROUTES
// =====================================
app.use("/trending", trendingRoute);
app.use("/search", searchRoute);
app.use("/user", userRoute);
app.use("/blog", blogRoute);
app.use("/bookmark", bookmarkRoute);

// =====================================
// 🚀 START LOCAL SERVER
// =====================================
app.listen(PORT, () =>
  console.log(`🚀 Local server running at http://localhost:${PORT}`)
);

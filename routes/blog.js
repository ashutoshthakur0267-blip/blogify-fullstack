const { Router } = require("express");

const Blog = require("../models/blog");
const Comment = require("../models/comment");

const upload = require("../middlewares/upload");

const {
  generateSummary,
  generateTags,
  generateTitles,
  grammarCorrection,
} = require("../services/aiService");

const router = Router();

// ==================== Add New Blog Page =====================
router.get("/add-new", (req, res) => {

  if (!req.user) return res.redirect("/user/signin");

  return res.render("addBlog", {
    user: req.user,
  });
});

// ==================== AI TEST ROUTE =====================
router.get("/test-ai", async (req, res) => {

  const sampleText = `
  Node.js is a JavaScript runtime used for backend development.
  It is fast, scalable, and widely used in MERN stack applications.
  `;

  const summary = await generateSummary(sampleText);

  res.send(summary);
});

// ==================== Create Blog =====================
router.post("/", upload.single("coverImage"), async (req, res) => {

  try {

    if (!req.user) return res.redirect("/user/signin");

    const { title, body, category } = req.body;

    // ✅ Generate AI Summary
    const summary = await generateSummary(body);

    const tags = await generateTags(body);

    const aiTitles = await generateTitles(body);

    const grammarSuggestion = await grammarCorrection(body);

    // ⭐ Reading Time
    const wordCount = body.trim().split(/\s+/).length;

    const readingTime = Math.ceil(wordCount / 200);

    // ⭐ Cloudinary Image URL
    const coverImageURL = req.file
      ? req.file.path
      : null;

    // ✅ Create Blog
    const blog = await Blog.create({
      title,
      body,
      summary,
      tags,
      aiTitles,
      grammarSuggestion,
      createdBy: req.user._id,
      coverImageURL,
      readingTime,
      category,
    });

    return res.redirect(`/blog/${blog.id}`);

  } catch (err) {

    console.error("❌ Blog Create Error:", err);

    return res.send("Error creating blog");
  }
});

// ==================== View Blog =====================
router.get("/:id", async (req, res) => {

  const blog = await Blog.findById(req.params.id)
    .populate("createdBy");

  if (!blog) {
    return res.status(404).send("Blog not found");
  }

  const comments = await Comment.find({
    blogId: req.params.id,
  }).populate("createdBy");

  const isOwner =
    req.user &&
    blog.createdBy._id.toString() === req.user._id.toString();

  return res.render("blog", {
    user: req.user,
    blog,
    comments,
    isOwner,
  });
});

// ==================== Add Comment =====================
router.post("/comment/:blogId", async (req, res) => {

  if (!req.user) return res.redirect("/user/signin");

  await Comment.create({
    content: req.body.content,
    blogId: req.params.blogId,
    createdBy: req.user._id,
  });

  return res.redirect(`/blog/${req.params.blogId}`);
});

// ==================== Edit Blog Page =====================
router.get("/edit/:id", async (req, res) => {

  if (!req.user) return res.redirect("/user/signin");

  const blog = await Blog.findById(req.params.id);

  if (!blog) {
    return res.status(404).send("Blog not found");
  }

  if (blog.createdBy.toString() !== req.user._id.toString()) {
    return res.status(403).send("Unauthorized");
  }

  return res.render("editBlog", {
    user: req.user,
    blog,
  });
});

// ==================== Edit Blog =====================
router.post("/edit/:id", upload.single("coverImage"), async (req, res) => {

  try {

    if (!req.user) return res.redirect("/user/signin");

    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).send("Blog not found");
    }

    if (blog.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).send("Unauthorized");
    }

    blog.title = req.body.title;
    blog.body = req.body.body;
    blog.category = req.body.category;

    // ✅ Regenerate AI Summary on Edit
    blog.summary = await generateSummary(req.body.body);

    // ⭐ Recalculate Reading Time
    const wordCount = req.body.body.trim().split(/\s+/).length;

    blog.readingTime = Math.ceil(wordCount / 200);

    // ⭐ Update Cover Image
    if (req.file) {

      blog.coverImageURL = req.file.path;
    }

    await blog.save();

    return res.redirect(`/blog/${blog._id}`);

  } catch (err) {

    console.error("❌ Blog Edit Error:", err);

    return res.send("Error editing blog");
  }
});

// ==================== Delete Blog =====================
router.post("/delete/:id", async (req, res) => {

  if (!req.user) return res.redirect("/user/signin");

  const blog = await Blog.findById(req.params.id);

  if (!blog) {
    return res.status(404).send("Blog not found");
  }

  if (blog.createdBy.toString() !== req.user._id.toString()) {
    return res.status(403).send("Unauthorized");
  }

  await Blog.deleteOne({
    _id: req.params.id,
  });

  return res.redirect("/");
});

// ==================== Like / Unlike =====================
router.post("/:id/like", async (req, res) => {

  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Please log in to like blogs",
    });
  }

  const blog = await Blog.findById(req.params.id);

  if (!blog) {
    return res.status(404).json({
      success: false,
    });
  }

  const userId = req.user._id;

  const hasLiked = blog.likes.includes(userId);

  if (hasLiked) {
    blog.likes.pull(userId);
  } else {
    blog.likes.push(userId);
  }

  await blog.save();

  return res.json({
    success: true,
    liked: !hasLiked,
    likesCount: blog.likes.length,
  });
});

module.exports = router;
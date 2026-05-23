const { Router } = require("express");
const { v4: uuidv4 } = require("uuid");

const router = Router();

const User = require("../models/user");

const {
  sendVerificationEmail,
} = require("../services/emailService");

// ==================== Render Pages ====================

// SIGNIN PAGE
router.get("/signin", (req, res) =>
  res.render("signin", {
    user: req.user || null,
    error: null,
  })
);

// SIGNUP PAGE
router.get("/signup", (req, res) =>
  res.render("signup", {
    user: req.user || null,
    error: null,
  })
);

// ==================== SIGNIN POST ====================
router.post("/signin", async (req, res) => {

  try {

    const { email, password } = req.body;

    // Find user first
    const user = await User.findOne({ email });

    if (!user) {

      return res.render("signin", {
        user: req.user || null,
        error: "User not found",
      });
    }

    // Check email verification
    if (!user.isVerified) {

      return res.render("signin", {
        user: req.user || null,
        error: "Please verify your email first",
      });
    }

    // Generate token
    const token =
      await User.matchPasswordAndGenerateToken(
        email,
        password
      );

    console.log("✅ Token Generated:", token);

    return res
      .cookie("token", token)
      .redirect("/");

  } catch (err) {

    console.error("❌ Signin Error:", err.message);

    return res.render("signin", {
      user: req.user || null,
      error: "Incorrect Email or Password",
    });
  }
});

// ==================== SIGNUP POST ====================
router.post("/signup", async (req, res) => {

  try {

    const { fullname, email, password } = req.body;

    // Generate verification token
    const verificationToken = uuidv4();

    // Create user
    await User.create({
      fullname,
      email,
      password,

      verificationToken,
      isVerified: false,
    });

    // Send verification email
    await sendVerificationEmail(
      email,
      verificationToken
    );

    return res.send(
      "Verification email sent ✅ Please check your inbox."
    );

  } catch (err) {

    console.error("❌ Signup Error:", err.message);

    return res.render("signup", {
      user: req.user || null,
      error: "Error during signup. Try again.",
    });
  }
});

// ==================== VERIFY EMAIL ====================
router.get("/verify/:token", async (req, res) => {

  try {

    const user = await User.findOne({
      verificationToken: req.params.token,
    });

    if (!user) {

      return res.send(
        "Invalid verification link ❌"
      );
    }

    user.isVerified = true;

    user.verificationToken = "";

    await user.save();

    return res.send(
      "Email verified successfully ✅"
    );

  } catch (err) {

    console.log(err);

    return res.send(
      "Verification failed ❌"
    );
  }
});

// ==================== LOGOUT ====================
router.get("/logout", (req, res) => {

  res.clearCookie("token").redirect("/");
});

module.exports = router;
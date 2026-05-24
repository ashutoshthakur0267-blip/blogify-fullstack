const multer = require("multer");

const { CloudinaryStorage } = require("multer-storage-cloudinary");

const cloudinary = require("../services/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,

  params: {
    folder: "blogify_uploads",

    allowed_formats: ["jpg", "png", "jpeg", "webp"],
  },
});

const upload = multer({ storage });

module.exports = upload;
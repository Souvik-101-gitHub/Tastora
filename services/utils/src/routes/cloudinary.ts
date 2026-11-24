import express from "express";
import cloudinary from "cloudinary";

const router = express.Router();

router.post("/upload", async (req, res) => {
  try {
    console.log("UTILS UPLOAD REQUEST RECEIVED");

    const { buffer } = req.body;
    console.log("Starting Cloudinary upload...");

    const cloud = await cloudinary.v2.uploader.upload(buffer);

    console.log("Cloudinary upload successful:", cloud.secure_url);

    res.json({
      url: cloud.secure_url,
    });
  } catch (error: any) {
    res.status(500).json({
      message: error.message,
    });
  }
});

export default router;

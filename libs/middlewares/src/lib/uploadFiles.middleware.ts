import multer, { FileFilterCallback } from "multer";
import path from "path";
import fs from "fs";
import type { Request } from "express";

const uploadDir = path.join(process.cwd(), "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const allowed = [".png", ".jpg", ".jpeg"];

  if (!allowed.includes(ext)) {
    return cb(new Error("Only image files are allowed"));
  }

  cb(null, true);
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, uniqueName + path.extname(file.originalname));
  },
});

const MB = 1024 * 1024;

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MB * 2 }, // 2MB
});

export { upload };

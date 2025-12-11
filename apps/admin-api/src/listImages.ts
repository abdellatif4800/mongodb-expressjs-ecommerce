import fs from "fs";
import path from "path";
import type { Request, Response } from "express"

export async function listImages(req: Request, res: Response) {
  try {
    const uploadDir = path.join(process.cwd(), "uploads");

    const files = fs.readdirSync(uploadDir);

    const images = files
      .filter(file => /\.(jpg|jpeg|png|webp)$/i.test(file))
      .map(file => ({
        filename: file,
        url: `http://localhost:8001/uploads/${file}`,
      }));

    res.status(200).json(images);
  } catch (err) {
    res.status(500).json({ message: "Failed to read upload directory" });
  }
}


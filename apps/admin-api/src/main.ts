import express from 'express';
import dotenv from "dotenv"
import type { Request, Response } from "express";
import { getDB, initDB } from '@ecommerce-expressjs-mongodb/db';
import { createProductsAndCategoriesRoute } from './routes/product.routes';
import cors from "cors";
import { createOrdersRoute } from './routes/orders.routes';
import { createUsersRoute } from './routes/user.routes';
import path from 'path';
import { listImages } from './listImages';

dotenv.config()

const port = process.env.ADMIN_PORT ? Number(process.env.ADMIN_PORT) : 8001;

async function startServer() {
  try {
    await initDB()

    const db = getDB()

    const result = await getDB().command({ ping: 1 });
    console.log("AdminAPI: ✅ MongoDB is connected:", result);

    const app = express();

    app.use(cors({
      origin: "*"
    }))

    app.use(express.json());
    app.use("/uploads", express.static(path.join(process.cwd(), "./uploads")));
    app.get("/uploads/images", (req, res) =>
      listImages(req, res)
    );
    //-------------------- Routes  ------------------
    const { productRoute, categoryRoute } = createProductsAndCategoriesRoute(db)

    app.use("/product", productRoute)
    app.use("/category", categoryRoute)
    app.use("/order", createOrdersRoute(db))
    app.use("/users", createUsersRoute(db))

    app.get("/adminApiCheck", async (req: Request, res: Response) => {
      res.send("admin APi is Ready");
    });

    app.listen(port, () => {
      console.log(`AdminAPI is running on http://localhost:${process.env.ADMIN_PORT}/adminApiCheck`);
    });

  } catch (err) {
    console.error("Failed to start AdminAPI :", err);
    process.exit(1); // stop app if DB fails
  }
}
startServer()

import express from 'express';
import dotenv from "dotenv"
import type { Request, Response } from "express";
import { getDB, initDB } from '@ecommerce-expressjs-mongodb/db';
import { createUserRoute } from './routes/user.routes';
import { createProductsAndCategoriesRoute } from './routes/product.routes'
import { createCartRoute } from './routes/cart.routes';
import { createOrdersRoute } from './routes/orders.routes';
import cors from "cors"
dotenv.config()

const port = process.env.PORT ? Number(process.env.PORT) : 3000;

async function startServer() {
  try {
    await initDB()

    const db = getDB()

    const result = await getDB().command({ ping: 1 });
    console.log("API: ✅ MongoDB is connected:", result);

    const app = express();

    app.use(cors({
      origin: "http://localhost:4200"
    }))

    app.use(express.json());


    //----------------------- Routes  ------------------
    app.use("/auth", createUserRoute(db))
    app.use("/cart", createCartRoute(db))

    const { productRoute, categoryRoute } = createProductsAndCategoriesRoute(db)
    app.use("/product", productRoute)
    app.use("/category", categoryRoute)
    app.use("/order", createOrdersRoute(db))

    app.get("/ApiCheck", async (req: Request, res: Response) => {
      // log("API Ready")
      res.send("APi is Ready");
    });

    app.listen(port, () => {
      console.log(`API is running on http://localhost:${process.env.PORT}/ApiCheck`);
    });

  } catch (err) {
    console.error("Failed to start API :", err);
    process.exit(1); // stop app if DB fails
  }
}

startServer()




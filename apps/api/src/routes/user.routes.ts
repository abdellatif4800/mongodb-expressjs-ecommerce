import { UserController, UserService } from "@ecommerce-expressjs-mongodb/auth";
import { CartService } from "@ecommerce-expressjs-mongodb/cart";
import { Router } from "express"
import type { Request, Response } from "express"
import { Db } from "mongodb";

export function createUserRoute(db: Db) {

  const userRouter = Router()

  const cartService = new CartService(db);
  const userService = new UserService(db, cartService);

  const userController = new UserController(userService);

  userRouter.post("/register", (req: Request, res: Response) => userController.registration(req, res))
  userRouter.post("/signin", (req: Request, res: Response) => userController.signin(req, res))

  return userRouter
}

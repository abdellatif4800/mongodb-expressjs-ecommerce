import { UserController, UserService } from "@ecommerce-expressjs-mongodb/auth";
import { CartService } from "@ecommerce-expressjs-mongodb/cart";

import { Router } from "express"
import type { Request, Response } from "express"
import { Db } from "mongodb";

export function createUsersRoute(db: Db) {

  const userRouter = Router()

  const cartService = new CartService(db)
  const usersService = new UserService(db, cartService)
  const usersController = new UserController(usersService)



  userRouter.get("/listUsers", (req: Request, res: Response) => usersController.listOfUsers(req, res))

  userRouter.put("/updateUser", (req: Request, res: Response) => usersController.updateUserDetails(req, res))

  return userRouter
}

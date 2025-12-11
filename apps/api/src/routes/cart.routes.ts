// import { UserController, UserService } from "@ecommerce-expressjs-mongodb/auth";
import { CartController, CartService } from "@ecommerce-expressjs-mongodb/cart";
import { Router } from "express"
import type { Request, Response } from "express"
import { Db } from "mongodb";

export function createCartRoute(db: Db) {

  const cartRouter = Router()

  const cartService = new CartService(db)
  const cartController = new CartController(cartService)

  cartRouter.get("/retrieveCart/:userID", (req: Request, res: Response) => cartController.retrieveCartByID(req, res))

  cartRouter.get("/listOfCarts", (req: Request, res: Response) => cartController.listOfCarts(req, res))

  cartRouter.post("/addItemToCart", (req: Request, res: Response) => cartController.addItemToCart(req, res))

  cartRouter.put("/removeItemFromCart", (req: Request, res: Response) => cartController.removeItemFromCart(req, res))

  cartRouter.put("/changeQuantity", (req: Request, res: Response) => cartController.changeQuantityOfItem(req, res))



  return cartRouter
}

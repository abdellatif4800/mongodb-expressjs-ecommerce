import { CartService } from "./cart.service";
import type { Request, Response } from "express"

export class CartController {
  constructor(private cartService: CartService) { }

  async addItemToCart(req: Request, res: Response) {
    try {
      const updatedCart = await this.cartService.newItemInCart(req.body.cartID, req.body.productID)

      res.status(200).json(updatedCart)
    } catch (err: any) {
      res.status(400).json(err)
    }
  }

  async retrieveCartByID(req: Request, res: Response) {
    try {
      const targetCart = await this.cartService.retrieve(req.params.userID)
      res.status(200).json(targetCart)
    } catch (err: any) {
      res.status(400).json(err)
    }
  }

  async removeItemFromCart(req: Request, res: Response) {
    try {
      const targetCart = await this.cartService.removeItem(req.body.cartID, req.body.productID)
      res.status(200).json(targetCart)
    } catch (err: any) {
      res.status(400).json(err)
    }
  }

  async changeQuantityOfItem(req: Request, res: Response) {
    try {
      const targetCart = await this.cartService.changeQuantityItem(req.body.cartID, req.body.productID, req.body.newQuantity)
      res.status(200).json(targetCart)
    } catch (err: any) {
      res.status(400).json(err)
    }
  }

  async listOfCarts(req: Request, res: Response) {
    try {
      const listOfCart = await this.cartService.list()
      res.status(200).json(listOfCart)
    } catch (err: any) {
      res.status(400).json(err)
    }
  }

}

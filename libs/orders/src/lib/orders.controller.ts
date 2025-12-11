import { OrdersService } from "./orders.services";
import type { Request, Response } from "express"

export class OrderController {
  constructor(private ordersService: OrdersService) { }

  async placeOrder(req: Request, res: Response) {
    try {
      // const { userId, cartID } = req.body;

      const order = await this.ordersService.create(req.body);


      res.status(200).json(order)
    } catch (err: any) {
      res.status(400).json(err)
    }
  }

  async retreiveOrder(req: Request, res: Response) {
    try {
      const { orderId } = req.params;

      const order = await this.ordersService.retrieve(orderId);

      res.status(200).json(order)
    } catch (err: any) {
      res.status(400).json(err)
    }
  }

  async listOfOrders(req: Request, res: Response) {
    try {
      const filters = req.query;
      const list = await this.ordersService.list(filters);

      res.status(200).json(list)
    } catch (err: any) {
      res.status(400).json(err)
    }
  }
  async listOfOrdersForUser(req: Request, res: Response) {
    try {
      // const filters = req.query;
      const { userID }: any = req.params

      const list = await this.ordersService.listOrderForUser(req.query, userID);

      res.status(200).json(list)
    } catch (err: any) {
      res.status(400).json(err)
    }
  }


  async updateOrder(req: Request, res: Response) {
    try {
      const updatedOrder = await this.ordersService.update(req.body.orderID, req.body.fieldToUpdate, req.body.newValue);

      res.status(200).json(updatedOrder)
    } catch (err: any) {
      res.status(400).json(err)
    }
  }

}

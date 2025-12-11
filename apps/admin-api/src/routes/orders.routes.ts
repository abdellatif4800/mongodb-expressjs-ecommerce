// import { UserController, UserService } from "@ecommerce-expressjs-mongodb/auth";
import { OrdersService, OrderController } from "@ecommerce-expressjs-mongodb/orders";
import { Router } from "express"
import type { Request, Response } from "express"
import { Db } from "mongodb";

export function createOrdersRoute(db: Db) {

  const orderRouter = Router()

  const orderService = new OrdersService(db)
  const orderController = new OrderController(orderService)


  orderRouter.get("/listOrders", (req: Request, res: Response) => orderController.listOfOrders(req, res))

  orderRouter.put("/updateOrder", (req: Request, res: Response) => orderController.updateOrder(req, res))

  return orderRouter
}


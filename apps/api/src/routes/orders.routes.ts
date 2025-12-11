// import { UserController, UserService } from "@ecommerce-expressjs-mongodb/auth";
import { OrdersService, OrderController } from "@ecommerce-expressjs-mongodb/orders";
import { Router } from "express"
import type { Request, Response } from "express"
import { Db } from "mongodb";

export function createOrdersRoute(db: Db) {

  const orderRouter = Router()

  const orderService = new OrdersService(db)
  const orderController = new OrderController(orderService)

  orderRouter.post("/placeOrder", (req: Request, res: Response) => orderController.placeOrder(req, res))

  orderRouter.get("/listorderForUser/:userID", (req: Request, res: Response) => orderController.listOfOrdersForUser(req, res))


  orderRouter.get("/retreiveOrder/:orderId", (req: Request, res: Response) => orderController.retreiveOrder(req, res))

  return orderRouter
}


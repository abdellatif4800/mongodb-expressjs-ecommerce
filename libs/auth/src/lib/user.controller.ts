import { UserService } from "./user.service"
import type { Request, Response } from "express"

export class UserController {
  constructor(private userService: UserService) { }

  async registration(req: Request, res: Response) {
    try {
      const newUser = await this.userService.create(req.body)

      res.status(200).json(newUser)
    } catch (err) {
      res.status(400).send(err)
    }
  }

  async signin(req: Request, res: Response) {
    try {
      // console.log(req.body)

      const user = await this.userService.retrieve(req.body)
      res.status(200).json(user)
    }
    catch (err) {
      res.status(400).json(err)
    }
  }

  async listOfUsers(req: Request, res: Response) {
    try {
      const user = await this.userService.list(req.query)
      res.status(200).json(user)
    }
    catch (err) {
      res.status(400).json(err)
    }
  }

  async updateUserDetails(req: Request, res: Response) {
    try {
      const updatedUser = await this.userService.updateUser(req.body.userID, req.body.fieldToUpdate, req.body.newValue)

      res.status(200).json(updatedUser)
    }
    catch (err) {
      res.status(400).json(err)
    }
  }


}

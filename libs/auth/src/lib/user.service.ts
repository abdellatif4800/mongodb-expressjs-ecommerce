import { CartService } from '@ecommerce-expressjs-mongodb/cart';
import { generateToken } from "./jwt.utils";
import bcrypt from "bcryptjs";
import { Db, ObjectId } from 'mongodb';

interface IUser {
  username: string,
  email: string,
  password: string,
}

interface ISignin {
  email: string,
  password: string
}

export class UserService {
  constructor(private db: Db, private cartService: CartService) { }

  private get UserCollection() {
    return this.db.collection("User");
  }

  private get CartCollection() {
    return this.db.collection("Cart");
  }

  async create(userData: IUser): Promise<{ token: string, newCart: any } | string | Error> {
    try {
      const salt = await bcrypt.genSalt(10);
      const hashedPass: string = await bcrypt.hash(
        userData.password as string,
        salt
      );

      const insertedData = await this.UserCollection.insertOne({
        username: userData.username,
        email: userData.email,
        password: hashedPass,
        joinedAt: new Date(),
        isBlocked: false,
        role: "user"
      });

      if (!insertedData) {
        throw new Error("User creation failed");
      }
      const newUser: any = await this.UserCollection.findOne({ _id: insertedData.insertedId });

      const newCart = await this.cartService.create(insertedData.insertedId.toString())


      const token = await generateToken({ id: insertedData.insertedId, email: newUser.email, username: newUser.username, cartID: newCart._id, role: newUser.role })
      return { token, newCart }

    } catch (err: any) {
      // const props = err.errInfo?.details?.schemaRulesNotSatisfied?.[0]?.propertiesNotSatisfied;
      // //     log(props)
      // for (let err of props) {
      //   log(err.details[0])
      // }
      if (err.errorResponse.errmsg.includes('duplicate key error')) {

        return 'email duplicated'
      }
      return err
    }
  }

  async retrieve(userData: ISignin): Promise<{ token: string } | string | Error> {
    try {

      const getUser = await this.UserCollection.findOne({ email: userData.email })
      if (getUser) {

        const isPasswordMatch = await bcrypt.compare(
          userData.password,
          getUser.password
        );

        if (isPasswordMatch) {
          const getCart: any = await this.CartCollection.findOne({ userId: getUser._id })

          const token = await generateToken({ id: getUser._id, email: getUser.email, username: getUser.username, cartID: getCart._id, role: getUser.role })

          return { token }
        } else {
          throw new Error("Unvalid")
        }
      } else {
        throw new Error("Email not found")
      }
    } catch (err: any) {
      return err
    }
  }

  async list(query: any) {
    try {
      const match: any = {};

      for (const key in query) {
        if (query[key] === undefined || query[key] === "") continue;

        if (key === "isBlocked") {
          match[key] = query[key] === "true";
        }

        else if (["username", "email"].includes(key)) {
          match[key] = { $regex: query[key], $options: "i" };
        }

        else {
          match[key] = query[key];
        }
      }
      console.log(match)
      const usersWithCart = await this.UserCollection.aggregate([
        { $match: match },
        {
          $lookup: {
            from: "Cart",
            localField: "_id",
            foreignField: "userId",
            as: "cart"
          }
        },
        {
          $unwind: {
            path: "$cart",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $project: {
            _id: 1,
            username: 1,
            email: 1,
            role: 1,
            joinedAt: 1,
            isBlocked: 1,
            cart: 1
          }
        }
      ]).toArray();
      // console.log(list)
      return usersWithCart
    } catch (err) {
      return err
    }
  }

  async updateUser(userID: string, fieldToUpdate: string, newValue: any) {
    try {
      const allowedFields = [
        "username",
        "email",
        "password",
        "role",
        "isBlocked"
      ];

      // check if field is allowed
      if (!allowedFields.includes(fieldToUpdate)) {
        throw new Error("Field not allowed");
      }

      // if updating password, hash it
      let updateValue = newValue;

      if (fieldToUpdate === "password") {
        const salt = await bcrypt.genSalt(10);
        updateValue = await bcrypt.hash(newValue, salt);
      }

      const updatedUser = await this.UserCollection.findOneAndUpdate(
        { _id: new ObjectId(userID) },
        { $set: { [fieldToUpdate]: updateValue } },
        { returnDocument: "after" }
      );

      return updatedUser;
    } catch (err: any) {
      throw new Error(err);
    }
  }
}

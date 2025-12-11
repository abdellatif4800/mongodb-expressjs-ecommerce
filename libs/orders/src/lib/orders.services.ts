import { Db, ObjectId } from 'mongodb';

export class OrdersService {
  constructor(private db: Db) { }

  private get CartCollection() {
    return this.db.collection("Cart");
  }

  private get OrderCollection() {
    return this.db.collection("Orders");
  }

  private get ProductCollection() {
    return this.db.collection("Product");
  }

  async create(
    orderData: any
  ) {
    try {
      const targetCart: any = await this.CartCollection.findOne({
        _id: new ObjectId(orderData.cartID),
      })

      if (targetCart.items.length === 0) {
        return 'no itmes'
      }

      const outOfStockProducts: string[] = []

      for (const item of targetCart.items) {

        const product: any = await this.ProductCollection.findOne({ _id: item.productId })

        if (product.stock < item.quantity) {
          outOfStockProducts.push(`${product.productName} out of stock!`)
        }

      }

      if (outOfStockProducts.length !== 0) return outOfStockProducts

      const total = targetCart.items.reduce((sum: number, item: any) => {
        return sum + item.price * item.quantity;
      }, 0);

      const insertOrder = await this.OrderCollection.insertOne({
        userId: new ObjectId(orderData.userId),
        items: targetCart.items,
        total: total,
        status: "pending",
        address: orderData.address,
        paymentMethod: orderData.paymentMethod,
        createdAt: new Date(),

      });

      const newOrder = await this.OrderCollection.findOne({
        _id: insertOrder.insertedId
      });

      if (newOrder) {
        for (const item of targetCart.items) {

          const product = await this.ProductCollection.findOneAndUpdate(
            { _id: item.productId },
            {
              $inc: {
                stock: - item.quantity
              }
            })

          console.log(product)

        }
        const clearedCart = await this.CartCollection.findOneAndUpdate(
          { _id: targetCart._id },
          { $set: { items: [] } },
          { returnDocument: "after" }
        );

        return { newOrder, clearedCart };
      }
    } catch (err: any) {
      console.error(JSON.stringify(err.errInfo, null, 2));
      return err;
    }
  }

  async list(filters: any) {
    try {
      const filter: any = {};

      for (const key in filters) {
        if (!filters[key]) continue;

        if (["userId", "_id"].includes(key)) {
          filter[key] = new ObjectId(filters[key]);
        } else {
          filter[key] = filters[key];
        }
      }

      const list = await this.OrderCollection.aggregate([
        { $match: filter },
        { $unwind: "$items" },

        {
          $lookup: {
            from: "Product",
            localField: "items.productId",
            foreignField: "_id",
            as: "productInfo"
          }
        },


        { $unwind: "$productInfo" },


        {
          $addFields: {
            "items.productName": "$productInfo.productName",
            "items.itemTotal": {
              $multiply: ["$items.quantity", "$items.price"]
            }
          }
        },

        {
          $group: {
            _id: "$_id",
            userId: { $first: "$userId" },
            status: { $first: "$status" },
            paymentMethod: { $first: "$paymentMethod" },
            createdAt: { $first: "$createdAt" },
            updatedAt: { $first: "$updatedAt" },
            items: { $push: "$items" },

            calculatedTotal: { $sum: "$items.itemTotal" }
          }
        },

        { $sort: { createdAt: -1 } }
      ]).toArray()

      return list
    } catch (err: any) {
      console.error(JSON.stringify(err.errInfo, null, 2))
      return err
    }
  }

  async listOrderForUser(filters: any, userID: string) {
    try {

      const filter: any = {
        userId: new ObjectId(userID)
      };




      for (const key in filters) {
        if (!filters[key]) continue;

        if (["userId", "_id"].includes(key)) {
          filter[key] = new ObjectId(filters[key]);
        } else {
          filter[key] = filters[key];
        }
      }

      const list = await this.OrderCollection.aggregate([
        { $match: filter },
        { $unwind: "$items" },

        {
          $lookup: {
            from: "Product",
            localField: "items.productId",
            foreignField: "_id",
            as: "productInfo"
          }
        },


        { $unwind: "$productInfo" },


        {
          $addFields: {
            "items.productName": "$productInfo.productName",
            "items.itemTotal": {
              $multiply: ["$items.quantity", "$items.price"]
            }
          }
        },

        {
          $group: {
            _id: "$_id",
            userId: { $first: "$userId" },
            status: { $first: "$status" },
            paymentMethod: { $first: "$paymentMethod" },
            createdAt: { $first: "$createdAt" },
            updatedAt: { $first: "$updatedAt" },
            items: { $push: "$items" },

            calculatedTotal: { $sum: "$items.itemTotal" }
          }
        },

        { $sort: { createdAt: -1 } }
      ]).toArray()

      return list


    } catch (err: any) {
      console.error(JSON.stringify(err.errInfo, null, 2))
      return err

    }
  }

  async retrieve(orderID: string) {
    try {
      const targetOrder = await this.OrderCollection.findOne({
        _id: new ObjectId(orderID),
      })
      return targetOrder
    } catch (err: any) {
      console.error(JSON.stringify(err.errInfo, null, 2))
      return err
    }
  }

  async update(orderId: ObjectId, fieldToUpdate: string, newValue: any) {
    try {
      // Allowed fields based on your order JSON schema
      const allowedFields = [
        "items",
        "total",
        "status",
        "paymentMethod",
        "updatedAt"
      ];

      if (!allowedFields.includes(fieldToUpdate)) {
        return "Field not allowed";
      }

      // add automatic updatedAt
      const updatePayload: any = {
        [fieldToUpdate]: newValue,
        updatedAt: new Date(),
      };

      const updatedOrder = await this.OrderCollection.findOneAndUpdate(
        { _id: new ObjectId(orderId) },
        { $set: updatePayload },
        { returnDocument: "after" }
      );

      return updatedOrder;

    } catch (err) {
      return err;
    }
  }
}

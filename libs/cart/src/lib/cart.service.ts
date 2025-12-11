import { Db, ObjectId } from 'mongodb';

interface ICartItem {
  productId: ObjectId;
  quantity: number;
  price: number;
}

interface ICart {
  _id?: ObjectId;
  userId: ObjectId,
  items: ICartItem[];

  createdAt: Date,
  updatedAt: Date
}

export class CartService {
  constructor(private db: Db) { }

  private get CartCollection() {
    return this.db.collection<ICart>("Cart");
  }

  private get ProductCollection() {
    return this.db.collection("Product");
  }

  async create(userID: string) {
    try {
      const newCart = await this.CartCollection.insertOne({
        userId: new ObjectId(userID),
        items: [],
        createdAt: new Date(),
        updatedAt: new Date()
      })
      return newCart
    } catch (err: any) {
      console.error(JSON.stringify(err.errInfo, null, 2))
      return err
    }
  }

  async list() {
    try {
      const list = await this.CartCollection.find().toArray()
      return list
    } catch (err: any) {
      console.error(JSON.stringify(err.errInfo, null, 2))
      return err
    }
  }

  async retrieve(userID: string) {
    try {
      const cart = await this.CartCollection.aggregate([
        { $match: { userId: new ObjectId(userID) } },

        {
          $lookup: {
            from: "Product",
            localField: "items.productId",
            foreignField: "_id",
            as: "products"
          }
        },

        {

          $addFields: {
            items: {
              $map: {
                input: "$items",
                as: "item",
                in: {
                  $let: {
                    vars: {
                      product: {
                        $arrayElemAt: [
                          {
                            $filter: {
                              input: "$products",
                              as: "p",
                              cond: { $eq: ["$$p._id", "$$item.productId"] }
                            }
                          },
                          0
                        ]
                      }
                    },
                    in: {
                      productId: "$$item.productId",
                      quantity: "$$item.quantity",
                      priceAtTime: "$$item.price",

                      discount: { $ifNull: ["$$product.discount", 0] },

                      discountedPrice: {
                        $subtract: [
                          "$$item.price",
                          {
                            $multiply: [
                              "$$item.price",
                              { $divide: [{ $ifNull: ["$$product.discount", 0] }, 100] }
                            ]
                          }
                        ]
                      },

                      itemTotal: {
                        $multiply: [
                          "$$item.quantity",
                          {
                            $subtract: [
                              "$$item.price",
                              {
                                $multiply: [
                                  "$$item.price",
                                  { $divide: [{ $ifNull: ["$$product.discount", 0] }, 100] }
                                ]
                              }
                            ]
                          }
                        ]
                      },

                      productDetails: "$$product"
                    }
                  }
                }
              }
            },

            cartTotal: {
              $sum: {
                $map: {
                  input: "$items",
                  as: "i",
                  in: {
                    $let: {
                      vars: {
                        product: {
                          $arrayElemAt: [
                            {
                              $filter: {
                                input: "$products",
                                as: "p",
                                cond: { $eq: ["$$p._id", "$$i.productId"] }
                              }
                            },
                            0
                          ]
                        }
                      },
                      in: {
                        $multiply: [
                          "$$i.quantity",
                          {
                            $subtract: [
                              "$$i.price",
                              {
                                $multiply: [
                                  "$$i.price",
                                  { $divide: [{ $ifNull: ["$$product.discount", 0] }, 100] }
                                ]
                              }
                            ]
                          }
                        ]
                      }
                    }
                  }
                }
              }
            }
          }
        },

        { $project: { products: 0 } }
      ]).toArray()
      return cart[0] || null
    } catch (err: any) {
      console.error(JSON.stringify(err.errInfo, null, 2))
      return err
    }
  }

  async newItemInCart(cartID: string, productId: string) {
    try {
      //-------------- target product-----------------
      const targetProduct: any = await this.ProductCollection.findOne({ _id: new ObjectId(productId) })

      //-------------- check items if exist  -----------------
      const isItemExist = await this.CartCollection.findOne({
        _id: new ObjectId(cartID),
        "items.productId": new ObjectId(targetProduct._id)
      })

      if (isItemExist) {
        return `Item ${targetProduct.productName} is exist`
      } else {
        //------------------add item----------------------
        const updatedCart = await this.CartCollection.findOneAndUpdate(
          { _id: new ObjectId(cartID) },
          {
            $push: {
              items: { productId: new ObjectId(productId), quantity: 1, price: targetProduct.price }
            }
          },
          { returnDocument: "after" }
        )
        return updatedCart
      }
    } catch (err: any) {
      console.error(JSON.stringify(err.errInfo, null, 2))
      return err
    }
  }

  async changeQuantityItem(cartID: string, productId: string, quantity: number) {
    try {
      //-------------- target product-----------------
      const targetProduct: any = await this.ProductCollection.findOne({ _id: new ObjectId(productId) })

      const productStock = targetProduct.stock

      //-------------- check items if exist  -----------------
      const isItemExist = await this.CartCollection.findOne({
        _id: new ObjectId(cartID),
        "items.productId": new ObjectId(productId)
      })

      if (isItemExist) {
        //-------------- check stokc  --------------------
        if (quantity > productStock) return `Out of Stock`

        const updatedCart = await this.CartCollection.findOneAndUpdate(
          { _id: new ObjectId(cartID), "items.productId": new ObjectId(productId) },
          {
            $set: {
              "items.$.quantity": quantity
            }
          },
          { returnDocument: "after" }
        )
        return updatedCart
      } else {
        return `Item didn't exist in cart`
      }
    } catch (err: any) {
      console.error(JSON.stringify(err.errInfo, null, 2))
      return err
    }
  }

  async removeItem(cartID: string, productId: string) {
    try {
      const targetProduct: any = await this.ProductCollection.findOne({ _id: new ObjectId(productId) })

      const updatedCart = await this.CartCollection.findOneAndUpdate(
        { _id: new ObjectId(cartID) },
        {
          $pull: {
            items: { productId: new ObjectId(productId), quantity: 1, price: targetProduct.price }
          }
        },
        { returnDocument: "after" }
      )
      return updatedCart
    } catch (err: any) {
      console.error(JSON.stringify(err.errInfo, null, 2))
      return err
    }
  }


}

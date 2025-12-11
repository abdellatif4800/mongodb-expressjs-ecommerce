import { Db } from "mongodb"

export async function cartSchema(db: Db) {
  try {
    const schemaName = "Cart"
    const isSchemaExist = await db
      .listCollections({ name: schemaName })
      .hasNext()

    if (!isSchemaExist) {
      await db.createCollection(schemaName, {
        validator: {
          $jsonSchema: {
            bsonType: "object",
            title: "Cart Object Validation",
            required: ["userId"],

            properties: {
              userId: {
                bsonType: "objectId",
                description: "User who owns this cart"
              },

              items: {
                bsonType: "array",
                description: "Array of cart items",
                items: {
                  bsonType: "object",
                  // required: ["productId", "quantity", "price"],
                  properties: {
                    productId: {
                      bsonType: "objectId",
                      description: "Product added to cart"
                    },
                    quantity: {
                      bsonType: "number",
                      minimum: 1
                    },
                    price: {
                      bsonType: "number",
                      description: "Snapshot price at time of adding"
                    }
                  }
                },
                minItems: 0
              },

              createdAt: {
                bsonType: "date"
              },

              updatedAt: {
                bsonType: "date"
              }
            }
          }
        }
      })

      // Example index (optional)
      // await db.collection(schemaName).createIndex({ userId: 1 }, { unique: true })

      const schemaInfo = await db
        .listCollections({ name: schemaName })
        .toArray()

      return {
        msg: "Schema Created",
        schema: schemaInfo
      }
    } else {
      return "Schema Exist"
    }
  } catch (err) {
    return err
  }
}


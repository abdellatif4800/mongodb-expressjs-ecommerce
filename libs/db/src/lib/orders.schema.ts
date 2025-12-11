import { Db } from "mongodb";

export async function orderSchema(db: Db) {
  try {
    const schemaName = "Orders";
    const isSchemaExist = await db.listCollections({ name: schemaName }).hasNext();

    if (!isSchemaExist) {
      await db.createCollection(schemaName, {
        validator: {
          $jsonSchema: {
            bsonType: "object",
            title: "Order Object Validation",
            // required: ["userId", "items", "total", "status"],
            properties: {
              userId: {
                bsonType: "objectId",
                description: "User who placed the order"
              },
              items: {
                bsonType: "array",
                description: "Array of products in the order",
                items: {
                  bsonType: "object",
                  // required: ["productId", "quantity", "price"],
                  properties: {
                    productId: {
                      bsonType: "objectId",
                      description: "Product in the order"
                    },
                    quantity: {
                      bsonType: "number",
                      minimum: 1,
                      description: "Quantity of product"
                    },
                    price: {
                      bsonType: "number",
                      description: "Snapshot price of product at order time"
                    }
                  }
                },
                minItems: 0
              },
              total: {
                bsonType: "number",
                description: "Total price of the order"
              },
              status: {
                bsonType: "string",
                description: "Order status (pending, paid, shipped, completed, cancelled)"
              },
              address: {
                bsonType: "string"
              },
              paymentMethod: {
                bsonType: "string",
                description: "Payment method used (card, paypal, etc.)"
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
      });

      // Optional: index by userId for fast queries
      // await db.collection(schemaName).createIndex({ userId: 1 });

      const schemaInfo = await db.listCollections({ name: schemaName }).toArray();
      return {
        msg: "Schema Created",
        schema: schemaInfo
      };
    } else {
      return "Schema Exist";
    }
  } catch (err) {
    return err;
  }
}


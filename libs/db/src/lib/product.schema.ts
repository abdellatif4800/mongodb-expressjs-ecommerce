// import { getDB } from "./db";

import { Db } from "mongodb";

export async function productSchema(db: Db) {
  try {
    const schemaName = "Product"
    const isSchemaExist = await db.listCollections({ name: schemaName }).hasNext()
    if (!isSchemaExist) {


      await db.createCollection(schemaName,
        {
          validator: {
            $jsonSchema: {
              bsonType: "object",
              title: "Product Object Validation",
              properties: {
                productName: {
                  bsonType: "string",
                },
                stock: {
                  bsonType: "number",
                },
                price: {
                  bsonType: "number",
                },
                discount: {
                  bsonType: "number",
                },
                rate: {
                  bsonType: "number",
                },
                imageUrl: {
                  bsonType: "string",
                },
                subCategoryID: {
                  bsonType: "objectId",
                },
                publish: {
                  bsonType: "bool"
                },
                creatdAt: {
                  bsonType: "date"
                },
                updatedAt: {
                  bsonType: "date"
                }

              }
            }
          }
        }
      )

      // await db.collection(schemaName).createIndex({ product: 1 }, { unique: true });

      const schemaInfo = await db
        .listCollections({ name: schemaName })
        .toArray();
      console.log("SchemaInfo:", schemaInfo)

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

export async function categorySchema(db: Db) {
  try {
    const schemaName = "Categories"
    const isSchemaExist = await db.listCollections({ name: schemaName }).hasNext()
    if (!isSchemaExist) {

      await db.createCollection(schemaName,
        {
          validator: {
            $jsonSchema: {
              bsonType: "object",
              title: "Categories Object Validation",
              properties: {
                category: {
                  bsonType: "string",
                },
                creatdAt: {
                  bsonType: "date"
                },
              }
            }
          }
        }
      )


      const schemaInfo = await db
        .listCollections({ name: schemaName })
        .toArray();

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

export async function subCategorySchema(db: Db) {
  try {
    const schemaName = "SubCategories"
    const isSchemaExist = await db.listCollections({ name: schemaName }).hasNext()
    if (!isSchemaExist) {

      await db.createCollection(schemaName,
        {
          validator: {
            $jsonSchema: {
              bsonType: "object",
              title: "SubCategories Object Validation",
              properties: {
                subCategory: {
                  bsonType: "string",
                },
                categoryID: {
                  bsonType: "objectId"
                },
                creatdAt: {
                  bsonType: "date"
                },
              }
            }
          }
        }
      )

      const schemaInfo = await db
        .listCollections({ name: schemaName })
        .toArray();

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


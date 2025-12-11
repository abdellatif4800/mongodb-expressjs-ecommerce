import { Db } from "mongodb";
// import { getDB } from "./db";

// const db = getDB()


export async function userSchema(db: Db) {
  try {
    const schemaName = "User"
    const isSchemaExist = await db.listCollections({ name: schemaName }).hasNext()
    if (!isSchemaExist) {

      await db.createCollection(schemaName,
        {
          validator: {
            $jsonSchema: {
              bsonType: "object",
              title: "User Object Validation",
              required: ["username", "email", "password"],
              properties: {
                username: {
                  bsonType: "string",
                },
                email: {
                  bsonType: "string",
                  pattern: "^[\\w.-]+@[\\w.-]+\\.[A-Za-z]{2,}$"
                },
                password: {
                  bsonType: "string",
                },
                isBlocked: {
                  bsonType: "bool"
                },
                role: {
                  bsonType: "string",
                  enum: ["admin", "user",]
                },
                joinedAt: {
                  bsonType: "date"
                }
              }
            }
          }
        }
      )

      await db.collection(schemaName).createIndex({ email: 1 }, { unique: true });
      // await getDB().collection(schemaName).createIndex({ username: 1 }, { unique: true });

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


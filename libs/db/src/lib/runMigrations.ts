import { getDB, initDB } from './db';
import { userSchema } from './user.schema';
import { categorySchema, productSchema, subCategorySchema } from './product.schema';
import { cartSchema } from './cart.schema';
import { orderSchema } from './orders.schema';


async function runMigrations() {
  try {
    await initDB()
    const db = getDB()

    await userSchema(db)
    await productSchema(db)
    await categorySchema(db)
    await subCategorySchema(db)
    await cartSchema(db)
    await orderSchema(db)

    console.log("✅ Migrations completed successfully!");
  } catch (err) {
    console.error("❌ Migration failed:", err);
    process.exit(1);
  }
}



if (require.main === module) {
  runMigrations();
}

export default runMigrations;

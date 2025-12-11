import { Db, ObjectId } from "mongodb";

// interface IProduct {
//   productName: string,
//   price: number,
//   stock: number,
// }

export class ProductService {
  constructor(private db: Db) { }

  get ProductCollection() {
    return this.db.collection("Product")
  }

  get SubCategoryCollection() {
    return this.db.collection("SubCategories")
  }

  async create(productData: any, imageFileName: string) {
    try {

      const createdProduct = await this.ProductCollection.insertOne({
        productName: productData.productName,
        price: Number(productData.price),
        discount: Number(productData.discount),
        stock: Number(productData.stock),
        rate: 0,
        imageUrl: `http://localhost:8001/uploads/${imageFileName}`,
        subCategoryID: new ObjectId(productData.subCategoryID),
        publish: false,
        creatdAt: new Date(),
      })

      const newProduct = await this.ProductCollection.findOne({
        _id: createdProduct.insertedId
      })
      return newProduct
    }
    catch (err) {
      return err
    }
  }

  async retrieve(id: ObjectId) {
    try {
      const product = await this.ProductCollection.findOne({
        _id: id
      })
      return product

    } catch (err) {
      return err
    }

  }

  async list(query: any) {
    try {
      const match: any = {};

      if (query.subcategoryId) {
        match.subCategoryID = new ObjectId(query.subcategoryId);
      }

      for (const key in query) {
        if (!query[key]) continue;

        if (key === "priceMin" || key === "priceMax") {
          match.price = match.price || {};
          if (query.priceMin) match.price.$gte = Number(query.priceMin);
          if (query.priceMax) match.price.$lte = Number(query.priceMax);
        }

        if (key === "stockMin" || key === "stockMax") {
          match.stock = match.stock || {};
          if (query.stockMin) match.stock.$gte = Number(query.stockMin);
          if (query.stockMax) match.stock.$lte = Number(query.stockMax);
        }

        if (key === "discountMin" || key === "discountMax") {
          match.discount = match.discount || {};
          if (query.discountMin) match.discount.$gte = Number(query.discountMin);
          if (query.discountMax) match.discount.$lte = Number(query.discountMax);
        }

        if (key === "rateMin" || key === "rateMax") {
          match.rate = match.rate || {};
          if (query.rateMin) match.rate.$gte = Number(query.rateMin);
          if (query.rateMax) match.rate.$lte = Number(query.rateMax);
        }


        else if (key === "publish") {
          match[key] = query[key] === "true";
        }

        else if (key === "productName") {
          match.productName = { $regex: query[key], $options: "i" };
        }

        else if (key === "startDate" || key === "endDate") {
          match.creatdAt = match.creatdAt || {};
          if (query.startDate) match.creatdAt.$gte = new Date(query.startDate);
          if (query.endDate) match.creatdAt.$lte = new Date(query.endDate);
        }

        else if (key === "id" || key === "_id") {
          if (ObjectId.isValid(query[key])) {
            match._id = new ObjectId(query[key]);
          }
        }
      }

      const list = await this.ProductCollection.aggregate([
        {
          $match: match
          // {
          //   subCategoryID: new ObjectId(query.subcategoryId)
          // }
        },
        {
          $lookup: {
            from: "SubCategories",
            localField: "subCategoryID",
            foreignField: "_id",
            as: "subCategory"
          }
        },

        { $unwind: "$subCategory" },

        {
          $project: {
            productName: 1,
            price: 1,
            discount: 1,
            rate: 1,
            stock: 1,
            publish: 1,
            imageUrl: 1,
            creatdAt: 1,
            updatedAt: 1,
            subCategoryID: 1,
            subCategoryName: "$subCategory.subCategotzy"
          }
        }
      ]).toArray();

      return list
    } catch (err: any) {
      throw new Error(err)
    }
  }

  async update(productID: ObjectId, fieldToUpdate: string, newValue: string) {
    try {
      const allowedFields = [
        'productName',
        'price',
        'stock',
        'rate',
        'discount',
        'publish',
        'imageUrl'
      ]
      if (allowedFields.includes(fieldToUpdate)) {
        const updatedProduct = await this.ProductCollection.findOneAndUpdate(
          { _id: new ObjectId(productID) },
          { $set: { [fieldToUpdate]: newValue, updatedat: new Date() } },
          { returnDocument: "after" }
        );

        return updatedProduct
      } else {
        return "not Allowd"
      }
    } catch (err) {
      return err
    }
  }

  async updateWholeProduct(productID: ObjectId, newData: any) {
    try {
      // Fields allowed to be updated
      const allowedFields = ['productName', 'price', 'stock', 'publish'];

      const updateObject: any = {};

      for (const key of allowedFields) {
        console.log(key);
        //   updateObject[key] = newData[key];
      }

      updateObject.updatedAt = new Date();

      const updatedProduct = await this.ProductCollection.findOneAndUpdate(
        { _id: new ObjectId(productID) },
        { $set: updateObject },
        { returnDocument: "after" }
      );

      return updatedProduct;

    } catch (err) {
      return err;
    }
  }
}

export class CategoiresServices {
  constructor(private db: Db) { }

  get CategoryCollection() {
    return this.db.collection("Categories")
  }

  get SubCategoryCollection() {
    return this.db.collection("SubCategories")
  }

  async createCategory(CategoryName: string) {
    try {
      const newCategory: any = await this.CategoryCollection.insertOne({
        category: CategoryName,
        creatdAt: new Date()
      })
      return newCategory
    } catch (err: any) {
      throw new Error(err)
    }
  }

  async createSubCategory(CategoryID: string, subCategoryName: string) {
    try {

      const newSubCategory = await this.SubCategoryCollection.insertOne({
        subCategory: subCategoryName,
        categoryID: new ObjectId(CategoryID),
        creatdAt: new Date()
      })

      return newSubCategory
    } catch (err) {
      return err
    }
  }

  async listSubCategoriesPerCategory(categoryID: string) {
    try {
      const list = await this.SubCategoryCollection.find({ category: new ObjectId(categoryID) }).toArray()
      return list
    } catch (err) {
      return err
    }
  }

  async listCategories() {
    try {

      const list = await this.CategoryCollection.aggregate([
        {
          $lookup: {
            from: "SubCategories",
            localField: "_id",
            foreignField: "categoryID", // make sure your SubCategories use this field
            as: "subCategoriesList"
          }
        },
        {
          $project: {
            _id: 1,
            category: 1, // include category name
            subCategoriesList: {
              _id: 1,
              subCategory: 1, // include only subcategory name
            }
          }
        }
      ]).toArray();

      return list
    } catch (err) {
      return err
    }
  }
}

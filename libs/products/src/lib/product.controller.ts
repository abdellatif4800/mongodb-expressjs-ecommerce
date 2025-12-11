import type { Request, Response } from "express"
import { CategoiresServices, ProductService } from "./product.service"
import { ObjectId } from "mongodb"
import path from "path";
import fs from 'fs'

export class ProductController {
  constructor(private productService: ProductService) { }

  async addProduct(req: Request, res: Response) {
    try {
      const file = (req as any).file;

      const newPorduct = await this.productService.create(req.body, file.filename)
      // console.log(newPorduct)
      res.status(200).json(newPorduct)

    } catch (err) {
      res.status(400).json(err)
    }
  }

  async getProduct(req: Request, res: Response) {
    try {
      const targetProduct = await this.productService.retrieve(new ObjectId(req.params.id))
      res.status(200).json(targetProduct)
    } catch (err) {
      res.status(400).json(err)
    }
  }

  async listProductsByCategory(req: Request, res: Response) {
    try {

      const list: any = await this.productService.list(req.query)
      res.status(200).json(list)
    } catch (err) {
      res.status(400).json(err)
    }
  }

  async updateProduct(req: Request, res: Response) {
    try {
      const updateProduct = await this.productService.update(req.body.productID, req.body.fieldToUpdate, req.body.newValue)
      console.log(123);

      res.status(200).json(updateProduct)
    } catch (err) {
      res.status(400).json(err)
    }
  }

  async listImages(req: Request, res: Response) {
    try {
      const uploadDir = path.join(process.cwd(), "uploads");

      const files = fs.readdirSync(uploadDir);

      const images = files
        .filter(file => /\.(jpg|jpeg|png|webp)$/i.test(file))
        .map(file => ({
          filename: file,
          url: `http://localhost:8001/uploads/${file}`,
        }));

      res.status(200).json(images);
    } catch (err) {
      res.status(500).json({ message: "Failed to read upload directory" });
    }
  }

  // async updateProduct2(req: Request, res: Response) {
  //   try {
  //     const updateProduct = await this.productService.updateWholeProduct(req.body.productID, req.body.newData)
  //     console.log(updateProduct);
  //
  //     res.status(200).json(updateProduct)
  //   } catch (err) {
  //     res.status(400).json(err)
  //   }
  // }


}


export class CategoriesControeller {
  constructor(private categoryService: CategoiresServices) { }

  async addCategory(req: Request, res: Response) {
    try {
      const newCategory = await this.categoryService.createCategory(req.body.categoryName)
      res.status(200).json(newCategory)
    } catch (err) {
      res.status(400).json(err)
    }
  }

  async addSubCategory(req: Request, res: Response) {
    try {
      const newSubCategory = await this.categoryService.createSubCategory(req.body.categoryID, req.body.SubcategoryName)
      res.status(200).json(newSubCategory)
    } catch (err) {
      res.status(400).json(err)
    }
  }

  async listSubCategoires(req: Request, res: Response) {
    try {
      const subCategory = await this.categoryService.listSubCategoriesPerCategory(req.params.category)
      res.status(200).json(subCategory)
    } catch (err) {
      res.status(400).json(err)
    }
  }

  async listCategoreis(req: Request, res: Response) {
    try {
      const categories = await this.categoryService.listCategories()
      res.status(200).json(categories)
    } catch (err) {
      res.status(400).json(err)
    }

  }
}

import { Router } from "express";
import { CategoiresServices, CategoriesControeller, ProductController, ProductService } from "@ecommerce-expressjs-mongodb/products";
import { Db } from "mongodb";
import type { Request, Response } from "express"
import { upload } from "@ecommerce-expressjs-mongodb/middlewares"

export function createProductsAndCategoriesRoute(db: Db) {
  const productRoute = Router()
  const categoryRoute = Router()


  //------------ product  ------------

  const productService = new ProductService(db)

  const productController = new ProductController(productService)



  productRoute.post("/newProduct", upload.single('image'), (req: Request, res: Response) => productController.addProduct(req, res))

  productRoute.put("/updateproduct", (req: Request, res: Response) => productController.updateProduct(req, res))

  // productRoute.put("/updateWholeproduct", (req: Request, res: Response) => productController.updateProduct2(req, res))

  //------------ categories and sub-categories  ------------
  const categorieService = new CategoiresServices(db)

  const categoriesControeller = new CategoriesControeller(categorieService)

  productRoute.post("/newCategory", (req: Request, res: Response) => categoriesControeller.addCategory(req, res))

  productRoute.post("/newSubCategory", (req: Request, res: Response) => categoriesControeller.addSubCategory(req, res))

  return { productRoute, categoryRoute }

}

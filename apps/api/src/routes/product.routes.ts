import { Router } from "express";
import { CategoiresServices, CategoriesControeller, ProductController, ProductService } from "@ecommerce-expressjs-mongodb/products";
import { Db } from "mongodb";
import type { Request, Response } from "express"


export function createProductsAndCategoriesRoute(db: Db) {
  const productRoute = Router()
  const categoryRoute = Router()


  //------------ products  ------------
  const productService = new ProductService(db)

  const productController = new ProductController(productService)

  productRoute.get("/retrievePorduct/:id", (req: Request, res: Response) => productController.getProduct(req, res))
  productRoute.get("/listProducts", (req: Request, res: Response) => productController.listProductsByCategory(req, res))


  //------------ categories and sub-categories  ------------

  const categorieService = new CategoiresServices(db)

  const categoriesControeller = new CategoriesControeller(categorieService)

  categoryRoute.get("/listSubCategories/:category", (req: Request, res: Response) => categoriesControeller.listSubCategoires(req, res))
  categoryRoute.get("/listCategoreis", (req: Request, res: Response) => categoriesControeller.listCategoreis(req, res))

  return { productRoute, categoryRoute }
}

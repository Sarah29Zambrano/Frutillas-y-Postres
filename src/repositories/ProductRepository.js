import BaseRepository from "./BaseRepository.js";
import ProductModel from "../model/products.model.js";

export default class ProductRepository extends BaseRepository {
  constructor() {
    super(ProductModel);
  }

  async getProductsPaginated(filters = {}, limit = 10, page = 1, sort = {}) {
    try {
      return await this.model.paginate(filters, {
        limit,
        page,
        sort,
      });
    } catch (error) {
      throw new Error(`Error al obtener productos paginados: ${error.message}`);
    }
  }

  async getProductById(productId) {
    try {
      return await this.model.findOne({ id: Number(productId) });
    } catch (error) {
      throw new Error(`Error al obtener producto: ${error.message}`);
    }
  }

  async createProduct(productData) {
    try {
      // Obtener el próximo ID secuencial
      const lastProduct = await this.model.findOne().sort({ id: -1 });
      const newId = lastProduct ? lastProduct.id + 1 : 1;

      return await this.model.create({
        id: newId,
        ...productData,
      });
    } catch (error) {
      throw new Error(`Error al crear producto: ${error.message}`);
    }
  }

  async updateProduct(productId, updateData) {
    try {
      return await this.model.findOneAndUpdate(
        { id: Number(productId) },
        updateData,
        { new: true }
      );
    } catch (error) {
      throw new Error(`Error al actualizar producto: ${error.message}`);
    }
  }

  async deleteProduct(productId) {
    try {
      return await this.model.findOneAndDelete({ id: Number(productId) });
    } catch (error) {
      throw new Error(`Error al eliminar producto: ${error.message}`);
    }
  }

  async searchProducts(searchTerm) {
    try {
      return await this.model.find({
        $or: [
          { title: { $regex: searchTerm, $options: "i" } },
          { description: { $regex: searchTerm, $options: "i" } },
        ],
      });
    } catch (error) {
      throw new Error(`Error al buscar productos: ${error.message}`);
    }
  }

  async getProductsByPriceRange(minPrice, maxPrice) {
    try {
      return await this.model.find({
        price: { $gte: minPrice, $lte: maxPrice },
      });
    } catch (error) {
      throw new Error(`Error al obtener productos por precio: ${error.message}`);
    }
  }

  async getProductsByCategory(category) {
    try {
      return await this.model.find({ category });
    } catch (error) {
      throw new Error(`Error al obtener productos por categoría: ${error.message}`);
    }
  }

  async productExists(productId) {
    try {
      const product = await this.model.findOne({ id: Number(productId) });
      return product !== null;
    } catch (error) {
      throw new Error(`Error al verificar producto: ${error.message}`);
    }
  }
}

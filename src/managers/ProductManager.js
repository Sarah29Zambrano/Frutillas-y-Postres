import ProductModel from "../model/products.model.js";

export default class ProductManager {
  async getProducts(limite, pagina, consulta, ordenamiento) {
    const limit = parseInt(limite) || 10;
    const page = parseInt(pagina) || 1;
    
    let query = {};

    if (consulta) {
      try {
        query = JSON.parse(consulta);
      } catch (error) {
        throw new Error("El parámetro 'consulta' debe ser un JSON válido.");
      }
    }
    const valorOrdenamiento = parseInt(ordenamiento)
    const sort = valorOrdenamiento == 1 || valorOrdenamiento == -1 ? {price: valorOrdenamiento} : {};

    return await ProductModel.paginate(query, {
      limit,
      page,
      sort: sort,
    });
  }

  async getProductById(id) {
    return await ProductModel.findOne({ id: Number(id) });
  }

  async addProduct(data) {
    const lastProduct = await ProductModel.findOne().sort({ id: -1 });
    const newId = lastProduct ? lastProduct.id + 1 : 1;

    const newProduct = await ProductModel.create({
      id: newId,
      ...data,
    });

    return newProduct;
  }

  async updateProduct(id, data) {
    const updated = await ProductModel.findOneAndUpdate(
      { id: Number(id) },
      data,
      { new: true }
    );

    return updated;
  }

  async deleteProduct(id) {
    const deleted = await ProductModel.findOneAndDelete({ id: Number(id) });
    return deleted;
  }
}

export default class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  async findAll(filters = {}, options = {}) {
    try {
      const { limit = 10, page = 1, sort = {} } = options;
      
      if (this.model.paginate) {
        return await this.model.paginate(filters, {
          limit,
          page,
          sort,
        });
      }
      
      return await this.model.find(filters).sort(sort).limit(limit).skip((page - 1) * limit);
    } catch (error) {
      throw new Error(`Error al obtener documentos: ${error.message}`);
    }
  }

  async findById(id) {
    try {
      return await this.model.findById(id);
    } catch (error) {
      throw new Error(`Error al obtener documento por ID: ${error.message}`);
    }
  }

  async findOne(filter) {
    try {
      return await this.model.findOne(filter);
    } catch (error) {
      throw new Error(`Error al obtener documento: ${error.message}`);
    }
  }

  async create(data) {
    try {
      const newDocument = await this.model.create(data);
      return newDocument;
    } catch (error) {
      throw new Error(`Error al crear documento: ${error.message}`);
    }
  }

  async updateById(id, data) {
    try {
      return await this.model.findByIdAndUpdate(id, data, { new: true });
    } catch (error) {
      throw new Error(`Error al actualizar documento: ${error.message}`);
    }
  }

  async updateOne(filter, data) {
    try {
      return await this.model.findOneAndUpdate(filter, data, { new: true });
    } catch (error) {
      throw new Error(`Error al actualizar documento: ${error.message}`);
    }
  }

  async deleteById(id) {
    try {
      return await this.model.findByIdAndDelete(id);
    } catch (error) {
      throw new Error(`Error al eliminar documento: ${error.message}`);
    }
  }

  async deleteOne(filter) {
    try {
      return await this.model.findOneAndDelete(filter);
    } catch (error) {
      throw new Error(`Error al eliminar documento: ${error.message}`);
    }
  }

  async count(filter = {}) {
    try {
      return await this.model.countDocuments(filter);
    } catch (error) {
      throw new Error(`Error al contar documentos: ${error.message}`);
    }
  }

  async exists(filter) {
    try {
      const result = await this.model.findOne(filter);
      return result !== null;
    } catch (error) {
      throw new Error(`Error al verificar existencia: ${error.message}`);
    }
  }
}

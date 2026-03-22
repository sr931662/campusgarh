const AppError = require('../utils/AppError');

class BaseService {
  constructor(model) {
    this.model = model;
  }

  // Create a new document
  async create(data, options = {}) {
    try {
      const doc = await this.model.create(data);
      return doc;
    } catch (error) {
      throw new AppError(`Error creating ${this.model.modelName}: ${error.message}`, 400);
    }
  }

  // Find one document by query
  async findOne(query, options = {}) {
    try {
      const doc = await this.model.findOne(query).lean();
      if (!doc) throw new AppError(`${this.model.modelName} not found`, 404);
      return doc;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(`Error finding ${this.model.modelName}: ${error.message}`, 400);
    }
  }

  // Find by ID
  async findById(id, options = {}) {
    try {
      const doc = await this.model.findById(id).lean();
      if (!doc || doc.deletedAt) throw new AppError(`${this.model.modelName} not found`, 404);
      return doc;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(`Error finding ${this.model.modelName}: ${error.message}`, 400);
    }
  }

  // Find all with pagination, filtering, sorting
  async findAll(filter = {}, pagination = {}, sort = {}) {
    try {
      const page = parseInt(pagination.page) || 1;
      const limit = parseInt(pagination.limit) || 10;
      const skip = (page - 1) * limit;

      const [data, total] = await Promise.all([
        this.model.find(filter).sort(sort).skip(skip).limit(limit).lean(),
        this.model.countDocuments(filter),
      ]);

      return {
        data,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw new AppError(`Error fetching ${this.model.modelName}: ${error.message}`, 400);
    }
  }

  // Update one document
  async updateOne(query, data, options = {}) {
    try {
      const doc = await this.model.findOneAndUpdate(query, data, {
        new: true,
        runValidators: true,
        ...options,
      }).lean();
      if (!doc) throw new AppError(`${this.model.modelName} not found`, 404);
      return doc;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(`Error updating ${this.model.modelName}: ${error.message}`, 400);
    }
  }

  // Update by ID
  async updateById(id, data, options = {}) {
    return this.updateOne({ _id: id }, data, options);
  }

  // Delete one document (soft delete by default)
  async deleteOne(query, soft = true) {
    try {
      let update;
      if (soft) {
        update = { deletedAt: new Date() };
      } else {
        // Hard delete
        const result = await this.model.deleteOne(query);
        if (result.deletedCount === 0) throw new AppError(`${this.model.modelName} not found`, 404);
        return { deleted: true };
      }
      const doc = await this.model.findOneAndUpdate(query, update, { new: true }).lean();
      if (!doc) throw new AppError(`${this.model.modelName} not found`, 404);
      return doc;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(`Error deleting ${this.model.modelName}: ${error.message}`, 400);
    }
  }

  // Delete by ID
  async deleteById(id, soft = true) {
    return this.deleteOne({ _id: id }, soft);
  }

  // Bulk create (for imports)
  async bulkCreate(dataArray, options = {}) {
    try {
      const docs = await this.model.insertMany(dataArray, options);
      return docs;
    } catch (error) {
      throw new AppError(`Error bulk creating ${this.model.modelName}: ${error.message}`, 400);
    }
  }

  // Bulk update (for imports) – using bulkWrite
  async bulkUpdate(operations) {
    try {
      const result = await this.model.bulkWrite(operations);
      return result;
    } catch (error) {
      throw new AppError(`Error bulk updating ${this.model.modelName}: ${error.message}`, 400);
    }
  }
}

module.exports = BaseService;
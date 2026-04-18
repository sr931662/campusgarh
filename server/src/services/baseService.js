const AppError = require('../utils/AppError');

// Converts raw MongoDB/Mongoose errors into friendly, user-readable messages
function toFriendlyError(modelName, action, error) {
  if (error instanceof AppError) return error;

  // Duplicate key (e.g. duplicate slug, email, title)
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue || {})[0] || 'field';
    const labelMap = { slug: 'title', email: 'email address', name: 'name', phone: 'phone number' };
    const label = labelMap[field] || field;
    return new AppError(
      `A ${modelName.toLowerCase()} with this ${label} already exists. Please use a different ${label}.`,
      400
    );
  }

  // Mongoose validation errors (required fields, min/max, etc.)
  if (error.name === 'ValidationError') {
    const messages = Object.values(error.errors)
      .map(e => e.message.replace(/^Path `(\w+)`/, (_, f) => {
        const labelMap = { slug: 'Title', featuredImageUrl: 'Featured image', author: 'Author' };
        return labelMap[f] || f.charAt(0).toUpperCase() + f.slice(1);
      }))
      .join('. ');
    return new AppError(messages || 'Please fill in all required fields.', 400);
  }

  // Invalid ID or value type
  if (error.name === 'CastError') {
    return new AppError(`Invalid ${error.path} value. Please check your input.`, 400);
  }

  return new AppError(`Failed to ${action} ${modelName.toLowerCase()}. Please try again.`, 500);
}

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
      throw toFriendlyError(this.model.modelName, 'create', error);
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
      throw toFriendlyError(this.model.modelName, 'find', error);
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
      throw toFriendlyError(this.model.modelName, 'find', error);
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
      throw toFriendlyError(this.model.modelName, 'fetch', error);
    }
  }

  // Update one document
  async updateOne(query, data, options = {}) {
    try {
      const doc = await this.model.findOneAndUpdate(query, { $set: data }, {
        new: true,
        runValidators: true,
        ...options,
      }).lean();
      if (!doc) throw new AppError(`${this.model.modelName} not found`, 404);
      return doc;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw toFriendlyError(this.model.modelName, 'update', error);
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
      throw toFriendlyError(this.model.modelName, 'delete', error);
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
      throw toFriendlyError(this.model.modelName, 'import', error);
    }
  }

  // Bulk update (for imports) – using bulkWrite
  async bulkUpdate(operations) {
    try {
      const result = await this.model.bulkWrite(operations);
      return result;
    } catch (error) {
      throw toFriendlyError(this.model.modelName, 'update', error);
    }
  }
}

module.exports = BaseService;
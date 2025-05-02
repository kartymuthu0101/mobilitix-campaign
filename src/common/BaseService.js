class BaseService {
    model;

    constructor(model) {
        this.model = model;
    }

    async getAll(condition = {}, returnOption = {}) {
        try {
            return await this.model.find(condition)
                .lean(returnOption.lean || false)
                .select(returnOption.select || '');
        } catch (error) {
            throw error;
        }
    }

    async getOne(condition = {}, returnOption = {}) {
        try {
            return await this.model.findOne(condition)
                .lean(returnOption.lean || false)
                .select(returnOption.select || '');
        } catch (error) {
            throw error;
        }
    }

    async getByIds(ids = [], returnOption = {}) {
        try {
            return await this.model.find({ _id: { $in: ids } })
                .lean(returnOption.lean || false)
                .select(returnOption.select || '');
        } catch (error) {
            throw error;
        }
    }

    async create(payload, returnOption = {}, options = {}) {
        try {
            const doc = new this.model(payload);
            const saved = await doc.save(options);
            return returnOption.lean ? saved.toObject() : saved;
        } catch (error) {
            throw error;
        }
    }

    async bulkCreate(payloads, returnOption = {}, options = { ordered: true }) {
        const { lean } = returnOption;
        try {
            const result = await this.model.insertMany(payloads, options);
            return lean ? result.map(doc => doc.toObject()) : result;
        } catch (error) {
            throw error;
        }
    }

    async bulkUpdate(payloads, returnOption = {}, options = { lean: false }) {

        try {
            const { lean } = returnOption;

            if (!Array.isArray(payloads) || payloads.length === 0) {
                return [];
            }

            const bulkOps = payloads
                .filter(doc => doc._id)
                .map(doc => {
                    const { _id, ...updateData } = doc;
                    return {
                        updateOne: {
                            filter: { _id },
                            update: { $set: updateData }
                        }
                    };
                });

            if (bulkOps.length === 0) return [];

            const result = await this.model.bulkWrite(bulkOps, { ordered: true, ...options });
            return result;
        } catch (error) {
            throw error;
        }
    }

    async update(id, updateData, returnOption = {}, options = { new: true, runValidators: true }) {
        try {
            return await this.model.findByIdAndUpdate(
                id,
                { $set: updateData },
                options
            ).lean(returnOption.lean || false);
        } catch (error) {
            throw error;
        }
    }

    async updateOne(_id, updateQuery, returnOption = {}, options = { new: true, runValidators: true }) {
        try {
            const query = this.model.findOneAndUpdate({ _id }, updateQuery, options);
            if (returnOption.lean) query.lean();
            return await query;
        } catch (error) {
            throw error;
        }
    }

    async delete(id, returnOption = {}) {
        try {
            return await this.model.findByIdAndDelete(id)
                .lean(returnOption.lean || false);
        } catch (error) {
            throw error;
        }
    }

    async getPaginated(payload = {}, returnOption = {}) {
        try {
            const { lean = true, select = "" } = returnOption || {};
            const { skip = 0, limit = 10, filters = {} } = payload;

            const [data, total] = await Promise.all([
                this.model.find(filters)
                    .skip(skip)
                    .limit(limit)
                    .lean(lean || false)
                    .select(select || '')
                    .exec(),
                this.model.countDocuments(filters).exec(),
            ]);

            return { data, total };
        } catch (error) {
            throw error;
        }
    }
}

module.exports = BaseService;
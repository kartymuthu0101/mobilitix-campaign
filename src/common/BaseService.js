const { Op } = require('sequelize');

class BaseService {
    model;

    constructor(model) {
        this.model = model;
    }

    async getAll(condition = {}, returnOption = {}) {
        try {
            return await this.model.findAll({
                where: condition,
                ...this._processReturnOptions(returnOption)
            });
        } catch (error) {
            throw error;
        }
    }

    async getOne(condition = {}, returnOption = {}) {
        try {
            return await this.model.findOne({
                where: condition,
                ...this._processReturnOptions(returnOption)
            });
        } catch (error) {
            throw error;
        }
    }

    async getByIds(ids = [], returnOption = {}) {
        try {
            return await this.model.findAll({
                where: {
                    id: {
                        [Op.in]: ids
                    }
                },
                ...this._processReturnOptions(returnOption)
            });
        } catch (error) {
            throw error;
        }
    }

    async create(payload, returnOption = {}, options = {}) {
        try {
            return await this.model.create(payload, options);
        } catch (error) {
            throw error;
        }
    }

    async bulkCreate(payloads, returnOption = {}, options = { validate: true }) {
        try {
            const result = await this.model.bulkCreate(payloads, options);
            return result;
        } catch (error) {
            throw error;
        }
    }

    async bulkUpdate(payloads, returnOption = {}, options = {}) {
        try {
            if (!Array.isArray(payloads) || payloads.length === 0) {
                return [];
            }

            const results = [];
            const transaction = options.transaction;

            // Process updates in sequence
            for (const doc of payloads) {
                if (!doc.id && !doc._id) continue;

                const { id, _id, ...updateData } = doc;
                const recordId = id || _id;

                const [updatedCount, updatedRecords] = await this.model.update(
                    updateData, 
                    { 
                        where: { id: recordId },
                        returning: true,
                        transaction
                    }
                );

                if (updatedCount > 0) {
                    results.push(updatedRecords[0]);
                }
            }

            return results;
        } catch (error) {
            throw error;
        }
    }

    async update(id, updateData, returnOption = {}, options = {}) {
        try {
            const [updatedCount, updatedRecords] = await this.model.update(
                updateData,
                {
                    where: { id },
                    returning: true,
                    ...options
                }
            );
            
            if (updatedCount === 0) {
                return null;
            }
            
            return updatedRecords[0];
        } catch (error) {
            throw error;
        }
    }

    async updateOne(id, updateQuery, returnOption = {}, options = {}) {
        try {
            // For $addToSet and $pull operations
            const { $addToSet, $pull, ...regularUpdates } = updateQuery;
            let record = await this.model.findByPk(id);
            
            if (!record) {
                return null;
            }
            
            // Handle regular updates
            if (Object.keys(regularUpdates).length > 0) {
                await record.update(regularUpdates, options);
            }
            
            // Handle $addToSet operation (equivalent to Sequelize's add association)
            if ($addToSet) {
                for (const [key, value] of Object.entries($addToSet)) {
                    if (value.$each && Array.isArray(value.$each)) {
                        const associationMethod = `add${key.charAt(0).toUpperCase() + key.slice(1)}`;
                        if (typeof record[associationMethod] === 'function') {
                            await record[associationMethod](value.$each, { transaction: options.transaction });
                        }
                    }
                }
            }
            
            // Handle $pull operation (equivalent to Sequelize's remove association)
            if ($pull) {
                for (const [key, value] of Object.entries($pull)) {
                    if (value.$in && Array.isArray(value.$in)) {
                        const associationMethod = `remove${key.charAt(0).toUpperCase() + key.slice(1)}`;
                        if (typeof record[associationMethod] === 'function') {
                            await record[associationMethod](value.$in, { transaction: options.transaction });
                        }
                    }
                }
            }
            
            // Reload record to get latest state with associations
            await record.reload();
            return record;
        } catch (error) {
            throw error;
        }
    }

    async delete(id, returnOption = {}) {
        try {
            const record = await this.model.findByPk(id);
            if (!record) {
                return null;
            }
            
            // Use Sequelize paranoid delete (soft delete)
            await record.destroy();
            return record;
        } catch (error) {
            throw error;
        }
    }

    async getPaginated(payload = {}, returnOption = {}) {
        try {
            const { skip = 0, limit = 10, filters = {} } = payload;
            
            const { count, rows } = await this.model.findAndCountAll({
                where: filters,
                offset: parseInt(skip),
                limit: parseInt(limit),
                ...this._processReturnOptions(returnOption)
            });

            return { data: rows, total: count };
        } catch (error) {
            throw error;
        }
    }

    // Helper method to process return options
    _processReturnOptions(returnOption = {}) {
        const options = {};
        
        // Handle select fields (Sequelize uses 'attributes')
        if (returnOption.select) {
            if (typeof returnOption.select === 'string') {
                options.attributes = returnOption.select.split(' ').filter(field => field);
            } else if (Array.isArray(returnOption.select)) {
                options.attributes = returnOption.select;
            }
        }
        
        // Handle includes/joins
        if (returnOption.include) {
            options.include = returnOption.include;
        }
        
        return options;
    }
}

module.exports = BaseService;
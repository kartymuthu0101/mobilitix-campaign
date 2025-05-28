import { Op } from 'sequelize';

/**
 * BaseService class that provides common database operations
 */
export default class BaseService {
    /**
     * Constructor for the BaseService
     * @param {Object} model - Sequelize model
     */
    constructor(model) {
        this.model = model;
    }

    /**
     * Get all records matching the condition
     * @param {Object} condition - Where conditions
     * @param {Object} returnOption - Options for select, include, etc.
     * @returns {Promise<Array>} - Records matching the condition
     */
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

    /**
     * Get a single record matching the condition
     * @param {Object} condition - Where conditions
     * @param {Object} returnOption - Options for select, include, etc.
     * @returns {Promise<Object|null>} - Record matching the condition or null
     */
    async getOne(condition = {}, returnOption = {}, options = {}) {
        try {
            return await this.model.findOne({
                where: condition,
                ...this._processReturnOptions(returnOption),
                ...options
            });
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get records by array of IDs
     * @param {Array} ids - Array of record IDs
     * @param {Object} returnOption - Options for select, include, etc.
     * @returns {Promise<Array>} - Records matching the IDs
     */
    async getByIds(ids = [], returnOption = {}) {
        try {
            if (!Array.isArray(ids) || ids.length === 0) {
                return [];
            }

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

    /**
     * Create a new record
     * @param {Object} payload - Data for the new record
     * @param {Object} returnOption - Options for select, include, etc.
     * @param {Object} options - Additional options (e.g., transaction)
     * @returns {Promise<Object>} - Created record
     */
    async create(payload, returnOption = {}, options = {}) {
        try {
            return await this.model.create(payload, options);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Create multiple records
     * @param {Array} payloads - Array of data for new records
     * @param {Object} returnOption - Options for select, include, etc.
     * @param {Object} options - Additional options (e.g., transaction, validation)
     * @returns {Promise<Array>} - Created records
     */
    async bulkCreate(payloads, returnOption = {}, options = { validate: true }) {
        try {
            if (!Array.isArray(payloads) || payloads.length === 0) {
                return [];
            }

            return await this.model.bulkCreate(payloads, options);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Update multiple records
     * @param {Array} payloads - Array of data for updating records (must include id)
     * @param {Object} returnOption - Options for select, include, etc.
     * @param {Object} options - Additional options (e.g., transaction)
     * @returns {Promise<Array>} - Updated records
     */
    async bulkUpdate(payloads, returnOption = {}, options = {}) {
        try {
            if (!Array.isArray(payloads) || payloads.length === 0) {
                return [];
            }

            const results = [];
            const { transaction } = options;

            // Process updates in sequence
            for (const doc of payloads) {
                if (!doc.id) continue;

                const { id, ...updateData } = doc;

                const [updatedCount, updatedRecords] = await this.model.update(
                    updateData,
                    {
                        where: { id },
                        returning: true,
                        transaction
                    }
                );

                if (updatedCount > 0 && updatedRecords.length > 0) {
                    results.push(updatedRecords[0]);
                }
            }

            return results;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Update a record by ID
     * @param {string|number} id - Record ID
     * @param {Object} updateData - Data to update
     * @param {Object} returnOption - Options for select, include, etc.
     * @param {Object} options - Additional options (e.g., transaction)
     * @returns {Promise<Object|null>} - Updated record or null if not found
     */
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

            if (updatedCount === 0 || !updatedRecords || updatedRecords.length === 0) {
                return null;
            }

            return updatedRecords[0];
        } catch (error) {
            throw error;
        }
    }

    /**
     * Update a record by ID with special operations
     * @param {string|number} id - Record ID
     * @param {Object} updateQuery - Update data with special operators ($addToSet, $pull)
     * @param {Object} returnOption - Options for select, include, etc.
     * @param {Object} options - Additional options (e.g., transaction)
     * @returns {Promise<Object|null>} - Updated record or null if not found
     */
    async updateOne(id, updateQuery, returnOption = {}, options = {}) {
        try {
            // For $addToSet and $pull operations
            const { $addToSet, $pull, ...regularUpdates } = updateQuery;
            const record = await this.model.findByPk(id);

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

    /**
     * Soft delete a record by ID
     * @param {string|number} id - Record ID
     * @param {Object} returnOption - Options for select, include, etc.
     * @returns {Promise<Object|null>} - Deleted record or null if not found
     */
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

    /**
     * Get records with pagination
     * @param {Object} payload - Pagination options (skip, limit, filters)
     * @param {Object} returnOption - Options for select, include, etc.
     * @returns {Promise<Object>} - Data and pagination metadata
     */
    async getPaginated(payload = {}, returnOption = {}) {
        try {
            const { skip = 0, limit = 10,
                sortBy = 'createdAt',
                sortOrder = 'DESC', filters = {} } = payload;

            const { count, rows } = await this.model.findAndCountAll({
                where: filters,
                offset: parseInt(skip),
                limit: parseInt(limit),
                order: [[sortBy, sortOrder.toUpperCase()]],
                ...this._processReturnOptions(returnOption)
            });

            return { data: rows, total: count };
        } catch (error) {
            throw error;
        }
    }

    /**
     * Process return options for queries
     * @param {Object} returnOption - Options to process (select, include)
     * @returns {Object} - Processed options for Sequelize
     * @private
     */
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

        if (returnOption.raw) [
            options.raw = returnOption.raw
        ]

        return options;
    }
}
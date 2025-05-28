import BaseService from '../../common/BaseService.js';
import MasterData from './MasterData.model.js';

/**
 * Service for master data operations
 */
export default class MasterDataService extends BaseService {
    /**
     * Create a new MasterDataService instance
     */
    constructor() {
        super(MasterData);
    }
    
    /**
     * Find master data by type
     * @param {string} type - Master data type
     * @param {Object} options - Query options
     * @returns {Promise<Array>} - Master data entries
     */
    async findByType(type, options = {}) {
        try {
            return await this.model.findAll({
                where: { type },
                ...this._processReturnOptions(options)
            });
        } catch (error) {
            console.error("Error finding master data by type:", error);
            throw error;
        }
    }
    
    /**
     * Find master data by type and key
     * @param {string} type - Master data type
     * @param {string} key - Master data key
     * @param {Object} options - Query options
     * @returns {Promise<Object|null>} - Master data entry or null
     */
    async findByTypeAndKey(type, key, options = {}) {
        try {
            return await this.model.findOne({
                where: { type, key },
                ...this._processReturnOptions(options)
            });
        } catch (error) {
            console.error("Error finding master data by type and key:", error);
            throw error;
        }
    }
    
    /**
     * Get master data grouped by type
     * @returns {Promise<Object>} - Master data grouped by type
     */
    async getGroupedByType() {
        try {
            const allData = await this.model.findAll();
            
            // Group data by type
            const grouped = allData.reduce((result, item) => {
                const { type } = item;
                
                if (!result[type]) {
                    result[type] = [];
                }
                
                result[type].push({
                    id: item.id,
                    key: item.key,
                    value: item.value
                });
                
                return result;
            }, {});
            
            return grouped;
        } catch (error) {
            console.error("Error getting grouped master data:", error);
            throw error;
        }
    }
    
    /**
     * Bulk upsert master data
     * @param {Array} data - Array of master data objects
     * @param {Object} options - Options for operation
     * @returns {Promise<Array>} - Upserted data
     */
    async bulkUpsert(data, options = {}) {
        const transaction = options.transaction || await this.model.sequelize.transaction();
        
        try {
            const results = [];
            
            for (const item of data) {
                const { type, key, value, createdById } = item;
                
                // Check if entry exists
                const existing = await this.model.findOne({
                    where: { type, key },
                    transaction
                });
                
                if (existing) {
                    // Update existing
                    const [_, updated] = await this.model.update(
                        { value },
                        { 
                            where: { id: existing.id },
                            returning: true,
                            transaction
                        }
                    );
                    
                    if (updated && updated.length > 0) {
                        results.push(updated[0]);
                    }
                } else {
                    // Create new
                    const created = await this.model.create(
                        { type, key, value, createdById },
                        { transaction }
                    );
                    
                    results.push(created);
                }
            }
            
            if (!options.transaction) {
                await transaction.commit();
            }
            
            return results;
        } catch (error) {
            if (!options.transaction) {
                await transaction.rollback();
            }
            
            console.error("Error in bulk upsert master data:", error);
            throw error;
        }
    }
}
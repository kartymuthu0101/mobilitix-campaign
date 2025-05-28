/**
 * Generate pagination metadata for a paginated response
 * @param {Array} list - Data items
 * @param {number} page - Current page number
 * @param {number} limit - Items per page
 * @param {number} totalcount - Total count of items
 * @returns {Object} - Paginated response object
 */
export const paginate = (list, page = 1, limit = 10, totalcount = 0) => {
  const total = totalcount;
  const currentPage = +page;
  const totalPages = Math.ceil(total / limit);

  // Pagination metadata
  const pageMeta = {
      size: limit,
      page: currentPage,
      total,
      totalPages,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1
  };

  return {
      list,
      pageMeta,
  };
};

/**
* Parse pagination parameters from request query
* @param {Object} query - Request query object
* @returns {Object} - Pagination parameters
*/
export const getPaginationParams = (query) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.max(1, Math.min(100, parseInt(query.limit) || 10));
  const skip = (page - 1) * limit;
  
  return { page, limit, skip };
};

export default {
  paginate,
  getPaginationParams
};
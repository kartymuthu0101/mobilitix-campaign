


const paginate = (list, page, limit, totalcount) => {
  const total = totalcount;
  const currentPage = page ? +page : 1;
  const totalPages = Math.ceil(total / limit);

  const pageMeta = {
    size: limit,
    page: currentPage,
    total: total,
    totalPages: totalPages,
  };

  return {
    list,
    pageMeta,
  };
};

module.exports = {
  paginate,
}

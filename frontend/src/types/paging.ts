export type PagedResult<T> = {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
};

export function emptyPage<T>(page = 1, pageSize = 10): PagedResult<T> {
  return { items: [], page, pageSize, totalCount: 0, totalPages: 0 };
}

/** Client-side page slice for mock admin tables until their APIs exist. */
export function paginateLocal<T>(
  rows: T[],
  page: number,
  pageSize: number,
): PagedResult<T> {
  const safePage = Math.max(1, page);
  const safeSize = Math.min(100, Math.max(1, pageSize));
  const totalCount = rows.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / safeSize) || 1);
  const current = Math.min(safePage, totalPages);
  const start = (current - 1) * safeSize;
  return {
    items: rows.slice(start, start + safeSize),
    page: current,
    pageSize: safeSize,
    totalCount,
    totalPages: totalCount === 0 ? 0 : totalPages,
  };
}

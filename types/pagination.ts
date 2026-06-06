export interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages?: number;
  pages?: number;
}

export type PaginatedResponse<K extends string, T> = {
  [P in K]: T[];
} & {
  pagination: PaginationData;
};

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

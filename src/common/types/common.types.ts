// Common pagination response interface
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Common query parameters
export interface BaseQueryParams {
  page?: number;
  limit?: number;
  search?: string;
}

// Event specific query parameters
export interface EventQueryParams extends BaseQueryParams {
  category?: string;
  province?: string;
  year?: number;
  month?: number;
}

// Location specific query parameters
export interface LocationQueryParams extends BaseQueryParams {
  category?: string;
}
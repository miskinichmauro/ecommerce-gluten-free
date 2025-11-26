interface ProductOptions {
  limit?: number;
  offset?: number;
  isFeatured?: boolean;
  query?: string;
  categoryId?: string;
  tagIds?: string[];
  sortBy?: 'price' | 'title' | 'stock' | 'slug' | 'isFeatured';
  sortOrder?: 'ASC' | 'DESC';
}

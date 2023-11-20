export const BASE_URL = "http://localhost:5000/api";
export const API_CATEGORIES_LIST = `${BASE_URL}/categories`;
export const API_PRODUCTS_BY_ID = `${BASE_URL}/products/:category`;
export const API_PRODUCTS_BY_CATEGORY_ID = `${BASE_URL}/products/:category`;

export function getProductsByCategoryId(categoryId) {
  if (categoryId) {
    return `${BASE_URL}/products/${categoryId}`;
  }
  throw new Error("Invalid category ID");
}

export function getProductById(categoryId, productId) {
  console.log("Category ID:", categoryId);
  console.log("Product ID:", productId);
  if (categoryId && productId) {
    return `${BASE_URL}/products/${categoryId}/${productId}`;
  }
  throw new Error("Invalid category ID or product ID");
}

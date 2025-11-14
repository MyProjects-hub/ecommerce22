import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Apollo, gql } from 'apollo-angular';

// Common fragment for product fields
const PRODUCT_FIELDS = gql`
  fragment ProductFields on product {
    EAN
    categoryId
    subcategoryId
    description
    id
    images
    inStock
    name
    price
    category {
      id
      name
    }
    subcategory {
      id
      name
    }
  }
`;

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  categoryFilter$ = new Subject<string>();
  categoryFilter = this.categoryFilter$.asObservable();

  constructor(private apollo: Apollo) { }

  setCategoryFilter(category: string): void {
    this.categoryFilter$.next(category);
  }

  // Get all products (including sortBy and category)
  getProducts(sortBy?: string, category?: string) {
    if (category && sortBy) {
      return this.apollo.watchQuery({
        query: gql`
          query GetProducts($category: String!, $sortBy: order_by!) {
            product(where: {category: {name: {_eq: $category}}}, order_by: {price: $sortBy}) {
              ...ProductFields
            }
          }
          ${PRODUCT_FIELDS}
        `,
        variables: { category, sortBy }
      }).valueChanges;
    } else if (category) {
      return this.apollo.watchQuery({
        query: gql`
          query GetProductsByCategory($category: String!) {
            product(where: {category: {name: {_eq: $category}}}) {
              ...ProductFields
            }
          }
          ${PRODUCT_FIELDS}
        `,
        variables: { category }
      }).valueChanges;
    } else if (sortBy) {
      return this.apollo.watchQuery({
        query: gql`
          query GetProductsSorted($sortBy: order_by!) {
            product(order_by: {price: $sortBy}) {
              ...ProductFields
            }
          }
          ${PRODUCT_FIELDS}
        `,
        variables: { sortBy }
      }).valueChanges;
    } else {
      return this.getProductsDefault();
    }
  }

  getProductsDefault() {
    return this.apollo.watchQuery({
      query: gql`
        query GetProductsDefault {
          product {
            ...ProductFields
          }
        }
        ${PRODUCT_FIELDS}
      `
    }).valueChanges;
  }

  getProductsByPrice(priceFrom: number, priceTo: number) {
    return this.apollo.watchQuery({
      query: gql`
        query GetProductsByPrice($priceFrom: numeric!, $priceTo: numeric!) {
          product(where: {price: {_gte: $priceFrom, _lte: $priceTo}}) {
            ...ProductFields
          }
        }
        ${PRODUCT_FIELDS}
      `,
      variables: {
        priceFrom,
        priceTo
      }
    }).valueChanges;
  }

  searchProducts(searchInput: string) {
    return this.apollo.watchQuery({
      query: gql`
        query SearchProducts($searchInput: String!) {
          product(where: { name: { _ilike: $searchInput } }) {
            ...ProductFields
          }
        }
        ${PRODUCT_FIELDS}
      `,
      variables: {
        searchInput: `%${searchInput}%`
      }
    }).valueChanges;
  }

  getProductById(id: number) {
    return this.apollo.watchQuery({
      query: gql`
        query GetProductById($id: Int!) {
          product(where: { id: { _eq: $id } }) {
            ...ProductFields
          }
        }
        ${PRODUCT_FIELDS}
      `,
      variables: {
        id
      }
    }).valueChanges;
  }

  getProductsByCategory(category: string) {
    return this.apollo.watchQuery({
      query: gql`
        query GetProductsByCategory($category: String!) {
          product(where: {category: {name: {_eq: $category}}}) {
            ...ProductFields
          }
        }
        ${PRODUCT_FIELDS}
      `,
      variables: {
        category
      }
    }).valueChanges;
  }

  getFilteredProducts(filter: string[]) {
    if (filter.length === 0) {
      return this.getProductsDefault();
    }

    return this.apollo.watchQuery({
      query: gql`
        query GetFilteredProducts($filter: [String!]!) {
          product(where: {subcategory: {name: {_in: $filter}}}) {
            ...ProductFields
          }
        }
        ${PRODUCT_FIELDS}
      `,
      variables: {
        filter
      }
    }).valueChanges;
  }

  // Get categories and subcategories for filter component
  getProductCategories() {
    return this.apollo.watchQuery({
      query: gql`
        query GetProductCategories {
          category {
            id
            name
            subcategories {
              name
              id
              categoryId
            }
          }
        }
      `
    }).valueChanges;
  }

  getSuggestedProducts() {
    return this.apollo.watchQuery({
      query: gql`
        query GetSuggestedProducts {
          product(limit: 10) {
            ...ProductFields
          }
        }
        ${PRODUCT_FIELDS}
      `
    }).valueChanges;
  }

  // Legacy methods for backward compatibility
  getProductBySubcategory(category: string) {
    return this.getProductsByCategory(category);
  }

  getProductsFromSubcategories(categories: string[]) {
    return this.getFilteredProducts(categories);
  }
}

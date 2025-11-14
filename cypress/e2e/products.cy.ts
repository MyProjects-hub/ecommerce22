describe('Products Page', () => {
  beforeEach(() => {
    cy.visit('/products/search');
  });

  describe('Product Listing', () => {
    it('should display products page', () => {
      cy.url().should('include', '/products/search');
    });

    it('should display product cards', () => {
      cy.get('[data-cy="product-card"]', { timeout: 10000 }).should('exist');
      cy.get('[data-cy="product-card"]').should('have.length.greaterThan', 0);
    });

    it('should display product information on cards', () => {
      cy.get('[data-cy="product-card"]').first().within(() => {
        cy.get('[data-cy="product-name"]').should('be.visible');
        cy.get('[data-cy="product-price"]').should('be.visible');
        cy.get('[data-cy="product-image"]').should('be.visible');
      });
    });

    it('should display stock status for products', () => {
      cy.get('[data-cy="product-card"]').first().within(() => {
        cy.get('[data-cy="stock-status"]').should('exist');
      });
    });
  });

  describe('Product Search', () => {
    it('should have a search input', () => {
      cy.get('[data-cy="search-input"]').should('exist');
    });

    it('should filter products by search term', () => {
      cy.get('[data-cy="search-input"]').type('iPhone');
      cy.get('[data-cy="product-card"]').should('have.length.greaterThan', 0);
    });

    it('should show no results message for invalid search', () => {
      cy.get('[data-cy="search-input"]').type('nonexistentproduct123456');
      cy.wait(1000);
      // Either no products or a no results message
      cy.get('[data-cy="product-card"]').should('have.length', 0);
    });

    it('should clear search results', () => {
      cy.get('[data-cy="search-input"]').type('test');
      cy.get('[data-cy="search-input"]').clear();
      cy.get('[data-cy="product-card"]').should('have.length.greaterThan', 0);
    });
  });

  describe('Product Sorting', () => {
    it('should have sort dropdown', () => {
      cy.get('[data-cy="sort-dropdown"]').should('exist');
    });

    it('should sort products by price low to high', () => {
      cy.get('[data-cy="sort-dropdown"]').click();
      cy.contains('Low to High').click();
      cy.wait(500);

      // Verify products are sorted
      cy.get('[data-cy="product-price"]').then($prices => {
        const prices = [...$prices].map(el =>
          parseFloat(el.textContent.replace(/[^0-9.]/g, ''))
        );
        const sortedPrices = [...prices].sort((a, b) => a - b);
        expect(prices).to.deep.equal(sortedPrices);
      });
    });

    it('should sort products by price high to low', () => {
      cy.get('[data-cy="sort-dropdown"]').click();
      cy.contains('High to Low').click();
      cy.wait(500);

      // Verify products are sorted in descending order
      cy.get('[data-cy="product-price"]').then($prices => {
        const prices = [...$prices].map(el =>
          parseFloat(el.textContent.replace(/[^0-9.]/g, ''))
        );
        const sortedPrices = [...prices].sort((a, b) => b - a);
        expect(prices).to.deep.equal(sortedPrices);
      });
    });
  });

  describe('Product Categories', () => {
    it('should display category filter', () => {
      cy.get('[data-cy="category-filter"]').should('exist');
    });

    it('should filter products by category', () => {
      cy.get('[data-cy="category-filter"]').click();
      cy.get('[data-cy="category-option"]').first().click();
      cy.wait(500);
      cy.get('[data-cy="product-card"]').should('exist');
    });

    it('should navigate to categories page', () => {
      cy.get('[href="/categories"]').first().click();
      cy.url().should('include', '/categories');
    });
  });

  describe('Product Filters', () => {
    it('should have advanced filters section', () => {
      cy.get('[data-cy="filters-section"]').should('exist');
    });

    it('should filter by price range', () => {
      cy.get('[data-cy="price-from"]').clear().type('0');
      cy.get('[data-cy="price-to"]').clear().type('100');
      cy.get('[data-cy="apply-filter"]').click();
      cy.wait(500);

      // Verify filtered results
      cy.get('[data-cy="product-price"]').each($price => {
        const price = parseFloat($price.text().replace(/[^0-9.]/g, ''));
        expect(price).to.be.lte(100);
      });
    });

    it('should filter by subcategory', () => {
      cy.get('[data-cy="subcategory-filter"]').should('exist');
      cy.get('[data-cy="subcategory-checkbox"]').first().check();
      cy.wait(500);
      cy.get('[data-cy="product-card"]').should('exist');
    });

    it('should clear all filters', () => {
      cy.get('[data-cy="price-from"]').type('50');
      cy.get('[data-cy="clear-filters"]').click();
      cy.get('[data-cy="price-from"]').should('have.value', '');
    });
  });

  describe('Product Details Navigation', () => {
    it('should navigate to product details on card click', () => {
      cy.get('[data-cy="product-card"]').first().click();
      cy.url().should('include', '/product/');
    });

    it('should display product details page', () => {
      cy.get('[data-cy="product-card"]').first().click();
      cy.get('[data-cy="product-details"]').should('exist');
      cy.get('[data-cy="product-name"]').should('be.visible');
      cy.get('[data-cy="product-price"]').should('be.visible');
      cy.get('[data-cy="product-description"]').should('be.visible');
    });

    it('should be able to navigate back from product details', () => {
      cy.get('[data-cy="product-card"]').first().click();
      cy.go('back');
      cy.url().should('include', '/products/search');
    });
  });

  describe('Add to Cart from Product List', () => {
    it('should have add to cart button on product cards', () => {
      cy.get('[data-cy="product-card"]').first().within(() => {
        cy.get('[data-cy="add-to-cart-btn"]').should('exist');
      });
    });

    it('should add product to cart', () => {
      cy.get('[data-cy="product-card"]').first().within(() => {
        cy.get('[data-cy="add-to-cart-btn"]').click();
      });

      // Verify cart counter updated
      cy.get('[data-cy="cart-counter"]').should('contain', '1');
    });

    it('should show success message when adding to cart', () => {
      cy.get('[data-cy="product-card"]').first().within(() => {
        cy.get('[data-cy="add-to-cart-btn"]').click();
      });

      // Toast or message should appear
      cy.get('[data-cy="toast-message"]', { timeout: 3000 }).should('be.visible');
    });
  });

  describe('Add to Wishlist from Product List', () => {
    it('should have wishlist button on product cards', () => {
      cy.get('[data-cy="product-card"]').first().within(() => {
        cy.get('[data-cy="wishlist-btn"]').should('exist');
      });
    });

    it('should add product to wishlist', () => {
      cy.get('[data-cy="product-card"]').first().within(() => {
        cy.get('[data-cy="wishlist-btn"]').click();
      });

      // Verify wishlist counter updated or button state changed
      cy.get('[data-cy="product-card"]').first().within(() => {
        cy.get('[data-cy="wishlist-btn"]').should('have.class', 'active');
      });
    });

    it('should remove product from wishlist on second click', () => {
      // Add to wishlist
      cy.get('[data-cy="product-card"]').first().within(() => {
        cy.get('[data-cy="wishlist-btn"]').click();
      });

      cy.wait(500);

      // Remove from wishlist
      cy.get('[data-cy="product-card"]').first().within(() => {
        cy.get('[data-cy="wishlist-btn"]').click();
      });

      cy.wait(500);

      cy.get('[data-cy="product-card"]').first().within(() => {
        cy.get('[data-cy="wishlist-btn"]').should('not.have.class', 'active');
      });
    });
  });

  describe('Pagination', () => {
    it('should have pagination controls', () => {
      cy.get('[data-cy="pagination"]').should('exist');
    });

    it('should navigate to next page', () => {
      cy.get('[data-cy="next-page"]').click();
      cy.wait(500);
      cy.get('[data-cy="product-card"]').should('exist');
    });

    it('should navigate to previous page', () => {
      cy.get('[data-cy="next-page"]').click();
      cy.wait(500);
      cy.get('[data-cy="prev-page"]').click();
      cy.wait(500);
      cy.get('[data-cy="product-card"]').should('exist');
    });
  });

  describe('View Modes', () => {
    it('should toggle between grid and list view', () => {
      cy.get('[data-cy="view-toggle"]').should('exist');
      cy.get('[data-cy="list-view-btn"]').click();
      cy.get('[data-cy="product-list"]').should('have.class', 'list-view');

      cy.get('[data-cy="grid-view-btn"]').click();
      cy.get('[data-cy="product-list"]').should('have.class', 'grid-view');
    });
  });

  describe('Responsive Design', () => {
    it('should display properly on mobile', () => {
      cy.viewport('iphone-x');
      cy.get('[data-cy="product-card"]').should('be.visible');
    });

    it('should display properly on tablet', () => {
      cy.viewport('ipad-2');
      cy.get('[data-cy="product-card"]').should('be.visible');
    });

    it('should display mobile menu on small screens', () => {
      cy.viewport('iphone-x');
      cy.get('[data-cy="mobile-menu-toggle"]').should('be.visible');
    });
  });
});

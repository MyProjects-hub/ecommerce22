import { TestBed } from '@angular/core/testing';
import { WishlistService } from './wishlist.service';
import { mockProducts, createMockProduct } from '../testing/mock-data';

describe('WishlistService', () => {
  let service: WishlistService;
  let localStorageSpy: jasmine.SpyObj<Storage>;

  beforeEach(() => {
    // Create a mock localStorage
    const store: { [key: string]: string } = {};
    localStorageSpy = jasmine.createSpyObj('localStorage', ['getItem', 'setItem', 'removeItem', 'clear']);
    localStorageSpy.getItem.and.callFake((key: string) => store[key] || null);
    localStorageSpy.setItem.and.callFake((key: string, value: string) => {
      store[key] = value;
    });
    localStorageSpy.removeItem.and.callFake((key: string) => {
      delete store[key];
    });
    localStorageSpy.clear.and.callFake(() => {
      Object.keys(store).forEach(key => delete store[key]);
    });

    // Replace global localStorage with mock
    Object.defineProperty(window, 'localStorage', {
      value: localStorageSpy,
      writable: true
    });

    TestBed.configureTestingModule({
      providers: [WishlistService]
    });
  });

  afterEach(() => {
    localStorageSpy.clear();
  });

  describe('Initialization', () => {
    it('should be created', () => {
      service = TestBed.inject(WishlistService);
      expect(service).toBeTruthy();
    });

    it('should initialize with empty wishlist when localStorage is empty', (done) => {
      service = TestBed.inject(WishlistService);

      service.getWishListItems().subscribe(items => {
        expect(items).toEqual([]);
        done();
      });
    });

    it('should load wishlist items from localStorage on initialization', (done) => {
      const savedProducts = [mockProducts[0], mockProducts[1]];
      localStorageSpy.getItem.and.returnValue(JSON.stringify(savedProducts));

      service = TestBed.inject(WishlistService);

      service.getWishListItems().subscribe(items => {
        expect(items).toEqual(savedProducts);
        expect(localStorageSpy.getItem).toHaveBeenCalledWith('wishlist');
        done();
      });
    });

    it('should handle corrupted localStorage data gracefully', (done) => {
      localStorageSpy.getItem.and.returnValue('invalid json{');
      spyOn(console, 'error');

      service = TestBed.inject(WishlistService);

      service.getWishListItems().subscribe(items => {
        expect(items).toEqual([]);
        expect(console.error).toHaveBeenCalled();
        done();
      });
    });

    it('should handle localStorage errors gracefully', (done) => {
      localStorageSpy.getItem.and.throwError('Storage error');
      spyOn(console, 'error');

      service = TestBed.inject(WishlistService);

      service.getWishListItems().subscribe(items => {
        expect(items).toEqual([]);
        expect(console.error).toHaveBeenCalled();
        done();
      });
    });
  });

  describe('getWishListItems', () => {
    beforeEach(() => {
      service = TestBed.inject(WishlistService);
    });

    it('should return an observable of wishlist items', (done) => {
      service.getWishListItems().subscribe(items => {
        expect(items).toEqual([]);
        done();
      });
    });

    it('should emit updated wishlist items when wishlist changes', (done) => {
      const product = mockProducts[0];
      let emissionCount = 0;

      service.getWishListItems().subscribe(items => {
        emissionCount++;
        if (emissionCount === 1) {
          expect(items).toEqual([]);
        } else if (emissionCount === 2) {
          expect(items).toEqual([product]);
          done();
        }
      });

      service.addWishListItem(product);
    });
  });

  describe('inWishlist', () => {
    beforeEach(() => {
      service = TestBed.inject(WishlistService);
    });

    it('should return false for empty wishlist', () => {
      expect(service.inWishlist(1)).toBe(false);
    });

    it('should return true if product is in wishlist', () => {
      service.addWishListItem(mockProducts[0]);

      expect(service.inWishlist(mockProducts[0].id)).toBe(true);
    });

    it('should return false if product is not in wishlist', () => {
      service.addWishListItem(mockProducts[0]);

      expect(service.inWishlist(mockProducts[1].id)).toBe(false);
    });

    it('should return false after product is removed from wishlist', () => {
      service.addWishListItem(mockProducts[0]);
      service.removeWishListItem(mockProducts[0]);

      expect(service.inWishlist(mockProducts[0].id)).toBe(false);
    });
  });

  describe('addWishListItem', () => {
    beforeEach(() => {
      service = TestBed.inject(WishlistService);
    });

    it('should add a product to wishlist', (done) => {
      const product = mockProducts[0];

      service.addWishListItem(product);

      service.getWishListItems().subscribe(items => {
        expect(items.length).toBe(1);
        expect(items[0]).toEqual(product);
        done();
      });
    });

    it('should add multiple products to wishlist', (done) => {
      service.addWishListItem(mockProducts[0]);
      service.addWishListItem(mockProducts[1]);

      service.getWishListItems().subscribe(items => {
        expect(items.length).toBe(2);
        expect(items).toContain(mockProducts[0]);
        expect(items).toContain(mockProducts[1]);
        done();
      });
    });

    it('should save wishlist to localStorage when adding item', () => {
      const product = mockProducts[0];

      service.addWishListItem(product);

      expect(localStorageSpy.setItem).toHaveBeenCalledWith('wishlist', JSON.stringify([product]));
    });

    it('should handle localStorage save errors gracefully', (done) => {
      localStorageSpy.setItem.and.throwError('Storage full');
      spyOn(console, 'error');
      const product = mockProducts[0];

      service.addWishListItem(product);

      expect(console.error).toHaveBeenCalled();
      service.getWishListItems().subscribe(items => {
        // Item should not be added if save fails
        expect(items.length).toBe(0);
        done();
      });
    });

    it('should allow adding the same product multiple times', (done) => {
      const product = mockProducts[0];

      service.addWishListItem(product);
      service.addWishListItem(product);

      service.getWishListItems().subscribe(items => {
        expect(items.length).toBe(2);
        expect(items.filter(p => p.id === product.id).length).toBe(2);
        done();
      });
    });

    it('should add different products with different categories', (done) => {
      const product1 = createMockProduct({ id: 1, categoryId: 1 });
      const product2 = createMockProduct({ id: 2, categoryId: 2 });

      service.addWishListItem(product1);
      service.addWishListItem(product2);

      service.getWishListItems().subscribe(items => {
        expect(items.length).toBe(2);
        expect(items[0].categoryId).toBe(1);
        expect(items[1].categoryId).toBe(2);
        done();
      });
    });
  });

  describe('removeWishListItem', () => {
    beforeEach(() => {
      service = TestBed.inject(WishlistService);
    });

    it('should remove a product from wishlist', (done) => {
      const product = mockProducts[0];
      service.addWishListItem(product);

      service.removeWishListItem(product);

      service.getWishListItems().subscribe(items => {
        expect(items.length).toBe(0);
        done();
      });
    });

    it('should remove only the specified product', (done) => {
      service.addWishListItem(mockProducts[0]);
      service.addWishListItem(mockProducts[1]);

      service.removeWishListItem(mockProducts[0]);

      service.getWishListItems().subscribe(items => {
        expect(items.length).toBe(1);
        expect(items[0]).toEqual(mockProducts[1]);
        done();
      });
    });

    it('should save updated wishlist to localStorage when removing item', () => {
      service.addWishListItem(mockProducts[0]);
      service.addWishListItem(mockProducts[1]);

      service.removeWishListItem(mockProducts[0]);

      expect(localStorageSpy.setItem).toHaveBeenCalledWith('wishlist', JSON.stringify([mockProducts[1]]));
    });

    it('should handle localStorage save errors when removing', (done) => {
      service.addWishListItem(mockProducts[0]);
      localStorageSpy.setItem.and.throwError('Storage error');
      spyOn(console, 'error');

      service.removeWishListItem(mockProducts[0]);

      expect(console.error).toHaveBeenCalled();
      service.getWishListItems().subscribe(items => {
        // Item should not be removed if save fails
        expect(items.length).toBe(1);
        done();
      });
    });

    it('should do nothing when removing non-existent product', (done) => {
      service.addWishListItem(mockProducts[0]);

      service.removeWishListItem(mockProducts[1]);

      service.getWishListItems().subscribe(items => {
        expect(items.length).toBe(1);
        expect(items[0]).toEqual(mockProducts[0]);
        done();
      });
    });

    it('should remove all instances when product appears multiple times', (done) => {
      const product = mockProducts[0];
      service.addWishListItem(product);
      service.addWishListItem(product);
      service.addWishListItem(product);

      service.removeWishListItem(product);

      service.getWishListItems().subscribe(items => {
        expect(items.length).toBe(0);
        expect(service.inWishlist(product.id)).toBe(false);
        done();
      });
    });
  });

  describe('Integration Tests', () => {
    beforeEach(() => {
      service = TestBed.inject(WishlistService);
    });

    it('should handle complex wishlist operations', (done) => {
      // Add multiple items
      service.addWishListItem(mockProducts[0]);
      service.addWishListItem(mockProducts[1]);
      service.addWishListItem(mockProducts[2]);

      // Check state
      expect(service.inWishlist(mockProducts[0].id)).toBe(true);
      expect(service.inWishlist(mockProducts[1].id)).toBe(true);
      expect(service.inWishlist(mockProducts[2].id)).toBe(true);

      // Remove one item
      service.removeWishListItem(mockProducts[1]);

      service.getWishListItems().subscribe(items => {
        expect(items.length).toBe(2);
        expect(service.inWishlist(mockProducts[1].id)).toBe(false);
        expect(service.inWishlist(mockProducts[0].id)).toBe(true);
        expect(service.inWishlist(mockProducts[2].id)).toBe(true);
        done();
      });
    });

    it('should persist and restore wishlist state', (done) => {
      // Add items
      service.addWishListItem(mockProducts[0]);
      service.addWishListItem(mockProducts[1]);
      service.addWishListItem(mockProducts[2]);

      // Simulate page reload by creating new service instance
      const newService = new WishlistService();

      newService.getWishListItems().subscribe(items => {
        expect(items.length).toBe(3);
        expect(items).toContain(mockProducts[0]);
        expect(items).toContain(mockProducts[1]);
        expect(items).toContain(mockProducts[2]);
        done();
      });
    });

    it('should handle adding and removing same product sequentially', (done) => {
      const product = mockProducts[0];

      service.addWishListItem(product);
      expect(service.inWishlist(product.id)).toBe(true);

      service.removeWishListItem(product);
      expect(service.inWishlist(product.id)).toBe(false);

      service.addWishListItem(product);
      expect(service.inWishlist(product.id)).toBe(true);

      service.getWishListItems().subscribe(items => {
        expect(items.length).toBe(1);
        expect(items[0]).toEqual(product);
        done();
      });
    });
  });
});

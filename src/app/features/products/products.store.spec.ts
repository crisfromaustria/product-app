import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ProductsStore } from './products.store';
import { ProductsService } from '../../api';

const mockProducts = [
  { id: '1', name: 'Product A', price: 10 },
  { id: '2', name: 'Product B', price: 20 },
];

const mockProductsService = {
  getAll: vi.fn().mockReturnValue(of(mockProducts)),
  getById: vi.fn().mockReturnValue(of(mockProducts[0])),
  create: vi.fn().mockReturnValue(of({ id: '3', name: 'New Product', price: 30 })),
  update: vi.fn().mockReturnValue(of({ id: '1', name: 'Updated', price: 99 })),
  _delete: vi.fn().mockReturnValue(of(null)),
};

describe('ProductsStore', () => {
  let store: InstanceType<typeof ProductsStore>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ProductsStore,
        { provide: ProductsService, useValue: mockProductsService }
      ]
    });
    store = TestBed.inject(ProductsStore);
  });

  it('should have empty initial state', () => {
    console.log('test: empty initial state', {
      products: store.products(),
      selectedProduct: store.selectedProduct(),
      loading: store.loading()
    });
    expect(store.products()).toEqual([]);
    expect(store.selectedProduct()).toBeNull();
    expect(store.loading()).toBe(false);
  });

  it('should load all products', async () => {
    console.log('test: load all products');
    TestBed.flushEffects();
    store.loadAll();
    await Promise.resolve();
    expect(store.products()).toEqual(mockProducts);
    expect(store.loading()).toBe(false);
  });

  it('should load product by id', async () => {
    console.log('test: load product by id', { id: '1' });
    TestBed.flushEffects();
    store.loadById('1');
    await Promise.resolve();
    expect(store.selectedProduct()).toEqual(mockProducts[0]);
  });

  it('should create a product and add it to the list', async () => {
    console.log('test: create product', { name: 'New Product', price: 30 });
    await store.create({ name: 'New Product', price: 30 });
    expect(store.products().length).toBe(1);
    expect(store.products()[0].name).toBe('New Product');
  });

  it('should update a product in the list', async () => {
    store.loadAll();
    await Promise.resolve();
    await store.update('1', { name: 'Updated', price: 99 });
    const updated = store.products().find(p => p.id === '1');
    expect(updated?.name).toBe('Updated');
  });

  it('should delete a product from the list', async () => {
    await store.create({ name: 'New Product', price: 30 });
    await store.delete('3');
    expect(store.products().find(p => p.id === '3')).toBeUndefined();
  });

  it('should clear selected product', () => {
    store.clearSelected();
    expect(store.selectedProduct()).toBeNull();
  });
});

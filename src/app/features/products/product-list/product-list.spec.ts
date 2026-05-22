import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { ProductList } from './product-list';
import { ProductsStore } from '../products.store';
import { MatDialog } from '@angular/material/dialog';

const mockProducts = [
  { id: '1', name: 'Product A', price: 10 },
  { id: '2', name: 'Product B', price: 20 },
];

const mockStore = {
  products: signal(mockProducts),
  loading: signal(false),
  loadAll: vi.fn(),
  delete: vi.fn(),
};

const mockDialog = {
  open: vi.fn().mockReturnValue({
    afterClosed: () => of(true)
  })
};

describe('ProductList', () => {
  let fixture: ComponentFixture<ProductList>;
  let component: ProductList;

  beforeEach(async () => {
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [ProductList],
      providers: [
        provideRouter([]),
        { provide: ProductsStore, useValue: mockStore },
        { provide: MatDialog, useValue: mockDialog },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    console.log('Component instance');
    expect(component).toBeTruthy();
  });

  it('should call loadAll on init', () => {
    expect(mockStore.loadAll).toHaveBeenCalled();
  });

  it('should display all products in the table', () => {
    const rows = fixture.nativeElement.querySelectorAll('tr[mat-row]');
    expect(rows.length).toBe(mockProducts.length);
  });

  it('should display product names in the table', () => {
    const cells = fixture.nativeElement.querySelectorAll('td[mat-cell]');
    const names = Array.from(cells).map((c: any) => c.textContent.trim()).filter(Boolean);
    expect(names).toContain('Product A');
    expect(names).toContain('Product B');
  });

  it('should navigate to /products/new when New Product is clicked', () => {
    console.log('test: navigation to /products/new');
    const router = TestBed.inject(Router);
    const spy = vi.spyOn(router, 'navigate');
    const newButton = fixture.nativeElement.querySelector('button[color="primary"]');
    newButton.click();
    expect(spy).toHaveBeenCalledWith(['/products/new']);
  });

  it('should navigate to edit route when edit button is clicked', () => {
    console.log('test:navigation to edit route');
    const router = TestBed.inject(Router);
    const spy = vi.spyOn(router, 'navigate');
    const editButton = fixture.nativeElement.querySelector('button[mat-icon-button]');
    editButton.click();
    expect(spy).toHaveBeenCalledWith(['/products', '1', 'edit']);
  });

  it('should open confirm dialog and delete product when confirmed', async () => {
    component.deleteProduct(mockProducts[0]);
    await fixture.whenStable();
    expect(mockDialog.open).toHaveBeenCalled();
    expect(mockStore.delete).toHaveBeenCalledWith('1');
  });

  it('should not delete product when dialog is cancelled', async () => {
    mockDialog.open.mockReturnValue({ afterClosed: () => of(false) });
    component.deleteProduct(mockProducts[0]);
    await fixture.whenStable();
    expect(mockStore.delete).not.toHaveBeenCalled();
  });
});

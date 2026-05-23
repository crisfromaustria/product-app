import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router, ActivatedRoute } from '@angular/router';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { ProductForm } from './product-form';
import { ProductsStore } from '../products.store';
import { MatDialog } from '@angular/material/dialog';

const mockProduct = { id: '1', name: 'Product A', price: 10 };

const createMockStore = (selectedProduct: any = null) => ({
  selectedProduct: signal(selectedProduct),
  loading: signal(false),
  loadById: vi.fn(),
  create: vi.fn().mockResolvedValue(undefined),
  update: vi.fn().mockResolvedValue(undefined),
  clearSelected: vi.fn(),
});

const mockDialog = {
  open: vi.fn().mockReturnValue({
    afterClosed: () => of(true)
  })
};

const createRoute = (id: string | null) => ({
  snapshot: { paramMap: { get: () => id } }
});

describe('ProductForm — create mode', () => {
  let fixture: ComponentFixture<ProductForm>;
  let component: ProductForm;
  let mockStore: ReturnType<typeof createMockStore>;
  let router: Router;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockStore = createMockStore();

    await TestBed.configureTestingModule({
      imports: [ProductForm],
      providers: [
        provideRouter([]),
        { provide: ProductsStore, useValue: mockStore },
        { provide: MatDialog, useValue: mockDialog },
        { provide: ActivatedRoute, useValue: createRoute(null) }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
    router = TestBed.inject(Router);
  });

  it('should create the component', () => {
    console.log('component: ', component);
    expect(component).toBeTruthy();
  });

  it('should start with an empty form', () => {
    expect(component.form.value.name).toBe('');
    expect(component.form.value.price).toBe(0);
  });

  it('should be in create mode', () => {
    expect(component.isEditMode()).toBe(false);
  });

  it('should not call loadById in create mode', () => {
    expect(mockStore.loadById).not.toHaveBeenCalled();
  });

  it('should disable save button when name is empty', () => {
    const saveButton = fixture.nativeElement.querySelector('button[color="primary"]');
    expect(saveButton.disabled).toBe(true);
  });

  it('should enable save button when name is filled', async () => {
    component.form.patchValue({ name: 'New Product' });
    fixture.detectChanges();
    const saveButton = fixture.nativeElement.querySelector('button[color="primary"]');
    expect(saveButton.disabled).toBe(false);
  });

  it('should call store.create and navigate on save', async () => {
    const spy = vi.spyOn(router, 'navigate');
    component.form.patchValue({ name: 'New Product', price: 99 });
    await component.save();
    expect(mockStore.create).toHaveBeenCalledWith({ name: 'New Product', price: 99 });
    expect(spy).toHaveBeenCalledWith(['/products']);
  });

  it('should not call store.create when form is invalid', async () => {
    component.form.patchValue({ name: '' });
    await component.save();
    expect(mockStore.create).not.toHaveBeenCalled();
  });

  it('should navigate immediately on cancel when form is not dirty', () => {
    const spy = vi.spyOn(router, 'navigate');
    component.cancel();
    expect(mockDialog.open).not.toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith(['/products']);
  });

  it('should open confirm dialog on cancel when form is dirty', () => {
    component.form.markAsDirty();
    component.cancel();
    expect(mockDialog.open).toHaveBeenCalled();
  });

  it('should navigate after confirming discard', async () => {
    const spy = vi.spyOn(router, 'navigate');
    component.form.markAsDirty();
    component.cancel();
    await fixture.whenStable();
    expect(spy).toHaveBeenCalledWith(['/products']);
  });

  it('should not navigate when discard is cancelled', async () => {
    mockDialog.open.mockReturnValue({ afterClosed: () => of(false) });
    const spy = vi.spyOn(router, 'navigate');
    component.form.markAsDirty();
    component.cancel();
    await fixture.whenStable();
    expect(spy).not.toHaveBeenCalled();
  });

  it('should call clearSelected on destroy', () => {
    component.ngOnDestroy();
    expect(mockStore.clearSelected).toHaveBeenCalled();
  });
});

describe('ProductForm — edit mode', () => {
  let fixture: ComponentFixture<ProductForm>;
  let component: ProductForm;
  let mockStore: ReturnType<typeof createMockStore>;
  let router: Router;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockStore = createMockStore(mockProduct);

    await TestBed.configureTestingModule({
      imports: [ProductForm],
      providers: [
        provideRouter([]),
        { provide: ProductsStore, useValue: mockStore },
        { provide: MatDialog, useValue: mockDialog },
        { provide: ActivatedRoute, useValue: createRoute('1') }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
    router = TestBed.inject(Router);
  });

  it('should call loadById with the route id', () => {
    expect(mockStore.loadById).toHaveBeenCalledWith('1');
  });

  it('should be in edit mode', () => {
    expect(component.isEditMode()).toBe(true);
  });

  it('should pre-fill the form with the selected product', () => {
    expect(component.form.value.name).toBe('Product A');
    expect(component.form.value.price).toBe(10);
  });

  it('should call store.update and navigate on save', async () => {
    const spy = vi.spyOn(router, 'navigate');
    component.form.patchValue({ name: 'Updated', price: 99 });
    await component.save();
    expect(mockStore.update).toHaveBeenCalledWith('1', { name: 'Updated', price: 99 });
    expect(spy).toHaveBeenCalledWith(['/products']);
  });

  it('should not call store.create in edit mode', async () => {
    component.form.patchValue({ name: 'Updated' });
    await component.save();
    expect(mockStore.create).not.toHaveBeenCalled();
  });
});

import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';
import { Product, ProductRequest, ProductsService } from '../../api';

interface ProductsState {
  products: Product[];
  selectedProduct: Product | null;
  loading: boolean;
}

const initialState: ProductsState = {
  products: [],
  selectedProduct: null,
  loading: false,
};

export const ProductsStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store, productsService = inject(ProductsService)) => ({
    loadAll: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true })),
        switchMap(() => productsService.getAll()),
        tap(products => patchState(store, { products, loading: false }))
      )
    ),

    loadById: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { loading: true, selectedProduct: null })),
        switchMap(id => productsService.getById(id)),
        tap(selectedProduct => patchState(store, { selectedProduct, loading: false }))
      )
    ),

    async create(request: ProductRequest): Promise<void> {
      const product = await productsService.create(request).toPromise();
      patchState(store, { products: [...store.products(), product!] });
    },

    async update(id: string, request: ProductRequest): Promise<void> {
      const updated = await productsService.update(id, request).toPromise();
      patchState(store, {
        products: store.products().map(p => p.id === id ? updated! : p)
      });
    },

    async delete(id: string): Promise<void> {
      await productsService._delete(id).toPromise();
      patchState(store, { products: store.products().filter(p => p.id !== id) });
    },

    clearSelected(): void {
      patchState(store, { selectedProduct: null });
    }
  }))
);

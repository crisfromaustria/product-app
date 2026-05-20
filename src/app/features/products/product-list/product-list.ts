import { Component, inject, OnInit, signal } from '@angular/core';
import { Product, ProductsService } from '../../../api';

@Component({
  selector: 'app-product-list',
  imports: [],
  templateUrl: './product-list.html',
  styleUrl: './product-list.scss',
})
export class ProductList implements OnInit {
  private productsService = inject(ProductsService);
  products = signal<Product[]>([]);

  ngOnInit(): void {
    this.productsService.getAll().subscribe((products) => {
      this.products.set(products);
      console.log('Products loaded:', products);
    });
  }
}

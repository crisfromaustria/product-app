import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Product, ProductsService } from '../../../api';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialog } from '../../../shared/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-product-list',
  imports: [MatTableModule, MatButtonModule, MatIconModule],
  templateUrl: './product-list.html',
  styleUrl: './product-list.scss',
})
export class ProductList implements OnInit {
  private productsService = inject(ProductsService);
  private router = inject(Router);
  private dialog = inject(MatDialog);

  products = signal<Product[]>([]);
  displayedColumns = ['name', 'price', 'actions'];

  ngOnInit(): void {
    this.productsService.getAll().subscribe((products) => {
      this.products.set(products);
    });
  }

  createProduct(): void {
    this.router.navigate(['/products/new']);
  }

  editProduct(product: Product): void {
    this.router.navigate(['/products', product.id, 'edit']);
  }

  deleteProduct(product: Product): void {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      data: {
        title: 'Delete Product',
        message: `Are you sure you want to delete "${product.name}"?`
      }
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.productsService._delete(product.id!).subscribe(() => {
          this.products.update(list => list.filter(p => p.id !== product.id));
        });
      }
    });
  }
}

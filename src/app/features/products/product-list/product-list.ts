import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Product } from '../../../api';
import { ProductsStore } from '../products.store';
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
  private store = inject(ProductsStore);
  private router = inject(Router);
  private dialog = inject(MatDialog);

  products = this.store.products;
  loading = this.store.loading;
  displayedColumns = ['name', 'price', 'actions'];

  ngOnInit(): void {
    console.log('ngOnInit()');
    this.store.loadAll();
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
        this.store.delete(product.id!);
      }
    });
  }
}

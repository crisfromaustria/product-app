import { Component, inject, OnInit, OnDestroy, computed, effect } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductsStore } from '../products.store';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialog } from '../../../shared/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-product-form',
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  templateUrl: './product-form.html',
  styleUrl: './product-form.scss',
})
export class ProductForm implements OnInit, OnDestroy {
  private store = inject(ProductsStore);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private dialog = inject(MatDialog);

  private editId: string | null = null;
  public isEditMode = computed(() => !!this.store.selectedProduct());

  public form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(1)]],
    price: [0, Validators.required]
  });

  public constructor() {
    console.log('constructor...');
    effect(() => {
      console.log('effect...');
      const product = this.store.selectedProduct();
      if (product) {
        this.form.patchValue({ name: product.name, price: product.price });
      }
    });
  }

  public ngOnInit(): void {
    console.log('ngOnInit...');
    this.editId = this.route.snapshot.paramMap.get('id');
    if (this.editId) {
      this.store.loadById(this.editId);
    }
  }

  public ngOnDestroy(): void {
    console.log('ngOnDestroy...');
    this.store.clearSelected();
  }

  async save(): Promise<void> {
    console.log('save...');
    if (this.form.invalid) return;

    const request = {
      name: this.form.value.name!,
      price: this.form.value.price
    };

    if (this.editId) {
      await this.store.update(this.editId, request);
    } else {
      await this.store.create(request);
    }

    this.router.navigate(['/products']);
  }

  public cancel(): void {
    if (!this.form.dirty) {
      this.router.navigate(['/products']);
      return;
    }

    this.dialog.open(ConfirmDialog, {
      data: {
        title: 'Discard Changes',
        message: 'Are you sure you want to discard all changes?'
      }
    }).afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.router.navigate(['/products']);
      }
    });
  }
}

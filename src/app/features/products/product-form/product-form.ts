import { Component, inject, OnInit, OnDestroy, computed, effect } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductsStore } from '../products.store';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

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

  editId: string | null = null;
  isEditMode = computed(() => !!this.store.selectedProduct());

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(1)]],
    price: [0, Validators.required]
  });

  constructor() {
    effect(() => {
      const product = this.store.selectedProduct();
      if (product) {
        this.form.patchValue({ name: product.name, price: product.price });
      }
    });
  }

  ngOnInit(): void {
    this.editId = this.route.snapshot.paramMap.get('id');
    if (this.editId) {
      this.store.loadById(this.editId);
    }
  }

  ngOnDestroy(): void {
    this.store.clearSelected();
  }

  async save(): Promise<void> {
    if (this.form.invalid) return;

    const request = {
      name: this.form.value.name!,
      price: this.form.value.price ?? undefined
    };

    if (this.editId) {
      await this.store.update(this.editId, request);
    } else {
      await this.store.create(request);
    }

    this.router.navigate(['/products']);
  }

  cancel(): void {
    this.router.navigate(['/products']);
  }
}

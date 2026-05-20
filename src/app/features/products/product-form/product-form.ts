import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductsService } from '../../../api';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-product-form',
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  templateUrl: './product-form.html',
  styleUrl: './product-form.scss',
})
export class ProductForm implements OnInit {
  private productsService = inject(ProductsService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);

  editId = signal<string | null>(null);

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(1)]],
    price: [0, Validators.required]
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.editId.set(id);
      this.productsService.getById(id).subscribe(product => {
        this.form.patchValue({ name: product.name, price: product.price });
      });
    }
  }

  save(): void {
    if (this.form.invalid) return;

    const request = {
      name: this.form.value.name!,
      price: this.form.value.price ?? undefined
    };

    const id = this.editId();
    const operation = id
      ? this.productsService.update(id, request)
      : this.productsService.create(request);

    operation.subscribe(() => this.router.navigate(['/products']));
  }

  cancel(): void {
    this.router.navigate(['/products']);
  }
}

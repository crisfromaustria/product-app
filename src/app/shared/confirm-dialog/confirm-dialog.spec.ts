import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ConfirmDialog } from './confirm-dialog';

const mockDialogData = {
  title: 'Delete Product',
  message: 'Are you sure you want to delete "Product A"?'
};

const mockDialogRef = {
  close: vi.fn()
};

describe('ConfirmDialog', () => {
  let fixture: ComponentFixture<ConfirmDialog>;
  let component: ConfirmDialog;

  beforeEach(async () => {
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [ConfirmDialog],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: mockDialogData },
        { provide: MatDialogRef, useValue: mockDialogRef }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should display the title', () => {
    const title = fixture.nativeElement.querySelector('[mat-dialog-title]');
    expect(title.textContent.trim()).toBe(mockDialogData.title);
  });

  it('should display the message', () => {
    const content = fixture.nativeElement.querySelector('mat-dialog-content');
    expect(content.textContent.trim()).toBe(mockDialogData.message);
  });

  it('should close with true when confirm is clicked', () => {
    const confirmButton = fixture.nativeElement.querySelector('button[color="warn"]');
    confirmButton.click();
    expect(mockDialogRef.close).toHaveBeenCalledWith(true);
  });

  it('should close with false when cancel is clicked', () => {
    const cancelButton = fixture.nativeElement.querySelector('button[mat-button]');
    cancelButton.click();
    expect(mockDialogRef.close).toHaveBeenCalledWith(false);
  });
});

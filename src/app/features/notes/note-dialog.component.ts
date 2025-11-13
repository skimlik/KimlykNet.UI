import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Note } from './note.model';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

export interface NoteDialogData {
  mode: 'create' | 'edit';
  note?: Note;
}

@Component({
  selector: 'app-note-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    FormsModule,
    MatSlideToggleModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ data.mode === 'create' ? 'Create New Note' : 'Edit Note' }}</h2>
    <mat-dialog-content>
      <mat-form-field class="full-width">
        <mat-label>Title</mat-label>
        <input matInput [(ngModel)]="title" placeholder="Enter note title" required />
      </mat-form-field>
      <mat-slide-toggle [(ngModel)]="isPublic">Can share</mat-slide-toggle>
      <mat-form-field class="full-width">
        <mat-label>Note</mat-label>
        <textarea
          matInput
          [(ngModel)]="text"
          placeholder="Enter your note (markdown supported)"
          rows="10"
          required
        ></textarea>
        <mat-hint>You can use markdown formatting</mat-hint>
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button matButton (click)="onCancel()">Cancel</button>
      <button matButton="filled" (click)="onSave()" [disabled]="!title || !text">
        {{ data.mode === 'create' ? 'Create' : 'Save' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      mat-dialog-content {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        min-width: 500px;
      }

      .full-width {
        width: 100%;
      }
    `,
  ],
})
export class NoteDialogComponent {
  data = inject<NoteDialogData>(MAT_DIALOG_DATA);
  dialogRef = inject(MatDialogRef<NoteDialogComponent>);

  title = this.data.note?.title || '';
  text = this.data.note?.text || '';
  isPublic = this.data.note?.isPublic ?? false;

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.title && this.text) {
      this.dialogRef.close({ title: this.title, text: this.text, isPublic: this.isPublic } as Note);
    }
  }
}

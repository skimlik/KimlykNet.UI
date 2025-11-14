import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { MarkdownModule } from 'ngx-markdown';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { API_URL } from 'src/app/app.config';
import { AuthService } from '@core/index';
import { OverContentSpinner } from '@core/components';
import { Note, NoteBase } from './note.model';
import { NoteDialogComponent } from './note-dialog.component';
import { ConfirmDeleteDialogComponent } from './confirm-delete-dialog.component';

@Component({
  selector: 'app-note-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MarkdownModule,
    OverContentSpinner,
  ],
  template: `
    @if (loading()) {
      <app-over-content-spinner [spinning]="loading()"></app-over-content-spinner>
    }
    <div class="note-detail-container">
      @if (note(); as noteData) {
        <div class="header">
          <button matButton (click)="goBack()" class="back-button">
            <mat-icon>arrow_back</mat-icon>
            Back to Notes
          </button>
          <div class="actions">
            @if (canEdit()) {
              <button matButton (click)="editNote()" aria-label="Edit note">
                <mat-icon>edit</mat-icon>
                Edit
              </button>
            }
            @if (noteData.isPublic) {
              <button matButton (click)="shareNote()" aria-label="Share note">
                <mat-icon>share</mat-icon>
                Share
              </button>
            }
            @if (canEdit()) {
              <button matButton (click)="deleteNote()" aria-label="Delete note" color="warn">
                <mat-icon>delete</mat-icon>
                Delete
              </button>
            }
          </div>
        </div>

        <mat-card appearance="outlined" class="note-card">
          <mat-card-header>
            <mat-card-title>{{ noteData.title }}</mat-card-title>
            <mat-card-subtitle>
              Created: {{ noteData.createdDate | date: 'medium' }}<br />
              Modified: {{ noteData.modifiedDate | date: 'medium' }}
            </mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="note-content" markdown [data]="noteData.text"></div>
          </mat-card-content>
        </mat-card>
      } @else if (!loading()) {
        <div class="error-state">
          <mat-icon class="error-icon">error_outline</mat-icon>
          <h2>Note not found</h2>
          <p>The note you're looking for doesn't exist or has been deleted.</p>
          <button matButton="filled" (click)="goBack()">Go back to Notes</button>
        </div>
      }
    </div>
  `,
  styles: `
    .note-detail-container {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      gap: 16px;
      flex-wrap: wrap;
    }

    .back-button {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .actions {
      display: flex;
      gap: 8px;
    }

    .note-card {
      mat-card-header {
        margin-bottom: 16px;
      }

      mat-card-title {
        font-size: 2rem;
        margin-bottom: 8px;
      }

      mat-card-subtitle {
        font-size: 0.875rem;
        opacity: 0.7;
      }

      mat-card-content {
        padding-top: 16px;
      }
    }

    .note-content {
      font-size: 1rem;
      line-height: 1.6;
      white-space: pre-wrap;
      word-wrap: break-word;

      :deep(h1),
      :deep(h2),
      :deep(h3),
      :deep(h4),
      :deep(h5),
      :deep(h6) {
        margin-top: 24px;
        margin-bottom: 16px;
        white-space: normal;
      }

      :deep(p) {
        margin-bottom: 16px;
      }

      :deep(pre) {
        margin: 16px 0;
        overflow-x: auto;
        white-space: pre;
      }

      :deep(code) {
        font-family: 'Courier New', monospace;
      }

      :deep(ul),
      :deep(ol) {
        margin-bottom: 16px;
        white-space: normal;
      }

      :deep(blockquote) {
        margin: 16px 0;
        padding-left: 16px;
        border-left: 4px solid rgba(0, 0, 0, 0.12);
      }
    }

    .error-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px 24px;
      text-align: center;

      .error-icon {
        font-size: 64px;
        width: 64px;
        height: 64px;
        opacity: 0.5;
        margin-bottom: 16px;
      }

      h2 {
        margin: 0 0 8px 0;
      }

      p {
        margin: 0 0 24px 0;
        opacity: 0.7;
      }
    }
  `,
})
export class NoteDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly apiBase = inject(API_URL);
  private readonly auth = inject(AuthService);
  private readonly http = inject(HttpClient);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  protected canEdit = signal<boolean>(false);
  protected loading = signal(false);
  protected note = signal<Note | null>(null);

  ngOnInit(): void {
    // Get canEdit from navigation state
    const state = history.state as { canEdit?: boolean };
    this.canEdit.set(state?.canEdit ?? false);

    const noteId = this.route.snapshot.paramMap.get('noteId');
    if (noteId) {
      this.loadNote(noteId);
    }
  }

  private loadNote(noteId: string): void {
    this.loading.set(true);
    const headers = this.authHeader;
    this.http.get<Note>(`${this.apiBase}/api/usernotes/${noteId}`, { headers }).subscribe({
      next: (value) => {
        this.note.set(value);
        this.loading.set(false);
      },
      error: () => {
        this.note.set(null);
        this.loading.set(false);
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/notes'], { replaceUrl: true });
  }

  editNote(): void {
    const currentNote = this.note();
    if (!currentNote) return;

    const dialogRef = this.dialog.open(NoteDialogComponent, {
      width: '600px',
      data: { mode: 'edit', note: currentNote },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const update: NoteBase = {
          title: result.title,
          text: result.text,
          isPublic: result.isPublic,
        };

        this.loading.set(true);
        const headers = this.authHeader;
        this.http
          .put<Note>(`${this.apiBase}/api/usernotes/${currentNote.noteId}`, update, { headers })
          .subscribe({
            next: (value) => {
              this.note.set(value);
              this.loading.set(false);
              this.snackBar.open('Note updated!', 'Close', { duration: 2000 });
            },
            error: () => this.loading.set(false),
          });
      }
    });
  }

  shareNote(): void {
    const currentNote = this.note();
    if (!currentNote) return;

    const shareText = `${currentNote.title}\n\n${currentNote.text}`;

    if (navigator.share) {
      navigator
        .share({
          title: currentNote.title,
          text: shareText,
        })
        .catch(() => {
          this.copyToClipboard(shareText);
        });
    } else {
      this.copyToClipboard(shareText);
    }
  }

  deleteNote(): void {
    const currentNote = this.note();
    if (!currentNote) return;

    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent, {
      width: '400px',
      data: { title: currentNote.title },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        const headers = this.authHeader;
        this.http
          .delete(`${this.apiBase}/api/usernotes/${currentNote.noteId}`, { headers })
          .subscribe(() => {
            this.snackBar.open('Note deleted!', 'Close', { duration: 2000 });
            this.goBack();
          });
      }
    });
  }

  private copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).then(() => {
      this.snackBar.open('Note copied to clipboard!', 'Close', { duration: 2000 });
    });
  }

  private get authHeader(): HttpHeaders {
    const token = this.auth.token;
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }
}

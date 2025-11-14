import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MarkdownModule } from 'ngx-markdown';
import { Note, NoteBase } from './note.model';
import { NoteDialogComponent } from './note-dialog.component';
import { ConfirmDeleteDialogComponent } from './confirm-delete-dialog.component';
import { API_URL } from 'src/app/app.config';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '@core/index';
import { OverContentSpinner } from '@core/components';
import { NavService, SideNavItem } from '@core/nav';

@Component({
  selector: 'app-notes',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
    MarkdownModule,
    OverContentSpinner,
  ],
  templateUrl: './notes.component.html',
  styleUrl: './notes.component.scss',
})
export class NotesComponent implements OnInit {
  private readonly apiBase = inject(API_URL);
  private readonly auth = inject(AuthService);
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly navItems = inject(NavService);

  protected loading = signal(false);

  private allNotes = signal<Note[]>([]);

  ngOnInit(): void {
    this.refresh();
    this.navItems.update([
      {
        name: 'create_section',
        title: 'Create section',
        type: 'button',
        style: 'filled',
        iconName: 'docs_add_on',
      } as SideNavItem,
    ]);
  }

  protected refresh(): void {
    this.loading.set(true);
    this.allNotes.set([]);

    const headers = this.auth.authHeader;
    this.http.get<Note[]>(`${this.apiBase}/api/usernotes`, { headers }).subscribe({
      next: (value) => {
        this.loading.set(false);
        this.allNotes.set(value);
      },
      error: (_) => this.loading.set(false),
      complete: () => this.loading.set(false),
    });
  }

  // Sort notes by creation date (newest first)
  notes = computed(() =>
    [...this.allNotes()].sort(
      (a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime(),
    ),
  );

  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  createNote(): void {
    const dialogRef = this.dialog.open(NoteDialogComponent, {
      width: '600px',
      data: { mode: 'create' },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const newNote: NoteBase = {
          title: result.title,
          text: result.text,
          isPublic: result.isPublic,
        };
        this.loading.set(true);
        const headers = this.auth.authHeader;
        this.http.post<Note>(`${this.apiBase}/api/usernotes`, newNote, { headers }).subscribe({
          next: (value) => {
            this.allNotes.update((notes) => [...notes, value]);
            this.loading.set(false);
            this.snackBar.open('Note created!', 'Close', { duration: 2000 });
          },
          error: () => this.loading.set(false),
        });
      }
    });
  }

  editNote(note: Note): void {
    const dialogRef = this.dialog.open(NoteDialogComponent, {
      width: '600px',
      data: { mode: 'edit', note },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const update: NoteBase = {
          title: result.title,
          text: result.text,
          isPublic: result.isPublic,
        };

        this.loading.set(true);
        const headers = this.auth.authHeader;
        this.http
          .put<Note>(`${this.apiBase}/api/usernotes/${note.noteId}`, update, { headers })
          .subscribe({
            next: (value) => {
              this.allNotes.update((notes) =>
                notes.map((n) =>
                  n.noteId === value.noteId
                    ? ({
                        ...n,
                        title: value.title,
                        text: value.text,
                        isPublic: value.isPublic,
                        modifiedDate: value.createdDate,
                      } as Note)
                    : n,
                ),
              );

              this.loading.set(false);
              this.snackBar.open('Note updated!', 'Close', { duration: 2000 });
            },
            error: () => this.loading.set(false),
          });
      }
    });
  }

  shareNote(note: Note): void {
    const shareText = `${note.title}\n\n${note.text}`;

    if (navigator.share) {
      navigator
        .share({
          title: note.title,
          text: shareText,
        })
        .catch(() => {
          this.copyToClipboard(shareText);
        });
    } else {
      this.copyToClipboard(shareText);
    }
  }

  deleteNote(note: Note): void {
    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent, {
      width: '400px',
      data: { title: note.title },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        const headers = this.auth.authHeader;
        this.http
          .delete(`${this.apiBase}/api/usernotes/${note.noteId}`, { headers })
          .subscribe(() => {
            this.allNotes.update((notes) => notes.filter((n) => n.noteId !== note.noteId));
            this.snackBar.open('Note deleted!', 'Close', { duration: 2000 });
          });
      }
    });
  }

  private copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).then(() => {
      this.snackBar.open('Note copied to clipboard!', 'Close', { duration: 2000 });
    });
  }

  openNote(note: Note): void {
    this.router.navigate(['/notes', note.noteId], {
      state: { canEdit: true },
    });
  }
}

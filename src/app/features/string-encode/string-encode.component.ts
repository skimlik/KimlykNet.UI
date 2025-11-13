import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAnchor, MatButtonModule } from '@angular/material/button';
import { API_URL } from 'src/app/app.config';
import { HttpClient } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { Clipboard } from '@angular/cdk/clipboard';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError } from 'rxjs';
import { OverContentSpinner } from '@core/components';

@Component({
  selector: 'app-string-encoder',
  standalone: true,
  templateUrl: 'string-encode.component.html',
  styleUrl: 'string-encode.component.scss',
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAnchor,
    MatButtonModule,
    MatIconModule,
    OverContentSpinner,
  ],
})
export class StringEncoderComponent {
  protected readonly text: string | undefined = undefined;
  protected readonly result = signal<string | undefined>(undefined);
  protected readonly loading = signal<boolean>(false);

  private apiBase = inject(API_URL);
  private http = inject(HttpClient);
  private clipboard = inject(Clipboard);
  private snackBar = inject(MatSnackBar);

  onEncode(): void {
    this.loading.set(true);
    this.http
      .post<{ converted: string }>(`${this.apiBase}/api/base64/to`, {
        inputText: this.text,
      })
      .subscribe({
        next: (value) => {
          this.result.set(value.converted);
          this.loading.set(false);
        },
        error: (_) => this.loading.set(false),
      });
  }

  onDecode(): void {
    this.loading.set(true);
    this.http
      .post<{ converted: string }>(`${this.apiBase}/api/base64/from`, {
        inputText: this.text,
      })
      .subscribe({
        next: (value) => {
          this.result.set(value.converted);
          this.loading.set(false);
        },
        error: (_) => this.loading.set(false),
      });
  }

  onCopy(): void {
    const text = this.result();
    if (text) {
      this.clipboard.copy(text);
      this.snackBar.open('Copied to clipboard!', 'Close', {
        duration: 2000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
      });
    }
  }
}

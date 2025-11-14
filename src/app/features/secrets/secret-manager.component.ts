import { HttpClient } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatAnchor, MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { OverContentSpinner } from '@core/components';
import { AuthService } from '@core/index';
import { API_URL } from 'src/app/app.config';
import { Clipboard } from '@angular/cdk/clipboard';

@Component({
  selector: 'app-secret-manager',
  standalone: true,
  templateUrl: 'secret-manager.component.html',
  styleUrl: 'secret-manager.component.scss',
  imports: [
    OverContentSpinner,
    FormsModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatAnchor,
    MatButtonModule,
  ],
})
export class SecretManagerComponent {
  private _http = inject(HttpClient);
  private _apiBase = inject(API_URL);
  private _auth = inject(AuthService);
  private _snack = inject(MatSnackBar);
  private _clipboard = inject(Clipboard);

  protected loading = signal<boolean>(false);
  protected text: string | undefined;
  protected location = signal<string | undefined | null>(undefined);
  protected createdId = signal<string | undefined | null>(undefined);
  protected uiLocation = signal<string | undefined>(undefined);

  onCreate(): void {
    this.loading.set(true);
    const headers = this._auth.authHeader;
    this._http
      .post(
        `${this._apiBase}/api/secret`,
        { value: this.text },
        { headers, observe: 'response', responseType: 'text' },
      )
      .subscribe({
        next: (response) => {
          const location = response.headers.get('location');
          this.location.set(location);
          this.createdId.set(response.body);
          this.uiLocation.set(`${window.location}/${this.createdId}`);
          this.loading.set(false);
        },
        error: (err) => {
          this.loading.set(false);
          let message = 'Server currently unavailable';
          if (err.status === 0) {
            message = 'No connection to backend, cross origin request forbidden';
          }
          this._snack.open(message, 'Close', {
            duration: 2000,
          });
        },
      });
  }

  onCopy(): void {
    const text = this.uiLocation();
    const location = this.location();
    if (location && text) {
      this._clipboard.copy(text);
      this._snack.open('Copied to clipboard!', 'Close', {
        duration: 2000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
      });
    }
  }
}

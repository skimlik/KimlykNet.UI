import { HttpClient } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatAnchor, MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { OverContentSpinner } from '@core/components';
import { AuthService } from '@core/index';
import { API_URL } from 'src/app/app.config';

@Component({
  selector: 'app-data-protection',
  standalone: true,
  templateUrl: 'data-protection.component.html',
  styleUrl: 'data-protection.component.scss',
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
export class DataProtectionComponent {
  private _http = inject(HttpClient);
  private _apiBase = inject(API_URL);
  private _auth = inject(AuthService);

  protected loading = signal<boolean>(false);
  protected text: string | undefined = undefined;
  protected result = signal<string | undefined>(undefined);

  onEncode(): void {
    this.request('encode');
  }

  onDecode(): void {
    this.request('decode');
  }

  private request(endpoint: 'encode' | 'decode'): void {
    this.loading.set(true);
    const headers = this._auth.authHeader;
    this._http
      .post<{
        value: string;
      }>(`${this._apiBase}/api/dataprotection/${endpoint}`, { value: this.text }, { headers })
      .subscribe({
        next: (val) => {
          this.result.set(val.value);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }
}

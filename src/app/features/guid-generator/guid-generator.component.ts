import { HttpClient } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { catchError } from 'rxjs';
import { API_URL } from 'src/app/app.config';
import { OverContentSpinner } from '@core/components';

@Component({
  selector: 'app-guid-generator',
  standalone: true,
  templateUrl: 'guid-generator.component.html',
  styleUrl: 'guid-generator.component.scss',
  imports: [MatButtonModule, OverContentSpinner, OverContentSpinner],
})
export class GuidGeneratorComponent {
  private readonly httpClient = inject(HttpClient);
  private readonly apiBase = inject(API_URL);

  protected guids = signal<string[]>([]);
  protected loading = signal<boolean>(false);

  onGenerate(): void {
    this.loading.set(true);
    const guids = this.guids();
    const guid$ = this.httpClient
      .get<string>(`${this.apiBase}/api/guid`)
      .pipe(
        catchError(() => {
          this.loading.set(false);
          return 'Error';
        }),
      )
      .subscribe((data) => {
        guids.push(data);
        this.guids.set(guids);
        this.loading.set(false);
      });
  }

  onClear(): void {
    this.guids.set([]);
  }
}

import { HttpClient } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { catchError } from 'rxjs';
import { API_URL } from 'src/app/app.config';

@Component({
  selector: 'app-guid-generator',
  standalone: true,
  templateUrl: 'guid-generator.component.html',
  styleUrl: 'guid-generator.component.scss',
  imports: [MatButtonModule],
})
export class GuidGeneratorComponent {
  private readonly httpClient = inject(HttpClient);
  private readonly apiBase = inject(API_URL);

  protected guids = signal<string[]>([]);

  onGenerate(): void {
    const guids = this.guids();
    const guid$ = this.httpClient
      .get<string>(`${this.apiBase}/api/guid`)
      .pipe(catchError(() => 'Error'))
      .subscribe((data) => {
        guids.push(data);
        this.guids.set(guids);
      });
  }

  onClear(): void {
    this.guids.set([]);
  }
}

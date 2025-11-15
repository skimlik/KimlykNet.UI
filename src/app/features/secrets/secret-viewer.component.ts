import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { filter, map } from 'rxjs';
import { API_URL } from 'src/app/app.config';

@Component({
  selector: 'app-secret-viewer',
  standalone: true,
  templateUrl: 'secret-viewer.component.html',
  styleUrl: 'secret-viewer.component.scss',
})
export class SecretViewerComponent implements OnInit {
  private _http = inject(HttpClient);
  private _apiBase = inject(API_URL);
  private _route = inject(ActivatedRoute);

  protected loading = signal<boolean>(false);
  protected message = signal<string | undefined | null>(undefined);

  constructor(private meta: Meta) {
    this.meta.addTags([
      // Prevent all social media previews
      { name: 'robots', content: 'noindex, nofollow, noarchive, nosnippet' },
      { name: 'googlebot', content: 'noindex, nofollow, noarchive, nosnippet' },

      // Prevent Twitter/X previews
      { name: 'twitter:card', content: 'summary' },
      { name: 'twitter:title', content: 'Secret Message' },
      {
        name: 'twitter:description',
        content: 'This message can only be viewed once',
      },

      // Prevent Facebook/WhatsApp/Telegram previews
      { property: 'og:type', content: 'website' },
      { property: 'og:title', content: 'Secret Message' },
      {
        property: 'og:description',
        content: 'This message can only be viewed once',
      },
      { property: 'og:image', content: '' }, // Empty image to discourage preview

      // Prevent caching
      {
        'http-equiv': 'Cache-Control',
        content: 'no-cache, no-store, must-revalidate',
      },
      { 'http-equiv': 'Pragma', content: 'no-cache' },
      { 'http-equiv': 'Expires', content: '0' },
    ]);
  }

  ngOnInit(): void {
    this.loading.set(true);

    this._route.paramMap
      .pipe(
        map((pm) => pm.get('messageId')),
        filter((pmId) => !!pmId),
      )
      .subscribe({
        next: (id) => {
          this._http.get<{ secret: string }>(`${this._apiBase}/api/secret/${id}`).subscribe({
            next: (data) => {
              this.loading.set(false);
              this.message.set(data.secret);
            },
            error: (err) => {
              this.loading.set(false);
              if (err.status === 404) {
                this.message.set('This message does not exist anymore');
              } else {
                this.message.set('Server currently unavailable, please comeback later.');
              }
            },
          });
        },
      });
  }
}

import {
  ApplicationConfig,
  InjectionToken,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router';
import { provideMarkdown } from 'ngx-markdown';

import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

export const API_URL = new InjectionToken<string>('API_URL');
export const TOKEN_AUDIENCE = new InjectionToken<string>('TOKEN_AUDIENCE');

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: TOKEN_AUDIENCE, useValue: environment.tokenAudience },
    { provide: API_URL, useValue: environment.backendUrl },
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideHttpClient(),
    provideRouter(routes, withHashLocation()),
    provideMarkdown(),
  ],
};

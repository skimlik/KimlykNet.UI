import { Routes } from '@angular/router';
import { SignInComponent } from './features/sign-in';
import { HomeComponent } from './features/home';
import { authGuard } from '@core/index';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: 'sign-in',
    component: SignInComponent,
  },
  {
    path: 'guid',
    loadComponent: () =>
      import('./features/guid-generator/guid-generator.component').then(
        (m) => m.GuidGeneratorComponent,
      ),
  },
  {
    path: 'data-protection',
    loadComponent: () =>
      import('./features/data-protection/data-protection.component').then(
        (m) => m.DataProtectionComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'string-encode',
    loadComponent: () =>
      import('./features/string-encode/string-encode.component').then(
        (m) => m.StringEncoderComponent,
      ),
  },
  {
    path: 'rates/nbu',
    loadComponent: () =>
      import('./features/currency-rates/nbu/nbu-rates.component').then((m) => m.NbuRatesComponent),
    title: 'NBU Rates - Base currency UAH',
  },
  {
    path: 'notes',
    loadComponent: () => import('./features/notes/notes.component').then((m) => m.NotesComponent),
    canActivate: [authGuard],
  },
  {
    path: 'notes/:noteId',
    loadComponent: () =>
      import('./features/notes/note-detail.component').then((m) => m.NoteDetailComponent),
    data: { canEdit: false },
  },
];

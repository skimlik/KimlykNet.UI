import { ChangeDetectionStrategy, Component, effect, inject, OnInit } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatAnchor, MatButtonModule } from '@angular/material/button';
import { AuthService } from '@core/index';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatAnchor, MatButtonModule],
  templateUrl: 'sign-in.component.html',
  styleUrl: 'sign-in.component.scss',
  changeDetection: ChangeDetectionStrategy.Default,
})
export class SignInComponent {
  private _auth = inject(AuthService);
  private _fb = inject(FormBuilder);
  private _route = inject(ActivatedRoute);
  private _router = inject(Router);
  private _returnUrl = toSignal(this._route.queryParamMap.pipe(map((pm) => pm.get('returnUrl'))));

  signInForm = this._fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  constructor() {
    effect(() => {
      const authenticated = this._auth.authenticated();
      if (authenticated) {
        const returnUrl = this._returnUrl();
        if (returnUrl) {
          this._router.navigateByUrl(returnUrl);
        }
      }
    });
  }

  onSignIn(): void {
    if (this.signInForm.valid) {
      const { email, password } = this.signInForm.value;
      this._auth.authenticate(email!, password!);
    }
  }
}

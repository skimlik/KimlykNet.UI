import { Component, input } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-over-content-spinner',
  standalone: true,
  imports: [MatProgressSpinnerModule],
  template: `@if (spinning()) {
    <div class="over-content-spinner">
      <mat-spinner class="spinner"></mat-spinner>
    </div>
  }`,
  styles: `
    :host {
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      z-index: 998;

      &::before {
        content: '';
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        background-color: var(--mat-sys-surface);
        opacity: 0.7;
        z-index: -1;
        pointer-events: none;
      }

      .over-content-spinner {
        position: relative;
        height: 100%;
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 999;
      }
    }
  `,
})
export class OverContentSpinner {
  spinning = input<boolean>(true);
}

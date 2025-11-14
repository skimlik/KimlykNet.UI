import { Component, computed, effect, inject, OnDestroy, signal, viewChild } from '@angular/core';
import { Router, RouterOutlet, RouterLinkWithHref } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { CommonModule } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '@core/index';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MediaMatcher } from '@angular/cdk/layout';
import { MatRippleModule } from '@angular/material/core';
import { MenuItem, NavService, SideNavItem } from '@core/nav';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatSidenavModule,
    MatMenuModule,
    MatDividerModule,
    MatListModule,
    CommonModule,
    RouterLinkWithHref,
    MatRippleModule,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnDestroy {
  private readonly _sidenav = viewChild.required<MatSidenav>('sidenav');
  private readonly _router = inject(Router);
  private readonly _mobileQuery: MediaQueryList;
  private readonly _mobileQueryListener: () => void;

  protected readonly navItems = inject(NavService);
  protected readonly isMobile = signal(false);
  protected readonly auth = inject(AuthService);
  protected readonly currentSectionName = signal<string>('utils');

  protected readonly menu = signal<MenuItem[]>([
    {
      name: 'external_resources',
      title: 'External Resources',
      sideNavItems: [
        {
          name: 'currency_rates_nbu',
          title: 'Currency Rates (NBU)',
          type: 'button',
          iconName: 'currency_exchange',
          action: () => {
            this._router.navigate(['rates', 'nbu']);
            this._sidenav().close();
          },
        },
      ],
    },
    {
      name: 'utils',
      title: 'Utils',
      sideNavItems: [
        {
          name: 'guid_generator',
          title: 'Guid Generator',
          type: 'button',
          iconName: 'grid_3x3',
          action: () => {
            this._router.navigate(['guid']);
            this._sidenav().close();
          },
        },
        {
          name: 'String Base 64',
          title: 'String Base 64',
          type: 'button',
          iconName: 'convert_to_text',
          action: () => {
            this._router.navigate(['string-encode']);
            this._sidenav().close();
          },
        },
        {
          type: 'divider',
        },
        {
          name: 'data_protection',
          title: 'Data Protection',
          publiclyInvisible: true,
          iconName: 'encrypted',
          type: 'button',
          action: () => {
            this._router.navigate(['data-protection']);
            this._sidenav().close();
          },
        },
        {
          name: 'secret_manager',
          title: 'Create secret message',
          publiclyInvisible: true,
          iconName: 'key',
          type: 'button',
          action: () => {
            this._router.navigate(['secrets']);
            this._sidenav().close();
          },
        },
      ],
    },
  ]);

  constructor() {
    const media = inject(MediaMatcher);

    this._mobileQuery = media.matchMedia('(max-width: 600px)');
    this.isMobile.set(this._mobileQuery.matches);
    this._mobileQueryListener = () => this.isMobile.set(this._mobileQuery.matches);
    this._mobileQuery.addEventListener('change', this._mobileQueryListener);

    effect(() => {
      const section = this.currentSectionName();
      const menu = this.menu().find((m) => m.name === section);
      this.navItems.update(menu?.sideNavItems ?? []);
    });
  }

  ngOnDestroy(): void {
    this._mobileQuery.removeEventListener('change', this._mobileQueryListener);
  }

  protected openSideNav(menuItem: MenuItem): void {
    this.currentSectionName.set('');
    this._sidenav()
      ?.open()
      .then(() => {
        this.currentSectionName.set(menuItem.name);
      });
  }

  protected onSignInClick() {
    this._router.navigate(['sign-in']);
  }

  protected onLogOff(): void {
    this.auth.logOff();
  }

  protected onNotesClicked(): void {
    this._router.navigate(['notes']);
  }
}

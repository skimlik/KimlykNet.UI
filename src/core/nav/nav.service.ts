import { Injectable, signal } from '@angular/core';
import { SideNavItem } from './side-nav-item';

@Injectable({ providedIn: 'root' })
export class NavService {
  private _navItems = signal<SideNavItem[]>([]);

  readonly navItems = this._navItems.asReadonly();

  update(navItems: SideNavItem[]): void {
    this._navItems.set(navItems);
  }
}

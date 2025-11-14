import { SideNavItem } from './side-nav-item';

export interface MenuItem {
  name: string;
  title: string;
  icon?: string;
  publiclyInvisible?: boolean;
  sideNavItems: SideNavItem[];
}

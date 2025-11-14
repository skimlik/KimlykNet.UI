export interface SideNavItem {
  name?: string;
  title?: string;
  action?: (item: SideNavItem) => void;
  publiclyInvisible?: boolean;
  type: 'button' | 'divider' | 'text';
  style?: 'text' | 'filled' | 'elevated' | 'outlined' | 'tonal' | undefined;
  iconName?: string | undefined;
}

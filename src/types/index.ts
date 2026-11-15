export * from './database.types';

export interface UserProfile {
  id: string;
  email: string;
  fullName?: string | null;
  avatarUrl?: string | null;
  role: string;
}

export interface NavItem {
  title: string;
  href: string;
  icon?: string;
  disabled?: boolean;
  external?: boolean;
}

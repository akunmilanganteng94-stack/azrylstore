export interface Profile {
  id: number;
  name: string;
  username: string;
  description: string;
  secondary_description: string;
  profile_image: string;
  verified: boolean;
}

export interface LinkItem {
  id: string;
  title: string;
  description: string;
  url: string;
  icon: string;
  enabled: boolean;
  sort_order: number;
}

export interface AppearanceSettings {
  accent_color: string;
  background_color: string;
  button_style: string;
  border_radius: string;
  shadow: string;
  glass_effect: string;
  dark_mode: string;
  [key: string]: string | undefined;
}

export interface AdminUser {
  id: string;
  username: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

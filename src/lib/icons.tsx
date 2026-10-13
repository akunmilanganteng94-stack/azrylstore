import React from 'react';
import {
  MessageCircle,
  Users,
  Radio,
  Share2,
  Globe,
  Instagram,
  ShoppingBag,
  Send,
  Mail,
  Phone,
  Video,
  Music2,
  Check,
  ExternalLink,
  Flame,
  Star,
  Sparkles
} from 'lucide-react';

// Custom SVG WhatsApp icon for authentic branding
export const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.888-9.89 9.888m8.411-18.298A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.456 5.711 1.456h.005c6.554 0 11.89-5.335 11.893-11.893a11.82 11.82 0 00-3.488-8.417" />
  </svg>
);

// Map of available icons for links
export const AVAILABLE_ICONS = [
  { id: 'whatsapp', label: 'WhatsApp', icon: WhatsAppIcon },
  { id: 'channel', label: 'WhatsApp Channel / Saluran', icon: WhatsAppIcon },
  { id: 'group', label: 'WhatsApp Group / Komunitas', icon: WhatsAppIcon },
  { id: 'store', label: 'Toko / Catalog', icon: ShoppingBag },
  { id: 'instagram', label: 'Instagram', icon: Instagram },
  { id: 'telegram', label: 'Telegram', icon: Send },
  { id: 'tiktok', label: 'TikTok', icon: Music2 },
  { id: 'youtube', label: 'YouTube', icon: Video },
  { id: 'globe', label: 'Website', icon: Globe },
  { id: 'email', label: 'Email', icon: Mail },
  { id: 'phone', label: 'Telepon', icon: Phone },
  { id: 'star', label: 'Bintang / Rating', icon: Star },
  { id: 'flame', label: 'Hot / Promo', icon: Flame },
  { id: 'sparkles', label: 'Special', icon: Sparkles }
];

export function renderLinkIcon(iconName: string, className = 'w-6 h-6') {
  const normalized = (iconName || '').toLowerCase().trim();

  if (
    normalized === 'whatsapp' ||
    normalized.includes('wa') ||
    normalized === 'channel' ||
    normalized.includes('saluran') ||
    normalized === 'group' ||
    normalized.includes('grup')
  ) {
    return <WhatsAppIcon className={className} />;
  }
  if (normalized === 'instagram' || normalized === 'ig') {
    return <Instagram className={className} />;
  }
  if (normalized === 'telegram' || normalized === 'tg') {
    return <Send className={className} />;
  }
  if (normalized === 'tiktok') {
    return <Music2 className={className} />;
  }
  if (normalized === 'youtube' || normalized === 'yt') {
    return <Video className={className} />;
  }
  if (normalized === 'store' || normalized === 'shop') {
    return <ShoppingBag className={className} />;
  }
  if (normalized === 'email' || normalized === 'mail') {
    return <Mail className={className} />;
  }
  if (normalized === 'phone' || normalized === 'tel') {
    return <Phone className={className} />;
  }
  if (normalized === 'flame' || normalized === 'hot') {
    return <Flame className={className} />;
  }
  if (normalized === 'star') {
    return <Star className={className} />;
  }
  if (normalized === 'sparkles') {
    return <Sparkles className={className} />;
  }

  return <Globe className={className} />;
}

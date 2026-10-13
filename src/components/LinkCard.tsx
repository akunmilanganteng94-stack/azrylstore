import React from 'react';
import { ArrowRight } from 'lucide-react';
import { LinkItem } from '../types/index.ts';
import { renderLinkIcon, WhatsAppIcon } from '../lib/icons.tsx';

interface LinkCardProps {
  link: LinkItem;
  accentColor?: string;
  borderRadius?: string;
  glassEffect?: boolean;
}

export const LinkCard: React.FC<LinkCardProps> = ({
  link,
  accentColor = '#2563EB',
  borderRadius = 'rounded-2xl',
  glassEffect = true
}) => {
  const isWhatsApp =
    link.url.includes('wa.me') ||
    link.url.includes('whatsapp.com') ||
    link.icon === 'whatsapp' ||
    link.title.toLowerCase().includes('whatsapp') ||
    link.title.toLowerCase().includes('saluran') ||
    link.title.toLowerCase().includes('grup jb');

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`group relative flex items-center justify-between w-full p-4 sm:p-4.5 transition-all duration-200 cursor-pointer ${borderRadius} ${
        glassEffect
          ? 'bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border border-white/80 dark:border-slate-800/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_25px_-5px_rgba(37,99,235,0.12)] hover:bg-white dark:hover:bg-slate-900'
          : 'bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md'
      } hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] select-none`}
    >
      {/* Left: Icon in rounded badge */}
      <div className="flex items-center gap-3.5 sm:gap-4 min-w-0 pr-2">
        <div
          className={`flex items-center justify-center w-12 h-12 rounded-xl shrink-0 transition-transform duration-200 group-hover:scale-105 ${
            isWhatsApp
              ? 'bg-[#25D366]/15 text-[#128C7E] dark:bg-[#25D366]/20 dark:text-[#25D366]'
              : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200'
          }`}
          style={{
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
          }}
        >
          {isWhatsApp ? (
            <WhatsAppIcon className="w-6 h-6" />
          ) : (
            renderLinkIcon(link.icon, 'w-6 h-6')
          )}
        </div>

        {/* Center: Title & Description */}
        <div className="flex flex-col min-w-0 text-left">
          <span className="text-[15px] sm:text-base font-bold text-slate-900 dark:text-white leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
            {link.title}
          </span>
          {link.description && (
            <span className="text-xs sm:text-[13px] text-slate-600 dark:text-slate-400 line-clamp-1 mt-0.5 font-normal">
              {link.description}
            </span>
          )}
        </div>
      </div>

      {/* Right: Arrow */}
      <div className="flex items-center justify-center w-8 h-8 rounded-full text-slate-400 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-1 transition-all shrink-0">
        <ArrowRight className="w-5 h-5" />
      </div>
    </a>
  );
};

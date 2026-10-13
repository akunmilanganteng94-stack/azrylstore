import React from 'react';

export const VerifiedBadge: React.FC<{ size?: number; className?: string }> = ({ size = 20, className = '' }) => {
  return (
    <span
      className={`inline-flex items-center justify-center text-blue-500 hover:text-blue-600 transition-colors select-none ${className}`}
      title="Akun Terverifikasi"
      aria-label="Akun Terverifikasi"
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-xs"
      >
        <path
          d="M10.268 2.343a2.38 2.38 0 0 1 3.464 0l.975.986c.466.472 1.107.737 1.77.732l1.385-.01a2.38 2.38 0 0 1 2.368 2.448l-.048 1.385a2.38 2.38 0 0 0 .708 1.78l.966.996a2.38 2.38 0 0 1 0 3.464l-.966.995a2.38 2.38 0 0 0-.708 1.78l.048 1.386a2.38 2.38 0 0 1-2.368 2.447l-1.385-.01a2.38 2.38 0 0 0-1.77.732l-.975.986a2.38 2.38 0 0 1-3.464 0l-.975-.986a2.38 2.38 0 0 0-1.77-.732l-1.385.01a2.38 2.38 0 0 1-2.368-2.448l.048-1.385a2.38 2.38 0 0 0-.708-1.78l-.966-.996a2.38 2.38 0 0 1 0-3.464l.966-.995a2.38 2.38 0 0 0 .708-1.78l-.048-1.386A2.38 2.38 0 0 1 6.138 4.05l1.385.01a2.38 2.38 0 0 0 1.77-.732l.975-.986z"
          fill="#2563EB"
        />
        <path
          d="M8.5 12.25L10.75 14.5L15.5 9.75"
          stroke="white"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
};

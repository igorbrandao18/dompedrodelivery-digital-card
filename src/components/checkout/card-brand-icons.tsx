/* SVG icons for card brands — simplified logos */

export function VisaIcon({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size * 0.65} viewBox="0 0 48 31" fill="none">
      <rect width="48" height="31" rx="4" fill="#1A1F71" />
      <path d="M19.2 21.3h-3.1l1.9-11.8h3.1L19.2 21.3z" fill="#fff" />
      <path d="M28.7 9.7c-.6-.2-1.6-.5-2.8-.5-3.1 0-5.3 1.6-5.3 4 0 1.7 1.6 2.7 2.8 3.3 1.2.6 1.6 1 1.6 1.5 0 .8-1 1.2-1.9 1.2-1.2 0-1.9-.2-2.9-.6l-.4-.2-.4 2.6c.7.3 2.1.6 3.5.6 3.3 0 5.4-1.6 5.4-4.1 0-1.4-.8-2.4-2.7-3.3-1.1-.6-1.8-.9-1.8-1.5 0-.5.6-1 1.8-1 1 0 1.8.2 2.4.5l.3.1.4-2.6z" fill="#fff" />
      <path d="M33.8 9.5h-2.4c-.7 0-1.3.2-1.6 1l-4.6 11h3.3l.7-1.8h4l.4 1.8H37L33.8 9.5zm-3.7 8.1l1.7-4.5.9 4.5h-2.6z" fill="#fff" />
      <path d="M15.5 9.5l-3 8.1-.3-1.6c-.6-1.9-2.3-4-4.2-5l2.8 10.3h3.3l5-11.8h-3.6z" fill="#fff" />
      <path d="M9.6 9.5H4.5l-.1.3c3.9 1 6.5 3.4 7.5 6.2l-1.1-5.5c-.2-.8-.7-1-1.2-1z" fill="#F7B600" />
    </svg>
  );
}

export function MastercardIcon({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size * 0.65} viewBox="0 0 48 31" fill="none">
      <rect width="48" height="31" rx="4" fill="#252525" />
      <circle cx="19" cy="15.5" r="8" fill="#EB001B" />
      <circle cx="29" cy="15.5" r="8" fill="#F79E1B" />
      <path d="M24 9.1a8 8 0 0 0-2.9 6.4A8 8 0 0 0 24 21.9a8 8 0 0 0 2.9-6.4A8 8 0 0 0 24 9.1z" fill="#FF5F00" />
    </svg>
  );
}

export function EloIcon({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size * 0.65} viewBox="0 0 48 31" fill="none">
      <rect width="48" height="31" rx="4" fill="#000" />
      <text x="24" y="19" textAnchor="middle" fill="#00A4E0" fontFamily="Arial,sans-serif" fontSize="14" fontWeight="900">elo</text>
    </svg>
  );
}

export function HipercardIcon({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size * 0.65} viewBox="0 0 48 31" fill="none">
      <rect width="48" height="31" rx="4" fill="#822124" />
      <text x="24" y="19" textAnchor="middle" fill="#fff" fontFamily="Arial,sans-serif" fontSize="10" fontWeight="700">HIPER</text>
    </svg>
  );
}

export function CashIcon({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size * 0.65} viewBox="0 0 48 31" fill="none">
      <rect width="48" height="31" rx="4" fill="#059669" />
      <text x="24" y="19" textAnchor="middle" fill="#fff" fontFamily="Arial,sans-serif" fontSize="14" fontWeight="700">R$</text>
    </svg>
  );
}

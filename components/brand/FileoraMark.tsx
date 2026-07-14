type FileoraMarkProps = {
  size?: number;
  className?: string;
};

/**
 * Convert Arrow brand mark — file is the focal point;
 * sync arrows support without overpowering (tuned for navbar / favicon / PWA).
 */
export function FileoraMark({ size = 16, className }: FileoraMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M4.8 2.4h9.1L20 8.5v12.1A2.2 2.2 0 0 1 17.8 22.8H7A2.2 2.2 0 0 1 4.8 20.6V4.6A2.2 2.2 0 0 1 7 2.4H4.8z"
        fill="#0A0F0D"
      />
      <path
        d="M13.9 2.4v4.8c0 .9.7 1.6 1.6 1.6H20"
        stroke="#00D084"
        strokeWidth="1.15"
      />
      <path
        d="M8.4 12.8h6.6l-1.55-1.55M15.0 16.7H8.4l1.55 1.55"
        stroke="#00B8E0"
        strokeWidth="1.45"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

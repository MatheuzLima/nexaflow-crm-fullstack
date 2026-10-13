import * as React from "react"

export function NexaLogo({
  size = 32,
  className,
}: {
  size?: number
  className?: string
}) {
  const gradId = React.useId()
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradId} x1="3" y1="2" x2="29" y2="30">
          <stop offset="0" stopColor="#8b7bff" />
          <stop offset="1" stopColor="#3b82f6" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill={`url(#${gradId})`} />
      <path
        d="M9.5 23V9.5L22.5 22.5V9"
        stroke="#fff"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="22.5" cy="9" r="2.1" fill="#fff" />
    </svg>
  )
}

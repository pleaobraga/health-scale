import React from 'react'

export interface FlagIconProps extends React.SVGProps<SVGSVGElement> {
  className?: string
}

export function BrazilFlag({ className = 'w-5 h-3.5', ...props }: FlagIconProps) {
  return (
    <svg
      viewBox="0 0 720 504"
      className={`shrink-0 rounded-xs shadow-2xs ${className}`}
      aria-hidden="true"
      {...props}
    >
      <rect width="720" height="504" fill="#009c3b" />
      <polygon points="360,57.6 662.4,252 360,446.4 57.6,252" fill="#ffdf00" />
      <circle cx="360" cy="252" r="126" fill="#002776" />
      <path
        d="M246.6 270.7 c35.3 -36.5 94.7 -48.2 148.3 -33.8 c39.2 10.6 74.5 35.3 91.1 55.1 c-13.7 -16.2 -48.2 -42.8 -91.1 -53.3 c-54.7 -13.3 -112.3 0.7 -148.3 32"
        fill="#ffffff"
      />
    </svg>
  )
}

export function UsaFlag({ className = 'w-5 h-3.5', ...props }: FlagIconProps) {
  return (
    <svg
      viewBox="0 0 741 390"
      className={`shrink-0 rounded-xs shadow-2xs ${className}`}
      aria-hidden="true"
      {...props}
    >
      <rect width="741" height="390" fill="#b22234" />
      <path
        d="M0,30H741M0,90H741M0,150H741M0,210H741M0,270H741M0,330H741"
        stroke="#ffffff"
        strokeWidth="30"
      />
      <rect width="296.4" height="210" fill="#3c3b6e" />
      <g fill="#ffffff">
        <circle cx="30" cy="21" r="9" />
        <circle cx="80" cy="21" r="9" />
        <circle cx="130" cy="21" r="9" />
        <circle cx="180" cy="21" r="9" />
        <circle cx="230" cy="21" r="9" />
        <circle cx="280" cy="21" r="9" />
        <circle cx="55" cy="42" r="9" />
        <circle cx="105" cy="42" r="9" />
        <circle cx="155" cy="42" r="9" />
        <circle cx="205" cy="42" r="9" />
        <circle cx="255" cy="42" r="9" />
        <circle cx="30" cy="63" r="9" />
        <circle cx="80" cy="63" r="9" />
        <circle cx="130" cy="63" r="9" />
        <circle cx="180" cy="63" r="9" />
        <circle cx="230" cy="63" r="9" />
        <circle cx="280" cy="63" r="9" />
        <circle cx="55" cy="84" r="9" />
        <circle cx="105" cy="84" r="9" />
        <circle cx="155" cy="84" r="9" />
        <circle cx="205" cy="84" r="9" />
        <circle cx="255" cy="84" r="9" />
        <circle cx="30" cy="105" r="9" />
        <circle cx="80" cy="105" r="9" />
        <circle cx="130" cy="105" r="9" />
        <circle cx="180" cy="105" r="9" />
        <circle cx="230" cy="105" r="9" />
        <circle cx="280" cy="105" r="9" />
        <circle cx="55" cy="126" r="9" />
        <circle cx="105" cy="126" r="9" />
        <circle cx="155" cy="126" r="9" />
        <circle cx="205" cy="126" r="9" />
        <circle cx="255" cy="126" r="9" />
        <circle cx="30" cy="147" r="9" />
        <circle cx="80" cy="147" r="9" />
        <circle cx="130" cy="147" r="9" />
        <circle cx="180" cy="147" r="9" />
        <circle cx="230" cy="147" r="9" />
        <circle cx="280" cy="147" r="9" />
        <circle cx="55" cy="168" r="9" />
        <circle cx="105" cy="168" r="9" />
        <circle cx="155" cy="168" r="9" />
        <circle cx="205" cy="168" r="9" />
        <circle cx="255" cy="168" r="9" />
        <circle cx="30" cy="189" r="9" />
        <circle cx="80" cy="189" r="9" />
        <circle cx="130" cy="189" r="9" />
        <circle cx="180" cy="189" r="9" />
        <circle cx="230" cy="189" r="9" />
        <circle cx="280" cy="189" r="9" />
      </g>
    </svg>
  )
}


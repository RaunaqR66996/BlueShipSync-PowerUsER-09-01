import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

export function BlueShipSyncLogo({ className = '', size = 40 }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Outer circle */}
      <circle
        cx="50"
        cy="50"
        r="48"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      
      {/* Container Ship */}
      {/* Ship hull */}
      <rect
        x="35"
        y="60"
        width="30"
        height="8"
        fill="currentColor"
        rx="1"
      />
      
      {/* Ship bow details */}
      <rect x="35" y="62" width="2" height="2" fill="black" />
      <rect x="35" y="64" width="2" height="2" fill="black" />
      
      {/* Container stacks */}
      {/* Left stack */}
      <rect x="38" y="45" width="6" height="15" fill="currentColor" stroke="black" strokeWidth="0.5" />
      <rect x="38" y="50" width="6" height="10" fill="currentColor" stroke="black" strokeWidth="0.5" />
      <rect x="38" y="55" width="6" height="5" fill="currentColor" stroke="black" strokeWidth="0.5" />
      
      {/* Center stack */}
      <rect x="47" y="40" width="6" height="20" fill="currentColor" stroke="black" strokeWidth="0.5" />
      <rect x="47" y="45" width="6" height="15" fill="currentColor" stroke="black" strokeWidth="0.5" />
      <rect x="47" y="50" width="6" height="10" fill="currentColor" stroke="black" strokeWidth="0.5" />
      
      {/* Right stack */}
      <rect x="56" y="45" width="6" height="15" fill="currentColor" stroke="black" strokeWidth="0.5" />
      <rect x="56" y="50" width="6" height="10" fill="currentColor" stroke="black" strokeWidth="0.5" />
      <rect x="56" y="55" width="6" height="5" fill="currentColor" stroke="black" strokeWidth="0.5" />
      
      {/* Ship superstructure */}
      <rect
        x="42"
        y="35"
        width="16"
        height="10"
        fill="currentColor"
        rx="1"
      />
      
      {/* Bridge windows */}
      <rect x="44" y="37" width="2" height="2" fill="black" />
      <rect x="47" y="37" width="2" height="2" fill="black" />
      <rect x="50" y="37" width="2" height="2" fill="black" />
      <rect x="53" y="37" width="2" height="2" fill="black" />
      
      {/* Mast */}
      <rect x="49" y="25" width="2" height="10" fill="currentColor" />
      <rect x="47" y="27" width="6" height="1" fill="currentColor" />
      <rect x="47" y="30" width="6" height="1" fill="currentColor" />
      <rect x="47" y="33" width="6" height="1" fill="currentColor" />
      
      {/* Dynamic Blue Arrows */}
      {/* Upper-left arrow */}
      <path
        d="M 25 35 Q 15 15 35 25"
        stroke="#3B82F6"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />
      <polygon
        points="35,25 30,20 40,20"
        fill="#3B82F6"
      />
      
      {/* Lower-right arrow */}
      <path
        d="M 75 65 Q 85 85 65 75"
        stroke="#3B82F6"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />
      <polygon
        points="65,75 70,80 60,80"
        fill="#3B82F6"
      />
    </svg>
  );
}

export default BlueShipSyncLogo;

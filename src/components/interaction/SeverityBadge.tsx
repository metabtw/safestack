import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SeverityBadgeProps {
  severity: 'none' | 'minor' | 'moderate' | 'major' | 'contraindicated';
  className?: string;
}

export function SeverityBadge({ severity, className }: SeverityBadgeProps) {
  const config = {
    none: { label: 'YOK', classes: 'bg-[#F1F5F9] text-[#475569]' },
    minor: { label: 'MİNÖR', classes: 'bg-[#F0F9FF] text-[#0369A1]' },
    moderate: { label: 'ORTA', classes: 'bg-[#FFF7ED] text-[#C2410C]' },
    major: { label: 'MAJÖR', classes: 'bg-[#FEF2F2] text-[#B91C1C]' },
    contraindicated: { label: 'KONTRENDİKE', classes: 'bg-[#DC2626] text-white' }
  };

  const { label, classes } = config[severity] || config.none;

  return (
    <span className={cn(
      "inline-flex items-center justify-center px-[12px] py-[4px] text-[14px] font-extrabold uppercase rounded-[20px]",
      classes,
      className
    )}>
      {label}
    </span>
  );
}

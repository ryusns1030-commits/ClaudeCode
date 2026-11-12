import React from "react";
import { C } from "../theme";

type P = { size?: number; color?: string };

export const IconUsers: React.FC<P> = ({ size = 64, color = C.blue }) => (
  <svg width={size} height={size} viewBox="0 0 64 64">
    <circle cx={24} cy={22} r={10} fill={color} />
    <path d="M6 52c0-10 8-17 18-17s18 7 18 17z" fill={color} />
    <circle cx={45} cy={24} r={8} fill={color} opacity={0.55} />
    <path d="M36 37c2-1 5-2 9-2 8 0 13 6 13 15H44" fill={color} opacity={0.55} />
  </svg>
);

export const IconEye: React.FC<P> = ({ size = 64, color = C.coral }) => (
  <svg width={size} height={size} viewBox="0 0 64 64">
    <path d="M4 32C12 18 22 12 32 12s20 6 28 20c-8 14-18 20-28 20S12 46 4 32z" fill="none" stroke={color} strokeWidth={6} strokeLinejoin="round" />
    <circle cx={32} cy={32} r={9} fill={color} />
  </svg>
);

export const IconClock: React.FC<P & { angle?: number; angle2?: number }> = ({ size = 64, color = C.blue, angle = 0, angle2 = 0 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64">
    <circle cx={32} cy={32} r={26} fill="none" stroke={color} strokeWidth={6} />
    <line x1={32} y1={32} x2={32} y2={14} stroke={color} strokeWidth={6} strokeLinecap="round" transform={`rotate(${angle} 32 32)`} />
    <line x1={32} y1={32} x2={32} y2={20} stroke={C.coral} strokeWidth={5} strokeLinecap="round" transform={`rotate(${angle2} 32 32)`} />
    <circle cx={32} cy={32} r={4} fill={color} />
  </svg>
);

export const IconChart: React.FC<P> = ({ size = 64, color = C.blue }) => (
  <svg width={size} height={size} viewBox="0 0 64 64">
    <rect x={8} y={36} width={10} height={20} rx={3} fill={color} opacity={0.5} />
    <rect x={27} y={24} width={10} height={32} rx={3} fill={color} opacity={0.75} />
    <rect x={46} y={10} width={10} height={46} rx={3} fill={color} />
  </svg>
);

export const IconCalendar: React.FC<P> = ({ size = 64, color = C.blue }) => (
  <svg width={size} height={size} viewBox="0 0 64 64">
    <rect x={6} y={12} width={52} height={46} rx={8} fill="none" stroke={color} strokeWidth={6} />
    <line x1={6} y1={26} x2={58} y2={26} stroke={color} strokeWidth={6} />
    <line x1={20} y1={6} x2={20} y2={16} stroke={color} strokeWidth={6} strokeLinecap="round" />
    <line x1={44} y1={6} x2={44} y2={16} stroke={color} strokeWidth={6} strokeLinecap="round" />
  </svg>
);

export const IconTarget: React.FC<P> = ({ size = 64, color = C.blue }) => (
  <svg width={size} height={size} viewBox="0 0 64 64">
    <circle cx={32} cy={32} r={25} fill="none" stroke={color} strokeWidth={6} />
    <circle cx={32} cy={32} r={13} fill="none" stroke={color} strokeWidth={6} />
    <circle cx={32} cy={32} r={4} fill={color} />
  </svg>
);

export const IconSpark: React.FC<P> = ({ size = 64, color = C.blue }) => (
  <svg width={size} height={size} viewBox="0 0 64 64">
    <path d="M32 4c2 14 6 22 28 28-22 6-26 14-28 28-2-14-6-22-28-28C26 26 30 18 32 4z" fill={color} />
  </svg>
);

export const IconCheck: React.FC<P> = ({ size = 64, color = C.blue }) => (
  <svg width={size} height={size} viewBox="0 0 64 64">
    <circle cx={32} cy={32} r={28} fill={color} />
    <path d="M18 33l9 9 19-20" fill="none" stroke="#fff" strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const IconPoll: React.FC<P> = ({ size = 64, color = C.blue }) => (
  <svg width={size} height={size} viewBox="0 0 64 64">
    <rect x={6} y={12} width={52} height={16} rx={8} fill={color} />
    <rect x={6} y={36} width={34} height={16} rx={8} fill={color} opacity={0.45} />
  </svg>
);

export const IconBulb: React.FC<P> = ({ size = 64, color = C.blue }) => (
  <svg width={size} height={size} viewBox="0 0 64 64">
    <path d="M32 6a19 19 0 0 0-11 34c3 3 4 6 4 9h14c0-3 1-6 4-9A19 19 0 0 0 32 6z" fill={color} />
    <rect x={24} y={52} width={16} height={6} rx={3} fill={color} opacity={0.6} />
  </svg>
);

export const IconQuestion: React.FC<P> = ({ size = 64, color = C.blue }) => (
  <svg width={size} height={size} viewBox="0 0 64 64">
    <path d="M8 12a6 6 0 0 1 6-6h36a6 6 0 0 1 6 6v28a6 6 0 0 1-6 6H26l-12 12V46h0a6 6 0 0 1-6-6z" fill={color} />
    <text x={32} y={37} textAnchor="middle" fontSize={30} fontWeight={900} fill="#fff" fontFamily="sans-serif">?</text>
  </svg>
);

export const IconReel: React.FC<P> = ({ size = 64, color = C.blue }) => (
  <svg width={size} height={size} viewBox="0 0 64 64">
    <rect x={6} y={6} width={52} height={52} rx={14} fill="none" stroke={color} strokeWidth={6} />
    <path d="M27 22l16 10-16 10z" fill={color} />
  </svg>
);

export const IconStory: React.FC<P> = ({ size = 64, color = C.blue }) => (
  <svg width={size} height={size} viewBox="0 0 64 64">
    <circle cx={32} cy={32} r={26} fill="none" stroke={color} strokeWidth={6} strokeDasharray="14 6" />
    <circle cx={32} cy={32} r={15} fill={color} opacity={0.5} />
  </svg>
);

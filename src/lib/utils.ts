import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getAvatarUrl(avatarPath: string | null | undefined): string {
  if (!avatarPath) return '';
  if (avatarPath.startsWith('http')) return avatarPath;
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  return `${apiUrl}${avatarPath}`;
}

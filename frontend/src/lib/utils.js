import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatDate(date) {
  return new Intl.DateTimeFormat('te-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  }).format(date);
}

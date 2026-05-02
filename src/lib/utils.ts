import { format, formatDistanceToNow, differenceInMinutes, parseISO } from 'date-fns'

export function formatTime(iso: string | null): string {
  if (!iso) return '—'
  return format(parseISO(iso), 'HH:mm')
}

export function formatDateTime(iso: string | null): string {
  if (!iso) return '—'
  return format(parseISO(iso), 'dd MMM, HH:mm')
}

export function minutesSince(iso: string): number {
  return differenceInMinutes(new Date(), parseISO(iso))
}

export function durationLabel(minutes: number | null): string {
  if (minutes === null) return '—'
  if (minutes < 60) return `${minutes}m`
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`
}

export function productivity(done: number, total: number): number {
  if (total === 0) return 0
  return Math.round((done / total) * 100)
}

export function generateOrderRef(count: number): string {
  const date = format(new Date(), 'yyyyMMdd')
  return `ORD-${date}-${String(count + 1).padStart(3, '0')}`
}

export function timeAgo(iso: string): string {
  return formatDistanceToNow(parseISO(iso), { addSuffix: true })
}

export function initials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ')
}

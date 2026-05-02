export const CATEGORIES = [
  'Fruits',
  'Vegetables',
  'Mixed Box',
  'HORECA Special',
  'Bulk Order',
  'Dairy',
  'Herbs & Garnish',
  'Exotic Fruits',
]

export const PACKAGING = [
  'Standard Box',
  'Premium Pack',
  'Bulk Pallet',
  'Cold Chain Box',
  'Crate',
]

export const BREAK_REASONS = [
  'Rest Room',
  'Prayer',
  'Food Break',
  'Personal',
  'Medical',
  'Emergency',
] as const

export const PRIORITY_COLORS: Record<string, string> = {
  Normal: 'badge-blue',
  High: 'badge-amber',
  Urgent: 'badge-red',
}

export const STATUS_COLORS: Record<string, string> = {
  Pending: 's-pending',
  Assigned: 's-assigned',
  Active: 's-active',
  Done: 's-done',
  Cancelled: 's-cancelled',
}

export const TEAM_COLORS: Record<string, string> = {
  'Team A': 'team-a',
  'Team B': 'team-b',
  'Team C': 'team-c',
  'Team D': 'team-d',
}

export type Priority = 'Normal' | 'High' | 'Urgent'
export type OrderStatus = 'Pending' | 'Assigned' | 'Active' | 'Done' | 'Cancelled'
export type Shift = 'Day' | 'Night'
export type BreakReason = 'Rest Room' | 'Prayer' | 'Food Break' | 'Personal' | 'Medical' | 'Emergency'
export type AssignmentStatus = 'Active' | 'Done' | 'Paused'

export interface Team {
  id: string
  name: string
  color: string
  created_at: string
}

export interface Staff {
  id: string
  name: string
  employee_id: string
  team_id: string | null
  role: string
  shift: Shift
  is_active: boolean
  created_at: string
  teams?: Team
}

export interface Order {
  id: string
  order_ref: string
  customer: string
  category: string
  packaging: string
  qty_ordered: number
  qty_done: number
  priority: Priority
  status: OrderStatus
  team_id: string | null
  assigned_at: string | null
  start_time: string | null
  end_time: string | null
  notes: string | null
  shift: Shift
  created_at: string
  updated_at: string
  teams?: Team
}

export interface PackingAssignment {
  id: string
  order_id: string
  team_id: string
  assigned_by: string
  start_time: string | null
  end_time: string | null
  qty_target: number
  qty_done: number
  notes: string | null
  status: AssignmentStatus
  created_at: string
  orders?: Order
  teams?: Team
}

export interface BreakLog {
  id: string
  staff_id: string | null
  employee_name: string
  employee_ref: string
  team_id: string | null
  team_name: string
  reason: BreakReason
  check_out: string
  check_in: string | null
  duration_minutes: number | null
  shift: Shift
  notes: string | null
  created_at: string
  teams?: Team
}

export interface OrderFormData {
  customer: string
  category: string
  packaging: string
  qty_ordered: number
  priority: Priority
  notes: string
  shift: Shift
}

export interface AssignFormData {
  team_id: string
  start_time: string
  notes: string
}

export interface BreakFormData {
  employee_name: string
  employee_ref: string
  team_id: string
  reason: BreakReason
  notes: string
}

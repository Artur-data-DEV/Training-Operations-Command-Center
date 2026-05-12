/**
 * TOCC Workspace — Design Tokens & Shared Types
 * Shared across all workspace React components.
 */

export const COLORS = {
    primary:     '#0073e6',
    success:     '#28a745',
    warning:     '#f59e0b',
    danger:      '#dc3545',
    neutral:     '#6b7280',
    bgCard:      '#ffffff',
    bgPage:      '#f3f4f6',
    border:      '#e5e7eb',
    textPrimary: '#111827',
    textMuted:   '#6b7280',
} as const

export const STATUS_COLORS: Record<string, string> = {
    draft:       '#6b7280',
    submitted:   '#f59e0b',
    approved:    '#28a745',
    rejected:    '#dc3545',
    cancelled:   '#dc3545',
    open:        '#0073e6',
    full:        '#f59e0b',
    in_progress: '#7c3aed',
    completed:   '#28a745',
    pending:     '#f59e0b',
    waitlisted:  '#6b7280',
}

export const STATUS_LABELS: Record<string, string> = {
    draft:       'Draft',
    submitted:   'Pending Approval',
    approved:    'Approved',
    rejected:    'Rejected',
    cancelled:   'Cancelled',
    open:        'Open',
    full:        'Full',
    in_progress: 'In Progress',
    completed:   'Completed',
    pending:     'Pending',
    waitlisted:  'Waitlisted',
}

// ---------------------------------------------------------------------------
// Domain types shared across workspace components
// ---------------------------------------------------------------------------

export type ReservationStatus = 'draft' | 'submitted' | 'approved' | 'rejected' | 'cancelled'
export type SessionStatus     = 'draft' | 'open' | 'full' | 'in_progress' | 'completed' | 'cancelled'
export type EnrollmentStatus  = 'pending' | 'approved' | 'waitlisted' | 'rejected' | 'cancelled'

export interface Reservation {
    sys_id:                string
    number:                string
    status:                ReservationStatus
    course_name:           string
    room_name:             string
    instructor_name:       string
    start_display:         string
    end_display:           string
    expected_participants: number
}

export interface TrainingSession {
    sys_id:          string
    number:          string
    title:           string
    status:          SessionStatus
    course_name:     string
    room_name:       string
    instructor_name: string
    start_display:   string
    end_display:     string
    available_seats: number
    total_seats:     number
}

export interface Enrollment {
    sys_id:             string
    number:             string
    status:             EnrollmentStatus
    student_name:       string
    session_title:      string
    start_display:      string
    waitlist_position?: number
    confirmed:          boolean
}

export interface KpiTile {
    label:   string
    value:   string | number
    unit?:   string
    trend?:  'up' | 'down' | 'neutral'
    target?: string
    color?:  string
}

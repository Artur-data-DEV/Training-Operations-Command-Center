import React, { useState, useEffect } from 'react'
import {
    KpiCard, SectionHeader, DataTable, StatusBadge,
    LoadingSpinner, EmptyState,
} from './ui'
import { COLORS, type Reservation, type TrainingSession, type Enrollment } from '../shared/tokens'

// ---------------------------------------------------------------------------
// TOCC Operations Workspace — Main Dashboard
//
// Rendered as a UI Builder custom component.
// Data fetched via GlideAjax → PortalApiService on mount.
//
// Layout:
//   Row 1: KPI tiles (pending reservations, today's sessions, open enrollments, fill rate)
//   Row 2: Pending Reservations table | Today's Sessions table
//   Row 3: Open Enrollments table     | Waitlisted Students table
// ---------------------------------------------------------------------------

declare const window: Window & {
    GlideAjax: new (scriptInclude: string) => {
        addParam: (key: string, value: string) => void
        getXMLAnswer: (cb: (answer: string) => void) => void
    }
}

function useAjax<T>(
    method: string,
    params: Record<string, string> = {},
    deps: unknown[] = []
): { data: T | null; loading: boolean; error: string | null } {
    const [data, setData]       = useState<T | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError]     = useState<string | null>(null)

    useEffect(() => {
        setLoading(true)
        setError(null)

        const ga = new window.GlideAjax('x_783010_tocc_a1.PortalApiService')
        ga.addParam('sysparm_name', method)
        Object.entries(params).forEach(([k, v]) => ga.addParam(k, v))

        ga.getXMLAnswer((answer: string) => {
            try {
                const parsed = JSON.parse(answer)
                if (parsed.success) {
                    setData(parsed as T)
                } else {
                    setError(parsed.message ?? 'Request failed')
                }
            } catch {
                setError('Failed to parse response')
            } finally {
                setLoading(false)
            }
        })
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps)

    return { data, loading, error }
}

// ---------------------------------------------------------------------------
// Pending Reservations panel
// ---------------------------------------------------------------------------
function PendingReservationsPanel() {
    const { data, loading } = useAjax<{ reservations: Reservation[] }>('getMyReservations', {})
    const pending = data?.reservations.filter(r => r.status === 'submitted') ?? []

    const columns = [
        { key: 'number',           label: 'Number',      width: '100px' },
        { key: 'course_name',      label: 'Course' },
        { key: 'room_name',        label: 'Room' },
        { key: 'instructor_name',  label: 'Instructor' },
        { key: 'start_display',    label: 'Start',       width: '140px' },
        {
            key: 'status',
            label: 'Status',
            width: '120px',
            render: (row: Reservation) => <StatusBadge status={row.status} size="sm" />,
        },
    ]

    return (
        <div style={{ flex: 1, minWidth: 0 }}>
            <SectionHeader
                title="Pending Reservations"
                subtitle={`${pending.length} awaiting approval`}
            />
            {loading
                ? <LoadingSpinner label="Loading reservations…" />
                : pending.length === 0
                    ? <EmptyState icon="🗓️" title="No pending reservations" subtitle="All reservations have been reviewed." />
                    : <DataTable columns={columns} rows={pending} emptyText="No pending reservations." />
            }
        </div>
    )
}

// ---------------------------------------------------------------------------
// Today's Sessions panel
// ---------------------------------------------------------------------------
function TodaysSessionsPanel() {
    const today = new Date()
    const dateStr = today.toISOString().split('T')[0]

    const { data, loading } = useAjax<{ sessions: TrainingSession[] }>('getAvailableSessions', {
        sysparm_from_date: dateStr + ' 00:00:00',
    })

    const todaySessions = (data?.sessions ?? []).filter(s => {
        const start = s.start_display ?? ''
        return start.startsWith(dateStr)
    })

    const columns = [
        { key: 'number',         label: 'Number',   width: '100px' },
        { key: 'title',          label: 'Session' },
        { key: 'room_name',      label: 'Room' },
        { key: 'start_display',  label: 'Start',    width: '130px' },
        { key: 'available_seats',label: 'Seats',    width: '70px' },
        {
            key: 'status',
            label: 'Status',
            width: '120px',
            render: (row: TrainingSession) => <StatusBadge status={row.status} size="sm" />,
        },
    ]

    return (
        <div style={{ flex: 1, minWidth: 0 }}>
            <SectionHeader
                title="Today's Sessions"
                subtitle={`${todaySessions.length} session(s) scheduled today`}
            />
            {loading
                ? <LoadingSpinner label="Loading sessions…" />
                : todaySessions.length === 0
                    ? <EmptyState icon="📚" title="No sessions today" subtitle="Check the full session list for upcoming dates." />
                    : <DataTable columns={columns} rows={todaySessions} emptyText="No sessions today." />
            }
        </div>
    )
}

// ---------------------------------------------------------------------------
// Open Enrollments panel (pending approval)
// ---------------------------------------------------------------------------
function OpenEnrollmentsPanel() {
    const { data, loading } = useAjax<{ enrollments: Enrollment[] }>('getMyEnrollments', {
        sysparm_status: 'pending',
    })
    const enrollments = data?.enrollments ?? []

    const columns = [
        { key: 'number',        label: 'Number',  width: '100px' },
        { key: 'student_name',  label: 'Student' },
        { key: 'session_title', label: 'Session' },
        { key: 'start_display', label: 'Date',    width: '130px' },
        {
            key: 'status',
            label: 'Status',
            width: '110px',
            render: (row: Enrollment) => <StatusBadge status={row.status} size="sm" />,
        },
    ]

    return (
        <div style={{ flex: 1, minWidth: 0 }}>
            <SectionHeader
                title="Open Enrollments"
                subtitle={`${enrollments.length} pending approval`}
            />
            {loading
                ? <LoadingSpinner label="Loading enrollments…" />
                : enrollments.length === 0
                    ? <EmptyState icon="✅" title="No pending enrollments" subtitle="All enrollment requests have been processed." />
                    : <DataTable columns={columns} rows={enrollments} emptyText="No open enrollments." />
            }
        </div>
    )
}

// ---------------------------------------------------------------------------
// Waitlisted Students panel
// ---------------------------------------------------------------------------
function WaitlistedPanel() {
    const { data, loading } = useAjax<{ enrollments: Enrollment[] }>('getMyEnrollments', {
        sysparm_status: 'waitlisted',
    })
    const waitlisted = data?.enrollments ?? []

    const columns = [
        { key: 'number',            label: 'Number',   width: '100px' },
        { key: 'student_name',      label: 'Student' },
        { key: 'session_title',     label: 'Session' },
        { key: 'start_display',     label: 'Date',     width: '130px' },
        { key: 'waitlist_position', label: 'Position', width: '80px',
          render: (row: Enrollment) => (
              <span style={{ fontWeight: 700, color: COLORS.warning }}>
                  #{row.waitlist_position ?? '—'}
              </span>
          ),
        },
    ]

    return (
        <div style={{ flex: 1, minWidth: 0 }}>
            <SectionHeader
                title="Waitlist"
                subtitle={`${waitlisted.length} student(s) waiting for a seat`}
            />
            {loading
                ? <LoadingSpinner label="Loading waitlist…" />
                : waitlisted.length === 0
                    ? <EmptyState icon="🎉" title="No waitlisted students" subtitle="All students who want a seat have one." />
                    : <DataTable columns={columns} rows={waitlisted} emptyText="No waitlisted students." />
            }
        </div>
    )
}

// ---------------------------------------------------------------------------
// Root Dashboard component
// ---------------------------------------------------------------------------
export default function ToccWorkspaceDashboard() {
    // Summary counts for KPI tiles — derived from session/enrollment data
    const { data: sessionData } = useAjax<{ sessions: TrainingSession[] }>('getAvailableSessions', {})
    const { data: enrollData }  = useAjax<{ enrollments: Enrollment[] }>('getMyEnrollments', {})

    const sessions    = sessionData?.sessions ?? []
    const enrollments = enrollData?.enrollments ?? []

    const openSessions    = sessions.filter(s => s.status === 'open').length
    const fullSessions    = sessions.filter(s => s.status === 'full').length
    const pendingEnroll   = enrollments.filter(e => e.status === 'pending').length
    const waitlistedCount = enrollments.filter(e => e.status === 'waitlisted').length

    const totalSeats     = sessions.reduce((sum, s) => sum + (s.total_seats ?? 0), 0)
    const availableSeats = sessions.reduce((sum, s) => sum + (s.available_seats ?? 0), 0)
    const fillRate = totalSeats > 0
        ? Math.round(((totalSeats - availableSeats) / totalSeats) * 100)
        : 0

    return (
        <div style={{
            fontFamily:      '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            backgroundColor: COLORS.bgPage,
            minHeight:       '100vh',
            padding:         '24px',
        }}>
            {/* Header */}
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 700, color: COLORS.textPrimary }}>
                    Training Operations
                </h1>
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: COLORS.textMuted }}>
                    Backoffice Workspace — live data
                </p>
            </div>

            {/* KPI tiles */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '28px', flexWrap: 'wrap' }}>
                <KpiCard
                    label="Open Sessions"
                    value={openSessions}
                    color={COLORS.primary}
                    target="> 0"
                />
                <KpiCard
                    label="Full Sessions"
                    value={fullSessions}
                    color={COLORS.warning}
                />
                <KpiCard
                    label="Pending Enrollments"
                    value={pendingEnroll}
                    color={pendingEnroll > 5 ? COLORS.danger : COLORS.success}
                />
                <KpiCard
                    label="Waitlisted Students"
                    value={waitlistedCount}
                    color={waitlistedCount > 0 ? COLORS.warning : COLORS.success}
                />
                <KpiCard
                    label="Fill Rate"
                    value={fillRate}
                    unit="%"
                    color={fillRate >= 70 ? COLORS.success : COLORS.warning}
                    target="≥ 70%"
                    trend={fillRate >= 70 ? 'up' : 'down'}
                />
            </div>

            {/* Row 2: Reservations + Sessions */}
            <div style={{ display: 'flex', gap: '24px', marginBottom: '28px', flexWrap: 'wrap' }}>
                <PendingReservationsPanel />
                <TodaysSessionsPanel />
            </div>

            {/* Row 3: Enrollments + Waitlist */}
            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                <OpenEnrollmentsPanel />
                <WaitlistedPanel />
            </div>
        </div>
    )
}

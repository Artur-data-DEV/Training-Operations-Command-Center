import React, { useState, useEffect } from 'react'
import { SectionHeader, DataTable, StatusBadge, LoadingSpinner, EmptyState } from './ui'
import { COLORS, STATUS_LABELS, type TrainingSession, type Enrollment } from '../shared/tokens'

// ---------------------------------------------------------------------------
// Session Detail View — shown when a Backoffice user clicks a session row
// Displays session info, enrolled students list, and attendance summary.
// ---------------------------------------------------------------------------

declare const window: Window & {
    GlideAjax: new (scriptInclude: string) => {
        addParam: (key: string, value: string) => void
        getXMLAnswer: (cb: (answer: string) => void) => void
    }
}

interface SessionDetailProps {
    sessionId: string
    onBack?:   () => void
}

interface SessionDetailData {
    success:    boolean
    session:    TrainingSession & {
        location_name:        string
        description?:         string
        enrollment_deadline?: string
        confirmation_deadline?:string
    }
    enrollment: Enrollment | null
}

export default function SessionDetail({ sessionId, onBack }: SessionDetailProps) {
    const [sessionData, setSessionData] = useState<SessionDetailData | null>(null)
    const [enrollments, setEnrollments] = useState<Enrollment[]>([])
    const [loading, setLoading]         = useState(true)
    const [error, setError]             = useState<string | null>(null)

    useEffect(() => {
        if (!sessionId) return

        setLoading(true)
        setError(null)

        // Fetch session detail
        const ga = new window.GlideAjax('x_783010_tocc_a1.PortalApiService')
        ga.addParam('sysparm_name', 'getSessionDetail')
        ga.addParam('sysparm_session_id', sessionId)
        ga.getXMLAnswer((answer) => {
            try {
                const parsed = JSON.parse(answer) as SessionDetailData
                if (parsed.success) {
                    setSessionData(parsed)
                } else {
                    setError('Session not found.')
                }
            } catch {
                setError('Failed to load session.')
            } finally {
                setLoading(false)
            }
        })

        // Fetch enrollments for this session
        const ga2 = new window.GlideAjax('x_783010_tocc_a1.PortalApiService')
        ga2.addParam('sysparm_name', 'getMyEnrollments')
        ga2.getXMLAnswer((answer) => {
            try {
                const parsed = JSON.parse(answer) as { success: boolean; enrollments: Enrollment[] }
                if (parsed.success) {
                    setEnrollments(parsed.enrollments.filter((e: Enrollment) =>
                        (e as Enrollment & { training_session: string }).training_session === sessionId
                    ))
                }
            } catch { /* silent */ }
        })
    }, [sessionId])

    if (loading) return <LoadingSpinner label="Loading session…" />
    if (error || !sessionData) return (
        <EmptyState icon="⚠️" title="Session not found" subtitle={error ?? 'This session could not be loaded.'} />
    )

    const { session } = sessionData
    const fillPct = session.total_seats > 0
        ? Math.round(((session.total_seats - session.available_seats) / session.total_seats) * 100)
        : 0

    const enrollmentColumns = [
        { key: 'number',       label: 'Number',  width: '100px' },
        { key: 'student_name', label: 'Student' },
        { key: 'start_display',label: 'Date',    width: '130px' },
        { key: 'confirmed',    label: 'Confirmed', width: '90px',
          render: (row: Enrollment) => (
              <span style={{ color: row.confirmed ? COLORS.success : COLORS.textMuted, fontWeight: 600 }}>
                  {row.confirmed ? '✓ Yes' : '✗ No'}
              </span>
          ),
        },
        { key: 'status', label: 'Status', width: '120px',
          render: (row: Enrollment) => <StatusBadge status={row.status} size="sm" />,
        },
    ]

    return (
        <div style={{
            fontFamily:      '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            backgroundColor: COLORS.bgPage,
            minHeight:       '100vh',
            padding:         '24px',
        }}>
            {/* Back nav */}
            {onBack && (
                <button
                    onClick={onBack}
                    style={{
                        background:   'none',
                        border:       'none',
                        color:        COLORS.primary,
                        fontSize:     '13px',
                        cursor:       'pointer',
                        marginBottom: '16px',
                        padding:      0,
                        fontWeight:   500,
                    }}
                >
                    ← Back to Dashboard
                </button>
            )}

            {/* Session header card */}
            <div style={{
                backgroundColor: COLORS.bgCard,
                border:          `1px solid ${COLORS.border}`,
                borderRadius:    '12px',
                padding:         '24px',
                marginBottom:    '24px',
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                        <div style={{ fontSize: '12px', color: COLORS.textMuted, marginBottom: '4px' }}>
                            {session.number}
                        </div>
                        <h2 style={{ margin: '0 0 4px', fontSize: '20px', fontWeight: 700, color: COLORS.textPrimary }}>
                            {session.title}
                        </h2>
                        <div style={{ fontSize: '13px', color: COLORS.textMuted }}>
                            {session.course_name}
                        </div>
                    </div>
                    <StatusBadge status={session.status} />
                </div>

                {/* Detail grid */}
                <div style={{
                    display:             'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                    gap:                 '16px',
                    marginTop:           '20px',
                }}>
                    {[
                        { icon: '📍', label: 'Room',        value: session.room_name },
                        { icon: '🏢', label: 'Location',    value: session.location_name },
                        { icon: '👤', label: 'Instructor',  value: session.instructor_name },
                        { icon: '🕐', label: 'Start',       value: session.start_display },
                        { icon: '🕔', label: 'End',         value: session.end_display },
                        { icon: '💺', label: 'Seats',       value: `${session.available_seats} / ${session.total_seats} available` },
                    ].map(({ icon, label, value }) => (
                        <div key={label}>
                            <div style={{ fontSize: '11px', color: COLORS.textMuted, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                                {icon} {label}
                            </div>
                            <div style={{ fontSize: '13px', color: COLORS.textPrimary, fontWeight: 500 }}>
                                {value || '—'}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Fill rate bar */}
                <div style={{ marginTop: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: COLORS.textMuted, marginBottom: '4px' }}>
                        <span>Fill Rate</span>
                        <span style={{ fontWeight: 600, color: fillPct >= 70 ? COLORS.success : COLORS.warning }}>
                            {fillPct}%
                        </span>
                    </div>
                    <div style={{ height: '6px', backgroundColor: COLORS.border, borderRadius: '9999px', overflow: 'hidden' }}>
                        <div style={{
                            height:          '100%',
                            width:           `${fillPct}%`,
                            backgroundColor: fillPct >= 70 ? COLORS.success : COLORS.warning,
                            borderRadius:    '9999px',
                            transition:      'width 0.4s ease',
                        }} />
                    </div>
                </div>
            </div>

            {/* Enrolled students */}
            <div>
                <SectionHeader
                    title="Enrolled Students"
                    subtitle={`${enrollments.length} student(s) on this session`}
                />
                {enrollments.length === 0
                    ? <EmptyState icon="👥" title="No enrollments yet" subtitle="Students can enroll via the Service Portal." />
                    : <DataTable columns={enrollmentColumns} rows={enrollments} emptyText="No enrollments." />
                }
            </div>
        </div>
    )
}

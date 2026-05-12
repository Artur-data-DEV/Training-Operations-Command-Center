import React from 'react'
import { STATUS_COLORS, STATUS_LABELS, COLORS } from '../shared/tokens'

// ---------------------------------------------------------------------------
// StatusBadge — pill badge for any status value
// ---------------------------------------------------------------------------
interface StatusBadgeProps {
    status: string
    size?: 'sm' | 'md'
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
    const color = STATUS_COLORS[status] ?? COLORS.neutral
    const label = STATUS_LABELS[status] ?? status

    const padding = size === 'sm' ? '2px 8px' : '4px 12px'
    const fontSize = size === 'sm' ? '11px' : '12px'

    return (
        <span style={{
            display:         'inline-block',
            padding,
            borderRadius:    '9999px',
            fontSize,
            fontWeight:      600,
            color:           '#fff',
            backgroundColor: color,
            letterSpacing:   '0.02em',
            whiteSpace:      'nowrap',
        }}>
            {label}
        </span>
    )
}

// ---------------------------------------------------------------------------
// KpiCard — single metric tile for dashboard header row
// ---------------------------------------------------------------------------
interface KpiCardProps {
    label:   string
    value:   string | number
    unit?:   string
    target?: string
    trend?:  'up' | 'down' | 'neutral'
    color?:  string
}

export function KpiCard({ label, value, unit, target, trend, color = COLORS.primary }: KpiCardProps) {
    const trendIcon = trend === 'up' ? '↑' : trend === 'down' ? '↓' : null
    const trendColor = trend === 'up' ? COLORS.success : trend === 'down' ? COLORS.danger : COLORS.neutral

    return (
        <div style={{
            backgroundColor: COLORS.bgCard,
            border:          `1px solid ${COLORS.border}`,
            borderRadius:    '12px',
            padding:         '20px 24px',
            minWidth:        '160px',
            flex:            '1',
        }}>
            <div style={{ fontSize: '12px', color: COLORS.textMuted, fontWeight: 500, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {label}
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                <span style={{ fontSize: '28px', fontWeight: 700, color }}>
                    {value}
                </span>
                {unit && (
                    <span style={{ fontSize: '14px', color: COLORS.textMuted }}>{unit}</span>
                )}
                {trendIcon && (
                    <span style={{ fontSize: '16px', color: trendColor, marginLeft: '4px' }}>{trendIcon}</span>
                )}
            </div>
            {target && (
                <div style={{ fontSize: '11px', color: COLORS.textMuted, marginTop: '4px' }}>
                    Target: {target}
                </div>
            )}
        </div>
    )
}

// ---------------------------------------------------------------------------
// SectionHeader — page section title with optional action button
// ---------------------------------------------------------------------------
interface SectionHeaderProps {
    title:        string
    subtitle?:    string
    action?:      React.ReactNode
}

export function SectionHeader({ title, subtitle, action }: SectionHeaderProps) {
    return (
        <div style={{
            display:        'flex',
            justifyContent: 'space-between',
            alignItems:     'center',
            marginBottom:   '16px',
        }}>
            <div>
                <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: COLORS.textPrimary }}>
                    {title}
                </h2>
                {subtitle && (
                    <p style={{ margin: '4px 0 0', fontSize: '13px', color: COLORS.textMuted }}>
                        {subtitle}
                    </p>
                )}
            </div>
            {action && <div>{action}</div>}
        </div>
    )
}

// ---------------------------------------------------------------------------
// DataTable — generic sortable table for workspace lists
// ---------------------------------------------------------------------------
interface Column<T> {
    key:       keyof T | string
    label:     string
    render?:   (row: T) => React.ReactNode
    width?:    string
}

interface DataTableProps<T> {
    columns:    Column<T>[]
    rows:       T[]
    emptyText?: string
    onRowClick?: (row: T) => void
}

export function DataTable<T extends { sys_id: string }>({
    columns,
    rows,
    emptyText = 'No records found.',
    onRowClick,
}: DataTableProps<T>) {
    return (
        <div style={{ overflowX: 'auto', borderRadius: '8px', border: `1px solid ${COLORS.border}` }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                    <tr style={{ backgroundColor: '#f9fafb' }}>
                        {columns.map((col) => (
                            <th
                                key={String(col.key)}
                                style={{
                                    padding:     '10px 16px',
                                    textAlign:   'left',
                                    fontWeight:  600,
                                    color:       COLORS.textMuted,
                                    fontSize:    '11px',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    borderBottom: `1px solid ${COLORS.border}`,
                                    width:        col.width,
                                    whiteSpace:  'nowrap',
                                }}
                            >
                                {col.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.length === 0 ? (
                        <tr>
                            <td
                                colSpan={columns.length}
                                style={{ padding: '32px 16px', textAlign: 'center', color: COLORS.textMuted }}
                            >
                                {emptyText}
                            </td>
                        </tr>
                    ) : (
                        rows.map((row, idx) => (
                            <tr
                                key={row.sys_id}
                                onClick={() => onRowClick?.(row)}
                                style={{
                                    backgroundColor: idx % 2 === 0 ? '#fff' : '#fafafa',
                                    cursor:          onRowClick ? 'pointer' : 'default',
                                    borderBottom:    `1px solid ${COLORS.border}`,
                                    transition:      'background 0.1s',
                                }}
                                onMouseEnter={(e) => { if (onRowClick) (e.currentTarget as HTMLTableRowElement).style.backgroundColor = '#eff6ff' }}
                                onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.backgroundColor = idx % 2 === 0 ? '#fff' : '#fafafa' }}
                            >
                                {columns.map((col) => (
                                    <td
                                        key={String(col.key)}
                                        style={{ padding: '10px 16px', color: COLORS.textPrimary }}
                                    >
                                        {col.render
                                            ? col.render(row)
                                            : String((row as Record<string, unknown>)[String(col.key)] ?? '—')
                                        }
                                    </td>
                                ))}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    )
}

// ---------------------------------------------------------------------------
// LoadingSpinner — consistent loading state
// ---------------------------------------------------------------------------
export function LoadingSpinner({ label = 'Loading...' }: { label?: string }) {
    return (
        <div style={{
            display:         'flex',
            flexDirection:   'column',
            alignItems:      'center',
            justifyContent:  'center',
            padding:         '48px',
            color:           COLORS.textMuted,
            gap:             '12px',
        }}>
            <div style={{
                width:           '32px',
                height:          '32px',
                border:          `3px solid ${COLORS.border}`,
                borderTopColor:  COLORS.primary,
                borderRadius:    '50%',
                animation:       'tocc-spin 0.7s linear infinite',
            }} />
            <style>{`@keyframes tocc-spin { to { transform: rotate(360deg); } }`}</style>
            <span style={{ fontSize: '13px' }}>{label}</span>
        </div>
    )
}

// ---------------------------------------------------------------------------
// EmptyState — zero-data placeholder
// ---------------------------------------------------------------------------
interface EmptyStateProps {
    icon?:    string
    title:    string
    subtitle?: string
}

export function EmptyState({ icon = '📋', title, subtitle }: EmptyStateProps) {
    return (
        <div style={{
            display:        'flex',
            flexDirection:  'column',
            alignItems:     'center',
            padding:        '48px 24px',
            color:          COLORS.textMuted,
            textAlign:      'center',
            gap:            '8px',
        }}>
            <span style={{ fontSize: '40px' }}>{icon}</span>
            <strong style={{ fontSize: '15px', color: COLORS.textPrimary }}>{title}</strong>
            {subtitle && <p style={{ margin: 0, fontSize: '13px' }}>{subtitle}</p>}
        </div>
    )
}

import React, { useState } from 'react'
import ToccWorkspaceDashboard from './workspace-dashboard'
import SessionDetail from './session-detail'
import { COLORS } from '../shared/tokens'

// ---------------------------------------------------------------------------
// TOCC Workspace Root
//
// Acts as the top-level router for the UI Builder workspace.
// View states:
//   'dashboard'       → Main dashboard with KPI tiles and tables
//   'session-detail'  → Session detail + enrollment list
//
// In UI Builder, register this component as the root component
// for the TOCC Operations Workspace page.
// ---------------------------------------------------------------------------

type View =
    | { name: 'dashboard' }
    | { name: 'session-detail'; sessionId: string }

export default function ToccWorkspaceRoot() {
    const [view, setView] = useState<View>({ name: 'dashboard' })

    function navigateTo(v: View) { setView(v) }
    function goBack()            { setView({ name: 'dashboard' }) }

    return (
        <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
            {/* Top nav bar */}
            <nav style={{
                height:          '52px',
                backgroundColor: '#1a3c5e',
                display:         'flex',
                alignItems:      'center',
                padding:         '0 24px',
                gap:             '24px',
                position:        'sticky',
                top:             0,
                zIndex:          100,
                boxShadow:       '0 1px 4px rgba(0,0,0,0.15)',
            }}>
                <span style={{ color: '#fff', fontWeight: 700, fontSize: '15px', letterSpacing: '-0.01em' }}>
                    🏫 TOCC Operations
                </span>

                <button
                    onClick={() => navigateTo({ name: 'dashboard' })}
                    style={{
                        background:   'none',
                        border:       'none',
                        color:        view.name === 'dashboard' ? '#fff' : 'rgba(255,255,255,0.65)',
                        fontSize:     '13px',
                        fontWeight:   view.name === 'dashboard' ? 700 : 400,
                        cursor:       'pointer',
                        padding:      '4px 8px',
                        borderRadius: '4px',
                        transition:   'color 0.15s',
                    }}
                >
                    Dashboard
                </button>
            </nav>

            {/* View router */}
            {view.name === 'dashboard' && (
                <ToccWorkspaceDashboard />
            )}

            {view.name === 'session-detail' && (
                <SessionDetail
                    sessionId={view.sessionId}
                    onBack={goBack}
                />
            )}
        </div>
    )
}

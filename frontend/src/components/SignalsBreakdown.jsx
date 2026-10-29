import React, { useState } from 'react';
import { ShieldAlert, ShieldCheck, ChevronDown, ChevronUp, AlertTriangle, Layers } from 'lucide-react';

export default function SignalsBreakdown({ signals = [] }) {
  const [expanded, setExpanded] = useState(true);

  if (!signals || signals.length === 0) return null;

  const detectedSignals = signals.filter(s => s.status === 'detected');
  const cleanSignals = signals.filter(s => s.status === 'clean');

  return (
    <div style={{
      marginTop: '16px',
      borderRadius: '12px',
      border: '1px solid #D8D5CD',
      background: '#FFFFFF',
      overflow: 'hidden'
    }}>
      <div
        onClick={() => setExpanded(!expanded)}
        style={{
          padding: '12px 18px',
          background: '#F5F3ED',
          borderBottom: expanded ? '1px solid #D8D5CD' : 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Layers size={16} color="#214C3A" />
          <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#1A2620' }}>
            Signals & Features Analysed ({detectedSignals.length} Triggered / {signals.length} Evaluated)
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.72rem', color: '#5A6E63' }}>
            {expanded ? 'Collapse' : 'Expand'} Signals
          </span>
          {expanded ? <ChevronUp size={16} color="#5A6E63" /> : <ChevronDown size={16} color="#5A6E63" />}
        </div>
      </div>

      {expanded && (
        <div style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* Detected Signals */}
          {detectedSignals.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#B74A4A', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Active Triggered Signals:
              </div>
              {detectedSignals.map((sig, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    background: 'rgba(183, 74, 74, 0.05)',
                    border: '1px solid rgba(183, 74, 74, 0.25)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <AlertTriangle size={15} color="#B74A4A" />
                      <span style={{ fontWeight: '800', fontSize: '0.82rem', color: '#1A2620' }}>
                        {sig.name}
                      </span>
                      <span style={{
                        fontSize: '0.65rem',
                        padding: '1px 6px',
                        borderRadius: '4px',
                        background: '#214C3A',
                        color: '#FFFFFF',
                        fontWeight: '700'
                      }}>
                        {sig.category}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{
                        fontSize: '0.68rem',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        background: '#B74A4A',
                        color: '#FFFFFF',
                        fontWeight: '800'
                      }}>
                        +{sig.weight} pts
                      </span>
                      <span style={{ fontSize: '0.7rem', color: '#5A6E63' }}>
                        Severity: {sig.severity}
                      </span>
                    </div>
                  </div>

                  {sig.matched_snippet && (
                    <div style={{ fontSize: '0.75rem', color: '#2B3B32' }}>
                      <strong>Evidence:</strong> <code style={{ background: 'rgba(0,0,0,0.06)', padding: '1px 4px', borderRadius: '4px' }}>{sig.matched_snippet}</code>
                    </div>
                  )}

                  <div style={{ fontSize: '0.74rem', color: '#3D4F45', marginTop: '2px' }}>
                    <strong>Why it's suspicious:</strong> {sig.reason}
                  </div>

                  <div style={{ fontSize: '0.74rem', color: '#214C3A', fontWeight: '600', marginTop: '2px' }}>
                    <strong>Recommended Next Step:</strong> {sig.recommendation}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Clean Evaluated Signals */}
          {cleanSignals.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px' }}>
              <div style={{ fontSize: '0.74rem', fontWeight: '700', color: '#2E8B57', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Clean Baseline Signals Evaluated:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {cleanSignals.map((sig, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      background: 'rgba(46, 139, 87, 0.08)',
                      border: '1px solid rgba(46, 139, 87, 0.2)',
                      fontSize: '0.72rem',
                      color: '#1A3D2E'
                    }}
                  >
                    <ShieldCheck size={13} color="#2E8B57" />
                    <span>{sig.name} (0 pts)</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}


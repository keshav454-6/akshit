import React, { useState } from 'react';
import { ThumbsUp, AlertCircle, CheckCircle2, ShieldAlert, HelpCircle, Info, Calculator } from 'lucide-react';

export default function FeedbackWidget({ module, scanId = '', confidence = null, scoreCalculation = null, advisory = '' }) {
  const [feedbackSent, setFeedbackSent] = useState(null);
  const [showFormula, setShowFormula] = useState(false);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const sendFeedback = async (type) => {
    setSubmitting(true);
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          module,
          scan_id: scanId,
          feedback_type: type,
          notes: note
        })
      });
      if (res.ok) {
        setFeedbackSent(type);
      }
    } catch (e) {
      console.error("Feedback error", e);
      setFeedbackSent(type);
    } finally {
      setSubmitting(false);
    }
  };

  const confScore = typeof confidence === 'number' ? confidence : (confidence?.score || 85);
  const confLevel = (typeof confidence === 'object' && confidence?.level) ? confidence.level : (confScore >= 80 ? 'High Confidence' : 'Moderate Confidence');
  const formulaStr = typeof scoreCalculation === 'string' ? scoreCalculation : (scoreCalculation?.formula || scoreCalculation?.calculation || 'Deterministic rule-based scoring: 0-100');

  return (
    <div style={{
      marginTop: '16px',
      padding: '14px 18px',
      borderRadius: '12px',
      background: '#F9F8F6',
      border: '1px solid #D8D5CD',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    }}>
      {/* Top Bar: Confidence & Uncertainty */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#1A2620' }}>
            Confidence Assessment:
          </span>
          <span style={{
            fontSize: '0.72rem',
            padding: '2px 8px',
            borderRadius: '10px',
            fontWeight: '700',
            background: confScore >= 80 ? 'rgba(46, 139, 87, 0.15)' : confScore >= 50 ? 'rgba(230, 149, 0, 0.15)' : 'rgba(100, 116, 139, 0.15)',
            color: confScore >= 80 ? '#2E8B57' : confScore >= 50 ? '#D97706' : '#475569',
            border: `1px solid ${confScore >= 80 ? 'rgba(46, 139, 87, 0.3)' : 'rgba(230, 149, 0, 0.3)'}`
          }}>
            {confLevel} ({confScore}%)
          </span>
        </div>

        {formulaStr && (
          <button
            onClick={() => setShowFormula(!showFormula)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#214C3A',
              fontSize: '0.74rem',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Calculator size={13} />
            <span>{showFormula ? 'Hide Scoring Formula' : 'View Scoring Calculation'}</span>
          </button>
        )}
      </div>

      {/* Uncertainty explanation */}
      {confidence?.uncertainty_note && (
        <div style={{ fontSize: '0.74rem', color: '#5A6E63', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Info size={13} color="#214C3A" />
          <span>{confidence.uncertainty_note}</span>
        </div>
      )}

      {/* Scoring calculation formula popdown */}
      {showFormula && scoreCalculation && (
        <div style={{
          padding: '10px 14px',
          borderRadius: '8px',
          background: '#FFFFFF',
          border: '1px solid #D8D5CD',
          fontSize: '0.75rem',
          color: '#1A2620'
        }}>
          <div style={{ fontWeight: '700', marginBottom: '4px', color: '#214C3A' }}>
            📐 Transparent Scoring Method: {scoreCalculation?.method || 'Rule-Based Weighted Heuristic'}
          </div>
          <div style={{ fontFamily: 'monospace', background: '#F5F3ED', padding: '6px 8px', borderRadius: '6px' }}>
            {formulaStr}
          </div>
          {scoreCalculation.signal_contributions && scoreCalculation.signal_contributions.length > 0 && (
            <div style={{ marginTop: '8px' }}>
              <span style={{ fontWeight: '600' }}>Triggered Signals: </span>
              {scoreCalculation.signal_contributions.map((c, i) => (
                <span key={i} style={{ display: 'inline-block', margin: '2px 4px', padding: '2px 6px', background: 'rgba(33, 76, 58, 0.08)', borderRadius: '4px', fontSize: '0.7rem' }}>
                  {c.name} (+{c.weight} pts)
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Advisory disclaimer */}
      <div style={{
        fontSize: '0.72rem',
        color: '#64748B',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '6px',
        lineHeight: '1.4'
      }}>
        <AlertCircle size={14} color="#D97706" style={{ marginTop: '1px', flexShrink: 0 }} />
        <span>
          {advisory || 'Notice: Heuristic indicators represent risk warnings for defense and verification, not absolute legal proof of fraud or malice.'}
        </span>
      </div>

      {/* Feedback buttons */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: '8px',
        borderTop: '1px dashed #D8D5CD',
        flexWrap: 'wrap',
        gap: '8px'
      }}>
        <span style={{ fontSize: '0.75rem', color: '#3D4F45', fontWeight: '600' }}>
          Help tune detection accuracy:
        </span>

        {feedbackSent ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#2E8B57', fontSize: '0.76rem', fontWeight: '700' }}>
            <CheckCircle2 size={16} />
            <span>Thank you! Feedback recorded as {feedbackSent === 'false_positive' ? 'False Positive' : 'Useful Detection'}.</span>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => sendFeedback('useful_detection')}
              disabled={submitting}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '5px 12px',
                borderRadius: '8px',
                border: '1px solid rgba(46, 139, 87, 0.4)',
                background: 'rgba(46, 139, 87, 0.08)',
                color: '#214C3A',
                fontSize: '0.74rem',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              <ThumbsUp size={13} />
              <span>Useful Detection</span>
            </button>

            <button
              onClick={() => sendFeedback('false_positive')}
              disabled={submitting}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '5px 12px',
                borderRadius: '8px',
                border: '1px solid rgba(217, 119, 6, 0.4)',
                background: 'rgba(217, 119, 6, 0.08)',
                color: '#B45309',
                fontSize: '0.74rem',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              <AlertCircle size={13} />
              <span>Report False Positive</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}


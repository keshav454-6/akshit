import React, { useState, useEffect } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  PlusCircle,
  ShieldAlert,
  ShieldCheck,
  Lock,
  Key,
  Globe,
  Smartphone,
  Laptop,
  XCircle,
  Info
} from 'lucide-react';
import ScoreGauge from '../components/ScoreGauge';

const DEFAULT_SESSIONS = [
  {
    id: "EVT-8921",
    event_type: "Impossible Travel Anomaly",
    user_email: "rohit.sharma@cyberdefense.in",
    location: "Seoul, South Korea",
    ip_address: "211.233.77.102",
    device: "Chrome 124 / Linux x86_64",
    timestamp: "2 mins ago",
    risk_score: 94,
    severity: "Critical",
    status: "Active",
    anomaly_reason: "User session logged in from New Delhi, India 8 minutes ago. Physical velocity of 3,800 km/h exceeds commercial air travel limit."
  },
  {
    id: "EVT-8874",
    event_type: "Credential Stuffing Pattern",
    user_email: "priya.nair@enterprisecorp.com",
    location: "Frankfurt, Germany",
    ip_address: "185.190.141.22",
    device: "Python-Requests / Automated Tool",
    timestamp: "18 mins ago",
    risk_score: 82,
    severity: "High",
    status: "Active",
    anomaly_reason: "14 failed password attempts in 4 seconds across known compromised credential lists before successful OTP bypass attempt."
  },
  {
    id: "EVT-8710",
    event_type: "Legitimate Corporate Session",
    user_email: "akshit.admin@cybershield.local",
    location: "Mumbai, India",
    ip_address: "103.21.124.9",
    device: "CyberShield Android / Pixel 8",
    timestamp: "1 hour ago",
    risk_score: 12,
    severity: "Low",
    status: "Verified",
    anomaly_reason: "Hardware biometric key verified. Known IP subnet and registered device fingerprint match."
  }
];

export default function SessionLabView() {
  const [sessions, setSessions] = useState(DEFAULT_SESSIONS);
  const [loading, setLoading] = useState(false);
  const [actionFeedback, setActionFeedback] = useState(null);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/sessions');
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        setSessions(Array.isArray(data) && data.length > 0 ? data : DEFAULT_SESSIONS);
      } else {
        setSessions(DEFAULT_SESSIONS);
      }

    } catch (err) {
      setSessions(DEFAULT_SESSIONS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleRemediate = async (eventId, action) => {
    try {
      const res = await fetch('/api/sessions/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_id: eventId, action })
      });
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        setSessions(Array.isArray(data) && data.length > 0 ? data : DEFAULT_SESSIONS);
      } else {
        setSessions(DEFAULT_SESSIONS);
      }
      setActionFeedback(data);
      fetchSessions();
    } catch (err) {
      setSessions(DEFAULT_SESSIONS);
    }
  };

  const handleInjectAnomaly = async (scenario = 'impossible_travel') => {
    try {
      const res = await fetch('/api/sessions/inject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario })
      });
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        setSessions(Array.isArray(data) && data.length > 0 ? data : DEFAULT_SESSIONS);
      } else {
        setSessions(DEFAULT_SESSIONS);
      }
      setActionFeedback({
        message: `Synthetic anomaly injected: ${data.event_type} (${data.id})`,
        new_status: 'Active'
      });
      fetchSessions();
    } catch (err) {
      setSessions(DEFAULT_SESSIONS);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Overview Card */}
      <div className="cyber-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <div className="stat-icon-wrapper cyan">
            <Activity size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--text-primary)' }}>
              Account Hijacking & Session Anomaly Lab
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Simulated security operations center monitoring impossible travel velocities, credential stuffing, and session token anomalies.
            </p>
          </div>
        </div>

        {/* Mandatory Hackathon Simulation Disclaimer */}
        <div style={{
          marginTop: '12px',
          padding: '10px 14px',
          borderRadius: '8px',
          background: 'rgba(0, 0, 0, 0.06)',
          border: '1px solid rgba(0, 0, 0, 0.08)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '0.78rem',
          color: 'var(--primary-accent)'
        }}>
          <Info size={16} style={{ flexShrink: 0 }} />
          <span>
            <strong>Simulated Security Lab:</strong> All telemetry displayed is synthetic demo data engineered for testing defensive workflows. No real account passwords, cookies, or live network packets are harvested.
          </span>
        </div>

        {/* Live Attack Injection Bar */}
        <div style={{
          marginTop: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Inject Attack Vector:
            </span>
            <button
              onClick={() => handleInjectAnomaly('impossible_travel')}
              className="preset-chip"
            >
              + Impossible Travel (Seoul)
            </button>
            <button
              onClick={() => handleInjectAnomaly('credential_stuffing')}
              className="preset-chip"
            >
              + Credential Spray (Poland Botnet)
            </button>
            <button
              onClick={() => handleInjectAnomaly('session_hijack')}
              className="preset-chip"
            >
              + Cookie Hijack (Romania)
            </button>
          </div>

          <button onClick={fetchSessions} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.78rem' }}>
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            <span>Refresh Events</span>
          </button>
        </div>
      </div>

      {actionFeedback && (
        <div style={{
          padding: '12px 16px',
          borderRadius: '8px',
          background: 'rgba(33, 76, 58, 0.06)',
          border: '1px solid rgba(46, 139, 87, 0.2)',
          color: 'var(--primary-accent)',
          fontSize: '0.82rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <span>{actionFeedback.message}</span>
          <button onClick={() => setActionFeedback(null)} style={{ background: 'transparent', color: 'var(--primary-accent)' }}>
            ✕
          </button>
        </div>
      )}

      {/* Session Events Feed */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {(Array.isArray(sessions) ? sessions : []).map((sess) => {
          const isCritical = sess.risk_score >= 75;
          const isTerminated = sess.status === 'Terminated';
          return (
            <div
              key={sess.id}
              className={`cyber-card ${isCritical && !isTerminated ? 'cyber-card-danger' : ''}`}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '18px',
                opacity: isTerminated ? 0.6 : 1
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                <ScoreGauge score={sess.risk_score} size={84} label="Risk" />

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.78rem',
                      color: 'var(--primary-accent)',
                      background: '#D8D5CD',
                      padding: '2px 6px',
                      borderRadius: '4px'
                    }}>
                      {sess.id}
                    </span>
                    <span className={`badge ${
                      sess.severity === 'Critical' ? 'badge-critical' : sess.severity === 'High' ? 'badge-high' : 'badge-clean'
                    }`}>
                      {sess.severity}
                    </span>
                    <span className="badge badge-neutral" style={{ fontSize: '0.68rem' }}>
                      Status: {sess.status}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                    {sess.event_type}
                  </h3>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '12px',
                    fontSize: '0.78rem',
                    color: 'var(--text-muted)',
                    marginTop: '6px'
                  }}>
                    <span>User: <strong>{sess.user_email}</strong></span>
                    <span>•</span>
                    <span>Location: <strong>{sess.location}</strong></span>
                    <span>•</span>
                    <span>IP: <code>{sess.ip_address}</code></span>
                    <span>•</span>
                    <span>Device: {sess.device}</span>
                    <span>•</span>
                    <span>Time: {sess.timestamp}</span>
                  </div>

                  <div style={{
                    marginTop: '8px',
                    fontSize: '0.8rem',
                    color: 'var(--text-muted)',
                    background: '#F5F3ED',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid rgba(0, 0, 0, 0.06)'
                  }}>
                    <strong style={{ color: isCritical ? 'var(--color-danger)' : 'var(--primary-accent)' }}>Anomaly Indicator: </strong>
                    {sess.anomaly_reason}
                  </div>
                </div>
              </div>

              {/* Remediation Actions */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                minWidth: '180px',
                alignSelf: 'center'
              }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: '700', textTransform: 'uppercase' }}>
                  Defensive Actions:
                </div>

                <button
                  type="button"
                  className="btn-danger"
                  style={{ padding: '6px 12px', fontSize: '0.76rem' }}
                  onClick={() => handleRemediate(sess.id, 'revoke')}
                  disabled={isTerminated}
                >
                  <XCircle size={14} />
                  <span>Terminate Session</span>
                </button>

                <button
                  type="button"
                  className="btn-secondary"
                  style={{ padding: '6px 12px', fontSize: '0.76rem' }}
                  onClick={() => handleRemediate(sess.id, 'mfa')}
                >
                  <Key size={14} />
                  <span>Enforce MFA Challenge</span>
                </button>

                <button
                  type="button"
                  className="btn-secondary"
                  style={{ padding: '6px 12px', fontSize: '0.76rem' }}
                  onClick={() => handleRemediate(sess.id, 'reset_password')}
                >
                  <Lock size={14} />
                  <span>Reset Credentials</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}












import React, { useState } from 'react';
import {
  X,
  Download,
  Terminal,
  FileArchive,
  FileCode2,
  FileText,
  CheckCircle2,
  Laptop,
  Shield,
  ExternalLink,
  HardDrive
} from 'lucide-react';

export default function DownloadModal({ isOpen, onClose }) {
  const [downloadStarted, setDownloadStarted] = useState(false);
  const [downloadType, setDownloadType] = useState('');

  if (!isOpen) return null;

  const triggerDownload = (url, name) => {
    setDownloadType(name);
    setDownloadStarted(true);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', '');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      setDownloadStarted(false);
    }, 4000);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(26, 38, 32, 0.65)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '20px'
    }}>
      <div style={{
        background: '#FFFFFF',
        borderRadius: '18px',
        maxWidth: '680px',
        width: '100%',
        boxShadow: '0 20px 40px rgba(0,0,0,0.22), 0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #D8D5CD',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        maxHeight: '90vh'
      }}>
        {/* Header */}
        <div style={{
          padding: '22px 26px',
          background: 'linear-gradient(135deg, #214C3A 0%, #1A3D2E 100%)',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'rgba(255,255,255,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(255,255,255,0.2)'
            }}>
              <Laptop size={22} color="#00f5d4" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0, letterSpacing: '-0.01em' }}>
                  Download CyberShield for System
                </h3>
                <span style={{
                  fontSize: '0.7rem',
                  background: 'rgba(0, 245, 212, 0.2)',
                  color: '#00f5d4',
                  padding: '2px 8px',
                  borderRadius: '10px',
                  fontWeight: '700'
                }}>
                  Windows / Offline
                </span>
              </div>
              <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)' }}>
                Zero-knowledge local security suite. Run 100% offline with zero cloud telemetry.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.12)',
              border: 'none',
              borderRadius: '10px',
              width: '34px',
              height: '34px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '24px 26px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {downloadStarted && (
            <div style={{
              background: 'rgba(46, 139, 87, 0.1)',
              border: '1px solid rgba(46, 139, 87, 0.3)',
              padding: '12px 16px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              color: '#1A3D2E',
              fontSize: '0.86rem',
              fontWeight: '600'
            }}>
              <CheckCircle2 size={20} color="#2E8B57" />
              <span>Downloading <strong>{downloadType}</strong> to your system downloads folder...</span>
            </div>
          )}

          {/* Featured Option: Full System Zip */}
          <div style={{
            border: '2px solid #214C3A',
            borderRadius: '14px',
            padding: '16px 20px',
            background: '#F8FAF9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '14px',
            flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '10px',
                background: '#214C3A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF'
              }}>
                <FileArchive size={24} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '800', color: '#1A2620' }}>
                    CyberShield One Full Package (.ZIP)
                  </h4>
                  <span style={{
                    fontSize: '0.68rem',
                    background: '#214C3A',
                    color: '#FFFFFF',
                    padding: '2px 6px',
                    borderRadius: '6px',
                    fontWeight: '700'
                  }}>
                    Recommended
                  </span>
                </div>
                <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: '#3D4F45' }}>
                  Includes all 8 security engines, React dashboard, SQLite database & 1-click launcher. (~380 KB)
                </p>
              </div>
            </div>

            <button
              onClick={() => triggerDownload('/downloads/CyberShield-One-Windows.zip', 'CyberShield-One-Windows.zip')}
              className="btn-primary"
              style={{
                padding: '9px 18px',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Download size={16} />
              <span>Download ZIP</span>
            </button>
          </div>

          {/* Quick Launchers Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
            {/* Option 2: 1-Click BAT Launcher */}
            <div style={{
              border: '1px solid #D8D5CD',
              borderRadius: '12px',
              padding: '14px 16px',
              background: '#FFFFFF',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <Terminal size={22} color="#214C3A" style={{ marginTop: '2px' }} />
                <div>
                  <h5 style={{ margin: 0, fontSize: '0.92rem', fontWeight: '700', color: '#1A2620' }}>
                    1-Click System Launcher (.BAT)
                  </h5>
                  <p style={{ margin: '3px 0 0', fontSize: '0.74rem', color: '#5A6E63' }}>
                    Double-click batch script to automatically start local server and open browser.
                  </p>
                </div>
              </div>
              <button
                onClick={() => triggerDownload('/downloads/CyberShield-System-Launcher.bat', 'CyberShield-System-Launcher.bat')}
                className="btn-secondary"
                style={{
                  padding: '7px 12px',
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <Download size={14} />
                <span>Download .BAT</span>
              </button>
            </div>

            {/* Option 3: PowerShell Script */}
            <div style={{
              border: '1px solid #D8D5CD',
              borderRadius: '12px',
              padding: '14px 16px',
              background: '#FFFFFF',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <FileCode2 size={22} color="#3a86ff" style={{ marginTop: '2px' }} />
                <div>
                  <h5 style={{ margin: 0, fontSize: '0.92rem', fontWeight: '700', color: '#1A2620' }}>
                    PowerShell Runner (.PS1)
                  </h5>
                  <p style={{ margin: '3px 0 0', fontSize: '0.74rem', color: '#5A6E63' }}>
                    Automated PowerShell runner with clean process isolation and graceful shutdown.
                  </p>
                </div>
              </div>
              <button
                onClick={() => triggerDownload('/downloads/CyberShield-Launcher.ps1', 'CyberShield-Launcher.ps1')}
                className="btn-secondary"
                style={{
                  padding: '7px 12px',
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <Download size={14} />
                <span>Download .PS1</span>
              </button>
            </div>

            {/* Option 4: Threat Assessment Report */}
            <div style={{
              border: '1px solid #D8D5CD',
              borderRadius: '12px',
              padding: '14px 16px',
              background: '#FFFFFF',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '12px',
              gridColumn: '1 / -1'
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <FileText size={22} color="#9c27b0" style={{ marginTop: '2px' }} />
                <div>
                  <h5 style={{ margin: 0, fontSize: '0.92rem', fontWeight: '700', color: '#1A2620' }}>
                    Executive CyberShield Audit Report (.HTML)
                  </h5>
                  <p style={{ margin: '3px 0 0', fontSize: '0.74rem', color: '#5A6E63' }}>
                    Pre-compiled full forensic audit report covering all tested security scenarios and remediation blueprints.
                  </p>
                </div>
              </div>
              <button
                onClick={() => triggerDownload('/downloads/CyberShield_Conversation_Report.html', 'CyberShield_Conversation_Report.html')}
                className="btn-secondary"
                style={{
                  padding: '7px 12px',
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  width: 'fit-content'
                }}
              >
                <Download size={14} />
                <span>Download HTML Report</span>
              </button>
            </div>
          </div>

          {/* Quick Instructions */}
          <div style={{
            background: '#F5F3ED',
            borderRadius: '12px',
            padding: '14px 16px',
            border: '1px solid #E4E1D9',
            fontSize: '0.78rem',
            color: '#3D4F45'
          }}>
            <div style={{ fontWeight: '700', color: '#1A2620', marginBottom: '6px' }}>
              🛠️ Quick 3-Step Setup on Your Machine:
            </div>
            <ol style={{ margin: 0, paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <li>Download the <strong>CyberShield-One-Windows.zip</strong> package and extract it to any folder.</li>
              <li>Double-click <strong>CyberShield-System-Launcher.bat</strong> (or run in PowerShell).</li>
              <li>Your browser will open automatically at <code>http://localhost:5173</code> with all engines active!</li>
            </ol>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '14px 26px',
          background: '#F9F8F6',
          borderTop: '1px solid #D8D5CD',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#5A6E63' }}>
            <Shield size={14} color="#214C3A" />
            <span>100% Free & Open Source for MNIT Hackathon</span>
          </div>

          <button
            onClick={onClose}
            className="btn-secondary"
            style={{ padding: '6px 16px', fontSize: '0.8rem' }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { X, Monitor, CheckCircle2, ArrowRight, ShieldCheck, Download, Smartphone, Globe, Share2 } from 'lucide-react';

export default function InstallModal({ isOpen, onClose, onOpenShare }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  useEffect(() => {
    // Listen for PWA beforeinstallprompt
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      window.deferredPrompt = e;
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setInstallSuccess(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    const promptEvent = deferredPrompt || window.deferredPrompt;
    if (promptEvent) {
      promptEvent.prompt();
      const choiceResult = await promptEvent.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setInstallSuccess(true);
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      // Fallback instructions alert
      alert('To install in Chrome or Edge:\n1. Look at the right side of the address bar at the top of your screen.\n2. Click the "Install CyberShield One" icon (icon with a computer/download arrow).\n3. Click "Install" in the popup.');
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(26, 38, 32, 0.65)',
      backdropFilter: 'blur(5px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '16px'
    }}>
      <div style={{
        background: '#FFFFFF',
        borderRadius: '18px',
        maxWidth: '560px',
        width: '100%',
        boxShadow: '0 20px 45px rgba(0,0,0,0.22)',
        overflow: 'hidden',
        border: '1px solid #D8D5CD',
        animation: 'fadeIn 0.2s ease-out'
      }}>
        {/* Modal Header */}
        <div style={{
          background: 'linear-gradient(135deg, #1A2620 0%, #214C3A 100%)',
          padding: '24px',
          color: '#FFFFFF',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <div style={{
                background: 'rgba(0, 245, 212, 0.15)',
                border: '1px solid rgba(0, 245, 212, 0.4)',
                borderRadius: '8px',
                padding: '6px'
              }}>
                <Monitor size={20} color="#00F5D4" />
              </div>
              <span style={{ fontSize: '0.8rem', color: '#00F5D4', fontWeight: '700', letterSpacing: '0.04em' }}>
                STANDALONE SYSTEM APP
              </span>
            </div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: '800', margin: 0, fontFamily: "'Space Grotesk', sans-serif" }}>
              Website ko System me Install Karein
            </h2>
            <p style={{ margin: '6px 0 0', fontSize: '0.85rem', color: '#D8D5CD' }}>
              CyberShield One ko bina code download kiye directly Windows App ki tarah install karein.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              borderRadius: '8px',
              color: '#FFFFFF',
              cursor: 'pointer',
              padding: '6px',
              display: 'flex'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px' }}>
          {installSuccess || isInstalled ? (
            <div style={{
              background: 'rgba(46, 139, 87, 0.08)',
              border: '1px solid rgba(46, 139, 87, 0.3)',
              borderRadius: '12px',
              padding: '18px',
              textAlign: 'center',
              marginBottom: '18px'
            }}>
              <CheckCircle2 size={36} color="#2E8B57" style={{ margin: '0 auto 10px' }} />
              <h4 style={{ margin: '0 0 4px', color: '#214C3A', fontSize: '1.05rem', fontWeight: '700' }}>
                App Successfully Installed!
              </h4>
              <p style={{ margin: '0 0 14px', fontSize: '0.85rem', color: '#3D4F45' }}>
                CyberShield One aapke Windows Start Menu, Taskbar aur Desktop par add ho gaya hai. Aap ise direct open kar sakte hain.
              </p>
              {onOpenShare && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenShare();
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: '#214C3A',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    fontSize: '0.85rem',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  <Share2 size={15} />
                  <span>App Doston ke Saath Share Karein</span>
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Android APK Download Card */}
              <div style={{
                background: 'linear-gradient(135deg, #EBF3EE 0%, #D8EADF 100%)',
                border: '1px solid #A2CEB5',
                borderRadius: '12px',
                padding: '14px 16px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '10px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    background: '#214C3A',
                    color: '#00F5D4',
                    borderRadius: '10px',
                    padding: '8px'
                  }}>
                    <Smartphone size={22} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.92rem', fontWeight: '800', color: '#1A2620' }}>
                      Android Phone ke liye APK (.apk)
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#3D4F45' }}>
                      Kisi bhi mobile me direct transfer & install karein (~587 KB)
                    </div>
                  </div>
                </div>

                <a
                  href="/download/apk"
                  download="CyberShield-One.apk"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: '#214C3A',
                    color: '#FFFFFF',
                    textDecoration: 'none',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    fontSize: '0.84rem',
                    fontWeight: '700',
                    boxShadow: '0 2px 8px rgba(33, 76, 58, 0.25)'
                  }}
                >
                  <Download size={14} />
                  <span>Download APK</span>
                </a>
              </div>

              {/* Primary 1-Click Install Button */}
              <div style={{ marginBottom: '20px' }}>
                <button
                  onClick={handleInstallClick}
                  style={{
                    width: '100%',
                    background: 'linear-gradient(135deg, #214C3A 0%, #2E8B57 100%)',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '14px 20px',
                    fontSize: '1rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(33, 76, 58, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    transition: 'transform 0.15s ease'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <Download size={20} />
                  <span>Abhi Install Karein (1-Click Install App)</span>
                </button>
              </div>

              {/* Step by Step Guide for Browser Address Bar */}
              <div style={{
                background: '#F5F3ED',
                border: '1px solid #D8D5CD',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '18px'
              }}>
                <h4 style={{ margin: '0 0 10px', fontSize: '0.9rem', color: '#1A2620', fontWeight: '700' }}>
                  📌 Browser ke Address Bar se Direct Install karne ka tarika:
                </h4>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem', color: '#3D4F45' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <div style={{
                      background: '#214C3A',
                      color: '#FFF',
                      borderRadius: '50%',
                      width: '20px',
                      height: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      flexShrink: 0,
                      marginTop: '1px'
                    }}>1</div>
                    <div>
                      Apne browser (Chrome ya Edge) me sabse upar <strong>URL Address Bar</strong> dekhein.
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <div style={{
                      background: '#214C3A',
                      color: '#FFF',
                      borderRadius: '50%',
                      width: '20px',
                      height: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      flexShrink: 0,
                      marginTop: '1px'
                    }}>2</div>
                    <div>
                      URL ke bilkul right side me <strong>Install App icon</strong> (Computer/Download arrow) dikhega.
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <div style={{
                      background: '#214C3A',
                      color: '#FFF',
                      borderRadius: '50%',
                      width: '20px',
                      height: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      flexShrink: 0,
                      marginTop: '1px'
                    }}>3</div>
                    <div>
                      Us par click karke <strong>"Install"</strong> dabayein. Ye turant Windows me separate app window ki tarah install ho jayega!
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Features of Installed App */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '10px',
            fontSize: '0.8rem',
            color: '#3D4F45'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={16} color="#2E8B57" />
              <span>Dedicated Windows Window</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={16} color="#2E8B57" />
              <span>Windows Start Menu Icon</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={16} color="#2E8B57" />
              <span>Bina Browser Tabs ke Chalega</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={16} color="#2E8B57" />
              <span>Zero Code Setup Needed</span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '12px 24px',
          background: '#F9F8F5',
          borderTop: '1px solid #D8D5CD',
          display: 'flex',
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '7px 18px',
              background: '#E8E5DD',
              color: '#1A2620',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Band Karein (Close)
          </button>
        </div>
      </div>
    </div>
  );
}

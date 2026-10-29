import React, { useState } from 'react';
import { X, Share2, Copy, Check, MessageCircle, Send, Mail, Smartphone, QrCode, Globe, Shield, ExternalLink, Download } from 'lucide-react';

export default function ShareModal({ isOpen, onClose }) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('quick'); // 'quick' | 'network' | 'qr'

  if (!isOpen) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5000';
  const networkUrl = 'http://10.123.155.173:5000';
  const githubUrl = 'https://github.com/keshav454-6/akshit';

  const shareTitle = 'CyberShield One — All-in-One Cyber Defense Platform';
  const shareMessage = `🛡️ Check out CyberShield One!\n\nAll-in-one AI & Heuristic Cybersecurity Platform for detecting:\n• Scam & Urgent Messages\n• Fake Customer-Care Numbers\n• Fraudulent UPI & Payment Requests\n• Voice-Clone Scams & Data Leaks\n\nOpen & Install App:\n${currentUrl}`;

  const handleCopy = (textToCopy) => {
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareMessage,
          url: currentUrl
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          handleCopy(currentUrl);
        }
      }
    } else {
      handleCopy(currentUrl);
    }
  };

  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareMessage)}`;
  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent('🛡️ CyberShield One - All-in-One Cyber Defense Platform')}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent('🛡️ Check out CyberShield One: Unified Defense against scams, UPI fraud & voice clones!')}&url=${encodeURIComponent(currentUrl)}`;
  const mailtoUrl = `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(shareMessage)}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(currentUrl)}&bgcolor=FFFFFF&color=214C3A&margin=10`;

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
        maxWidth: '540px',
        width: '100%',
        boxShadow: '0 20px 45px rgba(0,0,0,0.22)',
        overflow: 'hidden',
        border: '1px solid #D8D5CD',
        animation: 'fadeIn 0.2s ease-out'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #1A2620 0%, #214C3A 100%)',
          padding: '22px 24px',
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
                <Share2 size={18} color="#00F5D4" />
              </div>
              <span style={{ fontSize: '0.8rem', color: '#00F5D4', fontWeight: '700', letterSpacing: '0.04em' }}>
                SHARE WITH FRIENDS & TEAM
              </span>
            </div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: '800', margin: 0, fontFamily: "'Space Grotesk', sans-serif" }}>
              CyberShield One App Share Karein
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#D8D5CD' }}>
              Doston aur team ke saath app ka link ya QR code share karein.
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

        {/* Tab Switcher */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid #E8E5DD',
          background: '#F9F8F5',
          padding: '4px 20px 0'
        }}>
          <button
            onClick={() => setActiveTab('quick')}
            style={{
              flex: 1,
              padding: '10px 0',
              border: 'none',
              background: 'none',
              fontSize: '0.82rem',
              fontWeight: activeTab === 'quick' ? '700' : '600',
              color: activeTab === 'quick' ? '#214C3A' : '#737373',
              borderBottom: activeTab === 'quick' ? '3px solid #214C3A' : '3px solid transparent',
              cursor: 'pointer'
            }}
          >
            Direct Share
          </button>
          <button
            onClick={() => setActiveTab('apk')}
            style={{
              flex: 1,
              padding: '10px 0',
              border: 'none',
              background: 'none',
              fontSize: '0.82rem',
              fontWeight: activeTab === 'apk' ? '700' : '600',
              color: activeTab === 'apk' ? '#214C3A' : '#737373',
              borderBottom: activeTab === 'apk' ? '3px solid #214C3A' : '3px solid transparent',
              cursor: 'pointer'
            }}
          >
            Android APK (.apk)
          </button>
          <button
            onClick={() => setActiveTab('qr')}
            style={{
              flex: 1,
              padding: '10px 0',
              border: 'none',
              background: 'none',
              fontSize: '0.82rem',
              fontWeight: activeTab === 'qr' ? '700' : '600',
              color: activeTab === 'qr' ? '#214C3A' : '#737373',
              borderBottom: activeTab === 'qr' ? '3px solid #214C3A' : '3px solid transparent',
              cursor: 'pointer'
            }}
          >
            QR Scan
          </button>
          <button
            onClick={() => setActiveTab('network')}
            style={{
              flex: 1,
              padding: '10px 0',
              border: 'none',
              background: 'none',
              fontSize: '0.82rem',
              fontWeight: activeTab === 'network' ? '700' : '600',
              color: activeTab === 'network' ? '#214C3A' : '#737373',
              borderBottom: activeTab === 'network' ? '3px solid #214C3A' : '3px solid transparent',
              cursor: 'pointer'
            }}
          >
            Wi-Fi Link
          </button>
        </div>

        {/* Tab Content */}
        <div style={{ padding: '22px 24px' }}>
          {activeTab === 'quick' && (
            <div>
              {/* Native System Share Button */}
              <button
                onClick={handleNativeShare}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #214C3A 0%, #2E8B57 100%)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px 18px',
                  fontSize: '0.95rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(33, 76, 58, 0.25)',
                  marginBottom: '18px'
                }}
              >
                <Share2 size={18} />
                <span>Windows Share Tray / Apps Me Share Karein</span>
              </button>

              {/* Social Buttons Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '10px',
                marginBottom: '18px'
              }}>
                {/* WhatsApp */}
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '12px 8px',
                    borderRadius: '12px',
                    background: '#E7F8EE',
                    border: '1px solid #A2E2B8',
                    textDecoration: 'none',
                    color: '#166534',
                    transition: 'transform 0.15s ease'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <MessageCircle size={24} color="#25D366" />
                  <span style={{ fontSize: '0.75rem', fontWeight: '700', marginTop: '6px' }}>WhatsApp</span>
                </a>

                {/* Telegram */}
                <a
                  href={telegramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '12px 8px',
                    borderRadius: '12px',
                    background: '#EDF6FD',
                    border: '1px solid #B6DCFE',
                    textDecoration: 'none',
                    color: '#0369A1',
                    transition: 'transform 0.15s ease'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <Send size={24} color="#0088CC" />
                  <span style={{ fontSize: '0.75rem', fontWeight: '700', marginTop: '6px' }}>Telegram</span>
                </a>

                {/* Email */}
                <a
                  href={mailtoUrl}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '12px 8px',
                    borderRadius: '12px',
                    background: '#F5F3ED',
                    border: '1px solid #D8D5CD',
                    textDecoration: 'none',
                    color: '#3D4F45',
                    transition: 'transform 0.15s ease'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <Mail size={24} color="#214C3A" />
                  <span style={{ fontSize: '0.75rem', fontWeight: '700', marginTop: '6px' }}>Email</span>
                </a>

                {/* Twitter / X */}
                <a
                  href={twitterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '12px 8px',
                    borderRadius: '12px',
                    background: '#F4F4F5',
                    border: '1px solid #E4E4E7',
                    textDecoration: 'none',
                    color: '#18181B',
                    transition: 'transform 0.15s ease'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="#000000"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  <span style={{ fontSize: '0.75rem', fontWeight: '700', marginTop: '6px' }}>X / Twitter</span>
                </a>
              </div>

              {/* Copy Link Input Bar */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: '#F5F3ED',
                border: '1px solid #D8D5CD',
                borderRadius: '10px',
                padding: '8px 12px'
              }}>
                <Globe size={16} color="#737373" />
                <input
                  type="text"
                  readOnly
                  value={currentUrl}
                  style={{
                    flex: 1,
                    background: 'none',
                    border: 'none',
                    fontSize: '0.85rem',
                    color: '#1A2620',
                    outline: 'none',
                    fontWeight: '600'
                  }}
                />
                <button
                  onClick={() => handleCopy(currentUrl)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    background: copied ? '#2E8B57' : '#214C3A',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '6px 12px',
                    fontSize: '0.78rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copied ? 'Copied!' : 'Copy Link'}</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'apk' && (
            <div>
              {/* APK Hero Card */}
              <div style={{
                background: 'linear-gradient(135deg, #214C3A 0%, #1A3D2E 100%)',
                borderRadius: '14px',
                padding: '18px 20px',
                color: '#FFFFFF',
                marginBottom: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                  <div style={{
                    background: 'rgba(0, 245, 212, 0.2)',
                    border: '1px solid rgba(0, 245, 212, 0.5)',
                    borderRadius: '10px',
                    padding: '8px',
                    display: 'flex'
                  }}>
                    <Smartphone size={24} color="#00F5D4" />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800' }}>CyberShield One APK File</h3>
                    <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#D8D5CD' }}>
                      Standalone Android App Package • Size: 587 KB
                    </p>
                  </div>
                </div>

                <p style={{ margin: '0 0 14px', fontSize: '0.82rem', color: '#E8E5DD', lineHeight: '1.4' }}>
                  Ye APK file kisi bhi Android phone me bina internet ke complete CyberShield One chalati hai. Ise Bluetooth ya WhatsApp se bhejein.
                </p>

                <a
                  href="/download/apk"
                  download="CyberShield-One.apk"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    background: '#00F5D4',
                    color: '#040814',
                    borderRadius: '10px',
                    padding: '11px',
                    fontSize: '0.9rem',
                    fontWeight: '800',
                    textDecoration: 'none',
                    boxShadow: '0 2px 10px rgba(0, 245, 212, 0.35)'
                  }}
                >
                  <Download size={18} />
                  <span>Download CyberShield-One.apk</span>
                </a>
              </div>

              {/* Desktop Location Tip */}
              <div style={{
                background: '#F5F3ED',
                border: '1px solid #D8D5CD',
                borderRadius: '12px',
                padding: '14px',
                fontSize: '0.82rem',
                color: '#3D4F45'
              }}>
                <div style={{ fontWeight: '700', color: '#1A2620', marginBottom: '4px' }}>
                  📁 Aapke Desktop par file ready hai:
                </div>
                <div style={{
                  background: '#FFFFFF',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  fontFamily: 'monospace',
                  fontSize: '0.78rem',
                  color: '#214C3A',
                  border: '1px solid #D8D5CD',
                  marginBottom: '10px'
                }}>
                  C:\Users\agarw\OneDrive\Desktop\CyberShield-One.apk
                </div>
                <div style={{ fontSize: '0.78rem', color: '#555' }}>
                  💡 <strong>Tip:</strong> Aap seedha <strong>WhatsApp Web</strong> ya <strong>Telegram</strong> khol kar apne Desktop se <code style={{ color: '#214C3A' }}>CyberShield-One.apk</code> ko drag & drop karke doston ko bhej sakte hain!
                </div>
              </div>
            </div>
          )}

          {activeTab === 'qr' && (
            <div style={{ textAlign: 'center' }}>
              <p style={{ margin: '0 0 14px', fontSize: '0.85rem', color: '#3D4F45' }}>
                Apne phone ke camera se scan karein aur direct mobile me install karein:
              </p>
              <div style={{
                display: 'inline-block',
                padding: '12px',
                background: '#FFFFFF',
                borderRadius: '14px',
                border: '2px solid #D8D5CD',
                boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
              }}>
                <img
                  src={qrCodeUrl}
                  alt="CyberShield App QR Code"
                  style={{ width: '180px', height: '180px', display: 'block' }}
                />
              </div>
              <div style={{ marginTop: '14px' }}>
                <button
                  onClick={() => handleCopy(currentUrl)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: '#F5F3ED',
                    color: '#214C3A',
                    border: '1px solid #D8D5CD',
                    borderRadius: '8px',
                    padding: '6px 14px',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  {copied ? <Check size={14} color="#2E8B57" /> : <Copy size={14} />}
                  <span>{copied ? 'Link Copied!' : 'Copy Share URL'}</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'apk' && (
            <div>
              {/* APK Hero Card */}
              <div style={{
                background: 'linear-gradient(135deg, #214C3A 0%, #1A3D2E 100%)',
                borderRadius: '14px',
                padding: '18px 20px',
                color: '#FFFFFF',
                marginBottom: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                  <div style={{
                    background: 'rgba(0, 245, 212, 0.2)',
                    border: '1px solid rgba(0, 245, 212, 0.5)',
                    borderRadius: '10px',
                    padding: '8px',
                    display: 'flex'
                  }}>
                    <Smartphone size={24} color="#00F5D4" />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800' }}>CyberShield One APK File</h3>
                    <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#D8D5CD' }}>
                      Standalone Android App Package • Size: 587 KB
                    </p>
                  </div>
                </div>

                <p style={{ margin: '0 0 14px', fontSize: '0.82rem', color: '#E8E5DD', lineHeight: '1.4' }}>
                  Ye APK file kisi bhi Android phone me bina internet ke complete CyberShield One chalati hai. Ise Bluetooth ya WhatsApp se bhejein.
                </p>

                <a
                  href="/download/apk"
                  download="CyberShield-One.apk"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    background: '#00F5D4',
                    color: '#040814',
                    borderRadius: '10px',
                    padding: '11px',
                    fontSize: '0.9rem',
                    fontWeight: '800',
                    textDecoration: 'none',
                    boxShadow: '0 2px 10px rgba(0, 245, 212, 0.35)'
                  }}
                >
                  <Download size={18} />
                  <span>Download CyberShield-One.apk</span>
                </a>
              </div>

              {/* Desktop Location Tip */}
              <div style={{
                background: '#F5F3ED',
                border: '1px solid #D8D5CD',
                borderRadius: '12px',
                padding: '14px',
                fontSize: '0.82rem',
                color: '#3D4F45'
              }}>
                <div style={{ fontWeight: '700', color: '#1A2620', marginBottom: '4px' }}>
                  📁 Aapke Desktop par file ready hai:
                </div>
                <div style={{
                  background: '#FFFFFF',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  fontFamily: 'monospace',
                  fontSize: '0.78rem',
                  color: '#214C3A',
                  border: '1px solid #D8D5CD',
                  marginBottom: '10px'
                }}>
                  C:\Users\agarw\OneDrive\Desktop\CyberShield-One.apk
                </div>
                <div style={{ fontSize: '0.78rem', color: '#555' }}>
                  💡 <strong>Tip:</strong> Aap seedha <strong>WhatsApp Web</strong> ya <strong>Telegram</strong> khol kar apne Desktop se <code style={{ color: '#214C3A' }}>CyberShield-One.apk</code> ko drag & drop karke doston ko bhej sakte hain!
                </div>
              </div>
            </div>
          )}

          {activeTab === 'network' && (
            <div>
              <div style={{
                background: '#F5F3ED',
                border: '1px solid #D8D5CD',
                borderRadius: '12px',
                padding: '14px',
                marginBottom: '14px'
              }}>
                <h4 style={{ margin: '0 0 6px', fontSize: '0.9rem', color: '#1A2620', fontWeight: '700' }}>
                  📶 Same Wi-Fi / Hotspot par Dusre Devices me Chalayein:
                </h4>
                <p style={{ margin: 0, fontSize: '0.82rem', color: '#3D4F45', lineHeight: '1.4' }}>
                  Aapke ghar ya office ke same Wi-Fi network se connect kisi bhi Phone ya Laptop ke browser me ye link kholein:
                </p>
              </div>

              {/* Wi-Fi Link Box */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: '#FFFFFF',
                border: '2px dashed #214C3A',
                borderRadius: '10px',
                padding: '10px 14px',
                marginBottom: '14px'
              }}>
                <Smartphone size={20} color="#214C3A" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.72rem', color: '#737373', fontWeight: '600' }}>LOCAL WI-FI URL:</div>
                  <div style={{ fontSize: '0.95rem', color: '#214C3A', fontWeight: '800' }}>{networkUrl}</div>
                </div>
                <button
                  onClick={() => handleCopy(networkUrl)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    background: copied ? '#2E8B57' : '#214C3A',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '7px 12px',
                    fontSize: '0.78rem',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  <span>Copy</span>
                </button>
              </div>

              {/* GitHub Repository Link */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                background: '#F9F8F5',
                borderRadius: '10px',
                border: '1px solid #E8E5DD'
              }}>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#1A2620' }}>GitHub Source & Documentation</div>
                  <div style={{ fontSize: '0.72rem', color: '#737373' }}>keshav454-6/akshit</div>
                </div>
                <a
                  href={githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.78rem',
                    color: '#214C3A',
                    fontWeight: '700',
                    textDecoration: 'none'
                  }}
                >
                  <span>Open Repo</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
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

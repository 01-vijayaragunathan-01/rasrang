// --- Inside Web/src/components/profile/PrintableBadge.jsx ---
import React from "react";
import { QRCodeCanvas } from "qrcode.react";

export default function PrintableBadge({ data, user }) {
    if (!data) return null;

    const isMaster = data.type === 'master';
    const title = isMaster ? "MASTER EVENT PASS" : data.ticket.event.title.toUpperCase();
    const date = isMaster ? data.ticket.date : data.ticket.event.date;
    const ticketTypeStr = isMaster ? "MASTER EVENT PASS" : "FESTIVAL EVENT PASS";

    // Generate a cool-looking aesthetic serial number
    const serial = `RS-${(user?.id || "00000000").substring(0,8).toUpperCase()}-${date.replace(/[^0-9]/g, '').substring(0,4)}`;

    return (
        <div style={{ position: 'fixed', top: '-10000px', left: '-10000px', pointerEvents: 'none' }}>
            <div 
                id="printable-id-card" 
                style={{ 
                    width: '920px', height: '340px', display: 'flex', 
                    fontFamily: "'Inter', 'Helvetica Neue', Helvetica, sans-serif",
                    borderRadius: '24px', overflow: 'hidden',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', 
                    backgroundColor: '#ffffff',
                    position: 'relative',
                    boxSizing: 'border-box' 
                }}
            >
                {/* ── LEFT SIDE (72%) Premium Dark Theme ── */}
                <div style={{ 
                    width: '72%', height: '100%', 
                    // Radial gradient acts like a spotlight illuminating the RasRang logo
                    background: 'radial-gradient(circle at 90% 50%, #2A1254 0%, #0A0515 80%)',
                    position: 'relative', display: 'flex', zIndex: 1,
                    boxSizing: 'border-box',
                    borderLeft: '10px solid #E4BD8D' // Golden edge accent
                }}>
                    
                    {/* Watermark Logo - Highly Visible & Full Color */}
                    <div style={{ position: 'absolute', top: '50%', right: '15px', transform: 'translateY(-50%)', opacity: 0.35, zIndex: -1 }}>
                        <img 
                            src="/Assets/rasrang.png" 
                            alt="RasRang" 
                            crossOrigin="anonymous" 
                            style={{ width: '300px', height: '300px', objectFit: 'contain' }} 
                            onError={(e) => e.target.style.display='none'} 
                        />
                    </div>

                    {/* Left Vertical Gate Text */}
                    <div style={{ width: '50px', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.3)', borderRight: '1px solid rgba(255,255,255,0.05)', boxSizing: 'border-box' }}>
                        <div style={{ transform: 'rotate(-90deg)', whiteSpace: 'nowrap', fontSize: '11px', fontWeight: '900', letterSpacing: '4px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>
                            ENTRY // GATE H
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div style={{ padding: '30px 40px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxSizing: 'border-box' }}>
                        
                        {/* Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
                            <div style={{ flex: 1, paddingRight: '20px' }}>
                                <p style={{ color: '#E4BD8D', fontSize: '13px', fontWeight: '900', letterSpacing: '4px', margin: '0 0 4px 0', whiteSpace: 'nowrap' }}>RASRANG 2K26 PRESENTS</p>
                                <p style={{ color: '#22D3EE', fontSize: '11px', fontWeight: 'bold', letterSpacing: '3px', margin: 0, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>ANNUAL CULTURAL FESTIVAL</p>
                            </div>
                            <div style={{ flexShrink: 0, background: 'linear-gradient(90deg, #C53099, #9D01E9)', padding: '8px 16px', borderRadius: '8px', boxShadow: '0 4px 15px rgba(197, 48, 153, 0.3)' }}>
                                <span style={{ color: '#ffffff', fontSize: '12px', fontWeight: '900', letterSpacing: '2px', whiteSpace: 'nowrap' }}>{ticketTypeStr}</span>
                            </div>
                        </div>

                        {/* Center Identity */}
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', marginTop: '10px' }}>
                            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: title.length > 20 ? '30px' : '38px', fontWeight: '900', color: '#ffffff', textTransform: 'uppercase', letterSpacing: '2px', margin: '0 0 8px 0', lineHeight: '1.1', textShadow: '0 4px 20px rgba(0,0,0,0.8)', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                {title}
                            </h1>
                            <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#ffffff', margin: '0 0 8px 0', letterSpacing: '1px', textTransform: 'uppercase', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {user?.name || "GUEST ATTENDEE"}
                            </h2>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ backgroundColor: 'rgba(34, 211, 238, 0.1)', border: '1px solid rgba(34, 211, 238, 0.3)', color: '#22D3EE', padding: '4px 10px', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold', letterSpacing: '1px', fontFamily: 'monospace' }}>
                                    {user?.regNo || "NO REG NO"}
                                </span>
                                <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                                    • {user?.clgName || "SRM TRICHY"}
                                </span>
                            </div>
                        </div>

                        {/* Footer Details */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid rgba(228, 189, 141, 0.2)', paddingTop: '15px', width: '100%' }}>
                            <div>
                                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', margin: '0 0 4px 0', fontWeight: 'bold', letterSpacing: '2px' }}>VALID DATE</p>
                                <p style={{ fontSize: '22px', fontWeight: '900', margin: 0, color: '#E4BD8D', letterSpacing: '1.5px' }}>{date}</p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', margin: '0 0 4px 0', fontWeight: 'bold', letterSpacing: '2px' }}>TICKET SERIAL</p>
                                <p style={{ fontSize: '16px', fontFamily: 'monospace', color: '#ffffff', margin: 0, letterSpacing: '2px' }}>{serial}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── RIGHT SIDE (28%) Bright Stub ── */}
                <div style={{ 
                    width: '28%', height: '100%', backgroundColor: '#ffffff', 
                    borderLeft: '4px dashed rgba(0,0,0,0.2)', 
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
                    padding: '25px 20px', position: 'relative', boxSizing: 'border-box', gap: '20px'
                }}>
                    
                    {/* Top: SRM Logo */}
                    <img src="/Assets/SRM_Logo.jpeg" alt="SRM Logo" crossOrigin="anonymous" style={{ height: '48px', objectFit: 'contain' }} onError={(e) => e.target.style.display = 'none'} />

                    {/* Middle: QR Code */}
                    <div style={{ padding: '10px', backgroundColor: '#fff', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
                        <QRCodeCanvas 
                            value={data.ticket.token} 
                            size={145} 
                            level="H"
                            imageSettings={{ src: "/Assets/SRM_Logo.jpeg", height: 35, width: 35, excavate: true }}
                        />
                    </div>

                    {/* Bottom: Scan Instruction */}
                    <div style={{ textAlign: 'center' }}>
                        <span style={{ fontSize: '14px', fontWeight: '900', letterSpacing: '4px', color: '#13072E', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                            SCAN TO ENTER
                        </span>
                        <div style={{ width: '50px', height: '4px', backgroundColor: '#E4BD8D', margin: '8px auto 0', borderRadius: '2px' }} />
                    </div>
                </div>
            </div>
        </div>
    );
}
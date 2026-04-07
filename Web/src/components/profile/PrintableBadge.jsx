// --- Web/src/components/profile/PrintableBadge.jsx ---
import React from "react";
import { QRCodeCanvas } from "qrcode.react";

// ─────────────────────────────────────────────────────────────────────────────
// INDIVIDUAL EVENT TICKET
// Aesthetic: Dark cinema · diagonal slash · duotone neon cyan accent
// ─────────────────────────────────────────────────────────────────────────────
function IndividualBadge({ data, user }) {
    const title  = data.ticket.event.title.toUpperCase();
    const date   = data.ticket.event.date;
    const venue  = data.ticket.event.venue || "MAIN AUDITORIUM";
    const serial = `RS-${(user?.id || "00000000").substring(0, 8).toUpperCase()}-${date.replace(/[^0-9]/g, "").substring(0, 4)}`;

    return (
        <div
            id="printable-id-card"
            style={{
                width: "1000px",
                height: "380px",
                display: "flex",
                position: "relative",
                overflow: "hidden",
                fontFamily: "'Bebas Neue', Impact, sans-serif",
                backgroundColor: "#050A10",
                border: "1px solid rgba(34,211,238,0.3)",
            }}
        >
            {/* Background SVG geometry */}
            <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} viewBox="0 0 1000 380" preserveAspectRatio="none">
                <polygon points="520,0 580,0 420,380 360,380" fill="rgba(34,211,238,0.04)" />
                <polygon points="600,0 640,0 480,380 440,380" fill="rgba(34,211,238,0.025)" />
                <line x1="0" y1="0" x2="1000" y2="0" stroke="#22D3EE" strokeWidth="2.5" opacity="0.7" />
                <line x1="0" y1="379" x2="724" y2="379" stroke="rgba(34,211,238,0.3)" strokeWidth="1" />
                <polyline points="0,32 0,0 32,0" fill="none" stroke="#22D3EE" strokeWidth="2" opacity="0.9" />
                <polyline points="692,0 724,0 724,32" fill="none" stroke="#22D3EE" strokeWidth="2" opacity="0.9" />
                <polyline points="0,348 0,380 32,380" fill="none" stroke="rgba(34,211,238,0.5)" strokeWidth="2" />
                {[0,1,2,3,4,5].map(r => [0,1,2,3,4,5,6,7].map(c => (
                    <circle key={`${r}-${c}`} cx={760 + c * 28} cy={65 + r * 54} r="1.5" fill="rgba(34,211,238,0.2)" />
                )))}
                <line x1="724" y1="0" x2="724" y2="380" stroke="rgba(34,211,238,0.2)" strokeWidth="1" strokeDasharray="8 5" />
            </svg>

            {/* Background RasRang Logo Watermark */}
            <div style={{ position: "absolute", right: "220px", top: "50%", transform: "translateY(-50%)", opacity: 0.05, zIndex: 1 }}>
                <img src="/Assets/rasrang.png" alt="RasRang Watermark" crossOrigin="anonymous" style={{ width: "450px", height: "450px", objectFit: "contain", filter: "grayscale(100%)" }} />
            </div>

            {/* LEFT vertical cyan strip */}
            <div style={{
                width: "48px", height: "100%", background: "#22D3EE",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0, position: "relative", zIndex: 2,
            }}>
                <span style={{
                    transform: "rotate(-90deg)", whiteSpace: "nowrap",
                    color: "#050A10", fontSize: "10px", fontWeight: "900", letterSpacing: "5px",
                    fontFamily: "'Space Mono', monospace",
                }}>
                    EVENT PASS · RASRANG 2K26
                </span>
            </div>

            {/* MAIN CONTENT */}
            <div style={{
                flex: 1, padding: "32px 42px",
                display: "flex", flexDirection: "column", justifyContent: "space-between",
                position: "relative", zIndex: 2,
            }}>
                {/* Header with RasRang Logo */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <img src="/Assets/rasrang.png" alt="RasRang Logo" crossOrigin="anonymous" style={{ height: "38px", objectFit: "contain" }} />
                        <div>
                            <p style={{ margin: 0, color: "#22D3EE", fontSize: "14px", letterSpacing: "5px", fontFamily: "'Space Mono', monospace", fontWeight: 700 }}>
                                RASRANG 2K26
                            </p>
                            <p style={{ margin: "2px 0 0", color: "rgba(34,211,238,0.6)", fontSize: "9px", letterSpacing: "4px", fontFamily: "'Space Mono', monospace" }}>
                                ANNUAL CULTURAL FESTIVAL
                            </p>
                        </div>
                    </div>
                    <div style={{ border: "1px solid rgba(34,211,238,0.4)", padding: "5px 14px", color: "rgba(34,211,238,0.7)", fontSize: "10px", letterSpacing: "3px", fontFamily: "'Space Mono', monospace" }}>
                        FESTIVAL EVENT PASS
                    </div>
                </div>

                {/* Giant title */}
                <h1 style={{
                    margin: "4px 0",
                    color: "#FFFFFF",
                    fontSize: title.length > 24 ? "50px" : "64px",
                    lineHeight: 0.9,
                    letterSpacing: "2px",
                    textTransform: "uppercase",
                }}>
                    {title}
                </h1>

                {/* Name + reg */}
                <div>
                    <p style={{ margin: "0 0 2px", color: "rgba(255,255,255,0.3)", fontSize: "10px", letterSpacing: "5px", fontFamily: "'Space Mono', monospace" }}>BEARER</p>
                    <p style={{ margin: "0 0 5px", color: "#FFFFFF", fontSize: "28px", letterSpacing: "3px" }}>
                        {(user?.name || "GUEST ATTENDEE").toUpperCase()}
                    </p>
                    <p style={{ margin: 0, color: "rgba(255,255,255,0.4)", fontSize: "11px", letterSpacing: "2px", fontFamily: "'Space Mono', monospace" }}>
                        {user?.regNo || "—"} &nbsp;·&nbsp; {user?.clgName || "SRM TRICHY"}
                    </p>
                </div>

                {/* Footer */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", borderTop: "1px solid rgba(34,211,238,0.15)", paddingTop: "14px" }}>
                    <div>
                        <p style={{ margin: "0 0 2px", color: "rgba(255,255,255,0.3)", fontSize: "9px", letterSpacing: "4px", fontFamily: "'Space Mono', monospace" }}>DATE</p>
                        <p style={{ margin: 0, color: "#22D3EE", fontSize: "24px", letterSpacing: "2px" }}>{date}</p>
                    </div>
                    <div style={{ textAlign: "center" }}>
                        <p style={{ margin: "0 0 2px", color: "rgba(255,255,255,0.3)", fontSize: "9px", letterSpacing: "4px", fontFamily: "'Space Mono', monospace" }}>VENUE</p>
                        <p style={{ margin: 0, color: "rgba(255,255,255,0.7)", fontSize: "15px", letterSpacing: "2px" }}>{venue}</p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                        <p style={{ margin: "0 0 2px", color: "rgba(255,255,255,0.3)", fontSize: "9px", letterSpacing: "4px", fontFamily: "'Space Mono', monospace" }}>SERIAL</p>
                        <p style={{ margin: 0, color: "rgba(255,255,255,0.4)", fontSize: "12px", letterSpacing: "3px", fontFamily: "'Space Mono', monospace" }}>{serial}</p>
                    </div>
                </div>
            </div>

            {/* Perforation */}
            <div style={{ width: "4px", height: "100%", background: "repeating-linear-gradient(to bottom, rgba(34,211,238,0.35) 0px, rgba(34,211,238,0.35) 8px, transparent 8px, transparent 16px)", flexShrink: 0, position: "relative", zIndex: 2 }} />

            {/* RIGHT STUB */}
            <div style={{ width: "228px", flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", padding: "28px 18px", position: "relative", zIndex: 2, backgroundColor: "rgba(34,211,238,0.03)" }}>
                {/* SRM Logo at the top of the stub */}
                <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                    <img src="/Assets/SRM_Logo.jpeg" alt="SRM Logo" crossOrigin="anonymous" style={{ height: "32px", borderRadius: "4px", border: "1px solid rgba(34,211,238,0.3)" }} />
                    <div>
                        <p style={{ margin: "0 0 2px", color: "#22D3EE", fontSize: "10px", letterSpacing: "5px", fontFamily: "'Space Mono', monospace", fontWeight: 700 }}>RASRANG</p>
                        <p style={{ margin: 0, color: "rgba(255,255,255,0.25)", fontSize: "8px", letterSpacing: "3px", fontFamily: "'Space Mono', monospace" }}>ENTRY PASS</p>
                    </div>
                </div>
                
                {/* QR Code with embedded SRM Logo */}
                <div style={{ padding: "8px", backgroundColor: "#FFFFFF", borderRadius: "8px" }}>
                    <QRCodeCanvas 
                        value={data.ticket.token} 
                        size={120} 
                        level="H" 
                        imageSettings={{ src: "/Assets/SRM_Logo.jpeg", height: 26, width: 26, excavate: true }}
                    />
                </div>
                <div style={{ textAlign: "center" }}>
                    <p style={{ margin: "0 0 6px", color: "#FFFFFF", fontSize: "12px", letterSpacing: "5px", fontFamily: "'Space Mono', monospace", fontWeight: 700 }}>SCAN TO ENTER</p>
                    <div style={{ width: "40px", height: "2.5px", backgroundColor: "#22D3EE", margin: "0 auto" }} />
                </div>
            </div>
        </div>
    );
}


// ─────────────────────────────────────────────────────────────────────────────
// MASTER ALL-ACCESS TICKET
// Aesthetic: Concert poster · foil gold · Playfair serif · jewel tones
// ─────────────────────────────────────────────────────────────────────────────
function MasterBadge({ data, user }) {
    const date   = data.ticket.date;
    const serial = `MS-${(user?.id || "00000000").substring(0, 8).toUpperCase()}-${date.replace(/[^0-9]/g, "").substring(0, 4)}`;

    return (
        <div
            id="printable-id-card"
            style={{
                width: "1000px",
                height: "380px",
                display: "flex",
                position: "relative",
                overflow: "hidden",
                fontFamily: "'Playfair Display', Georgia, serif",
                backgroundColor: "#0C0408",
                border: "2px solid #C9A84C",
            }}
        >
            {/* Background SVG geometry */}
            <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} viewBox="0 0 1000 380" preserveAspectRatio="none">
                <rect x="10" y="10" width="980" height="360" fill="none" stroke="rgba(201,168,76,0.2)" strokeWidth="1" />
                <rect x="0" y="0" width="58" height="380" fill="rgba(201,168,76,0.07)" />
                <line x1="58" y1="0" x2="58" y2="380" stroke="rgba(201,168,76,0.25)" strokeWidth="1" />
                <polygon points="440,0 510,0 355,380 285,380" fill="rgba(201,168,76,0.04)" />
                <polygon points="510,0 545,0 390,380 355,380" fill="rgba(201,168,76,0.02)" />
                <polyline points="16,46 16,16 46,16" fill="none" stroke="#C9A84C" strokeWidth="1.5" />
                <polyline points="16,334 16,364 46,364" fill="none" stroke="#C9A84C" strokeWidth="1.5" />
                <polyline points="700,16 730,16 730,46" fill="none" stroke="#C9A84C" strokeWidth="1.5" />
                <polyline points="730,334 730,364 700,364" fill="none" stroke="#C9A84C" strokeWidth="1.5" />
                <line x1="58" y1="64" x2="730" y2="64" stroke="rgba(201,168,76,0.18)" strokeWidth="0.5" />
                <line x1="58" y1="316" x2="730" y2="316" stroke="rgba(201,168,76,0.18)" strokeWidth="0.5" />
                <polygon points="394,61 397,64 394,67 391,64" fill="#C9A84C" opacity="0.6" />
                <polygon points="394,313 397,316 394,319 391,316" fill="#C9A84C" opacity="0.6" />
                <line x1="730" y1="0" x2="730" y2="380" stroke="rgba(201,168,76,0.28)" strokeWidth="1" strokeDasharray="10 6" />
                {[0,1,2,3,4,5,6,7].map(i => (
                    <circle key={i} cx={865} cy={190} r={30 + i * 24} fill="none" stroke="rgba(201,168,76,0.05)" strokeWidth="1" />
                ))}
            </svg>

            {/* Background RasRang Logo Watermark */}
            <div style={{ position: "absolute", left: "45%", top: "50%", transform: "translate(-50%, -50%)", opacity: 0.1, zIndex: 1 }}>
                <img src="/Assets/rasrang.png" alt="RasRang Watermark" crossOrigin="anonymous" style={{ width: "480px", height: "480px", objectFit: "contain" }} />
            </div>

            {/* LEFT vertical gold strip */}
            <div style={{ width: "58px", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, position: "relative", zIndex: 2 }}>
                <span style={{ transform: "rotate(-90deg)", whiteSpace: "nowrap", color: "#C9A84C", fontSize: "9px", fontFamily: "'Space Mono', monospace", fontWeight: 700, letterSpacing: "5px", opacity: 0.75 }}>
                    ALL ACCESS · CULTURAL FESTIVAL · RASRANG 2K26
                </span>
            </div>

            {/* MAIN CONTENT */}
            <div style={{ flex: 1, padding: "26px 44px 22px", display: "flex", flexDirection: "column", justifyContent: "space-between", position: "relative", zIndex: 2 }}>
                
                {/* Header with RasRang Logo */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                        <img src="/Assets/rasrang.png" alt="RasRang Logo" crossOrigin="anonymous" style={{ height: "42px", objectFit: "contain" }} />
                        <div>
                            <p style={{ margin: 0, color: "#C9A84C", fontSize: "13px", letterSpacing: "7px", fontFamily: "'Space Mono', monospace", fontWeight: 700 }}>
                                RASRANG 2K26
                            </p>
                            <p style={{ margin: "3px 0 0", color: "rgba(201,168,76,0.6)", fontSize: "9px", letterSpacing: "4px", fontFamily: "'Space Mono', monospace" }}>
                                ANNUAL CULTURAL FESTIVAL
                            </p>
                        </div>
                    </div>
                    <div style={{ border: "1px solid rgba(201,168,76,0.5)", padding: "5px 16px", color: "#C9A84C", fontSize: "10px", letterSpacing: "3px", fontFamily: "'Space Mono', monospace" }}>
                        ★ MASTER EVENT PASS ★
                    </div>
                </div>

                {/* Central identity — hero element */}
                <div style={{ textAlign: "center" }}>
                    <p style={{ margin: "0 0 6px", color: "rgba(201,168,76,0.45)", fontSize: "10px", letterSpacing: "8px", fontFamily: "'Space Mono', monospace" }}>ALL-ACCESS CULTURAL PASS</p>
                    <h1 style={{
                        margin: 0,
                        color: "#C9A84C",
                        fontSize: (user?.name || "").length > 18 ? "46px" : "60px",
                        lineHeight: 0.95,
                        letterSpacing: "3px",
                        fontWeight: 900,
                        fontStyle: "italic",
                        textTransform: "uppercase",
                    }}>
                        {(user?.name || "GUEST ATTENDEE").toUpperCase()}
                    </h1>
                    {/* Ornamental divider */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", margin: "12px 0 8px" }}>
                        <div style={{ height: "1px", flex: 1, background: "rgba(201,168,76,0.25)" }} />
                        <span style={{ color: "#C9A84C", fontSize: "16px", lineHeight: 1 }}>✦</span>
                        <div style={{ height: "1px", flex: 1, background: "rgba(201,168,76,0.25)" }} />
                    </div>
                    <p style={{ margin: 0, color: "rgba(255,255,255,0.45)", fontSize: "12px", letterSpacing: "3px", fontFamily: "'Space Mono', monospace" }}>
                        {user?.regNo || "—"} &nbsp;·&nbsp; {user?.clgName || "SRM TRICHY"}
                    </p>
                </div>

                {/* Footer */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", borderTop: "1px solid rgba(201,168,76,0.15)", paddingTop: "14px" }}>
                    <div>
                        <p style={{ margin: "0 0 2px", color: "rgba(201,168,76,0.4)", fontSize: "9px", letterSpacing: "4px", fontFamily: "'Space Mono', monospace" }}>VALID DATE</p>
                        <p style={{ margin: 0, color: "#C9A84C", fontSize: "24px", letterSpacing: "2px", fontFamily: "'Bebas Neue', Impact, sans-serif" }}>{date}</p>
                    </div>
                    <div style={{ textAlign: "center" }}>
                        <p style={{ margin: "0 0 2px", color: "rgba(201,168,76,0.4)", fontSize: "9px", letterSpacing: "4px", fontFamily: "'Space Mono', monospace" }}>ACCESS</p>
                        <p style={{ margin: 0, color: "rgba(255,255,255,0.65)", fontSize: "14px", letterSpacing: "2px", fontFamily: "'Bebas Neue', Impact, sans-serif" }}>ALL EVENTS · FULL DAY</p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                        <p style={{ margin: "0 0 2px", color: "rgba(201,168,76,0.4)", fontSize: "9px", letterSpacing: "4px", fontFamily: "'Space Mono', monospace" }}>SERIAL</p>
                        <p style={{ margin: 0, color: "rgba(255,255,255,0.35)", fontSize: "12px", letterSpacing: "3px", fontFamily: "'Space Mono', monospace" }}>{serial}</p>
                    </div>
                </div>
            </div>

            {/* Perforation */}
            <div style={{ width: "4px", height: "100%", background: "repeating-linear-gradient(to bottom, rgba(201,168,76,0.4) 0px, rgba(201,168,76,0.4) 8px, transparent 8px, transparent 16px)", flexShrink: 0, position: "relative", zIndex: 2 }} />

            {/* RIGHT STUB */}
            <div style={{ width: "208px", flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", padding: "26px 16px", position: "relative", zIndex: 2, backgroundColor: "rgba(201,168,76,0.03)" }}>
                {/* SRM Logo at the top of the stub */}
                <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                    <img src="/Assets/SRM_Logo.jpeg" alt="SRM Logo" crossOrigin="anonymous" style={{ height: "36px", borderRadius: "4px", border: "1px solid rgba(201,168,76,0.3)" }} />
                    <p style={{ margin: 0, color: "#C9A84C", fontSize: "20px", fontWeight: 900, fontStyle: "italic", letterSpacing: "2px", lineHeight: 1 }}>PREMIUM</p>
                </div>

                {/* QR Code with embedded SRM Logo */}
                <div style={{ padding: "8px", backgroundColor: "#FFFFFF", border: "2px solid #C9A84C" }}>
                    <QRCodeCanvas 
                        value={data.ticket.token} 
                        size={118} 
                        level="H" 
                        imageSettings={{ src: "/Assets/SRM_Logo.jpeg", height: 26, width: 26, excavate: true }}
                    />
                </div>
                <div style={{ textAlign: "center" }}>
                    <p style={{ margin: "0 0 6px", color: "#C9A84C", fontSize: "11px", letterSpacing: "4px", fontFamily: "'Space Mono', monospace", fontWeight: 700 }}>SCAN TO ENTER</p>
                    <div style={{ display: "flex", justifyContent: "center", gap: "5px" }}>
                        {[0,1,2].map(i => <div key={i} style={{ width: "18px", height: "2px", backgroundColor: i === 1 ? "#C9A84C" : "rgba(201,168,76,0.3)" }} />)}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN EXPORT
// ─────────────────────────────────────────────────────────────────────────────
export default function PrintableBadge({ data, user }) {
    if (!data) return null;

    return (
        <div style={{ position: "fixed", top: "-10000px", left: "-10000px", pointerEvents: "none" }}>
            {data.type === "master"
                ? <MasterBadge data={data} user={user} />
                : <IndividualBadge data={data} user={user} />
            }
        </div>
    );
}
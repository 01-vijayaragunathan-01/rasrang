import { useEffect, useRef } from "react";

// Each firework has a themed color family — realistic gradient bursts
const COLOR_FAMILIES = [
    // Fire: deep red → orange → yellow
    ["#8B0000","#CC2200","#FF4500","#FF6B00","#FF9500","#FFD700","#FFF176"],
    // Ocean: navy → deep blue → cyan → white
    ["#0A1628","#1A3A6B","#1565C0","#1E88E5","#00B0FF","#00E5FF","#E0F7FA"],
    // Forest: dark green → emerald → lime
    ["#1B3A1B","#2E7D32","#388E3C","#43A047","#66BB6A","#A5D6A7","#CCFF90"],
    // Twilight: dark purple → violet → pink → lavender
    ["#1A0033","#4A0080","#7B1FA2","#AB47BC","#E040FB","#FF80AB","#F8BBD9"],
    // Ember: deep crimson → magenta → hot pink
    ["#4A0010","#880E4F","#C2185B","#E91E63","#F06292","#FF80AB","#FFCDD2"],
    // Solar: burnt orange → gold → pale yellow
    ["#4E1A00","#8D3A00","#E65100","#F57C00","#FFA726","#FFD54F","#FFF9C4"],
    // Aurora: teal → green → white-green
    ["#003333","#006064","#00838F","#00ACC1","#26C6DA","#80DEEA","#E0F7FA"],
    // Dusk: dark indigo → blue-violet → periwinkle
    ["#0D0D2B","#1A237E","#283593","#3949AB","#5C6BC0","#9FA8DA","#C5CAE9"],
];

function rand(a, b) { return Math.random() * (b - a) + a; }

// Pick a full color family for one firework
function pickFamily() {
    return COLOR_FAMILIES[Math.floor(Math.random() * COLOR_FAMILIES.length)];
}

// Given a family array, pick a color biased toward the bright end on burst
function familyColor(family, bias = 0) {
    // bias 0 = random, bias 1 = bright end, bias -1 = dark end
    const t = Math.random() * 0.5 + 0.5 + bias * 0.3;
    const idx = Math.min(family.length - 1, Math.floor(t * family.length));
    return family[Math.max(0, idx)];
}

class Particle {
    constructor(x, y, color, brightColor) {
        this.x = x; this.y = y;
        this.color = color;
        this.brightColor = brightColor; // lighter shade for glow center
        const angle = Math.random() * Math.PI * 2;
        const speed = rand(2, 6.5);
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.life = 1;
        this.decay = rand(0.013, 0.022);
        this.gravity = 0.055;
        this.radius = rand(1.8, 3.5); // slightly bigger particles
    }
    update() {
        this.vx *= 0.97; this.vy *= 0.97;
        this.vy += this.gravity;
        this.x += this.vx; this.y += this.vy;
        this.life -= this.decay;
    }
    draw(ctx) {
        if (this.life <= 0) return;
        ctx.save();
        ctx.globalAlpha = this.life;

        // Outer glow in base color
        ctx.shadowBlur = 14;
        ctx.shadowColor = this.color;

        // Radial gradient per particle: bright center → base color edge
        const grd = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.radius
        );
        grd.addColorStop(0, this.brightColor);
        grd.addColorStop(1, this.color);

        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
    isDead() { return this.life <= 0; }
}

class Firework {
    constructor(W, H) {
        this.W = W; this.H = H;
        this.x = rand(W * 0.12, W * 0.88);
        this.y = H;
        this.family = pickFamily();
        this.targetY = rand(H * 0.08, H * 0.42);

        const dy = this.targetY - this.y;
        const dx = rand(-50, 50);
        const d  = Math.sqrt(dx * dx + dy * dy);
        const sp = rand(11, 17); // faster shell = higher burst
        this.vx = dx / d * sp;
        this.vy = dy / d * sp;

        this.trail  = [];
        this.parts  = [];
        this.popped = false;
        this.dead   = false;
        this.ring   = Math.random() > 0.45;
        this.count  = Math.floor(rand(70, 100)); // more particles
    }

    _burst() {
        const family = this.family;
        const n = this.ring ? 64 : this.count;

        for (let i = 0; i < n; i++) {
            const angle = this.ring
                ? (i / n) * Math.PI * 2
                : Math.random() * Math.PI * 2;

            // Pick color: earlier particles (lower i) get darker shades,
            // giving the burst a gradient feel across the spread
            const t = i / n;
            const colorIdx = Math.floor(t * (family.length - 1));
            const brightIdx = Math.min(family.length - 1, colorIdx + 2);
            const p = new Particle(
                this.x, this.y,
                family[colorIdx],
                family[brightIdx]
            );

            const speed = this.ring ? rand(4, 6) : rand(2, 7);
            p.vx = Math.cos(angle) * speed;
            p.vy = Math.sin(angle) * speed;
            // ring particles slightly bigger
            if (this.ring) p.radius = rand(2, 3.8);
            this.parts.push(p);
        }

        // Bright core flash — top of family (brightest color)
        for (let i = 0; i < 14; i++) {
            const p = new Particle(
                this.x, this.y,
                family[family.length - 1],
                "#ffffff"
            );
            p.radius = rand(1, 2.2);
            p.decay  = rand(0.03, 0.06); // flash quickly
            this.parts.push(p);
        }
    }

    update() {
        if (!this.popped) {
            this.trail.push({ x: this.x, y: this.y });
            if (this.trail.length > 10) this.trail.shift();
            this.vy += 0.22;
            this.x += this.vx;
            this.y += this.vy;
            if (this.vy >= 0 || this.y <= this.targetY) {
                this.popped = true;
                this._burst();
            }
        } else {
            this.parts.forEach(p => p.update());
            this.parts = this.parts.filter(p => !p.isDead());
            if (this.parts.length === 0) this.dead = true;
        }
    }

    draw(ctx) {
        if (!this.popped) {
            // Shell trail — gradient from family dark to white tip
            this.trail.forEach((t, i) => {
                const a = (i / this.trail.length) * 0.6;
                ctx.save();
                ctx.globalAlpha = a;
                ctx.shadowBlur  = 8;
                ctx.shadowColor = this.family[Math.floor(this.family.length / 2)];
                ctx.fillStyle   = "#ffffff";
                ctx.beginPath();
                ctx.arc(t.x, t.y, 1.8, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            });
        } else {
            this.parts.forEach(p => p.draw(ctx));
        }
    }
}

export default function FestivalBackground() {
    const canvasRef = useRef(null);
    const state = useRef({ fws: [], lastY: 0, vel: 0, cooldown: 0, raf: null });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d", { alpha: true });
        const s = state.current;

        const resize = () => {
            canvas.width  = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener("resize", resize);

        const onScroll = () => {
            const y = window.scrollY || document.documentElement.scrollTop || 0;
            s.vel = Math.max(s.vel, Math.abs(y - s.lastY));
            s.lastY = y;
        };
        const onScrollCapture = e => {
            const y = e.target?.scrollTop || 0;
            const d = Math.abs(y - s.lastY);
            if (d > 0) { s.vel = Math.max(s.vel, d); s.lastY = y; }
        };
        window.addEventListener("scroll", onScroll, { passive: true });
        document.addEventListener("scroll", onScrollCapture, { passive: true, capture: true });

        const loop = () => {
            s.raf = requestAnimationFrame(loop);

            // Fully transparent every frame — no fillRect, no background
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            s.vel *= 0.75;
            s.cooldown--;

            // Launch exactly 2 per scroll burst, spaced 12 frames apart
            if (s.vel > 8 && s.cooldown <= 0 && s.fws.length < 4) {
                s.fws.push(new Firework(canvas.width, canvas.height));
                // Second one launches 12 frames later via a delayed push
                const W = canvas.width, H = canvas.height;
                setTimeout(() => {
                    s.fws.push(new Firework(W, H));
                }, 200); // 200ms ≈ 12 frames
                s.cooldown = 55; // ~0.9s before next pair
            }

            s.fws.forEach(fw => { fw.update(); fw.draw(ctx); });
            s.fws = s.fws.filter(fw => !fw.dead);
        };

        s.raf = requestAnimationFrame(loop);

        return () => {
            cancelAnimationFrame(s.raf);
            window.removeEventListener("resize", resize);
            window.removeEventListener("scroll", onScroll);
            document.removeEventListener("scroll", onScrollCapture, { capture: true });
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: "fixed",
                inset: 0,
                width: "100%",
                height: "100%",
                pointerEvents: "none",
                zIndex: 99999,
                background: "transparent",
            }}
        />
    );
}
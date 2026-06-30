import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { Github, Mail, Linkedin, ChevronDown, Menu, X, Code2 } from "lucide-react";

const BG1 = "#02060f";
const BG2 = "#030b18";
const BG3 = "#041428";

// ── Global CSS ────────────────────────────────────────────────
const GLOBAL_CSS = `
  body { font-family: 'DM Sans', sans-serif; background: #02060f; }

  @keyframes cursorBlink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
  }
  @keyframes floatBob {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-7px); }
  }
  @keyframes glowPulse {
    0%, 100% { box-shadow: 0 0 20px rgba(0,212,255,0.15); }
    50% { box-shadow: 0 0 40px rgba(0,212,255,0.32); }
  }
  @keyframes shimmerBorder {
    0% { background-position: 0% 50%; }
    100% { background-position: 200% 50%; }
  }

  .reveal {
    opacity: 0;
    transform: translateY(28px);
    transition: opacity 0.65s ease, transform 0.65s ease;
  }
  .reveal.visible {
    opacity: 1;
    transform: translateY(0);
  }
  .reveal-d1 { transition-delay: 0.08s; }
  .reveal-d2 { transition-delay: 0.16s; }
  .reveal-d3 { transition-delay: 0.24s; }
  .reveal-d4 { transition-delay: 0.32s; }
  .reveal-d5 { transition-delay: 0.40s; }
  .reveal-d6 { transition-delay: 0.48s; }

  .glow-card {
    position: relative;
    background: rgba(4,14,32,0.88);
    border: 1px solid rgba(0,212,255,0.1);
    border-radius: 14px;
    backdrop-filter: blur(12px);
    transition: transform 0.32s cubic-bezier(0.34,1.56,0.64,1),
                box-shadow 0.32s ease,
                border-color 0.3s ease;
  }
  .glow-card:hover {
    transform: translateY(-8px) scale(1.025);
    box-shadow: 0 24px 64px rgba(0,0,0,0.45),
                0 0 28px rgba(0,212,255,0.1);
    border-color: rgba(0,212,255,0.35);
  }
  .glow-card::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 14px;
    padding: 1px;
    background: linear-gradient(135deg, rgba(0,212,255,0.0), rgba(0,255,200,0.0));
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    opacity: 0;
    transition: opacity 0.3s;
  }
  .glow-card:hover::before {
    background: linear-gradient(135deg, rgba(0,212,255,0.5), rgba(0,255,200,0.3));
    opacity: 1;
  }

  .tech-tag {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.65rem;
    padding: 3px 10px;
    border-radius: 999px;
    background: rgba(0,212,255,0.08);
    border: 1px solid rgba(0,212,255,0.2);
    color: #00d4ff;
    letter-spacing: 0.02em;
  }

  .water-btn-primary {
    background: linear-gradient(135deg, #0083b0, #00d4ff);
    color: #fff;
    box-shadow: 0 4px 20px rgba(0,212,255,0.28);
    transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.25s ease;
  }
  .water-btn-primary:hover {
    transform: translateY(-4px) scale(1.05);
    box-shadow: 0 14px 40px rgba(0,212,255,0.42);
  }
  .water-btn-ghost {
    background: transparent;
    color: #00d4ff;
    border: 1.5px solid rgba(0,212,255,0.38);
    transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1), border-color 0.2s, background 0.2s;
  }
  .water-btn-ghost:hover {
    transform: translateY(-4px);
    border-color: #00d4ff;
    background: rgba(0,212,255,0.07);
  }

  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: #02060f; }
  ::-webkit-scrollbar-thumb { background: rgba(0,212,255,0.38); border-radius: 2px; }
`;

// ── Types ─────────────────────────────────────────────────────
interface Ripple {
  x: number; y: number; r: number; maxR: number; a: number; spd: number;
}
interface Ptcl {
  x: number; y: number; vx: number; vy: number; sz: number; op: number; ph: number;
}

// ── Water Canvas ──────────────────────────────────────────────
function WaterCanvas() {
  const cvs = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = cvs.current!;
    const ctx = canvas.getContext("2d")!;
    const ripples: Ripple[] = [];
    let particles: Ptcl[] = [];
    let raf = 0;
    let last = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();

    const initPtcl = () => {
      particles = Array.from({ length: 60 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.22,
        vy: -(Math.random() * 0.32 + 0.04),
        sz: Math.random() * 2.4 + 0.4,
        op: Math.random() * 0.42 + 0.1,
        ph: Math.random() * Math.PI * 2,
      }));
    };
    initPtcl();

    const onMove = (e: MouseEvent) => {
      const now = Date.now();
      if (now - last < 42 || ripples.length > 24) return;
      last = now;
      ripples.push({
        x: e.clientX, y: e.clientY,
        r: 0, maxR: 52 + Math.random() * 48,
        a: 0.42, spd: 2.0 + Math.random() * 1.2,
      });
    };

    const onClick = (e: MouseEvent) => {
      [0, 1, 2].forEach((i) =>
        ripples.push({
          x: e.clientX, y: e.clientY,
          r: i * 12, maxR: 88 + i * 36,
          a: 0.65 - i * 0.14, spd: 3.2,
        })
      );
    };

    const onTouch = (e: TouchEvent) => {
      const t = e.touches[0];
      [0, 1].forEach((i) =>
        ripples.push({
          x: t.clientX, y: t.clientY,
          r: i * 10, maxR: 80 + i * 30,
          a: 0.55 - i * 0.12, spd: 2.8,
        })
      );
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("click", onClick);
    window.addEventListener("touchstart", onTouch);
    window.addEventListener("resize", resize);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const p of particles) {
        p.x += p.vx + Math.sin(p.ph * 0.7) * 0.11;
        p.y += p.vy;
        p.ph += 0.011;
        if (p.y < -8) { p.y = canvas.height + 8; p.x = Math.random() * canvas.width; }
        if (p.x < -8) p.x = canvas.width + 8;
        if (p.x > canvas.width + 8) p.x = -8;
        const pulse = Math.sin(p.ph) * 0.22 + 0.78;
        const cyan = Math.sin(p.ph * 1.9) > 0.15;
        const col = cyan ? "0,212,255" : "0,255,200";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.sz * pulse, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${col},${p.op * pulse})`;
        ctx.fill();
        if (p.sz > 1.3) {
          const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.sz * 5.5);
          g.addColorStop(0, `rgba(${col},${p.op * 0.22 * pulse})`);
          g.addColorStop(1, "rgba(0,0,0,0)");
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.sz * 5.5, 0, Math.PI * 2);
          ctx.fillStyle = g;
          ctx.fill();
        }
      }

      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.r += r.spd;
        r.a *= 0.922;
        if (r.a < 0.008) { ripples.splice(i, 1); continue; }
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0,212,255,${r.a})`;
        ctx.lineWidth = 1.6;
        ctx.stroke();
        if (r.r > 14) {
          ctx.beginPath();
          ctx.arc(r.x, r.y, r.r * 0.52, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(0,255,200,${r.a * 0.38})`;
          ctx.lineWidth = 0.75;
          ctx.stroke();
        }
        if (r.r > 32) {
          ctx.beginPath();
          ctx.arc(r.x, r.y, r.r * 1.28, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(0,180,255,${r.a * 0.15})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }

      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("click", onClick);
      window.removeEventListener("touchstart", onTouch);
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <canvas
      ref={cvs}
      className="fixed inset-0 pointer-events-none z-40"
      style={{ mixBlendMode: "screen" }}
    />
  );
}

// ── Scroll reveal hook ────────────────────────────────────────
function useReveal(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

// ── Wave divider ──────────────────────────────────────────────
function WaveDivider({ from, to }: { from: string; to: string }) {
  return (
    <div style={{ background: from, lineHeight: 0, fontSize: 0 }}>
      <svg
        viewBox="0 0 1440 60"
        className="w-full block"
        style={{ height: 60 }}
        preserveAspectRatio="none"
      >
        <path
          d="M0,0 C120,40 240,60 360,40 C480,20 600,60 720,40 C840,20 960,60 1080,40 C1200,20 1320,50 1440,30 L1440,60 L0,60 Z"
          fill={to}
        />
      </svg>
    </div>
  );
}

// ── Section label + title ─────────────────────────────────────
function SectionHead({
  num, label, title, highlight, visible,
}: { num: string; label: string; title: string; highlight: string; visible: boolean }) {
  return (
    <div className={`reveal ${visible ? "visible" : ""}`}>
      <div
        className="text-xs tracking-widest mb-2 uppercase"
        style={{ color: "#00d4ff", fontFamily: "'JetBrains Mono', monospace" }}
      >
        {num} — {label}
      </div>
      <h2
        className="mb-1 font-bold"
        style={{
          fontSize: "clamp(1.6rem,4vw,2.2rem)",
          letterSpacing: "-0.025em",
          color: "#e8f4fd",
          fontFamily: "'Oxanium', sans-serif",
        }}
      >
        {title} <span style={{ color: "#00d4ff" }}>{highlight}</span>
      </h2>
      <div
        className="mb-10"
        style={{ width: 48, height: 3, background: "linear-gradient(90deg,#0083b0,#00d4ff)", borderRadius: 2 }}
      />
    </div>
  );
}

// ── Nav ───────────────────────────────────────────────────────
function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const links = ["About", "Projects", "Stack", "Achievements", "Contact"];
  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? "rgba(2,6,15,0.94)" : "rgba(2,6,15,0.55)",
        backdropFilter: "blur(18px)",
        borderBottom: scrolled ? "1px solid rgba(0,212,255,0.13)" : "1px solid transparent",
      }}
    >
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        <a
          href="#hero"
          className="text-sm font-semibold tracking-wide"
          style={{ color: "#00d4ff", fontFamily: "'JetBrains Mono', monospace" }}
        >
          &lt;SY /&gt;
        </a>
        <ul className="hidden md:flex gap-8 list-none m-0 p-0">
          {links.map((l) => (
            <li key={l}>
              <a
                href={`#${l.toLowerCase()}`}
                className="text-sm font-medium tracking-wide transition-colors duration-200"
                style={{ color: "#4a7a94", textDecoration: "none", fontFamily: "'DM Sans', sans-serif" }}
                onMouseEnter={(e) => ((e.target as HTMLElement).style.color = "#00d4ff")}
                onMouseLeave={(e) => ((e.target as HTMLElement).style.color = "#4a7a94")}
              >
                {l}
              </a>
            </li>
          ))}
        </ul>
        <button
          className="md:hidden p-2 transition-colors"
          onClick={() => setOpen((o) => !o)}
          style={{ color: "#4a7a94", background: "transparent", border: "none", cursor: "pointer" }}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      {open && (
        <div
          className="md:hidden px-6 pb-5 flex flex-col gap-4"
          style={{ borderTop: "1px solid rgba(0,212,255,0.1)" }}
        >
          {links.map((l) => (
            <a
              key={l}
              href={`#${l.toLowerCase()}`}
              className="text-sm font-medium py-1"
              style={{ color: "#4a7a94", textDecoration: "none", fontFamily: "'DM Sans', sans-serif" }}
              onClick={() => setOpen(false)}
            >
              {l}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
}

// ── Typing animation ──────────────────────────────────────────
const LINES = [
  "Full Stack MERN Developer",
  "CSE AI & ML @ NIET 2027",
  "TCS Selected 🏆",
  "Daily LeetCode Problem Solver",
  "Building Real World Projects",
  "Open Source Contributor",
];

function useTyping() {
  const [text, setText] = useState("");
  const li = useRef(0);
  const ci = useRef(0);
  const del = useRef(false);
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const tick = () => {
      const cur = LINES[li.current];
      if (!del.current) {
        ci.current++;
        setText(cur.slice(0, ci.current));
        if (ci.current >= cur.length) { del.current = true; t = setTimeout(tick, 1900); return; }
      } else {
        ci.current--;
        setText(cur.slice(0, ci.current));
        if (ci.current <= 0) { del.current = false; li.current = (li.current + 1) % LINES.length; }
      }
      t = setTimeout(tick, del.current ? 36 : 72);
    };
    t = setTimeout(tick, 72);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return text;
}

// ── Hero ──────────────────────────────────────────────────────
const SOCIALS = [
  { href: "https://www.linkedin.com/in/sbm-ydv-2917-bonjour/", label: "LinkedIn", bg: "#0A66C2", shadow: "10,102,194", icon: <Linkedin size={15} /> },
  { href: "mailto:shubhamy2917@gmail.com", label: "Gmail", bg: "#EA4335", shadow: "234,67,53", icon: <Mail size={15} /> },
  { href: "https://leetcode.com/u/shu940229/", label: "LeetCode", bg: "#FFA116", shadow: "255,161,22", dark: true, icon: <Code2 size={15} /> },
  { href: "https://github.com/Shubham2917", label: "GitHub", bg: "#24292e", shadow: "0,0,0", icon: <Github size={15} /> },
];

function Hero() {
  const typed = useTyping();
  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center text-center px-6 pt-20 pb-16 overflow-hidden"
      style={{ background: BG1 }}
    >
      {/* Ambient deep-ocean glow layers */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 85% 55% at 50% -8%, rgba(0,131,176,0.26) 0%, transparent 62%),
            radial-gradient(ellipse 55% 35% at 12% 78%, rgba(0,212,255,0.07) 0%, transparent 55%),
            radial-gradient(ellipse 45% 28% at 88% 82%, rgba(0,255,200,0.055) 0%, transparent 55%)
          `,
        }}
      />
      {/* Grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,212,255,0.038) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,212,255,0.038) 1px, transparent 1px)
          `,
          backgroundSize: "64px 64px",
        }}
      />

      <div className="relative z-10 max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <div
            className="inline-block text-xs tracking-widest px-4 py-2 rounded-full mb-6"
            style={{
              color: "#00d4ff",
              background: "rgba(0,212,255,0.08)",
              border: "1px solid rgba(0,212,255,0.22)",
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            🎓 NIET Greater Noida &nbsp;·&nbsp; CSE AI &amp; ML &nbsp;·&nbsp; Batch 2027
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, delay: 0.14, ease: [0.22, 1, 0.36, 1] }}
          className="font-bold leading-none mb-4"
          style={{
            fontSize: "clamp(3rem, 8.5vw, 5.8rem)",
            letterSpacing: "-0.03em",
            color: "#e8f4fd",
            fontFamily: "'Oxanium', sans-serif",
          }}
        >
          Shubham{" "}
          <span
            style={{
              background: "linear-gradient(135deg, #00d4ff 0%, #00ffc8 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Yadav
          </span>
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.34 }}
          className="flex items-center justify-center gap-1 mb-6"
          style={{ minHeight: "1.8em" }}
        >
          <span
            style={{
              fontSize: "clamp(0.88rem, 2.4vw, 1.12rem)",
              color: "#00d4ff",
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            {typed}
          </span>
          <span
            style={{
              display: "inline-block",
              width: 2,
              height: "1.1em",
              background: "#00d4ff",
              verticalAlign: "text-bottom",
              borderRadius: 1,
              animation: "cursorBlink 0.9s step-end infinite",
            }}
          />
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.44 }}
          className="text-base leading-relaxed mb-8 mx-auto max-w-md"
          style={{ color: "#4a7a94" }}
        >
          Building scalable web applications and solving real-world problems through
          technology.{" "}
          <span style={{ color: "#00d4ff" }}>TCS Selected 🏆</span>
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.54 }}
          className="flex gap-4 justify-center flex-wrap mb-8"
        >
          <a
            href="#projects"
            className="water-btn-primary inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium"
            style={{ textDecoration: "none" }}
          >
            <Code2 size={16} /> View Projects
          </a>
          <a
            href="#contact"
            className="water-btn-ghost inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium"
            style={{ textDecoration: "none" }}
          >
            <Mail size={16} /> Contact Me
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.64 }}
          className="flex gap-3 justify-center flex-wrap"
        >
          {SOCIALS.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
              style={{
                background: s.bg,
                color: s.dark ? "#1a1a1a" : "#fff",
                boxShadow: `0 4px 16px rgba(${s.shadow},0.28)`,
                textDecoration: "none",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.transform = "translateY(-4px) scale(1.07)";
                el.style.boxShadow = `0 12px 32px rgba(${s.shadow},0.46)`;
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.transform = "";
                el.style.boxShadow = `0 4px 16px rgba(${s.shadow},0.28)`;
              }}
            >
              {s.icon} {s.label}
            </a>
          ))}
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.72 }}
        className="hidden xl:flex absolute right-8 top-24 z-20"
      >
        <div
          className="glow-card rounded-[24px] p-5"
          style={{
            width: 280,
            background: "rgba(3,11,24,0.9)",
            border: "1px solid rgba(0,212,255,0.16)",
            boxShadow: "0 28px 60px rgba(0,0,0,0.22)",
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div
              className="flex items-center justify-center rounded-3xl"
              style={{ width: 46, height: 46, background: "#24292e" }}
            >
              <Github size={20} color="#ffffff" />
            </div>
            <div>
              <div className="text-sm font-semibold" style={{ color: "#e8f4fd" }}>
                GitHub HUD
              </div>
              <div className="text-[0.72rem] uppercase tracking-[0.18em]"
                style={{ color: "#7dd3fc", fontFamily: "'JetBrains Mono', monospace" }}
              >
                @Shubham2917
              </div>
            </div>
          </div>

          <p className="text-xs leading-relaxed mb-4" style={{ color: "#8ab9d1" }}>
            Explore my GitHub profile for open-source repos, MERN projects, and code contributions. Tap the button to visit my profile.
          </p>
          <a
            href="https://github.com/Shubham2917"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-2xl px-4 py-3 text-sm font-medium"
            style={{
              width: "100%",
              background: "linear-gradient(135deg,#00d4ff,#00ffc8)",
              color: "#03131e",
              textDecoration: "none",
            }}
          >
            View GitHub Profile
          </a>
        </div>
      </motion.div>

      {/* Scroll hint */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1"
        style={{ color: "#2e5566" }}
      >
        <span
          className="text-xs tracking-widest"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          scroll
        </span>
        <ChevronDown size={18} style={{ animation: "floatBob 2.2s ease-in-out infinite" }} />
      </div>
    </section>
  );
}

// ── About ─────────────────────────────────────────────────────
const ABOUT_CARDS = [
  {
    icon: "🎓",
    title: "Education",
    text: "B.Tech in Computer Science Engineering (AI & ML) at NIET, Greater Noida — Batch 2027",
    badges: ["TCS Selected 🏆", "NIET 2027"],
  },
  {
    icon: "💡",
    title: "Focus Areas",
    items: ["Full Stack MERN Development", "Data Structures & Algorithms in C++", "Backend Development & REST APIs", "Open Source Contributions"],
  },
  {
    icon: "📚",
    title: "Currently Learning",
    items: ["Advanced MERN Stack", "System Design Fundamentals", "Advanced DSA for Product Companies", "Backend Architecture"],
  },
  {
    icon: "⚡",
    title: "Fun Fact",
    text: '"Always learning and adapting to new technologies."',
    badges: ["295 LeetCode Problems", "Daily Coder"],
  },
];

function About() {
  const { ref, visible } = useReveal();
  return (
    <section id="about" className="py-24 px-6" style={{ background: BG2 }}>
      <div className="max-w-5xl mx-auto" ref={ref}>
        <SectionHead num="01" label="about" title="Who I" highlight="Am" visible={visible} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {ABOUT_CARDS.map((card, i) => (
            <div
              key={card.title}
              className={`glow-card p-6 reveal reveal-d${i + 1} ${visible ? "visible" : ""}`}
            >
              <h3
                className="text-sm font-semibold flex items-center gap-2 mb-3"
                style={{ color: "#00d4ff", fontFamily: "'DM Sans', sans-serif" }}
              >
                <span>{card.icon}</span> {card.title}
              </h3>
              {card.text && (
                <p className="text-sm leading-relaxed" style={{ color: "#4a7a94" }}>
                  {card.text}
                </p>
              )}
              {card.items && (
                <ul className="text-sm leading-loose pl-5 list-disc" style={{ color: "#4a7a94" }}>
                  {card.items.map((it) => <li key={it}>{it}</li>)}
                </ul>
              )}
              {card.badges && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {card.badges.map((b) => <span key={b} className="tech-tag">{b}</span>)}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Projects ──────────────────────────────────────────────────
const PROJECTS = [
  {
    emoji: "🌾",
    title: "SmartBhoomi",
    desc: "Blockchain-based Agriculture Supply Chain Platform connecting farmers directly to consumers with full traceability.",
    tags: ["Blockchain", "React", "Node.js", "MongoDB"],
  },
  {
    emoji: "🎌",
    title: "Anime Tracker Extension",
    desc: "Browser Extension for tracking anime airing schedules, episode releases and watchlist management in real-time.",
    tags: ["JavaScript", "Chrome API", "HTML", "CSS"],
  },
  {
    emoji: "🎓",
    title: "NIET Grade Guru",
    desc: "GPA and Academic Performance Calculator tailored for NIET students with subject-wise grade predictions.",
    tags: ["React", "JavaScript", "Vite"],
  },
  {
    emoji: "🍔",
    title: "SmartSwiggy",
    desc: "Smart Slot-Based Food Delivery Platform that lets users book delivery slots in advance to avoid rush-hour delays.",
    tags: ["MERN", "Express", "MongoDB", "JWT"],
  },
];

function Projects() {
  const { ref, visible } = useReveal();
  return (
    <section id="projects" className="py-24 px-6" style={{ background: BG1 }}>
      <div className="max-w-5xl mx-auto" ref={ref}>
        <SectionHead num="02" label="projects" title="Featured" highlight="Projects" visible={visible} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {PROJECTS.map((p, i) => (
            <div
              key={p.title}
              className={`glow-card p-6 cursor-default reveal reveal-d${i + 1} ${visible ? "visible" : ""}`}
            >
              <span className="text-3xl block mb-4">{p.emoji}</span>
              <h3
                className="text-base font-semibold mb-2"
                style={{ color: "#e8f4fd", fontFamily: "'Oxanium', sans-serif" }}
              >
                {p.title}
              </h3>
              <p className="text-sm leading-relaxed mb-4" style={{ color: "#4a7a94" }}>
                {p.desc}
              </p>
              <div className="flex flex-wrap gap-2">
                {p.tags.map((t) => <span key={t} className="tech-tag">{t}</span>)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Tech Stack ────────────────────────────────────────────────
const TECH = [
  { icon: "⚡", name: "C++" },
  { icon: "🐍", name: "Python" },
  { icon: "🟨", name: "JavaScript" },
  { icon: "⚛️", name: "React" },
  { icon: "🟢", name: "Node.js" },
  { icon: "🚂", name: "Express" },
  { icon: "🍃", name: "MongoDB" },
  { icon: "🐬", name: "MySQL" },
  { icon: "🎨", name: "HTML/CSS" },
  { icon: "💨", name: "Tailwind" },
  { icon: "🔷", name: "Bootstrap" },
  { icon: "⚡", name: "Vite" },
  { icon: "🐙", name: "Git/GitHub" },
  { icon: "🖥️", name: "VS Code" },
];

function TechStack() {
  const { ref, visible } = useReveal();
  return (
    <section id="stack" className="py-24 px-6" style={{ background: BG2 }}>
      <div className="max-w-5xl mx-auto" ref={ref}>
        <SectionHead num="03" label="tech stack" title="Skills &" highlight="Tools" visible={visible} />
        <div
          className={`grid gap-3 reveal reveal-d1 ${visible ? "visible" : ""}`}
          style={{ gridTemplateColumns: "repeat(auto-fill, minmax(108px, 1fr))" }}
        >
          {TECH.map((t, i) => (
            <div
              key={`${t.name}-${i}`}
              className="text-center p-4 rounded-xl cursor-default transition-all duration-300"
              style={{
                background: "rgba(4,14,32,0.88)",
                border: "1px solid rgba(0,212,255,0.1)",
                backdropFilter: "blur(8px)",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.transform = "translateY(-7px) scale(1.1)";
                el.style.borderColor = "rgba(0,212,255,0.42)";
                el.style.boxShadow = "0 14px 30px rgba(0,0,0,0.35), 0 0 18px rgba(0,212,255,0.1)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.transform = "";
                el.style.borderColor = "rgba(0,212,255,0.1)";
                el.style.boxShadow = "";
              }}
            >
              <div className="text-2xl mb-2">{t.icon}</div>
              <div
                className="text-xs font-medium"
                style={{ color: "#4a7a94", fontFamily: "'DM Sans', sans-serif" }}
              >
                {t.name}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Achievements ──────────────────────────────────────────────
const ACHIEVEMENTS = [
  { icon: "🏆", title: "TCS Selected", sub: "Selected in TCS recruitment drive" },
  { icon: "💼", title: "Prodigy InfoTech", sub: "Full Stack Development Internship" },
  { icon: "🧠", title: "295 LeetCode", sub: "139 Easy · 126 Medium · 30 Hard" },
  { icon: "🌐", title: "Open Source", sub: "Active contributor on GitHub" },
  { icon: "🎯", title: "Daily Coder", sub: "Consistent daily problem solver" },
];

function Achievements() {
  const { ref, visible } = useReveal();
  return (
    <section id="achievements" className="py-24 px-6" style={{ background: BG1 }}>
      <div className="max-w-5xl mx-auto" ref={ref}>
        <SectionHead num="04" label="achievements" title="My" highlight="Achievements" visible={visible} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ACHIEVEMENTS.map((a, i) => (
            <div
              key={a.title}
              className={`glow-card p-5 flex items-center gap-4 reveal reveal-d${(i % 6) + 1} ${visible ? "visible" : ""}`}
            >
              <span className="text-3xl flex-shrink-0">{a.icon}</span>
              <div>
                <h3
                  className="text-sm font-semibold mb-0.5"
                  style={{ color: "#e8f4fd", fontFamily: "'Oxanium', sans-serif" }}
                >
                  {a.title}
                </h3>
                <p className="text-xs" style={{ color: "#4a7a94" }}>{a.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Footer ────────────────────────────────────────────────────
function Footer() {
  return (
    <footer
      id="contact"
      className="py-16 px-6 text-center"
      style={{ background: BG3, borderTop: "1px solid rgba(0,212,255,0.1)" }}
    >
      <div className="max-w-2xl mx-auto">
        <div
          className="text-xs tracking-widest mb-3 uppercase"
          style={{ color: "#00d4ff", fontFamily: "'JetBrains Mono', monospace" }}
        >
          05 — contact
        </div>
        <h2
          className="font-bold mb-3"
          style={{
            fontSize: "clamp(1.5rem,3.5vw,2.1rem)",
            color: "#e8f4fd",
            fontFamily: "'Oxanium', sans-serif",
          }}
        >
          {"Let's"}{" "}
          <span style={{ color: "#00d4ff" }}>Connect</span>
        </h2>
        <p className="text-sm mb-8 leading-relaxed" style={{ color: "#4a7a94" }}>
          Open to opportunities, collaborations, and interesting conversations.
        </p>
        <div className="flex gap-4 justify-center flex-wrap mb-10">
          {[
            { href: "mailto:shubhamy2917@gmail.com", label: "shubhamy2917@gmail.com", bg: "#EA4335", shadow: "234,67,53", icon: <Mail size={15} /> },
            { href: "https://www.linkedin.com/in/sbm-ydv-2917-bonjour/", label: "LinkedIn", bg: "#0A66C2", shadow: "10,102,194", icon: <Linkedin size={15} /> },
            { href: "https://github.com/Shubham2917", label: "GitHub", bg: "#24292e", shadow: "0,0,0", icon: <Github size={15} /> },
          ].map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium transition-all duration-220"
              style={{
                background: s.bg,
                color: "#fff",
                boxShadow: `0 4px 16px rgba(${s.shadow},0.28)`,
                textDecoration: "none",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.transform = "translateY(-4px) scale(1.05)";
                el.style.boxShadow = `0 12px 32px rgba(${s.shadow},0.46)`;
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.transform = "";
                el.style.boxShadow = `0 4px 16px rgba(${s.shadow},0.28)`;
              }}
            >
              {s.icon} {s.label}
            </a>
          ))}
        </div>
        <p
          className="text-xs"
          style={{ color: "#1e3a50", fontFamily: "'JetBrains Mono', monospace" }}
        >
          Built with ❤️ by Shubham Yadav &nbsp;·&nbsp; CSE AI &amp; ML @ NIET &apos;27
        </p>
      </div>
    </footer>
  );
}

// ── App ───────────────────────────────────────────────────────
export default function App() {
  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <div className="overflow-x-hidden" style={{ background: BG1 }}>
        <WaterCanvas />
        <Nav />
        <Hero />
        <WaveDivider from={BG1} to={BG2} />
        <About />
        <WaveDivider from={BG2} to={BG1} />
        <Projects />
        <WaveDivider from={BG1} to={BG2} />
        <TechStack />
        <WaveDivider from={BG2} to={BG1} />
        <Achievements />
        <WaveDivider from={BG1} to={BG3} />
        <Footer />
      </div>
    </>
  );
}

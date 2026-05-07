'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import SunArcIndicator from '@/components/SunArcIndicator';
import { useDaylight } from '@/lib/daylight';

// ─────────────────────────────────────────────────────────────
// FORM SCHEMA — kept lean. Basics + socials + 90-second video.
// ─────────────────────────────────────────────────────────────
interface FormData {
  fullName: string;
  age: string;
  cityState: string;
  phone: string;
  email: string;
  instagram: string;
  tiktok: string;
  twitter: string;
  youtube: string;
  videoLink: string;
  consent: boolean;
}

const initialFormData: FormData = {
  fullName: '',
  age: '',
  cityState: '',
  phone: '',
  email: '',
  instagram: '',
  tiktok: '',
  twitter: '',
  youtube: '',
  videoLink: '',
  consent: false,
};

// ─────────────────────────────────────────────────────────────
// THEME PRIMITIVES
// ─────────────────────────────────────────────────────────────
const SFWordmark: React.FC<{ size?: number; color?: string; dot?: string }> = ({
  size = 22, color = '#0A0814', dot = 'var(--sf-coral)',
}) => (
  <span className="sf-display" style={{
    fontSize: size, fontWeight: 900, color,
    letterSpacing: '-0.05em', lineHeight: 1,
    display: 'inline-flex', alignItems: 'center', gap: 1,
  }}>
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      <span style={{
        width: size * 0.78, height: size * 0.78, borderRadius: 6,
        background: 'var(--sf-stage)', border: '1.5px solid ' + color,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg viewBox="0 0 24 24" width={size * 0.55} height={size * 0.55}>
          <path d="M12 2l2.6 6.4L21 9l-5 4.7L17.5 21 12 17.6 6.5 21 8 13.7 3 9l6.4-.6L12 2z"
            fill={dot} stroke={color} strokeWidth="0.8" strokeLinejoin="round" />
        </svg>
      </span>
      <span style={{ fontStyle: 'italic' }}>starfactor</span>
    </span>
    <span style={{ color: dot, marginLeft: 1 }}>.</span>
  </span>
);

// ─────────────────────────────────────────────────────────────
// FORM PRIMITIVES
// ─────────────────────────────────────────────────────────────
const baseFieldStyle: React.CSSProperties = {
  width: '100%',
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid var(--sf-line)',
  borderRadius: 12,
  padding: '12px 14px',
  color: '#fff',
  fontSize: 14,
  fontFamily: 'inherit',
  outline: 'none',
};
const errorBorder: React.CSSProperties = { border: '1px solid var(--sf-live)' };

const Label: React.FC<{ children: React.ReactNode; required?: boolean; hint?: string }> = ({ children, required, hint }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
    <label style={{
      fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase',
      color: 'var(--sf-fg-2)',
    }}>
      {children}{required && <span style={{ color: 'var(--sf-coral)', marginLeft: 4 }}>*</span>}
    </label>
    {hint && (
      <span style={{ fontSize: 10, color: 'var(--sf-fg-3)', letterSpacing: '0.04em' }}>{hint}</span>
    )}
  </div>
);

const ErrorText: React.FC<{ msg?: string }> = ({ msg }) =>
  msg ? <p style={{ marginTop: 4, fontSize: 11, color: 'var(--sf-live)', fontWeight: 700 }}>{msg}</p> : null;

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { error?: string }> = ({ error, style, ...rest }) => (
  <input style={{ ...baseFieldStyle, ...(error ? errorBorder : null), ...style }} {...rest} />
);

const SocialField: React.FC<{
  label: string;
  prefix: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}> = ({ label, prefix, value, onChange, placeholder }) => (
  <div>
    <Label>{label}</Label>
    <div style={{ display: 'flex' }}>
      <span style={{
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid var(--sf-line)',
        borderRight: 'none',
        borderRadius: '12px 0 0 12px',
        padding: '12px 12px',
        color: 'var(--sf-fg-3)',
        fontSize: 12, fontWeight: 700,
        whiteSpace: 'nowrap',
        display: 'flex', alignItems: 'center',
      }}>{prefix}</span>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder || 'username'}
        style={{
          flex: 1, minWidth: 0,
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid var(--sf-line)',
          borderRadius: '0 12px 12px 0',
          padding: '12px 14px',
          color: '#fff', fontSize: 14, fontFamily: 'inherit', outline: 'none',
        }}
      />
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────
const ApplyPage: React.FC = () => {
  const day = useDaylight({ mode: 'auto' });

  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const updateField = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const e: Partial<Record<keyof FormData, string>> = {};
    if (!formData.fullName.trim()) e.fullName = 'Required';
    if (!formData.age || parseInt(formData.age) < 18) e.age = 'Must be 18 or older';
    if (!formData.cityState.trim()) e.cityState = 'Where are you based?';
    if (!formData.phone.trim()) e.phone = 'WhatsApp number is required';
    if (!formData.email.trim() || !/^\S+@\S+\.\S+$/.test(formData.email)) {
      e.email = 'Valid email is required';
    }
    if (!formData.videoLink.trim() || !/^https?:\/\/.+/i.test(formData.videoLink)) {
      e.videoLink = 'Drop a public link to your 90-second video';
    }
    if (!formData.consent) e.consent = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    await new Promise(r => setTimeout(r, 1200));
    if (typeof window !== 'undefined') {
      console.log('Application submitted:', formData);
    }
    setSubmitted(true);
    setIsSubmitting(false);
  };

  // ── Submitted state ──────────────────────────────────────
  if (submitted) {
    return (
      <div
        className="sf-watch-root sf-daylight-root"
        style={{
          minHeight: '100vh',
          ['--sf-coral' as string]: day.accent,
          ['--sf-coral-deep' as string]: day.accentSoft,
          ['--sf-paper' as string]: day.paper,
          ['--sf-paper-warm' as string]: day.paper2,
          background: 'var(--sf-stage)',
          color: 'var(--sf-fg)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '40px 18px',
        } as React.CSSProperties}
      >
        <div style={{ maxWidth: 560, width: '100%', textAlign: 'center' }}>
          <div style={{
            width: 80, height: 80, margin: '0 auto 24px',
            borderRadius: 999,
            background: 'var(--sf-mint)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#0A0814',
            boxShadow: '0 12px 36px -8px rgba(31,209,122,0.5)',
          }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div className="sf-eyebrow" style={{ color: 'var(--sf-coral)', marginBottom: 12 }}>● APPLICATION RECEIVED</div>
          <h1 className="sf-display" style={{
            fontSize: 'clamp(40px, 8vw, 76px)', color: '#fff',
            letterSpacing: '-0.05em', lineHeight: 0.92, marginBottom: 18,
          }}>
            You sent it.<br />
            <span style={{ fontStyle: 'italic', color: 'var(--sf-coral)' }}>We&apos;ll be in touch.</span>
          </h1>
          <p style={{ fontSize: 16, lineHeight: 1.6, color: 'var(--sf-fg-2)', marginBottom: 32 }}>
            Thanks for putting yourself forward for Star Factor Season 1. We&apos;ll watch every video and reach out to shortlisted applicants on a rolling basis. Keep an eye on <b style={{ color: '#fff' }}>{formData.email}</b> and your WhatsApp.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/" className="sf-btn sf-btn-coral" style={{ height: 46, padding: '0 22px', fontSize: 12 }}>
              BACK TO HOME
            </Link>
            <Link href="/watch" className="sf-btn sf-btn-ghost" style={{ height: 46, padding: '0 22px', fontSize: 12 }}>
              PREVIEW THE SHOW →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Form state ──
  return (
    <div
      className="sf-watch-root sf-daylight-root"
      style={{
        minHeight: '100vh',
        ['--sf-coral' as string]: day.accent,
        ['--sf-coral-deep' as string]: day.accentSoft,
        ['--sf-paper' as string]: day.paper,
        ['--sf-paper-warm' as string]: day.paper2,
        background: 'var(--sf-stage)',
        color: 'var(--sf-fg)',
      } as React.CSSProperties}
    >
      {/* HEADER — paper cream */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'var(--sf-paper)',
        color: 'var(--sf-stage)',
        borderBottom: '2px solid var(--sf-stage)',
      }}>
        <div className="sf-nav-pad" style={{
          maxWidth: 980, margin: '0 auto',
          display: 'flex', alignItems: 'center', gap: 14,
        }}>
          <Link href="/" style={{ display: 'inline-flex' }}><SFWordmark size={20} /></Link>
          <span className="sf-eyebrow sf-hide-mobile" style={{ color: 'var(--sf-stage)', marginLeft: 12 }}>
            ● SEASON 1 · LAGOS · Q4 2026 · CASTING OPEN
          </span>
          <div style={{ flex: 1 }} />
          <div className="sf-hide-mobile">
            <SunArcIndicator state={day} dark={false} />
          </div>
          <Link href="/" className="sf-btn sf-btn-stage" style={{ height: 36, padding: '0 14px', fontSize: 11 }}>
            ← BACK
          </Link>
        </div>
      </header>

      {/* PAPER HERO */}
      <div style={{
        background: 'var(--sf-paper-warm)',
        color: 'var(--sf-stage)',
        borderBottom: '2px solid var(--sf-stage)',
        padding: 'clamp(40px, 7vw, 80px) clamp(14px, 4vw, 32px)',
      }}>
        <div style={{ maxWidth: 980, margin: '0 auto' }}>
          <div className="sf-eyebrow" style={{ color: 'var(--sf-coral)', marginBottom: 12 }}>
            ● 16 HOUSEMATES · ONE WINNER · Q4 2026
          </div>
          <h1 className="sf-display" style={{
            fontSize: 'clamp(44px, 8vw, 96px)', letterSpacing: '-0.05em',
            lineHeight: 0.92, color: 'var(--sf-stage)',
            marginBottom: 14, maxWidth: 880,
          }}>
            BBNaija makes you famous after.<br />
            <span style={{ fontStyle: 'italic', color: 'var(--sf-coral)' }}>Star Factor pays you while.</span>
          </h1>
          <p style={{ fontSize: 16, lineHeight: 1.55, color: 'rgba(10,8,20,0.7)', maxWidth: 620 }}>
            Six weeks. One house. Cameras on. Fans backing you. Tips during the show. Real money during — not just after. Two minutes to apply: the basics, your socials, and a 90-second video.
          </p>

          {/* WHAT YOU GET — value-prop block before the form */}
          <div style={{
            marginTop: 28,
            padding: 22,
            borderRadius: 18,
            background: 'rgba(10,8,20,0.04)',
            border: '1px solid rgba(10,8,20,0.18)',
          }}>
            <div className="sf-eyebrow" style={{ color: 'var(--sf-coral)', marginBottom: 10 }}>★ WHAT YOU GET</div>
            <ol style={{ display: 'flex', flexDirection: 'column', gap: 10, margin: 0, paddingLeft: 20, color: 'rgba(10,8,20,0.78)', fontSize: 14, lineHeight: 1.5 }}>
              <li>Weekly tips from fans, paid out as you earn them.</li>
              <li>More ways to earn from fan support during the show.</li>
              <li>Grand prize at the end — plus everything you earned getting there.</li>
            </ol>
          </div>
        </div>
      </div>

      {/* FORM */}
      <main style={{ padding: 'clamp(36px, 5vw, 56px) clamp(14px, 4vw, 32px) 80px' }}>
        <form
          onSubmit={handleSubmit}
          style={{
            maxWidth: 720, margin: '0 auto',
            background: 'var(--sf-stage-2)',
            border: '1px solid var(--sf-line)',
            borderRadius: 22,
            padding: 'clamp(20px, 3vw, 36px)',
            display: 'flex', flexDirection: 'column', gap: 22,
          }}
        >
          {/* SECTION: BASICS */}
          <SectionTitle n="01" title="The basics" />
          <Row>
            <Col>
              <Label required>Full name</Label>
              <Input
                value={formData.fullName}
                onChange={e => updateField('fullName', e.target.value)}
                placeholder="Your full name"
                error={errors.fullName}
                autoComplete="name"
              />
              <ErrorText msg={errors.fullName} />
            </Col>
            <Col>
              <Label required>Age (18+)</Label>
              <Input
                type="number" min={18}
                value={formData.age}
                onChange={e => updateField('age', e.target.value)}
                placeholder="18"
                error={errors.age}
              />
              <ErrorText msg={errors.age} />
            </Col>
          </Row>
          <Row>
            <Col>
              <Label required>City / State</Label>
              <Input
                value={formData.cityState}
                onChange={e => updateField('cityState', e.target.value)}
                placeholder="Lagos, Nigeria"
                error={errors.cityState}
              />
              <ErrorText msg={errors.cityState} />
            </Col>
            <Col>
              <Label required>WhatsApp</Label>
              <Input
                type="tel"
                value={formData.phone}
                onChange={e => updateField('phone', e.target.value)}
                placeholder="+234…"
                error={errors.phone}
                autoComplete="tel"
              />
              <ErrorText msg={errors.phone} />
            </Col>
          </Row>
          <div>
            <Label required>Email</Label>
            <Input
              type="email"
              value={formData.email}
              onChange={e => updateField('email', e.target.value)}
              placeholder="you@example.com"
              error={errors.email}
              autoComplete="email"
            />
            <ErrorText msg={errors.email} />
          </div>

          {/* SECTION: SOCIALS */}
          <div style={{ paddingTop: 8, borderTop: '1px dashed var(--sf-line)' }} />
          <SectionTitle n="02" title="Socials" hint="Optional · helps us see how you carry yourself online" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
            <SocialField label="Instagram" prefix="@" value={formData.instagram} onChange={v => updateField('instagram', v)} />
            <SocialField label="TikTok"    prefix="@" value={formData.tiktok}    onChange={v => updateField('tiktok', v)} />
            <SocialField label="X / Twitter" prefix="@" value={formData.twitter}  onChange={v => updateField('twitter', v)} />
            <SocialField label="YouTube"   prefix="youtube.com/" value={formData.youtube} onChange={v => updateField('youtube', v)} placeholder="channel" />
          </div>

          {/* SECTION: VIDEO */}
          <div style={{ paddingTop: 8, borderTop: '1px dashed var(--sf-line)' }} />
          <SectionTitle n="03" title="The 90-second pitch" hint="The most important part" />
          <div style={{
            padding: 16, borderRadius: 14,
            background: 'rgba(255,176,32,0.08)',
            border: '1px solid rgba(255,176,32,0.35)',
          }}>
            <div className="sf-eyebrow" style={{ color: 'var(--sf-amber)', marginBottom: 6 }}>★ THE BRIEF</div>
            <p style={{ fontSize: 13, lineHeight: 1.55, color: 'var(--sf-fg-2)', margin: 0 }}>
              Vertical, your phone, one take. Your name. Your city. The one reason we should put you in the house. Post it anywhere public — TikTok, IG, YouTube, X, Drive — and drop the link below.
            </p>
          </div>
          <div>
            <Label required hint="Public link · 90 seconds max">Video link</Label>
            <Input
              type="url"
              value={formData.videoLink}
              onChange={e => updateField('videoLink', e.target.value)}
              placeholder="https://…"
              error={errors.videoLink}
            />
            <ErrorText msg={errors.videoLink} />
          </div>

          {/* CONSENT */}
          <div style={{ paddingTop: 8, borderTop: '1px dashed var(--sf-line)' }} />
          <label style={{
            display: 'flex', gap: 12, alignItems: 'flex-start',
            padding: 14, borderRadius: 12,
            background: formData.consent ? 'rgba(255,78,43,0.06)' : 'rgba(255,255,255,0.02)',
            border: errors.consent ? '1px solid var(--sf-live)' : formData.consent ? '1px solid var(--sf-coral)' : '1px solid var(--sf-line)',
            cursor: 'pointer',
            transition: 'background 200ms, border-color 200ms',
          }}>
            <span
              role="checkbox"
              aria-checked={formData.consent}
              onClick={() => updateField('consent', !formData.consent)}
              style={{
                flexShrink: 0,
                width: 20, height: 20, borderRadius: 6,
                background: formData.consent ? 'var(--sf-coral)' : 'transparent',
                border: formData.consent ? 'none' : '1.5px solid var(--sf-line-strong)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                marginTop: 2,
              }}
            >
              {formData.consent && (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </span>
            <input
              type="checkbox"
              checked={formData.consent}
              onChange={e => updateField('consent', e.target.checked)}
              style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
            />
            <span style={{ flex: 1, fontSize: 13, lineHeight: 1.55, color: 'var(--sf-fg-2)' }}>
              I&apos;m 18 or older, the info above is accurate, and I understand that submitting this application doesn&apos;t guarantee I&apos;ll be cast.
            </span>
          </label>
          <ErrorText msg={errors.consent} />

          {/* SUBMIT */}
          <div style={{
            paddingTop: 12, borderTop: '1px solid var(--sf-line)',
            display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap',
          }}>
            <span style={{ fontSize: 11, color: 'var(--sf-fg-3)', fontWeight: 700, letterSpacing: '0.08em', flex: 1 }}>
              We&apos;ll reach out to shortlisted applicants on a rolling basis. Apply early.
            </span>
            <button
              type="submit"
              disabled={isSubmitting}
              className="sf-btn sf-btn-coral"
              style={{ height: 48, padding: '0 26px', fontSize: 12, opacity: isSubmitting ? 0.7 : 1 }}
            >
              {isSubmitting ? 'SUBMITTING…' : 'SEND IT IN'}
              {!isSubmitting && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

// ── tiny layout helpers ─────────────────────────────────────
const Row: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
    {children}
  </div>
);
const Col: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div>{children}</div>
);

const SectionTitle: React.FC<{ n: string; title: string; hint?: string }> = ({ n, title, hint }) => (
  <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, flexWrap: 'wrap' }}>
    <span className="sf-display" style={{
      fontSize: 28, color: 'var(--sf-coral)',
      fontStyle: 'italic', letterSpacing: '-0.04em',
    }}>{n}</span>
    <span className="sf-eyebrow" style={{ color: 'var(--sf-fg-3)' }}>—  {title}</span>
    {hint && (
      <span style={{ fontSize: 11, color: 'var(--sf-fg-3)', marginLeft: 'auto' }}>{hint}</span>
    )}
  </div>
);

export default ApplyPage;

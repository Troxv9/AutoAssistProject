
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import {
  C,
  FONT,
  SHADOW_ELEVATED,
  AAMark,
  AAWordmark,
  ArrowRight,
  ArrowUp,
  ArrowLeftRight,
  Link2,
  Check,
  X,
  MessageCircle,
  MoreHorizontal,
} from "./kit";

export const SCREEN_H = 1080;

const AURAS = [
  { x: 1500, y: 240, w: 760, h: 500, hue: C.primary, o: 0.26, blur: 76, sp: 0.010, ph: 0 },
  { x: 1020, y: 760, w: 680, h: 380, hue: C.primary, o: 0.20, blur: 84, sp: 0.008, ph: 1.7 },
  { x: 260, y: 420, w: 440, h: 600, hue: C.fg, o: 0.05, blur: 96, sp: 0.009, ph: 3.1 },
  { x: 820, y: 120, w: 440, h: 320, hue: C.ring, o: 0.22, blur: 64, sp: 0.012, ph: 4.6 },
  { x: 420, y: 820, w: 520, h: 340, hue: C.accentFg, o: 0.10, blur: 90, sp: 0.007, ph: 5.9 },
];

export const HeroAmbient: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ overflow: "hidden", pointerEvents: "none" }}>
      {AURAS.map((a, i) => {
        const dx = Math.sin(frame * a.sp + a.ph) * 46;
        const dy = Math.cos(frame * a.sp * 0.8 + a.ph) * 34;
        const s = 1 + Math.sin(frame * a.sp * 1.2 + a.ph) * 0.08;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: a.x - a.w / 2,
              top: a.y - a.h / 2,
              width: a.w,
              height: a.h,
              transform: `translate(${dx}px, ${dy}px) scale(${s})`,
              filter: `blur(${a.blur}px)`,
              opacity: a.o,
              borderRadius: "50%",
              background: `radial-gradient(ellipse 70% 60% at 45% 45%, ${a.hue} 0%, transparent 70%)`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};




const NAV = ["განბაჟება", "იმპორტი", "ტრანსპორტი", "მეთოდოლოგია", "FAQ"];

const HeaderBar: React.FC = () => (
  <div style={{ position: "absolute", top: 26, left: 0, width: "100%", display: "flex", justifyContent: "center", zIndex: 30 }}>
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        width: 1200,
        height: 66,
        padding: "0 26px",
        borderRadius: 999,
        border: `1px solid ${C.border}`,
        background: "rgba(255,255,255,0.9)",
        backdropFilter: "blur(12px)",
        boxShadow: SHADOW_ELEVATED,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ display: "flex", width: 38, height: 38, alignItems: "center", justifyContent: "center" }}>
          <AAMark size={25} />
        </span>
        <AAWordmark fontSize={18} />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
        {NAV.map((l) => (
          <span key={l} style={{ fontFamily: FONT.sans, fontSize: 15, fontWeight: 500, color: C.mutedFg }}>
            {l}
          </span>
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, height: 42, paddingLeft: 22, paddingRight: 6, borderRadius: 999, background: C.primary }}>
        <span style={{ fontFamily: FONT.sans, fontSize: 15, fontWeight: 600, color: C.primaryFg }}>შედარება</span>
        <span style={{ display: "flex", width: 30, height: 30, alignItems: "center", justifyContent: "center", borderRadius: 999, background: "rgba(255,255,255,0.2)", color: "#fff" }}>
          <ArrowRight size={15} />
        </span>
      </div>
    </div>
  </div>
);




const METRICS = [
  { e: "წყაროები", t: "აშშ · საქართველო", h: "Copart / IAAI და autopapa.ge" },
  { e: "კალკულაცია", t: "10+ ხარჯის სტატია", h: "აუქციონიდან განბაჟებამდე" },
  { e: "შედეგი", t: "ფინანსური ვერდიქტი", h: "ROI და ეკონომიის შეფასება" },
];

const Hero: React.FC = () => (
  <div style={{ position: "absolute", top: 100, left: 0, right: 0, bottom: 130, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1 }}>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", alignItems: "center", gap: 60, width: 1280 }}>
      
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
        <div style={{ fontFamily: FONT.mono, fontSize: 12, letterSpacing: "0.18em", textTransform: "uppercase", color: C.primary }}>
          ავტომობილის ხარჯების ანალიზი
        </div>
        <h1 style={{ margin: "20px 0 0", fontFamily: FONT.sans, fontSize: 66, fontWeight: 800, lineHeight: 1.06, letterSpacing: -1.4, color: C.fg }}>
          იმპორტი თუ
          <br />
          <span style={{ color: C.primary }}>ადგილზე ყიდვა?</span>
        </h1>
        <p style={{ margin: "22px 0 0", maxWidth: 500, fontFamily: FONT.sans, fontSize: 17, lineHeight: 1.6, color: C.mutedFg }}>
          ორი ბმული. სრული ფინანსური სურათი. შეადარე Copart / IAAI-ს იმპორტის რეალური ღირებულება autopapa.ge-ს ადგილობრივ შეთავაზებასთან.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, width: "100%", maxWidth: 540, marginTop: 32 }}>
          {METRICS.map((m) => (
            <div key={m.t} style={{ borderRadius: 14, border: `1px solid ${C.border}`, background: "rgba(255,255,255,0.6)", padding: "14px 16px", boxShadow: "0 1px 2px rgba(10,10,10,0.04)" }}>
              <p style={{ margin: 0, fontFamily: FONT.mono, fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: C.mutedFg }}>{m.e}</p>
              <p style={{ margin: "6px 0 0", fontFamily: FONT.sans, fontSize: 15, fontWeight: 600, lineHeight: 1.2, color: C.fg }}>{m.t}</p>
              <p style={{ margin: "4px 0 0", fontFamily: FONT.sans, fontSize: 11, lineHeight: 1.35, color: C.mutedFg }}>{m.h}</p>
            </div>
          ))}
        </div>
      </div>

      
      <div style={{ justifySelf: "center", width: 500, height: 250, borderRadius: 26, border: `1px solid ${C.border}`, background: C.card, boxShadow: SHADOW_ELEVATED, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
          <AAMark size={42} />
          <span style={{ fontFamily: FONT.sans, fontSize: 38, letterSpacing: -0.9 }}>
            <span style={{ color: C.fg, fontWeight: 700 }}>Auto</span>
            <span style={{ color: C.primary, fontWeight: 600 }}>Assist</span>
          </span>
        </div>
        <p style={{ margin: 0, fontFamily: FONT.sans, fontSize: 15, color: C.mutedFg }}>
          შეადარე <span style={{ color: C.primary, fontWeight: 600 }}>Copart</span> &{" "}
          <span style={{ color: C.primary, fontWeight: 600 }}>IAAI</span> აუქციონი{" "}
          <span style={{ color: C.primary, fontWeight: 600 }}>autopapa.ge</span>-ს
        </p>
      </div>
    </div>
  </div>
);




const TRUST = [
  { e: "ვალუტა", t: "NBG-ის ცოცხალი კურსი", ic: <ArrowLeftRight size={16} color={C.primary} /> },
  { e: "მეთოდოლოგია", t: "RS.ge · წესები 2026.2", ic: <ArrowLeftRight size={16} color={C.primary} /> },
  { e: "ლოგისტიკა", t: "შტატზე მორგებული ტარიფი", ic: <ArrowRight size={16} color={C.primary} /> },
  { e: "გამჭვირვალობა", t: "ყველა ხარჯი ცალ-ცალკე", ic: <Check size={16} color={C.primary} /> },
];

const TrustStrip: React.FC = () => (
  <div style={{ position: "absolute", bottom: 0, left: 0, width: 1920, borderTop: `1px solid ${C.border}`, background: C.card, zIndex: 2 }}>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", width: 1280, margin: "0 auto" }}>
      {TRUST.map((t, i) => (
        <div key={t.t} style={{ display: "flex", alignItems: "center", gap: 16, padding: "22px 20px", borderLeft: i === 0 ? "none" : `1px solid ${C.border}` }}>
          <span style={{ display: "flex", width: 38, height: 38, alignItems: "center", justifyContent: "center", borderRadius: 10, background: C.secondary }}>{t.ic}</span>
          <div>
            <p style={{ margin: 0, fontFamily: FONT.mono, fontSize: 10, letterSpacing: "0.13em", textTransform: "uppercase", color: C.mutedFg }}>{t.e}</p>
            <p style={{ margin: "3px 0 0", fontFamily: FONT.sans, fontSize: 15, fontWeight: 600, color: C.fg }}>{t.t}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);




export type FormState = {
  url: string;
  focus: number;
  flash: number;
  caretOn: boolean;
  btnPress: number;
};

const UrlField: React.FC<{
  placeholder: string;
  value: string;
  focus: number;
  flash: number;
  caretOn: boolean;
}> = ({ placeholder, value, focus, flash, caretOn }) => {
  const filled = value.length > 0;
  const borderCol = focus > 0.5 ? "rgba(220,38,38,0.35)" : C.border15;
  return (
    <div
      style={{
        position: "relative",
        width: 650,
        maxWidth: "100%",
        height: 52,
        borderRadius: 12,
        border: `1px solid ${borderCol}`,
        background: C.bg,
        boxShadow: focus > 0.1 ? `0 0 0 ${3 * focus}px rgba(239,68,68,0.12)` : "none",
        display: "flex",
        alignItems: "center",
        paddingLeft: 46,
        paddingRight: 46,
        boxSizing: "border-box",
      }}
    >
      <span style={{ position: "absolute", left: 18, top: "50%", transform: "translateY(-50%)", display: "flex", color: focus > 0.5 ? "rgba(220,38,38,0.8)" : C.mutedFg }}>
        <Link2 size={18} />
      </span>
      <span style={{ fontFamily: FONT.mono, fontSize: 15, color: filled ? C.fg : C.mutedFg, whiteSpace: "nowrap", overflow: "hidden", maxWidth: "100%" }}>
        <span style={{ background: `rgba(37,99,235,${0.28 * flash})`, borderRadius: 2, boxShadow: flash > 0.02 ? `0 0 0 1px rgba(37,99,235,${0.28 * flash})` : "none" }}>
          {filled ? value : placeholder}
        </span>
        {focus > 0.5 && flash < 0.05 && <span style={{ display: "inline-block", width: 2, height: 18, marginLeft: 1, background: C.primary, verticalAlign: "middle", opacity: caretOn ? 1 : 0 }} />}
      </span>
      {filled ? (
        <span style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", display: "flex", width: 22, height: 22, alignItems: "center", justifyContent: "center", borderRadius: 999, background: "rgba(220,38,38,0.1)", color: C.primary }}>
          <Check size={13} color={C.primary} />
        </span>
      ) : null}
    </div>
  );
};

const CompareForm: React.FC<{ form: FormState }> = ({ form }) => (
  <div
    id="compare"
    style={{
      width: 1080,
      borderRadius: 24,
      border: `1px solid ${C.border}`,
      background: "rgba(255,255,255,0.98)",
      backdropFilter: "blur(18px)",
      boxShadow: SHADOW_ELEVATED,
      padding: 48,
      boxSizing: "border-box",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 28,
    }}
  >
    <h2 style={{ margin: 0, textAlign: "center", fontFamily: FONT.sans, fontSize: 26, fontWeight: 600, letterSpacing: -0.3, color: C.fg }}>
      ჩაწერეთ <span style={{ fontWeight: 700 }}>Copart / IAAI</span> ლოტის ბმული ან VIN კოდი
    </h2>

    <UrlField placeholder="Copart / IAAI ბმული ან VIN" value={form.url} focus={form.focus} flash={form.flash} caretOn={form.caretOn} />

    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        width: 360,
        height: 54,
        borderRadius: 14,
        background: C.primary,
        color: C.primaryFg,
        transform: `scale(${1 - form.btnPress * 0.02})`,
        boxShadow: `0 ${12 - form.btnPress * 7}px ${32 - form.btnPress * 14}px -12px rgba(220,38,38,0.55)`,
      }}
    >
      <span style={{ fontFamily: FONT.sans, fontSize: 18, fontWeight: 600 }}>შედარება</span>
    </div>

    <p style={{ margin: 0, maxWidth: 440, textAlign: "center", fontFamily: FONT.sans, fontSize: 13, lineHeight: 1.6, color: C.mutedFg }}>
      გაგზავნით ეთანხმები, რომ შედეგი შეფასებითია და საბოლოო თანხა შეიძლება შეიცვალოს.
    </p>
  </div>
);




const ChatWidget: React.FC<{ open: number; ctaHighlight: number }> = ({ open, ctaHighlight }) => {
  const frame = useCurrentFrame();
  const ping = (Math.sin(frame * 0.12) + 1) / 2;

  const panelScale = interpolate(open, [0, 1], [0.72, 1]);
  const panelY = interpolate(open, [0, 1], [46, 0]);
  const panelOpacity = interpolate(open, [0, 0.55], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });

  return (
    <>
      <div
        style={{
          position: "absolute",
          right: 32,
          bottom: 104,
          width: 420,
          height: 560,
          transformOrigin: "bottom right",
          transform: `translateY(${panelY}px) scale(${panelScale})`,
          opacity: panelOpacity,
          borderRadius: 24,
          border: `1px solid ${C.border}`,
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(20px)",
          boxShadow: SHADOW_ELEVATED,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          zIndex: 40,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 16px 12px", borderBottom: `1px solid ${C.border}`, background: "rgba(245,245,245,0.5)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ display: "flex", width: 36, height: 36, alignItems: "center", justifyContent: "center", borderRadius: 12, background: "rgba(220,38,38,0.1)" }}>
              <AAMark size={20} />
            </span>
            <div style={{ lineHeight: 1.2 }}>
              <AAWordmark fontSize={14} />
              <div style={{ fontFamily: FONT.sans, fontSize: 14, fontWeight: 700, color: C.fg }}>AI ასისტენტი</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, color: C.mutedFg }}>
            <MoreHorizontal size={18} />
            <X size={18} color={C.mutedFg} />
          </div>
        </div>

        <div style={{ padding: "10px 16px", borderBottom: `1px solid ${C.border}`, background: "rgba(255,255,255,0.7)" }}>
          <p style={{ margin: 0, fontFamily: FONT.sans, fontSize: 12, lineHeight: 1.5, color: C.mutedFg }}>
            შედარების შემდეგ აქ გამოჩნდება აქტიური მანქანების კონტექსტი.
          </p>
        </div>

        <div style={{ flex: 1, padding: 16 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <span style={{ display: "flex", width: 30, height: 30, flexShrink: 0, alignItems: "center", justifyContent: "center", borderRadius: 999, background: "rgba(220,38,38,0.1)" }}>
              <AAMark size={16} />
            </span>
            <div style={{ maxWidth: 300 }}>
              <div style={{ borderRadius: "4px 14px 14px 14px", background: C.secondary, padding: "10px 14px", fontFamily: FONT.sans, fontSize: 13, lineHeight: 1.6, color: C.fg }}>
                გამარჯობა! მე ვარ თქვენი პერსონალური ავტო-ასისტენტი. გთხოვთ, ჯერ შეასრულოთ ავტომობილების შედარება, რათა დეტალურად განვიხილოთ ისინი.
              </div>
              <div style={{ margin: "6px 0 0 4px", fontFamily: FONT.mono, fontSize: 10, color: C.mutedFg }}>02:26 PM</div>
            </div>
          </div>
        </div>

        <div style={{ padding: "12px 16px", borderTop: `1px solid ${C.border}`, background: "rgba(255,255,255,0.7)" }}>
          <p style={{ margin: "0 0 10px", textAlign: "center", fontFamily: FONT.sans, fontSize: 11, lineHeight: 1.5, color: C.mutedFg }}>
            <span style={{ color: C.primary, fontWeight: 500, borderBottom: `1px solid ${ctaHighlight > 0.1 ? C.primary : "transparent"}`, paddingBottom: 1, background: `rgba(220,38,38,${0.12 * ctaHighlight})`, borderRadius: 3 }}>
              შეასრულეთ შედარება
            </span>{" "}
            რათა დასვათ კითხვა
          </p>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, borderRadius: 22, border: `1px solid ${C.border}`, background: C.bg, padding: "6px 6px 6px 14px", opacity: 0.75 }}>
            <span style={{ fontFamily: FONT.sans, fontSize: 13, color: "rgba(115,115,115,0.7)" }}>შედარების შემდეგ დამისვით კითხვა...</span>
            <span style={{ display: "flex", width: 32, height: 32, alignItems: "center", justifyContent: "center", borderRadius: 999, background: C.muted, color: C.mutedFg }}>
              <ArrowUp size={16} color={C.mutedFg} />
            </span>
          </div>
        </div>
      </div>

      <div style={{ position: "absolute", right: 32, bottom: 32, width: 56, height: 56, borderRadius: 999, background: C.primary, boxShadow: "0 4px 20px rgba(239,68,68,0.3)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 45 }}>
        {open < 0.5 && (
          <span style={{ position: "absolute", inset: -4, borderRadius: 999, border: `2px solid ${C.ring}`, opacity: (1 - ping) * 0.6, transform: `scale(${1 + ping * 0.35})` }} />
        )}
        <span style={{ position: "absolute", opacity: 1 - open, transform: `rotate(${open * -90}deg)`, color: "#fff", display: "flex" }}>
          <MessageCircle size={24} color="#fff" />
        </span>
        <span style={{ position: "absolute", opacity: open, transform: `rotate(${(1 - open) * 90}deg)`, color: "#fff", display: "flex" }}>
          <X size={24} color="#fff" />
        </span>
      </div>
    </>
  );
};




export const PageContent: React.FC<{ form: FormState; chatOpen: number; ctaHighlight: number }> = ({ form, chatOpen, ctaHighlight }) => (
  <div style={{ width: 1920 }}>
    
    <div style={{ position: "relative", width: 1920, height: SCREEN_H, overflow: "hidden", background: C.bg }}>
      <HeroAmbient />
      <HeaderBar />
      <Hero />
      <TrustStrip />
      <ChatWidget open={chatOpen} ctaHighlight={ctaHighlight} />
    </div>

    
    <div style={{ position: "relative", width: 1920, height: SCREEN_H, background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
      <HeroAmbient />
      <div style={{ position: "relative", zIndex: 1 }}>
        <CompareForm form={form} />
      </div>
    </div>
  </div>
);

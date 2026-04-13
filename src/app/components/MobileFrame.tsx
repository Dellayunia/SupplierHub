import React from "react";

interface MobileFrameProps {
  children: React.ReactNode;
}

export function MobileFrame({ children }: MobileFrameProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0A0E1A] via-[#0D1520] to-[#0A0E1A] p-4">
      {/* Ambient glow effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full opacity-10 blur-3xl" style={{ background: "radial-gradient(circle, #00D084, transparent)" }} />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full opacity-10 blur-3xl" style={{ background: "radial-gradient(circle, #3B82F6, transparent)" }} />
      </div>

      {/* Phone frame */}
      <div className="relative" style={{ width: 390, minHeight: 844 }}>
        {/* Outer frame */}
        <div
          className="relative overflow-hidden shadow-2xl"
          style={{
            width: 390,
            minHeight: 844,
            borderRadius: 48,
            background: "#0B0F1A",
            boxShadow: "0 0 0 8px #1A2332, 0 0 0 10px #0A0E1A, 0 40px 80px rgba(0,0,0,0.8), inset 0 0 0 1px rgba(255,255,255,0.05)",
          }}
        >
          {/* Dynamic island */}
          <div
            className="absolute top-3 left-1/2 -translate-x-1/2 z-50"
            style={{
              width: 120,
              height: 36,
              background: "#000",
              borderRadius: 20,
            }}
          />

          {/* Status bar */}
          <div className="absolute top-0 left-0 right-0 z-40 flex items-end justify-between px-8 pb-2" style={{ height: 56 }}>
            <span className="text-[#F1F5F9] text-xs font-semibold">9:41</span>
            <div className="flex items-center gap-1.5">
              <svg width="17" height="12" viewBox="0 0 17 12" fill="none">
                <rect x="0" y="3" width="3" height="9" rx="1" fill="#F1F5F9" />
                <rect x="4.5" y="2" width="3" height="10" rx="1" fill="#F1F5F9" />
                <rect x="9" y="0" width="3" height="12" rx="1" fill="#F1F5F9" />
                <rect x="13.5" y="0" width="3" height="12" rx="1" fill="#F1F5F9" opacity="0.3" />
              </svg>
              <svg width="16" height="12" viewBox="0 0 16 12" fill="#F1F5F9">
                <path d="M8 2.4C10.97 2.4 13.65 3.59 15.6 5.52L16 5.12C13.94 3.08 11.12 1.8 8 1.8C4.88 1.8 2.06 3.08 0 5.12L0.4 5.52C2.35 3.59 5.03 2.4 8 2.4Z" />
                <path d="M8 4.8C10.21 4.8 12.22 5.69 13.7 7.14L14.1 6.74C12.52 5.18 10.37 4.2 8 4.2C5.63 4.2 3.48 5.18 1.9 6.74L2.3 7.14C3.78 5.69 5.79 4.8 8 4.8Z" />
                <path d="M8 7.2C9.46 7.2 10.79 7.8 11.77 8.76L12.17 8.36C11.09 7.28 9.62 6.6 8 6.6C6.38 6.6 4.91 7.28 3.83 8.36L4.23 8.76C5.21 7.8 6.54 7.2 8 7.2Z" />
                <circle cx="8" cy="11" r="1" fill="#F1F5F9" />
              </svg>
              <div className="flex items-center gap-0.5">
                <div className="rounded-sm" style={{ width: 22, height: 12, border: "1.5px solid #F1F5F9", padding: 1.5 }}>
                  <div className="h-full rounded-sm" style={{ width: "80%", background: "#F1F5F9" }} />
                </div>
              </div>
            </div>
          </div>

          {/* Content area */}
          <div className="relative" style={{ paddingTop: 56, borderRadius: 48, overflow: "hidden", minHeight: 844 }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

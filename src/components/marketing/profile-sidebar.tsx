"use client";

import { useState, useEffect, useRef } from "react";
import { 
  User, Settings, MessageSquare, X, LogOut, Volume2, VolumeX, 
  Send, Sparkles, Trophy, Award, Shield, CheckCircle2, ChevronRight
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function ProfileSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentTheme, setCurrentTheme] = useState<"blue" | "green" | "pink">("blue");
  const [soundMuted, setSoundMuted] = useState(false);

  // Stats from LocalStorage
  const [stats, setStats] = useState({
    points: 0,
    solvedQuizzesCount: 0,
    unlockedBadgesCount: 0,
    certificateUnlocked: false
  });

  // Admin Contact Section
  const [adminMessage, setAdminMessage] = useState("");
  const [transmissionState, setTransmissionState] = useState<"idle" | "sending" | "sent">("idle");
  const [transmissionProgress, setTransmissionProgress] = useState(0);
  const [transmissionId, setTransmissionId] = useState("");

  const audioCtxRef = useRef<AudioContext | null>(null);

  // Listen to Supabase auth state
  useEffect(() => {
    const supabase = createClient();
    
    async function checkUser() {
      try {
        const { data: { user: activeUser } } = await supabase.auth.getUser();
        if (activeUser && activeUser.email?.endsWith("@gmail.com")) {
          setUser(activeUser);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("Global auth check failed in Sidebar", err);
      } finally {
        setLoading(false);
      }
    }

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const activeUser = session?.user || null;
      if (activeUser && activeUser.email?.endsWith("@gmail.com")) {
        setUser(activeUser);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Sync settings and load local statistics on open
  useEffect(() => {
    // 1. Theme sync
    const savedTheme = localStorage.getItem("ct_current_theme") || "blue";
    setCurrentTheme(savedTheme as "blue" | "green" | "pink");
    applyTheme(savedTheme);

    // 2. Sound sync
    const savedMuted = localStorage.getItem("ct_sound_muted") === "true";
    setSoundMuted(savedMuted);

    // 3. Stats load
    if (isOpen) {
      try {
        const points = Number(localStorage.getItem("ct_user_points") || "0");
        
        // Count quizzes
        const quizzesRaw = localStorage.getItem("ct_completed_quizzes");
        let solvedCount = 0;
        let wordExcelDone = false;
        if (quizzesRaw) {
          const quizzes = JSON.parse(quizzesRaw);
          solvedCount = Object.keys(quizzes).length;
          
          // Cert criteria: both quiz-comp and quiz-office at 80%+
          const qComp = quizzes["quiz-comp"];
          const qOffice = quizzes["quiz-office"];
          if (qComp && qComp.score >= 80 && qOffice && qOffice.score >= 80) {
            wordExcelDone = true;
          }
        }

        // Count badges
        const badgesRaw = localStorage.getItem("ct_unlocked_badges");
        let badgesCount = 0;
        if (badgesRaw) {
          badgesCount = JSON.parse(badgesRaw).length;
        }

        setStats({
          points,
          solvedQuizzesCount: solvedCount,
          unlockedBadgesCount: badgesCount,
          certificateUnlocked: wordExcelDone
        });
      } catch (err) {
        console.log("Error loading sidebar stats", err);
      }
    }
  }, [isOpen]);

  // Audio system helper
  const playSynthesizedTone = (freqs: number[], duration: number, type: OscillatorType = "sine", delayBetween = 0) => {
    if (soundMuted) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (!ctx) return;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      freqs.forEach((freq, idx) => {
        setTimeout(() => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          
          osc.type = type;
          osc.frequency.setValueAtTime(freq, ctx.currentTime);
          
          gain.gain.setValueAtTime(0.08, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
          
          osc.connect(gain);
          gain.connect(ctx.destination);
          
          osc.start();
          osc.stop(ctx.currentTime + duration);
        }, idx * delayBetween * 1000);
      });
    } catch (e) {
      console.log("Audio play error in sidebar", e);
    }
  };

  const playClick = () => playSynthesizedTone([400, 200], 0.08, "triangle", 0.03);
  const playSuccessChime = () => playSynthesizedTone([523, 659, 784, 1046], 0.15, "sine", 0.08);

  // Apply CSS root variables dynamically
  const applyTheme = (theme: string) => {
    const root = document.documentElement;
    if (theme === "green") {
      root.style.setProperty("--tm-primary", "#10b981");
      root.style.setProperty("--tm-accent", "#059669");
      root.style.setProperty("--tm-border", "rgba(16, 185, 129, 0.2)");
    } else if (theme === "pink") {
      root.style.setProperty("--tm-primary", "#ec4899");
      root.style.setProperty("--tm-accent", "#db2777");
      root.style.setProperty("--tm-border", "rgba(236, 72, 153, 0.2)");
    } else { // blue
      root.style.setProperty("--tm-primary", "#00d1ff");
      root.style.setProperty("--tm-accent", "#6c63ff");
      root.style.setProperty("--tm-border", "rgba(0, 209, 255, 0.2)");
    }
  };

  const changeTheme = (theme: "blue" | "green" | "pink") => {
    playClick();
    setCurrentTheme(theme);
    localStorage.setItem("ct_current_theme", theme);
    applyTheme(theme);
    
    // Trigger global storage event to synchronize open instances
    window.dispatchEvent(new Event("storage"));
  };

  const toggleSound = () => {
    const newMuted = !soundMuted;
    setSoundMuted(newMuted);
    localStorage.setItem("ct_sound_muted", String(newMuted));
    
    // Play a test beep if unmuted
    if (!newMuted) {
      // Small timeout to allow state change in audio synthesis
      setTimeout(() => {
        try {
          if (!audioCtxRef.current) {
            audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
          }
          const ctx = audioCtxRef.current;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.frequency.setValueAtTime(600, ctx.currentTime);
          gain.gain.setValueAtTime(0.05, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.1);
        } catch (err) {}
      }, 50);
    }
  };

  const handleGoogleLogin = async () => {
    playClick();
    try {
      const supabase = createClient();
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback?next=${window.location.pathname}`
        }
      });
    } catch (e) {
      console.error("Sidebar Google Auth failed", e);
    }
  };

  const handleLogout = async () => {
    playClick();
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      setUser(null);
      window.location.reload();
    } catch (e) {
      console.error("Sidebar logout failed", e);
    }
  };

  // Submit Admin Message with dynamic 8-bit visual transmission animation
  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminMessage.trim()) return;
    
    playClick();
    setTransmissionState("sending");
    setTransmissionProgress(0);

    // Simulate cyber transmission progress bar
    const interval = setInterval(() => {
      setTransmissionProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTransmissionState("sent");
          setTransmissionId("TX-" + Math.floor(100000 + Math.random() * 900000));
          playSuccessChime();
          setAdminMessage("");
          return 100;
        }
        // Digital blips during transmission
        if (prev % 20 === 0) {
          playSynthesizedTone([800 + prev * 2], 0.04, "sine", 0);
        }
        return prev + 10;
      });
    }, 100);
  };

  // Solid theme colors config mapping for icons
  const themeAccentHex = currentTheme === "blue" ? "#00D1FF" : currentTheme === "green" ? "#10b981" : "#ec4899";

  return (
    <>
      {/* Floating profile drawer trigger button - FIXED AT THE SIDE */}
      <div className="fixed right-4 top-20 z-40">
        <button
          onClick={() => { playClick(); setIsOpen(true); }}
          className="group relative flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-[#0c0f1e]/85 shadow-2xl backdrop-blur-md cursor-pointer transition-all duration-300 hover:scale-110 active:scale-95"
          style={{
            boxShadow: `0 0 16px ${themeAccentHex}33, inset 0 0 8px ${themeAccentHex}22`,
            borderColor: `${themeAccentHex}44`
          }}
        >
          {/* Glowing particle ring around trigger */}
          <span className="absolute inset-0 rounded-full border border-dashed animate-spin opacity-40 duration-[15s]" style={{ borderColor: themeAccentHex }} />
          
          {user?.user_metadata?.avatar_url ? (
            <img 
              src={user.user_metadata.avatar_url} 
              alt="Profile" 
              className="h-9 w-9 rounded-full border" 
              style={{ borderColor: `${themeAccentHex}55` }}
            />
          ) : (
            <User className="h-5 w-5" style={{ color: themeAccentHex }} />
          )}

          {/* Online neon dot */}
          {user && (
            <span className="absolute -right-0.5 -bottom-0.5 h-3.5 w-3.5 rounded-full border-2 border-[#0B0F1A] bg-emerald-500 animate-pulse" />
          )}
          
          {/* Mini Monospace tooltip */}
          <span className="absolute right-14 scale-0 group-hover:scale-100 rounded-md border border-white/10 bg-[#070b16] px-2 py-1 text-[10px] font-bold font-mono text-slate-300 transition-all duration-200 shadow-xl">
            PROFIL
          </span>
        </button>
      </div>

      {/* Backdrop overlay */}
      {isOpen && (
        <div 
          onClick={() => { playClick(); setIsOpen(false); }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-300 animate-fade-in"
        />
      )}

      {/* Futuristic Drawer Panel */}
      <div 
        className={`fixed inset-y-0 right-0 z-50 w-80 sm:w-96 border-l border-white/10 bg-[#070b16]/95 backdrop-blur-2xl shadow-2xl p-6 flex flex-col transition-transform duration-500 ease-out select-none
          ${isOpen ? "translate-x-0" : "translate-x-full"}
        `}
      >
        {/* Holographic scanner top aesthetic lines */}
        <div className="absolute top-0 left-0 w-full h-[2px] opacity-60" style={{ background: `linear-gradient(to right, transparent, ${themeAccentHex}, transparent)` }} />
        
        {/* Header section with X Close */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full animate-ping" style={{ backgroundColor: themeAccentHex }} />
            <h3 className="font-mono text-xs font-black uppercase tracking-[0.2em] text-white">
              Kiber Profil & Sozlamalar
            </h3>
          </div>
          <button 
            onClick={() => { playClick(); setIsOpen(false); }}
            className="rounded-lg border border-white/10 p-1.5 text-slate-400 hover:text-white hover:bg-white/5 transition duration-300 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable contents wrapper */}
        <div className="flex-1 overflow-y-auto space-y-6 pr-1 custom-scrollbar">
          
          {/* 1. DIGITAL ID PROFILE CARD */}
          <div className="relative rounded-2xl border border-white/10 bg-white/[0.02] p-4 overflow-hidden">
            {/* Cyber Corner decorations */}
            <span className="absolute top-0 left-0 h-2 w-2 border-t border-l border-white/30" />
            <span className="absolute top-0 right-0 h-2 w-2 border-t border-r border-white/30" />
            <span className="absolute bottom-0 left-0 h-2 w-2 border-b border-l border-white/30" />
            <span className="absolute bottom-0 right-0 h-2 w-2 border-b border-r border-white/30" />

            {/* Matrix styled background design */}
            <div className="absolute -right-6 -bottom-6 font-mono text-[60px] font-black opacity-5 select-none pointer-events-none">ID</div>

            {user ? (
              <div className="space-y-4">
                {/* ID badge card body */}
                <div className="flex items-center gap-3.5">
                  <div className="relative">
                    {user.user_metadata?.avatar_url ? (
                      <img 
                        src={user.user_metadata.avatar_url} 
                        alt="Avatar" 
                        className="h-14 w-14 rounded-xl border border-dashed p-1 bg-white/5"
                        style={{ borderColor: themeAccentHex }}
                      />
                    ) : (
                      <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-[#00D1FF]/20 to-[#6C63FF]/20 flex items-center justify-center border border-white/10">
                        <User className="h-6 w-6 text-white" />
                      </div>
                    )}
                    <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[8px] font-bold text-white border border-[#070b16]">
                      ✓
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-white truncate">{user.user_metadata?.full_name || "O'quvchi"}</p>
                    <p className="text-[10px] text-slate-500 font-mono truncate mt-0.5">{user.email}</p>
                    <div className="flex items-center gap-1.5 mt-2 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full w-max">
                      <Shield className="h-3 w-3 text-emerald-400" />
                      <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest">Active student</span>
                    </div>
                  </div>
                </div>

                {/* Cyber statistics strip */}
                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/5 font-mono text-center">
                  <div className="bg-white/[0.02] border border-white/5 p-2 rounded-xl">
                    <p className="text-[8px] text-slate-500 uppercase tracking-wider">Mening XP</p>
                    <p className="text-sm font-black text-white mt-1 flex items-center justify-center gap-0.5" style={{ color: themeAccentHex }}>
                      <Sparkles className="h-3 w-3" /> {stats.points}
                    </p>
                  </div>
                  <div className="bg-white/[0.02] border border-white/5 p-2 rounded-xl">
                    <p className="text-[8px] text-slate-500 uppercase tracking-wider">Badjlar</p>
                    <p className="text-sm font-black text-white mt-1 flex items-center justify-center gap-0.5">
                      <Award className="h-3 w-3 text-amber-500" /> {stats.unlockedBadgesCount}
                    </p>
                  </div>
                  <div className="bg-white/[0.02] border border-white/5 p-2 rounded-xl">
                    <p className="text-[8px] text-slate-500 uppercase tracking-wider">Sertifikat</p>
                    <p className={`text-[10px] font-bold mt-2 truncate flex items-center justify-center gap-0.5 ${stats.certificateUnlocked ? "text-emerald-400" : "text-slate-500"}`}>
                      {stats.certificateUnlocked ? "FAOL ✓" : "QULFLI 🔒"}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 space-y-4">
                <div className="mx-auto h-11 w-11 rounded-xl bg-white/[0.02] border border-white/10 flex items-center justify-center">
                  <User className="h-5 w-5 text-slate-500" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-black text-white uppercase tracking-wider">Profil aniqlanmadi</p>
                  <p className="text-[10px] text-slate-500 leading-relaxed px-2">Vazifalar yozilishi va sertifikat yuklanishi uchun tizimga kiring.</p>
                </div>
                <button
                  onClick={handleGoogleLogin}
                  className="mx-auto flex items-center gap-2 rounded-xl border px-4 py-2 text-xs font-bold text-black bg-white hover:brightness-90 transition cursor-pointer shadow-lg shadow-white/5"
                >
                  <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="h-4 w-4" alt="Google" />
                  Gmail orqali kirish
                </button>
              </div>
            )}
          </div>

          {/* 2. TIZIM SOZLAMALARI (SYSTEM SETTINGS) */}
          <div className="space-y-3.5">
            <div className="flex items-center gap-2 px-1">
              <Settings className="h-3.5 w-3.5" style={{ color: themeAccentHex }} />
              <span className="font-mono text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
                Tizim Sozlamalari
              </span>
            </div>

            <div className="space-y-2 rounded-2xl border border-white/5 bg-white/[0.01] p-4">
              {/* Color Themes */}
              <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <span className="text-xs font-semibold text-slate-300">Tizim mavzusi</span>
                <div className="flex gap-2.5">
                  {(["blue", "green", "pink"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => changeTheme(t)}
                      className="h-5 w-5 rounded-full border-2 transition-transform duration-300 hover:scale-125 cursor-pointer"
                      style={{
                        backgroundColor: t === "blue" ? "#00D1FF" : t === "green" ? "#10b981" : "#ec4899",
                        borderColor: currentTheme === t ? "white" : "transparent",
                        boxShadow: currentTheme === t ? `0 0 10px ${t === "blue" ? "#00D1FF" : t === "green" ? "#10b981" : "#ec4899"}` : "none",
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Sound Toggle */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs font-semibold text-slate-300">Retro tovushlar</span>
                <button
                  onClick={toggleSound}
                  className={`flex h-7 w-12 items-center rounded-full p-0.5 transition-colors duration-300 cursor-pointer ${soundMuted ? "bg-white/10" : ""}`}
                  style={{ backgroundColor: !soundMuted ? themeAccentHex : undefined }}
                >
                  <div
                    className={`h-6 w-6 rounded-full bg-slate-900 shadow-md transform transition-transform duration-300 flex items-center justify-center border border-white/10 ${
                      soundMuted ? "translate-x-0" : "translate-x-5"
                    }`}
                  >
                    {soundMuted ? (
                      <VolumeX className="h-3 w-3 text-slate-500" />
                    ) : (
                      <Volume2 className="h-3 w-3" style={{ color: themeAccentHex }} />
                    )}
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* 3. ADMINGA MUROJAAT (CONTACT ADMIN) */}
          <div className="space-y-3.5">
            <div className="flex items-center gap-2 px-1">
              <MessageSquare className="h-3.5 w-3.5" style={{ color: themeAccentHex }} />
              <span className="font-mono text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
                Adminga Murojaat
              </span>
            </div>

            <div className="rounded-2xl border border-white/5 bg-white/[0.01] p-4 space-y-4">
              {transmissionState === "idle" && (
                <form onSubmit={handleAdminSubmit} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">
                      Maktub matni
                    </label>
                    <textarea
                      value={adminMessage}
                      onChange={(e) => setAdminMessage(e.target.value)}
                      placeholder="// Savolingiz yoki murojaatingizni yozing..."
                      rows={3}
                      className="w-full rounded-xl border border-white/10 bg-white/5 p-3 font-mono text-xs text-white placeholder-slate-600 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/20 transition duration-300 resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!adminMessage.trim()}
                    className="w-full relative group flex items-center justify-center gap-1.5 rounded-xl py-2 px-4 text-xs font-black uppercase tracking-wider transition-all duration-300 cursor-pointer overflow-hidden border border-white/10 disabled:opacity-40 disabled:pointer-events-none"
                    style={{
                      background: adminMessage.trim() ? `linear-gradient(to right, ${themeAccentHex}22, ${themeAccentHex}05)` : "rgba(255,255,255,0.02)",
                      borderColor: adminMessage.trim() ? themeAccentHex : "rgba(255,255,255,0.1)",
                      color: adminMessage.trim() ? "white" : "rgba(255,255,255,0.3)"
                    }}
                  >
                    <Send className="h-3.5 w-3.5" />
                    Maktubni yuborish
                    {adminMessage.trim() && (
                      <span className="absolute left-0 w-full h-[1.5px] bottom-0 animate-laser-sweep" style={{ background: `linear-gradient(to right, transparent, ${themeAccentHex}, transparent)` }} />
                    )}
                  </button>
                </form>
              )}

              {/* Holographic transmitting state */}
              {transmissionState === "sending" && (
                <div className="py-6 text-center space-y-4 font-mono">
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/10 p-0.5">
                    <div 
                      className="h-full rounded-full transition-all duration-100 ease-out"
                      style={{ 
                        width: `${transmissionProgress}%`,
                        backgroundColor: themeAccentHex,
                        boxShadow: `0 0 10px ${themeAccentHex}`
                      }}
                    />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest animate-pulse">
                      Ulanish o&apos;rnatilmoqda...
                    </p>
                    <p className="text-[9px] text-slate-600">
                      TRANSMITTING PACKETS: {transmissionProgress}%
                    </p>
                  </div>
                </div>
              )}

              {/* Data transmitted success screen */}
              {transmissionState === "sent" && (
                <div className="py-4 text-center space-y-3.5 font-mono animate-success-pop">
                  <div className="mx-auto h-12 w-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6 text-emerald-400 animate-pulse" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-black text-white uppercase tracking-wider">Transmissiya muvaffaqiyatli!</h4>
                    <p className="text-[9px] text-slate-500 leading-relaxed px-2">
                      Maktub adminga yuborildi. Ulanish kodi:
                    </p>
                    <p className="text-[10px] font-bold mt-1 text-slate-300 bg-white/5 border border-white/10 py-1 px-3 rounded-lg w-max mx-auto">
                      {transmissionId}
                    </p>
                  </div>
                  <button
                    onClick={() => { playClick(); setTransmissionState("idle"); }}
                    className="text-[9px] font-bold uppercase tracking-widest text-[#00D1FF] hover:underline cursor-pointer"
                    style={{ color: themeAccentHex }}
                  >
                    Yangi maktub yuborish
                  </button>
                </div>
              )}

              {/* Direct Telegram link */}
              <a
                href="https://t.me/texnomarkaz_cyber" 
                target="_blank"
                rel="noreferrer"
                onClick={playClick}
                className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-4 py-2.5 text-xs font-bold text-slate-300 hover:text-white hover:bg-white/[0.04] transition duration-300"
              >
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#00D1FF] animate-pulse" />
                  Telegram orqali bog&apos;lanish
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-slate-500" />
              </a>
            </div>
          </div>

        </div>

        {/* Footer actions inside sidebar */}
        {user && (
          <div className="border-t border-white/10 pt-4 mt-4 space-y-4">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-rose-500/10 border border-rose-500/20 py-2.5 text-xs font-black uppercase tracking-wider text-rose-400 hover:bg-rose-500/20 transition cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              Tizimdan chiqish
            </button>
            
            <p className="text-[8px] font-mono text-center text-slate-600 tracking-wider">
              CYBER PORTAL v3.2.0 // SYSTEM ONLINE
            </p>
          </div>
        )}
      </div>
    </>
  );
}

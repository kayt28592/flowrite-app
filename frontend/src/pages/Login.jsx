import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import toast from "react-hot-toast";
import {
  X,
  Eye as EyeOn,
  EyeOff,
  LogIn,
  Shield,
  User,
  Lock
} from "lucide-react";

import { Logo } from "../components/ui/Logo";



export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Authentication successful");
      navigate("/");
    } catch (error) {
      toast.error("Invalid credentials");
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-background font-sans">

      {/* Background decoration */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/5 via-transparent to-primary/5" />
        <div className="absolute top-[15%] left-[5%] w-[600px] h-[600px] bg-primary/[0.03] rounded-full blur-[180px] animate-pulse" />
        <div className="absolute bottom-[15%] right-[5%] w-[600px] h-[600px] bg-primary/[0.03] rounded-full blur-[180px] animate-pulse delay-700" />
      </div>

      <div className="relative z-10 w-full max-w-[460px] animate-in fade-in zoom-in duration-500">
        <div className="bg-card/40 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.6)]">

          {/* Header */}
          <div className="p-10 pb-4 flex justify-between items-start">
            <div className="space-y-4">
              <Logo withText className="scale-110 origin-left" />
              <div className="flex items-center gap-2">
                <div className="h-[1px] w-4 bg-primary/30" />
                <p className="text-white/20 text-[9px] font-black uppercase tracking-[0.4em]">Protocol Restricted</p>
              </div>
            </div>
            <Link
              to="/"
              className="w-10 h-10 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-white/20 hover:text-white hover:bg-white/10 transition-all active:scale-90"
            >
              <X size={18} />
            </Link>
          </div>

          <div className="p-10 pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] ml-1" id="email-label">Access Identifying Token</label>
                <div className="relative group">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-primary transition-colors duration-300 pointer-events-none">
                    <User size={18} />
                  </div>
                  <input
                    type="email"
                    required
                    aria-labelledby="email-label"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full pl-14 pr-6 py-4.5 bg-white/[0.03] border border-white/5 rounded-2xl text-white placeholder:text-white/10 focus:border-primary/40 focus:bg-white/[0.06] focus:ring-4 focus:ring-primary/5 outline-none transition-all duration-300 font-medium tracking-tight"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] ml-1" id="pw-label">Verification Sequence</label>
                <div className="relative group">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-primary transition-colors duration-300 pointer-events-none">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showPw ? "text" : "password"}
                    required
                    aria-labelledby="pw-label"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-14 pr-14 py-4.5 bg-white/[0.03] border border-white/5 rounded-2xl text-white placeholder:text-white/10 focus:border-primary/40 focus:bg-white/[0.06] focus:ring-4 focus:ring-primary/5 outline-none transition-all duration-300 font-medium tracking-tight"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    aria-label={showPw ? "Hide password" : "Show password"}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-white/10 hover:text-white transition-colors duration-200 focus:outline-none"
                  >
                    {showPw ? <EyeOff size={18} /> : <EyeOn size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full !py-5 !rounded-2xl shadow-2xl shadow-primary/20 mt-6"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                ) : (
                  <div className="flex items-center gap-2">
                    <LogIn size={20} />
                    AUTHORIZE CONNECTION
                  </div>
                )}
              </button>
            </form>


          </div>
        </div>

        <div className="mt-10 flex flex-col items-center gap-4 opacity-10 hover:opacity-100 transition-all duration-1000">
          <Logo iconOnly className="h-6" />
          <p className="text-[8px] text-center text-white/20 font-black uppercase tracking-[0.8em]">
            System Core Authentication © 2026
          </p>
        </div>
      </div>
    </div>
  );
}

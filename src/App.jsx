import { useState, useEffect } from "react";
import { supabase } from "./supabase";

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  pending:     { label:"Pending",     color:"#f59e0b", bg:"#fef3c7" },
  assigned:    { label:"Assigned",    color:"#3b82f6", bg:"#dbeafe" },
  in_progress: { label:"In Progress", color:"#8b5cf6", bg:"#ede9fe" },
  completed:   { label:"Completed",   color:"#10b981", bg:"#d1fae5" },
  cancelled:   { label:"Cancelled",   color:"#ef4444", bg:"#fee2e2" },
};

function timeAgo(iso) {
  const diff = (Date.now() - new Date(iso)) / 60000;
  if (diff < 1) return "just now";
  if (diff < 60) return `${Math.floor(diff)}m ago`;
  return `${Math.floor(diff / 60)}h ago`;
}

// ─── ICONS ───────────────────────────────────────────────────────────────────
const Icon = ({ name, size=20, color="currentColor" }) => {
  const icons = {
    home:     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />,
    bike:     <><circle cx="5.5" cy="17.5" r="3.5" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}/><circle cx="18.5" cy="17.5" r="3.5" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 6h-5l-3 5.5m0 0L5.5 17.5M7 11.5h7l3.5 6"/></>,
    list:     <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}/></>,
    money:    <><rect x="2" y="7" width="20" height="14" rx="2" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 3H8a2 2 0 00-2 2v2h12V5a2 2 0 00-2-2z"/></>,
    user:     <><circle cx="12" cy="8" r="4" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 21a8 8 0 10-16 0"/></>,
    check:    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>,
    x:        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 6L6 18M6 6l12 12"/>,
    arrow:    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14m-7-7l7 7-7 7"/>,
    back:     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 12H5m7-7l-7 7 7 7"/>,
    loc:      <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}/></>,
    phone:    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/>,
    bell:     <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.73 21a2 2 0 01-3.46 0"/></>,
    settings: <><circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></>,
    star:     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>,
    msg:      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} style={{ display:"inline-block", flexShrink:0 }}>
      {icons[name]}
    </svg>
  );
};

const Avatar = ({ initials, size=40, color="#1a6b3a" }) => (
  <div style={{ width:size, height:size, borderRadius:"50%", background:color, color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:size*0.35, flexShrink:0 }}>
    {initials}
  </div>
);

const Badge = ({ status }) => {
  const cfg = STATUS_CONFIG[status];
  if (!cfg) return null;
  return (
    <span style={{ fontSize:11, fontWeight:600, padding:"3px 8px", borderRadius:20, color:cfg.color, background:cfg.bg }}>
      {cfg.label}
    </span>
  );
};

const Btn = ({ children, onClick, color="#1a6b3a", full, outline, small, disabled }) => (
  <button onClick={onClick} disabled={disabled}
    style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:6, width:full?"100%":"auto", padding:small?"8px 14px":"13px 20px", background:outline?"transparent":(disabled?"#d1d5db":color), color:outline?color:"#fff", border:`2px solid ${outline?color:"transparent"}`, borderRadius:12, fontSize:small?13:15, fontWeight:700, cursor:disabled?"not-allowed":"pointer", opacity:disabled?0.7:1 }}>
    {children}
  </button>
);

const Input = ({ label, value, onChange, placeholder, type="text", required }) => (
  <div style={{ marginBottom:14 }}>
    {label && <label style={{ display:"block", fontSize:13, fontWeight:600, marginBottom:6, color:"#374151" }}>{label}{required&&" *"}</label>}
    <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
      style={{ width:"100%", padding:"11px 14px", border:"1.5px solid #e5e7eb", borderRadius:10, fontSize:14, outline:"none", boxSizing:"border-box", background:"#fafafa" }} />
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// AUTH SCREEN
// ═══════════════════════════════════════════════════════════════════════════════

function RiderAuthScreen() {
  const [authMode,    setAuthMode]    = useState("login");
  const [loginMethod, setLoginMethod] = useState("magic");
  const [email,       setEmail]       = useState("");
  const [phone,       setPhone]       = useState("");
  const [fullName,    setFullName]    = useState("");
  const [otp,         setOtp]         = useState("");
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState("");
  const [message,     setMessage]     = useState("");
  const [sent,        setSent]        = useState(false);

  const clear = () => { setError(""); setMessage(""); };

  const handleSend = async () => {
    if (!email) return setError("Please enter your email address");
    if (authMode==="signup" && (!fullName||!phone)) return setError("Please fill in all fields");
    setLoading(true); clear();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: authMode==="signup",
        emailRedirectTo: window.location.origin,
        data: authMode==="signup" ? { full_name:fullName, phone, role:"rider" } : {},
      }
    });
    if (error) setError(error.message);
    else { setSent(true); setMessage(loginMethod==="magic" ? `Magic link sent to ${email}` : `6-digit code sent to ${email}`); }
    setLoading(false);
  };

  const handleVerify = async () => {
    if (otp.length < 6) return setError("Enter the full 6-digit code");
    setLoading(true); clear();
    const { error } = await supabase.auth.verifyOtp({ email, token:otp, type:"email" });
    if (error) setError("Invalid or expired code. Try resending.");
    setLoading(false);
  };

  const handleResend = async () => {
    setOtp(""); clear();
    await supabase.auth.signInWithOtp({ email, options:{ shouldCreateUser:false, emailRedirectTo:window.location.origin } });
    setMessage("New email sent — check your inbox and spam");
  };

  return (
    <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", background:"#f8faf8", fontFamily:"'DM Sans', sans-serif" }}>

      {/* Banner */}
      <div style={{ background:"linear-gradient(135deg, #1a1d27 0%, #2a2d3a 100%)", padding:"50px 24px 36px", textAlign:"center" }}>
        <div style={{ width:70, height:70, borderRadius:20, background:"rgba(255,255,255,0.1)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px", fontSize:36 }}>🏍️</div>
        <div style={{ fontSize:26, fontWeight:800, color:"#fff", marginBottom:4 }}>ErrandEase Rider</div>
        <div style={{ fontSize:13, color:"#9ca3af" }}>Delivery partner portal</div>
      </div>

      <div style={{ flex:1, padding:"24px 20px 40px", maxWidth:400, margin:"0 auto", width:"100%", boxSizing:"border-box" }}>

        {/* Tab Toggle */}
        {!sent && (
          <div style={{ display:"flex", background:"#f3f4f6", borderRadius:12, padding:4, marginBottom:20 }}>
            {[["login","Log In"],["signup","Sign Up"]].map(([m,label])=>(
              <button key={m} onClick={()=>{ setAuthMode(m); clear(); setSent(false); }}
                style={{ flex:1, padding:"10px", border:"none", borderRadius:10, background:authMode===m?"#fff":"transparent", color:authMode===m?"#111827":"#6b7280", fontWeight:700, fontSize:14, cursor:"pointer" }}>
                {label}
              </button>
            ))}
          </div>
        )}

        {/* Errors & Messages */}
        {error   && <div style={{ background:"#fee2e2", border:"1px solid #fca5a5", borderRadius:10, padding:"10px 14px", marginBottom:14, fontSize:13, color:"#dc2626", fontWeight:600 }}>⚠️ {error}</div>}
        {message && <div style={{ background:"#f0fdf4", border:"1px solid #86efac", borderRadius:10, padding:"10px 14px", marginBottom:14, fontSize:13, color:"#1a6b3a", fontWeight:600 }}>✅ {message}</div>}

        {/* Login Method Toggle */}
        {!sent && (
          <div style={{ marginBottom:16 }}>
            <div style={{ fontSize:12, fontWeight:700, color:"#6b7280", marginBottom:8, textTransform:"uppercase" }}>Login Method</div>
            <div style={{ display:"flex", gap:8 }}>
              {[{val:"magic",icon:"🔗",label:"Magic Link"},{val:"otp",icon:"🔢",label:"OTP Code"}].map(opt=>(
                <div key={opt.val} onClick={()=>setLoginMethod(opt.val)}
                  style={{ flex:1, border:`2px solid ${loginMethod===opt.val?"#1a1d27":"#e5e7eb"}`, borderRadius:12, padding:"10px 8px", cursor:"pointer", textAlign:"center", background:loginMethod===opt.val?"#1a1d2710":"#fff" }}>
                  <div style={{ fontSize:20, marginBottom:4 }}>{opt.icon}</div>
                  <div style={{ fontSize:12, fontWeight:700, color:loginMethod===opt.val?"#1a1d27":"#374151" }}>{opt.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Form Fields */}
        {!sent && (
          <div>
            {authMode==="signup" && (
              <>
                <Input label="Full Name"     value={fullName} onChange={setFullName} placeholder="e.g. James Kariuki" required />
                <Input label="Phone Number"  value={phone}    onChange={setPhone}    placeholder="+254 7XX XXX XXX"   required />
              </>
            )}
            <Input label="Email Address" value={email} onChange={setEmail} placeholder="you@example.com" type="email" required />
            <Btn full color="#1a1d27" onClick={handleSend} disabled={loading||!email}>
              {loading?"Sending...":<><span>{authMode==="signup"?"Create Rider Account":"Send Login "+(loginMethod==="magic"?"Link":"Code")}</span><Icon name="arrow" size={16} color="#fff"/></>}
            </Btn>
          </div>
        )}

        {/* Sent Screen */}
        {sent && (
          <div>
            <div style={{ textAlign:"center", marginBottom:24 }}>
              <div style={{ fontSize:52, marginBottom:12 }}>{loginMethod==="magic"?"🔗":"📧"}</div>
              <div style={{ fontSize:20, fontWeight:800, marginBottom:6 }}>Check Your Email</div>
              <div style={{ fontSize:13, color:"#6b7280" }}>{loginMethod==="magic"?"Click the link in your email":"Enter the 6-digit code below"}</div>
              <div style={{ fontSize:14, fontWeight:700, color:"#1a6b3a", marginTop:4 }}>{email}</div>
            </div>

            {/* Magic Link Steps */}
            {loginMethod==="magic" && (
              <div style={{ background:"#f9fafb", borderRadius:14, padding:16, marginBottom:16 }}>
                {["1. Open your email inbox","2. Find the ErrandEase Rider email","3. Click the login link","4. You'll be logged in automatically","5. Check spam if not in inbox"].map(step=>(
                  <div key={step} style={{ fontSize:13, color:"#374151", marginBottom:6 }}>✓ {step}</div>
                ))}
              </div>
            )}

            {/* OTP Entry */}
            {loginMethod==="otp" && (
              <div style={{ marginBottom:16 }}>
                <label style={{ display:"block", fontSize:13, fontWeight:600, marginBottom:8, color:"#374151" }}>Enter 6-Digit Code</label>
                <input value={otp} onChange={e=>{ setOtp(e.target.value.replace(/\D/g,"")); setError(""); }} maxLength={6} placeholder="000000" type="number"
                  style={{ width:"100%", padding:16, border:"2px solid #e5e7eb", borderRadius:12, fontSize:28, fontWeight:800, letterSpacing:8, textAlign:"center", outline:"none", boxSizing:"border-box" }} />
                <div style={{ marginTop:10 }}>
                  <Btn full color="#1a1d27" onClick={handleVerify} disabled={loading||otp.length<6}>
                    {loading?"Verifying...":<><Icon name="check" size={16} color="#fff"/> Verify & Log In</>}
                  </Btn>
                </div>
              </div>
            )}

            <div style={{ textAlign:"center", marginTop:16 }}>
              <span onClick={handleResend} style={{ fontSize:13, color:"#1a6b3a", fontWeight:700, cursor:"pointer" }}>Resend Email</span>
              <span style={{ fontSize:13, color:"#d1d5db", margin:"0 8px" }}>|</span>
              <span onClick={()=>{ setLoginMethod(loginMethod==="magic"?"otp":"magic"); setOtp(""); clear(); }}
                style={{ fontSize:13, color:"#6b7280", fontWeight:600, cursor:"pointer" }}>
                Switch to {loginMethod==="magic"?"OTP Code":"Magic Link"}
              </span>
            </div>
            <button onClick={()=>{ setSent(false); setOtp(""); clear(); }}
              style={{ display:"flex", alignItems:"center", gap:6, border:"none", background:"transparent", color:"#9ca3af", fontSize:12, cursor:"pointer", margin:"16px auto 0", padding:0 }}>
              <Icon name="back" size={14} color="#9ca3af"/> Use different email
            </button>
          </div>
        )}

        {!sent && (
          <div style={{ marginTop:20, fontSize:11, color:"#9ca3af", textAlign:"center", lineHeight:1.6 }}>
            By continuing you agree to ErrandEase's Terms of Service and Privacy Policy
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// RIDER DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════

function RiderDashboard({ session, profile, onLogout }) {
  const [tab,      setTab]      = useState("active");
  const [errands,  setErrands]  = useState([]);
  const [riders,   setRiders]   = useState([]);
  const [saving,   setSaving]   = useState(false);
  const [loading,  setLoading]  = useState(true);
  const [selected, setSelected] = useState(null);

  // Load data on mount
  useEffect(() => {
    loadData();
    // Refresh every 30 seconds
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [{ data:r },{ data:e }] = await Promise.all([
        supabase.from("riders").select("*"),
        supabase.from("errands").select("*").order("created_at", { ascending:false }),
      ]);
      if (r) setRiders(r.map(x=>({ id:x.id, name:x.name, phone:x.phone, zone:x.zone, status:x.status, rating:x.rating, completedJobs:x.completed_jobs, avatar:x.avatar })));
      if (e) setErrands(e.map(x=>({ id:x.id, title:x.title, type:x.type, customer:x.customer, customerPhone:x.customer_phone, pickupLocation:x.pickup_location, dropLocation:x.drop_location, status:x.status, riderId:x.rider_id, amount:x.amount, createdAt:x.created_at, priority:x.priority, notes:x.notes, fromShop:x.from_shop, shopName:x.shop_name, shopEmoji:x.shop_emoji })));
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  // Find my rider record by matching phone
  const myRider = riders.find(r => r.phone === profile?.phone);
  const myRiderId = myRider?.id;

  // My jobs
  const myJobs       = errands.filter(e => e.riderId === myRiderId);
  const activeJob    = myJobs.find(e => ["assigned","in_progress"].includes(e.status));
  const completedJobs = myJobs.filter(e => e.status === "completed");

  // Available pool
  const availableJobs = errands.filter(e => e.status === "pending" && !e.riderId);

  // Earnings
  const todayStr       = new Date().toDateString();
  const weekAgo        = Date.now() - 7*24*60*60*1000;
  const todayEarnings  = completedJobs.filter(e=>new Date(e.createdAt).toDateString()===todayStr).reduce((s,e)=>s+e.amount,0);
  const weeklyEarnings = completedJobs.filter(e=>new Date(e.createdAt)>new Date(weekAgo)).reduce((s,e)=>s+e.amount,0);
  const totalEarnings  = completedJobs.reduce((s,e)=>s+e.amount,0);

  const navItems = [
    { id:"active",   icon:"bike",  label:"Active" },
    { id:"jobs",     icon:"list",  label:"Jobs" },
    { id:"earnings", icon:"money", label:"Earnings" },
    { id:"profile",  icon:"user",  label:"Profile" },
  ];

  const acceptJob = async (errand) => {
    if (!myRiderId || activeJob) return;
    setSaving(true);
    await supabase.from("errands").update({ status:"assigned", rider_id:myRiderId }).eq("id", errand.id);
    await supabase.from("riders").update({ status:"on_errand" }).eq("id", myRiderId);
    await loadData();
    setSaving(false);
    setTab("active");
  };

  const updateJobStatus = async (errandId, status) => {
    setSaving(true);
    await supabase.from("errands").update({ status }).eq("id", errandId);
    if (status==="completed" && myRiderId) {
      await supabase.from("riders").update({ status:"available", completed_jobs:(myRider?.completedJobs||0)+1 }).eq("id", myRiderId);
    }
    if (status==="pending") {
      await supabase.from("errands").update({ rider_id:null }).eq("id", errandId);
      if (myRiderId) await supabase.from("riders").update({ status:"available" }).eq("id", myRiderId);
    }
    await loadData();
    setSaving(false);
    setSelected(null);
  };

  const updateStatus = async (status) => {
    if (!myRiderId) return;
    await supabase.from("riders").update({ status }).eq("id", myRiderId);
    await loadData();
  };

  const initials = profile?.full_name?.split(" ").map(n=>n[0]).join("").slice(0,2).toUpperCase() || "RD";

  if (loading) return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:"100vh", background:"#f8faf8" }}>
      <div style={{ fontSize:48, marginBottom:16 }}>🏍️</div>
      <div style={{ fontSize:18, fontWeight:700, color:"#111827", marginBottom:8 }}>Loading your dashboard...</div>
      <div style={{ width:36, height:36, border:"4px solid #e5e7eb", borderTop:"4px solid #1a1d27", borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
    </div>
  );

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100vh", background:"#f8faf8", fontFamily:"'DM Sans', sans-serif", maxWidth:480, margin:"0 auto", position:"relative" }}>

      {/* Saving Overlay */}
      {saving && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", zIndex:900, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <div style={{ background:"#fff", borderRadius:16, padding:"20px 32px", display:"flex", flexDirection:"column", alignItems:"center", gap:12 }}>
            <div style={{ width:32, height:32, border:"3px solid #e5e7eb", borderTop:"3px solid #1a1d27", borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
            <div style={{ fontSize:14, fontWeight:600 }}>Saving...</div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ flexShrink:0, background:"linear-gradient(135deg, #1a1d27 0%, #2a2d3a 100%)", padding:"16px 20px 14px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div>
          <div style={{ fontSize:11, color:"#6b7280", textTransform:"uppercase", letterSpacing:1 }}>Rider Dashboard</div>
          <div style={{ fontSize:18, fontWeight:700, color:"#fff" }}>{profile?.full_name || "Rider"}</div>
        </div>
        <div style={{ display:"flex", gap:10, alignItems:"center" }}>
          <div style={{ textAlign:"right" }}>
            <div style={{ fontSize:10, color:"#6b7280" }}>STATUS</div>
            <div style={{ fontSize:12, fontWeight:700, color: myRider?.status==="available"?"#10b981":myRider?.status==="on_errand"?"#f59e0b":"#6b7280" }}>
              {myRider?.status==="available"?"🟢 Available":myRider?.status==="on_errand"?"🟡 On Errand":"⚫ Offline"}
            </div>
          </div>
          <Avatar initials={initials} size={38} color="rgba(255,255,255,0.15)" />
        </div>
      </div>

      {/* Body */}
      <div style={{ flex:1, overflowY:"auto", overflowX:"hidden", WebkitOverflowScrolling:"touch" }}>

        {/* ── ACTIVE JOB ── */}
        {tab==="active" && (
          <div style={{ padding:16 }}>

            {activeJob ? (
              <div>
                {/* Status Progress */}
                <div style={{ background:"#fff", borderRadius:14, padding:"14px 16px", marginBottom:12, boxShadow:"0 1px 6px rgba(0,0,0,0.06)" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                    <div style={{ fontWeight:700, fontSize:15 }}>Current Job</div>
                    <Badge status={activeJob.status} />
                  </div>
                  {/* Progress Bar */}
                  <div style={{ display:"flex", alignItems:"center", gap:4 }}>
                    {["assigned","in_progress","completed"].map((s,i)=>{
                      const steps = ["assigned","in_progress","completed"];
                      const cur   = steps.indexOf(activeJob.status);
                      const done  = i <= cur;
                      return (
                        <div key={s} style={{ display:"flex", alignItems:"center", flex:1 }}>
                          <div style={{ width:24, height:24, borderRadius:"50%", background:done?"#1a6b3a":"#e5e7eb", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                            {done ? <Icon name="check" size={12} color="#fff"/> : <div style={{ width:8, height:8, borderRadius:"50%", background:"#9ca3af" }} />}
                          </div>
                          {i < 2 && <div style={{ flex:1, height:2, background:i<cur?"#1a6b3a":"#e5e7eb" }} />}
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ display:"flex", justifyContent:"space-between", marginTop:6 }}>
                    {["Assigned","Picked Up","Delivered"].map(s=><span key={s} style={{ fontSize:10, color:"#9ca3af", fontWeight:600 }}>{s}</span>)}
                  </div>
                </div>

                {/* Job Card */}
                <div style={{ background:"#fff", borderRadius:16, overflow:"hidden", boxShadow:"0 2px 12px rgba(0,0,0,0.08)", marginBottom:12 }}>
                  <div style={{ background: activeJob.status==="assigned"?"#dbeafe":"#ede9fe", padding:"14px 16px" }}>
                    <div style={{ display:"flex", justifyContent:"space-between" }}>
                      <div style={{ fontSize:11, fontWeight:700, color:"#6b7280", textTransform:"uppercase" }}>{activeJob.type}</div>
                      {activeJob.priority==="urgent" && <span style={{ fontSize:10, fontWeight:700, color:"#ef4444", background:"#fee2e2", padding:"2px 6px", borderRadius:20 }}>⚡ URGENT</span>}
                    </div>
                    <div style={{ fontSize:18, fontWeight:800, color:"#111827", marginTop:4 }}>{activeJob.title}</div>
                    <div style={{ fontSize:12, color:"#6b7280", marginTop:4 }}>👤 {activeJob.customer}</div>
                    {activeJob.customerPhone && (
                      <a href={`tel:${activeJob.customerPhone}`}
                        style={{ display:"inline-flex", alignItems:"center", gap:4, marginTop:6, fontSize:12, color:"#1a6b3a", fontWeight:600, textDecoration:"none" }}>
                        <Icon name="phone" size={13} color="#1a6b3a"/> {activeJob.customerPhone}
                      </a>
                    )}
                  </div>

                  <div style={{ padding:"14px 16px" }}>
                    {/* Route */}
                    <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:14 }}>
                      <div style={{ display:"flex", gap:10, alignItems:"flex-start" }}>
                        <div style={{ width:32, height:32, borderRadius:8, background:"#f0fdf4", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                          <Icon name="loc" size={15} color="#1a6b3a" />
                        </div>
                        <div>
                          <div style={{ fontSize:10, color:"#9ca3af", fontWeight:700, textTransform:"uppercase" }}>Pickup From</div>
                          <div style={{ fontSize:14, fontWeight:600, color:"#111827" }}>{activeJob.pickupLocation}</div>
                        </div>
                      </div>
                      <div style={{ marginLeft:16, borderLeft:"2px dashed #e5e7eb", height:16 }} />
                      <div style={{ display:"flex", gap:10, alignItems:"flex-start" }}>
                        <div style={{ width:32, height:32, borderRadius:8, background:"#fef3c7", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                          <Icon name="arrow" size={15} color="#f59e0b" />
                        </div>
                        <div>
                          <div style={{ fontSize:10, color:"#9ca3af", fontWeight:700, textTransform:"uppercase" }}>Deliver To</div>
                          <div style={{ fontSize:14, fontWeight:600, color:"#111827" }}>{activeJob.dropLocation}</div>
                        </div>
                      </div>
                    </div>

                    {/* Notes */}
                    {activeJob.notes && (
                      <div style={{ background:"#f9fafb", borderRadius:10, padding:"10px 12px", marginBottom:14, fontSize:13, color:"#374151" }}>
                        <span style={{ fontWeight:700, color:"#6b7280" }}>Notes: </span>{activeJob.notes}
                      </div>
                    )}

                    {/* Payout */}
                    <div style={{ background:"#f0fdf4", borderRadius:12, padding:"12px 14px", marginBottom:14, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                      <span style={{ fontSize:13, color:"#6b7280", fontWeight:600 }}>Your Payout</span>
                      <span style={{ fontSize:22, fontWeight:800, color:"#1a6b3a" }}>KES {activeJob.amount}</span>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                      {activeJob.status==="assigned" && (
                        <Btn full color="#3b82f6" onClick={()=>updateJobStatus(activeJob.id,"in_progress")}>
                          <Icon name="loc" size={16} color="#fff"/> I'm at the Pickup Location
                        </Btn>
                      )}
                      {activeJob.status==="in_progress" && (
                        <Btn full color="#10b981" onClick={()=>updateJobStatus(activeJob.id,"completed")}>
                          <Icon name="check" size={16} color="#fff"/> Mark as Delivered ✓
                        </Btn>
                      )}
                      <Btn full color="#ef4444" outline onClick={()=>updateJobStatus(activeJob.id,"pending")}>
                        <Icon name="x" size={16} color="#ef4444"/> Can't Complete — Return Job
                      </Btn>
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div style={{ display:"flex", gap:8 }}>
                  {[
                    { label:"Today",    val:`KES ${todayEarnings}`, color:"#10b981" },
                    { label:"Jobs Done",val:completedJobs.length,   color:"#3b82f6" },
                    { label:"Rating",   val:`⭐ ${myRider?.rating||"New"}`, color:"#f59e0b" },
                  ].map(s=>(
                    <div key={s.label} style={{ flex:1, background:"#fff", borderRadius:12, padding:"10px 6px", textAlign:"center", boxShadow:"0 1px 4px rgba(0,0,0,0.06)" }}>
                      <div style={{ fontSize:13, fontWeight:800, color:s.color }}>{s.val}</div>
                      <div style={{ fontSize:10, color:"#9ca3af", fontWeight:600 }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                {/* No Active Job */}
                <div style={{ background:"#fff", borderRadius:16, padding:28, textAlign:"center", marginBottom:16, boxShadow:"0 1px 6px rgba(0,0,0,0.06)" }}>
                  <div style={{ fontSize:52, marginBottom:12 }}>🏍️</div>
                  <div style={{ fontSize:18, fontWeight:700, color:"#111827", marginBottom:6 }}>No Active Job</div>
                  <div style={{ fontSize:13, color:"#6b7280", marginBottom:20 }}>
                    {availableJobs.length > 0
                      ? `${availableJobs.length} job${availableJobs.length>1?"s":""} available to pick up`
                      : "Waiting for admin to assign a job..."}
                  </div>
                  {availableJobs.length > 0 && (
                    <Btn full color="#1a1d27" onClick={()=>setTab("jobs")}>
                      <Icon name="list" size={16} color="#fff"/> Browse Available Jobs
                    </Btn>
                  )}
                </div>

                {/* Stats */}
                <div style={{ display:"flex", gap:8, marginBottom:16 }}>
                  {[
                    { label:"Today",    val:`KES ${todayEarnings}`,  color:"#10b981" },
                    { label:"This Week",val:`KES ${weeklyEarnings}`, color:"#3b82f6" },
                    { label:"Jobs Done",val:completedJobs.length,    color:"#8b5cf6" },
                  ].map(s=>(
                    <div key={s.label} style={{ flex:1, background:"#fff", borderRadius:12, padding:"10px 6px", textAlign:"center", boxShadow:"0 1px 4px rgba(0,0,0,0.06)" }}>
                      <div style={{ fontSize:13, fontWeight:800, color:s.color }}>{s.val}</div>
                      <div style={{ fontSize:10, color:"#9ca3af", fontWeight:600 }}>{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Refresh Button */}
                <button onClick={loadData} style={{ width:"100%", border:"1.5px solid #e5e7eb", background:"#fff", borderRadius:12, padding:"12px", fontSize:14, fontWeight:600, color:"#6b7280", cursor:"pointer" }}>
                  🔄 Refresh Jobs
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── ALL JOBS ── */}
        {tab==="jobs" && (
          <div style={{ padding:16 }}>
            {/* My Current Jobs */}
            {myJobs.filter(e=>e.status!=="completed").length > 0 && (
              <>
                <div style={{ fontSize:12, fontWeight:700, color:"#6b7280", textTransform:"uppercase", letterSpacing:0.5, marginBottom:10 }}>My Jobs</div>
                {myJobs.filter(e=>e.status!=="completed").map(e=>(
                  <div key={e.id} onClick={()=>setTab("active")}
                    style={{ background:"#fff", borderRadius:14, padding:"14px 16px", marginBottom:10, boxShadow:"0 1px 6px rgba(0,0,0,0.06)", cursor:"pointer", borderLeft:`3px solid ${STATUS_CONFIG[e.status]?.color}` }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                      <div style={{ fontWeight:700, fontSize:14, flex:1, marginRight:8 }}>{e.title}</div>
                      <Badge status={e.status} />
                    </div>
                    <div style={{ fontSize:12, color:"#6b7280" }}>📍 {e.dropLocation}</div>
                    <div style={{ fontWeight:800, color:"#1a6b3a", marginTop:4, fontSize:14 }}>KES {e.amount}</div>
                  </div>
                ))}
                <div style={{ height:1, background:"#e5e7eb", margin:"16px 0" }} />
              </>
            )}

            {/* Available Pool */}
            <div style={{ fontSize:12, fontWeight:700, color:"#6b7280", textTransform:"uppercase", letterSpacing:0.5, marginBottom:10 }}>
              Available Jobs {availableJobs.length>0 && <span style={{ background:"#ef4444", color:"#fff", fontSize:10, fontWeight:800, padding:"2px 6px", borderRadius:10, marginLeft:4 }}>{availableJobs.length}</span>}
            </div>

            {availableJobs.length===0 ? (
              <div style={{ background:"#fff", borderRadius:14, padding:24, textAlign:"center", color:"#9ca3af" }}>
                <div style={{ fontSize:32, marginBottom:8 }}>📭</div>
                <div style={{ fontWeight:600 }}>No available jobs right now</div>
                <div style={{ fontSize:13 }}>Pull down to refresh</div>
              </div>
            ) : availableJobs.map(e=>(
              <div key={e.id} style={{ background:"#fff", borderRadius:14, padding:"14px 16px", marginBottom:10, boxShadow:"0 1px 6px rgba(0,0,0,0.06)", border:"1.5px solid #e5e7eb" }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                  <div style={{ fontWeight:700, fontSize:14, flex:1, marginRight:8 }}>{e.title}</div>
                  {e.priority==="urgent" && <span style={{ fontSize:10, fontWeight:700, color:"#ef4444", background:"#fee2e2", padding:"2px 6px", borderRadius:20 }}>⚡</span>}
                </div>
                <div style={{ fontSize:12, color:"#6b7280", marginBottom:2 }}>🏪 {e.pickupLocation}</div>
                <div style={{ fontSize:12, color:"#6b7280", marginBottom:8 }}>📍 {e.dropLocation}</div>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <span style={{ fontSize:16, fontWeight:800, color:"#1a6b3a" }}>KES {e.amount}</span>
                  <Btn small color="#1a1d27" disabled={!!activeJob||saving} onClick={()=>acceptJob(e)}>
                    {activeJob?"Busy":"Accept Job"}
                  </Btn>
                </div>
              </div>
            ))}

            {/* Completed Jobs */}
            {completedJobs.length > 0 && (
              <>
                <div style={{ height:1, background:"#e5e7eb", margin:"16px 0" }} />
                <div style={{ fontSize:12, fontWeight:700, color:"#6b7280", textTransform:"uppercase", letterSpacing:0.5, marginBottom:10 }}>Completed</div>
                {completedJobs.slice(0,10).map(e=>(
                  <div key={e.id} style={{ background:"#fff", borderRadius:12, padding:"12px 14px", marginBottom:8, display:"flex", justifyContent:"space-between", alignItems:"center", opacity:0.8 }}>
                    <div>
                      <div style={{ fontWeight:600, fontSize:13 }}>{e.title}</div>
                      <div style={{ fontSize:11, color:"#9ca3af" }}>{timeAgo(e.createdAt)}</div>
                    </div>
                    <span style={{ fontWeight:800, fontSize:14, color:"#10b981" }}>+KES {e.amount}</span>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {/* ── EARNINGS ── */}
        {tab==="earnings" && (
          <div style={{ padding:16 }}>
            <h3 style={{ margin:"0 0 16px", fontSize:20, fontWeight:700 }}>My Earnings</h3>

            {/* Earnings Cards */}
            <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:20 }}>
              {[
                { label:"Today",     val:todayEarnings,  color:"#10b981", bg:"#f0fdf4", icon:"☀️" },
                { label:"This Week", val:weeklyEarnings, color:"#3b82f6", bg:"#dbeafe", icon:"📅" },
                { label:"All Time",  val:totalEarnings,  color:"#8b5cf6", bg:"#ede9fe", icon:"🏆" },
              ].map(s=>(
                <div key={s.label} style={{ background:s.bg, borderRadius:14, padding:"18px 20px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <div>
                    <div style={{ fontSize:12, color:s.color, fontWeight:700, textTransform:"uppercase" }}>{s.icon} {s.label}</div>
                    <div style={{ fontSize:30, fontWeight:800, color:s.color, marginTop:4 }}>KES {s.val}</div>
                  </div>
                  <div style={{ fontSize:40 }}>{s.icon}</div>
                </div>
              ))}
            </div>

            {/* Performance */}
            <div style={{ background:"#fff", borderRadius:14, padding:"14px 16px", marginBottom:16, boxShadow:"0 1px 6px rgba(0,0,0,0.06)" }}>
              <div style={{ fontWeight:700, fontSize:15, marginBottom:12 }}>Performance</div>
              {[
                { label:"Jobs Completed", val:completedJobs.length },
                { label:"Rating",         val:`⭐ ${myRider?.rating||"New"}` },
                { label:"Zone",           val:myRider?.zone||"—" },
                { label:"Status",         val:myRider?.status||"—" },
              ].map(s=>(
                <div key={s.label} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:"1px solid #f3f4f6" }}>
                  <span style={{ fontSize:13, color:"#6b7280" }}>{s.label}</span>
                  <span style={{ fontSize:13, fontWeight:700, color:"#111827" }}>{s.val}</span>
                </div>
              ))}
            </div>

            {/* Recent Earnings */}
            {completedJobs.length > 0 && (
              <>
                <div style={{ fontSize:12, fontWeight:700, color:"#6b7280", textTransform:"uppercase", letterSpacing:0.5, marginBottom:10 }}>Recent Earnings</div>
                {completedJobs.slice(0,8).map(e=>(
                  <div key={e.id} style={{ background:"#fff", borderRadius:12, padding:"12px 14px", marginBottom:8, display:"flex", justifyContent:"space-between", alignItems:"center", boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>
                    <div>
                      <div style={{ fontWeight:600, fontSize:13 }}>{e.title}</div>
                      <div style={{ fontSize:11, color:"#9ca3af" }}>{timeAgo(e.createdAt)} • {e.dropLocation}</div>
                    </div>
                    <span style={{ fontWeight:800, fontSize:15, color:"#10b981" }}>+KES {e.amount}</span>
                  </div>
                ))}
              </>
            )}

            {completedJobs.length===0 && (
              <div style={{ textAlign:"center", padding:32, color:"#9ca3af" }}>
                <div style={{ fontSize:40, marginBottom:8 }}>💰</div>
                <div style={{ fontWeight:600 }}>No earnings yet</div>
                <div style={{ fontSize:13 }}>Accept and complete a job to start earning!</div>
              </div>
            )}
          </div>
        )}

        {/* ── PROFILE ── */}
        {tab==="profile" && (
          <div style={{ padding:16 }}>
            {/* Profile Header */}
            <div style={{ background:"linear-gradient(135deg, #1a1d27 0%, #2a2d3a 100%)", borderRadius:16, padding:"24px 20px", textAlign:"center", marginBottom:16 }}>
              <Avatar initials={initials} size={72} color="rgba(255,255,255,0.15)" />
              <div style={{ fontSize:20, fontWeight:700, color:"#fff", marginTop:10 }}>{profile?.full_name||"Rider"}</div>
              <div style={{ color:"#9ca3af", fontSize:13, marginTop:4 }}>{profile?.phone||""}</div>
              <div style={{ marginTop:8 }}>
                <span style={{ fontSize:12, fontWeight:700, padding:"4px 12px", borderRadius:20, background: myRider?.status==="available"?"#10b98130":"#6b728030", color:myRider?.status==="available"?"#10b981":"#9ca3af" }}>
                  {myRider?.status==="available"?"🟢 Available":myRider?.status==="on_errand"?"🟡 On Errand":"⚫ Offline"}
                </span>
              </div>
            </div>

            {/* Stats Row */}
            <div style={{ display:"flex", gap:8, marginBottom:16 }}>
              {[
                { label:"Completed", val:completedJobs.length,          color:"#10b981" },
                { label:"Rating",    val:`⭐ ${myRider?.rating||"New"}`, color:"#f59e0b" },
                { label:"Total",     val:`KES ${totalEarnings}`,         color:"#8b5cf6" },
              ].map(s=>(
                <div key={s.label} style={{ flex:1, background:"#fff", borderRadius:12, padding:"12px 6px", textAlign:"center", boxShadow:"0 1px 4px rgba(0,0,0,0.06)" }}>
                  <div style={{ fontSize:13, fontWeight:800, color:s.color }}>{s.val}</div>
                  <div style={{ fontSize:10, color:"#9ca3af" }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Status Toggle */}
            <div style={{ background:"#fff", borderRadius:14, padding:"14px 16px", marginBottom:12, boxShadow:"0 1px 6px rgba(0,0,0,0.06)" }}>
              <div style={{ fontWeight:700, fontSize:14, marginBottom:10 }}>My Availability</div>
              <div style={{ display:"flex", gap:8 }}>
                {[
                  { val:"available", label:"🟢 Go Online",  color:"#10b981" },
                  { val:"offline",   label:"⚫ Go Offline", color:"#6b7280" },
                ].map(s=>(
                  <div key={s.val} onClick={()=>updateStatus(s.val)}
                    style={{ flex:1, border:`2px solid ${myRider?.status===s.val?s.color:"#e5e7eb"}`, borderRadius:10, padding:"10px 8px", cursor:"pointer", textAlign:"center", background:myRider?.status===s.val?s.color+"15":"#fff", fontWeight:700, fontSize:12, color:myRider?.status===s.val?s.color:"#6b7280" }}>
                    {s.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Zone Info */}
            {myRider?.zone && (
              <div style={{ background:"#fff", borderRadius:12, padding:"14px 16px", marginBottom:8, display:"flex", alignItems:"center", gap:12 }}>
                <div style={{ width:36, height:36, borderRadius:10, background:"#f0fdf4", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <Icon name="loc" size={18} color="#1a6b3a" />
                </div>
                <div>
                  <div style={{ fontSize:12, color:"#9ca3af", fontWeight:600 }}>My Zone</div>
                  <div style={{ fontSize:14, fontWeight:700, color:"#111827" }}>{myRider.zone}</div>
                </div>
              </div>
            )}

            {[
              { icon:"bell",     label:"Notifications" },
              { icon:"settings", label:"Settings" },
            ].map(item=>(
              <div key={item.label} style={{ background:"#fff", borderRadius:12, padding:"14px 16px", marginBottom:8, display:"flex", alignItems:"center", gap:12, cursor:"pointer" }}>
                <div style={{ width:36, height:36, borderRadius:10, background:"#f0fdf4", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <Icon name={item.icon} size={18} color="#1a6b3a" />
                </div>
                <span style={{ fontWeight:600, fontSize:14, flex:1 }}>{item.label}</span>
                <Icon name="arrow" size={16} color="#9ca3af" />
              </div>
            ))}

            <div style={{ marginTop:16 }}>
              <Btn full color="#ef4444" outline onClick={onLogout}>Log Out</Btn>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Nav */}
      <div style={{ flexShrink:0, background:"#fff", borderTop:"1px solid #f0f0f0", display:"flex", padding:"10px 0 14px" }}>
        {navItems.map(n=>(
          <button key={n.id} onClick={()=>setTab(n.id)}
            style={{ flex:1, border:"none", background:"none", display:"flex", flexDirection:"column", alignItems:"center", gap:3, cursor:"pointer", padding:"4px 0", color:tab===n.id?"#1a1d27":"#9ca3af", position:"relative" }}>
            <Icon name={n.icon} size={22} color={tab===n.id?"#1a1d27":"#9ca3af"} />
            {n.id==="jobs" && availableJobs.length>0 && (
              <div style={{ position:"absolute", top:0, right:"18%", width:16, height:16, background:"#ef4444", borderRadius:"50%", fontSize:9, color:"#fff", fontWeight:800, display:"flex", alignItems:"center", justifyContent:"center" }}>{availableJobs.length}</div>
            )}
            <span style={{ fontSize:10, fontWeight:600 }}>{n.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════════════════════

export default function App() {
  const [session,  setSession]  = useState(null);
  const [profile,  setProfile]  = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const safety = setTimeout(() => setChecking(false), 5000);

    supabase.auth.getSession().then(({ data }) => {
      const sess = data?.session;
      if (sess) { setSession(sess); fetchProfile(sess.user.id); }
      else { clearTimeout(safety); setChecking(false); }
    }).catch(() => { clearTimeout(safety); setChecking(false); });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, sess) => {
      if (event==="SIGNED_IN" && sess) { setSession(sess); fetchProfile(sess.user.id); }
      if (event==="SIGNED_OUT") { setSession(null); setProfile(null); setChecking(false); }
    });

    return () => { subscription.unsubscribe(); clearTimeout(safety); };
  }, []);

  const fetchProfile = async (userId) => {
    try {
      const { data } = await supabase.from("profiles").select("*").eq("id", userId).single();
      if (data) setProfile(data);
    } catch (e) { console.error(e); }
    setChecking(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // Loading
  if (checking) return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:"100vh", background:"#1a1d27", fontFamily:"'DM Sans', sans-serif" }}>
      <div style={{ fontSize:52, marginBottom:16 }}>🏍️</div>
      <div style={{ fontSize:22, fontWeight:800, color:"#fff", marginBottom:8 }}>ErrandEase Rider</div>
      <div style={{ fontSize:14, color:"#6b7280", marginBottom:24 }}>Loading...</div>
      <div style={{ width:36, height:36, border:"4px solid #2a2d3a", borderTop:"4px solid #22d3ee", borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
    </div>
  );

  return (
    <div style={{ fontFamily:"'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #f8faf8; }
      `}</style>

      {/* Not logged in */}
      {!session && <RiderAuthScreen />}

      {/* Wrong role */}
      {session && profile && profile.role !== "rider" && (
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:"100vh", padding:24, textAlign:"center", background:"#f8faf8" }}>
          <div style={{ fontSize:48, marginBottom:12 }}>🚫</div>
          <div style={{ fontSize:20, fontWeight:700, marginBottom:8 }}>Access Denied</div>
          <div style={{ fontSize:13, color:"#6b7280", marginBottom:24 }}>This app is only for ErrandEase riders. Your account role is <strong>{profile.role}</strong>.</div>
          <Btn color="#ef4444" onClick={handleLogout}>Log Out</Btn>
        </div>
      )}

      {/* No profile yet */}
      {session && !profile && (
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:"100vh", padding:24, textAlign:"center" }}>
          <div style={{ fontSize:36, marginBottom:12 }}>⏳</div>
          <div style={{ fontSize:16, fontWeight:700, marginBottom:8 }}>Setting up your account...</div>
          <div style={{ fontSize:13, color:"#6b7280", marginBottom:20 }}>This takes just a moment</div>
          <Btn outline color="#6b7280" onClick={handleLogout}>Cancel</Btn>
        </div>
      )}

      {/* Rider Dashboard */}
      {session && profile?.role === "rider" && (
        <RiderDashboard session={session} profile={profile} onLogout={handleLogout} />
      )}
    </div>
  );
}
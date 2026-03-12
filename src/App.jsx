import { useState, useEffect, useRef } from "react";

// ============================================================
// LOGIN GATE
// ============================================================
const LOGIN_PASSWORD = "grit2024";

function LoginScreen({ onLogin }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  const handleSubmit = () => {
    if (password === LOGIN_PASSWORD) {
      onLogin();
    } else {
      setError(true);
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", background: "#0a0a0a", display: "flex",
      alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif"
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@800&family=DM+Sans:wght@300;400;500&display=swap');
        @keyframes shake { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-8px)} 40%,80%{transform:translateX(8px)} }
        .shake { animation: shake 0.4s ease; }
      `}</style>
      <div style={{
        background: "#141414", border: "1px solid #2a2a2a", borderRadius: "16px",
        padding: "48px 40px", width: "100%", maxWidth: "380px", textAlign: "center"
      }}>
        <div style={{
          fontFamily: "'Syne', sans-serif", fontSize: "32px", fontWeight: 800,
          letterSpacing: "-1px", marginBottom: "8px", color: "#f5f2ec"
        }}>
          GR<span style={{ color: "#e85d04" }}>IT</span>
        </div>
        <div style={{ color: "#6b6b6b", fontSize: "14px", marginBottom: "32px" }}>
          Recruiting Platform — Private Access
        </div>
        <div className={shake ? "shake" : ""}>
          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={e => { setPassword(e.target.value); setError(false); }}
            onKeyDown={e => e.key === "Enter" && handleSubmit()}
            style={{
              width: "100%", padding: "12px 16px", background: "#1a1a1a",
              border: `1px solid ${error ? "#ef4444" : "#2a2a2a"}`, borderRadius: "8px",
              color: "#f5f2ec", fontSize: "15px", outline: "none",
              marginBottom: "12px", boxSizing: "border-box"
            }}
          />
          {error && <div style={{ color: "#ef4444", fontSize: "13px", marginBottom: "12px" }}>
            Incorrect password
          </div>}
          <button
            onClick={handleSubmit}
            style={{
              width: "100%", padding: "12px", background: "#e85d04", border: "none",
              borderRadius: "8px", color: "white", fontSize: "15px", fontWeight: 600,
              cursor: "pointer", fontFamily: "'DM Sans', sans-serif"
            }}
          >
            Enter GRIT
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// CONFIG — point this at your backend URL
// ============================================================
const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

async function api(path, method = "GET", body = null) {
  const opts = { method, headers: { "Content-Type": "application/json" } };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${API}${path}`, opts);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "API error");
  return data;
}

// ============================================================
// STYLES
// ============================================================
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --black: #0a0a0a; --white: #f5f2ec; --orange: #e85d04; --amber: #f48c06;
    --muted: #6b6b6b; --card: #141414; --border: #2a2a2a;
    --success: #22c55e; --warn: #f59e0b; --danger: #ef4444; --blue: #3b82f6;
  }
  body { background: var(--black); color: var(--white); font-family: 'DM Sans', sans-serif; }
  .app { min-height: 100vh; display: flex; flex-direction: column; }
  .nav { display:flex; align-items:center; justify-content:space-between; padding:18px 40px; border-bottom:1px solid var(--border); position:sticky; top:0; z-index:100; background:rgba(10,10,10,0.96); backdrop-filter:blur(12px); }
  .logo { font-family:'Syne',sans-serif; font-size:26px; font-weight:800; letter-spacing:-1px; }
  .logo span { color:var(--orange); }
  .nav-tabs { display:flex; gap:4px; flex-wrap:wrap; }
  .nav-tab { padding:7px 16px; border-radius:6px; border:none; cursor:pointer; font-family:'DM Sans',sans-serif; font-size:13px; font-weight:500; background:transparent; color:var(--muted); transition:all 0.2s; }
  .nav-tab:hover { color:var(--white); background:var(--border); }
  .nav-tab.active { background:var(--orange); color:white; }
  .nav-tab.highlight { color:var(--amber); border:1px solid rgba(244,140,6,0.3); border-radius:6px; }
  .main { flex:1; padding:36px 40px; max-width:1200px; margin:0 auto; width:100%; }
  .page-header { margin-bottom:28px; }
  .page-title { font-family:'Syne',sans-serif; font-size:32px; font-weight:800; letter-spacing:-1px; }
  .page-title span { color:var(--orange); }
  .page-sub { color:var(--muted); margin-top:5px; font-size:14px; }
  .card { background:var(--card); border:1px solid var(--border); border-radius:12px; padding:22px; transition:border-color 0.2s; }
  .card-title { font-family:'Syne',sans-serif; font-size:15px; font-weight:700; margin-bottom:14px; }
  .grid-2 { display:grid; grid-template-columns:1fr 1fr; gap:18px; }
  .grid-3 { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; }
  .grid-4 { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; }
  .form-group { margin-bottom:14px; }
  .form-label { display:block; font-size:11px; font-weight:500; color:var(--muted); margin-bottom:5px; text-transform:uppercase; letter-spacing:0.5px; }
  .form-input,.form-select,.form-textarea { width:100%; padding:9px 13px; background:#1a1a1a; border:1px solid var(--border); border-radius:8px; color:var(--white); font-family:'DM Sans',sans-serif; font-size:14px; transition:border-color 0.2s; outline:none; }
  .form-input:focus,.form-select:focus,.form-textarea:focus { border-color:var(--orange); }
  .form-textarea { resize:vertical; min-height:100px; }
  .form-select option { background:#1a1a1a; }
  .form-hint { font-size:11px; color:var(--muted); margin-top:4px; }
  .btn { padding:9px 20px; border-radius:8px; border:none; cursor:pointer; font-family:'DM Sans',sans-serif; font-size:13px; font-weight:500; transition:all 0.2s; display:inline-flex; align-items:center; gap:7px; }
  .btn-primary { background:var(--orange); color:white; }
  .btn-primary:hover { background:#c94f03; transform:translateY(-1px); }
  .btn-secondary { background:var(--border); color:var(--white); }
  .btn-outline { background:transparent; color:var(--white); border:1px solid var(--border); }
  .btn-outline:hover { border-color:var(--orange); color:var(--orange); }
  .btn-green { background:var(--success); color:white; }
  .btn-green:hover { background:#16a34a; }
  .btn:disabled { opacity:0.45; cursor:not-allowed; transform:none!important; }
  .btn-sm { padding:5px 13px; font-size:12px; }
  .btn-full { width:100%; justify-content:center; }
  .tags { display:flex; flex-wrap:wrap; gap:5px; margin-top:7px; }
  .tag { background:#1e1e1e; border:1px solid var(--border); border-radius:20px; padding:2px 9px; font-size:11px; color:#aaa; }
  .tag-orange { background:rgba(232,93,4,0.15); border-color:rgba(232,93,4,0.4); color:var(--orange); }
  .tag-green { background:rgba(34,197,94,0.15); border-color:rgba(34,197,94,0.4); color:var(--success); }
  .tag-blue { background:rgba(59,130,246,0.15); border-color:rgba(59,130,246,0.4); color:var(--blue); }
  .tag-warn { background:rgba(245,158,11,0.15); border-color:rgba(245,158,11,0.4); color:var(--warn); }
  .score-ring { position:relative; display:inline-flex; align-items:center; justify-content:center; }
  .score-number { font-family:'Syne',sans-serif; font-weight:800; }
  .rank-card { background:var(--card); border:1px solid var(--border); border-radius:12px; padding:18px; display:flex; align-items:center; gap:18px; transition:all 0.2s; cursor:pointer; }
  .rank-card:hover { border-color:var(--orange); transform:translateX(3px); }
  .rank-card.rank-1 { border-color:var(--amber); background:linear-gradient(135deg,#141414,#1a1206); }
  .rank-badge { width:34px; height:34px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-family:'Syne',sans-serif; font-weight:800; font-size:14px; flex-shrink:0; background:var(--border); color:var(--muted); }
  .rank-1 .rank-badge { background:var(--amber); color:white; }
  .rank-2 .rank-badge { background:#9ca3af; color:var(--black); }
  .rank-3 .rank-badge { background:#92400e; color:white; }
  .rank-name { font-family:'Syne',sans-serif; font-weight:700; font-size:15px; }
  .rank-meta { color:var(--muted); font-size:12px; margin-top:2px; }
  .score-bar-wrap { margin-top:5px; }
  .score-bar-label { display:flex; justify-content:space-between; font-size:11px; color:var(--muted); margin-bottom:3px; }
  .score-bar-track { height:3px; background:var(--border); border-radius:2px; overflow:hidden; }
  .score-bar-fill { height:100%; border-radius:2px; transition:width 0.8s cubic-bezier(0.4,0,0.2,1); }
  .breakdown-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:8px; margin-top:14px; }
  .breakdown-item { background:#1a1a1a; border-radius:8px; padding:10px; text-align:center; border:1px solid var(--border); }
  .breakdown-score { font-family:'Syne',sans-serif; font-weight:800; font-size:20px; }
  .breakdown-max { font-size:10px; color:var(--muted); }
  .breakdown-label { font-size:10px; color:var(--muted); margin-top:3px; }
  .chat-wrap { max-height:340px; overflow-y:auto; display:flex; flex-direction:column; gap:10px; padding:14px; background:#0d0d0d; border-radius:10px; border:1px solid var(--border); }
  .chat-msg { max-width:80%; padding:9px 13px; border-radius:12px; font-size:13px; line-height:1.5; }
  .chat-msg.ai { background:#1e1e1e; border:1px solid var(--border); color:var(--white); align-self:flex-start; border-radius:4px 12px 12px 12px; }
  .chat-msg.user { background:var(--orange); color:white; align-self:flex-end; border-radius:12px 4px 12px 12px; }
  .chat-input-row { display:flex; gap:8px; margin-top:10px; }
  .stat-card { background:var(--card); border:1px solid var(--border); border-radius:12px; padding:18px; }
  .stat-number { font-family:'Syne',sans-serif; font-size:36px; font-weight:800; color:var(--orange); }
  .stat-label { color:var(--muted); font-size:13px; margin-top:3px; }
  .step-indicator { display:flex; gap:6px; margin-bottom:24px; align-items:center; }
  .step-dot { width:26px; height:26px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:700; flex-shrink:0; }
  .step-dot.done { background:var(--success); color:white; }
  .step-dot.active { background:var(--orange); color:white; }
  .step-dot.pending { background:var(--border); color:var(--muted); }
  .step-line { flex:1; height:1px; background:var(--border); }
  .toast { position:fixed; bottom:22px; right:22px; background:var(--card); border:1px solid var(--success); color:var(--white); padding:12px 18px; border-radius:10px; font-size:13px; z-index:1000; animation:slideUp 0.3s ease; display:flex; align-items:center; gap:7px; max-width:320px; }
  .toast.error { border-color:var(--danger); }
  @keyframes slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  .spinner { width:16px; height:16px; border:2px solid rgba(255,255,255,0.2); border-top-color:white; border-radius:50%; animation:spin 0.7s linear infinite; }
  @keyframes spin { to{transform:rotate(360deg)} }
  .empty { text-align:center; padding:50px 20px; color:var(--muted); }
  .empty-icon { font-size:44px; margin-bottom:10px; opacity:0.4; }
  .empty-title { font-family:'Syne',sans-serif; font-size:17px; font-weight:700; color:var(--white); margin-bottom:5px; }
  .modal-backdrop { position:fixed; inset:0; background:rgba(0,0,0,0.88); z-index:200; display:flex; align-items:center; justify-content:center; padding:18px; }
  .modal { background:var(--card); border:1px solid var(--border); border-radius:16px; padding:26px; width:100%; max-width:620px; max-height:90vh; overflow-y:auto; }
  .modal-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:18px; }
  .modal-title { font-family:'Syne',sans-serif; font-size:19px; font-weight:800; }
  .modal-close { background:none; border:none; color:var(--muted); cursor:pointer; font-size:19px; }
  .modal-close:hover { color:var(--white); }
  .divider { height:1px; background:var(--border); margin:16px 0; }
  .text-muted { color:var(--muted); } .text-sm { font-size:12px; }
  .mt-8{margin-top:8px} .mt-12{margin-top:12px} .mt-16{margin-top:16px} .mt-20{margin-top:20px}
  .flex{display:flex} .items-center{align-items:center} .justify-between{justify-content:space-between} .gap-8{gap:8px} .flex-1{flex:1}
  .font-bold{font-weight:700;font-family:'Syne',sans-serif}
  .lead-card { background:var(--card); border:1px solid var(--border); border-radius:12px; padding:18px; transition:all 0.2s; cursor:pointer; }
  .lead-card:hover { border-color:#3a3a3a; }
  .lead-card.selected { border-color:var(--orange); background:rgba(232,93,4,0.05); }
  .lead-company { font-family:'Syne',sans-serif; font-weight:700; font-size:15px; }
  .lead-contact { color:var(--muted); font-size:12px; margin-top:3px; }
  .signal-badge { font-size:11px; color:var(--warn); background:rgba(245,158,11,0.12); border:1px solid rgba(245,158,11,0.3); border-radius:6px; padding:3px 8px; margin-top:6px; display:inline-block; }
  .email-preview { background:#0d0d0d; border:1px solid var(--border); border-radius:10px; overflow:hidden; }
  .email-header { padding:14px 18px; border-bottom:1px solid var(--border); background:#111; }
  .email-field { font-size:12px; color:var(--muted); margin-bottom:4px; }
  .email-field span { color:var(--white); }
  .email-body { padding:18px; font-size:13px; line-height:1.75; color:#ddd; white-space:pre-wrap; }
  .status-pill { display:inline-flex; align-items:center; gap:4px; padding:3px 10px; border-radius:20px; font-size:11px; font-weight:600; }
  .status-draft { background:rgba(107,107,107,0.2); color:var(--muted); border:1px solid var(--border); }
  .status-queued,.status-CONTRACT_PENDING,.status-CONTRACT_SENT { background:rgba(59,130,246,0.15); color:var(--blue); border:1px solid rgba(59,130,246,0.3); }
  .status-sent,.status-CONTRACT_SIGNED,.status-INVOICE_SENT { background:rgba(245,158,11,0.15); color:var(--warn); border:1px solid rgba(245,158,11,0.3); }
  .status-PAID { background:rgba(34,197,94,0.15); color:var(--success); border:1px solid rgba(34,197,94,0.3); }
  .status-OVERDUE,.status-PAYMENT_FAILED { background:rgba(239,68,68,0.15); color:var(--danger); border:1px solid rgba(239,68,68,0.3); }
  .camp-table { width:100%; border-collapse:collapse; }
  .camp-table th { text-align:left; font-size:11px; color:var(--muted); text-transform:uppercase; letter-spacing:0.5px; padding:8px 12px; border-bottom:1px solid var(--border); }
  .camp-table td { padding:12px; border-bottom:1px solid #1a1a1a; font-size:13px; vertical-align:middle; }
  .camp-table tr:last-child td { border-bottom:none; }
  .camp-table tr:hover td { background:#111; }
  .rec-strong_yes{background:rgba(34,197,94,0.2);color:var(--success);border:1px solid rgba(34,197,94,0.4);padding:3px 11px;border-radius:20px;font-size:11px;font-weight:600;}
  .rec-yes{background:rgba(232,93,4,0.2);color:var(--orange);border:1px solid rgba(232,93,4,0.4);padding:3px 11px;border-radius:20px;font-size:11px;font-weight:600;}
  .rec-maybe{background:rgba(245,158,11,0.2);color:var(--warn);border:1px solid rgba(245,158,11,0.4);padding:3px 11px;border-radius:20px;font-size:11px;font-weight:600;}
  .rec-no{background:rgba(239,68,68,0.2);color:var(--danger);border:1px solid rgba(239,68,68,0.4);padding:3px 11px;border-radius:20px;font-size:11px;font-weight:600;}
  @keyframes pulse { 0%,100%{opacity:0.3} 50%{opacity:1} }
  .fee-banner { background: linear-gradient(135deg, rgba(232,93,4,0.12), rgba(244,140,6,0.08)); border: 1px solid rgba(232,93,4,0.35); border-radius: 12px; padding: 20px 24px; display:flex; align-items:center; justify-content:space-between; margin-bottom:20px; }
  .fee-amount { font-family:'Syne',sans-serif; font-size:38px; font-weight:800; color:var(--orange); }
  .placement-row { display:flex; align-items:center; justify-content:space-between; padding:14px 0; border-bottom:1px solid #1c1c1c; }
  .placement-row:last-child { border-bottom:none; }
`;

// ============================================================
// SHARED COMPONENTS
// ============================================================
function ScoreRing({ score, size = 64 }) {
  const r = size / 2 - 6, circ = 2 * Math.PI * r, fill = (score / 100) * circ;
  const color = score >= 75 ? "#22c55e" : score >= 50 ? "#f48c06" : "#ef4444";
  return (
    <div className="score-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)", position: "absolute" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#2a2a2a" strokeWidth="5" />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="5"
          strokeDasharray={`${fill} ${circ}`} strokeLinecap="round" />
      </svg>
      <span className="score-number" style={{ fontSize: size * 0.22, color }}>{score}</span>
    </div>
  );
}

function ScoreBar({ label, score, max }) {
  const pct = Math.round((score / max) * 100);
  const c = pct >= 75 ? "#22c55e" : pct >= 50 ? "#f48c06" : "#ef4444";
  return (
    <div className="score-bar-wrap">
      <div className="score-bar-label"><span>{label}</span><span>{score}/{max}</span></div>
      <div className="score-bar-track"><div className="score-bar-fill" style={{ width: `${pct}%`, background: c }} /></div>
    </div>
  );
}

function Toast({ message, type = "success", onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 4500); return () => clearTimeout(t); }, []);
  return <div className={`toast ${type === "error" ? "error" : ""}`}><span>{type === "success" ? "✓" : "✕"}</span> {message}</div>;
}

function Steps({ steps, current }) {
  return (
    <div className="step-indicator">
      {steps.map((s, i) => (
        <div key={s} style={{ display: "flex", alignItems: "center", flex: i < steps.length - 1 ? "1" : "none" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div className={`step-dot ${current > i+1 ? "done" : current === i+1 ? "active" : "pending"}`}>
              {current > i+1 ? "✓" : i+1}
            </div>
            <span className="text-sm" style={{ color: current === i+1 ? "var(--white)" : "var(--muted)", whiteSpace: "nowrap" }}>{s}</span>
          </div>
          {i < steps.length - 1 && <div className="step-line" style={{ margin: "0 8px" }} />}
        </div>
      ))}
    </div>
  );
}

const STATUS_LABELS = {
  CONTRACT_PENDING: "Contract Pending",
  CONTRACT_SENT: "Contract Sent",
  CONTRACT_SIGNED: "Signed ✓",
  CONTRACT_SKIPPED_DEV: "Dev Mode",
  INVOICE_SENT: "Invoice Sent",
  PAID: "Paid ✓",
  OVERDUE: "Overdue ⚠️",
  PAYMENT_FAILED: "Failed ✕",
};

// ============================================================
// PAYMENTS PAGE (NEW)
// ============================================================
function PaymentsPage({ showToast }) {
  const [placements, setPlacements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [feeCalc, setFeeCalc] = useState({ salary: "", result: null });
  const [form, setForm] = useState({
    companyName: "", companyEmail: "", companySignerName: "",
    candidateName: "", jobTitle: "", annualSalary: "", startDate: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [selectedPlacement, setSelectedPlacement] = useState(null);

  useEffect(() => { loadPlacements(); }, []);

  async function loadPlacements() {
    setLoading(true);
    try { const data = await api("/placements"); setPlacements(data); }
    catch { /* no placements yet */ }
    setLoading(false);
  }

  async function calcFee() {
    if (!feeCalc.salary) return;
    try {
      const res = await api("/fee-calculator", "POST", { annualSalary: Number(feeCalc.salary) });
      setFeeCalc(f => ({ ...f, result: res }));
    } catch (e) { showToast("Calc failed: " + e.message, "error"); }
  }

  async function submitPlacement() {
    setSubmitting(true);
    try {
      await api("/placements", "POST", {
        ...form,
        annualSalary: Number(form.annualSalary),
        companyId: "company-" + Date.now(),
        candidateId: "candidate-" + Date.now(),
      });
      showToast("Placement created! Contract sent for signature.");
      setShowForm(false);
      setForm({ companyName:"",companyEmail:"",companySignerName:"",candidateName:"",jobTitle:"",annualSalary:"",startDate:"" });
      loadPlacements();
    } catch (e) { showToast(e.message, "error"); }
    setSubmitting(false);
  }

  async function triggerInvoice(id) {
    try {
      await api(`/placements/${id}/invoice`, "POST");
      showToast("Invoice sent!");
      loadPlacements();
    } catch (e) { showToast(e.message, "error"); }
  }

  const totalPaid = placements.filter(p => p.status === "PAID").reduce((s, p) => s + (p.fee_amount || 0), 0);
  const totalPending = placements.filter(p => !["PAID","OVERDUE","PAYMENT_FAILED"].includes(p.status)).reduce((s, p) => s + (p.fee_amount || 0), 0);
  const totalOverdue = placements.filter(p => p.status === "OVERDUE").reduce((s, p) => s + (p.fee_amount || 0), 0);

  return (
    <div>
      <div className="page-header" style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
        <div>
          <h1 className="page-title">Payments & <span>Contracts</span></h1>
          <p className="page-sub">Automated fee collection · DocuSign contracts · Stripe invoices</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>+ Record Placement</button>
      </div>

      {/* Stats */}
      <div className="grid-3" style={{marginBottom:24}}>
        <div className="stat-card">
          <div style={{fontSize:20,marginBottom:5}}>💰</div>
          <div className="stat-number">${totalPaid.toLocaleString()}</div>
          <div className="stat-label">Collected</div>
        </div>
        <div className="stat-card">
          <div style={{fontSize:20,marginBottom:5}}>⏳</div>
          <div className="stat-number" style={{color:"var(--warn)"}}>${totalPending.toLocaleString()}</div>
          <div className="stat-label">Pending</div>
        </div>
        <div className="stat-card">
          <div style={{fontSize:20,marginBottom:5}}>⚠️</div>
          <div className="stat-number" style={{color:"var(--danger)"}}>${totalOverdue.toLocaleString()}</div>
          <div className="stat-label">Overdue</div>
        </div>
      </div>

      {/* Fee calculator */}
      <div className="card" style={{marginBottom:20}}>
        <div className="card-title">🧮 Fee Calculator</div>
        <div style={{display:"flex",gap:10,alignItems:"flex-end"}}>
          <div className="form-group" style={{flex:1,marginBottom:0}}>
            <label className="form-label">Annual Salary</label>
            <input className="form-input" type="number" placeholder="e.g. 120000"
              value={feeCalc.salary} onChange={e => setFeeCalc(f => ({...f, salary: e.target.value, result: null}))} />
          </div>
          <button className="btn btn-outline" onClick={calcFee} disabled={!feeCalc.salary}>Calculate</button>
        </div>
        {feeCalc.result && (
          <div className="fee-banner" style={{marginTop:14,marginBottom:0}}>
            <div>
              <div className="text-muted text-sm">Placement fee on ${Number(feeCalc.salary).toLocaleString()} salary</div>
              <div className="fee-amount">${feeCalc.result.feeAmount?.toLocaleString()}</div>
            </div>
            <div style={{textAlign:"right"}}>
              <div className="text-muted text-sm">Fee rate</div>
              <div style={{fontSize:22,fontWeight:700,color:"var(--orange)"}}>{feeCalc.result.feePercent}%</div>
            </div>
          </div>
        )}
      </div>

      {/* Placements list */}
      <div className="card">
        <div className="card-title">All Placements</div>
        {loading ? (
          <div style={{textAlign:"center",padding:40}}><div className="spinner" style={{margin:"0 auto",width:24,height:24,borderWidth:3}}/></div>
        ) : placements.length === 0 ? (
          <div className="empty" style={{padding:40}}>
            <div className="empty-icon">💼</div>
            <div className="empty-title">No placements yet</div>
            <p>Record a placement to trigger contracts and invoicing.</p>
          </div>
        ) : (
          <table className="camp-table">
            <thead><tr>
              <th>Candidate</th><th>Company</th><th>Role</th>
              <th>Fee</th><th>Status</th><th>Action</th>
            </tr></thead>
            <tbody>
              {placements.map(p => (
                <tr key={p.id} style={{cursor:"pointer"}} onClick={() => setSelectedPlacement(p)}>
                  <td><div className="font-bold" style={{fontSize:13}}>{p.candidate_name}</div></td>
                  <td><div style={{fontSize:13}}>{p.company_name}</div><div className="text-muted text-sm">{p.company_email}</div></td>
                  <td style={{color:"var(--muted)",fontSize:12}}>{p.job_title}</td>
                  <td><div style={{fontFamily:"Syne,sans-serif",fontWeight:700,color:"var(--orange)"}}>${p.fee_amount?.toLocaleString()}</div></td>
                  <td><span className={`status-pill status-${p.status}`}>{STATUS_LABELS[p.status] || p.status}</span></td>
                  <td onClick={e => e.stopPropagation()}>
                    {p.status === "CONTRACT_SIGNED" && (
                      <button className="btn btn-sm btn-outline" onClick={() => triggerInvoice(p.id)}>Send Invoice</button>
                    )}
                    {p.stripe_invoice_url && (
                      <a href={p.stripe_invoice_url} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline" style={{textDecoration:"none"}}>View Invoice ↗</a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Placement detail modal */}
      {selectedPlacement && (
        <div className="modal-backdrop" onClick={() => setSelectedPlacement(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">{selectedPlacement.candidate_name}</div>
              <button className="modal-close" onClick={() => setSelectedPlacement(null)}>✕</button>
            </div>
            <div className="grid-2" style={{gap:12,marginBottom:16}}>
              {[
                ["Company", selectedPlacement.company_name],
                ["Role", selectedPlacement.job_title],
                ["Salary", `$${selectedPlacement.annual_salary?.toLocaleString()}`],
                ["Fee", `$${selectedPlacement.fee_amount?.toLocaleString()}`],
                ["Start Date", selectedPlacement.start_date],
                ["Guarantee Until", selectedPlacement.guarantee_expires_at?.split("T")[0]],
              ].map(([l,v]) => (
                <div key={l}>
                  <div className="form-label">{l}</div>
                  <div style={{fontSize:14,color:"var(--white)"}}>{v || "—"}</div>
                </div>
              ))}
            </div>
            <div className="divider"/>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div><div className="form-label">Status</div><span className={`status-pill status-${selectedPlacement.status}`}>{STATUS_LABELS[selectedPlacement.status] || selectedPlacement.status}</span></div>
              {selectedPlacement.paid_at && <div><div className="form-label">Paid At</div><div style={{fontSize:13}}>{new Date(selectedPlacement.paid_at).toLocaleString()}</div></div>}
            </div>
            {selectedPlacement.stripe_invoice_url && (
              <a href={selectedPlacement.stripe_invoice_url} target="_blank" rel="noreferrer"
                className="btn btn-outline btn-full" style={{marginTop:16,textDecoration:"none"}}>
                Open Stripe Invoice ↗
              </a>
            )}
          </div>
        </div>
      )}

      {/* New placement form modal */}
      {showForm && (
        <div className="modal-backdrop" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Record a Placement</div>
              <button className="modal-close" onClick={() => setShowForm(false)}>✕</button>
            </div>
            <p className="text-muted text-sm" style={{marginBottom:18}}>
              This sends a DocuSign contract to the hiring manager. Invoice fires automatically on signing.
            </p>
            <div className="grid-2">
              {[
                ["candidateName","Candidate Name"],["jobTitle","Job Title"],
                ["companyName","Company Name"],["companyEmail","Hiring Manager Email"],
                ["companySignerName","Signer Full Name"],["annualSalary","Annual Salary ($)"],
                ["startDate","Start Date"],
              ].map(([k,l]) => (
                <div className="form-group" key={k} style={k==="startDate"?{gridColumn:"1"}:{}}>
                  <label className="form-label">{l}</label>
                  <input className="form-input" type={k==="annualSalary"?"number":k==="startDate"?"date":"text"}
                    value={form[k]} onChange={e => setForm(f=>({...f,[k]:e.target.value}))} placeholder={l}/>
                </div>
              ))}
            </div>
            {form.annualSalary && (
              <div style={{background:"rgba(232,93,4,0.08)",border:"1px solid rgba(232,93,4,0.25)",borderRadius:8,padding:"10px 14px",marginBottom:14}}>
                <span className="text-muted text-sm">Estimated fee: </span>
                <span style={{fontWeight:700,color:"var(--orange)"}}>
                  ${Math.round(Number(form.annualSalary)*0.20).toLocaleString()}
                </span>
                <span className="text-muted text-sm"> (20%)</span>
              </div>
            )}
            <button className="btn btn-primary btn-full" onClick={submitPlacement}
              disabled={submitting || !form.candidateName || !form.companyEmail || !form.annualSalary}>
              {submitting ? <><div className="spinner"/>Sending Contract...</> : "→ Send Contract & Create Placement"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// CANDIDATE PAGE
// ============================================================
const INTERVIEW_QUESTIONS = [
  "Tell me about yourself and your professional background.",
  "What are your top technical skills and how have you applied them?",
  "Describe a challenging project you worked on and how you overcame obstacles.",
  "Why are you looking for a new role right now?",
  "Where do you see yourself in the next 3–5 years?"
];

function CandidatePage({ showToast }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [cvText, setCvText] = useState("");
  const [profile, setProfile] = useState({ name: "", email: "", location: "", openToRemote: true });
  const [aiData, setAiData] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [transcript, setTranscript] = useState([]);
  const [interviewResult, setInterviewResult] = useState(null);
  const chatRef = useRef(null);
  useEffect(() => { if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight; }, [chatMessages]);

  async function analyzeCV() {
    setLoading(true);
    try {
      const data = await api("/analyse", "POST", { text: cvText, type: "cv" });
      setAiData(data);
      if (data.name && !profile.name) setProfile(p => ({ ...p, name: data.name }));
      setStep(2);
    } catch (e) { showToast("CV analysis failed: " + e.message, "error"); }
    setLoading(false);
  }

  function startInterview() {
    setStep(3);
    setChatMessages([{ role: "ai", text: `Hi ${profile.name || "there"}! I'm the GRIT AI interviewer.\n\n${INTERVIEW_QUESTIONS[0]}` }]);
    setCurrentQ(0); setTranscript([{ q: INTERVIEW_QUESTIONS[0], a: "" }]);
  }

  async function sendAnswer() {
    if (!userInput.trim()) return;
    const answer = userInput.trim(); setUserInput("");
    const newT = [...transcript]; if (newT[currentQ]) newT[currentQ].a = answer;
    setTranscript(newT);
    setChatMessages(m => [...m, { role: "user", text: answer }]);
    const next = currentQ + 1;
    if (next < INTERVIEW_QUESTIONS.length) {
      setCurrentQ(next);
      setTimeout(() => { setChatMessages(m => [...m, { role: "ai", text: INTERVIEW_QUESTIONS[next] }]); setTranscript(t => [...t, { q: INTERVIEW_QUESTIONS[next], a: "" }]); }, 600);
    } else {
      setChatMessages(m => [...m, { role: "ai", text: "Interview complete! Analysing your responses..." }]);
      setLoading(true);
      try {
        const result = await api("/analyse", "POST", { text: newT.map(({ q, a }) => `Q: ${q}\nA: ${a}`).join("\n\n"), type: "interview" });
        setInterviewResult(result);
        setChatMessages(m => [...m, { role: "ai", text: `Score: ${result.score}/100. ${result.summary}` }]);
        setStep(4);
      } catch { setInterviewResult({ score: 70, strengths: [], concerns: [], recommendation: "yes", summary: "Interview recorded." }); setStep(4); }
      setLoading(false);
    }
  }

  async function submitCandidate() {
    setLoading(true);
    try {
      await api("/candidates", "POST", { ...profile, ...aiData, cvText, interviewScore: interviewResult?.score || 0, interviewResult });
      showToast(`${profile.name} registered successfully!`);
      setStep(5);
    } catch (e) { showToast("Submit failed: " + e.message, "error"); }
    setLoading(false);
  }

  return (
    <div>
      <div className="page-header"><h1 className="page-title">Candidate <span>Registration</span></h1><p className="page-sub">Upload CV · Complete profile · AI interview</p></div>
      <Steps steps={["CV Upload","Profile","Interview","Review","Done"]} current={step} />
      {step===1&&<div className="card"><div className="card-title">📄 Paste Your CV</div><div className="form-group"><label className="form-label">CV Text</label><textarea className="form-textarea" style={{minHeight:180}} placeholder="Paste your full CV here..." value={cvText} onChange={e=>setCvText(e.target.value)}/></div><button className="btn btn-primary" onClick={analyzeCV} disabled={loading||!cvText.trim()}>{loading?<><div className="spinner"/>Analysing...</>:"→ Analyse CV with AI"}</button></div>}
      {step===2&&aiData&&<div><div className="grid-2" style={{marginBottom:18}}><div className="card"><div className="card-title">🤖 AI Extracted</div><p className="text-sm text-muted" style={{marginBottom:10}}>{aiData.summary}</p><div className="form-group"><label className="form-label">Skills</label><div className="tags">{(aiData.skills||[]).map(s=><span key={s} className="tag tag-orange">{s}</span>)}</div></div><div className="tags"><span className="tag">{aiData.yearsExperience} yrs</span><span className="tag">{aiData.seniorityLevel}</span>{(aiData.industries||[]).map(i=><span key={i} className="tag">{i}</span>)}</div></div><div className="card"><div className="card-title">👤 Your Profile</div>{["name","email","location"].map(f=><div className="form-group" key={f}><label className="form-label">{f}</label><input className="form-input" value={profile[f]} onChange={e=>setProfile(p=>({...p,[f]:e.target.value}))} placeholder={f}/></div>)}<div className="form-group"><label className="form-label">Open to Remote</label><div style={{display:"flex",gap:8,marginTop:6}}>{[true,false].map(v=><button key={String(v)} className={`btn btn-sm ${profile.openToRemote===v?"btn-primary":"btn-outline"}`} onClick={()=>setProfile(p=>({...p,openToRemote:v}))}>{v?"Yes":"No"}</button>)}</div></div></div></div><button className="btn btn-primary" onClick={startInterview} disabled={!profile.name||!profile.email}>→ Start AI Interview</button></div>}
      {step===3&&<div className="card"><div className="card-title">🎤 AI Interview — Q{Math.min(currentQ+1,5)}/5</div><div className="chat-wrap" ref={chatRef}>{chatMessages.map((m,i)=><div key={i} className={`chat-msg ${m.role}`}>{m.text}</div>)}{loading&&<div className="chat-msg ai" style={{display:"flex",gap:6}}>{[0,1,2].map(i=><div key={i} style={{width:6,height:6,borderRadius:"50%",background:"var(--muted)",animation:`pulse 1s ${i*0.2}s infinite`}}/>)}</div>}</div>{!loading&&currentQ<INTERVIEW_QUESTIONS.length&&<div className="chat-input-row"><input className="form-input flex-1" placeholder="Your answer..." value={userInput} onChange={e=>setUserInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendAnswer()}/><button className="btn btn-primary" onClick={sendAnswer} disabled={!userInput.trim()}>Send</button></div>}</div>}
      {step===4&&interviewResult&&<div className="card"><div className="card-title">✅ Interview Complete</div><div style={{display:"flex",gap:20,alignItems:"center",marginBottom:16}}><ScoreRing score={interviewResult.score} size={70}/><div><div className="font-bold" style={{fontSize:16}}>{profile.name}</div><p className="text-sm text-muted mt-8">{interviewResult.summary}</p><span className={`rec-${interviewResult.recommendation}`} style={{display:"inline-block",marginTop:8}}>{(interviewResult.recommendation||"").replace("_"," ").toUpperCase()}</span></div></div><button className="btn btn-primary" onClick={submitCandidate} disabled={loading}>{loading?<><div className="spinner"/>Saving...</>:"→ Submit Application"}</button></div>}
      {step===5&&<div className="card" style={{textAlign:"center",padding:50}}><div style={{fontSize:56,marginBottom:12}}>🎉</div><div className="font-bold" style={{fontSize:22,marginBottom:6}}>Application Submitted!</div><p className="text-muted">Your profile is now live on GRIT and being matched to roles.</p></div>}
    </div>
  );
}

// ============================================================
// JOB POST PAGE
// ============================================================
function JobPostPage({ showToast }) {
  const [loading, setLoading] = useState(false);
  const [jdText, setJdText] = useState("");
  const [aiData, setAiData] = useState(null);
  const [form, setForm] = useState({ company: "", location: "", remote: false, salaryMin: "", salaryMax: "" });
  const [step, setStep] = useState(1);

  async function analyzeJD() {
    setLoading(true);
    try { const d = await api("/analyse", "POST", { text: jdText, type: "job" }); setAiData(d); setStep(2); }
    catch (e) { showToast("Analysis failed: " + e.message, "error"); }
    setLoading(false);
  }

  async function submitJob() {
    setLoading(true);
    try {
      await api("/jobs", "POST", { ...form, ...aiData, jdText });
      showToast(`"${aiData.title}" posted!`);
      setStep(3);
    } catch (e) { showToast("Post failed: " + e.message, "error"); }
    setLoading(false);
  }

  return (
    <div>
      <div className="page-header"><h1 className="page-title">Post a <span>Job</span></h1><p className="page-sub">AI extracts requirements and ranks candidates instantly</p></div>
      {step===1&&<div className="card"><div className="card-title">📋 Paste Job Description</div><div className="form-group"><label className="form-label">Job Description</label><textarea className="form-textarea" style={{minHeight:200}} placeholder="Paste full JD here..." value={jdText} onChange={e=>setJdText(e.target.value)}/></div><button className="btn btn-primary" onClick={analyzeJD} disabled={loading||!jdText.trim()}>{loading?<><div className="spinner"/>Analysing...</>:"→ Analyse with AI"}</button></div>}
      {step===2&&aiData&&<div><div className="grid-2" style={{marginBottom:18}}><div className="card"><div className="card-title">🤖 AI Extracted</div><div className="font-bold" style={{fontSize:17,marginBottom:6}}>{aiData.title}</div><p className="text-sm text-muted" style={{marginBottom:10}}>{aiData.summary}</p><div className="form-group"><label className="form-label">Required Skills</label><div className="tags">{(aiData.requiredSkills||[]).map(s=><span key={s} className="tag tag-orange">{s}</span>)}</div></div><div className="tags"><span className="tag">{aiData.minExperience}–{aiData.maxExperience} yrs</span><span className="tag">{aiData.seniorityLevel}</span><span className="tag">{aiData.industry}</span></div></div><div className="card"><div className="card-title">🏢 Company Details</div>{[["company","Company Name"],["location","Location"],["salaryMin","Min Salary"],["salaryMax","Max Salary"]].map(([k,l])=><div className="form-group" key={k}><label className="form-label">{l}</label><input className="form-input" value={form[k]} onChange={e=>setForm(p=>({...p,[k]:e.target.value}))} placeholder={l}/></div>)}</div></div><button className="btn btn-primary" onClick={submitJob} disabled={loading||!form.company}>{loading?<><div className="spinner"/>Posting...</>:"→ Post Job & Match Candidates"}</button></div>}
      {step===3&&<div className="card" style={{textAlign:"center",padding:50}}><div style={{fontSize:56,marginBottom:12}}>🚀</div><div className="font-bold" style={{fontSize:22,marginBottom:6}}>Job Posted!</div><p className="text-muted">Check the Dashboard for ranked candidates.</p></div>}
    </div>
  );
}

// ============================================================
// DASHBOARD
// ============================================================
function DashboardPage({ showToast }) {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [matches, setMatches] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [stats, setStats] = useState({ candidates: 0, jobs: 0, emailsSent: 0, placements: 0 });
  const [loading, setLoading] = useState(false);

  useEffect(() => { loadJobs(); loadStats(); }, []);
  useEffect(() => { if (selectedJob) loadMatches(selectedJob.id); }, [selectedJob]);

  async function loadJobs() {
    try { const j = await api("/jobs"); setJobs(j); if (j.length) setSelectedJob(j[0]); } catch {}
  }
  async function loadMatches(jobId) {
    setLoading(true);
    try { const m = await api(`/matches/${jobId}`); setMatches(m); } catch {}
    setLoading(false);
  }
  async function loadStats() {
    try {
      const [cands, jobs2, campaigns, placements] = await Promise.all([
        api("/candidates"), api("/jobs"), api("/email-campaigns"), api("/placements")
      ]);
      const paid = placements.filter(p => p.status === "PAID").reduce((s,p) => s + (p.fee_amount||0), 0);
      setStats({ candidates: cands.length, jobs: jobs2.length, emailsSent: campaigns.filter(e => e.status === "sent").length, revenue: paid });
    } catch {}
  }

  return (
    <div>
      <div className="page-header"><h1 className="page-title">Employer <span>Dashboard</span></h1><p className="page-sub">AI-ranked candidates · Live revenue tracking</p></div>
      <div className="grid-4" style={{marginBottom:24}}>
        {[["Candidates",stats.candidates,"👤"],["Open Roles",stats.jobs,"💼"],["Emails Sent",stats.emailsSent,"📧"],["Revenue Collected","$"+(stats.revenue||0).toLocaleString(),"💰"]].map(([l,v,i])=>(
          <div className="stat-card" key={l}><div style={{fontSize:22,marginBottom:5}}>{i}</div><div className="stat-number" style={{fontSize:28}}>{v}</div><div className="stat-label">{l}</div></div>
        ))}
      </div>
      {jobs.length===0 ? <div className="empty"><div className="empty-icon">💼</div><div className="empty-title">No jobs posted yet</div><p>Post a job to see AI-ranked candidates.</p></div> : (
        <div className="grid-2" style={{gap:22}}>
          <div>
            <div className="card-title" style={{marginBottom:10}}>Select Role</div>
            {jobs.map(j=>(
              <div key={j.id} className="rank-card" style={{marginBottom:8,borderColor:selectedJob?.id===j.id?"var(--orange)":undefined}} onClick={()=>setSelectedJob(j)}>
                <div style={{flex:1}}><div className="rank-name">{j.title}</div><div className="rank-meta">{j.company} · {j.location||"Remote"}</div><div className="tags mt-8">{(j.required_skills||[]).slice(0,3).map(s=><span key={s} className="tag tag-orange">{s}</span>)}</div></div>
                {selectedJob?.id===j.id&&<span style={{color:"var(--orange)",fontSize:18}}>●</span>}
              </div>
            ))}
          </div>
          <div>
            <div className="card-title" style={{marginBottom:10}}>Top Candidates {selectedJob&&<span className="text-muted text-sm" style={{fontFamily:"DM Sans",fontWeight:400}}>— {selectedJob.title}</span>}</div>
            {loading?<div style={{textAlign:"center",padding:40}}><div className="spinner" style={{margin:"0 auto",width:24,height:24,borderWidth:3}}/></div>:matches.length===0?<div className="empty" style={{padding:40}}><div className="empty-icon">👤</div><div className="empty-title">No candidates matched yet</div></div>:(
              matches.map((m,i)=>(
                <div key={m.candidate_id} className={`rank-card rank-${i+1}`} style={{marginBottom:8}} onClick={()=>{setSelectedCandidate(m.candidates);setSelectedMatch(m);}}>
                  <div className="rank-badge">#{i+1}</div>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <div className="rank-name">{m.candidates?.name}</div><ScoreRing score={m.total_score} size={44}/>
                    </div>
                    <div className="rank-meta">{m.candidates?.years_experience} yrs · {m.candidates?.seniority_level} · {m.candidates?.location}</div>
                    <div style={{marginTop:7}}><ScoreBar label="Skills" score={m.breakdown?.skills?.score||0} max={40}/><ScoreBar label="Experience" score={m.breakdown?.experience?.score||0} max={25}/></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
      {selectedCandidate&&selectedMatch&&(
        <div className="modal-backdrop" onClick={()=>{setSelectedCandidate(null);setSelectedMatch(null);}}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-header"><div className="modal-title">{selectedCandidate.name}</div><button className="modal-close" onClick={()=>{setSelectedCandidate(null);setSelectedMatch(null);}}>✕</button></div>
            <div style={{display:"flex",gap:18,alignItems:"center",marginBottom:16}}><ScoreRing score={selectedMatch.total_score} size={70}/><div><div className="text-muted text-sm">{selectedCandidate.email}</div><div className="text-muted text-sm mt-8">{selectedCandidate.location}{selectedCandidate.open_to_remote?" · Remote OK":""}</div><div className="tags mt-8"><span className="tag">{selectedCandidate.years_experience} yrs</span><span className="tag">{selectedCandidate.seniority_level}</span></div></div></div>
            <div className="divider"/>
            <div className="card-title">Match Breakdown</div>
            <div className="breakdown-grid">{Object.entries(selectedMatch.breakdown||{}).map(([k,v])=><div className="breakdown-item" key={k}><div className="breakdown-score" style={{color:v.score/v.max>=0.75?"var(--success)":v.score/v.max>=0.5?"var(--warn)":"var(--danger)"}}>{v.score}</div><div className="breakdown-max">/{v.max}</div><div className="breakdown-label">{k}</div></div>)}</div>
            {selectedCandidate.interview_result&&<><div className="divider"/><div className="card-title">AI Interview</div><div style={{display:"flex",gap:12,alignItems:"center"}}><ScoreRing score={selectedCandidate.interview_score||0} size={52}/><div><span className={`rec-${selectedCandidate.interview_result?.recommendation}`}>{(selectedCandidate.interview_result?.recommendation||"").replace("_"," ").toUpperCase()}</span><p className="text-sm text-muted mt-8">{selectedCandidate.interview_result?.summary}</p></div></div></>}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// COLD EMAIL PAGE
// ============================================================
function ColdEmailPage({ showToast }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [industry, setIndustry] = useState("");
  const [role, setRole] = useState("");
  const [leads, setLeads] = useState([]);
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [emailType, setEmailType] = useState("platform");
  const [senderName, setSenderName] = useState("");
  const [senderTitle, setSenderTitle] = useState("Head of Talent · GRIT");
  const [senderEmail, setSenderEmail] = useState("");
  const [generatedEmails, setGeneratedEmails] = useState([]);
  const [previewIdx, setPreviewIdx] = useState(0);
  const [editingBody, setEditingBody] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [campaigns, setCampaigns] = useState([]);
  const [topCandidate, setTopCandidate] = useState(null);

  useEffect(() => { api("/candidates").then(c => { if (c.length) setTopCandidate(c[0]); }).catch(() => {}); }, []);
  useEffect(() => { if (step === 5) loadCampaigns(); }, [step]);

  async function loadCampaigns() {
    try { const c = await api("/email-campaigns"); setCampaigns(c); } catch {}
  }

  async function handleSearch() {
    setLoading(true); setLoadingMsg("🔍 Searching for matching companies...");
    try {
      const found = await api("/leads/discover", "POST", { searchQuery, industry, role });
      setLeads(found); setStep(2);
    } catch (e) { showToast("Search failed: " + e.message, "error"); }
    setLoading(false);
  }

  function toggleLead(id) { setSelectedLeads(sel => sel.includes(id) ? sel.filter(x => x !== id) : [...sel, id]); }

  async function generateEmails() {
    setLoading(true); setStep(3);
    const selected = leads.filter(l => selectedLeads.includes(l.id));
    const emails = [];
    for (let i = 0; i < selected.length; i++) {
      setLoadingMsg(`✍️ Writing email ${i+1} of ${selected.length} for ${selected[i].company}...`);
      try {
        const email = await api("/emails/generate", "POST", { lead: selected[i], emailType, topCandidate, senderName, senderTitle });
        emails.push({ lead: selected[i], ...email, status: "draft" });
      } catch { emails.push({ lead: selected[i], subject: `GRIT for ${selected[i].company}`, body: "Email generation failed.", status: "error" }); }
    }
    setGeneratedEmails(emails); setEditingBody(emails[0]?.body || ""); setStep(4); setLoading(false);
  }

  async function queueAndSend() {
    setLoading(true); setLoadingMsg("📤 Sending emails via Gmail...");
    let sent = 0;
    for (const email of generatedEmails) {
      if (email.status === "error") continue;
      try {
        const campaign = await api("/email-campaigns", "POST", { leadId: email.lead.id, subject: email.subject, body: email.body, toEmail: email.lead.contact_email||email.lead.contactEmail, toName: email.lead.hiring_contact||email.lead.hiringContact, company: email.lead.company, senderName, senderEmail, emailType });
        await api("/emails/send", "POST", { to: email.lead.contact_email||email.lead.contactEmail, subject: email.subject, body: email.body, senderName, senderEmail, campaignId: campaign.id });
        sent++;
      } catch (e) { console.error("Send failed for", email.lead.company, e); }
    }
    showToast(`${sent} email${sent !== 1 ? "s" : ""} sent!`);
    setStep(5); setLoading(false);
  }

  const currentEmail = generatedEmails[previewIdx];

  return (
    <div>
      <div className="page-header"><h1 className="page-title">Cold Email <span>Engine</span></h1><p className="page-sub">AI finds companies · writes personalised outreach · sends via Gmail</p></div>
      <Steps steps={["Find Companies","Select Leads","Configure","Preview & Edit","Sent"]} current={step} />
      {step===1&&(<div className="card"><div className="card-title">🔎 Find Target Companies</div><div className="grid-2"><div className="form-group"><label className="form-label">Search Query</label><input className="form-input" placeholder="e.g. Series B fintech startups hiring engineers" value={searchQuery} onChange={e=>setSearchQuery(e.target.value)}/></div><div className="form-group"><label className="form-label">Industry</label><input className="form-input" placeholder="e.g. fintech, saas" value={industry} onChange={e=>setIndustry(e.target.value)}/></div><div className="form-group"><label className="form-label">Role They're Hiring For</label><input className="form-input" placeholder="e.g. senior engineers" value={role} onChange={e=>setRole(e.target.value)}/></div><div className="form-group"><label className="form-label">Email Type</label><select className="form-select" value={emailType} onChange={e=>setEmailType(e.target.value)}><option value="platform">Pitch GRIT Platform</option><option value="candidate">Propose a Candidate</option></select></div></div><button className="btn btn-primary" onClick={handleSearch} disabled={loading||(!searchQuery&&!industry)}>{loading?<><div className="spinner"/>{loadingMsg}</>:"→ Search & Discover Companies"}</button></div>)}
      {step===2&&(<div><div className="flex justify-between items-center" style={{marginBottom:16}}><div><div className="font-bold" style={{fontSize:16}}>{leads.length} companies found</div><div className="text-muted text-sm">{selectedLeads.length} selected</div></div><div className="flex gap-8"><button className="btn btn-outline btn-sm" onClick={()=>setSelectedLeads(leads.map(l=>l.id))}>Select All</button><button className="btn btn-outline btn-sm" onClick={()=>setSelectedLeads([])}>Clear</button><button className="btn btn-primary" onClick={()=>setStep(3)} disabled={!selectedLeads.length}>→ Configure ({selectedLeads.length})</button></div></div><div className="grid-2">{leads.map(lead=>(<div key={lead.id} className={`lead-card ${selectedLeads.includes(lead.id)?"selected":""}`} onClick={()=>toggleLead(lead.id)}><div className="flex justify-between items-center"><div><div className="lead-company">{lead.company}</div><div className="lead-contact">📧 {lead.hiring_contact||lead.hiringContact} · {lead.contact_email||lead.contactEmail}</div><div className="lead-contact">📍 {lead.location} · {lead.size}</div></div><div style={{fontSize:22}}>{selectedLeads.includes(lead.id)?"✅":"⬜"}</div></div><div className="signal-badge">⚡ {lead.recent_signal||lead.recentSignal}</div></div>))}</div></div>)}
      {step===3&&!loading&&(<div className="card"><div className="card-title">✍️ Sender Details</div><div className="grid-2"><div><div className="form-group"><label className="form-label">Your Name</label><input className="form-input" value={senderName} onChange={e=>setSenderName(e.target.value)} placeholder="Alex Morgan"/></div><div className="form-group"><label className="form-label">Your Title</label><input className="form-input" value={senderTitle} onChange={e=>setSenderTitle(e.target.value)}/></div><div className="form-group"><label className="form-label">Your Email</label><input className="form-input" value={senderEmail} onChange={e=>setSenderEmail(e.target.value)} placeholder="you@grit.ai"/></div></div></div><button className="btn btn-primary mt-16" onClick={generateEmails} disabled={!senderName||!senderEmail}>→ Generate {selectedLeads.length} AI Emails</button></div>)}
      {step===3&&loading&&<div className="card" style={{textAlign:"center",padding:60}}><div className="spinner" style={{margin:"0 auto 12px",width:28,height:28,borderWidth:3}}/><div className="font-bold" style={{fontSize:16,marginBottom:6}}>{loadingMsg}</div></div>}
      {step===4&&generatedEmails.length>0&&(<div><div className="flex justify-between items-center" style={{marginBottom:16}}><div><div className="font-bold" style={{fontSize:16}}>{generatedEmails.length} emails ready</div></div><button className="btn btn-green" onClick={queueAndSend} disabled={loading}>{loading?<><div className="spinner"/>{loadingMsg}</>:`📤 Send All via Gmail (${generatedEmails.length})`}</button></div><div className="grid-2" style={{gap:20}}><div>{generatedEmails.map((e,i)=>(<div key={i} className={`lead-card ${previewIdx===i?"selected":""}`} style={{marginBottom:10}} onClick={()=>{setPreviewIdx(i);setEditingBody(e.body);setIsEditing(false);}}><div className="flex justify-between items-center"><div><div className="lead-company" style={{fontSize:14}}>{e.lead.company}</div><div className="lead-contact">To: {e.lead.hiring_contact||e.lead.hiringContact}</div></div><span className={`status-pill status-${e.status}`}>{e.status}</span></div></div>))}</div>{currentEmail&&(<div><div className="email-preview"><div className="email-header"><div className="email-field">To: <span>{currentEmail.lead.hiring_contact||currentEmail.lead.hiringContact}</span></div><div className="email-field">Subject: <span>{currentEmail.subject}</span></div></div>{isEditing?<textarea className="form-textarea" style={{margin:18,width:"calc(100% - 36px)",minHeight:200,background:"transparent",border:"1px solid var(--orange)",borderRadius:6}} value={editingBody} onChange={e=>setEditingBody(e.target.value)}/>:<div className="email-body">{currentEmail.body}</div>}</div><div className="flex gap-8 mt-12">{isEditing?<><button className="btn btn-green btn-sm" onClick={()=>{const u=[...generatedEmails];u[previewIdx]={...u[previewIdx],body:editingBody};setGeneratedEmails(u);setIsEditing(false);}}>Save</button><button className="btn btn-outline btn-sm" onClick={()=>setIsEditing(false)}>Cancel</button></>:<button className="btn btn-outline btn-sm" onClick={()=>setIsEditing(true)}>✏️ Edit</button>}</div></div>)}</div></div>)}
      {step===5&&(<div><div className="card" style={{marginBottom:20,textAlign:"center",padding:40}}><div style={{fontSize:48,marginBottom:12}}>📬</div><div className="font-bold" style={{fontSize:20,marginBottom:6}}>Emails Sent!</div><button className="btn btn-outline mt-16" onClick={()=>{setStep(1);setLeads([]);setSelectedLeads([]);setGeneratedEmails([]);}}>+ New Campaign</button></div>{campaigns.length>0&&<div className="card"><div className="card-title">Campaign Log</div><table className="camp-table"><thead><tr><th>Company</th><th>Contact</th><th>Subject</th><th>Status</th><th>Sent</th></tr></thead><tbody>{campaigns.map((e,i)=><tr key={i}><td className="font-bold" style={{fontSize:13}}>{e.company||e.leads?.company}</td><td className="text-muted">{e.to_name}</td><td style={{maxWidth:200,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{e.subject}</td><td><span className={`status-pill status-${e.status}`}>{e.status}</span></td><td className="text-muted">{e.sent_at?new Date(e.sent_at).toLocaleString():"—"}</td></tr>)}</tbody></table></div>}</div>)}
    </div>
  );
}

// ============================================================
// APP ROOT
// ============================================================
export default function App() {
  const [loggedIn, setLoggedIn] = useState(() => sessionStorage.getItem("grit_auth") === "true");
  const [tab, setTab] = useState("dashboard");
  const [toast, setToast] = useState(null);
  function showToast(msg, type = "success") { setToast({ msg, type }); }

  if (!loggedIn) return <LoginScreen onLogin={() => { sessionStorage.setItem("grit_auth", "true"); setLoggedIn(true); }} />;

  const TABS = [
    { id: "dashboard", label: "Dashboard",            icon: "📊" },
    { id: "candidate", label: "Register Candidate",   icon: "👤" },
    { id: "job",       label: "Post Job",             icon: "💼" },
    { id: "outreach",  label: "Cold Email Engine",    icon: "📧", highlight: true },
    { id: "payments",  label: "Payments & Contracts", icon: "💰", highlight: true },
  ];

  return (
    <>
      <style>{styles}</style>
      <div className="app">
        <nav className="nav">
          <div className="logo">GR<span>I</span>T</div>
          <div className="nav-tabs">
            {TABS.map(t => (
              <button key={t.id} className={`nav-tab ${tab===t.id?"active":""} ${t.highlight&&tab!==t.id?"highlight":""}`} onClick={() => setTab(t.id)}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>
        </nav>
        <main className="main">
          {tab==="dashboard" && <DashboardPage showToast={showToast}/>}
          {tab==="candidate" && <CandidatePage showToast={showToast}/>}
          {tab==="job"       && <JobPostPage   showToast={showToast}/>}
          {tab==="outreach"  && <ColdEmailPage showToast={showToast}/>}
          {tab==="payments"  && <PaymentsPage  showToast={showToast}/>}
        </main>
      </div>
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)}/>}
    </>
  );
}

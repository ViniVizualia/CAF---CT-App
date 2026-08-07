import { useState, useEffect } from "react";
import {
  Users, ShieldCheck, ArrowLeft, LogOut, LogIn, Search, Filter, Phone,
  Calendar, Copy, Check, MessageCircle, Trash2, X, TrendingUp, Wallet,
  AlertTriangle, CheckCircle2, Clock, ChevronRight, Zap, DollarSign,
  UserPlus, Send, Waves, PieChart, Pencil, Settings, Building2
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Supabase config                                                     */
/* ------------------------------------------------------------------ */
const SUPABASE_URL = "https://ehsdsagrpohqxxqgvyse.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVoc2RzYWdycG9ocXh4cWd2eXNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYwMTA2MDgsImV4cCI6MjEwMTU4NjYwOH0.EZwW5WV68uOfpdAv4_mgnAb-yWXigosNCb_KKERqQLU";

const LOGO_DATA_URL =
  "data:image/png;base64," +
  "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" +
  "FBQUFOw5/h9VdziKGVAlewAAAABJRU5ErkJggg==";

async function sbFetch(path, { method = "GET", token, body, headers = {} } = {}) {
  const res = await fetch(`${SUPABASE_URL}${path}`, {
    method,
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${token || SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const raw = data?.error_description || data?.msg || data?.message || "Erro na requisição.";
    throw new Error(mapAuthError(raw));
  }
  return data;
}

function mapAuthError(msg) {
  if (msg.includes("Invalid login credentials")) return "E-mail ou senha incorretos.";
  if (msg.includes("already registered") || msg.includes("already exists")) return "Esse e-mail já está cadastrado. Tente entrar.";
  if (msg.toLowerCase().includes("password")) return "A senha precisa ter pelo menos 6 caracteres.";
  if (msg.includes("duplicate") || msg.includes("unique")) return "Você já tem uma matrícula (ou solicitação) nessa escola.";
  if (msg.includes("foreign key") || msg.includes("violat")) return "Não é possível excluir — existem registros vinculados a este item.";
  return msg;
}

function rpcCall(name, token, args = {}) {
  return sbFetch(`/rest/v1/rpc/${name}`, { method: "POST", token, body: args });
}

async function uploadReceipt(token, uid, file) {
  const path = `${uid}/${Date.now()}_${file.name}`;
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/comprovantes/${path}`, {
    method: "POST",
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token}`, "Content-Type": file.type || "application/octet-stream" },
    body: file,
  });
  if (!res.ok) throw new Error("Falha ao enviar o comprovante.");
  return path;
}

function waLink(whatsapp, text) {
  const digits = (whatsapp || "").replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

function firstOrSelf(v) { return Array.isArray(v) ? v[0] : v; }

/* ------------------------------------------------------------------ */
/* Design tokens                                                       */
/* ------------------------------------------------------------------ */
const C = {
  bg: "#080D16", panel: "#0E1626", card: "#131D30", border: "#22304C", borderSoft: "#1A2540",
  yellow: "#FFC72C", blue: "#1D5FD6", blueDeep: "#123B82", green: "#1FAA59", red: "#E5484D",
  amber: "#F5A623", sand: "#F3ECD9", text: "#EAF0FB", textMuted: "#8FA0C4", textDim: "#5C6D91",
};

const STATUS = {
  em_dia: { label: "Em dia", color: C.green, Icon: CheckCircle2 },
  pendente: { label: "Pendente", color: C.amber, Icon: Clock },
  atrasado: { label: "Atrasado", color: C.red, Icon: AlertTriangle },
};

const SITUACAO = {
  pendente_aprovacao: { label: "Aguardando aprovação", color: C.amber, Icon: Clock },
  aprovado: { label: "Ativo", color: C.green, Icon: CheckCircle2 },
  recusado: { label: "Recusado", color: C.red, Icon: X },
};

const PIX_TIPO_LABELS = { cpf: "CPF", cnpj: "CNPJ", email: "E-mail", telefone: "Telefone", aleatoria: "Chave Aleatória" };

function formatBRL(n) { return "R$ " + Number(n || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
function initials(name) { return (name || "?").split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase(); }
function formatDate(iso) { if (!iso) return ""; const [y, m, d] = iso.split("-"); return `${d}/${m}/${y}`; }

const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
.font-display{font-family:'Oswald',sans-serif;}
.font-body{font-family:'Inter',sans-serif;}
.font-score{font-family:'JetBrains Mono',monospace;font-variant-numeric:tabular-nums;}
@keyframes fadeIn{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}
.animate-fade-in{animation:fadeIn .6s ease-out both;}
@keyframes toastIn{from{opacity:0;transform:translate(-50%,10px);}to{opacity:1;transform:translate(-50%,0);}}
.animate-toast-in{animation:toastIn .25s ease-out both;}
*{scrollbar-width:thin;scrollbar-color:${C.border} transparent;}
::-webkit-scrollbar{width:8px;height:8px;}
::-webkit-scrollbar-thumb{background:${C.border};border-radius:8px;}
@media (prefers-reduced-motion: reduce){.animate-fade-in,.animate-toast-in{animation:none;}}
`;

/* ------------------------------------------------------------------ */
/* Presentational helpers                                              */
/* ------------------------------------------------------------------ */
function LogoPlaceholder({ size = 48 }) {
  return <img src={LOGO_DATA_URL} alt="CAF - CT App" className="shrink-0 object-contain" style={{ width: size, height: size }} />;
}

function StatusBadge({ status }) {
  const s = STATUS[status];
  if (!s) return null;
  const Icon = s.Icon;
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold font-body whitespace-nowrap" style={{ color: s.color, background: `${s.color}22`, border: `1px solid ${s.color}44` }}>
      <Icon size={13} /> {s.label}
    </span>
  );
}

function SituacaoBadge({ situacao }) {
  const s = SITUACAO[situacao];
  if (!s) return null;
  const Icon = s.Icon;
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold font-body whitespace-nowrap" style={{ color: s.color, background: `${s.color}22`, border: `1px solid ${s.color}44` }}>
      <Icon size={13} /> {s.label}
    </span>
  );
}

function SectionDivider() {
  return (
    <div className="flex items-center gap-3 my-1 select-none" aria-hidden="true">
      <div className="h-px flex-1" style={{ background: `linear-gradient(90deg, transparent, ${C.border}, transparent)` }} />
      <div className="flex gap-1">
        <span className="w-1.5 h-1.5 rotate-45 inline-block" style={{ background: C.yellow }} />
        <span className="w-1.5 h-1.5 rotate-45 inline-block" style={{ background: C.blue }} />
        <span className="w-1.5 h-1.5 rotate-45 inline-block" style={{ background: C.green }} />
      </div>
      <div className="h-px flex-1" style={{ background: `linear-gradient(90deg, transparent, ${C.border}, transparent)` }} />
    </div>
  );
}

function StatCard({ label, value, sub, color, Icon, progress }) {
  return (
    <div className="rounded-2xl p-5 border transition-all duration-200 hover:-translate-y-0.5" style={{ background: C.card, borderColor: C.border }}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] uppercase tracking-widest font-semibold font-body" style={{ color: C.textMuted }}>{label}</span>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${color}22` }}><Icon size={16} style={{ color }} /></div>
      </div>
      <div className="font-score text-3xl font-bold" style={{ color: C.text }}>{value}</div>
      {sub && <div className="text-xs mt-1 font-body" style={{ color: C.textDim }}>{sub}</div>}
      {typeof progress === "number" && (
        <div className="h-1.5 rounded-full mt-3 overflow-hidden" style={{ background: C.borderSoft }}>
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(progress, 100)}%`, background: color }} />
        </div>
      )}
    </div>
  );
}

function QrPlaceholder() {
  const size = 11;
  const cells = [];
  for (let r = 0; r < size; r++) for (let c = 0; c < size; c++) {
    const inTL = r < 3 && c < 3, inTR = r < 3 && c > size - 4, inBL = r > size - 4 && c < 3;
    cells.push(inTL || inTR || inBL ? true : (r * 13 + c * 7) % 9 < 4);
  }
  return (
    <div className="grid p-3 rounded-lg shrink-0" style={{ gridTemplateColumns: `repeat(${size}, 1fr)`, gap: 2, background: C.sand, width: 176, height: 176 }}>
      {cells.map((on, i) => (<div key={i} style={{ background: on ? C.blueDeep : "transparent", borderRadius: 1 }} />))}
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(4,7,14,0.7)" }} onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl border p-6 max-h-[90vh] overflow-y-auto" style={{ background: C.panel, borderColor: C.border }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display text-xl tracking-wide" style={{ color: C.text }}>{title}</h3>
          <button aria-label="Fechar" onClick={onClose} className="p-1.5 rounded-lg transition-colors hover:bg-white/5" style={{ color: C.textMuted }}><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function TopBar({ title, onBack, right }) {
  return (
    <div className="sticky top-0 z-30 backdrop-blur border-b" style={{ background: "rgba(8,13,22,0.85)", borderColor: C.border }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <button aria-label="Voltar" onClick={onBack} className="p-2 rounded-lg transition-colors hover:bg-white/5 shrink-0" style={{ color: C.textMuted }}><ArrowLeft size={18} /></button>
          <LogoPlaceholder size={36} />
          <div className="min-w-0">
            <div className="font-display text-sm tracking-wide leading-none" style={{ color: C.text }}>CAF - CT App</div>
            <div className="text-[10px] uppercase tracking-widest font-body truncate" style={{ color: C.textDim }}>{title}</div>
          </div>
        </div>
        {right}
      </div>
    </div>
  );
}

function Toast({ toast }) {
  const colorMap = { success: C.green, error: C.red, info: C.blue };
  const color = colorMap[toast.type] || C.green;
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] px-4 py-3 rounded-xl border shadow-lg flex items-center gap-2 animate-toast-in max-w-[90vw]" style={{ background: C.panel, borderColor: `${color}55`, color: C.text }}>
      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
      <span className="text-sm font-medium font-body">{toast.message}</span>
    </div>
  );
}

function AuthInput(props) {
  return <input {...props} className="w-full px-4 py-3 rounded-lg border outline-none mb-3 text-sm" style={{ background: C.card, borderColor: C.border, color: C.text }} />;
}

function FormInput({ label, ...props }) {
  return (
    <div>
      {label && <label className="text-xs font-semibold uppercase tracking-wide mb-1.5 block" style={{ color: C.textMuted }}>{label}</label>}
      <input {...props} className="w-full px-3 py-2.5 rounded-lg border outline-none text-sm" style={{ background: C.card, borderColor: C.border, color: C.text }} />
    </div>
  );
}

function EscolaFormFields({ form, setForm }) {
  return (
    <div className="space-y-4">
      <FormInput label="Nome da escola" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide mb-1.5 block" style={{ color: C.textMuted }}>Tipo de chave Pix</label>
          <select value={form.pix_tipo} onChange={(e) => setForm({ ...form, pix_tipo: e.target.value })} className="w-full px-3 py-2.5 rounded-lg border outline-none text-sm" style={{ background: C.card, borderColor: C.border, color: C.text }}>
            {Object.entries(PIX_TIPO_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        <FormInput label="Chave Pix" value={form.pix_chave} onChange={(e) => setForm({ ...form, pix_chave: e.target.value })} />
      </div>
      <FormInput label="Nome do beneficiário" value={form.beneficiario_nome} onChange={(e) => setForm({ ...form, beneficiario_nome: e.target.value })} />
      <div className="grid sm:grid-cols-3 gap-4">
        <FormInput label="Banco" value={form.beneficiario_banco} onChange={(e) => setForm({ ...form, beneficiario_banco: e.target.value })} />
        <FormInput label="Agência" value={form.beneficiario_agencia} onChange={(e) => setForm({ ...form, beneficiario_agencia: e.target.value })} />
        <FormInput label="Conta" value={form.beneficiario_conta} onChange={(e) => setForm({ ...form, beneficiario_conta: e.target.value })} />
      </div>
      <FormInput label="WhatsApp de contato (DDI+DDD+número, só dígitos)" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} placeholder="5511999999999" />
    </div>
  );
}

const BLANK_ESCOLA_FORM = { nome: "", pix_tipo: "email", pix_chave: "", beneficiario_nome: "", beneficiario_banco: "", beneficiario_agencia: "", beneficiario_conta: "", whatsapp: "" };

/* ------------------------------------------------------------------ */
/* Main App                                                             */
/* ------------------------------------------------------------------ */
export default function CAFCTApp() {
  const [view, setView] = useState("landing");

  // auth
  const [session, setSession] = useState(null);
  const [role, setRole] = useState(null); // 'admin' | 'super_admin' | null
  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState({ email: "", password: "", nome: "", telefone: "" });
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  const [toast, setToast] = useState(null);
  function showToast(message, type = "success") { setToast({ message, type }); setTimeout(() => setToast(null), 2600); }

  /* ---------------- Aluno-side state ---------------- */
  const [minhasMatriculas, setMinhasMatriculas] = useState([]);
  const [allPlans, setAllPlans] = useState([]);
  const [escolasCatalogo, setEscolasCatalogo] = useState([]);
  const [selectedMatriculaId, setSelectedMatriculaId] = useState(null);
  const [showExplorar, setShowExplorar] = useState(false);
  const [browsingEscolaId, setBrowsingEscolaId] = useState(null);
  const [selectedJoinPlanId, setSelectedJoinPlanId] = useState(null);
  const [pixCopied, setPixCopied] = useState(false);

  function getPlanGlobal(id) { return allPlans.find((p) => p.id === id) || { nome: "—", categoria: "Coletiva", frequencia: "", preco: 0 }; }

  /* ---------------- Admin (dono de escola) state ---------------- */
  const [escola, setEscola] = useState(null);
  const [plans, setPlans] = useState([]);
  const [escolaForm, setEscolaForm] = useState(null);
  const [allAlunos, setAllAlunos] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [planFilter, setPlanFilter] = useState("todos");
  const [onlyPendingReview, setOnlyPendingReview] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [planForm, setPlanForm] = useState({ nome: "", categoria: "Coletiva", frequencia: "", preco: "" });
  const [confirmDeletePlanId, setConfirmDeletePlanId] = useState(null);

  function getPlan(id) { return plans.find((p) => p.id === id) || { nome: "—", categoria: "Coletiva", frequencia: "", preco: 0 }; }

  /* ---------------- Super admin state ---------------- */
  const [allEscolas, setAllEscolas] = useState([]);
  const [adminsByEscola, setAdminsByEscola] = useState({});
  const [showEscolaModal, setShowEscolaModal] = useState(false);
  const [editingEscola, setEditingEscola] = useState(null);
  const [newEscolaForm, setNewEscolaForm] = useState(BLANK_ESCOLA_FORM);
  const [promoteEmail, setPromoteEmail] = useState("");
  const [promoteResults, setPromoteResults] = useState([]);
  const [promoteEscolaId, setPromoteEscolaId] = useState("");

  useEffect(() => {
    if (escola) {
      setEscolaForm({
        nome: escola.nome || "", pix_tipo: escola.pix_tipo || "email", pix_chave: escola.pix_chave || "",
        beneficiario_nome: escola.beneficiario_nome || "", beneficiario_banco: escola.beneficiario_banco || "",
        beneficiario_agencia: escola.beneficiario_agencia || "", beneficiario_conta: escola.beneficiario_conta || "",
        whatsapp: escola.whatsapp || "",
      });
    }
  }, [escola]);

  function resetAuthForm() { setAuthForm({ email: "", password: "", nome: "", telefone: "" }); setAuthError(""); }
  function goLanding() { setView("landing"); }

  function handleLogout() {
    setSession(null); setRole(null); setAuthMode("login"); resetAuthForm();
    setMinhasMatriculas([]); setAllPlans([]); setEscolasCatalogo([]); setSelectedMatriculaId(null);
    setShowExplorar(false); setBrowsingEscolaId(null); setSelectedJoinPlanId(null);
    setEscola(null); setPlans([]); setEscolaForm(null); setAllAlunos([]); setPendingRequests([]);
    setAllEscolas([]); setAdminsByEscola({}); setPromoteResults([]); setPromoteEmail(""); setPromoteEscolaId("");
  }

  function handleAlunoBack() {
    if (showExplorar) { setShowExplorar(false); setBrowsingEscolaId(null); setSelectedJoinPlanId(null); return; }
    if (selectedMatriculaId) { setSelectedMatriculaId(null); return; }
    goLanding();
  }

  /* ---------------- Aluno auth ---------------- */
  async function loadAlunoContext(token) {
    const [matRows, planRows, escolaRows] = await Promise.all([
      sbFetch("/rest/v1/matriculas?select=*,pagamentos(*),escolas(*)&order=created_at.asc", { token }),
      sbFetch("/rest/v1/planos?select=*", { token }),
      sbFetch("/rest/v1/escolas?select=*&order=nome.asc", { token }),
    ]);
    setMinhasMatriculas(matRows.map((r) => ({ ...r, escolas: firstOrSelf(r.escolas) })));
    setAllPlans(planRows);
    setEscolasCatalogo(escolaRows);
  }

  async function handleAlunoLogin() {
    setAuthError(""); setAuthLoading(true);
    try {
      const data = await sbFetch("/auth/v1/token?grant_type=password", { method: "POST", body: { email: authForm.email, password: authForm.password } });
      setSession({ access_token: data.access_token, user: data.user });
      await loadAlunoContext(data.access_token);
    } catch (e) { setAuthError(e.message); } finally { setAuthLoading(false); }
  }

  async function handleAlunoSignup() {
    setAuthError(""); setAuthLoading(true);
    try {
      if (!authForm.nome.trim()) throw new Error("Informe seu nome.");
      if (!authForm.telefone.trim()) throw new Error("Informe seu telefone.");
      const data = await sbFetch("/auth/v1/signup", {
        method: "POST",
        body: { email: authForm.email, password: authForm.password, data: { nome: authForm.nome.trim(), telefone: authForm.telefone.trim() } },
      });
      if (data.access_token) {
        setSession({ access_token: data.access_token, user: data.user });
        await loadAlunoContext(data.access_token);
        showToast("Conta criada com sucesso!", "success");
      } else {
        showToast("Conta criada! Confirme seu e-mail e depois faça login.", "success");
        setAuthMode("login");
      }
    } catch (e) { setAuthError(e.message); } finally { setAuthLoading(false); }
  }

  async function handleRequestJoin() {
    if (!selectedJoinPlanId || !browsingEscolaId) { showToast("Escolha um plano.", "error"); return; }
    try {
      const [row] = await sbFetch("/rest/v1/matriculas", {
        method: "POST", token: session.access_token,
        body: { perfil_id: session.user.id, escola_id: browsingEscolaId, plano_id: selectedJoinPlanId, dia_vencimento: 10, situacao: "pendente_aprovacao", status: "pendente", comprovante_pendente: false },
        headers: { Prefer: "return=representation" },
      });
      const escolaInfo = escolasCatalogo.find((e) => e.id === browsingEscolaId);
      setMinhasMatriculas((prev) => [...prev, { ...row, escolas: escolaInfo, pagamentos: [] }]);
      setShowExplorar(false); setBrowsingEscolaId(null); setSelectedJoinPlanId(null);
      showToast("Solicitação enviada! Aguarde a aprovação da escola.", "success");
    } catch (e) { showToast(e.message, "error"); }
  }

  async function handleChangePlan(matriculaId, planId) {
    try {
      await rpcCall("trocar_plano", session.access_token, { p_matricula_id: matriculaId, p_plano_id: planId });
      setMinhasMatriculas((prev) => prev.map((m) => (m.id === matriculaId ? { ...m, plano_id: planId } : m)));
      showToast("Plano atualizado com sucesso!", "success");
    } catch (e) { showToast(e.message, "error"); }
  }

  async function handleSendReceiptFile(matriculaId, file) {
    if (!file) return;
    try {
      await uploadReceipt(session.access_token, session.user.id, file);
      await rpcCall("enviar_comprovante", session.access_token, { p_matricula_id: matriculaId });
      setMinhasMatriculas((prev) => prev.map((m) => (m.id === matriculaId ? { ...m, comprovante_pendente: true } : m)));
      showToast("Comprovante enviado! Aguardando revisão do admin.", "success");
    } catch (e) { showToast(e.message, "error"); }
  }

  function copyPix(key) {
    try {
      navigator.clipboard.writeText(key || "");
      setPixCopied(true);
      showToast("Chave Pix copiada!", "success");
      setTimeout(() => setPixCopied(false), 2000);
    } catch (e) { showToast("Copie manualmente: " + key, "info"); }
  }

  /* ---------------- Admin (dono de escola) auth + dados ---------------- */
  async function handleAdminLogin() {
    setAuthError(""); setAuthLoading(true);
    try {
      const data = await sbFetch("/auth/v1/token?grant_type=password", { method: "POST", body: { email: authForm.email, password: authForm.password } });
      const perfilRows = await sbFetch(`/rest/v1/perfis?select=role,escola_id&id=eq.${data.user.id}`, { token: data.access_token });
      const perfil = perfilRows[0];
      if (!perfil || (perfil.role !== "admin" && perfil.role !== "super_admin")) { setAuthError("Essa conta não tem permissão de administrador."); return; }
      if (perfil.role === "admin" && !perfil.escola_id) { setAuthError("Sua conta de admin ainda não está vinculada a uma escola."); return; }
      setSession({ access_token: data.access_token, user: data.user });
      setRole(perfil.role);
      if (perfil.role === "super_admin") await loadSuperAdminData(data.access_token);
      else await loadAllAlunos(data.access_token, perfil.escola_id);
    } catch (e) { setAuthError(e.message); } finally { setAuthLoading(false); }
  }

  async function loadAllAlunos(token, escolaId) {
    setDataLoading(true);
    try {
      const [matRows, escolaRows, planRows] = await Promise.all([
        sbFetch("/rest/v1/matriculas?select=*,perfis(nome,telefone,email)&order=created_at.asc", { token }),
        sbFetch(`/rest/v1/escolas?select=*&id=eq.${escolaId}`, { token }),
        sbFetch(`/rest/v1/planos?select=*&escola_id=eq.${escolaId}&order=preco.asc`, { token }),
      ]);
      const normalized = matRows.map((r) => ({ ...r, perfis: firstOrSelf(r.perfis) }));
      setAllAlunos(normalized.filter((r) => r.situacao === "aprovado"));
      setPendingRequests(normalized.filter((r) => r.situacao === "pendente_aprovacao"));
      setEscola(escolaRows[0] || null);
      setPlans(planRows);
    } finally { setDataLoading(false); }
  }

  async function handleApproveRequest(id) {
    try {
      await sbFetch(`/rest/v1/matriculas?id=eq.${id}`, { method: "PATCH", token: session.access_token, body: { situacao: "aprovado" } });
      setPendingRequests((prev) => {
        const item = prev.find((r) => r.id === id);
        if (item) setAllAlunos((a) => [...a, { ...item, situacao: "aprovado" }]);
        return prev.filter((r) => r.id !== id);
      });
      showToast("Solicitação aprovada!", "success");
    } catch (e) { showToast(e.message, "error"); }
  }

  async function handleRejectRequest(id) {
    try {
      await sbFetch(`/rest/v1/matriculas?id=eq.${id}`, { method: "DELETE", token: session.access_token });
      setPendingRequests((prev) => prev.filter((r) => r.id !== id));
      showToast("Solicitação recusada.", "info");
    } catch (e) { showToast(e.message, "error"); }
  }

  async function handleMarkStatus(id, status) {
    try {
      await sbFetch(`/rest/v1/matriculas?id=eq.${id}`, { method: "PATCH", token: session.access_token, body: { status } });
      if (status === "em_dia") {
        const aluno = allAlunos.find((a) => a.id === id);
        await sbFetch("/rest/v1/pagamentos", { method: "POST", token: session.access_token, body: { matricula_id: id, valor: getPlan(aluno.plano_id).preco, status: "Pago" } });
      }
      setAllAlunos((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
      showToast(status === "em_dia" ? "Pagamento confirmado!" : "Status atualizado para pendente.", status === "em_dia" ? "success" : "info");
    } catch (e) { showToast(e.message, "error"); }
  }

  async function handleApproveReceipt(id) {
    try {
      const aluno = allAlunos.find((a) => a.id === id);
      await sbFetch(`/rest/v1/matriculas?id=eq.${id}`, { method: "PATCH", token: session.access_token, body: { status: "em_dia", comprovante_pendente: false } });
      await sbFetch("/rest/v1/pagamentos", { method: "POST", token: session.access_token, body: { matricula_id: id, valor: getPlan(aluno.plano_id).preco, status: "Pago" } });
      setAllAlunos((prev) => prev.map((a) => (a.id === id ? { ...a, status: "em_dia", comprovante_pendente: false } : a)));
      showToast("Pagamento aprovado!", "success");
    } catch (e) { showToast(e.message, "error"); }
  }

  async function handleRejectReceipt(id) {
    try {
      await sbFetch(`/rest/v1/matriculas?id=eq.${id}`, { method: "PATCH", token: session.access_token, body: { comprovante_pendente: false } });
      setAllAlunos((prev) => prev.map((a) => (a.id === id ? { ...a, comprovante_pendente: false } : a)));
      showToast("Comprovante recusado. O aluno pode reenviar.", "info");
    } catch (e) { showToast(e.message, "error"); }
  }

  async function handleDeleteStudent(id) {
    try {
      const aluno = allAlunos.find((a) => a.id === id);
      await sbFetch(`/rest/v1/matriculas?id=eq.${id}`, { method: "DELETE", token: session.access_token });
      setAllAlunos((prev) => prev.filter((a) => a.id !== id));
      setConfirmDeleteId(null);
      showToast(`${aluno?.perfis?.nome || "Aluno"} removido.`, "info");
    } catch (e) { showToast(e.message, "error"); }
  }

  async function handleSaveEscolaConfig() {
    try {
      await sbFetch(`/rest/v1/escolas?id=eq.${escola.id}`, { method: "PATCH", token: session.access_token, body: escolaForm });
      setEscola((prev) => ({ ...prev, ...escolaForm }));
      showToast("Configurações salvas!", "success");
    } catch (e) { showToast(e.message, "error"); }
  }

  function openNewPlanModal() { setEditingPlan(null); setPlanForm({ nome: "", categoria: "Coletiva", frequencia: "", preco: "" }); setShowPlanModal(true); }
  function openEditPlanModal(p) { setEditingPlan(p); setPlanForm({ nome: p.nome, categoria: p.categoria, frequencia: p.frequencia, preco: String(p.preco) }); setShowPlanModal(true); }

  async function handleSavePlan() {
    if (!planForm.nome.trim() || !planForm.preco) { showToast("Preencha nome e preço.", "error"); return; }
    try {
      if (editingPlan) {
        await sbFetch(`/rest/v1/planos?id=eq.${editingPlan.id}`, { method: "PATCH", token: session.access_token, body: { nome: planForm.nome.trim(), categoria: planForm.categoria, frequencia: planForm.frequencia.trim(), preco: Number(planForm.preco) } });
        setPlans((prev) => prev.map((p) => (p.id === editingPlan.id ? { ...p, ...planForm, preco: Number(planForm.preco) } : p)).sort((a, b) => a.preco - b.preco));
        showToast("Plano atualizado!", "success");
      } else {
        const [row] = await sbFetch("/rest/v1/planos", { method: "POST", token: session.access_token, body: { nome: planForm.nome.trim(), categoria: planForm.categoria, frequencia: planForm.frequencia.trim(), preco: Number(planForm.preco), escola_id: escola.id }, headers: { Prefer: "return=representation" } });
        setPlans((prev) => [...prev, row].sort((a, b) => a.preco - b.preco));
        showToast("Plano criado com sucesso!", "success");
      }
      setShowPlanModal(false); setEditingPlan(null);
    } catch (e) { showToast(e.message, "error"); }
  }

  async function handleDeletePlan(id) {
    try {
      await sbFetch(`/rest/v1/planos?id=eq.${id}`, { method: "DELETE", token: session.access_token });
      setPlans((prev) => prev.filter((p) => p.id !== id));
      setConfirmDeletePlanId(null);
      showToast("Plano removido.", "info");
    } catch (e) { showToast(e.message, "error"); setConfirmDeletePlanId(null); }
  }

  /* ---------------- Super admin ---------------- */
  async function loadSuperAdminData(token) {
    setDataLoading(true);
    try {
      const [escolasRows, adminRows] = await Promise.all([
        sbFetch("/rest/v1/escolas?select=*&order=nome.asc", { token }),
        sbFetch("/rest/v1/perfis?select=nome,email,escola_id&role=eq.admin", { token }),
      ]);
      setAllEscolas(escolasRows);
      const map = {};
      adminRows.forEach((a) => { if (a.escola_id) map[a.escola_id] = a; });
      setAdminsByEscola(map);
    } finally { setDataLoading(false); }
  }

  function openNewEscolaModal() { setEditingEscola(null); setNewEscolaForm(BLANK_ESCOLA_FORM); setShowEscolaModal(true); }
  function openEditEscolaModal(e) {
    setEditingEscola(e);
    setNewEscolaForm({ nome: e.nome, pix_tipo: e.pix_tipo, pix_chave: e.pix_chave, beneficiario_nome: e.beneficiario_nome, beneficiario_banco: e.beneficiario_banco, beneficiario_agencia: e.beneficiario_agencia, beneficiario_conta: e.beneficiario_conta, whatsapp: e.whatsapp });
    setShowEscolaModal(true);
  }

  async function handleSaveEscola() {
    if (!newEscolaForm.nome.trim()) { showToast("Informe o nome da escola.", "error"); return; }
    try {
      if (editingEscola) {
        await sbFetch(`/rest/v1/escolas?id=eq.${editingEscola.id}`, { method: "PATCH", token: session.access_token, body: newEscolaForm });
        setAllEscolas((prev) => prev.map((e) => (e.id === editingEscola.id ? { ...e, ...newEscolaForm } : e)));
        showToast("Escola atualizada!", "success");
      } else {
        const [row] = await sbFetch("/rest/v1/escolas", { method: "POST", token: session.access_token, body: newEscolaForm, headers: { Prefer: "return=representation" } });
        setAllEscolas((prev) => [...prev, row].sort((a, b) => a.nome.localeCompare(b.nome)));
        showToast("Escola criada com sucesso!", "success");
      }
      setShowEscolaModal(false); setEditingEscola(null);
    } catch (e) { showToast(e.message, "error"); }
  }

  async function handleSearchPerfil() {
    if (!promoteEmail.trim()) return;
    try {
      const rows = await sbFetch(`/rest/v1/perfis?select=id,nome,email,role,escola_id&email=ilike.*${encodeURIComponent(promoteEmail.trim())}*`, { token: session.access_token });
      setPromoteResults(rows);
      if (!rows.length) showToast("Nenhuma conta encontrada com esse e-mail.", "info");
    } catch (e) { showToast(e.message, "error"); }
  }

  async function handlePromote(perfilId) {
    if (!promoteEscolaId) { showToast("Escolha uma escola.", "error"); return; }
    try {
      await sbFetch(`/rest/v1/perfis?id=eq.${perfilId}`, { method: "PATCH", token: session.access_token, body: { role: "admin", escola_id: promoteEscolaId } });
      setPromoteResults((prev) => prev.map((p) => (p.id === perfilId ? { ...p, role: "admin", escola_id: promoteEscolaId } : p)));
      await loadSuperAdminData(session.access_token);
      showToast("Administrador definido com sucesso!", "success");
    } catch (e) { showToast(e.message, "error"); }
  }

  async function handleDemote(perfilId) {
    try {
      await sbFetch(`/rest/v1/perfis?id=eq.${perfilId}`, { method: "PATCH", token: session.access_token, body: { role: "aluno", escola_id: null } });
      setPromoteResults((prev) => prev.map((p) => (p.id === perfilId ? { ...p, role: "aluno", escola_id: null } : p)));
      await loadSuperAdminData(session.access_token);
      showToast("Administrador removido.", "info");
    } catch (e) { showToast(e.message, "error"); }
  }

  /* ---------------- Derived data (admin da escola) ---------------- */
  const totalAtivos = allAlunos.length;
  const faturamentoPrevisto = allAlunos.reduce((sum, a) => sum + Number(getPlan(a.plano_id).preco), 0);
  const faturamentoArrecadado = allAlunos.filter((a) => a.status === "em_dia").reduce((sum, a) => sum + Number(getPlan(a.plano_id).preco), 0);
  const inadimplentes = allAlunos.filter((a) => a.status !== "em_dia").length;
  const ticketMedio = totalAtivos ? faturamentoPrevisto / totalAtivos : 0;
  const pendingReview = allAlunos.filter((a) => a.comprovante_pendente).length;
  const byPlan = plans.map((p) => ({ ...p, count: allAlunos.filter((a) => a.plano_id === p.id).length }));
  const coletiva = allAlunos.filter((a) => getPlan(a.plano_id).categoria === "Coletiva").length;
  const personal = allAlunos.filter((a) => getPlan(a.plano_id).categoria === "Personal").length;

  const filteredStudents = allAlunos.filter((s) => {
    const nome = s.perfis?.nome || "";
    const matchesSearch = nome.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "todos" || s.status === statusFilter;
    const matchesPlan = planFilter === "todos" || s.plano_id === planFilter;
    const matchesPending = !onlyPendingReview || s.comprovante_pendente;
    return matchesSearch && matchesStatus && matchesPlan && matchesPending;
  });

  const selectedMatricula = minhasMatriculas.find((m) => m.id === selectedMatriculaId);
  const selectedMatriculaPagamentos = (selectedMatricula?.pagamentos || []).slice().sort((x, y) => new Date(y.data) - new Date(x.data));

  return (
    <div className="min-h-screen font-body" style={{ background: C.bg, color: C.text }}>
      <style>{GLOBAL_CSS}</style>

      {/* ---------------------------------------------------------- */}
      {/* LANDING                                                     */}
      {/* ---------------------------------------------------------- */}
      {view === "landing" && (
        <div className="min-h-screen flex flex-col relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: `repeating-linear-gradient(115deg, ${C.borderSoft} 0px, ${C.borderSoft} 1px, transparent 1px, transparent 64px)`, opacity: 0.5 }} />
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full blur-3xl pointer-events-none" style={{ background: C.yellow, opacity: 0.08 }} />
          <div className="absolute -bottom-32 -left-24 w-96 h-96 rounded-full blur-3xl pointer-events-none" style={{ background: C.blue, opacity: 0.12 }} />

          <div className="relative flex-1 flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="flex items-center gap-3 mb-8 animate-fade-in">
              <LogoPlaceholder size={56} />
              <div className="text-left">
                <div className="font-display text-2xl tracking-wide" style={{ color: C.text }}>CAF - CT App</div>
                <div className="text-xs uppercase tracking-[0.2em] font-semibold" style={{ color: C.yellow }}>Gestão de Alunos</div>
              </div>
            </div>

            <h1 className="font-display text-4xl sm:text-6xl font-semibold tracking-wide leading-[1.05] mb-4 animate-fade-in" style={{ color: C.text }}>
              ENTRE NA<br /><span style={{ color: C.yellow }}>QUADRA</span>
            </h1>
            <p className="max-w-md text-sm sm:text-base mb-12 animate-fade-in" style={{ color: C.textMuted }}>
              Plataforma de gestão de alunos, planos e pagamentos pra centros de treino. Escolha como deseja entrar.
            </p>

            <div className="grid sm:grid-cols-2 gap-4 w-full max-w-2xl">
              <button onClick={() => setView("aluno")} className="group text-left p-6 rounded-2xl border transition-all duration-200 hover:-translate-y-1" style={{ background: C.card, borderColor: C.border }}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ background: `${C.yellow}22` }}><Users size={20} style={{ color: C.yellow }} /></div>
                <div className="font-display text-lg tracking-wide mb-1">Sou Aluno</div>
                <div className="text-sm mb-4" style={{ color: C.textDim }}>Escolha suas escolas, acompanhe planos e pague suas mensalidades.</div>
                <div className="flex items-center gap-1 text-sm font-semibold" style={{ color: C.yellow }}>Acessar área do aluno <ChevronRight size={16} className="transition-transform group-hover:translate-x-1" /></div>
              </button>

              <button onClick={() => setView("admin")} className="group text-left p-6 rounded-2xl border transition-all duration-200 hover:-translate-y-1" style={{ background: C.card, borderColor: C.border }}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ background: `${C.blue}22` }}><ShieldCheck size={20} style={{ color: C.blue }} /></div>
                <div className="font-display text-lg tracking-wide mb-1">Área Administrativa</div>
                <div className="text-sm mb-4" style={{ color: C.textDim }}>Gerencie sua escola: alunos, planos e configurações de pagamento.</div>
                <div className="flex items-center gap-1 text-sm font-semibold" style={{ color: C.blue }}>Acessar painel <ChevronRight size={16} className="transition-transform group-hover:translate-x-1" /></div>
              </button>
            </div>
          </div>

          <div className="relative text-center pb-6 text-xs" style={{ color: C.textDim }}>CAF - CT App · Gestão de alunos pra centros de treino.</div>
        </div>
      )}

      {/* ---------------------------------------------------------- */}
      {/* ALUNO — login / cadastro                                    */}
      {/* ---------------------------------------------------------- */}
      {view === "aluno" && !session && (
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="w-full max-w-sm">
            <div className="flex justify-center mb-6"><LogoPlaceholder size={56} /></div>
            <h1 className="font-display text-2xl tracking-wide text-center mb-1">Área do Aluno</h1>
            <p className="text-sm text-center mb-6" style={{ color: C.textDim }}>{authMode === "login" ? "Entre com sua conta." : "Crie sua conta e escolha suas escolas."}</p>

            <div className="flex rounded-lg border overflow-hidden mb-5" style={{ borderColor: C.border }}>
              <button onClick={() => { setAuthMode("login"); setAuthError(""); }} className="flex-1 py-2 text-sm font-semibold transition-colors" style={{ background: authMode === "login" ? C.blue : "transparent", color: authMode === "login" ? "#fff" : C.textMuted }}>Entrar</button>
              <button onClick={() => { setAuthMode("signup"); setAuthError(""); }} className="flex-1 py-2 text-sm font-semibold transition-colors" style={{ background: authMode === "signup" ? C.blue : "transparent", color: authMode === "signup" ? "#fff" : C.textMuted }}>Criar conta</button>
            </div>

            {authMode === "signup" && (<>
              <AuthInput placeholder="Nome completo" value={authForm.nome} onChange={(e) => setAuthForm({ ...authForm, nome: e.target.value })} />
              <AuthInput placeholder="Telefone" value={authForm.telefone} onChange={(e) => setAuthForm({ ...authForm, telefone: e.target.value })} />
            </>)}
            <AuthInput type="email" placeholder="E-mail" value={authForm.email} onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })} />
            <AuthInput type="password" placeholder="Senha" value={authForm.password} onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })} />

            {authError && <div className="text-xs mb-3" style={{ color: C.red }}>{authError}</div>}

            <button onClick={authMode === "login" ? handleAlunoLogin : handleAlunoSignup} disabled={authLoading} className="w-full py-3 rounded-lg font-semibold text-sm mb-3 flex items-center justify-center gap-2" style={{ background: C.blue, color: "#fff", opacity: authLoading ? 0.7 : 1 }}>
              <LogIn size={16} /> {authLoading ? "Aguarde..." : authMode === "login" ? "Entrar" : "Criar conta"}
            </button>
            <button onClick={goLanding} className="text-xs underline block mx-auto" style={{ color: C.textMuted }}>Voltar</button>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------- */}
      {/* ALUNO — Minhas Escolas (hub)                                 */}
      {/* ---------------------------------------------------------- */}
      {view === "aluno" && session && !selectedMatriculaId && (
        <div>
          <TopBar title="Minhas Escolas" onBack={handleAlunoBack} right={
            <button onClick={handleLogout} className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold px-3 py-2 rounded-lg transition-colors hover:bg-white/5" style={{ color: C.textMuted }}><LogOut size={15} /> <span className="hidden sm:inline">Sair</span></button>
          } />

          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-4">
            {minhasMatriculas.length === 0 && !showExplorar && (
              <div className="rounded-2xl border p-8 text-center mb-4" style={{ background: C.card, borderColor: C.border }}>
                <Waves size={22} className="mx-auto mb-2" style={{ color: C.textDim }} />
                <div className="text-sm" style={{ color: C.textDim }}>Você ainda não faz parte de nenhuma escola.</div>
              </div>
            )}

            {minhasMatriculas.map((m) => (
              <button key={m.id} onClick={() => setSelectedMatriculaId(m.id)} className="w-full text-left rounded-2xl border p-5 transition-all duration-200 hover:-translate-y-0.5 block" style={{ background: C.card, borderColor: C.border }}>
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-display text-lg truncate">{m.escolas?.nome}</div>
                    {m.situacao === "aprovado" && <div className="text-xs mt-1" style={{ color: C.textDim }}>{getPlanGlobal(m.plano_id).nome}</div>}
                  </div>
                  <SituacaoBadge situacao={m.situacao} />
                </div>
              </button>
            ))}

            {!showExplorar ? (
              <button onClick={() => setShowExplorar(true)} className="w-full py-3.5 rounded-2xl border-2 border-dashed text-sm font-semibold transition-colors hover:bg-white/5" style={{ borderColor: C.borderSoft, color: C.textMuted }}>+ Entrar em outra escola</button>
            ) : (
              <div className="space-y-3">
                <h3 className="font-display text-lg tracking-wide mt-4 mb-2">Escolas disponíveis</h3>
                {escolasCatalogo.filter((e) => !minhasMatriculas.some((m) => m.escola_id === e.id)).map((e) => (
                  <div key={e.id} className="rounded-2xl border p-4" style={{ background: C.card, borderColor: C.border }}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-display">{e.nome}</div>
                      {browsingEscolaId !== e.id && (
                        <button onClick={() => { setBrowsingEscolaId(e.id); setSelectedJoinPlanId(null); }} className="text-xs font-semibold px-3 py-2 rounded-lg" style={{ background: C.blue, color: "#fff" }}>Ver planos</button>
                      )}
                    </div>
                    {browsingEscolaId === e.id && (
                      <div className="space-y-2 mt-3">
                        {allPlans.filter((p) => p.escola_id === e.id).map((p) => (
                          <button key={p.id} onClick={() => setSelectedJoinPlanId(p.id)} className="w-full text-left rounded-lg border p-3 flex items-center justify-between transition-colors" style={{ borderColor: selectedJoinPlanId === p.id ? C.blue : C.border, background: selectedJoinPlanId === p.id ? `${C.blue}14` : "transparent" }}>
                            <div>
                              <div className="text-sm font-semibold">{p.nome}</div>
                              <div className="text-xs" style={{ color: C.textDim }}>{p.frequencia}</div>
                            </div>
                            <div className="font-score font-bold">{formatBRL(p.preco)}</div>
                          </button>
                        ))}
                        {allPlans.filter((p) => p.escola_id === e.id).length === 0 && (<div className="text-xs" style={{ color: C.textDim }}>Essa escola ainda não tem planos cadastrados.</div>)}
                        <button onClick={handleRequestJoin} disabled={!selectedJoinPlanId} className="w-full py-2.5 rounded-lg text-sm font-semibold transition-opacity" style={{ background: C.green, color: "#fff", opacity: selectedJoinPlanId ? 1 : 0.5 }}>Solicitar entrada</button>
                      </div>
                    )}
                  </div>
                ))}
                {escolasCatalogo.filter((e) => !minhasMatriculas.some((m) => m.escola_id === e.id)).length === 0 && (<div className="text-sm text-center py-4" style={{ color: C.textDim }}>Você já solicitou ou faz parte de todas as escolas cadastradas.</div>)}
                <button onClick={() => { setShowExplorar(false); setBrowsingEscolaId(null); }} className="text-xs underline block mx-auto pt-2" style={{ color: C.textMuted }}>Cancelar</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------- */}
      {/* ALUNO — detalhe de uma matrícula                             */}
      {/* ---------------------------------------------------------- */}
      {view === "aluno" && session && selectedMatricula && (
        <div>
          <TopBar title={selectedMatricula.escolas?.nome || "Minha Escola"} onBack={handleAlunoBack} right={
            <button onClick={handleLogout} className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold px-3 py-2 rounded-lg transition-colors hover:bg-white/5" style={{ color: C.textMuted }}><LogOut size={15} /> <span className="hidden sm:inline">Sair</span></button>
          } />

          {selectedMatricula.situacao !== "aprovado" ? (
            <div className="max-w-md mx-auto px-4 py-16 text-center">
              <SituacaoBadge situacao={selectedMatricula.situacao} />
              <p className="text-sm mt-4" style={{ color: C.textDim }}>
                {selectedMatricula.situacao === "pendente_aprovacao" ? "Sua solicitação está aguardando aprovação do dono da escola." : "Sua solicitação foi recusada por essa escola."}
              </p>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-10">
              {/* Plano atual */}
              <section>
                <div className="rounded-2xl border overflow-hidden" style={{ background: C.card, borderColor: C.border }}>
                  <div className="h-1.5" style={{ background: `linear-gradient(90deg, ${C.yellow}, ${C.blue})` }} />
                  <div className="p-6">
                    <div className="grid sm:grid-cols-3 gap-4">
                      <div>
                        <div className="text-[11px] uppercase tracking-widest font-semibold mb-1" style={{ color: C.textMuted }}>Plano atual</div>
                        <div className="font-display text-base">{getPlanGlobal(selectedMatricula.plano_id).nome}</div>
                      </div>
                      <div>
                        <div className="text-[11px] uppercase tracking-widest font-semibold mb-1" style={{ color: C.textMuted }}>Valor mensal</div>
                        <div className="font-score text-lg font-bold" style={{ color: C.yellow }}>{formatBRL(getPlanGlobal(selectedMatricula.plano_id).preco)}</div>
                      </div>
                      <div>
                        <div className="text-[11px] uppercase tracking-widest font-semibold mb-1" style={{ color: C.textMuted }}>Vencimento</div>
                        <div className="flex items-center gap-1.5 text-sm"><Calendar size={14} style={{ color: C.textMuted }} /> Todo dia {selectedMatricula.dia_vencimento}</div>
                      </div>
                    </div>

                    <div className="mt-5 flex flex-wrap items-center gap-2">
                      <StatusBadge status={selectedMatricula.status} />
                      {selectedMatricula.comprovante_pendente && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold font-body whitespace-nowrap" style={{ color: C.amber, background: `${C.amber}22`, border: `1px solid ${C.amber}44` }}><Send size={13} /> Comprovante em análise</span>
                      )}
                    </div>
                  </div>
                </div>
              </section>

              <SectionDivider />

              {/* Catálogo de planos */}
              <section>
                <h2 className="font-display text-xl tracking-wide mb-1">Planos Disponíveis</h2>
                <p className="text-sm mb-5" style={{ color: C.textDim }}>Altere seu plano nessa escola quando quiser.</p>
                <div className="grid sm:grid-cols-2 gap-4">
                  {allPlans.filter((p) => p.escola_id === selectedMatricula.escola_id).map((p) => {
                    const isCurrent = p.id === selectedMatricula.plano_id;
                    const accent = p.categoria === "Coletiva" ? C.yellow : C.blue;
                    return (
                      <div key={p.id} className="rounded-2xl border p-5 transition-all duration-200" style={{ background: isCurrent ? `${accent}14` : C.card, borderColor: isCurrent ? accent : C.border }}>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[11px] uppercase tracking-widest font-semibold" style={{ color: accent }}>{p.categoria}</span>
                          {isCurrent && <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full" style={{ background: accent, color: C.bg }}>Atual</span>}
                        </div>
                        <div className="font-display text-lg mb-1">{p.nome}</div>
                        <div className="text-xs mb-4" style={{ color: C.textDim }}>{p.frequencia}</div>
                        <div className="flex items-end justify-between">
                          <div className="flex items-center gap-1 font-score text-2xl font-bold"><DollarSign size={16} style={{ color: accent }} />{Number(p.preco).toLocaleString("pt-BR")}<span className="text-xs font-body font-normal" style={{ color: C.textDim }}>/mês</span></div>
                          {!isCurrent && (<button onClick={() => handleChangePlan(selectedMatricula.id, p.id)} className="text-xs font-semibold px-3 py-2 rounded-lg transition-colors hover:brightness-110" style={{ background: C.blue, color: "#fff" }}>Selecionar</button>)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              <SectionDivider />

              {/* Central de pagamento */}
              <section>
                <h2 className="font-display text-xl tracking-wide mb-1 flex items-center gap-2"><Zap size={18} style={{ color: C.yellow }} /> Central de Pagamento</h2>
                <p className="text-sm mb-5" style={{ color: C.textDim }}>Pague sua mensalidade via Pix e envie o comprovante para confirmarmos rapidinho.</p>

                <div className="rounded-2xl border p-6 flex flex-col sm:flex-row gap-6" style={{ background: C.card, borderColor: C.border }}>
                  <QrPlaceholder />
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] uppercase tracking-widest font-semibold mb-2" style={{ color: C.textMuted }}>Chave Pix ({PIX_TIPO_LABELS[selectedMatricula.escolas?.pix_tipo] || "Pix"})</div>
                    <div className="flex items-center gap-2 mb-3">
                      <code className="text-sm px-3 py-2 rounded-lg border flex-1 truncate font-score" style={{ background: C.bg, borderColor: C.border, color: C.text }}>{selectedMatricula.escolas?.pix_chave || "—"}</code>
                      <button onClick={() => copyPix(selectedMatricula.escolas?.pix_chave)} aria-label="Copiar chave Pix" className="p-2.5 rounded-lg shrink-0 transition-colors hover:brightness-110" style={{ background: pixCopied ? C.green : C.blue, color: "#fff" }}>{pixCopied ? <Check size={16} /> : <Copy size={16} />}</button>
                    </div>

                    {selectedMatricula.escolas?.beneficiario_nome && (
                      <div className="text-xs mb-5" style={{ color: C.textDim }}>
                        Beneficiário: <span style={{ color: C.text }}>{selectedMatricula.escolas.beneficiario_nome}</span>
                        {selectedMatricula.escolas.beneficiario_banco && <> · {selectedMatricula.escolas.beneficiario_banco}</>}
                        {(selectedMatricula.escolas.beneficiario_agencia || selectedMatricula.escolas.beneficiario_conta) && <> · Ag {selectedMatricula.escolas.beneficiario_agencia} / Cc {selectedMatricula.escolas.beneficiario_conta}</>}
                      </div>
                    )}

                    <ol className="text-sm space-y-1.5 mb-5 list-decimal list-inside" style={{ color: C.textMuted }}>
                      <li>Abra o app do seu banco e escolha pagar via Pix.</li>
                      <li>Copie e cole a chave acima ou escaneie o QR code.</li>
                      <li>Confirme o valor do seu plano e finalize o pagamento.</li>
                      <li>Envie o comprovante abaixo para agilizar a confirmação.</li>
                    </ol>

                    {selectedMatricula.comprovante_pendente ? (
                      <div className="flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-lg" style={{ background: `${C.amber}22`, color: C.amber }}><Clock size={15} /> Aguardando revisão do admin</div>
                    ) : (
                      <label className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-lg cursor-pointer transition-colors hover:brightness-110" style={{ background: C.green, color: "#fff" }}>
                        <Send size={15} /> Enviar comprovante
                        <input type="file" className="hidden" onChange={(e) => handleSendReceiptFile(selectedMatricula.id, e.target.files?.[0])} />
                      </label>
                    )}
                  </div>
                </div>
              </section>

              <SectionDivider />

              {/* Histórico */}
              <section>
                <h2 className="font-display text-xl tracking-wide mb-5">Histórico de Pagamentos</h2>
                {selectedMatriculaPagamentos.length === 0 ? (
                  <div className="rounded-2xl border p-8 text-center" style={{ background: C.card, borderColor: C.border }}>
                    <Waves size={22} className="mx-auto mb-2" style={{ color: C.textDim }} />
                    <div className="text-sm" style={{ color: C.textDim }}>Nenhum pagamento registrado ainda.</div>
                  </div>
                ) : (
                  <div className="rounded-2xl border divide-y overflow-hidden" style={{ background: C.card, borderColor: C.border }}>
                    {selectedMatriculaPagamentos.map((h) => (
                      <div key={h.id} className="flex items-center justify-between px-5 py-4" style={{ borderColor: C.border }}>
                        <div className="flex items-center gap-3"><Calendar size={15} style={{ color: C.textDim }} /><span className="text-sm">{formatDate(h.data)}</span></div>
                        <div className="flex items-center gap-4"><span className="font-score text-sm font-semibold">{formatBRL(h.valor)}</span><span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ color: C.green, background: `${C.green}22` }}>{h.status}</span></div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}

          {selectedMatricula.situacao === "aprovado" && selectedMatricula.escolas?.whatsapp && (
            <a href={waLink(selectedMatricula.escolas.whatsapp, `Olá! Preciso de ajuda com minha mensalidade no ${selectedMatricula.escolas.nome || "CT"}.`)} target="_blank" rel="noopener noreferrer" className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-3.5 rounded-full shadow-lg transition-transform hover:scale-105" style={{ background: C.green, color: "#fff" }}>
              <MessageCircle size={20} /> <span className="text-sm font-semibold hidden sm:inline">Falar no WhatsApp</span>
            </a>
          )}
        </div>
      )}

      {/* ---------------------------------------------------------- */}
      {/* ADMIN — login (dono de escola OU responsável geral)          */}
      {/* ---------------------------------------------------------- */}
      {view === "admin" && !role && (
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="w-full max-w-sm text-center">
            <div className="flex justify-center mb-6"><LogoPlaceholder size={56} /></div>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ background: `${C.blue}22` }}><ShieldCheck size={20} style={{ color: C.blue }} /></div>
            <h1 className="font-display text-2xl tracking-wide mb-2">Área Administrativa</h1>
            <p className="text-sm mb-6" style={{ color: C.textDim }}>Entre com uma conta de administrador.</p>

            <AuthInput type="email" placeholder="E-mail" value={authForm.email} onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })} />
            <AuthInput type="password" placeholder="Senha" value={authForm.password} onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })} onKeyDown={(e) => e.key === "Enter" && handleAdminLogin()} />

            {authError && <div className="text-xs mb-3" style={{ color: C.red }}>{authError}</div>}

            <button onClick={handleAdminLogin} disabled={authLoading} className="w-full rounded-lg px-4 py-3 font-semibold text-sm transition-colors hover:brightness-110 flex items-center justify-center gap-2" style={{ background: C.blue, color: "#fff", opacity: authLoading ? 0.7 : 1 }}>
              <LogIn size={16} /> {authLoading ? "Aguarde..." : "Entrar"}
            </button>
            <div className="text-[11px] mt-4 leading-relaxed" style={{ color: C.textDim }}>Ainda não tem conta? Crie uma pela Área do Aluno primeiro, depois peça pra ser promovido a administrador.</div>
            <button onClick={goLanding} className="text-xs mt-4 underline underline-offset-2" style={{ color: C.textMuted }}>Voltar</button>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------- */}
      {/* ADMIN — dashboard da escola                                  */}
      {/* ---------------------------------------------------------- */}
      {view === "admin" && role === "admin" && (
        <div>
          <TopBar title={escola?.nome || "Central Administrativa"} onBack={goLanding} right={
            <button onClick={handleLogout} className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold px-3 py-2 rounded-lg transition-colors hover:bg-white/5" style={{ color: C.textMuted }}><LogOut size={15} /> <span className="hidden sm:inline">Sair</span></button>
          } />

          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-10">
            {dataLoading ? (
              <div className="text-center py-16 text-sm" style={{ color: C.textDim }}>Carregando dados...</div>
            ) : (
              <>
                <section>
                  <h2 className="font-display text-xl tracking-wide mb-5">Dashboard</h2>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
                    <StatCard label="Alunos ativos" value={totalAtivos} Icon={Users} color={C.blue} sub="Total matriculado" />
                    <StatCard label="Faturamento arrecadado" value={formatBRL(faturamentoArrecadado)} Icon={Wallet} color={C.green} sub={`de ${formatBRL(faturamentoPrevisto)} previstos`} progress={(faturamentoArrecadado / (faturamentoPrevisto || 1)) * 100} />
                    <StatCard label="Inadimplentes" value={inadimplentes} Icon={AlertTriangle} color={C.red} sub="Pendentes + atrasados" />
                    <StatCard label="Ticket médio" value={formatBRL(ticketMedio)} Icon={TrendingUp} color={C.yellow} sub="Por aluno / mês" />
                    <StatCard label="Aguardando revisão" value={pendingReview} Icon={Send} color={C.amber} sub="Comprovantes enviados" />
                  </div>

                  <div className="grid lg:grid-cols-2 gap-4">
                    <div className="rounded-2xl border p-5" style={{ background: C.card, borderColor: C.border }}>
                      <div className="flex items-center gap-2 mb-4"><PieChart size={16} style={{ color: C.textMuted }} /><span className="text-sm font-semibold">Coletiva vs. Personal</span></div>
                      <div className="h-4 rounded-full overflow-hidden flex mb-3" style={{ background: C.borderSoft }}>
                        <div style={{ width: `${(coletiva / (totalAtivos || 1)) * 100}%`, background: C.yellow }} />
                        <div style={{ width: `${(personal / (totalAtivos || 1)) * 100}%`, background: C.blue }} />
                      </div>
                      <div className="flex items-center justify-between text-xs" style={{ color: C.textMuted }}>
                        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full inline-block" style={{ background: C.yellow }} /> Coletiva — {coletiva} alunos</span>
                        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full inline-block" style={{ background: C.blue }} /> Personal — {personal} alunos</span>
                      </div>
                    </div>

                    <div className="rounded-2xl border p-5" style={{ background: C.card, borderColor: C.border }}>
                      <div className="flex items-center gap-2 mb-4"><PieChart size={16} style={{ color: C.textMuted }} /><span className="text-sm font-semibold">Distribuição por plano</span></div>
                      <div className="space-y-3">
                        {byPlan.map((p) => {
                          const accent = p.categoria === "Coletiva" ? C.yellow : C.blue;
                          const max = Math.max(...byPlan.map((x) => x.count), 1);
                          return (
                            <div key={p.id}>
                              <div className="flex items-center justify-between text-xs mb-1" style={{ color: C.textMuted }}><span>{p.nome}</span><span className="font-score">{p.count}</span></div>
                              <div className="h-2 rounded-full overflow-hidden" style={{ background: C.borderSoft }}><div className="h-full rounded-full transition-all duration-500" style={{ width: `${(p.count / max) * 100}%`, background: accent }} /></div>
                            </div>
                          );
                        })}
                        {byPlan.length === 0 && <div className="text-xs" style={{ color: C.textDim }}>Nenhum plano cadastrado ainda.</div>}
                      </div>
                    </div>
                  </div>
                </section>

                <SectionDivider />

                <section>
                  <h2 className="font-display text-xl tracking-wide mb-1">Solicitações Pendentes</h2>
                  <p className="text-sm mb-5" style={{ color: C.textDim }}>Pessoas que pediram pra entrar na sua escola.</p>
                  {pendingRequests.length === 0 ? (
                    <div className="rounded-2xl border p-6 text-center text-sm" style={{ background: C.card, borderColor: C.border, color: C.textDim }}>Nenhuma solicitação no momento.</div>
                  ) : (
                    <div className="space-y-3">
                      {pendingRequests.map((r) => (
                        <div key={r.id} className="rounded-2xl border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3" style={{ background: C.card, borderColor: C.amber }}>
                          <div className="min-w-0">
                            <div className="font-medium">{r.perfis?.nome || "(sem nome)"}</div>
                            <div className="text-xs" style={{ color: C.textMuted }}>{r.perfis?.telefone} · quer o plano {getPlan(r.plano_id).nome}</div>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => handleApproveRequest(r.id)} className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg" style={{ background: `${C.green}22`, color: C.green }}><CheckCircle2 size={14} /> Aprovar</button>
                            <button onClick={() => handleRejectRequest(r.id)} className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg" style={{ background: `${C.red}22`, color: C.red }}><X size={14} /> Recusar</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                <SectionDivider />

                <section>
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                    <h2 className="font-display text-xl tracking-wide">Planos da Escola</h2>
                    <button onClick={openNewPlanModal} className="flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors hover:brightness-110" style={{ background: C.blue, color: "#fff" }}><DollarSign size={16} /> Novo Plano</button>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {plans.map((p) => {
                      const accent = p.categoria === "Coletiva" ? C.yellow : C.blue;
                      return (
                        <div key={p.id} className="rounded-2xl border p-5" style={{ background: C.card, borderColor: C.border }}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[11px] uppercase tracking-widest font-semibold" style={{ color: accent }}>{p.categoria}</span>
                            <div className="flex gap-1">
                              <button title="Editar" onClick={() => openEditPlanModal(p)} className="p-1.5 rounded-lg transition-colors hover:bg-white/5" style={{ color: C.textMuted }}><Pencil size={14} /></button>
                              <button title="Remover" onClick={() => setConfirmDeletePlanId(p.id)} className="p-1.5 rounded-lg transition-colors hover:bg-white/5" style={{ color: C.red }}><Trash2 size={14} /></button>
                            </div>
                          </div>
                          <div className="font-display text-lg mb-1">{p.nome}</div>
                          <div className="text-xs mb-3" style={{ color: C.textDim }}>{p.frequencia}</div>
                          <div className="font-score text-xl font-bold">{formatBRL(p.preco)}<span className="text-xs font-body font-normal" style={{ color: C.textDim }}>/mês</span></div>
                        </div>
                      );
                    })}
                    {plans.length === 0 && (<div className="sm:col-span-2 text-sm text-center py-6" style={{ color: C.textDim }}>Nenhum plano cadastrado ainda. Crie o primeiro acima.</div>)}
                  </div>
                </section>

                <SectionDivider />

                <section>
                  <h2 className="font-display text-xl tracking-wide mb-1 flex items-center gap-2"><Settings size={18} style={{ color: C.textMuted }} /> Configurações da Escola</h2>
                  <p className="text-sm mb-5" style={{ color: C.textDim }}>Esses dados aparecem pros seus alunos na Central de Pagamento.</p>
                  {escolaForm && (
                    <div className="rounded-2xl border p-6" style={{ background: C.card, borderColor: C.border }}>
                      <EscolaFormFields form={escolaForm} setForm={setEscolaForm} />
                      <button onClick={handleSaveEscolaConfig} className="w-full py-3 rounded-lg font-semibold text-sm transition-colors hover:brightness-110 mt-4" style={{ background: C.blue, color: "#fff" }}>Salvar configurações</button>
                    </div>
                  )}
                </section>

                <SectionDivider />

                <section>
                  <h2 className="font-display text-xl tracking-wide mb-5">Gestão de Alunos</h2>

                  <div className="flex flex-col sm:flex-row gap-3 mb-5">
                    <div className="relative flex-1">
                      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: C.textDim }} />
                      <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar aluno pelo nome..." className="w-full pl-9 pr-3 py-2.5 rounded-lg border outline-none text-sm" style={{ background: C.card, borderColor: C.border, color: C.text }} />
                    </div>
                    <select value={planFilter} onChange={(e) => setPlanFilter(e.target.value)} className="px-3 py-2.5 rounded-lg border outline-none text-sm" style={{ background: C.card, borderColor: C.border, color: C.text }}>
                      <option value="todos">Todos os planos</option>
                      {plans.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
                    </select>
                  </div>

                  <div className="flex items-center gap-2 mb-5 flex-wrap">
                    <Filter size={14} style={{ color: C.textDim }} />
                    {["todos", "em_dia", "pendente", "atrasado"].map((s) => {
                      const active = statusFilter === s;
                      const label = s === "todos" ? "Todos" : STATUS[s].label;
                      const color = s === "todos" ? C.blue : STATUS[s].color;
                      return (<button key={s} onClick={() => setStatusFilter(s)} className="text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors" style={{ background: active ? `${color}22` : "transparent", borderColor: active ? color : C.border, color: active ? color : C.textMuted }}>{label}</button>);
                    })}
                    {pendingReview > 0 && (
                      <button onClick={() => setOnlyPendingReview((v) => !v)} className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors" style={{ background: onlyPendingReview ? `${C.amber}22` : "transparent", borderColor: onlyPendingReview ? C.amber : C.border, color: onlyPendingReview ? C.amber : C.textMuted }}><Send size={12} /> Aguardando revisão ({pendingReview})</button>
                    )}
                  </div>

                  <div className="hidden md:block rounded-2xl border overflow-hidden" style={{ background: C.card, borderColor: C.border }}>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left border-b" style={{ borderColor: C.border }}>
                          {["Aluno", "Telefone", "Plano", "Vencimento", "Status", "Ações"].map((h) => (<th key={h} className="px-4 py-3 text-[11px] uppercase tracking-widest font-semibold" style={{ color: C.textMuted }}>{h}</th>))}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredStudents.length === 0 && (<tr><td colSpan={6} className="px-4 py-8 text-center text-sm" style={{ color: C.textDim }}>Nenhum aluno encontrado.</td></tr>)}
                        {filteredStudents.map((s) => (
                          <tr key={s.id} className="border-b last:border-0" style={{ borderColor: C.border, background: s.comprovante_pendente ? `${C.amber}0D` : "transparent" }}>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-display shrink-0" style={{ background: `${C.blue}22`, color: C.blue }}>{initials(s.perfis?.nome)}</div>
                                <span className="font-medium">{s.perfis?.nome || "(sem nome)"}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3" style={{ color: C.textMuted }}>{s.perfis?.telefone}</td>
                            <td className="px-4 py-3"><span className="text-xs px-2 py-1 rounded-md" style={{ background: `${getPlan(s.plano_id).categoria === "Coletiva" ? C.yellow : C.blue}1A`, color: getPlan(s.plano_id).categoria === "Coletiva" ? C.yellow : C.blue }}>{getPlan(s.plano_id).nome}</span></td>
                            <td className="px-4 py-3" style={{ color: C.textMuted }}>Dia {s.dia_vencimento}</td>
                            <td className="px-4 py-3">
                              <div className="flex flex-col gap-1 items-start">
                                <StatusBadge status={s.status} />
                                {s.comprovante_pendente && (<span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ color: C.amber, background: `${C.amber}22` }}><Send size={10} /> Aguardando revisão</span>)}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1.5">
                                {s.comprovante_pendente ? (
                                  <>
                                    <button title="Aprovar pagamento" onClick={() => handleApproveReceipt(s.id)} className="p-1.5 rounded-lg transition-colors hover:bg-white/5" style={{ color: C.green }}><CheckCircle2 size={16} /></button>
                                    <button title="Recusar comprovante" onClick={() => handleRejectReceipt(s.id)} className="p-1.5 rounded-lg transition-colors hover:bg-white/5" style={{ color: C.red }}><X size={16} /></button>
                                  </>
                                ) : s.status !== "em_dia" ? (
                                  <button title="Marcar como pago" onClick={() => handleMarkStatus(s.id, "em_dia")} className="p-1.5 rounded-lg transition-colors hover:bg-white/5" style={{ color: C.green }}><CheckCircle2 size={16} /></button>
                                ) : (
                                  <button title="Marcar como pendente" onClick={() => handleMarkStatus(s.id, "pendente")} className="p-1.5 rounded-lg transition-colors hover:bg-white/5" style={{ color: C.amber }}><Clock size={16} /></button>
                                )}
                                <button title="Remover aluno" onClick={() => setConfirmDeleteId(s.id)} className="p-1.5 rounded-lg transition-colors hover:bg-white/5" style={{ color: C.red }}><Trash2 size={16} /></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="md:hidden space-y-3">
                    {filteredStudents.length === 0 && (<div className="rounded-2xl border p-6 text-center text-sm" style={{ background: C.card, borderColor: C.border, color: C.textDim }}>Nenhum aluno encontrado.</div>)}
                    {filteredStudents.map((s) => (
                      <div key={s.id} className="rounded-2xl border p-4" style={{ background: C.card, borderColor: s.comprovante_pendente ? C.amber : C.border }}>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-display shrink-0" style={{ background: `${C.blue}22`, color: C.blue }}>{initials(s.perfis?.nome)}</div>
                            <span className="font-medium truncate">{s.perfis?.nome || "(sem nome)"}</span>
                          </div>
                          <StatusBadge status={s.status} />
                        </div>
                        <div className="text-xs space-y-1 mb-3" style={{ color: C.textMuted }}>
                          <div className="flex items-center gap-1.5"><Phone size={12} /> {s.perfis?.telefone}</div>
                          <div>{getPlan(s.plano_id).nome} · Vencimento dia {s.dia_vencimento}</div>
                        </div>
                        {s.comprovante_pendente && (<div className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full mb-3" style={{ color: C.amber, background: `${C.amber}22` }}><Send size={10} /> Aguardando revisão do comprovante</div>)}
                        <div className="flex items-center gap-2">
                          {s.comprovante_pendente ? (
                            <>
                              <button onClick={() => handleApproveReceipt(s.id)} className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-2 rounded-lg" style={{ background: `${C.green}22`, color: C.green }}><CheckCircle2 size={14} /> Aprovar</button>
                              <button onClick={() => handleRejectReceipt(s.id)} className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-2 rounded-lg" style={{ background: `${C.red}22`, color: C.red }}><X size={14} /> Recusar</button>
                            </>
                          ) : s.status !== "em_dia" ? (
                            <button onClick={() => handleMarkStatus(s.id, "em_dia")} className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-2 rounded-lg" style={{ background: `${C.green}22`, color: C.green }}><CheckCircle2 size={14} /> Marcar pago</button>
                          ) : (
                            <button onClick={() => handleMarkStatus(s.id, "pendente")} className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-2 rounded-lg" style={{ background: `${C.amber}22`, color: C.amber }}><Clock size={14} /> Marcar pendente</button>
                          )}
                          <button onClick={() => setConfirmDeleteId(s.id)} className="p-2 rounded-lg" style={{ background: `${C.red}22`, color: C.red }}><Trash2 size={14} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </>
            )}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------- */}
      {/* ADMIN — painel do responsável geral (super_admin)            */}
      {/* ---------------------------------------------------------- */}
      {view === "admin" && role === "super_admin" && (
        <div>
          <TopBar title="Responsável Geral" onBack={goLanding} right={
            <button onClick={handleLogout} className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold px-3 py-2 rounded-lg transition-colors hover:bg-white/5" style={{ color: C.textMuted }}><LogOut size={15} /> <span className="hidden sm:inline">Sair</span></button>
          } />

          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-10">
            {dataLoading ? (
              <div className="text-center py-16 text-sm" style={{ color: C.textDim }}>Carregando dados...</div>
            ) : (
              <>
                <section>
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                    <h2 className="font-display text-xl tracking-wide flex items-center gap-2"><Building2 size={20} style={{ color: C.textMuted }} /> Escolas da Plataforma</h2>
                    <button onClick={openNewEscolaModal} className="flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors hover:brightness-110" style={{ background: C.blue, color: "#fff" }}><Building2 size={16} /> Nova Escola</button>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {allEscolas.map((e) => (
                      <div key={e.id} className="rounded-2xl border p-5" style={{ background: C.card, borderColor: C.border }}>
                        <div className="flex items-start justify-between mb-2 gap-2">
                          <div className="font-display text-lg">{e.nome}</div>
                          <button title="Editar" onClick={() => openEditEscolaModal(e)} className="p-1.5 rounded-lg transition-colors hover:bg-white/5 shrink-0" style={{ color: C.textMuted }}><Pencil size={14} /></button>
                        </div>
                        <div className="text-xs" style={{ color: C.textDim }}>
                          {adminsByEscola[e.id] ? `Admin: ${adminsByEscola[e.id].nome || adminsByEscola[e.id].email}` : "Sem administrador definido"}
                        </div>
                      </div>
                    ))}
                    {allEscolas.length === 0 && (<div className="sm:col-span-2 text-sm text-center py-6" style={{ color: C.textDim }}>Nenhuma escola cadastrada ainda.</div>)}
                  </div>
                </section>

                <SectionDivider />

                <section>
                  <h2 className="font-display text-xl tracking-wide mb-1 flex items-center gap-2"><UserPlus size={18} style={{ color: C.textMuted }} /> Definir Administrador</h2>
                  <p className="text-sm mb-5" style={{ color: C.textDim }}>Busque uma conta já cadastrada pelo e-mail e defina qual escola ela vai administrar.</p>

                  <div className="flex gap-2 mb-4">
                    <input value={promoteEmail} onChange={(e) => setPromoteEmail(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSearchPerfil()} placeholder="Buscar por e-mail..." className="flex-1 px-3 py-2.5 rounded-lg border outline-none text-sm" style={{ background: C.card, borderColor: C.border, color: C.text }} />
                    <button onClick={handleSearchPerfil} className="px-4 py-2.5 rounded-lg" style={{ background: C.blue, color: "#fff" }}><Search size={16} /></button>
                  </div>

                  {promoteResults.length > 0 && (
                    <div className="space-y-3">
                      <select value={promoteEscolaId} onChange={(e) => setPromoteEscolaId(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border outline-none text-sm mb-2" style={{ background: C.card, borderColor: C.border, color: C.text }}>
                        <option value="">Escolha a escola para vincular...</option>
                        {allEscolas.map((e) => <option key={e.id} value={e.id}>{e.nome}</option>)}
                      </select>
                      {promoteResults.map((p) => (
                        <div key={p.id} className="rounded-2xl border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3" style={{ background: C.card, borderColor: C.border }}>
                          <div className="min-w-0">
                            <div className="font-medium">{p.nome || "(sem nome)"}</div>
                            <div className="text-xs" style={{ color: C.textMuted }}>
                              {p.email} · {p.role === "admin" ? `Admin de ${allEscolas.find((e) => e.id === p.escola_id)?.nome || "?"}` : p.role === "super_admin" ? "Responsável geral" : "Aluno"}
                            </div>
                          </div>
                          <div className="flex gap-2 shrink-0">
                            {p.role !== "admin" && p.role !== "super_admin" && (<button onClick={() => handlePromote(p.id)} className="text-xs font-semibold px-3 py-2 rounded-lg" style={{ background: `${C.green}22`, color: C.green }}>Tornar admin</button>)}
                            {p.role === "admin" && (<button onClick={() => handleDemote(p.id)} className="text-xs font-semibold px-3 py-2 rounded-lg" style={{ background: `${C.red}22`, color: C.red }}>Remover admin</button>)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </>
            )}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------- */}
      {/* MODALS                                                       */}
      {/* ---------------------------------------------------------- */}
      {confirmDeleteId !== null && (
        <Modal title="Remover aluno" onClose={() => setConfirmDeleteId(null)}>
          <p className="text-sm mb-6" style={{ color: C.textMuted }}>Tem certeza que deseja remover <strong style={{ color: C.text }}>{allAlunos.find((s) => s.id === confirmDeleteId)?.perfis?.nome}</strong>? Esta ação não pode ser desfeita.</p>
          <div className="flex gap-3">
            <button onClick={() => setConfirmDeleteId(null)} className="flex-1 py-2.5 rounded-lg text-sm font-semibold border" style={{ borderColor: C.border, color: C.textMuted }}>Cancelar</button>
            <button onClick={() => handleDeleteStudent(confirmDeleteId)} className="flex-1 py-2.5 rounded-lg text-sm font-semibold" style={{ background: C.red, color: "#fff" }}>Remover</button>
          </div>
        </Modal>
      )}

      {showPlanModal && (
        <Modal title={editingPlan ? "Editar plano" : "Novo plano"} onClose={() => { setShowPlanModal(false); setEditingPlan(null); }}>
          <div className="space-y-4">
            <FormInput label="Nome do plano" value={planForm.nome} onChange={(e) => setPlanForm({ ...planForm, nome: e.target.value })} placeholder="Ex: Coletiva 3x/semana" />
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide mb-1.5 block" style={{ color: C.textMuted }}>Categoria</label>
              <select value={planForm.categoria} onChange={(e) => setPlanForm({ ...planForm, categoria: e.target.value })} className="w-full px-3 py-2.5 rounded-lg border outline-none text-sm" style={{ background: C.card, borderColor: C.border, color: C.text }}>
                <option value="Coletiva">Coletiva</option>
                <option value="Personal">Personal</option>
              </select>
            </div>
            <FormInput label="Frequência" value={planForm.frequencia} onChange={(e) => setPlanForm({ ...planForm, frequencia: e.target.value })} placeholder="Ex: 3x por semana" />
            <FormInput label="Preço mensal (R$)" type="number" min={0} step="0.01" value={planForm.preco} onChange={(e) => setPlanForm({ ...planForm, preco: e.target.value })} placeholder="150.00" />
            <button onClick={handleSavePlan} className="w-full py-3 rounded-lg font-semibold text-sm transition-colors hover:brightness-110" style={{ background: C.blue, color: "#fff" }}>{editingPlan ? "Salvar alterações" : "Criar plano"}</button>
          </div>
        </Modal>
      )}

      {confirmDeletePlanId !== null && (
        <Modal title="Remover plano" onClose={() => setConfirmDeletePlanId(null)}>
          <p className="text-sm mb-6" style={{ color: C.textMuted }}>Tem certeza que deseja remover este plano? Se houver alunos usando ele, a remoção será bloqueada.</p>
          <div className="flex gap-3">
            <button onClick={() => setConfirmDeletePlanId(null)} className="flex-1 py-2.5 rounded-lg text-sm font-semibold border" style={{ borderColor: C.border, color: C.textMuted }}>Cancelar</button>
            <button onClick={() => handleDeletePlan(confirmDeletePlanId)} className="flex-1 py-2.5 rounded-lg text-sm font-semibold" style={{ background: C.red, color: "#fff" }}>Remover</button>
          </div>
        </Modal>
      )}

      {showEscolaModal && (
        <Modal title={editingEscola ? "Editar escola" : "Nova escola"} onClose={() => { setShowEscolaModal(false); setEditingEscola(null); }}>
          <EscolaFormFields form={newEscolaForm} setForm={setNewEscolaForm} />
          <button onClick={handleSaveEscola} className="w-full py-3 rounded-lg font-semibold text-sm transition-colors hover:brightness-110 mt-4" style={{ background: C.blue, color: "#fff" }}>{editingEscola ? "Salvar alterações" : "Criar escola"}</button>
        </Modal>
      )}

      {toast && <Toast toast={toast} />}
    </div>
  );
}

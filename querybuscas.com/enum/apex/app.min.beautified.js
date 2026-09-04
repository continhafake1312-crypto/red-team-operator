const MODULOS = [{
        titulo: "Consulta de CPF",
        descricao: "Consulta completa e avan\xE7ada de CPF",
        rota: "Cpf",
        icon: "cpf.svg",
        categoria: "pessoais"
    }, {
        titulo: "Consulta de Nome",
        descricao: "Busca por nome completo",
        rota: "Nome",
        icon: "nome.svg",
        categoria: "pessoais"
    }, {
        titulo: "Consulta Nome Abreviado",
        descricao: "Busca por nome abreviado",
        rota: "NomeAbreviado",
        icon: "nome.svg",
        categoria: "pessoais"
    }, {
        titulo: "Consulta de Telefone",
        descricao: "Busca por n\xFAmero de telefone",
        rota: "Telefone",
        icon: "telefone2.svg",
        categoria: "contato"
    }, {
        titulo: "Consulta de Email",
        descricao: "Busca por endere\xE7o de email",
        rota: "Email",
        icon: "email2.svg",
        categoria: "contato"
    }, {
        titulo: "Consulta de RG",
        descricao: "Consulta por registro geral",
        rota: "Rg",
        icon: "rg.svg",
        categoria: "documentos"
    }, {
        titulo: "Consulta de Nome M\xE3e",
        descricao: "Descubra informa\xE7\xF5es pelo nome da m\xE3e",
        rota: "Mae",
        icon: "woman.svg",
        categoria: "pessoais"
    }, {
        titulo: "Consulta de Nome Pai",
        descricao: "Descubra informa\xE7\xF5es pelo nome do pai",
        rota: "Pai",
        icon: "man.svg",
        categoria: "pessoais"
    }, {
        titulo: "Consulta Condutor - CNH",
        descricao: "Informa\xE7\xF5es sobre a CNH do condutor",
        rota: "Cnh",
        icon: "condutor.svg",
        categoria: "veicular"
    }, {
        titulo: "Consulta de Placa",
        descricao: "Descubra informa\xE7\xF5es veiculares pela placa",
        rota: "Placa",
        icon: "placa2.svg",
        categoria: "veicular"
    }, {
        titulo: "Placa Nacional",
        descricao: "Ve\xEDculo + hist\xF3rico de propriet\xE1rios pela placa",
        rota: "PlacaNacional",
        icon: "placa.svg",
        categoria: "veicular"
    }, {
        titulo: "Hist\xF3rico Veicular por CPF",
        descricao: "Ve\xEDculos e propriedade por CPF/CNPJ",
        rota: "HistoricoVeicular",
        icon: "frota.svg",
        categoria: "veicular"
    }, {
        titulo: "Consulta de Score",
        descricao: "Verifique o score de cr\xE9dito",
        rota: "Score",
        icon: "score2.svg",
        categoria: "financeiro"
    }, {
        titulo: "Consulta de Parentes",
        descricao: "Busca de parentes e familiares por CPF",
        rota: "Parentes",
        icon: "parentes.svg",
        categoria: "pessoais"
    }, {
        titulo: "Consulta de FOTO",
        descricao: "Busca de foto por CPF",
        rota: "Foto",
        icon: "foto.svg",
        categoria: "pessoais"
    }, {
        titulo: "Consulta de CNS",
        descricao: "Descubra informa\xE7\xF5es pelo cart\xE3o de sa\xFAde.",
        rota: "Cns",
        icon: "formulario.svg",
        categoria: "documentos"
    }, {
        titulo: "Consulta de T\xEDtulo Eleitoral",
        descricao: "Consulta por t\xEDtulo de eleitor",
        rota: "Titulo",
        icon: "titulo.svg",
        categoria: "documentos"
    }, {
        titulo: "Consulta de PIS",
        descricao: "Descubra informa\xE7\xF5es pelo PIS",
        rota: "Pis",
        icon: "trabalho.svg",
        categoria: "documentos"
    }, {
        titulo: "Consulta de NIS",
        descricao: "Descubra informa\xE7\xF5es pelo NIS",
        rota: "Nis",
        icon: "trabalho.svg",
        categoria: "documentos"
    }, {
        titulo: "Desmascarar PIX",
        descricao: "Use o nome e 6 d\xEDgitos do CPF para consultar o PIX",
        rota: "Pix",
        icon: "pix.svg",
        categoria: "financeiro"
    }, {
        titulo: "Consulta Chave Pix",
        descricao: "Descubra o titular de qualquer chave PIX (CPF, e-mail, telefone ou aleat\xF3ria)",
        rota: "ChavePix",
        icon: "pix.svg",
        categoria: "financeiro"
    }, {
        titulo: "Consulta de Certid\xE3o",
        descricao: "Consulta de certid\xE3o civil por CPF.",
        rota: "Certidao",
        icon: "formulario.svg",
        categoria: "documentos"
    }, {
        titulo: "Consulta de CEP",
        descricao: "Busca por CEP",
        rota: "Cep",
        icon: "mapa.svg",
        categoria: "contato"
    }, {
        titulo: "Consulta de Renavam",
        descricao: "Consulta de informa\xE7\xF5es pelo Renavam",
        rota: "Renavam",
        icon: "renavam2.svg",
        categoria: "veicular"
    }, {
        titulo: "Consulta de Frota",
        descricao: "Consulta de frota de ve\xEDculos CPF/CNPJ",
        rota: "Frota",
        icon: "frota.svg",
        categoria: "veicular"
    }, {
        titulo: "Consulta de Chassi",
        descricao: "Informa\xE7\xF5es do ve\xEDculo pelo chassi",
        rota: "Chassi",
        icon: "chassi.svg",
        categoria: "veicular"
    }, {
        titulo: "Consulta de Motor",
        descricao: "Informa\xE7\xF5es do ve\xEDculo pelo motor",
        rota: "Motor",
        icon: "motor.svg",
        categoria: "veicular"
    }, {
        titulo: "Consulta de Empregos",
        descricao: "Hist\xF3rico de empregos por CPF",
        rota: "Empregos",
        icon: "empregos.svg",
        categoria: "pessoais"
    }, {
        titulo: "Consulta de CNPJ",
        descricao: "Consulta completa de CNPJ",
        rota: "Cnpj",
        icon: "empresa.svg",
        categoria: "cnpj"
    }, {
        titulo: "Consulta de S\xF3cios",
        descricao: "S\xF3cios de empresa por CNPJ",
        rota: "Socios",
        icon: "socios.svg",
        categoria: "cnpj"
    }, {
        titulo: "Consulta de Funcion\xE1rios",
        descricao: "Funcion\xE1rios por CNPJ",
        rota: "Funcionarios",
        icon: "funcionarios.svg",
        categoria: "cnpj"
    }, {
        titulo: "Gerador de Renda",
        descricao: "Selecione uma renda e gere dados completos.",
        rota: "gerador-renda",
        icon: "bagmoney.svg",
        categoria: "geradores"
    }, {
        titulo: "Gerador de Score",
        descricao: "Selecione um score e gere dados de cr\xE9dito.",
        rota: "gerador-score",
        icon: "score2.svg",
        categoria: "geradores"
    }, {
        titulo: "Gerador de CNPJ",
        descricao: "Gere um CNPJ aleat\xF3rio com dossi\xEA completo.",
        rota: "gerador-cnpj",
        icon: "empresa.svg",
        categoria: "geradores"
    }, {
        titulo: "Consulta de Vacina",
        descricao: "Hist\xF3rico de vacina\xE7\xE3o por CPF",
        rota: "Vacinas",
        icon: "vacina.svg",
        categoria: "pessoais"
    }, {
        titulo: "Consulta de \xD3bito",
        descricao: "Consulta o registro de \xF3bito de um CPF",
        rota: "Obito",
        icon: "obito.svg",
        categoria: "pessoais"
    }, {
        titulo: "Consulta de BIN",
        descricao: "Identifica\xE7\xE3o de bandeira do cart\xE3o",
        rota: "Bin",
        icon: "card.svg",
        categoria: "financeiro"
    }, {
        titulo: "Gerador de Profiss\xF5es",
        descricao: "Selecione uma profiss\xE3o e gere dados completos.",
        rota: "gerador-profissoes",
        icon: "trabalho.svg",
        categoria: "geradores"
    }, {
        titulo: "Gerador de Foto + Assinatura",
        descricao: "Gere foto e assinatura a partir de um CPF.",
        rota: "gerador-foto-assinatura",
        icon: "foto.svg",
        categoria: "geradores"
    }, {
        titulo: "Gera\xE7\xE3o de LEADS",
        descricao: "Gere listas de contatos segmentadas para prospec\xE7\xE3o.",
        rota: "Leads",
        icon: "leads.svg",
        categoria: "geradores"
    }, {
        titulo: "Consulta ULP",
        descricao: "Busca em base de credenciais vazadas por dom\xEDnio, usu\xE1rio, senha, CPF ou e-mail.",
        rota: "Ulp",
        icon: "ulp.svg",
        categoria: "credenciais"
    }],
    CATEGORIAS = [{
        id: "todos",
        label: "Todos"
    }, {
        id: "pessoais",
        label: "Pessoais"
    }, {
        id: "documentos",
        label: "Documentos"
    }, {
        id: "contato",
        label: "Contato"
    }, {
        id: "veicular",
        label: "Veicular"
    }, {
        id: "cnpj",
        label: "CNPJ"
    }, {
        id: "financeiro",
        label: "Financeiro"
    }, {
        id: "geradores",
        label: "Geradores"
    }, {
        id: "credenciais",
        label: "Credenciais"
    }],
    DEFAULT_FAVORITOS = ["Cpf", "Telefone", "Nome", "Email", "Cnpj", "Placa"],
    _savedFavs = JSON.parse(localStorage.getItem("modulosFavoritos") || "null"),
    _initialFavs = _savedFavs !== null ? _savedFavs : DEFAULT_FAVORITOS;
_savedFavs === null && localStorage.setItem("modulosFavoritos", JSON.stringify(_initialFavs));
const state = {
        favoritos: _initialFavs,
        userData: null,
        categoria: "todos"
    },
    rateLimit = {
        countdown: 0,
        limited: !1,
        interval: null
    },
    PLANO_SEM_PLANO = "sem-plano";

function semPlano() {
    return state.userData?.plano === PLANO_SEM_PLANO
}

function handleApiError(e) {
    const t = e?.status || e?.response?.status;
    if (e?.data?.statusMessage === "NoPlan") return navigateTo("/pages/comprar"), "Escolha um plano para usar as consultas.";
    if (e?.data?.statusMessage === "PlanExpired" || t === 403 && e?.data?.statusMessage === "PlanExpired") {
        try {
            localStorage.setItem("userData", JSON.stringify({
                username: null,
                plano: "diario",
                diasRestantes: 0
            }))
        } catch {}
        return navigateTo("/pages/comprar"), "Plano expirado. Redirecionando para renova\xE7\xE3o."
    }
    if (t === 429) {
        const o = e?.data?.message || "";
        if (!e?.data?.retryAfterSeconds && o.includes("Limite")) return showToast(o || "Limite di\xE1rio de consultas atingido.", "error"), escapeHtml(o || "Limite di\xE1rio de consultas atingido. Tente novamente amanh\xE3.");
        let n = e?.data?.retryAfterSeconds || e?.retryAfterSeconds || 15;
        startRateLimitCountdown(n);
        const r = "Muitas requisi\xE7\xF5es. Aguarde " + n + " segundo" + (n !== 1 ? "s" : "") + ".";
        return showToast(r, "error"), r
    }
    return escapeHtml(e?.data?.message || e?.message || "Erro ao realizar consulta. Tente novamente.")
}

function startRateLimitCountdown(e) {
    rateLimit.interval && clearInterval(rateLimit.interval), rateLimit.countdown = e, rateLimit.limited = !0, updateRateLimitUI(), rateLimit.interval = setInterval(() => {
        rateLimit.countdown--, updateRateLimitUI(), rateLimit.countdown <= 0 && (clearInterval(rateLimit.interval), rateLimit.interval = null, rateLimit.limited = !1, updateRateLimitUI())
    }, 1e3)
}

function updateRateLimitUI() {
    const e = document.getElementById("rate-limit-msg");
    e && (rateLimit.limited && rateLimit.countdown > 0 ? (e.textContent = "Aguarde " + rateLimit.countdown + " segundo" + (rateLimit.countdown > 1 ? "s" : "") + " para consultar novamente.", e.style.display = "block") : (e.textContent = "", e.style.display = "none"))
}

function navigateTo(e) {
    window.location.href = e
}
async function requireAuth(e) {
    e = e || {};
    try {
        const t = await fetch("/api/auth/verify", {
                credentials: "include"
            }),
            o = await t.json().catch(() => ({}));
        if (t.status === 401) return location.href = "/", null;
        if (!t.ok && o?.statusMessage === "PlanExpired") return location.href = "/pages/comprar", null;
        if (!t.ok) return console.warn("[requireAuth] verify falhou status", t.status, "\u2014 mantendo sess\xE3o"), null;
        if (!o?.success) return location.href = "/", null;
        try {
            localStorage.setItem("userData", JSON.stringify(o.user))
        } catch {}
        return e.admin && o.user?.type !== "admin" ? (location.href = "/pages/dashboard", null) : (triggerRenewWarning(o.user), o.user)
    } catch (t) {
        if (t?.data?.statusMessage === "SessionInvalidated") {
            try {
                localStorage.removeItem("userData")
            } catch {}
            try {
                await fetch("/api/auth/logout", {
                    method: "POST",
                    credentials: "include"
                })
            } catch {}
            return showToast("Sua sess\xE3o foi encerrada porque um novo login foi realizado em outro dispositivo.", "error"), setTimeout(() => {
                location.href = "/"
            }, 2500), null
        }
        return console.warn("[requireAuth] exce\xE7\xE3o:", t?.message), null
    }
}

function triggerRenewWarning(e) {
    if (!e) return;
    const t = (e.plano || "").toLowerCase();
    if (t === "diario" || t.includes("diario")) return;
    const o = Number(e.diasRestantes);
    if (!Number.isFinite(o) || o <= 0 || o > 3 || sessionStorage.getItem("qb_renew_warned") === "1") return;
    const n = document.getElementById("renew-modal");
    n && n.classList.add("show")
}

function closeRenewModal() {
    const e = document.getElementById("renew-modal");
    e && e.classList.remove("show"), sessionStorage.setItem("qb_renew_warned", "1")
}

function goToRenew() {
    closeRenewModal(), navigateTo("/pages/comprar")
}

function isMobileView() {
    return window.innerWidth < 768
}

function toggleNavbar() {
    const e = document.getElementById("navbar");
    if (e)
        if (isMobileView()) {
            e.classList.toggle("mobile-open");
            const t = document.getElementById("navbar-overlay");
            t && t.classList.toggle("show", e.classList.contains("mobile-open"))
        } else e.classList.toggle("collapsed"), localStorage.setItem("navbarCollapsed", e.classList.contains("collapsed") ? "1" : "0")
}

function closeMobileNavbar() {
    const e = document.getElementById("navbar");
    if (!e) return;
    e.classList.remove("mobile-open");
    const t = document.getElementById("navbar-overlay");
    t && t.classList.remove("show")
}

function injectMobileNavbarElements() {
    if (document.getElementById("navbar-toggle-mobile") || !document.getElementById("navbar")) return;
    const t = document.createElement("button");
    t.id = "navbar-toggle-mobile", t.title = "Abrir menu", t.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg><span class="text-lg font-bold tracking-wider bg-gradient-to-r from-primary-light to-purple-400 bg-clip-text text-transparent">QUERYBUSCAS</span>', t.onclick = toggleNavbar, document.body.appendChild(t);
    const o = document.createElement("div");
    o.id = "navbar-overlay", o.onclick = closeMobileNavbar, document.body.appendChild(o)
}

function restoreNavbarState() {
    const e = document.getElementById("navbar");
    e && (!isMobileView() && localStorage.getItem("navbarCollapsed") === "1" && e.classList.add("collapsed"), injectMobileNavbarElements())
}
async function loadUserData() {
    try {
        const e = localStorage.getItem("userData");
        e && (state.userData = JSON.parse(e), renderUserInfo())
    } catch {}
    try {
        const t = await (await fetch("/api/auth/verify", {
            credentials: "include"
        })).json();
        t?.success && (state.userData = t.user, localStorage.setItem("userData", JSON.stringify(t.user)), renderUserInfo(), document.getElementById("modulos-grid") && fetchLimits())
    } catch {}
}

function renderUserInfo() {
    const e = state.userData;
    if (!e) return;
    const t = o => document.getElementById(o);
    if (t("user-name") && (t("user-name").textContent = e.username || "N/A"), t("user-plano") && (t("user-plano").textContent = semPlano() ? "Sem plano" : e.plano || "N/A"), t("user-dias"))
        if (semPlano()) {
            const o = t("user-dias").parentElement;
            o && (o.innerHTML = '<a href="/pages/comprar" class="text-primary-light font-medium hover:underline">Assinar um plano \u2192</a>')
        } else t("user-dias").textContent = `em ${e.diasRestantes||0} dias`;
    e.type === "admin" && document.querySelectorAll("[data-admin-only]").forEach(o => {
        o.style.display = ""
    })
}
async function logout() {
    try {
        await fetch("/api/auth/logout", {
            method: "POST",
            credentials: "include"
        })
    } catch {}
    localStorage.removeItem("userData"), navigateTo("/")
}

function showToast(e, t) {
    t = t || "success";
    let o = document.getElementById("toast");
    o || (o = document.createElement("div"), o.id = "toast", o.className = "toast-message", document.body.appendChild(o)), o.textContent = e, o.className = "toast-message " + t + " show", setTimeout(() => {
        o.classList.remove("show")
    }, 4e3)
}

function renderModulos(e) {
    const t = document.getElementById("modulos-grid"),
        o = document.getElementById("modulos-count");
    if (!t) return;
    let n = MODULOS.map((r, f) => ({
        ...r,
        index: f
    }));
    if (state.categoria && state.categoria !== "todos" && (n = n.filter(r => r.categoria === state.categoria)), e) {
        const r = e.toLowerCase();
        n = n.filter(f => f.titulo.toLowerCase().includes(r) || f.descricao.toLowerCase().includes(r))
    }
    n.sort((r, f) => {
        const a = r.enabled !== !1,
            u = f.enabled !== !1;
        if (a && !u) return -1;
        if (!a && u) return 1;
        const c = state.favoritos.includes(r.titulo),
            s = state.favoritos.includes(f.titulo);
        return c && !s ? -1 : !c && s ? 1 : r.index - f.index
    }), o && (o.textContent = n.length), t.innerHTML = n.map(r => cardHTML(r)).join("")
}

function cardHTML(e) {
    const t = state.favoritos.includes(e.titulo),
        o = "/assets/icons/" + e.icon,
        n = state.userData?.plano,
        r = e.enabled !== !1,
        f = e.ilimitado === !0 || e.ilimitado == null && n === "mensal",
        a = e.limiteUsado || 0,
        u = e.limiteTotal != null ? e.limiteTotal : n === "semanal" ? 200 : 50,
        c = f ? 0 : Math.min(100, Math.round(a / u * 100)),
        s = semPlano(),
        d = e.soon ? '<span class="limite-text" style="color:#c084fc">Em breve</span>' : s ? '<span class="limite-text text-slate-400">\u{1F512} Requer plano</span>' : r ? f ? '<span class="limite-text">Ilimitado</span>' : `<div class="limite-bar" style="width: ${c}%"></div><span class="limite-text">${a}/${u}</span>` : '<span class="limite-text text-red-400">Desativado</span>',
        p = t ? "currentColor" : "none",
        A = t ? "text-yellow-400" : "text-slate-600 hover:text-yellow-400",
        g = r && !s ? "" : "opacity-50 grayscale",
        i = String(e.rota || "").replace(/'/g, "&#39;"),
        m = escapeHtml(e.titulo),
        S = escapeHtml(e.descricao),
        x = escapeHtml(o),
        y = String(e.titulo).replace(/\\/g, "\\\\").replace(/'/g, "\\'");
    return `
    <div class="relative rounded-xl bg-[#1e293b] border border-slate-700 p-4 cursor-pointer hover:border-primary-light/50 transition-all duration-200 group ${g}" onclick="openModuleCard('${i}', ${r})">
      <button class="absolute top-3 right-3 ${A} transition" onclick="event.stopPropagation(); toggleFavorito(this, '${y}')">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="${p}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
        </svg>
      </button>
      <div class="flex items-start gap-3 mb-3">
        <div class="w-11 h-11 rounded-lg module-icon flex items-center justify-center shrink-0">
          <img src="${x}" alt="${m}" width="28" height="28" class="module-icon-img">
        </div>
        <div class="pr-6">
          <h4 class="text-sm font-bold text-white leading-tight">${m}</h4>
          <p class="text-xs text-slate-400 mt-0.5">${S}</p>
        </div>
      </div>
      <div class="limite-bar-container">
        ${d}
      </div>
    </div>`
}

function renderCategorias() {
    const e = document.getElementById("categorias-filtro");
    e && (e.innerHTML = CATEGORIAS.map(t => '<button type="button" class="px-3 py-1.5 rounded-lg text-sm font-medium transition ' + (state.categoria === t.id ? "bg-primary text-white" : "bg-[#1e293b] border border-slate-700 text-slate-300 hover:border-primary-light/50") + '" data-categoria="' + t.id + '">' + escapeHtml(t.label) + "</button>").join(""), e.querySelectorAll("[data-categoria]").forEach(t => {
        t.addEventListener("click", () => {
            state.categoria = t.getAttribute("data-categoria"), renderCategorias();
            const o = document.getElementById("dashboard-search");
            renderModulos(o ? o.value : "")
        })
    }))
}

function openModuleCard(e, t) {
    if (semPlano()) {
        navigateTo("/pages/comprar");
        return
    }
    if (!t) {
        showToast("M\xF3dulo desativado para manuten\xE7\xE3o.", "error");
        return
    }
    navigateTo("/pages/consultas/" + e)
}

function toggleFavorito(e, t) {
    const o = state.favoritos.indexOf(t);
    o > -1 ? state.favoritos.splice(o, 1) : state.favoritos.push(t), localStorage.setItem("modulosFavoritos", JSON.stringify(state.favoritos));
    const n = document.getElementById("dashboard-search");
    renderModulos(n ? n.value : "")
}

function highlightActiveNav() {
    const e = location.pathname;
    document.querySelectorAll(".nav-item[data-page]").forEach(t => {
        t.classList.remove("bg-slate-800", "text-white"), t.classList.add("text-slate-300");
        const o = t.getAttribute("data-page");
        (o === "dashboard" && (e.includes("/dashboard") || e.includes("/consultas/")) || o === "comprar" && e.includes("/comprar") || o === "admin" && e.includes("/admin")) && (t.classList.add("bg-slate-800", "text-white"), t.classList.remove("text-slate-300"))
    })
}
async function fetchLimits() {
    try {
        const o = await (await fetch("/api/user/modulos", {
            credentials: "include"
        })).json();
        o?.success && Array.isArray(o.modulos) && o.modulos.forEach(n => {
            const r = MODULOS.find(f => f.rota.toLowerCase() === (n.rota || "").toLowerCase());
            r && (r.limiteUsado = n.limiteUsado || 0, r.limiteTotal = n.limiteTotal != null ? n.limiteTotal : null, r.ilimitado = n.unlimited === !0, r.enabled = n.enabled !== !1)
        })
    } catch {}
    const e = document.getElementById("dashboard-search");
    renderModulos(e ? e.value : "")
}

function initNavbar() {
    restoreNavbarState(), highlightActiveNav(), loadUserData(), injectSupportButton()
}

function injectSupportButton() {
    try {
        const e = document.getElementById("navbar");
        if (!e || e.querySelector("#support-link")) return;
        const t = e.querySelector('a[data-page="comprar"], a[href="/pages/comprar"]'),
            o = document.createElement("a");
        if (o.id = "support-link", o.href = "https://t.me/suportequerybuscas", o.target = "_blank", o.rel = "noopener noreferrer", o.className = "nav-item flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition", o.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20v-1a7 7 0 0 1 7-7h2a7 7 0 0 1 7 7v1"/><path d="M12 1v4"/><path d="M7 8a5 5 0 0 1 10 0v3"/></svg>
      <span>Fale com o Suporte</span>
    `, t && t.parentNode) t.parentNode.insertBefore(o, t.nextSibling);
        else {
            const n = e.querySelector('button[onclick="logout()"]'),
                r = e.querySelector(".flex.flex-col.gap-1.flex-1") || e.querySelector(".flex.flex-col") || e;
            n && n.parentNode ? n.parentNode.insertBefore(o, n) : r ? r.appendChild(o) : e.appendChild(o)
        }
    } catch (e) {
        console.warn("injectSupportButton error", e)
    }
}

function initDashboard() {
    initNavbar(), renderCategorias(), fetchLimits();
    const e = document.getElementById("dashboard-search");
    e && e.addEventListener("input", t => renderModulos(t.target.value))
}

function _gerarNomeArquivoPDF(e, t, o) {
    e = e || "pdf", t = t || "consulta";
    const n = Math.floor(Math.random() * (1e16 - 1e14 + 1)) + 1e14,
        r = new Date,
        f = String(r.getDate()).padStart(2, "0") + "-" + String(r.getMonth() + 1).padStart(2, "0") + "-" + r.getFullYear();
    return t + "-" + n + "-" + f + "." + e
}
async function downloadPDF(e) {
    try {
        typeof window.jspdf > "u" && (showToast("Carregando biblioteca PDF...", "info"), await new Promise((l, E) => {
            const C = "/assets/vendor/jspdf.umd.min.js",
                b = "https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js",
                N = document.createElement("script");
            N.src = C, N.onload = l, N.onerror = () => {
                const w = document.createElement("script");
                w.src = b, w.onload = l, w.onerror = E, document.head.appendChild(w)
            }, document.head.appendChild(N)
        }));
        const t = window.jspdf || window.jspPDF || null,
            {
                jsPDF: o
            } = t || {};
        if (typeof o != "function") throw new Error("jsPDF library not available");
        const n = document.querySelector(".resultado-container");
        if (!n) {
            showToast("Nenhum resultado dispon\xEDvel para gerar PDF.", "error");
            return
        }
        const r = l => new Promise((E, C) => {
                const b = document.createElement("script");
                b.src = l, b.onload = E, b.onerror = C, document.head.appendChild(b)
            }),
            f = async () => {
                if (typeof o.API?.autoTable != "function") try {
                    await r("/assets/vendor/jspdf.plugin.autotable.min.js")
                } catch (l) {
                    console.warn("Falha ao carregar AutoTable local, tentando CDN.", l), await r("https://cdn.jsdelivr.net/npm/jspdf-autotable@3.8.4/dist/jspdf.plugin.autotable.min.js")
                }
            };
        n.querySelector("table") && await f();
        const a = new o,
            u = a.internal.pageSize.getWidth(),
            c = a.internal.pageSize.getHeight(),
            s = 20,
            d = 20,
            p = 48,
            A = 36,
            g = 60,
            i = c - A,
            m = n.querySelector(".resultado-header h3")?.textContent || n.querySelector("h3")?.textContent || "Resultado",
            S = n.querySelector(".timestamp")?.textContent || "",
            x = "https://querybuscas.com",
            y = "https://t.me/querybuscasofc",
            v = 64,
            I = 8,
            T = 16,
            F = async (l, E) => {
                try {
                    const C = await fetch(l);
                    if (!C.ok) throw new Error("SVG fetch failed");
                    const b = await C.text(),
                        N = new Blob([b], {
                            type: "image/svg+xml;charset=utf-8"
                        }),
                        w = URL.createObjectURL(N),
                        P = new Image;
                    P.crossOrigin = "anonymous", await new Promise((R, $) => {
                        P.onload = R, P.onerror = $, P.src = w
                    }), URL.revokeObjectURL(w);
                    const O = document.createElement("canvas");
                    O.width = E, O.height = E;
                    const L = O.getContext("2d");
                    return L.clearRect(0, 0, O.width, O.height), L.drawImage(P, 0, 0, O.width, O.height), O.toDataURL("image/png")
                } catch (C) {
                    return console.warn("SVG \u2192 PNG conversion failed for", l, C), null
                }
            }, _ = await F("/assets/icons/internet.svg", v), q = await F("/assets/icons/telegram.svg", v);
        a.setFont("helvetica", "bold"), a.setFontSize(16), a.setTextColor(20), a.text(m, s, 36), S && (a.setFontSize(10), a.text(S, u - d - a.getTextWidth(S), 36));
        let h = g;
        const D = (l, E, C, b, N) => {
                const w = String(l || "").trim();
                if (!w) return;
                const P = E || 9,
                    O = !!b,
                    L = N || (P >= 12 ? 6 : 5),
                    R = a.splitTextToSize(w, u - s - d);
                h + R.length * L > i && (a.addPage(), h = g), a.setFont("helvetica", O ? "bold" : "normal"), a.setFontSize(P), a.setTextColor(...C || [50, 50, 50]), a.text(R, s, h), h += R.length * L + 2
            },
            B = l => {
                if (!l) return;
                if (typeof a.autoTable == "function") {
                    a.autoTable({
                        html: l,
                        startY: h,
                        margin: {
                            left: s,
                            right: d,
                            top: p,
                            bottom: A
                        },
                        theme: "grid",
                        styles: {
                            fontSize: 8,
                            cellPadding: 2,
                            overflow: "linebreak",
                            valign: "middle"
                        },
                        headStyles: {
                            fillColor: [124, 0, 201],
                            textColor: 255,
                            halign: "center"
                        },
                        alternateRowStyles: {
                            fillColor: [245, 247, 250]
                        },
                        tableLineColor: [226, 232, 240]
                    }), h = (a.lastAutoTable?.finalY || h) + 8, h > i && (a.addPage(), h = g);
                    return
                }
                const E = Array.from(l.querySelectorAll("thead th")).map(C => C.textContent.trim()).filter(Boolean);
                E.length > 0 && D(E.join(" | "), 9, [124, 0, 201], !0, 5), Array.from(l.querySelectorAll("tbody tr")).forEach(C => {
                    const b = Array.from(C.children).map(N => N.textContent.trim()).filter(Boolean).join(" | ");
                    b && D(b, 8, [50, 50, 50], !1, 5)
                })
            };
        n.querySelectorAll(".bloco-dados").forEach(l => {
            if (l.querySelector("table")) return;
            const E = l.querySelector(".bloco-titulo")?.textContent || "";
            E && (h > i && (a.addPage(), h = g), a.setFont("helvetica", "bold"), a.setFontSize(12), a.setTextColor(124, 0, 201), a.text(E, s, h), h += 10), l.querySelectorAll(".info-item").forEach(C => {
                const b = C.querySelector(".info-label")?.textContent || "",
                    N = C.querySelector(".info-value")?.textContent || "";
                if (b && N) {
                    h > i && (a.addPage(), h = g), a.setFont("helvetica", "bold"), a.setFontSize(10), a.setTextColor(20), a.text(b, s, h), a.setFont("helvetica", "normal");
                    const w = a.getTextWidth(b),
                        P = a.splitTextToSize(N, u - s - d - w - 5);
                    a.text(P, s + w + 5, h), h += P.length * 6 + 2
                }
            }), l.querySelectorAll(".lista-item").forEach(C => {
                const b = C.textContent?.trim() || "";
                b && (h > i && (a.addPage(), h = g), a.setFont("helvetica", "normal"), a.setFontSize(9), a.setTextColor(50), a.text(b, s, h), h += 6)
            }), h += 5
        }), Array.from(n.children).forEach(l => {
            const E = l.tagName ? l.tagName.toLowerCase() : "";
            if ((E === "h3" || E === "p") && (l.classList || {
                    contains: () => !1
                }).contains("timestamp") || l.classList && (l.classList.contains("resultado-header") || l.classList.contains("bloco-dados") || l.classList.contains("pessoa-item")) || l.querySelector && (l.querySelector("table") || l.querySelector(".info-item"))) return;
            const C = l.textContent ? l.textContent.trim() : "";
            C && D(C, 9, [75, 85, 99], !0, 5)
        }), Array.from(n.querySelectorAll("table")).forEach(l => B(l));
        const M = n.querySelectorAll(".pessoa-item");
        M.length > 0 && (h > i && (a.addPage(), h = g), a.setFont("helvetica", "bold"), a.setFontSize(12), a.setTextColor(124, 0, 201), a.text("RESULTADOS", s, h), h += 10, M.forEach(l => {
            const E = l.textContent?.trim() || "";
            if (E) {
                h > i && (a.addPage(), h = g), a.setFont("helvetica", "normal"), a.setFontSize(9), a.setTextColor(50);
                const C = a.splitTextToSize(E, u - s - d);
                a.text(C, s, h), h += C.length * 5 + 3
            }
        }));
        const j = (l, E, C) => {
                const b = l.internal.pageSize.getWidth(),
                    N = l.internal.pageSize.getHeight();
                if (E) try {
                    l.addImage(E, "PNG", s, T - I / 2, I, I)
                } catch {}
                if (C) try {
                    l.addImage(C, "PNG", b - d - I, T - I / 2, I, I)
                } catch {}
                l.setFont("helvetica", "normal"), l.setFontSize(10), l.setTextColor(124, 0, 201), l.text(x, s + (E ? I + 3 : 0), T + 3), l.setTextColor(0, 136, 204), l.text(y, b - d - (C ? I + 3 : 0) - l.getTextWidth(y), T + 3), l.setDrawColor(200), l.setLineWidth(.5), l.line(s, 22, b - d, 22);
                const w = N - 15;
                l.setDrawColor(200), l.setLineWidth(.5), l.line(s, w - 5, b - d, w - 5), l.setFont("helvetica", "normal"), l.setFontSize(10), l.setTextColor(124, 0, 201), l.text(x, s, w), l.setTextColor(0, 136, 204), l.text(y, b - d - l.getTextWidth(y), w)
            },
            U = a.getNumberOfPages();
        for (let l = 1; l <= U; l++) a.setPage(l), j(a, _, q);
        a.save(_gerarNomeArquivoPDF("pdf", "consulta", e)), showToast("PDF gerado.", "success")
    } catch (t) {
        console.error("Erro ao gerar PDF:", t), showToast("Erro ao gerar PDF.", "error")
    }
}

function initHomePage() {
    const e = {
            value: !1
        },
        t = document.getElementById("login-submit"),
        o = document.getElementById("register-toggle"),
        n = document.getElementById("plano-section"),
        r = document.getElementById("login-btn-text");
    o && o.addEventListener("click", () => {
        e.value = !e.value, n && (n.style.display = e.value ? "block" : "none"), r && (r.textContent = e.value ? "Cadastrar" : "Entrar"), o.textContent = e.value ? "J\xE1 tenho uma conta" : "Criar nova conta"
    }), document.querySelectorAll('.plano-option input[type="radio"]').forEach(a => {
        a.addEventListener("change", () => {
            document.querySelectorAll(".plano-option").forEach(u => u.classList.remove("selected")), a.closest(".plano-option").classList.add("selected")
        })
    }), t && t.addEventListener("click", async () => {
        const a = document.getElementById("input-usuario").value,
            u = document.getElementById("input-senha").value;
        if (!a || !u) {
            showToast("Preencha usu\xE1rio e senha!", "error");
            return
        }
        if (u.length < 6) {
            showToast("Senha deve ter no m\xEDnimo 6 caracteres!", "error");
            return
        }
        t.disabled = !0, r && (r.textContent = "Aguarde...");
        try {
            if (e.value) {
                const c = document.querySelector('input[name="plano"]:checked'),
                    s = c ? c.value : "Site-Mensal",
                    d = await fetch("/api/auth/pre-register", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            username: a,
                            password: u
                        })
                    }),
                    p = await d.json();
                if (d.status === 429) {
                    showToast("Muitas tentativas. Tente novamente em 10 minutos.", "error");
                    return
                }
                if (!p?.success) {
                    showToast("Escolha outro nome de usu\xE1rio.", "error");
                    return
                }
                showToast("Redirecionando para pagamento...", "info"), localStorage.setItem("qb_pagamento_context", JSON.stringify({
                    plano: s,
                    usuario: a,
                    preRegisterToken: p.token
                })), setTimeout(() => navigateTo("/pages/pagamento"), 700)
            } else {
                const c = await fetch("/api/auth/login", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            username: a,
                            password: u
                        })
                    }),
                    s = await c.json();
                if (c.status === 403 && s?.statusMessage === "PlanExpired") {
                    try {
                        const p = {
                                mensal: "Site-Mensal",
                                semanal: "Site-Semanal",
                                diario: "Site-Diario"
                            } [s.plano] || "Site-Mensal",
                            A = s.username || a;
                        localStorage.setItem("qb_pagamento_context", JSON.stringify({
                            plano: p,
                            usuario: A,
                            renewal: !0,
                            renewalStartDays: Number(s.diasRestantes) || 0
                        }))
                    } catch {}
                    showToast("Seu plano expirou. Redirecionando para renova\xE7\xE3o...", "info"), setTimeout(() => navigateTo("/pages/comprar"), 700);
                    return
                }
                s.success ? (localStorage.setItem("userData", JSON.stringify(s.user)), showToast("Login realizado com sucesso!", "success"), setTimeout(() => navigateTo("/pages/dashboard"), 1e3)) : showToast(s.message || "Erro ao fazer login", "error")
            }
        } catch {
            showToast("Erro de conex\xE3o com o servidor.", "error")
        } finally {
            t.disabled = !1, r && (r.textContent = e.value ? "Cadastrar" : "Entrar")
        }
    });
    const f = document.getElementById("input-senha");
    f && t && f.addEventListener("keydown", a => {
        a.key === "Enter" && t.click()
    }), sessionStorage.getItem("qb_just_redirected") ? sessionStorage.removeItem("qb_just_redirected") : fetch("/api/auth/verify", {
        credentials: "include"
    }).then(a => a.json().then(u => ({
        status: a.status,
        body: u
    }))).then(({
        status: a,
        body: u
    }) => {
        if (a === 403 && u?.statusMessage === "PlanExpired") {
            sessionStorage.setItem("qb_just_redirected", "1"), navigateTo("/pages/comprar");
            return
        }
        u?.success && (localStorage.setItem("userData", JSON.stringify(u.user)), sessionStorage.setItem("qb_just_redirected", "1"), navigateTo("/pages/dashboard"))
    }).catch(() => {})
}

function filterCPF(e) {
    e.value = e.value.replace(/[^\d.\-]/g, "").slice(0, 14)
}

function normalizeCPF(e) {
    return String(e || "").replace(/\D/g, "").slice(0, 11)
}

function isValidCPF(e) {
    const t = normalizeCPF(e);
    if (t.length !== 11 || /^(\d)\1{10}$/.test(t)) return !1;
    let o = 0;
    for (let r = 0; r < 9; r++) o += Number(t[r]) * (10 - r);
    let n = o % 11;
    if (n = n < 2 ? 0 : 11 - n, n !== Number(t[9])) return !1;
    o = 0;
    for (let r = 0; r < 10; r++) o += Number(t[r]) * (11 - r);
    return n = o % 11, n = n < 2 ? 0 : 11 - n, n === Number(t[10])
}

function filterPlaca(e) {
    e.value = e.value.replace(/[^a-zA-Z0-9\-]/g, "").toUpperCase().slice(0, 8), e.value.length > 3 && !e.value.includes("-") && (e.value = e.value.slice(0, 3) + "-" + e.value.slice(3))
}

function filterNome(e) {
    e.value = e.value.replace(/[^a-zA-ZÀ-ÿ\s'-]/g, "").slice(0, 100)
}

function filterDigits(e, t) {
    e.value = e.value.replace(/[^\d.\-]/g, "").slice(0, t || 20)
}

function filterEmail(e) {
    e.value = e.value.replace(/[^a-zA-Z0-9@._-]/g, "").toLowerCase().slice(0, 100)
}

function filterChassi(e) {
    e.value = e.value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 17)
}
const LABEL_MAP = {
    CPF: "CPF",
    NOME: "Nome",
    SEXO: "Sexo",
    NASCIMENTO: "Data de Nascimento",
    NOME_MAE: "Nome da M\xE3e",
    NOME_PAI: "Nome do Pai",
    MUNICIPIO_NASCIMENTO: "Munic\xEDpio de Nascimento",
    RACA: "Ra\xE7a",
    TIPO_SANGUINEO: "Tipo Sangu\xEDneo",
    RG: "RG",
    RENDA: "Renda",
    SCORE: "Score",
    ESTADO_CIVIL: "Estado Civil",
    OBITO: "\xD3bito",
    STATUS_RECEITA: "Status Receita",
    RECEBE_INSS: "Recebe INSS",
    PIS: "PIS",
    NIS: "NIS",
    CNS: "CNS",
    CLASSE_SOCIAL: "Classe Social",
    ESCOLARIDADE: "Escolaridade",
    PROFISSAO: "Profiss\xE3o",
    TITULO_ELEITOR: "T\xEDtulo de Eleitor",
    NUMERO: "N\xFAmero",
    ZONA: "Zona",
    SECAO: "Se\xE7\xE3o",
    TELEFONE: "Telefone",
    WHATSAPP: "WhatsApp",
    CNPJ: "CNPJ",
    RAZAO_SOCIAL: "Raz\xE3o Social",
    ADMISSAO: "Admiss\xE3o",
    DEMISSAO: "Demiss\xE3o",
    OCUPACAO: "Ocupa\xE7\xE3o",
    SALARIO: "Sal\xE1rio",
    ADMISSAO_1: "Admiss\xE3o 1",
    DEMISSAO_1: "Demiss\xE3o 1",
    ADMISSAO_2: "Admiss\xE3o 2",
    DEMISSAO_2: "Demiss\xE3o 2",
    FONTE: "Fonte",
    LOGRADOURO: "Logradouro",
    BAIRRO: "Bairro",
    CIDADE: "Cidade",
    UF: "UF",
    CEP: "CEP",
    COMPLEMENTO: "Complemento",
    TIPO_VINCULO: "V\xEDnculo",
    TIPO: "Tipo",
    PLACA: "Placa",
    MARCA: "Marca",
    MODELO: "Modelo",
    ANO: "Ano",
    COR: "Cor",
    CHASSI: "Chassi",
    RENAVAM: "Renavam",
    FANTASIA: "Nome Fantasia",
    SITUACAO: "Situa\xE7\xE3o",
    ABERTURA: "Abertura",
    ATIVIDADE_PRINCIPAL: "Atividade Principal",
    CAPITAL_SOCIAL: "Capital Social",
    QTD: "Quantidade",
    DADOS: "Dados",
    STATUS: "Status"
};

function labelPtBr(e) {
    return LABEL_MAP[e] || e.replace(/_/g, " ").replace(/\b\w/g, t => t.toUpperCase())
}

function fmtCPF(e) {
    return String(e).replace(/\D/g, "").padStart(11, "0").replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
}

function fmtCNPJ(e) {
    return String(e).replace(/\D/g, "").padStart(14, "0").replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5")
}

function fmtTelefone(e) {
    const t = String(e).replace(/\D/g, "");
    return t.length === 11 ? t.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3") : t.length === 10 ? t.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3") : e
}

function fmtCEP(e) {
    const t = String(e).replace(/\D/g, "");
    return t.length === 8 ? t.replace(/(\d{5})(\d{3})/, "$1-$2") : e
}

function fmtDate(e) {
    if (!e) return "";
    const t = String(e).match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (t) return t[3] + "/" + t[2] + "/" + t[1];
    const o = String(e).match(/^(\d{2})(\d{2})(\d{4})$/);
    return o ? o[1] + "/" + o[2] + "/" + o[3] : e
}

function fmtMoney(e) {
    if (e == null || e === "") return "";
    let t = String(e).trim().replace(/^R\$\s*/i, "");
    t.indexOf(",") !== -1 ? t = t.replace(/\./g, "").replace(/,/g, ".") : t = t.replace(/[^0-9.\-]/g, "");
    const o = Number(t);
    return Number.isFinite(o) ? "R$ " + o.toLocaleString("pt-BR", {
        minimumFractionDigits: 2
    }) : String(e)
}

function renderTabs(e) {
    const t = e.map((n, r) => {
            const f = n.badge != null ? ' <span class="badge">' + n.badge + "</span>" : "";
            return '<button class="tab-btn' + (r === 0 ? " active" : "") + '" data-tab="' + n.id + '">' + n.label + f + "</button>"
        }).join(""),
        o = e.map((n, r) => '<div class="tab-panel' + (r === 0 ? " active" : "") + '" data-tab-panel="' + n.id + '">' + n.html + "</div>").join("");
    return '<div class="tab-bar">' + t + "</div>" + o
}

function initTabListeners(e) {
    const t = e || document;
    t.querySelectorAll(".tab-btn").forEach(o => {
        o.addEventListener("click", () => {
            const n = o.getAttribute("data-tab");
            t.querySelectorAll(".tab-btn").forEach(f => f.classList.remove("active")), t.querySelectorAll(".tab-panel").forEach(f => f.classList.remove("active")), o.classList.add("active");
            const r = t.querySelector('[data-tab-panel="' + n + '"]');
            r && r.classList.add("active")
        })
    })
}

function renderInfoGrid(e) {
    return '<div class="info-grid bloco-dados">' + e.filter(o => o.value !== null && o.value !== void 0 && o.value !== "").map(o => {
        const n = escapeHtml(o.label),
            r = o.value !== null && typeof o.value == "object" && "__html" in o.value ? o.value.__html : escapeHtml(String(o.value));
        return '<div class="info-row info-item"><span class="info-label text-slate-400 font-semibold whitespace-nowrap">' + n + ':</span><span class="info-value text-slate-200">' + r + "</span></div>"
    }).join("") + "</div>"
}

function renderInfoGridShowAll(e) {
    return '<div class="info-grid bloco-dados">' + e.map(o => {
        let n;
        Array.isArray(o.value) ? n = o.value.join(", ") : o.value === null || o.value === void 0 || o.value === "" ? n = "N\xE3o Encontrado" : n = String(o.value);
        const r = escapeHtml(o.label),
            f = escapeHtml(n);
        return '<div class="info-row info-item"><span class="info-label text-slate-400 font-semibold whitespace-nowrap">' + r + ':</span><span class="info-value text-slate-200">' + f + "</span></div>"
    }).join("") + "</div>"
}

function escapeHtml(e) {
    return String(e).replace(/[&<>"']/g, function(t) {
        return {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        } [t]
    })
}

function postprocessResult(e, t) {
    t = t || {};
    const o = new Set((t.hideKeys || []).map(c => String(c).toLowerCase()).concat(["status", "encontrado"])),
        n = t.foundKey ? String(t.foundKey).toLowerCase() : null,
        r = t.foundMessagePrefix || null;
    let f = e;
    if (typeof e == "string" && (f = document.querySelector(e)), !f) return;
    const a = f.querySelector(".resultado-container") || f;
    let u = null;
    if (n && a.querySelectorAll(".info-item").forEach(c => {
            const s = c.querySelector(".info-label"),
                d = c.querySelector(".info-value");
            if (!s || !d) return;
            s.textContent.replace(":", "").trim().toLowerCase() === n && (u = d.textContent.trim())
        }), a.querySelectorAll(".info-item").forEach(c => {
            const s = c.querySelector(".info-label"),
                d = c.querySelector(".info-value");
            if (!s || !d) return;
            const p = s.textContent.replace(":", "").trim().toLowerCase();
            if (o.has(p)) {
                c.remove();
                return
            }
            if (p === "cpf") {
                const A = d.textContent.trim();
                if (A) {
                    const g = A.replace(/\D/g, ""),
                        i = document.createElement("a");
                    i.href = "/pages/consultas/Cpf?q=" + encodeURIComponent(g), i.style.color = "#7c3aed", i.style.textDecoration = "underline", i.textContent = A, d.innerHTML = "", d.appendChild(i)
                }
            }
        }), n && u) {
        const c = document.createElement("p");
        c.className = "text-sm text-green-400 mb-3";
        const s = escapeHtml(u),
            d = r ? escapeHtml(r) : "Resultado encontrado para o " + (n || "");
        c.innerHTML = d + ' "' + s + '"';
        const p = a.querySelector("h3");
        p && p.parentNode && p.parentNode.insertBefore(c, p.nextSibling)
    }
}

function renderTable(e, t) {
    if (!t || t.length === 0) return renderEmptyState("Nenhum registro encontrado.");
    const o = typeof e[0] == "string",
        n = e.map(f => "<th>" + escapeHtml(o ? f : f.label) + "</th>").join(""),
        r = t.map(f => "<tr>" + e.map((u, c) => {
            const s = o ? Array.isArray(f) ? f[c] ?? "" : "" : f[u.key] ?? "";
            return s !== null && typeof s == "object" && "__html" in s ? "<td>" + s.__html + "</td>" : "<td>" + escapeHtml(String(s)) + "</td>"
        }).join("") + "</tr>").join("");
    return '<div class="bloco-dados overflow-x-auto"><table class="result-table"><thead><tr>' + n + "</tr></thead><tbody>" + r + "</tbody></table></div>"
}

function renderCards(e, t) {
    return !e || e.length === 0 ? renderEmptyState("Nenhum registro encontrado.") : '<div class="bloco-dados">' + e.map(t).join("") + "</div>"
}

function renderEmptyState(e) {
    return '<div class="empty-state">' + (e || "Nenhum registro encontrado.") + "</div>"
}
var COPY_LABELS = {
    CPF: "CPF",
    CNPJ: "CNPJ",
    RG: "RG",
    CNH: "CNH",
    PIS: "PIS",
    NIS: "NIS",
    CNS: "CNS",
    NOME: "Nome",
    NOME_MAE: "Nome da M\xE3e",
    NOME_PAI: "Nome do Pai",
    SEXO: "Sexo",
    NASCIMENTO: "Data de Nascimento",
    DATA_NASCIMENTO: "Data de Nascimento",
    IDADE: "Idade",
    MUNICIPIO_NASCIMENTO: "Munic\xEDpio de Nascimento",
    RACA: "Ra\xE7a",
    TIPO_SANGUINEO: "Tipo Sangu\xEDneo",
    ESTADO_CIVIL: "Estado Civil",
    ESCOLARIDADE: "Escolaridade",
    PROFISSAO: "Profiss\xE3o",
    RENDA: "Renda",
    SCORE: "Score",
    CLASSE_SOCIAL: "Classe Social",
    OBITO: "\xD3bito",
    STATUS_RECEITA: "Status na Receita",
    RECEBE_INSS: "Recebe INSS",
    TITULO_ELEITOR: "T\xEDtulo de Eleitor",
    TELEFONE: "Telefone",
    WHATSAPP: "WhatsApp",
    EMAIL: "Email",
    EMAILS: "Emails",
    TELEFONES: "Telefones",
    CEP: "CEP",
    LOGRADOURO: "Logradouro",
    NUMERO: "N\xFAmero",
    COMPLEMENTO: "Complemento",
    BAIRRO: "Bairro",
    CIDADE: "Cidade",
    MUNICIPIO: "Munic\xEDpio",
    UF: "UF",
    ENDERECOS: "Endere\xE7os",
    RAZAO_SOCIAL: "Raz\xE3o Social",
    NOME_FANTASIA: "Nome Fantasia",
    CARGO: "Cargo",
    PARTICIPACAO: "Participa\xE7\xE3o",
    ABERTURA: "Abertura",
    CAPITAL_SOCIAL: "Capital Social",
    SITUACAO: "Situa\xE7\xE3o",
    EMPRESAS: "Empresas",
    EMPREGOS: "Empregos",
    BANCOS: "Bancos",
    PARENTES: "Parentes",
    VEICULOS: "Ve\xEDculos",
    PLACA: "Placa",
    RENAVAM: "Renavam",
    CHASSI: "Chassi",
    MODELO: "Modelo",
    MARCA: "Marca",
    ANO: "Ano",
    COR: "Cor",
    ADMISSAO: "Admiss\xE3o",
    DEMISSAO: "Demiss\xE3o",
    OCUPACAO: "Ocupa\xE7\xE3o",
    SALARIO: "Sal\xE1rio",
    TIPO_VINCULO: "V\xEDnculo",
    BANCO: "Banco",
    AGENCIA: "Ag\xEAncia",
    CONTA: "Conta",
    TOTAL: "Total",
    RESULTADOS: "Resultados",
    DADOS: "Dados"
};

function _qbHumanize(e) {
    return String(e).replace(/[_\-]+/g, " ").replace(/\s+/g, " ").trim().toLowerCase().replace(/(^|\s)\S/g, function(t) {
        return t.toUpperCase()
    })
}

function _qbLabel(e) {
    var t = String(e).toUpperCase();
    return COPY_LABELS[t] || _qbHumanize(e)
}

function formatJsonForCopy(e) {
    if (e == null || typeof e != "object") return "";
    var t = {
            hasresult: 1,
            status: 1,
            success: 1,
            encontrado: 1,
            limiterestante: 1,
            requestid: 1,
            message: 1,
            msg: 1
        },
        o = /(^|_)(foto|fotoes|base64|imagem|imagens|assinatura|qrcode|qr_code)(_|$)/i,
        n = ["DADOS", "RESULTADOS", "REGISTROS", "LISTA", "ITENS", "PROPRIETARIOS"],
        r = [],
        f = function() {
            r.length && r[r.length - 1] !== "" && r.push("")
        };

    function a(d) {
        if (d == null) return !0;
        var p = String(d).trim();
        return p === "" || /^(não encontrado|nao encontrado|n\/a|null|undefined|-)$/i.test(p)
    }

    function u(d) {
        return typeof d == "boolean" ? d ? "Sim" : "N\xE3o" : String(d).trim()
    }

    function c(d, p) {
        var A = "  ".repeat(p);
        Object.keys(d).forEach(function(g) {
            var i = d[g];
            if (!(t[String(g).toLowerCase()] || o.test(g) || i === null || i === void 0)) {
                if (Array.isArray(i)) {
                    s(g, i, p);
                    return
                }
                if (typeof i == "object") {
                    var m = Object.keys(i).find(function(v) {
                            return n.indexOf(v.toUpperCase()) >= 0 && Array.isArray(i[v])
                        }),
                        S = Object.keys(i).filter(function(v) {
                            return v !== m && !t[v.toLowerCase()] && typeof i[v] != "object" && !a(i[v])
                        });
                    if (m && S.length === 0) {
                        s(g, i[m], p);
                        return
                    }
                    var x = Object.keys(i).some(function(v) {
                        return !t[v.toLowerCase()] && !o.test(v) && !a(i[v])
                    });
                    if (!x) return;
                    f(), r.push(A + _qbLabel(g).toUpperCase()), c(i, p + 1);
                    return
                }
                if (!a(i)) {
                    var y = u(i);
                    typeof i == "string" && y.length > 400 || r.push(A + _qbLabel(g) + ": " + y)
                }
            }
        })
    }

    function s(d, p, A) {
        var g = "  ".repeat(A),
            i = (p || []).filter(function(m) {
                return !(m == null || typeof m != "object" && a(m))
            });
        if (i.length) {
            if (i.every(function(m) {
                    return typeof m != "object"
                })) {
                r.push(g + _qbLabel(d) + ": " + i.map(u).join(", "));
                return
            }
            f(), r.push(g + _qbLabel(d).toUpperCase() + " (" + i.length + ")"), i.forEach(function(m, S) {
                f(), r.push(g + "  \u2022 Item " + (S + 1)), m && typeof m == "object" ? c(m, A + 2) : r.push(g + "    " + u(m))
            })
        }
    }
    try {
        Array.isArray(e) ? s("Resultados", e, 0) : c(e, 0)
    } catch {
        return ""
    }
    return r.join(`
`).replace(/\n{3,}/g, `

`).trim()
}(function() {
    if (typeof window > "u" || !window.fetch || window.__qbFetchHooked) return;
    window.__qbFetchHooked = !0;
    var e = window.fetch.bind(window),
        t = /\/api\/(consultas|geradores)\/|\/geradores\/|\/api\/telegram\/data\//,
        o = /\/api\/(consultas|geradores)\/|\/geradores\//,
        n = "/api/consultas/nonce",
        r = "/api/consultas/verificar-humano",
        f = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

    function a(i) {
        return i.indexOf(n) !== -1 || i.indexOf(r) !== -1
    }
    var u = null;

    function c() {
        return u || (u = new Promise(function(i, m) {
            if (window.turnstile) return i();
            var S = document.createElement("script");
            S.src = f, S.async = !0, S.defer = !0, S.onload = function() {
                i()
            }, S.onerror = function() {
                m(new Error("turnstile-load-failed"))
            }, document.head.appendChild(S)
        }), u)
    }
    var s = null;

    function d(i, m) {
        return s || (s = c().then(function() {
            return new Promise(function(S, x) {
                var y = document.createElement("div");
                y.className = "modal-overlay", y.innerHTML = '<div class="rounded-xl bg-[#1e293b] border border-slate-700 p-6 max-w-sm mx-4 text-center shadow-2xl"><h3 class="text-base font-bold text-white mb-2">Verifica\xE7\xE3o de seguran\xE7a</h3><p class="text-sm text-slate-400 mb-4">Confirme que voc\xEA n\xE3o \xE9 um rob\xF4 para continuar consultando.</p><div id="qb-turnstile-box" class="flex justify-center"></div></div>', document.body.appendChild(y), requestAnimationFrame(function() {
                    y.classList.add("show")
                });

                function v() {
                    y.classList.remove("show"), setTimeout(function() {
                        y.remove()
                    }, 300)
                }
                var I = window.turnstile.render(y.querySelector("#qb-turnstile-box"), {
                    sitekey: i,
                    action: m || "consulta",
                    theme: "dark",
                    callback: function(T) {
                        v(), S(T)
                    },
                    "expired-callback": function() {
                        window.turnstile.reset(I)
                    },
                    "error-callback": function() {
                        v(), x(new Error("turnstile-error"))
                    }
                })
            })
        }), s.then(function() {
            s = null
        }, function() {
            s = null
        }), s)
    }

    function p(i) {
        return d(i.siteKey, i.action).then(function(m) {
            return e(r, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    token: m
                })
            }).then(function(S) {
                return S.json()
            })
        })
    }

    function A(i) {
        return e(n, {
            method: "POST",
            credentials: "include"
        }).then(function(m) {
            return m.ok ? m.json().then(function(S) {
                var x = i[0],
                    y = i[1] ? Object.assign({}, i[1]) : {},
                    v = new Headers(y.headers || {});
                return v.set("X-QB-Nonce", S.nonce), v.set("X-QB-Sig", S.sig), y.headers = v, y.credentials === void 0 && (y.credentials = "include"), e(x, y)
            }) : m
        })
    }

    function g(i) {
        return A(i).then(function(m) {
            return m.status !== 403 ? m : m.clone().json().then(function(S) {
                return !S || !S.requireCaptcha ? m : p(S).then(function(x) {
                    return !x || !x.success ? m : A(i)
                }).catch(function() {
                    return m
                })
            }).catch(function() {
                return m
            })
        })
    }
    window.QB_TURNSTILE = {
        pedirCaptcha: d
    }, window.fetch = function() {
        var i = arguments,
            m = typeof i[0] == "string" ? i[0] : i[0] && i[0].url || "",
            S = !a(m) && o.test(m),
            x = S ? g(i) : e.apply(null, i);
        try {
            !a(m) && t.test(m) && x.then(function(y) {
                try {
                    y.clone().json().then(function(v) {
                        try {
                            var I = v;
                            /\/api\/telegram\/data\//.test(m) && (I = v && v.dados ? v.dados : null), v && (v.success === !1 || v.hasResult === !1) && (I = null), window.__qbResult = I && typeof I == "object" ? I : null
                        } catch {}
                    }).catch(function() {})
                } catch {}
            }).catch(function() {})
        } catch {}
        return x
    }
})();

function formatResultForCopy(e) {
    try {
        if (typeof window < "u" && window.__qbResult && typeof window.__qbResult == "object") {
            const a = formatJsonForCopy(window.__qbResult);
            if (a && a.trim()) return a
        }
    } catch {}
    let t = e;
    if (typeof e == "string" && (t = document.querySelector(e)), !t) return "";
    const o = t.querySelector(".resultado-container") || t,
        n = [],
        r = () => {
            n.length && n[n.length - 1] !== "" && n.push("")
        };

    function f(a) {
        if (!a || a.nodeType !== 1) return !1;
        const u = a.classList;
        if (/^H[1-6]$/.test(a.tagName) || u && u.contains("bloco-titulo")) {
            const c = (a.textContent || "").trim();
            return c && (r(), n.push(c.toUpperCase()), n.push("\u2500".repeat(Math.min(Math.max(c.length, 4), 32)))), !0
        }
        if (u && u.contains("timestamp")) {
            const c = (a.textContent || "").trim();
            return c && n.push("Data: " + c), !0
        }
        if (u && u.contains("info-item")) {
            const c = a.querySelector(".info-label"),
                s = a.querySelector(".info-value");
            if (c && s) {
                const d = (c.textContent || "").replace(/:\s*$/, "").trim(),
                    p = (s.textContent || "").trim();
                p && !/^não encontrado$/i.test(p) && n.push(d + ": " + p)
            }
            return !0
        }
        if (u && u.contains("empty-state")) {
            const c = (a.textContent || "").trim();
            return c && n.push(c), !0
        }
        if (a.tagName === "TABLE" && u && u.contains("result-table")) {
            const c = Array.prototype.map.call(a.querySelectorAll("thead th"), d => (d.textContent || "").trim()),
                s = Array.prototype.slice.call(a.querySelectorAll("tbody tr"));
            return s.forEach((d, p) => {
                const A = Array.prototype.map.call(d.children, g => (g.textContent || "").trim());
                r(), s.length > 1 && n.push("\u2022 Item " + (p + 1)), A.forEach((g, i) => {
                    if (!g) return;
                    const m = c[i] || "Coluna " + (i + 1);
                    n.push((s.length > 1 ? "   " : "") + m + ": " + g)
                })
            }), !0
        }
        return !1
    }
    return (function a(u) {
        for (let c = 0; c < u.childNodes.length; c++) {
            const s = u.childNodes[c];
            f(s) || a(s)
        }
    })(o), n.join(`
`).replace(/\n{3,}/g, `

`).trim()
}
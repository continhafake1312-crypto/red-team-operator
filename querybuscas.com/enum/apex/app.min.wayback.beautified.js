var _____WB$wombat$assign$function_____ = function(name) {
    return (globalThis._wb_wombat && globalThis._wb_wombat.local_init && globalThis._wb_wombat.local_init(name)) || globalThis[name];
};
if (!globalThis.__WB_pmw) {
    globalThis.__WB_pmw = function(obj) {
        this.__WB_source = obj;
        return this;
    }
} {
    let window = _____WB$wombat$assign$function_____("window");
    let self = _____WB$wombat$assign$function_____("self");
    let document = _____WB$wombat$assign$function_____("document");
    let location = _____WB$wombat$assign$function_____("location");
    let top = _____WB$wombat$assign$function_____("top");
    let parent = _____WB$wombat$assign$function_____("parent");
    let frames = _____WB$wombat$assign$function_____("frames");
    let opener = _____WB$wombat$assign$function_____("opener");
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
            descricao: "Descubra o titular de qualquer chave PIX (CPF, e-mail, telefone, CNPJ ou aleat\xF3ria)",
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
            categoria: "geradores",
            soon: !0
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
        };

    function handleApiError(e) {
        const t = e?.status || e?.response?.status;
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
        t.id = "navbar-toggle-mobile", t.title = "Abrir menu", t.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>', t.onclick = toggleNavbar, document.body.appendChild(t);
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
        t("user-name") && (t("user-name").textContent = e.username || "N/A"), t("user-plano") && (t("user-plano").textContent = e.plano || "N/A"), t("user-dias") && (t("user-dias").textContent = `em ${e.diasRestantes||0} dias`), e.type === "admin" && document.querySelectorAll("[data-admin-only]").forEach(o => {
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
        let n = MODULOS.map((r, u) => ({
            ...r,
            index: u
        }));
        if (state.categoria && state.categoria !== "todos" && (n = n.filter(r => r.categoria === state.categoria)), e) {
            const r = e.toLowerCase();
            n = n.filter(u => u.titulo.toLowerCase().includes(r) || u.descricao.toLowerCase().includes(r))
        }
        n.sort((r, u) => {
            const a = state.favoritos.includes(r.titulo),
                l = state.favoritos.includes(u.titulo);
            return a && !l ? -1 : !a && l ? 1 : r.index - u.index
        }), o && (o.textContent = n.length), t.innerHTML = n.map(r => cardHTML(r)).join("")
    }

    function cardHTML(e) {
        const t = state.favoritos.includes(e.titulo),
            o = "/assets/icons/" + e.icon,
            n = state.userData?.plano,
            r = e.enabled !== !1,
            u = e.ilimitado === !0 || e.ilimitado == null && n === "mensal",
            a = e.limiteUsado || 0,
            l = e.limiteTotal != null ? e.limiteTotal : n === "semanal" ? 200 : 50,
            c = u ? 0 : Math.min(100, Math.round(a / l * 100)),
            i = e.soon ? '<span class="limite-text" style="color:#c084fc">Em breve</span>' : r ? u ? '<span class="limite-text">Ilimitado</span>' : `<div class="limite-bar" style="width: ${c}%"></div><span class="limite-text">${a}/${l}</span>` : '<span class="limite-text text-red-400">Desativado</span>',
            d = t ? "currentColor" : "none",
            m = t ? "text-yellow-400" : "text-slate-600 hover:text-yellow-400",
            b = r ? "" : "opacity-50 grayscale",
            p = String(e.rota || "").replace(/'/g, "&#39;"),
            f = escapeHtml(e.titulo),
            C = escapeHtml(e.descricao),
            N = escapeHtml(o),
            O = String(e.titulo).replace(/\\/g, "\\\\").replace(/'/g, "\\'");
        return `
    <div class="relative rounded-xl bg-[#1e293b] border border-slate-700 p-4 cursor-pointer hover:border-primary-light/50 transition-all duration-200 group ${b}" onclick="openModuleCard('${p}', ${r})">
      <button class="absolute top-3 right-3 ${m} transition" onclick="event.stopPropagation(); toggleFavorito(this, '${O}')">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="${d}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
        </svg>
      </button>
      <div class="flex items-start gap-3 mb-3">
        <div class="w-11 h-11 rounded-lg module-icon flex items-center justify-center shrink-0">
          <img src="${N}" alt="${f}" width="28" height="28" class="module-icon-img">
        </div>
        <div class="pr-6">
          <h4 class="text-sm font-bold text-white leading-tight">${f}</h4>
          <p class="text-xs text-slate-400 mt-0.5">${C}</p>
        </div>
      </div>
      <div class="limite-bar-container">
        ${i}
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
                const r = MODULOS.find(u => u.rota.toLowerCase() === (n.rota || "").toLowerCase());
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
            if (o.id = "support-link", o.href = "https://web.archive.org/web/20260728161025/https://t.me/suportequerybuscas", o.target = "_blank", o.rel = "noopener noreferrer", o.className = "nav-item flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition", o.innerHTML = `
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
            u = String(r.getDate()).padStart(2, "0") + "-" + String(r.getMonth() + 1).padStart(2, "0") + "-" + r.getFullYear();
        return t + "-" + n + "-" + u + "." + e
    }
    async function downloadPDF(e) {
        try {
            typeof window.jspdf > "u" && (showToast("Carregando biblioteca PDF...", "info"), await new Promise((s, S) => {
                const h = "/assets/vendor/jspdf.umd.min.js",
                    v = "https://web.archive.org/web/20260728161025/https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js",
                    A = document.createElement("script");
                A.src = h, A.onload = s, A.onerror = () => {
                    const y = document.createElement("script");
                    y.src = v, y.onload = s, y.onerror = S, document.head.appendChild(y)
                }, document.head.appendChild(A)
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
            const r = s => new Promise((S, h) => {
                    const v = document.createElement("script");
                    v.src = s, v.onload = S, v.onerror = h, document.head.appendChild(v)
                }),
                u = async () => {
                    if (typeof o.API?.autoTable != "function") try {
                        await r("/assets/vendor/jspdf.plugin.autotable.min.js")
                    } catch (s) {
                        console.warn("Falha ao carregar AutoTable local, tentando CDN.", s), await r("https://web.archive.org/web/20260728161025/https://cdn.jsdelivr.net/npm/jspdf-autotable@3.8.4/dist/jspdf.plugin.autotable.min.js")
                    }
                };
            n.querySelector("table") && await u();
            const a = new o,
                l = a.internal.pageSize.getWidth(),
                c = a.internal.pageSize.getHeight(),
                i = 20,
                d = 20,
                m = 48,
                b = 36,
                p = 60,
                f = c - b,
                C = n.querySelector(".resultado-header h3")?.textContent || n.querySelector("h3")?.textContent || "Resultado",
                N = n.querySelector(".timestamp")?.textContent || "",
                O = "https://web.archive.org/web/20260728161025/https://querybuscas.com",
                x = "https://web.archive.org/web/20260728161025/https://t.me/querybuscasofc",
                E = 64,
                P = 8,
                R = 16,
                F = async (s, S) => {
                    try {
                        const h = await fetch(s);
                        if (!h.ok) throw new Error("SVG fetch failed");
                        const v = await h.text(),
                            A = new Blob([v], {
                                type: "image/svg+xml;charset=utf-8"
                            }),
                            y = URL.createObjectURL(A),
                            I = new Image;
                        I.crossOrigin = "anonymous", await new Promise((L, $) => {
                            I.onload = L, I.onerror = $, I.src = y
                        }), URL.revokeObjectURL(y);
                        const w = document.createElement("canvas");
                        w.width = S, w.height = S;
                        const T = w.getContext("2d");
                        return T.clearRect(0, 0, w.width, w.height), T.drawImage(I, 0, 0, w.width, w.height), w.toDataURL("image/png")
                    } catch (h) {
                        return console.warn("SVG \u2192 PNG conversion failed for", s, h), null
                    }
                }, _ = await F("/assets/icons/internet.svg", E), q = await F("/assets/icons/telegram.svg", E);
            a.setFont("helvetica", "bold"), a.setFontSize(16), a.setTextColor(20), a.text(C, i, 36), N && (a.setFontSize(10), a.text(N, l - d - a.getTextWidth(N), 36));
            let g = p;
            const D = (s, S, h, v, A) => {
                    const y = String(s || "").trim();
                    if (!y) return;
                    const I = S || 9,
                        w = !!v,
                        T = A || (I >= 12 ? 6 : 5),
                        L = a.splitTextToSize(y, l - i - d);
                    g + L.length * T > f && (a.addPage(), g = p), a.setFont("helvetica", w ? "bold" : "normal"), a.setFontSize(I), a.setTextColor(...h || [50, 50, 50]), a.text(L, i, g), g += L.length * T + 2
                },
                B = s => {
                    if (!s) return;
                    if (typeof a.autoTable == "function") {
                        a.autoTable({
                            html: s,
                            startY: g,
                            margin: {
                                left: i,
                                right: d,
                                top: m,
                                bottom: b
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
                        }), g = (a.lastAutoTable?.finalY || g) + 8, g > f && (a.addPage(), g = p);
                        return
                    }
                    const S = Array.from(s.querySelectorAll("thead th")).map(h => h.textContent.trim()).filter(Boolean);
                    S.length > 0 && D(S.join(" | "), 9, [124, 0, 201], !0, 5), Array.from(s.querySelectorAll("tbody tr")).forEach(h => {
                        const v = Array.from(h.children).map(A => A.textContent.trim()).filter(Boolean).join(" | ");
                        v && D(v, 8, [50, 50, 50], !1, 5)
                    })
                };
            n.querySelectorAll(".bloco-dados").forEach(s => {
                if (s.querySelector("table")) return;
                const S = s.querySelector(".bloco-titulo")?.textContent || "";
                S && (g > f && (a.addPage(), g = p), a.setFont("helvetica", "bold"), a.setFontSize(12), a.setTextColor(124, 0, 201), a.text(S, i, g), g += 10), s.querySelectorAll(".info-item").forEach(h => {
                    const v = h.querySelector(".info-label")?.textContent || "",
                        A = h.querySelector(".info-value")?.textContent || "";
                    if (v && A) {
                        g > f && (a.addPage(), g = p), a.setFont("helvetica", "bold"), a.setFontSize(10), a.setTextColor(20), a.text(v, i, g), a.setFont("helvetica", "normal");
                        const y = a.getTextWidth(v),
                            I = a.splitTextToSize(A, l - i - d - y - 5);
                        a.text(I, i + y + 5, g), g += I.length * 6 + 2
                    }
                }), s.querySelectorAll(".lista-item").forEach(h => {
                    const v = h.textContent?.trim() || "";
                    v && (g > f && (a.addPage(), g = p), a.setFont("helvetica", "normal"), a.setFontSize(9), a.setTextColor(50), a.text(v, i, g), g += 6)
                }), g += 5
            }), Array.from(n.children).forEach(s => {
                const S = s.tagName ? s.tagName.toLowerCase() : "";
                if ((S === "h3" || S === "p") && (s.classList || {
                        contains: () => !1
                    }).contains("timestamp") || s.classList && (s.classList.contains("resultado-header") || s.classList.contains("bloco-dados") || s.classList.contains("pessoa-item")) || s.querySelector && (s.querySelector("table") || s.querySelector(".info-item"))) return;
                const h = s.textContent ? s.textContent.trim() : "";
                h && D(h, 9, [75, 85, 99], !0, 5)
            }), Array.from(n.querySelectorAll("table")).forEach(s => B(s));
            const M = n.querySelectorAll(".pessoa-item");
            M.length > 0 && (g > f && (a.addPage(), g = p), a.setFont("helvetica", "bold"), a.setFontSize(12), a.setTextColor(124, 0, 201), a.text("RESULTADOS", i, g), g += 10, M.forEach(s => {
                const S = s.textContent?.trim() || "";
                if (S) {
                    g > f && (a.addPage(), g = p), a.setFont("helvetica", "normal"), a.setFontSize(9), a.setTextColor(50);
                    const h = a.splitTextToSize(S, l - i - d);
                    a.text(h, i, g), g += h.length * 5 + 3
                }
            }));
            const j = (s, S, h) => {
                    const v = s.internal.pageSize.getWidth(),
                        A = s.internal.pageSize.getHeight();
                    if (S) try {
                        s.addImage(S, "PNG", i, R - P / 2, P, P)
                    } catch {}
                    if (h) try {
                        s.addImage(h, "PNG", v - d - P, R - P / 2, P, P)
                    } catch {}
                    s.setFont("helvetica", "normal"), s.setFontSize(10), s.setTextColor(124, 0, 201), s.text(O, i + (S ? P + 3 : 0), R + 3), s.setTextColor(0, 136, 204), s.text(x, v - d - (h ? P + 3 : 0) - s.getTextWidth(x), R + 3), s.setDrawColor(200), s.setLineWidth(.5), s.line(i, 22, v - d, 22);
                    const y = A - 15;
                    s.setDrawColor(200), s.setLineWidth(.5), s.line(i, y - 5, v - d, y - 5), s.setFont("helvetica", "normal"), s.setFontSize(10), s.setTextColor(124, 0, 201), s.text(O, i, y), s.setTextColor(0, 136, 204), s.text(x, v - d - s.getTextWidth(x), y)
                },
                U = a.getNumberOfPages();
            for (let s = 1; s <= U; s++) a.setPage(s), j(a, _, q);
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
                document.querySelectorAll(".plano-option").forEach(l => l.classList.remove("selected")), a.closest(".plano-option").classList.add("selected")
            })
        }), t && t.addEventListener("click", async () => {
            const a = document.getElementById("input-usuario").value,
                l = document.getElementById("input-senha").value;
            if (!a || !l) {
                showToast("Preencha usu\xE1rio e senha!", "error");
                return
            }
            if (l.length < 6) {
                showToast("Senha deve ter no m\xEDnimo 6 caracteres!", "error");
                return
            }
            t.disabled = !0, r && (r.textContent = "Aguarde...");
            try {
                if (e.value) {
                    const c = document.querySelector('input[name="plano"]:checked'),
                        i = c ? c.value : "Site-Mensal",
                        d = await fetch("/api/auth/pre-register", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify({
                                username: a,
                                password: l
                            })
                        }),
                        m = await d.json();
                    if (d.status === 429) {
                        showToast("Muitas tentativas. Tente novamente em 10 minutos.", "error");
                        return
                    }
                    if (!m?.success) {
                        showToast("Escolha outro nome de usu\xE1rio.", "error");
                        return
                    }
                    showToast("Redirecionando para pagamento...", "info"), sessionStorage.setItem("qb_pagamento_context", JSON.stringify({
                        plano: i,
                        usuario: a,
                        preRegisterToken: m.token
                    })), setTimeout(() => navigateTo("/pages/pagamento"), 700)
                } else {
                    const c = await fetch("/api/auth/login", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify({
                                username: a,
                                password: l
                            })
                        }),
                        i = await c.json();
                    if (c.status === 403 && i?.statusMessage === "PlanExpired") {
                        try {
                            const m = {
                                    mensal: "Site-Mensal",
                                    semanal: "Site-Semanal",
                                    diario: "Site-Diario"
                                } [i.plano] || "Site-Mensal",
                                b = i.username || a;
                            sessionStorage.setItem("qb_pagamento_context", JSON.stringify({
                                plano: m,
                                usuario: b,
                                renewal: !0,
                                renewalStartDays: Number(i.diasRestantes) || 0
                            }))
                        } catch {}
                        showToast("Seu plano expirou. Redirecionando para renova\xE7\xE3o...", "info"), setTimeout(() => navigateTo("/pages/comprar"), 700);
                        return
                    }
                    i.success ? (localStorage.setItem("userData", JSON.stringify(i.user)), showToast("Login realizado com sucesso!", "success"), setTimeout(() => navigateTo("/pages/dashboard"), 1e3)) : showToast(i.message || "Erro ao fazer login", "error")
                }
            } catch {
                showToast("Erro de conex\xE3o com o servidor.", "error")
            } finally {
                t.disabled = !1, r && (r.textContent = e.value ? "Cadastrar" : "Entrar")
            }
        });
        const u = document.getElementById("input-senha");
        u && t && u.addEventListener("keydown", a => {
            a.key === "Enter" && t.click()
        }), sessionStorage.getItem("qb_just_redirected") ? sessionStorage.removeItem("qb_just_redirected") : fetch("/api/auth/verify", {
            credentials: "include"
        }).then(a => a.json().then(l => ({
            status: a.status,
            body: l
        }))).then(({
            status: a,
            body: l
        }) => {
            if (a === 403 && l?.statusMessage === "PlanExpired") {
                sessionStorage.setItem("qb_just_redirected", "1"), navigateTo("/pages/comprar");
                return
            }
            l?.success && (localStorage.setItem("userData", JSON.stringify(l.user)), sessionStorage.setItem("qb_just_redirected", "1"), navigateTo("/pages/dashboard"))
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
                const u = n.badge != null ? ' <span class="badge">' + n.badge + "</span>" : "";
                return '<button class="tab-btn' + (r === 0 ? " active" : "") + '" data-tab="' + n.id + '">' + n.label + u + "</button>"
            }).join(""),
            o = e.map((n, r) => '<div class="tab-panel' + (r === 0 ? " active" : "") + '" data-tab-panel="' + n.id + '">' + n.html + "</div>").join("");
        return '<div class="tab-bar">' + t + "</div>" + o
    }

    function initTabListeners(e) {
        const t = e || document;
        t.querySelectorAll(".tab-btn").forEach(o => {
            o.addEventListener("click", () => {
                const n = o.getAttribute("data-tab");
                t.querySelectorAll(".tab-btn").forEach(u => u.classList.remove("active")), t.querySelectorAll(".tab-panel").forEach(u => u.classList.remove("active")), o.classList.add("active");
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
                u = escapeHtml(n);
            return '<div class="info-row info-item"><span class="info-label text-slate-400 font-semibold whitespace-nowrap">' + r + ':</span><span class="info-value text-slate-200">' + u + "</span></div>"
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
        let u = e;
        if (typeof e == "string" && (u = document.querySelector(e)), !u) return;
        const a = u.querySelector(".resultado-container") || u;
        let l = null;
        if (n && a.querySelectorAll(".info-item").forEach(c => {
                const i = c.querySelector(".info-label"),
                    d = c.querySelector(".info-value");
                if (!i || !d) return;
                i.textContent.replace(":", "").trim().toLowerCase() === n && (l = d.textContent.trim())
            }), a.querySelectorAll(".info-item").forEach(c => {
                const i = c.querySelector(".info-label"),
                    d = c.querySelector(".info-value");
                if (!i || !d) return;
                const m = i.textContent.replace(":", "").trim().toLowerCase();
                if (o.has(m)) {
                    c.remove();
                    return
                }
                if (m === "cpf") {
                    const b = d.textContent.trim();
                    if (b) {
                        const p = b.replace(/\D/g, ""),
                            f = document.createElement("a");
                        f.href = "/pages/consultas/Cpf?q=" + encodeURIComponent(p), f.style.color = "#7c3aed", f.style.textDecoration = "underline", f.textContent = b, d.innerHTML = "", d.appendChild(f)
                    }
                }
            }), n && l) {
            const c = document.createElement("p");
            c.className = "text-sm text-green-400 mb-3";
            const i = escapeHtml(l),
                d = r ? escapeHtml(r) : "Resultado encontrado para o " + (n || "");
            c.innerHTML = d + ' "' + i + '"';
            const m = a.querySelector("h3");
            m && m.parentNode && m.parentNode.insertBefore(c, m.nextSibling)
        }
    }

    function renderTable(e, t) {
        if (!t || t.length === 0) return renderEmptyState("Nenhum registro encontrado.");
        const o = typeof e[0] == "string",
            n = e.map(u => "<th>" + escapeHtml(o ? u : u.label) + "</th>").join(""),
            r = t.map(u => "<tr>" + e.map((l, c) => {
                const i = o ? Array.isArray(u) ? u[c] ?? "" : "" : u[l.key] ?? "";
                return i !== null && typeof i == "object" && "__html" in i ? "<td>" + i.__html + "</td>" : "<td>" + escapeHtml(String(i)) + "</td>"
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
            u = function() {
                r.length && r[r.length - 1] !== "" && r.push("")
            };

        function a(d) {
            if (d == null) return !0;
            var m = String(d).trim();
            return m === "" || /^(não encontrado|nao encontrado|n\/a|null|undefined|-)$/i.test(m)
        }

        function l(d) {
            return typeof d == "boolean" ? d ? "Sim" : "N\xE3o" : String(d).trim()
        }

        function c(d, m) {
            var b = "  ".repeat(m);
            Object.keys(d).forEach(function(p) {
                var f = d[p];
                if (!(t[String(p).toLowerCase()] || o.test(p) || f === null || f === void 0)) {
                    if (Array.isArray(f)) {
                        i(p, f, m);
                        return
                    }
                    if (typeof f == "object") {
                        var C = Object.keys(f).find(function(E) {
                                return n.indexOf(E.toUpperCase()) >= 0 && Array.isArray(f[E])
                            }),
                            N = Object.keys(f).filter(function(E) {
                                return E !== C && !t[E.toLowerCase()] && typeof f[E] != "object" && !a(f[E])
                            });
                        if (C && N.length === 0) {
                            i(p, f[C], m);
                            return
                        }
                        var O = Object.keys(f).some(function(E) {
                            return !t[E.toLowerCase()] && !o.test(E) && !a(f[E])
                        });
                        if (!O) return;
                        u(), r.push(b + _qbLabel(p).toUpperCase()), c(f, m + 1);
                        return
                    }
                    if (!a(f)) {
                        var x = l(f);
                        typeof f == "string" && x.length > 400 || r.push(b + _qbLabel(p) + ": " + x)
                    }
                }
            })
        }

        function i(d, m, b) {
            var p = "  ".repeat(b),
                f = (m || []).filter(function(C) {
                    return !(C == null || typeof C != "object" && a(C))
                });
            if (f.length) {
                if (f.every(function(C) {
                        return typeof C != "object"
                    })) {
                    r.push(p + _qbLabel(d) + ": " + f.map(l).join(", "));
                    return
                }
                u(), r.push(p + _qbLabel(d).toUpperCase() + " (" + f.length + ")"), f.forEach(function(C, N) {
                    u(), r.push(p + "  \u2022 Item " + (N + 1)), C && typeof C == "object" ? c(C, b + 2) : r.push(p + "    " + l(C))
                })
            }
        }
        try {
            Array.isArray(e) ? i("Resultados", e, 0) : c(e, 0)
        } catch {
            return ""
        }
        return r.join(`
`).replace(/\n{3,}/g, `

`).trim()
    }(function() {
        if (!(typeof window > "u" || !window.fetch || window.__qbFetchHooked)) {
            window.__qbFetchHooked = !0;
            var e = window.fetch.bind(window),
                t = /\/api\/(consultas|geradores)\/|\/geradores\/|\/api\/telegram\/data\//;
            window.fetch = function() {
                var o = arguments,
                    n = e.apply(null, o);
                try {
                    var r = typeof o[0] == "string" ? o[0] : o[0] && o[0].url || "";
                    t.test(r) && n.then(function(u) {
                        try {
                            u.clone().json().then(function(a) {
                                try {
                                    var l = a;
                                    /\/api\/telegram\/data\//.test(r) && (l = a && a.dados ? a.dados : null), a && (a.success === !1 || a.hasResult === !1) && (l = null), window.__qbResult = l && typeof l == "object" ? l : null
                                } catch {}
                            }).catch(function() {})
                        } catch {}
                    }).catch(function() {})
                } catch {}
                return n
            }
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

        function u(a) {
            if (!a || a.nodeType !== 1) return !1;
            const l = a.classList;
            if (/^H[1-6]$/.test(a.tagName) || l && l.contains("bloco-titulo")) {
                const c = (a.textContent || "").trim();
                return c && (r(), n.push(c.toUpperCase()), n.push("\u2500".repeat(Math.min(Math.max(c.length, 4), 32)))), !0
            }
            if (l && l.contains("timestamp")) {
                const c = (a.textContent || "").trim();
                return c && n.push("Data: " + c), !0
            }
            if (l && l.contains("info-item")) {
                const c = a.querySelector(".info-label"),
                    i = a.querySelector(".info-value");
                if (c && i) {
                    const d = (c.textContent || "").replace(/:\s*$/, "").trim(),
                        m = (i.textContent || "").trim();
                    m && !/^não encontrado$/i.test(m) && n.push(d + ": " + m)
                }
                return !0
            }
            if (l && l.contains("empty-state")) {
                const c = (a.textContent || "").trim();
                return c && n.push(c), !0
            }
            if (a.tagName === "TABLE" && l && l.contains("result-table")) {
                const c = Array.prototype.map.call(a.querySelectorAll("thead th"), d => (d.textContent || "").trim()),
                    i = Array.prototype.slice.call(a.querySelectorAll("tbody tr"));
                return i.forEach((d, m) => {
                    const b = Array.prototype.map.call(d.children, p => (p.textContent || "").trim());
                    r(), i.length > 1 && n.push("\u2022 Item " + (m + 1)), b.forEach((p, f) => {
                        if (!p) return;
                        const C = c[f] || "Coluna " + (f + 1);
                        n.push((i.length > 1 ? "   " : "") + C + ": " + p)
                    })
                }), !0
            }
            return !1
        }
        return (function a(l) {
            for (let c = 0; c < l.childNodes.length; c++) {
                const i = l.childNodes[c];
                u(i) || a(i)
            }
        })(o), n.join(`
`).replace(/\n{3,}/g, `

`).trim()
    }

}

/*
     FILE ARCHIVED ON 16:10:25 Jul 28, 2026 AND RETRIEVED FROM THE
     INTERNET ARCHIVE ON 03:53:59 Sep 04, 2026.
     JAVASCRIPT APPENDED BY WAYBACK MACHINE, COPYRIGHT INTERNET ARCHIVE.

     ALL OTHER CONTENT MAY ALSO BE PROTECTED BY COPYRIGHT (17 U.S.C.
     SECTION 108(a)(3)).
*/
/*
playback timings (ms):
  captures_list: 0.558
  exclusion.robots: 0.07
  exclusion.robots.policy: 0.056
  esindex: 0.009
  cdx.remote: 64.848
  LoadShardBlock: 559.943 (3)
  PetaboxLoader3.datanode: 151.142 (4)
  PetaboxLoader3.resolve: 1134.515 (2)
  load_resource: 1141.841
*/
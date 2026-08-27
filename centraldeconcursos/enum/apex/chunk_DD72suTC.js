<!DOCTYPE html><html  lang="pt-BR"><head><meta property="csp-nonce" nonce="mpfkZgBubpOwzA9r-iH9FQ"><script nonce="mpfkZgBubpOwzA9r-iH9FQ">document.addEventListener("error",function(e){var t=e.target;if(t instanceof HTMLImageElement&&(t.hasAttribute("data-nuxt-img")||t.hasAttribute("data-nuxt-pic")))t.setAttribute("data-error","1")},true)</script><style nonce="mpfkZgBubpOwzA9r-iH9FQ" data-critical-css>/* Fontes que definem a geometria do primeiro paint. As declarações ficam no
   CSS global crítico (e não no chunk editorial carregado na hidratação) para
   que cada face seja registrada uma única vez no documento. DM Sans v17 é
   variável: 400 e 600 apontam deliberadamente para o MESMO WOFF2, mas têm duas
   faces para restringir a família aos únicos pesos permitidos pelo doc §4.1.2. */
@font-face {
  font-family: "Poppins";
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url("/fonts/poppins-v24-latin-400.woff2") format("woff2");
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}

@font-face {
  font-family: "Poppins";
  font-style: normal;
  font-weight: 600;
  font-display: swap;
  src: url("/fonts/poppins-v24-latin-600.woff2") format("woff2");
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}

@font-face {
  font-family: "Poppins";
  font-style: normal;
  font-weight: 700;
  font-display: swap;
  src: url("/fonts/poppins-v24-latin-700.woff2") format("woff2");
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}

@font-face {
  font-family: "DM Sans";
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url("/fonts/dm-sans-v17-latin.woff2") format("woff2");
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}

@font-face {
  font-family: "DM Sans";
  font-style: normal;
  font-weight: 600;
  font-display: swap;
  src: url("/fonts/dm-sans-v17-latin.woff2") format("woff2");
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}

/* Base crítica: conteúdo visível desde a primeira pintura. */
html {
  /* Branco para casar com a `theme-color` das barras do Chrome (ordem do dono,
     15/08). É esta cor que a área de overscroll pinta: em #f8fafc a rubber band
     aparecia como um degrau cinza contra a barra branca. O token `--page-bg`
     segue #f8fafc para quem o consome de propósito (seções editoriais, grade). */
  background-color: #ffffff;
  overscroll-behavior: none;
  -webkit-text-size-adjust: 100%;
  text-size-adjust: 100%;
}

/* Base reset para evitar flash */
*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: "Poppins", "Poppins Arial fallback",
    "Poppins system fallback", ui-sans-serif, system-ui, -apple-system,
    BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial,
    "Noto Sans", sans-serif;
  background-color: #ffffff;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  overscroll-behavior: none;
}

/* Remove o delay de 300ms em elementos interativos no iOS */
a, button, [role="button"] {
  touch-action: manipulation;
}

/* Skeleton para componentes principais */
.app-skeleton {
  background-color: var(--page-bg, #f8fafc);
  min-height: 100vh;
}

/* Prevenir layout shift */
.sidebar-placeholder {
  width: 0;
  transition: width 0.22s ease-in-out;
}

@media (min-width: 1024px) {
  .sidebar-placeholder {
    width: 16rem; /* w-64 */
  }
}

.loading-shimmer {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.hero-title {
  font-size: clamp(24px, 4vw, 36px);
  font-weight: 600;
  color: #fff;
  letter-spacing: -0.5px;
  line-height: 1.15;
  margin: 0 0 8px;
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    scroll-behavior: auto !important;
    transition-duration: 0.01ms !important;
  }
}

/* A tinta-base da tela de autenticação. Era `#e0e0e0a1` cravado — clara, para
   um fundo que só existia escuro — e é ela que todo texto sem cor própria do
   login herda. Virou token na UI-11; o valor ESCURO é o mesmo de antes, byte
   por byte, e o claro é o par da família. */
.auth-pg {
  color: var(--auth-page-ink, #e0e0e0a1);
}

/* As tintas da autenticação, globais porque as PÁGINAS as usam — não só o
   layout. Elas substituem os `text-white/xx` do Tailwind, que prendiam as
   telas de cadastro, OTP e senha ao fundo escuro (UI-15 §1.3). */
.auth-ink-strong { color: var(--auth-text-strong); }
.auth-ink { color: var(--auth-text); }
.auth-ink-soft { color: var(--auth-text-soft); }
.auth-ink-muted { color: var(--auth-text-muted); }
.auth-ink-faint { color: var(--auth-text-faint); }
a.auth-ink-muted:hover,
button.auth-ink-muted:hover { color: var(--auth-text); }

/* ── CLS do banner de consentimento (AdOpt) ────────────────────────────────
   O CLS de 0,041 medido em TODAS as rotas era, inteiro, a animação de entrada
   do widget: `#cookie-banner` subia de `top: 704px` para `519px` em 10 frames,
   e cada frame conta como layout shift (medido em 08/08/2026 com storage
   limpo, 10 shifts entre +2125ms e +2275ms). A causa é animar `top`, uma
   propriedade de LAYOUT; `transform` não teria custado nada.

   Como o widget é de terceiro, não dá para reescrever a animação — dá para
   desligá-la. O banner aparece na mesma posição, com o mesmo conteúdo e o
   mesmo comportamento: só não desliza. NADA aqui toca a lógica de
   consentimento; é uma regra de apresentação.

   Seletor pelo `id`, que é estável. A classe (`.adopt-c-blcsFr`) é hash de
   build do fornecedor e mudaria sem aviso. */
#cookie-banner,
#cookie-banner * {
  animation: none !important;
  transition: none !important;
}

/* Fallbacks métricos para o intervalo de font-display: swap. Os valores são
   gerados pelo Fontaine (mesmo motor do @nuxt/fonts) a partir dos WOFF2 locais
   e de Arial/Liberation Sans (métricas equivalentes) ou DejaVu Sans. A família
   real continua vencendo assim que o arquivo versionado termina de carregar. */
@font-face {
  font-family: "Poppins Arial fallback";
  src: local("Arial");
  size-adjust: 112.1577%;
  ascent-override: 93.6182%;
  descent-override: 31.2061%;
  line-gap-override: 8.916%;
  font-style: normal;
  font-weight: 400;
}
@font-face {
  font-family: "Poppins Arial fallback";
  src: local("Arial");
  size-adjust: 112.1577%;
  ascent-override: 93.6182%;
  descent-override: 31.2061%;
  line-gap-override: 8.916%;
  font-style: normal;
  font-weight: 600;
}
@font-face {
  font-family: "Poppins Arial fallback";
  src: local("Arial");
  size-adjust: 112.1577%;
  ascent-override: 93.6182%;
  descent-override: 31.2061%;
  line-gap-override: 8.916%;
  font-style: normal;
  font-weight: 700;
}
@font-face {
  font-family: "Poppins system fallback";
  src: local("DejaVu Sans");
  size-adjust: 98.367%;
  ascent-override: 106.7432%;
  descent-override: 35.5811%;
  line-gap-override: 10.166%;
  font-style: normal;
  font-weight: 400;
}
@font-face {
  font-family: "Poppins system fallback";
  src: local("DejaVu Sans");
  size-adjust: 98.367%;
  ascent-override: 106.7432%;
  descent-override: 35.5811%;
  line-gap-override: 10.166%;
  font-style: normal;
  font-weight: 600;
}
@font-face {
  font-family: "Poppins system fallback";
  src: local("DejaVu Sans");
  size-adjust: 98.367%;
  ascent-override: 106.7432%;
  descent-override: 35.5811%;
  line-gap-override: 10.166%;
  font-style: normal;
  font-weight: 700;
}
@font-face {
  font-family: "DM Sans fallback";
  src: local("Arial"), local("Liberation Sans");
  size-adjust: 104.531%;
  ascent-override: 94.9001%;
  descent-override: 29.6563%;
  line-gap-override: 0%;
  font-style: normal;
  font-weight: 400;
}
@font-face {
  font-family: "DM Sans fallback";
  src: local("Arial"), local("Liberation Sans");
  size-adjust: 104.531%;
  ascent-override: 94.9001%;
  descent-override: 29.6563%;
  line-gap-override: 0%;
  font-style: normal;
  font-weight: 600;
}

/* O Nuxt inclui o CSS scoped de error.vue no entry de todas as páginas. Como
   esta folha é crítica apenas quando o renderer falha, mantê-la no bloco
   crítico inline elimina uma viagem de rede global. O prefixo impede que os
   nomes genéricos dos botões vazem para a aplicação normal. */
.error-page {
  min-height: 100vh;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.error-page .error-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  padding: 48px 40px;
  max-width: 440px;
  width: 100%;
  text-align: center;
  box-shadow: 0 4px 24px rgba(15, 23, 42, 0.06);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.error-page .error-icon {
  width: 72px;
  height: 72px;
  border-radius: 20px;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  margin-bottom: 4px;
}

.error-page .error-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.error-page .error-desc {
  font-size: 0.875rem;
  color: #64748b;
  margin: 0;
  max-width: 320px;
  line-height: 1.6;
}

.error-page .error-code {
  font-size: 0.75rem;
  color: #94a3b8;
  font-family: monospace;
  margin: 0;
}

.error-page .error-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  margin-top: 8px;
}

.error-page .btn-primary {
  background: var(--brand-primary, #1d4ed8);
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 12px 24px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.15s;
}

.error-page .btn-primary:hover { opacity: 0.9; }

.error-page .btn-ghost {
  background: transparent;
  color: #64748b;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 12px 24px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s;
}

.error-page .btn-ghost:hover { background: #f8fafc; }

.error-page .error-links {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #e2e8f0;
  width: 100%;
}

.error-page .error-links-title {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #94a3b8;
  margin: 0 0 10px;
  font-weight: 600;
}

.error-page .error-links ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 6px 14px;
  justify-content: center;
}

.error-page .error-links a {
  font-size: 0.8125rem;
  color: var(--brand-primary, #1d4ed8);
  text-decoration: none;
  font-weight: 500;
}

.error-page .error-links a:hover { text-decoration: underline; }
</style><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Página não encontrada</title><script nonce="mpfkZgBubpOwzA9r-iH9FQ" type="importmap">{"imports":{"#entry":"/_nuxt/Bbq-nfWy.js"}}</script><style nonce="mpfkZgBubpOwzA9r-iH9FQ" id="nuxt-ui-colors">@layer theme {
  :root, :host {
  --ui-color-primary-50: var(--color-green-50, oklch(98.2% 0.018 155.826));
  --ui-color-primary-100: var(--color-green-100, oklch(96.2% 0.044 156.743));
  --ui-color-primary-200: var(--color-green-200, oklch(92.5% 0.084 155.995));
  --ui-color-primary-300: var(--color-green-300, oklch(87.1% 0.15 154.449));
  --ui-color-primary-400: var(--color-green-400, oklch(79.2% 0.209 151.711));
  --ui-color-primary-500: var(--color-green-500, oklch(72.3% 0.219 149.579));
  --ui-color-primary-600: var(--color-green-600, oklch(62.7% 0.194 149.214));
  --ui-color-primary-700: var(--color-green-700, oklch(52.7% 0.154 150.069));
  --ui-color-primary-800: var(--color-green-800, oklch(44.8% 0.119 151.328));
  --ui-color-primary-900: var(--color-green-900, oklch(39.3% 0.095 152.535));
  --ui-color-primary-950: var(--color-green-950, oklch(26.6% 0.065 152.934));
  --ui-color-secondary-50: var(--color-blue-50, oklch(97% 0.014 254.604));
  --ui-color-secondary-100: var(--color-blue-100, oklch(93.2% 0.032 255.585));
  --ui-color-secondary-200: var(--color-blue-200, oklch(88.2% 0.059 254.128));
  --ui-color-secondary-300: var(--color-blue-300, oklch(80.9% 0.105 251.813));
  --ui-color-secondary-400: var(--color-blue-400, oklch(70.7% 0.165 254.624));
  --ui-color-secondary-500: var(--color-blue-500, oklch(62.3% 0.214 259.815));
  --ui-color-secondary-600: var(--color-blue-600, oklch(54.6% 0.245 262.881));
  --ui-color-secondary-700: var(--color-blue-700, oklch(48.8% 0.243 264.376));
  --ui-color-secondary-800: var(--color-blue-800, oklch(42.4% 0.199 265.638));
  --ui-color-secondary-900: var(--color-blue-900, oklch(37.9% 0.146 265.522));
  --ui-color-secondary-950: var(--color-blue-950, oklch(28.2% 0.091 267.935));
  --ui-color-success-50: var(--color-green-50, oklch(98.2% 0.018 155.826));
  --ui-color-success-100: var(--color-green-100, oklch(96.2% 0.044 156.743));
  --ui-color-success-200: var(--color-green-200, oklch(92.5% 0.084 155.995));
  --ui-color-success-300: var(--color-green-300, oklch(87.1% 0.15 154.449));
  --ui-color-success-400: var(--color-green-400, oklch(79.2% 0.209 151.711));
  --ui-color-success-500: var(--color-green-500, oklch(72.3% 0.219 149.579));
  --ui-color-success-600: var(--color-green-600, oklch(62.7% 0.194 149.214));
  --ui-color-success-700: var(--color-green-700, oklch(52.7% 0.154 150.069));
  --ui-color-success-800: var(--color-green-800, oklch(44.8% 0.119 151.328));
  --ui-color-success-900: var(--color-green-900, oklch(39.3% 0.095 152.535));
  --ui-color-success-950: var(--color-green-950, oklch(26.6% 0.065 152.934));
  --ui-color-info-50: var(--color-blue-50, oklch(97% 0.014 254.604));
  --ui-color-info-100: var(--color-blue-100, oklch(93.2% 0.032 255.585));
  --ui-color-info-200: var(--color-blue-200, oklch(88.2% 0.059 254.128));
  --ui-color-info-300: var(--color-blue-300, oklch(80.9% 0.105 251.813));
  --ui-color-info-400: var(--color-blue-400, oklch(70.7% 0.165 254.624));
  --ui-color-info-500: var(--color-blue-500, oklch(62.3% 0.214 259.815));
  --ui-color-info-600: var(--color-blue-600, oklch(54.6% 0.245 262.881));
  --ui-color-info-700: var(--color-blue-700, oklch(48.8% 0.243 264.376));
  --ui-color-info-800: var(--color-blue-800, oklch(42.4% 0.199 265.638));
  --ui-color-info-900: var(--color-blue-900, oklch(37.9% 0.146 265.522));
  --ui-color-info-950: var(--color-blue-950, oklch(28.2% 0.091 267.935));
  --ui-color-warning-50: var(--color-yellow-50, oklch(98.7% 0.026 102.212));
  --ui-color-warning-100: var(--color-yellow-100, oklch(97.3% 0.071 103.193));
  --ui-color-warning-200: var(--color-yellow-200, oklch(94.5% 0.129 101.54));
  --ui-color-warning-300: var(--color-yellow-300, oklch(90.5% 0.182 98.111));
  --ui-color-warning-400: var(--color-yellow-400, oklch(85.2% 0.199 91.936));
  --ui-color-warning-500: var(--color-yellow-500, oklch(79.5% 0.184 86.047));
  --ui-color-warning-600: var(--color-yellow-600, oklch(68.1% 0.162 75.834));
  --ui-color-warning-700: var(--color-yellow-700, oklch(55.4% 0.135 66.442));
  --ui-color-warning-800: var(--color-yellow-800, oklch(47.6% 0.114 61.907));
  --ui-color-warning-900: var(--color-yellow-900, oklch(42.1% 0.095 57.708));
  --ui-color-warning-950: var(--color-yellow-950, oklch(28.6% 0.066 53.813));
  --ui-color-error-50: var(--color-red-50, oklch(97.1% 0.013 17.38));
  --ui-color-error-100: var(--color-red-100, oklch(93.6% 0.032 17.717));
  --ui-color-error-200: var(--color-red-200, oklch(88.5% 0.062 18.334));
  --ui-color-error-300: var(--color-red-300, oklch(80.8% 0.114 19.571));
  --ui-color-error-400: var(--color-red-400, oklch(70.4% 0.191 22.216));
  --ui-color-error-500: var(--color-red-500, oklch(63.7% 0.237 25.331));
  --ui-color-error-600: var(--color-red-600, oklch(57.7% 0.245 27.325));
  --ui-color-error-700: var(--color-red-700, oklch(50.5% 0.213 27.518));
  --ui-color-error-800: var(--color-red-800, oklch(44.4% 0.177 26.899));
  --ui-color-error-900: var(--color-red-900, oklch(39.6% 0.141 25.723));
  --ui-color-error-950: var(--color-red-950, oklch(25.8% 0.092 26.042));
  --ui-color-neutral-50: var(--color-slate-50, oklch(98.4% 0.003 247.858));
  --ui-color-neutral-100: var(--color-slate-100, oklch(96.8% 0.007 247.896));
  --ui-color-neutral-200: var(--color-slate-200, oklch(92.9% 0.013 255.508));
  --ui-color-neutral-300: var(--color-slate-300, oklch(86.9% 0.022 252.894));
  --ui-color-neutral-400: var(--color-slate-400, oklch(70.4% 0.04 256.788));
  --ui-color-neutral-500: var(--color-slate-500, oklch(55.4% 0.046 257.417));
  --ui-color-neutral-600: var(--color-slate-600, oklch(44.6% 0.043 257.281));
  --ui-color-neutral-700: var(--color-slate-700, oklch(37.2% 0.044 257.287));
  --ui-color-neutral-800: var(--color-slate-800, oklch(27.9% 0.041 260.031));
  --ui-color-neutral-900: var(--color-slate-900, oklch(20.8% 0.042 265.755));
  --ui-color-neutral-950: var(--color-slate-950, oklch(12.9% 0.042 264.695));
  }
  :root, :host, .light {
  --ui-primary: var(--ui-color-primary-500);
  --ui-secondary: var(--ui-color-secondary-500);
  --ui-success: var(--ui-color-success-500);
  --ui-info: var(--ui-color-info-500);
  --ui-warning: var(--ui-color-warning-500);
  --ui-error: var(--ui-color-error-500);
  }
  .dark {
  --ui-primary: var(--ui-color-primary-400);
  --ui-secondary: var(--ui-color-secondary-400);
  --ui-success: var(--ui-color-success-400);
  --ui-info: var(--ui-color-info-400);
  --ui-warning: var(--ui-color-warning-400);
  --ui-error: var(--ui-color-error-400);
  }
}</style><style nonce="mpfkZgBubpOwzA9r-iH9FQ">.consent[data-v-fdf796a5],.veu[data-v-fdf796a5]{--consent-primario:#009c73;--consent-no-botao:#fff;--consent-carta:#fff;--consent-texto:#12261f;--consent-apagado:#5b7168;--consent-borda:#08281e1f;--consent-desligado:#c9d6d0}:root[data-brand=central] .consent[data-v-fdf796a5],:root[data-brand=central] .veu[data-v-fdf796a5]{--consent-primario:#021ab0;--consent-texto:#101635;--consent-apagado:#5a6386;--consent-borda:#020a3a1f;--consent-desligado:#ccd2e4}.consent[data-v-fdf796a5]{left:12px;right:12px;bottom:calc(12px + env(safe-area-inset-bottom,0px));z-index:9000;-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);max-width:660px;color:var(--consent-texto);border:1px solid var(--consent-borda);font-family:var(--font-heading,"Poppins",ui-sans-serif,system-ui,sans-serif);background:#fffffff0;border-radius:14px;align-items:center;gap:12px;margin:0 auto;padding:11px 12px 11px 16px;display:flex;position:fixed;box-shadow:0 8px 26px #0000001f}.consent--acima-da-nav[data-v-fdf796a5]{bottom:calc(3.75rem + 12px + env(safe-area-inset-bottom,0px))}@media (width>=1024px){.consent--acima-da-nav[data-v-fdf796a5]{bottom:calc(12px + env(safe-area-inset-bottom,0px))}}.consent p[data-v-fdf796a5]{flex:1;margin:0;font-size:11.5px;font-weight:400;line-height:1.5}.consent .gerenciar[data-v-fdf796a5],.consent p[data-v-fdf796a5] a{color:var(--consent-texto);text-underline-offset:2px;font-weight:500;text-decoration:underline}.consent .gerenciar[data-v-fdf796a5]{font:inherit;cursor:pointer;background:0 0;border:none;padding:0;font-weight:500}.consent .ir[data-v-fdf796a5]{background:var(--consent-primario);color:var(--consent-no-botao);cursor:pointer;border:none;border-radius:10px;flex:none;justify-content:center;align-items:center;padding:10px 15px;font-family:inherit;font-size:15px;font-weight:700;line-height:1;display:inline-flex}.consent[data-v-fdf796a5] a:focus-visible,.consent button[data-v-fdf796a5]:focus-visible{outline:2px solid var(--consent-primario);outline-offset:2px}.veu[data-v-fdf796a5]{z-index:9001;font-family:var(--font-heading,"Poppins",ui-sans-serif,system-ui,sans-serif);background:#040e0a80;justify-content:center;align-items:center;padding:20px;display:flex;position:fixed;inset:0}.modal[data-v-fdf796a5]{background:var(--consent-carta);color:var(--consent-texto);overscroll-behavior:contain;border-radius:16px;width:100%;max-width:480px;max-height:calc(100dvh - 40px);padding:22px 22px 18px;overflow-y:auto}.modal[data-v-fdf796a5]:focus{outline:none}.alca[data-v-fdf796a5]{display:none}.modal h3[data-v-fdf796a5]{margin:0;font-size:15.5px;font-weight:700}.modal .desc[data-v-fdf796a5]{color:var(--consent-apagado);margin:4px 0 0;font-size:11.8px}.linha[data-v-fdf796a5]{border-bottom:1px solid var(--consent-borda);justify-content:space-between;align-items:center;gap:14px;padding:13px 0;display:flex}.linha[data-v-fdf796a5]:last-of-type{border-bottom:none}.linha b[data-v-fdf796a5]{font-size:13px}.linha small[data-v-fdf796a5]{color:var(--consent-apagado);margin-top:2px;font-size:11px;font-weight:400;display:block}.chave[data-v-fdf796a5]{flex:none;width:46px;height:26px;position:relative}.chave input[data-v-fdf796a5]{opacity:0;cursor:pointer;margin:0}.chave i[data-v-fdf796a5],.chave input[data-v-fdf796a5]{position:absolute;inset:0}.chave i[data-v-fdf796a5]{background:var(--consent-desligado);pointer-events:none;border-radius:999px;transition:background .15s}.chave i[data-v-fdf796a5]:after{content:"";background:#fff;border-radius:50%;width:20px;height:20px;transition:left .15s;position:absolute;top:3px;left:3px}.chave input:checked+i[data-v-fdf796a5]{background:var(--consent-primario)}.chave input:checked+i[data-v-fdf796a5]:after{left:23px}.chave input:disabled+i[data-v-fdf796a5]{background:var(--consent-apagado);opacity:.5;cursor:default}.chave input:focus-visible+i[data-v-fdf796a5]{outline:2px solid var(--consent-primario);outline-offset:2px}.modal .acoes[data-v-fdf796a5]{justify-content:flex-end;gap:10px;margin-top:16px;display:flex}.modal .salvar[data-v-fdf796a5],.modal .todos[data-v-fdf796a5]{cursor:pointer;border-radius:10px;min-height:44px;font-family:inherit;font-size:12.5px}.modal .salvar[data-v-fdf796a5]{color:var(--consent-texto);border:1px solid var(--consent-borda);background:0 0;padding:12px 16px;font-weight:600}.modal .todos[data-v-fdf796a5]{background:var(--consent-primario);color:var(--consent-no-botao);border:none;padding:12px 18px;font-weight:700}.modal button[data-v-fdf796a5]:focus-visible{outline:2px solid var(--consent-primario);outline-offset:2px}@media (width<=640px){.veu[data-v-fdf796a5]{align-items:flex-end;padding:0}.modal[data-v-fdf796a5]{max-width:none;padding:10px 20px calc(16px + env(safe-area-inset-bottom,0px));border-radius:18px 18px 0 0;max-height:calc(100dvh - 24px)}.alca[data-v-fdf796a5]{background:var(--consent-borda);border-radius:99px;width:38px;height:4px;margin:2px auto 12px;display:block}.modal .acoes[data-v-fdf796a5]{flex-direction:column-reverse}.modal .acoes button[data-v-fdf796a5]{width:100%}}.consent-subir-enter-active[data-v-fdf796a5]{animation:.35s ease-out consent-subir-fdf796a5}.consent-subir-leave-active[data-v-fdf796a5]{transition:opacity .2s ease-out}.consent-subir-leave-to[data-v-fdf796a5]{opacity:0}@keyframes consent-subir-fdf796a5{0%{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}.consent-veu-enter-active .modal[data-v-fdf796a5]{animation:.28s ease-out consent-sheet-fdf796a5}@keyframes consent-sheet-fdf796a5{0%{opacity:.6;transform:translateY(24px)}to{opacity:1;transform:none}}@media (prefers-reduced-motion:reduce){.chave i[data-v-fdf796a5],.chave i[data-v-fdf796a5]:after,.consent-subir-enter-active[data-v-fdf796a5],.consent-subir-leave-active[data-v-fdf796a5],.consent-veu-enter-active .modal[data-v-fdf796a5]{transition:none!important;animation:none!important}}</style><style nonce="mpfkZgBubpOwzA9r-iH9FQ">@layer base {:where(.i-hugeicons\:location-offline-01){display:inline-block;width:1em;height:1em;background-color:currentColor;-webkit-mask-image:var(--svg);mask-image:var(--svg);-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;-webkit-mask-size:100% 100%;mask-size:100% 100%;--svg:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='24' height='24'%3E%3Cg fill='none' stroke='black' stroke-linecap='round' stroke-width='1.5'%3E%3Cpath d='M17.5 17.646c-1.232 1.317-2.624 2.542-3.882 3.721A2.37 2.37 0 0 1 12 22a2.37 2.37 0 0 1-1.617-.633C6.412 17.626 1.09 13.447 3.685 7.38C4.021 6.598 4.466 5.635 5 5m2-1.514A9.23 9.23 0 0 1 12.001 2c3.543 0 6.912 2.1 8.315 5.38c1.344 3.142.564 5.784-1.055 8.12'/%3E%3Cpath d='M9 9c-.335.537-.5 1.32-.5 2a3.5 3.5 0 0 0 3.5 3.5c.66 0 1.473-.183 2-.5m-2.5-6.465a3.5 3.5 0 0 1 3.965 3.965'/%3E%3Cpath stroke-linejoin='round' d='m2 2l20 20'/%3E%3C/g%3E%3C/svg%3E")}}</style><link nonce="mpfkZgBubpOwzA9r-iH9FQ" rel="preload" as="font" type="font/woff2" href="/fonts/poppins-v24-latin-400.woff2" crossorigin fetchpriority="low"><link nonce="mpfkZgBubpOwzA9r-iH9FQ" rel="modulepreload" as="script" crossorigin href="/_nuxt/Bbq-nfWy.js"><script nonce="mpfkZgBubpOwzA9r-iH9FQ" type="module" src="/_nuxt/Bbq-nfWy.js" crossorigin></script><meta name="color-scheme" content="light"><meta name="theme-color" content="#ffffff"><meta name="theme-color" media="(prefers-color-scheme: dark)" content="#0c1210"><link nonce="mpfkZgBubpOwzA9r-iH9FQ" rel="manifest" href="/manifest.webmanifest"><meta name="robots" content="noindex, follow"></head><body><div id="__nuxt" class="isolate"><div class="error-page"><div class="error-card"><div class="error-icon"><span class="iconify i-hugeicons:location-offline-01 w-10 h-10" aria-hidden="true" style=""></span></div><h1 class="error-title">Página não encontrada</h1><p class="error-desc">A página que você procura não existe ou foi movida.</p><!----><div class="error-actions"><button class="btn-primary">Voltar ao início</button><button class="btn-ghost">Ir para o início</button></div><nav class="error-links" aria-label="Links úteis"><p class="error-links-title">Talvez você procure:</p><ul><li><a href="/concursos">Concursos Públicos</a></li><li><a href="/cursos/online">Cursos Online</a></li><li><a href="/cursos/ao-vivo">Cursos Ao Vivo</a></li><li><a href="/apostilas">Apostilas</a></li><li><a href="/aprovados">Aprovados</a></li><li><a href="/faq">Perguntas Frequentes</a></li><li><a href="/contato">Fale Conosco</a></li></ul></nav></div></div></div><div id="teleports"></div><script nonce="mpfkZgBubpOwzA9r-iH9FQ">window.__NUXT__={};window.__NUXT__.config={public:{apiUrl:"https://seducar-api-website.onrender.com",appDomain:"homolog.degraucultural.com.br",mainApiUrl:"https://api.maisquestoes.com.br",siteUrl:"",assistantEnabled:false,assistantMock:false,lessonQuestionsMock:false,classroomDemoMock:false,studyEventsEnabled:true,salaVirtualLegacy:false,lpOnlineCheckout:true,pageAdminConfig:false,lessonEndscreenEnabled:true,passaporteAdminConfig:true,questoesAdminConfig:true,tracking:{consentMode:"consent-mode",stapeLoaderUrlDegrau:"https://load.gtm.degraucultural.com.br/nihfkqwv.js?st=NDP2N7",stapeLoaderUrlCentral:"https://load.gtm.centraldeconcursos.com.br/qdetrrlr.js?st=WLXPDZ"}},app:{baseURL:"/",buildId:"7ac2c88a-c7a4-481e-a17f-cf821ea47d37",buildAssetsDir:"/_nuxt/",cdnURL:""}}</script><script nonce="mpfkZgBubpOwzA9r-iH9FQ" type="application/json" data-nuxt-data="nuxt-app" data-ssr="true" id="__NUXT_DATA__">[["ShallowReactive",1],{"error":2,"data":8,"state":10,"once":14,"_errors":15,"serverRendered":17,"path":4,"pinia":18},["null","error",3,"url",4,"statusCode",5,"statusMessage",6,"message",6,"data",7,"statusText",6,"status",5],"true","\u002F_nuxt\u002FDD72suTC.js",404,"Page not found: \u002F_nuxt\u002FDD72suTC.js",{"path":4},["ShallowReactive",9],{},["Reactive",11],{"$sabVariant":12,"$sbrand":13},null,"central",["Set"],["ShallowReactive",16],{},true,["Reactive",19],{"school":20},{"school":21,"isLoading":31,"lastFetch":132,"error":12},{"id":22,"uuid":23,"company_name":24,"trading_name":25,"domain":26,"background":27,"cnpj":28,"founding_date":12,"founder":12,"number_of_employees":12,"awards":12,"specialties":12,"address":12,"aggregate_rating":12,"class_theme":29,"gtm":30,"display_whatsapp":17,"black_friday":31,"facebook_pixel_id":32,"logos":33,"seo":38,"contacts":42,"social_medias":50,"areas":55,"units":106,"scripts":116},2,"03a41685-b56d-4fdf-81ea-817a4d0a3ccd","Central de Concursos","Editora Central de Concursos","centraldeconcursos.com.br","#031af5","61.632.659\u002F0001-55","theme-central","GTM-WLXPDZ",false,"0",{"desktop":34,"mobile":35,"favicon":36,"sala_virtual":37},"https:\u002F\u002Ffiles-producao.s3.us-east-2.amazonaws.com\u002Fcentral-de-concursos\u002Flogos\u002F26153ef37-4671-4ef7-8fd3-75e56938ad4b.webp","https:\u002F\u002Ffiles-producao.s3.us-east-2.amazonaws.com\u002Fcentral-de-concursos\u002Flogos\u002F2eb5ef950-3947-4f91-8d27-5937d2471a0e.png","https:\u002F\u002Ffiles-producao.s3.us-east-2.amazonaws.com\u002Fcentral-de-concursos\u002Flogos\u002F245029bda-4d4f-46a6-b2a2-c7e22cfcf863.png","https:\u002F\u002Ffiles-producao.s3.us-east-2.amazonaws.com\u002Fcentral-de-concursos\u002Flogos\u002F2c87a555a-b7b9-47cf-a1b2-5d75038d099c.webp",{"title":39,"description":40,"image":41},"Central de Concursos - Preparatório para concursos públicos","Central de Concursos, o preparatório de Concursos Públicos com o maior índice de Aprovação do Brasil. Acesse e confira nossos cursos.","https:\u002F\u002Ffiles-producao.s3.us-east-2.amazonaws.com\u002Fcentral-de-concursos\u002Flogos\u002F2e494f583-e20c-4c8d-8996-e1af9a8f66d9.webp",{"contact_email":43,"phone_1":44,"email_1":45,"attendance_1":46,"phone_2":47,"email_2":48,"attendance_2":49,"phone_3":47,"email_3":45,"attendance_3":49,"whatsapp":44,"whatsapp_button":44},"atendimento@centraldeconcursos.com.br","(11) 3017-8800","consultoriarepublica@centraldeconcursos.com.br","De 2ª a 6ª, das 8h às 20h e Sáb das 08h às 14h","","suporteead@centraldeconcursos.com.br ","De 2ª a 6ª, das 9h às 20h",{"facebook":51,"instagram":52,"youtube":52,"twitter":53,"linkedin":54,"tiktok":52,"telegram":47},"CConcursos","centraldeconcursos","passanacentral","company\u002Fcentral-de-concursos",[56,61,66,71,76,81,86,91,96,101],{"id":57,"uuid":58,"name":59,"slug":60},9,"2a959e42-1f22-4f1f-8a96-45aa42c7c061","Administrativa","administrativa",{"id":62,"uuid":63,"name":64,"slug":65},12,"6e2639d8-0a27-4860-a02d-6b20b1a292bc","Bancária","bancaria",{"id":67,"uuid":68,"name":69,"slug":70},32,"ba61dd03-fc01-4c7b-aee6-4b8a0bda52e8","CNU","cnu",{"id":72,"uuid":73,"name":74,"slug":75},10,"4df6e18c-eb46-487d-917e-165119a92051","Educação","educacao",{"id":77,"uuid":78,"name":79,"slug":80},11,"0a09f3c0-cd4a-4d65-aeef-379806ec2f63","Fiscal","fiscal",{"id":82,"uuid":83,"name":84,"slug":85},6,"f186be8f-93d1-41b3-b71d-51cb06af8f65","Jurídica","juridica",{"id":87,"uuid":88,"name":89,"slug":90},23,"fe79cb23-ff7d-4403-82ff-2399286aaa32","Prefeituras","prefeituras",{"id":92,"uuid":93,"name":94,"slug":95},7,"d7c9dc3d-8d20-48a6-a144-064b419b0fbf","Segurança","seguranca",{"id":97,"uuid":98,"name":99,"slug":100},37,"961b12bf-2975-4325-966d-3a1937a651de","Tecnologia","tecnologia",{"id":102,"uuid":103,"name":104,"slug":105},24,"a6f09e10-7723-47a5-9130-ef5990b5b592","Tribunais","tribunais",[107],{"title":108,"email":109,"phone_1":44,"address":110,"city":111,"uf":112,"cep":113,"slug":114,"image":115},"Metrô República","faleconosco@centraldeconcursos.com.br","Rua Barão de Itapetininga","São Paulo","SP","01042-001","metro-republica","https:\u002F\u002Ffiles-producao.s3.us-east-2.amazonaws.com\u002Fcentral-de-concursos\u002Funidades\u002F2fb9e043e-b2de-4dcd-a9b8-89d57394cff5.webp",[117,123,127],{"tag":118,"content":12,"cmp":31,"props":119},"meta",[120],{"name":121,"content":122},"ahrefs-site-verification","b97aff80a6c4627ad044b23a121a51a8515cbdf7d9e5c43e4857007d506d0e1b",{"tag":124,"content":125,"cmp":31,"props":126},"script","(function() {    var whatsappLink = document.createElement('a');     var number = 'NUMERO_CLIENTE'     var text = 'Olá, quero saber mais sobre como me preparar para concursos públicos!'     whatsappLink.href = 'https:\u002F\u002Fwa.me\u002F'+number+'?text='+text;     whatsappLink.target = '_blank';     whatsappLink.id = 'whatsapp-link';      var whatsappIcon = document.createElement('img');     whatsappIcon.src = 'https:\u002F\u002Fupload.wikimedia.org\u002Fwikipedia\u002Fcommons\u002F6\u002F6b\u002FWhatsApp.svg';     whatsappIcon.alt = 'WhatsApp';     whatsappIcon.style.width = '50%';     whatsappIcon.style.height = 'auto';      whatsappLink.appendChild(whatsappIcon);      \u002F\u002F Adiciona o link (com ícone) ao body do documento     document.body.appendChild(whatsappLink);      \u002F\u002F Adiciona CSS ao cabeçalho para estilizar o link     var css = '#whatsapp-link {position: fixed; right: 20px; bottom: 20px; display: flex; align-items: center; justify-content: center; width: 60px; height: 60px; background-color: #25D366; border-radius: 50%; box-shadow: 2px 2px 15px rgba(0, 0, 0, 0.2); transition: background-color 0.3s;} #whatsapp-link:hover {background-color: #1ebe5f;}',         head = document.head,         style = document.createElement('style');      head.appendChild(style); style.appendChild(document.createTextNode(css)); })();",[],{"tag":124,"content":12,"cmp":31,"props":128},[129],{"name":130,"value":131},"src","https:\u002F\u002Fd335luupugsy2.cloudfront.net\u002Fjs\u002Floader-scripts\u002F0fe5d924-391c-49ff-b617-1b790d0168db-loader.js",["Date","2026-08-27T15:55:47.868Z"]]</script></body></html>
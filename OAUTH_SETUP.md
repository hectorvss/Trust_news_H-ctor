# 🔐 Activar login con Google y Apple

**El código ya está listo.** `Auth.jsx` tiene los botones y `AuthContext.signInWithOAuth`
llama a `supabase.auth.signInWithOAuth({ provider, redirectTo: origin + '/auth' })`.
Solo falta **habilitar los proveedores** (dashboard de Supabase + consolas de Google/Apple).
Nada de esto se hace desde el repo.

> ⚠️ Requiere el proyecto Supabase **activo** (hoy está pausado/restringido — ver `SUPABASE_PENDING.md`).

## Datos de tu proyecto (los necesitarás)
- **Project ref:** `xwkqtugupzpdnnvxrkyu`
- **Callback de Supabase (Authorized redirect URI):**
  `https://xwkqtugupzpdnnvxrkyu.supabase.co/auth/v1/callback`
- **Site URL / Redirect URLs de la app** (Supabase → Authentication → URL Configuration):
  - `https://ground-news-espana.vercel.app` (producción)
  - `https://ground-news-espana.vercel.app/auth`
  - `http://localhost:5173` y `http://localhost:5173/auth` (desarrollo)

---

## 1) GOOGLE  (gratis, ~10 min)

### a. Google Cloud Console → crear credenciales OAuth
1. https://console.cloud.google.com/ → crea/elige un proyecto.
2. **APIs & Services → OAuth consent screen**: tipo *External*, rellena nombre de la app,
   email de soporte y dominio. Publica (o deja en *Testing* y añade tu email como tester).
3. **APIs & Services → Credentials → Create Credentials → OAuth client ID**:
   - Application type: **Web application**
   - **Authorized JavaScript origins:** `https://ground-news-espana.vercel.app` (y `http://localhost:5173`)
   - **Authorized redirect URIs:** `https://xwkqtugupzpdnnvxrkyu.supabase.co/auth/v1/callback`
4. Copia el **Client ID** y el **Client Secret**.

### b. Supabase → habilitar Google
- Dashboard → **Authentication → Providers → Google** → *Enable* → pega **Client ID** y **Client Secret** → *Save*.

Listo. El botón "GOOGLE" ya funcionará.

---

## 2) APPLE  (requiere Apple Developer de pago, 99 $/año, ~20 min)

> Si aún no tienes cuenta Apple Developer, deja Apple para después y lanza solo con Google.
> El botón Apple seguirá visible pero dará error hasta configurarlo (o puedes ocultarlo — ver más abajo).

### a. Apple Developer → Sign in with Apple
1. https://developer.apple.com/account → **Certificates, Identifiers & Profiles**.
2. **Identifiers → +** → **App IDs** (o usa uno existente) → activa la capability **Sign In with Apple**.
3. **Identifiers → +** → **Services IDs**: crea uno (ej. `app.tne.web`) → activa **Sign In with Apple** →
   *Configure*:
   - **Domains:** `xwkqtugupzpdnnvxrkyu.supabase.co`
   - **Return URLs:** `https://xwkqtugupzpdnnvxrkyu.supabase.co/auth/v1/callback`
4. **Keys → +**: crea una Key con **Sign in with Apple** activado → descarga el archivo `.p8`
   (solo se descarga una vez) y apunta el **Key ID**.
5. Apunta también tu **Team ID** (arriba a la derecha en la cuenta).

### b. Generar el "client secret" de Apple
Supabase pide un **Secret Key (for OAuth)** que es un JWT firmado con el `.p8`.
Supabase tiene un generador en la propia pantalla del proveedor Apple, o puedes usar su guía:
https://supabase.com/docs/guides/auth/social-login/auth-apple
Necesitas: **Services ID** (client_id), **Team ID**, **Key ID** y el contenido del **`.p8`**.

### c. Supabase → habilitar Apple
- Dashboard → **Authentication → Providers → Apple** → *Enable* → pega el **Services ID** (client_id)
  y el **Secret Key** generado → *Save*.

---

## 3) Verificar
1. Reactiva el proyecto y despliega (ya está en producción).
2. Ve a `https://ground-news-espana.vercel.app/auth` → pulsa **GOOGLE** / **APPLE**.
3. Debe redirigir al proveedor y volver logueado a `/`.
4. Comprueba en Supabase → **Authentication → Users** que aparece el usuario nuevo.

---

## (Opcional) Ocultar el botón Apple hasta configurarlo
En `src/components/Auth.jsx`, dentro del grid de OAuth, comenta el `<OAuthButton provider="apple" .../>`
y deja solo Google. Cuando configures Apple, lo vuelves a mostrar.

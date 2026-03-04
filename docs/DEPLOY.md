# Campaign Builder — Guia de Deploy a Produccion

Checklist paso a paso de todo lo que necesitas hacer **tu** para llevar el proyecto a produccion. El codigo ya esta listo; este documento cubre la configuracion de servicios externos, base de datos, y despliegue.

---

## Paso 1: Crear proyecto en Supabase

**Tiempo estimado: 10 min**

1. Ve a [supabase.com/dashboard](https://supabase.com/dashboard) e inicia sesion.
2. Click **New Project**.
   - **Name**: `campaign-builder` (o el nombre que prefieras)
   - **Region**: selecciona la mas cercana a tu equipo (ej. `us-east-1` o `sa-east-1` para LATAM)
   - **Database password**: genera una segura y guardala
3. Espera ~2 minutos a que el proyecto se aprovisione.
4. Ve a **Project Settings > API** y copia estos 3 valores:

| Dato | Donde se usa | Variable |
|------|-------------|----------|
| **Project URL** | Frontend + API Server | `VITE_SUPABASE_URL` / `SUPABASE_URL` |
| **anon public key** | Solo Frontend | `VITE_SUPABASE_ANON_KEY` |
| **service_role secret key** | Solo API Server (NUNCA en frontend) | `SUPABASE_SERVICE_ROLE_KEY` |

---

## Paso 2: Configurar Google OAuth en Supabase

**Tiempo estimado: 15 min**

La app usa **Google OAuth** como metodo de login. Necesitas crear credenciales en Google Cloud y configurarlas en Supabase.

### 2a. Crear credenciales OAuth en Google Cloud

1. Ve a [console.cloud.google.com/apis/credentials](https://console.cloud.google.com/apis/credentials).
2. Selecciona o crea un proyecto.
3. Click **Create Credentials > OAuth client ID**.
4. Si no tienes configurada la **Consent Screen**:
   - Click **Configure Consent Screen**.
   - User Type: **Internal** (si tienes Google Workspace) o **External**.
   - App name: `Campaign Builder`.
   - User support email: tu email.
   - Authorized domains: agrega `supabase.co`.
   - Scopes: agrega `email`, `profile`, `openid`.
   - Guarda.
5. Vuelve a **Create Credentials > OAuth client ID**:
   - Application type: **Web application**.
   - Name: `Campaign Builder`.
   - Authorized redirect URIs: agrega exactamente:
     ```
     https://TU_PROYECTO.supabase.co/auth/v1/callback
     ```
     (reemplaza `TU_PROYECTO` con tu Supabase project ref, lo encuentras en la URL de tu dashboard).
   - Click **Create**.
6. Copia el **Client ID** y el **Client Secret**.

### 2b. Configurar el provider en Supabase

1. En Supabase, ve a **Authentication > Providers > Google**.
2. Activa el toggle **Enable Google provider**.
3. Pega:
   - **Client ID**: el que copiaste de Google Cloud.
   - **Client Secret**: el que copiaste de Google Cloud.
4. Click **Save**.

### 2c. Configurar Redirect URLs

1. Ve a **Authentication > URL Configuration**.
2. **Site URL**: pon la URL de tu frontend:
   - Local: `http://localhost:5173`
   - Produccion: `https://tu-frontend.up.railway.app`
3. **Redirect URLs**: agrega ambas:
   - `http://localhost:5173` (para dev local)
   - `https://tu-frontend.up.railway.app` (para produccion)

### 2d. Restringir dominio de email (recomendado)

Para que solo emails `@partrunner.com` puedan acceder, ejecuta esto en el **SQL Editor** de Supabase DESPUES de la migracion principal:

```sql
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  -- Descomentar la siguiente linea para restringir por dominio:
  -- if new.email not like '%@partrunner.com' then
  --   raise exception 'Solo emails @partrunner.com pueden registrarse';
  -- end if;

  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      split_part(new.email, '@', 1)
    ),
    coalesce(
      new.raw_user_meta_data ->> 'avatar_url',
      new.raw_user_meta_data ->> 'picture'
    )
  );
  return new;
end;
$$;
```

### 2e. Asignar el primer admin

Despues de que el primer usuario se registre via Google, promovelo a admin ejecutando en el SQL Editor:

```sql
update public.profiles
set role = 'admin'
where email = 'tu@partrunner.com';
```

Los admins pueden ver todas las campanas de todos los usuarios y gestionar roles via la API (`/api/admin/*`).

---

## Paso 3: Ejecutar la migracion SQL

**Tiempo estimado: 2 min**

1. En el dashboard de Supabase, ve a **SQL Editor**.
2. Click **New Query**.
3. Copia y pega TODO el contenido de `supabase/migrations/001_initial_schema.sql`.
4. Click **Run** (o Cmd+Enter).
5. Verifica que no haya errores en el output.
6. Ve a **Table Editor** y confirma que existen estas 4 tablas:
   - `profiles`
   - `campaigns`
   - `campaign_launches`
   - `creatives`
7. Ve a **Authentication > Policies** y confirma que cada tabla tiene sus RLS policies activas.

---

## Paso 4: Crear bucket de Storage

**Tiempo estimado: 2 min**

1. Ve a **Storage** en el dashboard de Supabase.
2. Click **New Bucket**.
   - **Name**: `creatives`
   - **Public bucket**: **SI** (las imagenes necesitan ser accesibles desde Meta Ads)
3. Click **Create bucket**.
4. Ve a **Policies** del bucket `creatives` y agrega:
   - **INSERT** para usuarios autenticados:
     - Policy name: `Authenticated users can upload`
     - Target roles: `authenticated`
     - WITH CHECK: `true`
   - **SELECT** no necesita policy (el bucket es publico)
   - **DELETE** para usuarios autenticados (sus propios archivos):
     - Policy name: `Users can delete own files`
     - Target roles: `authenticated`
     - USING: `(storage.foldername(name))[1] = auth.uid()::text`

---

## Paso 5: Configurar Meta for Developers

**Tiempo estimado: 15 min**

### 5a. Crear la app

1. Ve a [developers.facebook.com](https://developers.facebook.com).
2. Click **Create App** > tipo **Business**.
3. Pon nombre: `Partrunner Campaign Builder`.
4. Una vez creada, ve a **Add Products** y agrega **Marketing API**.
5. En **App Dashboard > Settings > Basic**, copia el **App ID** → `META_APP_ID`.

### 5b. Crear System User Token

1. Ve a [business.facebook.com/settings/system-users](https://business.facebook.com/settings/system-users).
2. Click **Add** > nombre: `campaign-builder-bot` > rol: **Admin**.
3. **Assign Assets**: asigna la Ad Account que vas a usar, con permiso **Full Control**.
4. Click **Generate New Token**:
   - App: selecciona `Partrunner Campaign Builder`
   - Token expiration: **60 days** (o Never si esta disponible)
   - Permisos requeridos:
     - `ads_management`
     - `ads_read`
     - `business_management`
     - `pages_read_engagement` (si usas page posts)
5. Copia el token generado → `META_ACCESS_TOKEN`.

> **ALERTA**: Pon un recordatorio en tu calendario para rotar el token antes de que expire. Si expira, las campanas no se podran lanzar.

### 5c. Obtener Ad Account ID

1. En [business.facebook.com/settings/ad-accounts](https://business.facebook.com/settings/ad-accounts).
2. Selecciona la cuenta que vas a usar.
3. Copia el **Account ID** (numero).
4. Antepone `act_` → ej. `act_123456789` → `META_AD_ACCOUNT_ID`.

### 5d. Verificacion rapida

Desde tu terminal, verifica que el token funciona:

```bash
curl "https://graph.facebook.com/v21.0/act_TU_ACCOUNT_ID?fields=name,account_status&access_token=TU_TOKEN"
```

Deberias ver algo como:
```json
{"name": "Partrunner Ads", "account_status": 1, "id": "act_123456789"}
```

`account_status: 1` = activa. Si ves `2`, la cuenta esta deshabilitada.

---

## Paso 6: Configurar Gemini API

**Tiempo estimado: 3 min**

1. Ve a [aistudio.google.com/apikey](https://aistudio.google.com/apikey).
2. Click **Create API Key**.
3. Selecciona o crea un proyecto de Google Cloud.
4. Copia la key → `GEMINI_API_KEY`.
5. Verificacion rapida:

```bash
curl "https://generativelanguage.googleapis.com/v1beta/models?key=TU_API_KEY" | head -20
```

Deberias ver una lista de modelos disponibles incluyendo `gemini-2.0-flash-exp`.

---

## Paso 7: Deploy en Railway

**Tiempo estimado: 15 min**

### 7a. Crear proyecto

1. Ve a [railway.app](https://railway.app) e inicia sesion con GitHub.
2. Click **New Project** > **Deploy from GitHub repo**.
3. Selecciona `workofger/campaign-builder`.
4. Railway creara un servicio automatico. **No lo configures aun**, vamos a agregar dos servicios manuales.

### 7b. Servicio: Frontend

1. En tu proyecto de Railway, click **New Service** > **GitHub Repo** > selecciona el mismo repo.
2. En **Settings** del servicio:
   - **Service Name**: `frontend`
   - **Root Directory**: `/` (dejar vacio o `/`)
   - **Build Command**: `npm run build`
   - **Start Command**: (dejar vacio, Railway sirve archivos estaticos automaticamente con Nixpacks. Si no detecta, usa: `npx serve dist -s -l 3000`)
3. En **Variables**, agrega:

```
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...tu_anon_key
VITE_API_URL=https://tu-api-service.up.railway.app
```

> **Nota**: `VITE_API_URL` lo obtendras despues de crear el servicio API (paso 7c). Vuelve a editarlo una vez que tengas la URL del API.

4. En **Settings > Networking**, click **Generate Domain** para obtener una URL publica.

### 7c. Servicio: API

1. Click **New Service** > **GitHub Repo** > mismo repo.
2. En **Settings**:
   - **Service Name**: `api`
   - **Root Directory**: `/server`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
3. En **Variables**, agrega:

```
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...tu_service_role_key
META_APP_ID=123456789
META_ACCESS_TOKEN=EAAxxxxxxx
META_AD_ACCOUNT_ID=act_123456789
GEMINI_API_KEY=AIzaSy...
PORT=3001
ALLOWED_ORIGIN=https://tu-frontend-service.up.railway.app
```

4. En **Settings > Networking**, click **Generate Domain**.
5. **IMPORTANTE**: Vuelve al servicio **frontend** y actualiza `VITE_API_URL` con la URL que Railway genero para el API.

### 7d. Verificar deploy

1. Espera a que ambos servicios terminen de construir (ver logs en Railway).
2. Abre la URL del API + `/health`:
   ```
   https://tu-api-service.up.railway.app/health
   ```
   Deberias ver: `{"status":"ok","timestamp":"..."}`
3. Abre la URL del frontend. Deberia mostrar la pagina de login.
4. Registrate con tu email corporativo.
5. Crea una campana de prueba y verifica que se guarda en Supabase.

### 7e. Eliminar servicio duplicado (si aplica)

Si Railway creo un servicio automatico al conectar el repo (paso 7a), eliminalo para evitar confusion. Solo deben quedar `frontend` y `api`.

---

## Paso 8: Configurar CORS en produccion

Una vez que tengas las URLs de Railway:

1. En el servicio **api** de Railway, verifica que `ALLOWED_ORIGIN` apunte exactamente a la URL del frontend (**sin trailing slash**):
   ```
   ALLOWED_ORIGIN=https://campaign-builder-frontend.up.railway.app
   ```

2. En **Supabase > Authentication > URL Configuration**:
   - **Site URL**: `https://tu-frontend.up.railway.app`
   - **Redirect URLs**: agrega `https://tu-frontend.up.railway.app`

---

## Paso 9: Prueba end-to-end

Ejecuta estas pruebas para confirmar que todo funciona:

| # | Prueba | Resultado esperado |
|---|--------|--------------------|
| 1 | Abrir URL del frontend | Pagina de login |
| 2 | Click "Continuar con Google" | Redirige a Google, autenticacion, vuelve a la app |
| 3 | Verificar perfil creado | Aparece en tabla `profiles` con nombre y avatar de Google |
| 4 | Crear campana (paso 1 a 4) | Se guarda en Supabase tabla `campaigns` |
| 5 | Generar imagenes con IA | Se crean registros en `creatives` (si Gemini esta configurado) |
| 6 | Exportar JSON | Se descarga archivo |
| 7 | Lanzar campana | Se crea en Meta Ads (o muestra error descriptivo si las credenciales son de prueba) |
| 8 | Ver campana en sidebar | Aparece en la lista |
| 9 | `GET /health` del API | `{"status":"ok"}` |
| 10 | Cerrar sesion y verificar que no se accede sin auth | Redirige a login |

---

## Paso 10: Post-deploy

### Monitoreo
- Railway tiene logs en tiempo real por servicio. Revisalos despues de cada deploy.
- En Supabase > Logs puedes ver queries, auth events, y errores.

### Dominio custom (opcional)
1. En Railway, en cada servicio > Settings > Networking > Custom Domain.
2. Agrega tu dominio (ej. `campaigns.partrunner.com`).
3. Configura el DNS CNAME en tu proveedor de dominio.
4. Actualiza `VITE_API_URL` y `ALLOWED_ORIGIN` con los nuevos dominios.

### Backups
- Supabase hace backups automaticos diarios del Postgres (plan Pro).
- En plan Free, haz backups manuales periodicos desde **Database > Backups**.

### Rotacion de tokens
- **Meta Access Token**: rota cada 60 dias. Actualiza `META_ACCESS_TOKEN` en Railway.
- **Supabase keys**: no expiran, pero rotalas si sospechas que fueron comprometidas.
- **Gemini API Key**: no expira, pero puedes revocar y regenerar desde Google AI Studio.

---

## Resumen de todas las variables

### Frontend (3 variables)

| Variable | Ejemplo | Donde obtenerla |
|----------|---------|-----------------|
| `VITE_SUPABASE_URL` | `https://abc123.supabase.co` | Supabase > Settings > API |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGci...` | Supabase > Settings > API |
| `VITE_API_URL` | `https://api.up.railway.app` | Railway > API service > Domain |

### API Server (8 variables)

| Variable | Ejemplo | Donde obtenerla |
|----------|---------|-----------------|
| `SUPABASE_URL` | `https://abc123.supabase.co` | Supabase > Settings > API |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGci...` | Supabase > Settings > API |
| `META_APP_ID` | `123456789` | Meta > App Dashboard > Settings |
| `META_ACCESS_TOKEN` | `EAAxxxxxx` | Meta > Business Manager > System Users |
| `META_AD_ACCOUNT_ID` | `act_123456789` | Meta > Business Manager > Ad Accounts |
| `GEMINI_API_KEY` | `AIzaSy...` | Google AI Studio > API Keys |
| `PORT` | `3001` | Fijo |
| `ALLOWED_ORIGIN` | `https://frontend.up.railway.app` | Railway > Frontend service > Domain |

---

## Endpoints de Admin (solo role=admin)

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/api/admin/users` | Listar todos los usuarios y sus roles |
| PATCH | `/api/admin/users/:id/role` | Cambiar rol de un usuario (`{"role": "admin"}` o `{"role": "member"}`) |
| GET | `/api/admin/campaigns` | Ver todas las campanas de todos los usuarios |
| GET | `/api/admin/launches` | Ver historial de lanzamientos de todos los usuarios |

Estos endpoints devuelven 403 si el usuario no tiene role `admin`.

---

## Troubleshooting

| Problema | Causa probable | Solucion |
|----------|---------------|----------|
| Login falla con "Invalid login credentials" | Usuario no registrado o contrasena incorrecta | Registrate primero, contrasena minimo 6 caracteres |
| API responde 401 | JWT expirado o no enviado | Cierra sesion y vuelve a entrar |
| API responde 500 en `/api/campaigns` | Supabase keys incorrectas o migracion no ejecutada | Verifica `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY`. Corre la migracion SQL. |
| "Meta API error" al lanzar | Token expirado o permisos insuficientes | Regenera el System User Token con los permisos correctos |
| Imagenes no se generan | API key de Gemini invalida o modelo no disponible | Verifica la key con el curl de prueba (paso 6) |
| CORS error en el browser | `ALLOWED_ORIGIN` no coincide con URL del frontend | Verifica que no tenga trailing slash y que sea HTTPS |
| Frontend muestra pagina en blanco | Variables `VITE_*` no configuradas en build time | En Railway, las VITE_* deben existir al momento del build. Retrigger deploy. |

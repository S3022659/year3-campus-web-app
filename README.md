# Secure Frontend App Example

## Local Setup

```bash
npm install
```

### Compile and Hot-Reload for Development

```bash
npm run dev
```

### Type-Check, Compile and Minify for Production

```bash
npm run build
```

## Auth0 Setup

> Ensure your `.devcontainer/devcontainer.json` is using the updated `ghcr.io/tpdavison/devops-labs:v1.1` image.

### 1. Create an Auth0 Tenancy

Visit [auth0.com](https://auth0.com/) and sign-up. Create and name your first tenancy following our usual naming conventions, for example `shopping-dev-ab47`.

### 2. Sign-in to Auth0 CLI

In the VSCode terminal...

```bash
auth0 login
```

Confirm your Auth0 domain (e.g. shopping-dev-ab47.uk.auth0.com):

```bash
auth0 tenants list
```

Keep a note of your domain as you will need it later.

### 3. Register an SPA application

Call you app something like `devices-dev-app`.

```bash
auth0 apps create \
 --name campus-device-loan \
 --type spa \
 --no-input \
 --json
```

Take note of the `client_id` from the output.
gkW47pffZrg4YDXIX91EEhnHrHHuyRTV
domain dev-5g3kyrzmhn3l8ffu.uk.auth0.com

### 4. Create Test User

```bash
auth0 users create \
  --connection-name "Username-Password-Authentication" \
  --email "testuser1@example.com" \
  --password "P@ssw0rd!" \
  --no-input
```

Note the username and password as you'll need to sign in using them later.

ID auth0|69286ab957b817bdb93971a3  
 EMAIL testuser1@example.com  
 CONNECTION Username-Password-Authentication

### 5 Update App's Allowed Callbacks

Auth0 will only allow sign in to your registered app if the request comes from a list of permitted URLs.

Register localhost for local testing:

```bash
auth0 apps update gkW47pffZrg4YDXIX91EEhnHrHHuyRTV \
 --callbacks "http://localhost:5173" \
 --logout-urls "http://localhost:5173" \
 --no-input \
 --json
```

> You will need to also list your Azure Storage Account URL if you deploy your app to Azure. For example:

```bash
auth0 apps update gkW47pffZrg4YDXIX91EEhnHrHHuyRTV \
 --callbacks "http://localhost:5173, https://reviewstestab47store.z33.web.core.windows.net" \
 --logout-urls "http://localhost:5173, https://reviewstestab47store.z33.web.core.windows.net" \
 --no-input \
 --json
```

### 6. Configure Environment Variables

Copy `.env.example` to `.env.local` and fill in your Auth0 values:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
VITE_AUTH0_DOMAIN=your-tenant.uk.auth0.com
VITE_AUTH0_CLIENT_ID=your-client-id-here
```

> We would never put a secret in these env vars because SPAs bake their env vars into the final code, which is publically visible.

## Test Locally

Start the app running:

```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

You should be able to sign-in using test user account created earlier.

You will need to configure the app to use your copy of the `cis3039-example-security-svc` service for fetching devices:

```env
VITE_API_BASE_URL=https://<your-func-app>.azurewebsites.net/api/
```

## How the project was made

```bash
npm create vue@3 . -- \
  --force \
  --bare \
  --typescript \
  --router \
  --prettier
```

Restore any delete devcontainer configuration:

```bash
git restore .devcontainer/devcontainer.json
```

Add extensions to devcontainer:

- `"esbenp.prettier-vscode"`,
- `"Vue.volar"`

Update preferences in `.prettierrc.json`:

- `"semi": true`
- `"singleQuote": true`
- `"printWidth": 80`

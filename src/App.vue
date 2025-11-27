<script setup lang="ts">
import { useAuth0 } from '@auth0/auth0-vue';

const { isAuthenticated, loginWithRedirect, logout, user, isLoading } =
  useAuth0();
const returnTo = window.location.origin;
const year = new Date().getFullYear();
</script>

<template>
  <div class="app">
    <header class="topbar">
      <div class="brand">Campus Loans App</div>
      <div class="spacer"></div>
      <div class="auth">
        <span v-if="!isLoading && isAuthenticated && user" class="user">
          Signed in as {{ user.name || user.email }}
        </span>
        <button v-if="!isAuthenticated" @click="loginWithRedirect()">
          Sign in
        </button>
        <button v-else @click="logout({ logoutParams: { returnTo } })">
          Sign out
        </button>
      </div>
    </header>
    <main class="content">
      <RouterView />
    </main>
    <footer class="footer">
      <div class="content footer-inner">
        <div class="left">© {{ year }} Campus Loans App</div>
        <div class="right">
          <a href="#" @click.prevent>Privacy</a>
          <span class="dot">•</span>
          <a href="#" @click.prevent>Terms</a>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  background: var(--body-bg, #f5f5f5);
}
.topbar {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  background: var(--brand, #111827); /* gray-900 */
  color: #e5e7eb; /* gray-200 */
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}
.brand {
  font-weight: 600;
  letter-spacing: 0.2px;
}
.spacer {
  flex: 1;
}
.auth {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.auth button {
  background: var(--primary, #2563eb);
  color: white;
  border: none;
  padding: 0.45rem 0.9rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  box-shadow: 0 1px 0 rgba(0,0,0,0.04);
  transition: background .12s ease, transform .06s ease;
}
.auth button:hover {
  background: #1d4ed8;
  transform: translateY(-1px);
}
.user {
  margin-right: 0.5rem;
  font-size: 0.9rem;
  opacity: 0.9;
}
.content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}

.footer {
  border-top: 1px solid rgba(15,23,36,0.06);
  background: var(--card, #fff);
  color: var(--muted, #6b7280);
  font-size: 0.9rem;
}
.footer-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.75rem 1rem;
  max-width: 1200px;
  margin: 0 auto;
}
.footer a { color: var(--muted, #6b7280); }
.footer .dot { margin: 0 0.5rem; color: rgba(0,0,0,0.16); }
</style>

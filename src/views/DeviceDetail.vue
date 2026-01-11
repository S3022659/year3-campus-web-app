<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { appConfig } from '@/config/appConfig';
import { useAuth0 } from '@auth0/auth0-vue';
import type { Device } from '@/composables/useDevices';
import { trackEvent, trackError } from '@/telemetry/telemetry';

const route = useRoute();
const router = useRouter();
const { isAuthenticated, getAccessTokenSilently } = useAuth0();

const device = ref<Device | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);

const formatPrice = (p?: number | null) =>
  p === undefined || p === null ? '—' : `£${(p / 100).toFixed(2)}`;

const fetchDevice = async () => {
  loading.value = true;
  error.value = null;
  const started = performance.now();
  try {
    const deviceId = route.params.id;
    // Fetch all devices since individual endpoint doesn't exist yet
    const url = new URL('devices', appConfig.apiBaseUrl).toString();
    const headers: Record<string, string> = { Accept: 'application/json' };

    if (isAuthenticated.value) {
      try {
        const token = await getAccessTokenSilently();
        if (token) headers.Authorization = `Bearer ${token}`;
      } catch {
        // If token retrieval fails, proceed unauthenticated
      }
    }

    const res = await fetch(url, { headers });
    if (!res.ok) {
      throw new Error(
        `Failed to fetch devices: ${res.status} ${res.statusText}`,
      );
    }
    const devices: Device[] = await res.json();
    const foundDevice = devices.find((d) => d.id === deviceId);

    if (!foundDevice) {
      throw new Error('Device not found');
    }

    device.value = foundDevice;
    trackEvent('device_detail_fetch_success', {
      deviceId: String(deviceId),
      authenticated: isAuthenticated.value,
      durationMs: Math.round(performance.now() - started),
    });
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Unknown error';
    trackError(e, {
      action: 'fetch_device_detail',
      deviceId: String(route.params.id),
      authenticated: isAuthenticated.value,
    });
    trackEvent('device_detail_fetch_failure', {
      deviceId: String(route.params.id),
      authenticated: isAuthenticated.value,
      durationMs: Math.round(performance.now() - started),
    });
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchDevice();
});

const goBack = () => {
  router.push({ name: 'devices' });
};
</script>

<template>
  <div class="device-detail">
    <button @click="goBack" class="back-button">← Back to Devices</button>

    <div v-if="loading" class="loading">Loading device details...</div>
    <div v-else-if="error" class="error">
      <p>Error: {{ error }}</p>
      <button @click="fetchDevice">Retry</button>
      <button @click="goBack">Go Back</button>
    </div>
    <div v-else-if="device" class="detail-card">
      <h1 class="device-name">{{ device.name }}</h1>

      <div class="detail-section">
        <div class="detail-item">
          <span class="label">Device ID:</span>
          <span class="value">{{ device.id }}</span>
        </div>

        <div class="detail-item">
          <span class="label">Price:</span>
          <span class="value price">{{ formatPrice(device.pricePence) }}</span>
        </div>
      </div>

      <div v-if="device.description" class="description-section">
        <h2>Description</h2>
        <p>{{ device.description }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.device-detail {
  max-width: 960px;
  margin: 0 auto;
  padding: 2rem;
}

.back-button {
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-size: 0.95rem;
  margin-bottom: 2rem;
  transition: all 0.2s;
}

.back-button:hover {
  background: #e5e7eb;
}

.loading,
.error {
  text-align: center;
  padding: 3rem 2rem;
}

.error button {
  margin: 0.5rem;
}

.detail-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.device-name {
  color: #1f2937;
  font-size: 2rem;
  margin: 0 0 1.5rem 0;
}

.detail-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.detail-item {
  display: flex;
  gap: 1rem;
  padding: 0.75rem;
  background: #f9fafb;
  border-radius: 6px;
}

.label {
  font-weight: 600;
  color: #6b7280;
  min-width: 120px;
}

.value {
  color: #1f2937;
}

.value.price {
  color: #065f46;
  font-weight: 700;
  font-size: 1.25rem;
}

.description-section {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #e5e7eb;
}

.description-section h2 {
  color: #1f2937;
  font-size: 1.25rem;
  margin: 0 0 1rem 0;
}

.description-section p {
  color: #4b5563;
  line-height: 1.6;
}
</style>

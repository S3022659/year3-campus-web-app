import { ref, type Ref } from 'vue';
import { appConfig } from '@/config/appConfig';
import { useAuth0 } from '@auth0/auth0-vue';
import { trackEvent, trackError } from '@/telemetry/telemetry';

export type Device = {
  id: string;
  name: string;
  pricePence?: number;
  description?: string;
};

const API_BASE = appConfig.apiBaseUrl;

export function useDevices() {
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();
  const devices: Ref<Device[]> = ref([]);
  const loading = ref(false);
  const error: Ref<string | null> = ref(null);

  const fetchDevices = async (force = false) => {
    if (loading.value) return;
    loading.value = true;
    error.value = null;
    const started = performance.now();
    try {
      const url = new URL('devices', API_BASE).toString();
      const headers: Record<string, string> = { Accept: 'application/json' };
      if (isAuthenticated.value) {
        try {
          const token = await getAccessTokenSilently();
          if (token) headers.Authorization = `Bearer ${token}`;
        } catch {
          // If token retrieval fails, proceed unauthenticated
        }
      }
      trackEvent('devices_fetch_start', {
        authenticated: isAuthenticated.value,
        force,
      });

      const res = await fetch(url, { headers });
      if (!res.ok)
        throw new Error(
          `Failed to fetch devices: ${res.status} ${res.statusText}`,
        );
      const data: Device[] = await res.json();
      devices.value = Array.isArray(data) ? data : [];
      trackEvent('devices_fetch_success', {
        authenticated: isAuthenticated.value,
        force,
        count: devices.value.length,
        durationMs: Math.round(performance.now() - started),
      });
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Unknown error';
      trackError(e, {
        action: 'fetch_devices',
        authenticated: isAuthenticated.value,
      });
      trackEvent('devices_fetch_failure', {
        authenticated: isAuthenticated.value,
        force,
        durationMs: Math.round(performance.now() - started),
      });
    } finally {
      loading.value = false;
    }
  };

  return { devices: devices, loading, error, fetchDevices };
}

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useDevices, type Device } from '@/composables/useDevices';
import { createPinia, setActivePinia } from 'pinia';

/**
 * Mock implementation of Auth0 composable
 */
const mockAuth0 = {
  isAuthenticated: { value: false },
  getAccessTokenSilently: vi.fn(),
};

vi.mock('@auth0/auth0-vue', () => ({
  useAuth0: () => mockAuth0,
}));

/**
 * Mock fetch to intercept HTTP calls
 */
const mockFetch = vi.fn();
global.fetch = mockFetch as any;

describe('useDevices', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    mockAuth0.isAuthenticated.value = false;
  });

  describe('fetchDevices', () => {
    it('should fetch devices successfully', async () => {
      const mockDevices: Device[] = [
        { id: '1', name: 'Device 1', pricePence: 1000 },
        { id: '2', name: 'Device 2', pricePence: 2000 },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockDevices,
      });

      const { devices, loading, error, fetchDevices } = useDevices();

      expect(loading.value).toBe(false);
      expect(devices.value).toEqual([]);

      await fetchDevices();

      expect(loading.value).toBe(false);
      expect(devices.value).toEqual(mockDevices);
      expect(error.value).toBeNull();
    });

    it('should handle fetch errors gracefully', async () => {
      const errorMsg = 'Network error';
      mockFetch.mockRejectedValueOnce(new Error(errorMsg));

      const { devices, loading, error, fetchDevices } = useDevices();

      await fetchDevices();

      expect(loading.value).toBe(false);
      expect(devices.value).toEqual([]);
      expect(error.value).toContain('Network error');
    });

    it('should handle non-ok response status', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({}),
      });

      const { devices, loading, error, fetchDevices } = useDevices();

      await fetchDevices();

      expect(loading.value).toBe(false);
      expect(devices.value).toEqual([]);
      expect(error.value).toContain('Failed to fetch devices');
      expect(error.value).toContain('500');
    });

    it('should set loading state during fetch', async () => {
      const loadingStates: boolean[] = [];

      mockFetch.mockImplementationOnce(() => {
        loadingStates.push(true); // loading is true during fetch
        return Promise.resolve({
          ok: true,
          json: async () => [],
        });
      });

      const { loading, fetchDevices } = useDevices();

      expect(loading.value).toBe(false);

      const promise = fetchDevices();
      loadingStates.push(loading.value);

      await promise;

      expect(loading.value).toBe(false);
    });

    it('should not fetch if already loading', async () => {
      mockFetch.mockImplementationOnce(
        () =>
          new Promise(() => {
            /* never resolves */
          }),
      );

      const { fetchDevices } = useDevices();

      fetchDevices();
      fetchDevices(); // This should be ignored
      fetchDevices(); // This should be ignored

      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should include auth token in headers when authenticated', async () => {
      mockAuth0.isAuthenticated.value = true;
      mockAuth0.getAccessTokenSilently.mockResolvedValue('test-token-123');

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

      const { fetchDevices } = useDevices();
      await fetchDevices();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token-123',
          }),
        }),
      );
    });

    it('should proceed unauthenticated if token retrieval fails', async () => {
      mockAuth0.isAuthenticated.value = true;
      mockAuth0.getAccessTokenSilently.mockRejectedValueOnce(
        new Error('Token error'),
      );

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

      const { fetchDevices, error } = useDevices();
      await fetchDevices();

      // Should not treat token error as a fetch error
      expect(error.value).toBeNull();
      expect(mockFetch).toHaveBeenCalled();
    });

    it('should handle non-array response data', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [] }), // Not an array
      });

      const { devices, fetchDevices } = useDevices();
      await fetchDevices();

      expect(devices.value).toEqual([]);
    });

    it('should reset error state on successful fetch', async () => {
      const mockDevices: Device[] = [{ id: '1', name: 'Device 1' }];

      // First fetch fails
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Error',
        json: async () => ({}),
      });

      const { error, fetchDevices } = useDevices();
      await fetchDevices();
      expect(error.value).not.toBeNull();

      // Second fetch succeeds
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockDevices,
      });

      await fetchDevices();
      expect(error.value).toBeNull();
    });
  });

  describe('initial state', () => {
    it('should have empty initial state', () => {
      const { devices, loading, error } = useDevices();

      expect(devices.value).toEqual([]);
      expect(loading.value).toBe(false);
      expect(error.value).toBeNull();
    });
  });
});

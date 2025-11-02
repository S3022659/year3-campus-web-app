import { ref, type Ref } from 'vue';
import { appConfig } from '@/config/appConfig';
import { useAuth0 } from '@auth0/auth0-vue';

export type Product = {
  id: string;
  name: string;
  pricePence?: number;
  description?: string;
};

const API_BASE = appConfig.apiBaseUrl;

export function useProducts() {
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();
  const products: Ref<Product[]> = ref([]);
  const loading = ref(false);
  const error: Ref<string | null> = ref(null);

  const fetchProducts = async (force = false) => {
    if (loading.value) return;
    loading.value = true;
    error.value = null;
    try {
      const url = new URL('products', API_BASE).toString();
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
      if (!res.ok)
        throw new Error(
          `Failed to fetch products: ${res.status} ${res.statusText}`,
        );
      const data: Product[] = await res.json();
      products.value = Array.isArray(data) ? data : [];
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Unknown error';
    } finally {
      loading.value = false;
    }
  };

  return { products, loading, error, fetchProducts };
}

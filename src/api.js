function defaultApiBase() {
  if (
    typeof window !== 'undefined' &&
    ['localhost', '127.0.0.1'].includes(window.location.hostname) &&
    window.location.port !== '8000'
  ) {
    return 'http://127.0.0.1:8000/api';
  }
  return '/api';
}
const API_BASE = process.env.REACT_APP_API_BASE || defaultApiBase();
const AUTH_TOKEN_KEY = 'guruspares_admin_token';

function getAuthToken() {
  if (typeof window === 'undefined') {
    return '';
  }
  return window.localStorage.getItem(AUTH_TOKEN_KEY) || '';
}

function setAuthToken(token) {
  if (typeof window !== 'undefined' && token) {
    window.localStorage.setItem(AUTH_TOKEN_KEY, token);
  }
}

function clearAuthToken() {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(AUTH_TOKEN_KEY);
  }
}

function buildUrl(path, params = {}) {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost';
  const url = new URL(`${API_BASE}${path}`, origin);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, value);
    }
  });
  return url.toString();
}

function extractApiErrorMessage(data, fallback = 'Request failed') {
  if (!data) return fallback;
  if (typeof data === 'string') return data;

  const preferred = data.error || data.detail || data.message || data.non_field_errors;
  if (preferred) return extractApiErrorMessage(preferred, fallback);

  if (Array.isArray(data)) {
    return data.map((item) => extractApiErrorMessage(item, '')).filter(Boolean).join(', ') || fallback;
  }

  if (typeof data === 'object') {
    const messages = Object.entries(data)
      .map(([key, value]) => {
        const message = extractApiErrorMessage(value, '');
        return message ? `${key}: ${message}` : '';
      })
      .filter(Boolean);
    return messages.join('; ') || fallback;
  }

  return String(data);
}

export async function apiRequest(path, options = {}) {
  const { params, body, ...fetchOptions } = options;
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  const authToken = getAuthToken();
  const response = await fetch(buildUrl(path, params), {
    credentials: 'include',
    headers: isFormData
      ? {
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
          ...(fetchOptions.headers || {}),
        }
      : {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
          ...(fetchOptions.headers || {}),
        },
    ...fetchOptions,
    body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(extractApiErrorMessage(data));
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return data;
}

export const api = {
  login: async (body) => {
    const data = await apiRequest('/auth/login/', { method: 'POST', body });
    setAuthToken(data.token);
    return data;
  },
  logout: async () => {
    try {
      return await apiRequest('/auth/logout/', { method: 'POST' });
    } finally {
      clearAuthToken();
    }
  },
  currentUser: () => apiRequest('/auth/user/'),
  divisions: (params) => apiRequest('/divisions/', { params }),
  categories: (params) => apiRequest('/product-categories/', { params }),
  loomBrands: (params) => apiRequest('/loom-brands/', { params }),
  products: (params) => apiRequest('/products/', { params }),
  product: (id) => apiRequest(`/products/${id}/`),
  adminDivisions: (params) => apiRequest('/admin/divisions/', { params }),
  adminCategories: (params) => apiRequest('/admin/product-categories/', { params }),
  adminLoomBrands: (params) => apiRequest('/admin/loom-brands/', { params }),
  adminChemicalCategories: (params) => apiRequest('/admin/loom-brands/', { params }),
  adminProducts: (params) => apiRequest('/admin/products/', { params }),
  createDivision: (body) => apiRequest('/admin/divisions/', { method: 'POST', body }),
  updateDivision: (id, body) => apiRequest(`/admin/divisions/${id}/`, { method: 'PUT', body }),
  deleteDivision: (id) => apiRequest(`/admin/divisions/${id}/`, { method: 'DELETE' }),
  createCategory: (body) => apiRequest('/admin/product-categories/', { method: 'POST', body }),
  updateCategory: (id, body) => apiRequest(`/admin/product-categories/${id}/`, { method: 'PUT', body }),
  deleteCategory: (id) => apiRequest(`/admin/product-categories/${id}/`, { method: 'DELETE' }),
  createLoomBrand: (body) => apiRequest('/admin/loom-brands/', { method: 'POST', body }),
  updateLoomBrand: (id, body) => apiRequest(`/admin/loom-brands/${id}/`, { method: 'PUT', body }),
  deleteLoomBrand: (id) => apiRequest(`/admin/loom-brands/${id}/`, { method: 'DELETE' }),
  createProduct: (body) => apiRequest('/admin/products/', { method: 'POST', body }),
  updateProduct: (id, body) => apiRequest(`/admin/products/${id}/`, { method: 'PUT', body }),
  deleteProduct: (id, body) => apiRequest(`/admin/products/${id}/`, { method: 'DELETE', body }),
  reorderProducts: (divisionId, productIds) => apiRequest('/admin/products/reorder/', {
    method: 'POST',
    body: { division: divisionId, product_ids: productIds },
  }),
  productImages: (productId) => apiRequest(`/admin/products/${productId}/images/`),
  uploadProductImages: (productId, files) => {
    const formData = new FormData();
    Array.from(files).forEach((file) => formData.append('images', file));
    return apiRequest(`/admin/products/${productId}/images/`, { method: 'POST', body: formData });
  },
  reorderProductImages: (productId, imageIds) => apiRequest(`/admin/products/${productId}/images/reorder/`, {
    method: 'POST',
    body: { image_ids: imageIds },
  }),
  deleteProductImage: (imageId, fileName) => apiRequest(`/admin/product-images/${imageId}/`, { 
  method: 'DELETE',
  body: { file_name: fileName },
}),
};

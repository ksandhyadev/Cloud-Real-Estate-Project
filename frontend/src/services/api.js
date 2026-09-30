const API_BASE = "http://127.0.0.1:8000/api";

function getAuthHeader() {
  const token = localStorage.getItem("realestate_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    ...getAuthHeader(),
    ...options.headers
  };

  // Don't set Content-Type if body is FormData
  if (!(options.body instanceof FormData) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(url, {
    ...options,
    headers
  });

  if (!response.ok) {
    let errorDetail = "API Request failed";
    try {
      const err = await response.json();
      errorDetail = err.detail || JSON.stringify(err);
    } catch (e) {
      errorDetail = response.statusText;
    }
    throw new Error(errorDetail);
  }

  return response.json();
}

export const api = {
  // Auth
  register: (data) => request("/auth/register", { method: "POST", body: JSON.stringify(data) }),
  login: (data) => request("/auth/login", { method: "POST", body: JSON.stringify(data) }),
  getProfile: () => request("/auth/me"),

  // Properties
  getProperties: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "" && v !== "all") {
        query.append(k, v);
      }
    });
    return request(`/properties?${query.toString()}`);
  },
  getPropertyDetail: (id) => request(`/properties/${id}`),
  createProperty: (data) => request("/properties", { method: "POST", body: JSON.stringify(data) }),
  updateProperty: (id, data) => request(`/properties/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteProperty: (id) => request(`/properties/${id}`, { method: "DELETE" }),
  uploadImage: (id, formData) => request(`/properties/${id}/images`, { method: "POST", body: formData }),

  // AI & ML
  predictPrice: (specs) => request("/predict", { method: "POST", body: JSON.stringify(specs) }),
  analyzeText: (text) => request("/nlp", { method: "POST", body: JSON.stringify({ text }) }),
  analyzePhoto: (formData) => request("/image-analysis", { method: "POST", body: formData }),
  getDecisionSupport: (id) => request(`/properties/${id}/decision-support`),
  getModelInfo: () => request("/ml/model-info"),
  auditSellerListing: (draftData) => request("/seller/audit-listing", { method: "POST", body: JSON.stringify(draftData) }),
  smartSearch: (query) => request(`/properties/smart/search?q=${encodeURIComponent(query)}`),

  // Location & POI & Locality Intelligence
  getPOIs: (lat, lon, city) => request(`/poi?lat=${lat}&lon=${lon}&city=${encodeURIComponent(city || 'Bangalore')}`),
  getSafety: (propertyId) => request(`/safety/${propertyId}`),
  getLocalityStats: (name, propertyType = "apartment") => request(`/locality/${encodeURIComponent(name)}/stats?property_type=${propertyType}`),
  getAllLocalities: () => request("/locality/all"),

  // Property Sub-Resource Intelligence
  getPropertyComparables: (id, limit = 4) => request(`/properties/${id}/comparables?limit=${limit}`),
  getPropertyScorecard: (id) => request(`/properties/${id}/scorecard`),
  getPropertyInsights: (id) => request(`/properties/${id}/insights`),
  getPropertyAnomalies: (id) => request(`/properties/${id}/anomalies`),
  getPropertyDataSources: (id) => request(`/properties/${id}/data-sources`),
  getPropertyHistoricalTrend: (id) => request(`/properties/${id}/historical-trend`),

  // User Workflows
  getShortlist: () => request("/shortlist"),
  addToShortlist: (propertyId) => request(`/shortlist/${propertyId}`, { method: "POST" }),
  removeFromShortlist: (propertyId) => request(`/shortlist/${propertyId}`, { method: "DELETE" }),
  compareProperties: (propertyIds) => request("/compare", { method: "POST", body: JSON.stringify({ property_ids: propertyIds }) }),
  
  getNotifications: () => request("/notifications"),
  markNotificationRead: (id) => request(`/notifications/${id}/read`, { method: "PATCH" }),
  markAllNotificationsRead: () => request("/notifications/read-all", { method: "POST" }),

  sendEnquiry: (data) => request("/enquiries", { method: "POST", body: JSON.stringify(data) }),
  getMyEnquiries: () => request("/enquiries/my-inbox"),

  getSavedSearches: () => request("/saved-searches"),
  createSavedSearch: (data) => request("/saved-searches", { method: "POST", body: JSON.stringify(data) }),

  // Admin & System Health
  getHealth: () => request("/health"),
  getAdminStats: () => request("/admin/stats"),
  getAdminProperties: (status = "all") => request(`/admin/properties?status_filter=${status}`),
  updateListingStatus: (id, status) => request(`/admin/properties/${id}/status?new_status=${status}`, { method: "PATCH" })
};

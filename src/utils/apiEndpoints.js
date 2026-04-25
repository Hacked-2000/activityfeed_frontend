const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api/v1";

export const apiUrls = {
  // activities
  CreateActivity: `${BASE_URL}/activities`,
  GetActivities: (tenantId) => `${BASE_URL}/activities/${tenantId}`,
};

export { BASE_URL };

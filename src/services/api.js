import { QueryClient } from '@tanstack/react-query';

// Create a client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// API base URL
const API_BASE_URL = 'http://localhost:8000/api';

// Listing API functions
export const listingAPI = {
  createListing: async (listingData) => {
    const token = localStorage.getItem('admin_token');
    const formData = new FormData();

    // Add text fields
    Object.keys(listingData).forEach(key => {
      if (key !== 'image' && key !== 'pdf' && key !== 'video') {
        if (listingData[key] !== null && listingData[key] !== undefined) {
          if (Array.isArray(listingData[key]) && key === 'other') {
            listingData[key].forEach(feature => {
              formData.append('other[]', feature);
            });
          } else {
            formData.append(key, listingData[key]);
          }
        }
      }
    });

    // Add files
    if (listingData.image && Array.isArray(listingData.image)) {
      listingData.image.forEach(file => {
        formData.append('files[image][]', file);
      });
    }
    if (listingData.video) {
      formData.append('files[video]', listingData.video);
    }
    if (listingData.pdf && Array.isArray(listingData.pdf)) {
      listingData.pdf.forEach(file => {
        formData.append('files[pdf][]', file);
      });
    }

    const response = await fetch(`${API_BASE_URL}/listings`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to create listing');
    }

    return data;
  },

  getListings: async (params = {}) => {
    const token = localStorage.getItem('admin_token');
    const queryString = new URLSearchParams(params).toString();
    const url = `${API_BASE_URL}/listings${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch listings');
    }

    return data;
  },

  getAdminListings: async (params = {}) => {
    const token = localStorage.getItem('admin_token');
    const queryString = new URLSearchParams(params).toString();
    const url = `${API_BASE_URL}/admin/listings${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch admin listings');
    }

    return data;
  },

  getListing: async (id) => {
    const token = localStorage.getItem('admin_token');

    const response = await fetch(`${API_BASE_URL}/listings/${id}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch listing');
    }

    return data;
  },

  approveListing: async (id, auctionData = {}) => {
    const token = localStorage.getItem('admin_token');

    const response = await fetch(`${API_BASE_URL}/listings/${id}/approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(auctionData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to approve listing');
    }

    return data;
  },

  rejectListing: async (id) => {
    const token = localStorage.getItem('admin_token');

    const response = await fetch(`${API_BASE_URL}/listings/${id}/reject`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to reject listing');
    }

    return data;
  },
};

// Model API functions
export const modelAPI = {
  getModels: async () => {
    const token = localStorage.getItem('admin_token');

    const response = await fetch(`${API_BASE_URL}/models`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch models');
    }

    return data;
  },

  addModel: async (modelData) => {
    const token = localStorage.getItem('admin_token');
    const formData = new FormData();

    // Add text fields
    Object.keys(modelData).forEach(key => {
      if (key !== 'image') {
        if (modelData[key] !== null && modelData[key] !== undefined) {
          formData.append(key, modelData[key]);
        }
      }
    });

    // Add image file
    if (modelData.image) {
      formData.append('image', modelData.image);
    }

    const response = await fetch(`${API_BASE_URL}/models`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to add model');
    }

    return data;
  },

  updateModel: async (id, modelData) => {
    const token = localStorage.getItem('admin_token');
    const formData = new FormData();

    // Add text fields
    Object.keys(modelData).forEach(key => {
      if (key !== 'image') {
        if (modelData[key] !== null && modelData[key] !== undefined) {
          formData.append(key, modelData[key]);
        }
      }
    });

    // Add image file
    if (modelData.image) {
      formData.append('image', modelData.image);
    }

    const response = await fetch(`${API_BASE_URL}/models/${id}`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
        'X-HTTP-Method-Override': 'PUT',
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to update model');
    }

    return data;
  },

  deleteModel: async (id) => {
    const token = localStorage.getItem('admin_token');

    const response = await fetch(`${API_BASE_URL}/models/${id}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to delete model');
    }

    return data;
  },

  deleteAllModels: async () => {
    const token = localStorage.getItem('admin_token');

    const response = await fetch(`${API_BASE_URL}/models/delete-all`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to delete all models');
    }

    return data;
  },
};

// Banner API functions
export const bannerAPI = {
  getBanners: async () => {
    const token = localStorage.getItem('admin_token');

    const response = await fetch(`${API_BASE_URL}/banners`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch banners');
    }

    return data;
  },

  addBanner: async (bannerData) => {
    const token = localStorage.getItem('admin_token');
    const formData = new FormData();

    // Add text fields
    Object.keys(bannerData).forEach(key => {
      if (key !== 'image') {
        if (bannerData[key] !== null && bannerData[key] !== undefined) {
          formData.append(key, bannerData[key]);
        }
      }
    });

    // Add image file
    if (bannerData.image) {
      formData.append('image', bannerData.image);
    }

    const response = await fetch(`${API_BASE_URL}/banners`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to add banner');
    }

    return data;
  },

  updateOrder: async (order) => {
    const token = localStorage.getItem('admin_token');

    const response = await fetch(`${API_BASE_URL}/banners/update-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ order }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to update order');
    }

    return data;
  },

  deleteBanner: async (id) => {
    const token = localStorage.getItem('admin_token');

    const response = await fetch(`${API_BASE_URL}/banners/${id}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to delete banner');
    }

    return data;
  },
};

// Auction API functions
export const auctionAPI = {
  getAuctions: async (params = {}) => {
    const token = localStorage.getItem('admin_token');
    const queryString = new URLSearchParams(params).toString();
    const url = `${API_BASE_URL}/admin/auctions${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch auctions');
    }

    return data;
  },

  getAuction: async (id) => {
    const token = localStorage.getItem('admin_token');

    const response = await fetch(`${API_BASE_URL}/auctions/${id}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch auction');
    }

    return data;
  },

  startStream: async (id, data) => {
    const token = localStorage.getItem('admin_token');

    const response = await fetch(`${API_BASE_URL}/auctions/${id}/streams/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to start stream');
    }

    return result;
  },

  endStream: async (id) => {
    const token = localStorage.getItem('admin_token');

    const response = await fetch(`${API_BASE_URL}/auctions/${id}/streams/end`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to end stream');
    }

    return data;
  },

  updateAuction: async (id, auctionData) => {
    const token = localStorage.getItem('admin_token');

    const response = await fetch(`${API_BASE_URL}/auctions/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(auctionData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to update auction');
    }

    return data;
  },

  // Stream API functions
  getStreams: async (auctionId) => {
    const token = localStorage.getItem('admin_token');

    const response = await fetch(`${API_BASE_URL}/auctions/${auctionId}/streams`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch streams');
    }

    return data;
  },

  storeStream: async (auctionId, streamData) => {
    const token = localStorage.getItem('admin_token');

    const response = await fetch(`${API_BASE_URL}/auctions/${auctionId}/streams`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(streamData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to create stream');
    }

    return data;
  },

  updateStream: async (auctionId, streamId, streamData) => {
    const token = localStorage.getItem('admin_token');

    const response = await fetch(`${API_BASE_URL}/auctions/${auctionId}/streams/${streamId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(streamData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to update stream');
    }

    return data;
  },

  deleteStream: async (auctionId, streamId) => {
    const token = localStorage.getItem('admin_token');

    const response = await fetch(`${API_BASE_URL}/auctions/${auctionId}/streams/${streamId}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to delete stream');
    }

    return data;
  },

  startLiveStream: async (streamId) => {
    const token = localStorage.getItem('admin_token');

    const response = await fetch(`${API_BASE_URL}/streams/${streamId}/start`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to start live stream');
    }

    return data;
  },
};

// Admin API functions
export const adminAPI = {
  login: async (loginData) => {
    const response = await fetch(`${API_BASE_URL}/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(loginData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to login');
    }

    return data;
  },
};

// Default export for general API calls
const api = {
  get: async (endpoint) => {
    const token = localStorage.getItem('admin_token');
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch');
    }
    return { data };
  },
};

export default api;

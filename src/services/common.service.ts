import axiosInstance from '../api/axiosInstance';
import { getItemInLocalStorage } from '../utils/localStorage';

const getToken = () => getItemInLocalStorage<string>('TOKEN');

// Common types
export interface Site {
  id: number;
  site_name: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
}

export interface Building {
  id: number;
  building_name: string;
  site_id: number;
  floors?: Floor[];
}

export interface Floor {
  id: number;
  floor_name: string;
  building_id: number;
  units?: Unit[];
}

export interface Unit {
  id: number;
  unit_name: string;
  floor_id: number;
}

export interface User {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  phone?: string;
  role?: string;
}

// Common Service for shared APIs
export const commonService = {
  // Get all sites
  getSites: async () => {
    return axiosInstance.get('/sites.json', {
      params: { token: getToken() },
    });
  },

  // Get buildings by site
  getBuildings: async (siteId?: number | string) => {
    const params: Record<string, unknown> = { token: getToken() };
    if (siteId) {
      params['q[site_id_eq]'] = siteId;
    }
    return axiosInstance.get('/buildings.json', { params });
  },

  // Get floors by building
  getFloors: async (buildingId?: number | string) => {
    const params: Record<string, unknown> = { token: getToken() };
    if (buildingId) {
      params['q[building_id_eq]'] = buildingId;
    }
    return axiosInstance.get('/floors.json', { params });
  },

  // Get units by floor
  getUnits: async (floorId?: number | string) => {
    const params: Record<string, unknown> = { token: getToken() };
    if (floorId) {
      params['q[floor_id_eq]'] = floorId;
    }
    return axiosInstance.get('/units.json', { params });
  },

  // Get users
  getUsers: async () => {
    return axiosInstance.get('/users.json', {
      params: { token: getToken() },
    });
  },

  // Get current user profile
  getCurrentUser: async () => {
    return axiosInstance.get('/login.json', {
      params: { token: getToken() },
    });
  },
};

export default commonService;

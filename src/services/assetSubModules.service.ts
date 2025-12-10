import axiosInstance from '../api/axiosInstance';
import { getItemInLocalStorage } from '../utils/localStorage';

const getToken = () => getItemInLocalStorage<string>('TOKEN');

// AMC Types
export interface AMC {
  id: number | string;
  vendor_name?: string;
  vendor_id?: number;
  asset_id?: number;
  asset_name?: string;
  start_date?: string;
  end_date?: string;
  amc_type?: string;
  amount?: number;
  status?: string;
  frequency?: string;
  contract_number?: string;
  created_at?: string;
}

// Meter Types
export interface Meter {
  id: number | string;
  name: string;
  asset_number?: string;
  oem_name?: string;
  building_name?: string;
  floor_name?: string;
  unit_name?: string;
  status?: string;
  is_meter?: boolean;
  last_reading?: number;
  meter_type?: string;
}

// Checklist Types
export interface Checklist {
  id: number | string;
  name: string;
  ctype?: string;
  frequency?: string;
  description?: string;
  questions_count?: number;
  created_at?: string;
  status?: string;
}

// Routine Task Types
export interface RoutineTask {
  id: number | string;
  checklist_id?: number;
  checklist_name?: string;
  asset_id?: number;
  asset_name?: string;
  assigned_to?: string;
  start_time?: string;
  end_time?: string;
  status?: string;
  frequency?: string;
  created_at?: string;
}

// PPM Activity Types
export interface PPMActivity {
  id: number | string;
  checklist_id?: number;
  checklist_name?: string;
  asset_id?: number;
  asset_name?: string;
  assigned_to?: string;
  start_time?: string;
  end_time?: string;
  status?: string;
  frequency?: string;
  due_date?: string;
}

// Stock Item Types
export interface StockItem {
  id: number | string;
  name: string;
  item_code?: string;
  category?: string;
  quantity?: number;
  unit?: string;
  min_stock?: number;
  max_stock?: number;
  unit_price?: number;
  location?: string;
  status?: string;
  created_at?: string;
}

// AMC Service
export const amcService = {
  getAMCs: async (page = 1, perPage = 10) => {
    return axiosInstance.get(`/asset_amcs.json?per_page=${perPage}&page=${page}`, {
      params: { token: getToken() },
    });
  },
  getAMCsByAsset: async (assetId: number | string) => {
    return axiosInstance.get(`/asset_amcs.json?q[asset_id_eq]=${assetId}`, {
      params: { token: getToken() },
    });
  },
  getAMCById: async (id: number | string) => {
    return axiosInstance.get(`/asset_amcs/${id}.json`, {
      params: { token: getToken() },
    });
  },
  createAMC: async (data: Partial<AMC>) => {
    return axiosInstance.post('/asset_amcs.json', data, {
      params: { token: getToken() },
    });
  },
  updateAMC: async (id: number | string, data: Partial<AMC>) => {
    return axiosInstance.put(`/asset_amcs/${id}.json`, data, {
      params: { token: getToken() },
    });
  },
};

// Meter Service
export const meterService = {
  getMeters: async (page = 1, perPage = 10) => {
    return axiosInstance.get(`/site_assets.json?q[is_meter]=true&per_page=${perPage}&page=${page}`, {
      params: { token: getToken() },
    });
  },
  getMeterById: async (id: number | string) => {
    return axiosInstance.get(`/site_assets/${id}.json`, {
      params: { token: getToken() },
    });
  },
};

// Checklist Service
export const checklistService = {
  getChecklists: async (page = 1, perPage = 10, ctype = 'routine') => {
    return axiosInstance.get(`/checklists.json?q[ctype_eq]=${ctype}&per_page=${perPage}&page=${page}`, {
      params: { token: getToken() },
    });
  },
  getChecklistById: async (id: number | string) => {
    return axiosInstance.get(`/checklists/${id}.json`, {
      params: { token: getToken() },
    });
  },
  createChecklist: async (data: Partial<Checklist>) => {
    return axiosInstance.post('/checklists.json', data, {
      params: { token: getToken() },
    });
  },
  updateChecklist: async (id: number | string, data: Partial<Checklist>) => {
    return axiosInstance.put(`/checklists/${id}.json`, data, {
      params: { token: getToken() },
    });
  },
};

// Routine Task Service
export const routineTaskService = {
  getRoutineTasks: async (page = 1, perPage = 10, filters?: { startDate?: string; endDate?: string; status?: string }) => {
    let url = `/activities.json?q[checklist_ctype_eq]=routine&per_page=${perPage}&page=${page}`;
    if (filters?.startDate) url += `&q[start_date_gteq]=${filters.startDate}`;
    if (filters?.endDate) url += `&q[start_date_lteq]=${filters.endDate}`;
    if (filters?.status && filters.status !== 'all') url += `&q[status_eq]=${filters.status}`;
    return axiosInstance.get(url, { params: { token: getToken() } });
  },
  getRoutineTaskById: async (assetId: number | string, activityId: number | string) => {
    return axiosInstance.get(`/submissions.json?q[checklist_id_is_not_null]=1&q[asset_id_eq]=${assetId}&q[activity_id_eq]=${activityId}`, {
      params: { token: getToken() },
    });
  },
};

// PPM Checklist Service
export const ppmChecklistService = {
  getPPMChecklists: async (page = 1, perPage = 10) => {
    return axiosInstance.get(`/checklists.json?q[ctype_eq]=ppm&per_page=${perPage}&page=${page}`, {
      params: { token: getToken() },
    });
  },
  getPPMChecklistById: async (id: number | string) => {
    return axiosInstance.get(`/checklists/${id}.json?q[ctype_eq]=ppm`, {
      params: { token: getToken() },
    });
  },
};

// PPM Activity Service
export const ppmActivityService = {
  getPPMActivities: async (page = 1, perPage = 10) => {
    return axiosInstance.get(`/activities.json?q[checklist_ctype_eq]=ppm&per_page=${perPage}&page=${page}`, {
      params: { token: getToken() },
    });
  },
  getPPMActivityByAsset: async (assetId: number | string) => {
    return axiosInstance.get(`/site_assets/${assetId}/asset_ppm_show.json?q[checklist_id_is_not_null]=1`, {
      params: { token: getToken() },
    });
  },
};

// Stock Items Service
export const stockItemService = {
  getStockItems: async (page = 1, perPage = 10) => {
    return axiosInstance.get(`/items.json?per_page=${perPage}&page=${page}`, {
      params: { token: getToken() },
    });
  },
  getStockItemById: async (id: number | string) => {
    return axiosInstance.get(`/items/${id}.json`, {
      params: { token: getToken() },
    });
  },
  createStockItem: async (data: Partial<StockItem>) => {
    return axiosInstance.post('/items.json', data, {
      params: { token: getToken() },
    });
  },
  updateStockItem: async (id: number | string, data: Partial<StockItem>) => {
    return axiosInstance.put(`/items/${id}.json`, data, {
      params: { token: getToken() },
    });
  },
  getStockGroups: async () => {
    return axiosInstance.get('/asset_groups.json?q[group_for_eq]=item', {
      params: { token: getToken() },
    });
  },
};

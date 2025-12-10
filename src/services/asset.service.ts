import axiosInstance from '../api/axiosInstance';
import { getItemInLocalStorage } from '../utils/localStorage';

const getToken = () => getItemInLocalStorage<string>('TOKEN');

export interface Asset {
  id: number | string;
  name: string;
  asset_number?: string;
  serial_number?: string;
  model_number?: string;
  oem_name?: string;
  building_name?: string;
  floor_name?: string;
  unit_name?: string;
  site_name?: string;
  status?: string;
  purchase_date?: string;
  purchase_cost?: number;
  warranty_start?: string;
  warranty_expiry?: string;
  created_at?: string;
  updated_at?: string;
  asset_group?: { name?: string };
  sub_group?: { name?: string };
}

export interface AssetFilters {
  search?: string;
  status?: string;
  building?: string;
  site_id?: number;
}

export const assetService = {
  getAssets: async (page = 1, perPage = 10, filters: AssetFilters = {}) => {
    let url = `/site_assets.json?per_page=${perPage}&page=${page}`;
    if (filters.search) {
      url = `/site_assets.json?q[oem_name_or_name_or_building_name_or_unit_name_cont]=${filters.search}&per_page=${perPage}&page=${page}`;
    }
    return axiosInstance.get(url, { params: { token: getToken() } });
  },

  getAssetById: async (id: number | string) => {
    return axiosInstance.get(`/site_assets/${id}.json`, {
      params: { token: getToken() },
    });
  },

  createAsset: async (data: FormData) => {
    return axiosInstance.post('/site_assets.json', data, {
      params: { token: getToken() },
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  updateAsset: async (id: number | string, data: FormData) => {
    return axiosInstance.put(`/site_assets/${id}.json`, data, {
      params: { token: getToken() },
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  downloadQrCodes: async (ids: string[]) => {
    return axiosInstance.get(`/site_assets/print_qr_codes?asset_ids=${ids.join(',')}`, {
      responseType: 'blob',
      params: { token: getToken() },
    });
  },

  getAssetGroups: async () => {
    return axiosInstance.get('/asset_groups.json?q[group_for_eq]=asset', {
      params: { token: getToken() },
    });
  },

  getSubGroups: async (groupId?: number) => {
    const params: Record<string, unknown> = { token: getToken() };
    if (groupId) params.group_id = groupId;
    return axiosInstance.get('/sub_groups.json', { params });
  },
};

export default assetService;

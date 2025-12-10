import axiosInstance from '../api/axiosInstance';
import { getItemInLocalStorage } from '../utils/localStorage';

const getToken = () => getItemInLocalStorage<string>('TOKEN');

export interface SoftService {
  id: number | string;
  name: string;
  description?: string;
  service_type?: string;
  building_name?: string;
  floor_name?: string;
  unit_name?: string;
  site_name?: string;
  status?: string;
  frequency?: string;
  assigned_to?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SoftServiceFilters {
  search?: string;
  status?: string;
  service_type?: string;
}

export const softServiceService = {
  getServices: async (page = 1, perPage = 10) => {
    return axiosInstance.get(`/soft_services.json?per_page=${perPage}&page=${page}`, {
      params: { token: getToken() },
    });
  },

  getServiceById: async (id: number | string) => {
    return axiosInstance.get(`/soft_services/${id}.json`, {
      params: { token: getToken() },
    });
  },

  createService: async (data: Partial<SoftService>) => {
    return axiosInstance.post('/soft_services.json', data, {
      params: { token: getToken() },
    });
  },

  updateService: async (id: number | string, data: Partial<SoftService>) => {
    return axiosInstance.put(`/soft_services/${id}.json`, data, {
      params: { token: getToken() },
    });
  },

  getServiceSchedule: async (id: number | string) => {
    return axiosInstance.get(`/soft_services/${id}/softservices_log_show.json`, {
      params: { token: getToken() },
    });
  },

  getRoutineList: async (page = 1, perPage = 10, startDate?: string, endDate?: string) => {
    let url = `/activities.json?q[soft_service_id_null]=0&per_page=${perPage}&page=${page}`;
    if (startDate) url += `&q[start_time_gteq]=${startDate}`;
    if (endDate) url += `&q[start_time_lteq]=${endDate}`;
    return axiosInstance.get(url, { params: { token: getToken() } });
  },

  downloadQrCodes: async (ids: string[]) => {
    return axiosInstance.get(`/soft_services/print_qr_codes?soft_service_ids=${ids.join(',')}`, {
      responseType: 'blob',
      params: { token: getToken() },
    });
  },
};

export default softServiceService;

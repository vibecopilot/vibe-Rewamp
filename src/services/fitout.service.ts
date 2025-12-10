import axiosInstance from '../api/axiosInstance';
import { getItemInLocalStorage } from '../utils/localStorage';

const getToken = () => getItemInLocalStorage<string>('TOKEN');

export interface FitoutRequest {
  id: number | string;
  request_number?: string;
  title?: string;
  description?: string;
  status?: string;
  unit_name?: string;
  building_name?: string;
  floor_name?: string;
  requester_name?: string;
  start_date?: string;
  end_date?: string;
  created_at?: string;
  updated_at?: string;
  fitout_status?: { name?: string };
}

export interface FitoutFilters {
  status?: string;
  search?: string;
}

export const fitoutService = {
  getRequests: async (page = 1, perPage = 10) => {
    return axiosInstance.get('/fitout_request.json', {
      params: { token: getToken(), page, per_page: perPage },
    });
  },

  getRequestById: async (id: number | string) => {
    return axiosInstance.get(`/fitout_request/${id}.json`, {
      params: { token: getToken() },
    });
  },

  createRequest: async (data: Partial<FitoutRequest>) => {
    return axiosInstance.post('/fitout_request.json', data, {
      params: { token: getToken() },
    });
  },

  updateRequest: async (id: number | string, data: Partial<FitoutRequest>) => {
    return axiosInstance.put(`/fitout_request/${id}.json`, data, {
      params: { token: getToken() },
    });
  },

  getCategories: async () => {
    return axiosInstance.get('/fit_out_setup_categories.json', {
      params: { token: getToken() },
    });
  },

  getStatuses: async () => {
    return axiosInstance.get('/fitout_statuses.json', {
      params: { token: getToken() },
    });
  },

  getDocuments: async () => {
    return axiosInstance.get('/fitout_documents.json', {
      params: { token: getToken() },
    });
  },

  uploadDocument: async (data: FormData) => {
    return axiosInstance.post('/fitout_documents.json', data, {
      params: { token: getToken() },
    });
  },

  getChecklists: async () => {
    return axiosInstance.get('/snag_checklists.json', {
      params: { token: getToken() },
    });
  },
};

export default fitoutService;

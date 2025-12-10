import axiosInstance from '../api/axiosInstance';
import { getItemInLocalStorage } from '../utils/localStorage';

const getToken = () => getItemInLocalStorage<string>('TOKEN');

export interface Ticket {
  id: number | string;
  ticket_number?: string;
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  category?: string;
  sub_category?: string;
  assigned_to?: string;
  reporter_name?: string;
  reporter_email?: string;
  building_name?: string;
  floor_name?: string;
  unit_name?: string;
  created_at?: string;
  updated_at?: string;
  due_date?: string;
  resolved_at?: string;
  complaint_status?: { name?: string };
  helpdesk_category?: { name?: string };
}

export interface TicketFilters {
  search?: string;
  status?: string;
  priority?: string;
  category_id?: number;
}

export const serviceDeskService = {
  getTickets: async (page = 1, perPage = 10, filters: TicketFilters = {}) => {
    const params: Record<string, unknown> = {
      token: getToken(),
      page,
      per_page: perPage,
    };
    if (filters.status) params['q[complaint_status_name_eq]'] = filters.status;
    if (filters.priority) params['q[priority_eq]'] = filters.priority;
    return axiosInstance.get('/pms/admin/complaints.json', { params });
  },

  getTicketById: async (id: number | string) => {
    return axiosInstance.get(`/pms/complaints/${id}.json`, {
      params: { token: getToken() },
    });
  },

  createTicket: async (data: FormData) => {
    return axiosInstance.post(`/pms/complaints.json?token=${getToken()}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  updateTicket: async (id: number | string, data: Partial<Ticket>) => {
    return axiosInstance.put(`/pms/complaints/${id}.json`, data, {
      params: { token: getToken() },
    });
  },

  addComment: async (data: { complaint_id: number; comment: string }) => {
    return axiosInstance.post('/complaint_logs.json', data, {
      params: { token: getToken() },
    });
  },

  getCategories: async () => {
    return axiosInstance.get('/pms/admin/helpdesk_categories.json', {
      params: { token: getToken() },
    });
  },

  getStatuses: async () => {
    return axiosInstance.get('/pms/admin/helpdesk_categories/complaint_statuses.json', {
      params: { token: getToken() },
    });
  },

  getDashboard: async () => {
    return axiosInstance.get('/pms/admin/complaints/complaints_dashboard.json', {
      params: { token: getToken() },
    });
  },

  exportTickets: async (statusFilter?: string) => {
    const params: Record<string, unknown> = { token: getToken() };
    if (statusFilter) params['q[complaint_status_name_eq]'] = statusFilter;
    return axiosInstance.get('/pms/admin/complaints/export_complaints.xlsx', {
      params,
      responseType: 'blob',
    });
  },
};

export default serviceDeskService;

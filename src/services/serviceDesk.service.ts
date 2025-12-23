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
  getTickets: async (page = 1, perPage = 10, filters: TicketFilters & {
    building_name?: string;
    floor_name?: string;
    unit_name?: string;
    assigned_to?: string;
    date_start?: string;
    date_end?: string;
    category?: string;
  } = {}) => {
    const params: Record<string, unknown> = {
      token: getToken(),
      page,
      per_page: perPage,
    };

    // Status / priority (already had)
    if (filters.status)
      params['q[complaint_status_name_eq]'] = filters.status;
    if (filters.priority)
      params['q[priority_eq]'] = filters.priority;

    // Building / floor / unit (map to your column names)
    if (filters.building_name)
      params['q[building_name_eq]'] = filters.building_name;
    if (filters.floor_name)
      params['q[floor_name_eq]'] = filters.floor_name;
    if (filters.unit_name)
      params['q[unit_name_eq]'] = filters.unit_name;

    // Category (category_type in your JSON)
    if (filters.category)
      params['q[category_type_eq]'] = filters.category;

    // Assigned to
    if (filters.assigned_to)
      params['q[assigned_to_eq]'] = filters.assigned_to;

    // Date range on created_at
    if (filters.date_start)
      params['q[created_at_gteq]'] = filters.date_start;
    if (filters.date_end)
      params['q[created_at_lteq]'] = filters.date_end;

    // Optional: text search from searchValue if you want
    if (filters.search)
      params['q[search_text_cont]'] = filters.search;

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

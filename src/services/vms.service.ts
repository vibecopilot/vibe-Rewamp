import axiosInstance from '../api/axiosInstance';
import { getItemInLocalStorage } from '../utils/localStorage';

const getToken = () => getItemInLocalStorage<string>('TOKEN');

// Types
export interface Visitor {
  id: number | string;
  name: string;
  contact_no: string;
  email?: string;
  company_name?: string;
  purpose?: string;
  host?: {
    user?: {
      firstname?: string;
      lastname?: string;
    };
  };
  expected_date?: string;
  expected_time?: string;
  check_in_time?: string;
  check_out_time?: string;
  visitor_in_out?: 'in' | 'out' | 'expected';
  user_type?: string;
  status?: string;
  site_name?: string;
  building_name?: string;
  unit_name?: string;
  photo_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface VisitorFilters {
  visitorInOut?: 'in' | 'out' | 'expected';
  userType?: string;
  userTypeNotEq?: string;
  dateFrom?: string;
  dateTo?: string;
  mobile?: string;
  host?: string;
  search?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface VisitorCategory {
  id: number;
  name: string;
  description?: string;
}

// VMS Service
export const vmsService = {
  // Get visitor list with pagination and filters
  getVisitors: async (page = 1, perPage = 10, filters: VisitorFilters = {}) => {
    const params: Record<string, unknown> = {
      token: getToken(),
      page,
      per_page: perPage,
    };

    if (filters.visitorInOut) {
      params['q[visitor_in_out_eq]'] = filters.visitorInOut;
    }
    if (filters.userType) {
      params['q[user_type_eq]'] = filters.userType;
    }
    if (filters.userTypeNotEq) {
      params['q[user_type_not_eq]'] = filters.userTypeNotEq;
    }
    if (filters.dateFrom) {
      params['q[expected_date_gteq]'] = filters.dateFrom;
    }
    if (filters.dateTo) {
      params['q[expected_date_lteq]'] = filters.dateTo;
    }
    if (filters.mobile) {
      params['q[contact_no_cont]'] = filters.mobile;
    }
    if (filters.host) {
      params['q[host_user_firstname_or_host_user_lastname_cont]'] = filters.host;
    }
    if (filters.search) {
      params['q[name_or_contact_no_or_company_name_cont]'] = filters.search;
    }

    return axiosInstance.get('/visitors.json', { params });
  },

  // Get single visitor details
  getVisitorById: async (id: number | string) => {
    return axiosInstance.get(`/visitors/${id}.json`, {
      params: { token: getToken() },
    });
  },

  // Create new visitor
  createVisitor: async (data: Partial<Visitor>) => {
    return axiosInstance.post('/visitors.json', data, {
      params: { token: getToken() },
      headers: {
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
        Expires: '0',
      },
    });
  },

  // Update visitor
  updateVisitor: async (id: number | string, data: Partial<Visitor>) => {
    return axiosInstance.put(`/visitors/${id}.json`, data, {
      params: { token: getToken() },
    });
  },

  // Check-in/Check-out visitor
  checkInOut: async (visitorId: number | string, data: { action: 'check_in' | 'check_out' }) => {
    return axiosInstance.post(
      `/visitors/${visitorId}/visitor_visits/check_visitor.json`,
      data,
      { params: { token: getToken() } }
    );
  },

  // Get visitor approvals
  getApprovals: async (page = 1, perPage = 10) => {
    return axiosInstance.get('/visitors/approval_form.json', {
      params: {
        token: getToken(),
        page,
        per_page: perPage,
      },
    });
  },

  // Approve/Reject visitor
  approveVisitor: async (id: number | string, data: { status: 'approved' | 'rejected'; remarks?: string }) => {
    return axiosInstance.patch(`/visitors/${id}/approve_visitor.json`, data, {
      params: { token: getToken() },
    });
  },

  // Get visitor history
  getHistory: async (page = 1, perPage = 10) => {
    return axiosInstance.get('/visitors/approval_history.json', {
      params: {
        token: getToken(),
        page,
        per_page: perPage,
      },
    });
  },

  // Get visitor device logs
  getDeviceLogs: async (page = 1, perPage = 10) => {
    return axiosInstance.get('/visitor_device_logs.json', {
      params: {
        token: getToken(),
        page,
        per_page: perPage,
      },
    });
  },

  // Get visitor categories
  getCategories: async () => {
    return axiosInstance.get('/visitor_staff_category.json', {
      params: { token: getToken() },
    });
  },

  // Get hosts for a site
  getHosts: async (siteId: number | string) => {
    return axiosInstance.get(`/visitors/fetch_potential_hosts.json?site_id=${siteId}`, {
      params: { token: getToken() },
    });
  },

  // Verify OTP
  verifyOtp: async (data: { mobile: string; otp: string }) => {
    return axiosInstance.post('/visitors/verify_votp.json', data, {
      params: { token: getToken() },
    });
  },

  // Get visitor by mobile
  getByMobile: async (mobile: string) => {
    return axiosInstance.get(`/visitors/get_visitor.json?mobile=${mobile}`, {
      params: { token: getToken() },
    });
  },
};

export default vmsService;

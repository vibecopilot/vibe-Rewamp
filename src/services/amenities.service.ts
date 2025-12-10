import axiosInstance from '../api/axiosInstance';
import { getItemInLocalStorage } from '../utils/localStorage';

const getToken = () => getItemInLocalStorage<string>('TOKEN');

export interface Amenity {
  id: number | string;
  name: string;
  description?: string;
  capacity?: number;
  building_name?: string;
  floor_name?: string;
  status?: string;
  amenity_type?: string;
  price?: number;
  image_url?: string;
  created_at?: string;
}

export interface AmenityBooking {
  id: number | string;
  amenity_id: number;
  amenity_name?: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  status?: string;
  booked_by?: string;
  purpose?: string;
  created_at?: string;
}

export interface BookingFilters {
  date?: string;
  status?: string;
  amenity_id?: number;
}

export const amenitiesService = {
  getAmenities: async () => {
    return axiosInstance.get('/amenities.json', {
      params: { token: getToken() },
      headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache', Expires: '0' },
    });
  },

  getAmenityById: async (id: number | string) => {
    return axiosInstance.get(`/amenities/${id}.json`, {
      params: { token: getToken() },
    });
  },

  getBookings: async (page = 1, perPage = 10) => {
    return axiosInstance.get(`/amenity_bookings.json?per_page=${perPage}&page=${page}`, {
      params: { token: getToken() },
    });
  },

  getBookingById: async (id: number | string) => {
    return axiosInstance.get(`/amenity_bookings/${id}.json`, {
      params: { token: getToken() },
    });
  },

  createBooking: async (data: Partial<AmenityBooking>) => {
    return axiosInstance.post('/amenity_bookings.json', data, {
      params: { token: getToken() },
    });
  },

  getAvailableSlots: async (amenityId: number | string, date: string) => {
    return axiosInstance.get('/slots/available.json', {
      params: {
        token: getToken(),
        amenity_id: amenityId,
        date: date,
      },
    });
  },

  cancelBooking: async (id: number | string) => {
    return axiosInstance.patch(`/amenity_bookings/${id}/cancel.json`, {}, {
      params: { token: getToken() },
    });
  },
};

export default amenitiesService;

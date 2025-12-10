import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import {
  serviceBookingService,
  serviceCategoryService,
} from "./additionalServices";
import Osr from "./Osr";
import Loading from "../../utils/Loading";

const OSRDashboard = () => {
  const [stats, setStats] = useState({
    totalCategories: 0,
    totalServices: 0,
    totalBookings: 0,
    myBookings: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    completedBookings: 0,
    cancelledBookings: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentBookings, setRecentBookings] = useState([]);
  console.log("recent booking", recentBookings);
  const [availableCategories, setAvailableCategories] = useState([]);

  // In a real app, this would come from auth context
  const currentUserId = 1;

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      const [categoriesRes, userBookingsRes] = await Promise.all([
        serviceCategoryService.getAll(),
        serviceBookingService.getUserBookings(currentUserId),
      ]);

      // Handle categories data - remove the filter that was hiding categories
      const categories = categoriesRes.data || [];
      console.log("All categories received:", categories);

      const userBookings = userBookingsRes.data || [];
      console.log("User bookings received:", userBookings);

      // Try to get all bookings for admin view (fallback to user bookings if not available)
      let allSystemBookings = userBookings;
      try {
        const allBookingsRes = await serviceBookingService.getAll();
        allSystemBookings = allBookingsRes.data || [];
        console.log("All system bookings received:", allSystemBookings);
      } catch (error) {
        console.log("Admin data not available, using user data only");
      }

      // Calculate comprehensive stats
      const pendingCount = allSystemBookings.filter(
        (b) => b.status === "pending"
      ).length;
      const confirmedCount = allSystemBookings.filter(
        (b) => b.status === "confirmed"
      ).length;
      const completedCount = allSystemBookings.filter(
        (b) => b.status === "completed"
      ).length;
      const cancelledCount = allSystemBookings.filter(
        (b) => b.status === "cancelled"
      ).length;

      // Calculate revenue
      const totalRevenue = allSystemBookings
        .filter((b) => b.status === "completed")
        .reduce(
          (sum, booking) => sum + (parseFloat(booking.total_price) || 0),
          0
        );

      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const monthlyRevenue = allSystemBookings
        .filter((b) => {
          const bookingDate = new Date(b.created_at);
          return (
            bookingDate.getMonth() === currentMonth &&
            bookingDate.getFullYear() === currentYear &&
            b.status === "completed"
          );
        })
        .reduce(
          (sum, booking) => sum + (parseFloat(booking.total_price) || 0),
          0
        );

      setStats({
        totalCategories: categories.length,
        totalServices: categories.reduce(
          (sum, cat) => sum + (cat.subcategories?.length || 0),
          0
        ),
        totalBookings: allSystemBookings.length,
        myBookings: userBookings.length,
        pendingBookings: pendingCount,
        confirmedBookings: confirmedCount,
        completedBookings: completedCount,
        cancelledBookings: cancelledCount,
        totalRevenue: totalRevenue,
        monthlyRevenue: monthlyRevenue,
      });

      // Show all categories, not just active ones
      setAvailableCategories(categories);

      // Get recent bookings (last 10 from all system bookings)
      const recent = allSystemBookings
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 10);
      setRecentBookings(recent);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return <Loading message="Loading dashboard..." />;
  }

  return (
    <div className="flex h-screen">
      <Osr />
      <div className="flex-1 bg-gray-50 p-6 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-gray-800">
            OSR Management Dashboard
          </h1>
          <p className="text-gray-600 mb-6">
            Complete overview of Office Service Requests - Admin & Resident data
          </p>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-3xl font-bold text-blue-600">
                {stats.totalCategories}
              </h3>
              <p className="text-gray-600">Service Categories</p>
              <Link
                to="/ors-setups"
                className="text-blue-500 hover:text-blue-700 text-sm"
              >
                Manage →
              </Link>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-3xl font-bold text-green-600">
                {stats.totalBookings}
              </h3>
              <p className="text-gray-600">Total Bookings</p>
              <Link
                to="/admin/bookings"
                className="text-green-500 hover:text-green-700 text-sm"
              >
                View All →
              </Link>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-3xl font-bold text-yellow-600">
                {stats.pendingBookings}
              </h3>
              <p className="text-gray-600">Pending Requests</p>
              <Link
                to="/admin/bookings?status=pending"
                className="text-yellow-500 hover:text-yellow-700 text-sm"
              >
                Review →
              </Link>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-3xl font-bold text-purple-600">
                ₹{stats.monthlyRevenue.toLocaleString()}
              </h3>
              <p className="text-gray-600">Monthly Revenue</p>
              <Link
                to="/admin/bookings?status=completed"
                className="text-purple-500 hover:text-purple-700 text-sm"
              >
                Details →
              </Link>
            </div>
          </div>

          {/* Secondary Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <h4 className="text-xl font-semibold text-blue-600">
                {stats.confirmedBookings}
              </h4>
              <p className="text-gray-600 text-sm">Confirmed</p>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <h4 className="text-xl font-semibold text-green-600">
                {stats.completedBookings}
              </h4>
              <p className="text-gray-600 text-sm">Completed</p>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <h4 className="text-xl font-semibold text-red-600">
                {stats.cancelledBookings}
              </h4>
              <p className="text-gray-600 text-sm">Cancelled</p>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <h4 className="text-xl font-semibold text-indigo-600">
                ₹{stats.totalRevenue.toLocaleString()}
              </h4>
              <p className="text-gray-600 text-sm">Total Revenue</p>
            </div>
          </div>

          {/* Available Service Categories */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">
              Available Service Categories
            </h2>
            {availableCategories.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableCategories.map((category) => (
                  <div
                    key={category.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      {category.icon && (
                        <span className="text-2xl">{category.icon}</span>
                      )}
                      <h3 className="font-semibold text-gray-800">
                        {category.name}
                      </h3>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          category.status === "ACTIVE" || category.is_active
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {category.status ||
                          (category.is_active ? "ACTIVE" : "INACTIVE")}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-3">
                      {category.description || "No description provided"}
                    </p>
                    <div className="text-sm text-gray-500 mb-3">
                      Created:{" "}
                      {category.created_at
                        ? new Date(category.created_at).toLocaleDateString()
                        : "N/A"}
                    </div>
                    <div className="flex gap-2">
                      <Link
                        to="/ors-setups"
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                      >
                        Manage
                      </Link>
                      <Link
                        to="/admin/bookings"
                        className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm"
                      >
                        View Bookings
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">
                  No service categories available at the moment.
                </p>
                <Link
                  to="/ors-setups"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Setup Services
                </Link>
              </div>
            )}
          </div>

          {/* Recent Bookings */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Recent Bookings</h2>
              <Link
                to="/admin/bookings"
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
              >
                View All Bookings
              </Link>
            </div>

            {recentBookings.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full table-auto">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-2 text-left">ID</th>
                      <th className="px-4 py-2 text-left">Service</th>
                      <th className="px-4 py-2 text-left">Customer</th>
                      <th className="px-4 py-2 text-left">Date</th>
                      <th className="px-4 py-2 text-left">Status</th>
                      <th className="px-4 py-2 text-left">Amount</th>
                      <th className="px-4 py-2 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentBookings.map((booking) => (
                      <tr
                        key={booking.id}
                        className="border-b hover:bg-gray-50"
                      >
                        <td className="px-4 py-2">#{booking.id}</td>
                        <td className="px-4 py-2">
                          {booking.service_subcategory?.name ||
                            booking.service_name ||
                            "N/A"}
                        </td>
                        <td className="px-4 py-2">
                          {booking.user?.name ||
                            booking.customer_name ||
                            booking.user_name ||
                            "N/A"}
                        </td>
                        <td className="px-4 py-2">
                          {booking.booking_date
                            ? new Date(
                                booking.booking_date
                              ).toLocaleDateString()
                            : booking.created_at
                            ? new Date(booking.created_at).toLocaleDateString()
                            : "N/A"}
                        </td>
                        <td className="px-4 py-2">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(
                              booking.status
                            )}`}
                          >
                            {(booking.status || "unknown").toUpperCase()}
                          </span>
                        </td>
                        <td className="px-4 py-2">
                          ₹
                          {booking.total_amount
                            ? parseFloat(booking.total_amount).toLocaleString(
                                "en-IN",
                                {
                                  minimumFractionDigits: 0,
                                  maximumFractionDigits: 2,
                                }
                              )
                            : "0"}
                        </td>
                        <td className="px-4 py-2">
                          <Link
                            to={`/admin/bookings`}
                            className="text-blue-500 hover:text-blue-700 text-sm"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No recent bookings found.</p>
                <Link
                  to="/ors-setups"
                  className="text-blue-500 hover:text-blue-700"
                >
                  Setup services to get started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OSRDashboard;

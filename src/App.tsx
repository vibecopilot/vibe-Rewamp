import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// Layout
import AppHeader from "./components/layout/AppHeader";

// Pages
import Dashboard from "./pages/Dashboard/Dashboard";
import { VisitorList, CreateVisitor, ViewVisitor } from "./pages/VMS";
import AssetList from "./pages/Asset/AssetList";
import TicketList from "./pages/ServiceDesk/TicketList";
import SoftServiceList from "./pages/SoftService/SoftServiceList";
import AmenitiesBookingList from "./pages/Amenities/AmenitiesBookingList";
import FitoutList from "./pages/Fitout/FitoutList";

// Placeholder pages for other modules
const PlaceholderPage: React.FC<{ title: string }> = ({ title }) => (
  <div className="p-6">
    <h1 className="text-2xl font-bold text-foreground mb-4">{title}</h1>
    <p className="text-muted-foreground">This module is under development.</p>
  </div>
);

function App() {
  return (
    <div className="min-h-screen bg-background">
      <Toaster position="top-right" />
      <AppHeader />
      
      <main>
        <Routes>
          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* Dashboard */}
          <Route path="/dashboard" element={<Dashboard />} />

          {/* VMS - Visitor Management */}
          <Route path="/vms" element={<Navigate to="/vms/visitors" replace />} />
          <Route path="/vms/visitors" element={<VisitorList />} />
          <Route path="/vms/visitors/create" element={<CreateVisitor />} />
          <Route path="/vms/visitors/:id" element={<ViewVisitor />} />
          <Route path="/vms/visitors/:id/edit" element={<CreateVisitor />} />
          <Route path="/vms/pre-approved" element={<PlaceholderPage title="Pre-Approved Visitors" />} />
          <Route path="/vms/blacklist" element={<PlaceholderPage title="Blacklist" />} />
          <Route path="/vms/reports" element={<PlaceholderPage title="VMS Reports" />} />
          <Route path="/vms/configuration" element={<PlaceholderPage title="VMS Configuration" />} />

          {/* Asset Module */}
          <Route path="/asset" element={<AssetList />} />
          <Route path="/asset/create" element={<PlaceholderPage title="Create Asset" />} />
          <Route path="/asset/:id" element={<PlaceholderPage title="Asset Details" />} />
          <Route path="/asset/:id/edit" element={<PlaceholderPage title="Edit Asset" />} />
          <Route path="/asset/amc" element={<AssetList />} />
          <Route path="/asset/amc/create" element={<PlaceholderPage title="Create AMC" />} />
          <Route path="/asset/amc/:id" element={<PlaceholderPage title="AMC Details" />} />
          <Route path="/asset/amc/:id/edit" element={<PlaceholderPage title="Edit AMC" />} />
          <Route path="/asset/meter" element={<AssetList />} />
          <Route path="/asset/meter/create" element={<PlaceholderPage title="Create Meter" />} />
          <Route path="/asset/meter/:id" element={<PlaceholderPage title="Meter Details" />} />
          <Route path="/asset/meter/:id/edit" element={<PlaceholderPage title="Edit Meter" />} />
          <Route path="/asset/checklist" element={<AssetList />} />
          <Route path="/asset/checklist/create" element={<PlaceholderPage title="Create Checklist" />} />
          <Route path="/asset/checklist/:id" element={<PlaceholderPage title="Checklist Details" />} />
          <Route path="/asset/checklist/:id/edit" element={<PlaceholderPage title="Edit Checklist" />} />
          <Route path="/asset/routine-task" element={<AssetList />} />
          <Route path="/asset/routine-task/create" element={<PlaceholderPage title="Create Routine Task" />} />
          <Route path="/asset/routine-task/:id" element={<PlaceholderPage title="Routine Task Details" />} />
          <Route path="/asset/routine-task/:id/edit" element={<PlaceholderPage title="Edit Routine Task" />} />
          <Route path="/asset/ppm-checklist" element={<AssetList />} />
          <Route path="/asset/ppm-checklist/create" element={<PlaceholderPage title="Create PPM Checklist" />} />
          <Route path="/asset/ppm-checklist/:id" element={<PlaceholderPage title="PPM Checklist Details" />} />
          <Route path="/asset/ppm-checklist/:id/edit" element={<PlaceholderPage title="Edit PPM Checklist" />} />
          <Route path="/asset/ppm-activity" element={<AssetList />} />
          <Route path="/asset/ppm-activity/create" element={<PlaceholderPage title="Create PPM Activity" />} />
          <Route path="/asset/ppm-activity/:id" element={<PlaceholderPage title="PPM Activity Details" />} />
          <Route path="/asset/ppm-activity/:id/edit" element={<PlaceholderPage title="Edit PPM Activity" />} />
          <Route path="/asset/ppm-calendar" element={<AssetList />} />
          <Route path="/asset/stock-items" element={<AssetList />} />
          <Route path="/asset/stock-items/create" element={<PlaceholderPage title="Create Stock Item" />} />
          <Route path="/asset/stock-items/:id" element={<PlaceholderPage title="Stock Item Details" />} />
          <Route path="/asset/stock-items/:id/edit" element={<PlaceholderPage title="Edit Stock Item" />} />

          {/* Soft Services */}
          <Route path="/soft-services" element={<SoftServiceList />} />
          <Route path="/soft-service" element={<Navigate to="/soft-services" replace />} />
          <Route path="/soft-service/create" element={<PlaceholderPage title="Create Service" />} />
          <Route path="/soft-service/:id" element={<PlaceholderPage title="Service Details" />} />
          <Route path="/soft-service/:id/edit" element={<PlaceholderPage title="Edit Service" />} />

          {/* Service Desk */}
          <Route path="/service-desk" element={<TicketList />} />
          <Route path="/service-desk/create" element={<PlaceholderPage title="Create Ticket" />} />
          <Route path="/service-desk/:id" element={<PlaceholderPage title="Ticket Details" />} />
          <Route path="/service-desk/:id/edit" element={<PlaceholderPage title="Edit Ticket" />} />

          {/* Incident Management */}
          <Route path="/incident" element={<PlaceholderPage title="Incident Management" />} />
          <Route path="/incident/create" element={<PlaceholderPage title="Create Incident" />} />
          <Route path="/incident/:id" element={<PlaceholderPage title="Incident Details" />} />

          {/* Amenities Booking */}
          <Route path="/amenities" element={<AmenitiesBookingList />} />
          <Route path="/amenities/book" element={<PlaceholderPage title="Book Amenity" />} />
          <Route path="/amenities/bookings/:id" element={<PlaceholderPage title="Booking Details" />} />

          {/* Space Booking */}
          <Route path="/space-booking" element={<PlaceholderPage title="Space Booking" />} />
          <Route path="/space-booking/book" element={<PlaceholderPage title="Book Space" />} />

          {/* F&B */}
          <Route path="/fb" element={<PlaceholderPage title="F&B" />} />
          <Route path="/fb/order" element={<PlaceholderPage title="Place Order" />} />

          {/* Documents */}
          <Route path="/documents" element={<PlaceholderPage title="Documents" />} />
          <Route path="/documents/upload" element={<PlaceholderPage title="Upload Document" />} />

          {/* Fitout */}
          <Route path="/fitout" element={<FitoutList />} />
          <Route path="/fitout/create" element={<PlaceholderPage title="Create Fitout Request" />} />
          <Route path="/fitout/:id" element={<PlaceholderPage title="Fitout Details" />} />
          <Route path="/fitout/:id/edit" element={<PlaceholderPage title="Edit Fitout Request" />} />

          {/* Calendar */}
          <Route path="/calendar" element={<PlaceholderPage title="Calendar" />} />

          {/* Catch all - redirect to dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;

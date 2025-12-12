// App.tsx - Main routing configuration
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import AppHeader from "./components/layout/AppHeader";

// Auth
import Login from "./components/Authentication/Login";

// Pages
import Dashboard from "./pages/Dashboard/Dashboard";
import { 
  VMSLayout, 
  VMSVisitors, 
  VMSRegisteredVehicles, 
  VMSStaff, 
  VMSPatrolling, 
  VMSGoodsInOut,
  CreateVisitor, 
  ViewVisitor,
  StaffCreate,
  GoodsCreate,
  VehicleCreate
} from "./pages/VMS";
import {
  FBLayout,
  RestaurantManagement,
  PantryManagement,
  CreateRestaurant,
  CreatePantry,
  ViewPantry,
  EditPantry
} from "./pages/FoodsBeverage";
import AssetList from "./pages/Asset/AssetList";
import CreateAsset from "./pages/Asset/CreateAsset";
import CreateAMC from "./pages/Asset/CreateAMC";
import CreateChecklist from "./pages/Asset/CreateChecklist";
import CreatePPMActivity from "./pages/Asset/CreatePPMActivity";
import TicketList from "./pages/ServiceDesk/TicketList";
import TicketCreate from "./pages/ServiceDesk/TicketCreate";
import TicketView from "./pages/ServiceDesk/TicketView";
import TicketEdit from "./pages/ServiceDesk/TicketEdit";
import { ServiceList, CreateService, ViewService, ChecklistList, CreateChecklist as SoftServiceCreateChecklist, ViewChecklist, TaskList } from "./pages/SoftService";
import {
  AmenitiesList,
  HotelBookingsList,
  BookAmenity,
  BookHotel
} from "./pages/Amenities";
import { SpaceBookingsList, BookSpace } from "./pages/SpaceBooking";
import FitoutList from "./pages/Fitout/FitoutList";
import { DocumentsList } from "./pages/Documents";
import { IncidentList, CreateIncident, ViewIncident } from "./pages/Incident";
import { CalendarPage, PlanMyCalendar } from "./pages/Calendar/index";
import { MailRoomLayout, DeliveryVendorList, CreateVendor, ViewVendor, InboundList, CreateInboundPackage, ViewInbound, OutboundList, CreateOutboundPackage, ViewOutbound } from "./pages/MailRoom/index";
import { SupplierList, CreateSupplier, ViewSupplier } from "./pages/Supplier";
import { AuditLayout, OperationalScheduled, OperationalConducted, OperationalChecklists, VendorScheduled, VendorConducted, ScheduleAuditForm, ChecklistAuditForm } from "./pages/Audit";
// Placeholder pages for other modules
const PlaceholderPage: React.FC<{ title: string }> = ({ title }) => (
  <div className="p-6">
    <h1 className="text-2xl font-bold text-foreground mb-4">{title}</h1>
    <p className="text-muted-foreground">This module is under development.</p>
  </div>
);

// Layout wrapper for authenticated pages
const AuthenticatedLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <>
    <AppHeader />
    <main>{children}</main>
  </>
);

function App() {
  return (
    <div className="min-h-screen bg-background">
      <Toaster position="top-right" />
      
      <Routes>
        {/* Login Route - No header */}
        <Route path="/login" element={<Login />} />
        
        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        {/* Dashboard */}
        <Route path="/dashboard" element={<AuthenticatedLayout><Dashboard /></AuthenticatedLayout>} />

        {/* VMS - Visitor Management with Tabbed Layout */}
        <Route path="/vms" element={<AuthenticatedLayout><VMSLayout /></AuthenticatedLayout>}>
          <Route index element={<Navigate to="/vms/visitors" replace />} />
          <Route path="visitors" element={<VMSVisitors />} />
          <Route path="registered-vehicles" element={<VMSRegisteredVehicles />} />
          <Route path="staff" element={<VMSStaff />} />
          <Route path="patrolling" element={<VMSPatrolling />} />
          <Route path="goods-in-out" element={<VMSGoodsInOut />} />
        </Route>
        
        {/* VMS Detail/Create/Edit routes - outside the tabbed layout */}
        <Route path="/vms/visitors/create" element={<AuthenticatedLayout><CreateVisitor /></AuthenticatedLayout>} />
        <Route path="/vms/visitors/:id" element={<AuthenticatedLayout><ViewVisitor /></AuthenticatedLayout>} />
        <Route path="/vms/visitors/:id/edit" element={<AuthenticatedLayout><CreateVisitor /></AuthenticatedLayout>} />
        <Route path="/vms/registered-vehicles/create" element={<AuthenticatedLayout><VehicleCreate /></AuthenticatedLayout>} />
        <Route path="/vms/registered-vehicles/:id" element={<AuthenticatedLayout><PlaceholderPage title="Vehicle Details" /></AuthenticatedLayout>} />
        <Route path="/vms/registered-vehicles/:id/edit" element={<AuthenticatedLayout><VehicleCreate /></AuthenticatedLayout>} />
        <Route path="/vms/staff/create" element={<AuthenticatedLayout><StaffCreate /></AuthenticatedLayout>} />
        <Route path="/vms/staff/:id" element={<AuthenticatedLayout><PlaceholderPage title="Staff Details" /></AuthenticatedLayout>} />
        <Route path="/vms/staff/:id/edit" element={<AuthenticatedLayout><StaffCreate /></AuthenticatedLayout>} />
        <Route path="/vms/patrolling/:id" element={<AuthenticatedLayout><PlaceholderPage title="Patrolling Details" /></AuthenticatedLayout>} />
        <Route path="/vms/patrolling/:id/edit" element={<AuthenticatedLayout><PlaceholderPage title="Edit Patrolling" /></AuthenticatedLayout>} />
        <Route path="/vms/goods-in-out/create" element={<AuthenticatedLayout><GoodsCreate /></AuthenticatedLayout>} />
        <Route path="/vms/goods-in-out/:id" element={<AuthenticatedLayout><PlaceholderPage title="Goods Details" /></AuthenticatedLayout>} />

        {/* Asset Module */}
        <Route path="/asset" element={<AuthenticatedLayout><AssetList /></AuthenticatedLayout>} />
        <Route path="/asset/create" element={<AuthenticatedLayout><CreateAsset /></AuthenticatedLayout>} />
        <Route path="/asset/:id" element={<AuthenticatedLayout><PlaceholderPage title="Asset Details" /></AuthenticatedLayout>} />
        <Route path="/asset/:id/edit" element={<AuthenticatedLayout><PlaceholderPage title="Edit Asset" /></AuthenticatedLayout>} />
        
        {/* AMC */}
        <Route path="/asset/amc" element={<AuthenticatedLayout><AssetList /></AuthenticatedLayout>} />
        <Route path="/asset/amc/create" element={<AuthenticatedLayout><CreateAMC /></AuthenticatedLayout>} />
        <Route path="/asset/amc/:id" element={<AuthenticatedLayout><PlaceholderPage title="AMC Details" /></AuthenticatedLayout>} />
        <Route path="/asset/amc/:id/edit" element={<AuthenticatedLayout><PlaceholderPage title="Edit AMC" /></AuthenticatedLayout>} />
        
        {/* Meter */}
        <Route path="/asset/meter" element={<AuthenticatedLayout><AssetList /></AuthenticatedLayout>} />
        <Route path="/asset/meter/:id" element={<AuthenticatedLayout><PlaceholderPage title="Meter Details" /></AuthenticatedLayout>} />
        <Route path="/asset/meter/:id/edit" element={<AuthenticatedLayout><PlaceholderPage title="Edit Meter" /></AuthenticatedLayout>} />
        
        {/* Checklist */}
        <Route path="/asset/checklist" element={<AuthenticatedLayout><AssetList /></AuthenticatedLayout>} />
        <Route path="/asset/checklist/create" element={<AuthenticatedLayout><CreateChecklist /></AuthenticatedLayout>} />
        <Route path="/asset/checklist/:id" element={<AuthenticatedLayout><PlaceholderPage title="Checklist Details" /></AuthenticatedLayout>} />
        <Route path="/asset/checklist/:id/edit" element={<AuthenticatedLayout><PlaceholderPage title="Edit Checklist" /></AuthenticatedLayout>} />
        
        {/* Routine Task */}
        <Route path="/asset/routine-task" element={<AuthenticatedLayout><AssetList /></AuthenticatedLayout>} />
        <Route path="/asset/routine-task/:id" element={<AuthenticatedLayout><PlaceholderPage title="Routine Task Details" /></AuthenticatedLayout>} />
        <Route path="/asset/routine-task/:id/edit" element={<AuthenticatedLayout><PlaceholderPage title="Edit Routine Task" /></AuthenticatedLayout>} />
        
        {/* PPM Checklist */}
        <Route path="/asset/ppm-checklist" element={<AuthenticatedLayout><AssetList /></AuthenticatedLayout>} />
        <Route path="/asset/ppm-checklist/:id" element={<AuthenticatedLayout><PlaceholderPage title="PPM Checklist Details" /></AuthenticatedLayout>} />
        <Route path="/asset/ppm-checklist/:id/edit" element={<AuthenticatedLayout><PlaceholderPage title="Edit PPM Checklist" /></AuthenticatedLayout>} />
        
        {/* PPM Activity */}
        <Route path="/asset/ppm-activity" element={<AuthenticatedLayout><AssetList /></AuthenticatedLayout>} />
        <Route path="/asset/ppm-activity/create" element={<AuthenticatedLayout><CreatePPMActivity /></AuthenticatedLayout>} />
        <Route path="/asset/ppm-activity/:id" element={<AuthenticatedLayout><PlaceholderPage title="PPM Activity Details" /></AuthenticatedLayout>} />
        <Route path="/asset/ppm-activity/:id/edit" element={<AuthenticatedLayout><PlaceholderPage title="Edit PPM Activity" /></AuthenticatedLayout>} />
        
        {/* PPM Calendar */}
        <Route path="/asset/ppm-calendar" element={<AuthenticatedLayout><AssetList /></AuthenticatedLayout>} />
        
        {/* Stock Items */}
        <Route path="/asset/stock-items" element={<AuthenticatedLayout><AssetList /></AuthenticatedLayout>} />
        <Route path="/asset/stock-items/:id" element={<AuthenticatedLayout><PlaceholderPage title="Stock Item Details" /></AuthenticatedLayout>} />
        <Route path="/asset/stock-items/:id/edit" element={<AuthenticatedLayout><PlaceholderPage title="Edit Stock Item" /></AuthenticatedLayout>} />
        
        {/* Soft Services - Service Tab */}
        <Route path="/soft-services" element={<AuthenticatedLayout><ServiceList /></AuthenticatedLayout>} />
        <Route path="/soft-services/create" element={<AuthenticatedLayout><CreateService /></AuthenticatedLayout>} />
        <Route path="/soft-services/:id" element={<AuthenticatedLayout><ViewService /></AuthenticatedLayout>} />
        <Route path="/soft-services/:id/edit" element={<AuthenticatedLayout><CreateService /></AuthenticatedLayout>} />
        
        {/* Soft Services - Checklist Tab */}
        <Route path="/soft-services/checklist" element={<AuthenticatedLayout><ChecklistList /></AuthenticatedLayout>} />
        <Route path="/soft-services/checklist/create" element={<AuthenticatedLayout><SoftServiceCreateChecklist /></AuthenticatedLayout>} />
        <Route path="/soft-services/checklist/:id" element={<AuthenticatedLayout><ViewChecklist /></AuthenticatedLayout>} />
        <Route path="/soft-services/checklist/:id/edit" element={<AuthenticatedLayout><SoftServiceCreateChecklist /></AuthenticatedLayout>} />
        
        {/* Soft Services - Task Tab */}
        <Route path="/soft-services/task" element={<AuthenticatedLayout><TaskList /></AuthenticatedLayout>} />
        <Route path="/soft-services/task/:id" element={<AuthenticatedLayout><PlaceholderPage title="Task Details" /></AuthenticatedLayout>} />
        
        <Route path="/soft-service" element={<Navigate to="/soft-services" replace />} />

        {/* Service Desk */}
        <Route path="/service-desk" element={<AuthenticatedLayout><TicketList /></AuthenticatedLayout>} />
        <Route path="/service-desk/create" element={<AuthenticatedLayout><TicketCreate /></AuthenticatedLayout>} />
        <Route path="/service-desk/:id" element={<AuthenticatedLayout><TicketView /></AuthenticatedLayout>} />
        <Route path="/service-desk/:id/edit" element={<AuthenticatedLayout><TicketEdit /></AuthenticatedLayout>} />

        {/* Incident Management - Safety Module */}
        <Route path="/incident" element={<AuthenticatedLayout><IncidentList /></AuthenticatedLayout>} />
        <Route path="/incident/create" element={<AuthenticatedLayout><CreateIncident /></AuthenticatedLayout>} />
        <Route path="/incident/:id" element={<AuthenticatedLayout><ViewIncident /></AuthenticatedLayout>} />
        <Route path="/incident/:id/edit" element={<AuthenticatedLayout><CreateIncident /></AuthenticatedLayout>} />

        {/* Amenities Booking - standalone pages */}
        <Route path="/amenities" element={<AuthenticatedLayout><AmenitiesList /></AuthenticatedLayout>} />
        <Route path="/amenities/book" element={<AuthenticatedLayout><BookAmenity /></AuthenticatedLayout>} />
        <Route path="/amenities/bookings/:id" element={<AuthenticatedLayout><PlaceholderPage title="Booking Details" /></AuthenticatedLayout>} />
        
        {/* Hotel Bookings */}
        <Route path="/amenities/hotel" element={<AuthenticatedLayout><HotelBookingsList /></AuthenticatedLayout>} />
        <Route path="/amenities/hotel/book" element={<AuthenticatedLayout><BookHotel /></AuthenticatedLayout>} />
        <Route path="/amenities/hotel/:id" element={<AuthenticatedLayout><PlaceholderPage title="Hotel Booking Details" /></AuthenticatedLayout>} />

        {/* Space Booking */}
        <Route path="/space-booking" element={<AuthenticatedLayout><SpaceBookingsList /></AuthenticatedLayout>} />
        <Route path="/space-booking/book" element={<AuthenticatedLayout><BookSpace /></AuthenticatedLayout>} />
        <Route path="/space-booking/:id" element={<AuthenticatedLayout><PlaceholderPage title="Space Booking Details" /></AuthenticatedLayout>} />

        {/* F&B - Restaurant & Pantry Management */}
        <Route path="/fb" element={<AuthenticatedLayout><FBLayout /></AuthenticatedLayout>}>
          <Route index element={<Navigate to="/fb/restaurant" replace />} />
          <Route path="restaurant" element={<RestaurantManagement />} />
          <Route path="pantry" element={<PantryManagement />} />
        </Route>
        <Route path="/fb/restaurant/create" element={<AuthenticatedLayout><CreateRestaurant /></AuthenticatedLayout>} />
        <Route path="/fb/restaurant/:id" element={<AuthenticatedLayout><PlaceholderPage title="Restaurant Details" /></AuthenticatedLayout>} />
        <Route path="/fb/restaurant/:id/edit" element={<AuthenticatedLayout><PlaceholderPage title="Edit Restaurant" /></AuthenticatedLayout>} />
        <Route path="/fb/pantry/create" element={<AuthenticatedLayout><CreatePantry /></AuthenticatedLayout>} />
        <Route path="/fb/pantry/:id" element={<AuthenticatedLayout><ViewPantry /></AuthenticatedLayout>} />
        <Route path="/fb/pantry/:id/edit" element={<AuthenticatedLayout><EditPantry /></AuthenticatedLayout>} />

        {/* Documents */}
        <Route path="/documents" element={<AuthenticatedLayout><DocumentsList /></AuthenticatedLayout>} />
        <Route path="/documents/common" element={<AuthenticatedLayout><DocumentsList /></AuthenticatedLayout>} />
        <Route path="/documents/shared" element={<AuthenticatedLayout><DocumentsList /></AuthenticatedLayout>} />

        {/* Fitout */}
        <Route path="/fitout" element={<AuthenticatedLayout><FitoutList /></AuthenticatedLayout>} />
        <Route path="/fitout/create" element={<AuthenticatedLayout><PlaceholderPage title="Create Fitout Request" /></AuthenticatedLayout>} />
        <Route path="/fitout/:id" element={<AuthenticatedLayout><PlaceholderPage title="Fitout Details" /></AuthenticatedLayout>} />
        <Route path="/fitout/:id/edit" element={<AuthenticatedLayout><PlaceholderPage title="Edit Fitout Request" /></AuthenticatedLayout>} />

        {/* Calendar */}
        <Route path="/calendar" element={<AuthenticatedLayout><CalendarPage /></AuthenticatedLayout>} />
        <Route path="/calendar/plan" element={<AuthenticatedLayout><PlanMyCalendar /></AuthenticatedLayout>} />

        {/* Mail Room - FM Module */}
        <Route path="/mail-room" element={<AuthenticatedLayout><MailRoomLayout /></AuthenticatedLayout>}>
          <Route index element={<Navigate to="/mail-room/delivery-vendor" replace />} />
          <Route path="delivery-vendor" element={<DeliveryVendorList />} />
          <Route path="inbound" element={<InboundList />} />
          <Route path="outbound" element={<OutboundList />} />
        </Route>
        <Route path="/mail-room/delivery-vendor/create" element={<AuthenticatedLayout><CreateVendor /></AuthenticatedLayout>} />
        <Route path="/mail-room/delivery-vendor/:id" element={<AuthenticatedLayout><ViewVendor /></AuthenticatedLayout>} />
        <Route path="/mail-room/delivery-vendor/:id/edit" element={<AuthenticatedLayout><CreateVendor /></AuthenticatedLayout>} />
        <Route path="/mail-room/inbound/create" element={<AuthenticatedLayout><CreateInboundPackage /></AuthenticatedLayout>} />
        <Route path="/mail-room/inbound/:id" element={<AuthenticatedLayout><ViewInbound /></AuthenticatedLayout>} />
        <Route path="/mail-room/inbound/:id/edit" element={<AuthenticatedLayout><CreateInboundPackage /></AuthenticatedLayout>} />
        <Route path="/mail-room/outbound/create" element={<AuthenticatedLayout><CreateOutboundPackage /></AuthenticatedLayout>} />
        <Route path="/mail-room/outbound/:id" element={<AuthenticatedLayout><ViewOutbound /></AuthenticatedLayout>} />
        <Route path="/mail-room/outbound/:id/edit" element={<AuthenticatedLayout><CreateOutboundPackage /></AuthenticatedLayout>} />

        {/* Supplier/Vendor - FM Module */}
        <Route path="/supplier" element={<AuthenticatedLayout><SupplierList /></AuthenticatedLayout>} />
        <Route path="/supplier/create" element={<AuthenticatedLayout><CreateSupplier /></AuthenticatedLayout>} />
        <Route path="/supplier/:id" element={<AuthenticatedLayout><ViewSupplier /></AuthenticatedLayout>} />
        <Route path="/supplier/:id/edit" element={<AuthenticatedLayout><CreateSupplier /></AuthenticatedLayout>} />

        {/* Audit - FM Module */}
        <Route path="/audit" element={<AuthenticatedLayout><AuditLayout /></AuthenticatedLayout>}>
          <Route index element={<Navigate to="/audit/operational/scheduled" replace />} />
          <Route path="operational/scheduled" element={<OperationalScheduled />} />
          <Route path="operational/conducted" element={<OperationalConducted />} />
          <Route path="operational/checklists" element={<OperationalChecklists />} />
          <Route path="vendor/scheduled" element={<VendorScheduled />} />
          <Route path="vendor/conducted" element={<VendorConducted />} />
        </Route>
        <Route path="/audit/operational/scheduled/create" element={<AuthenticatedLayout><ScheduleAuditForm /></AuthenticatedLayout>} />
        <Route path="/audit/operational/checklists/create" element={<AuthenticatedLayout><ChecklistAuditForm /></AuthenticatedLayout>} />
        <Route path="/audit/vendor/scheduled/create" element={<AuthenticatedLayout><ScheduleAuditForm /></AuthenticatedLayout>} />

        {/* Catch all - redirect to dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </div>
  );
}

export default App;
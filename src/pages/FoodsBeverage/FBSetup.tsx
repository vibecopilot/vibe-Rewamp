import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Upload, Edit2, X, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

// Types
interface Floor {
  id: number;
  name: string;
}

interface Table {
  id: number;
  floorId: number;
  tableNumber: number;
  capacity: number;
}

interface MenuItem {
  id: number;
  name: string;
  price: number;
  checked: boolean;
  category: string;
}

// Static data
const defaultCategories = [
  { id: 'starters', name: 'Starters', checked: true },
  { id: 'main-course', name: 'Main Course', checked: true },
  { id: 'beverages', name: 'Beverages', checked: true },
  { id: 'desserts', name: 'Desserts', checked: true },
  { id: 'chinese', name: 'Chinese', checked: true },
  { id: 'south-indian', name: 'South Indian', checked: true },
  { id: 'north-indian', name: 'North Indian', checked: true },
  { id: 'continental', name: 'Continental', checked: false },
  { id: 'italian', name: 'Italian', checked: false },
  { id: 'mexican', name: 'Mexican', checked: false },
  { id: 'biryani', name: 'Biryani & Rice', checked: true },
  { id: 'bread', name: 'Bread & Roti', checked: true },
  { id: 'salads', name: 'Salads', checked: false },
  { id: 'snacks', name: 'Snacks', checked: true },
  { id: 'fastfood', name: 'Fast Food', checked: true },
  { id: 'combos', name: 'Combos/Thalis', checked: true },
];

const defaultCuisines = [
  { id: 'north-indian', name: 'North Indian', checked: true },
  { id: 'south-indian', name: 'South Indian', checked: true },
  { id: 'chinese', name: 'Chinese', checked: true },
  { id: 'continental', name: 'Continental', checked: false },
  { id: 'italian', name: 'Italian', checked: false },
  { id: 'mexican', name: 'Mexican', checked: false },
  { id: 'thai', name: 'Thai', checked: false },
  { id: 'mughlai', name: 'Mughlai', checked: true },
  { id: 'tandoori', name: 'Tandoori', checked: true },
];

const defaultMenuItems: MenuItem[] = [
  // North Indian
  { id: 1, name: 'Paneer Tikka', price: 250, checked: true, category: 'North Indian' },
  { id: 2, name: 'Butter Chicken', price: 320, checked: true, category: 'North Indian' },
  { id: 3, name: 'Dal Makhani', price: 180, checked: true, category: 'North Indian' },
  { id: 4, name: 'Kadai Paneer', price: 200, checked: false, category: 'North Indian' },
  { id: 5, name: 'Naan', price: 40, checked: true, category: 'North Indian' },
  { id: 6, name: 'Tandoori Roti', price: 30, checked: true, category: 'North Indian' },
  // Chinese
  { id: 7, name: 'Veg Manchurian', price: 200, checked: true, category: 'Chinese' },
  { id: 8, name: 'Chicken Fried Rice', price: 220, checked: true, category: 'Chinese' },
  { id: 9, name: 'Hakka Noodles', price: 200, checked: true, category: 'Chinese' },
  { id: 10, name: 'Spring Rolls', price: 150, checked: false, category: 'Chinese' },
  // South Indian
  { id: 11, name: 'Masala Dosa', price: 120, checked: true, category: 'South Indian' },
  { id: 12, name: 'Idli Sambhar', price: 80, checked: true, category: 'South Indian' },
  { id: 13, name: 'Medu Vada', price: 70, checked: false, category: 'South Indian' },
];

const FBSetup: React.FC = () => {
  // Accordion state - only one section open at a time
  const [openSection, setOpenSection] = useState<number>(1);

  // Section 1: Basic Details
  const [restaurantName, setRestaurantName] = useState('Sample Restaurant');
  const [address, setAddress] = useState('123 Main Street, City - 400001');
  const [phone, setPhone] = useState('+91 9876543210');
  const [email, setEmail] = useState('contact@samplerestaurant.com');
  const [restaurantType, setRestaurantType] = useState('all');
  const [opensAt, setOpensAt] = useState('10:00');
  const [closesAt, setClosesAt] = useState('23:00');
  const [gstNumber, setGstNumber] = useState('27ABCDE1234F1ZH');
  const [logo, setLogo] = useState<File | null>(null);

  // Section 2: Restaurant Details
  const [licenseNumber, setLicenseNumber] = useState('LIC123456789');
  const [fssaiNumber, setFssaiNumber] = useState('12345678901234');
  const [location, setLocation] = useState('Main Branch');
  const [deliveryZone, setDeliveryZone] = useState('Downtown, Suburb Area');
  const [serviceRadius, setServiceRadius] = useState('10');
  const [avgPrepTime, setAvgPrepTime] = useState('30');
  const [taxType, setTaxType] = useState('gst');
  const [serviceCharge, setServiceCharge] = useState('5');

  // Section 3: Floors/Areas
  const [hasMultipleAreas, setHasMultipleAreas] = useState(true);
  const [floors, setFloors] = useState<Floor[]>([
    { id: 1, name: 'Ground Floor' },
    { id: 2, name: 'First Floor' },
    { id: 3, name: 'Garden Area' },
  ]);

  // Section 4: Tables
  const [tables, setTables] = useState<Table[]>([
    { id: 1, floorId: 1, tableNumber: 1, capacity: 4 },
    { id: 2, floorId: 1, tableNumber: 2, capacity: 2 },
    { id: 3, floorId: 1, tableNumber: 3, capacity: 6 },
    { id: 4, floorId: 2, tableNumber: 4, capacity: 4 },
    { id: 5, floorId: 2, tableNumber: 5, capacity: 8 },
    { id: 6, floorId: 3, tableNumber: 6, capacity: 4 },
  ]);

  // Section 5: Categories & Cuisines
  const [categories, setCategories] = useState(defaultCategories);
  const [cuisines, setCuisines] = useState(defaultCuisines);

  // Section 6: Menu Items
  const [menuItems, setMenuItems] = useState(defaultMenuItems);
  const [editingItemId, setEditingItemId] = useState<number | null>(null);

  // Section 7: Payment & Attachments
  const [paymentMethods, setPaymentMethods] = useState({
    cash: true,
    card: true,
    upi: true,
    sodexo: false,
    credit: false,
  });
  const [googlePay, setGooglePay] = useState('');
  const [phonePe, setPhonePe] = useState('');
  const [paytm, setPaytm] = useState('');
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [gallery, setGallery] = useState<File | null>(null);
  const [menuPdf, setMenuPdf] = useState<File | null>(null);
  const [otherFiles, setOtherFiles] = useState<File | null>(null);

  // Toggle accordion section
  const toggleSection = (sectionId: number) => {
    setOpenSection(openSection === sectionId ? 0 : sectionId);
  };

  // Floor handlers
  const addFloor = () => {
    const newId = Math.max(...floors.map(f => f.id), 0) + 1;
    setFloors([...floors, { id: newId, name: '' }]);
  };

  const removeFloor = (id: number) => {
    setFloors(floors.filter(f => f.id !== id));
    setTables(tables.filter(t => t.floorId !== id));
  };

  const updateFloorName = (id: number, name: string) => {
    setFloors(floors.map(f => f.id === id ? { ...f, name } : f));
  };

  // Table handlers
  const addTable = (floorId: number) => {
    const newId = Math.max(...tables.map(t => t.id), 0) + 1;
    const floorTables = tables.filter(t => t.floorId === floorId);
    const newTableNumber = Math.max(...floorTables.map(t => t.tableNumber), 0) + 1;
    setTables([...tables, { id: newId, floorId, tableNumber: newTableNumber, capacity: 4 }]);
  };

  const removeTable = (id: number) => {
    setTables(tables.filter(t => t.id !== id));
  };

  const updateTableCapacity = (id: number, capacity: number) => {
    setTables(tables.map(t => t.id === id ? { ...t, capacity } : t));
  };

  // Category handlers
  const toggleCategory = (id: string) => {
    setCategories(categories.map(c => c.id === id ? { ...c, checked: !c.checked } : c));
  };

  const toggleCuisine = (id: string) => {
    setCuisines(cuisines.map(c => c.id === id ? { ...c, checked: !c.checked } : c));
  };

  // Menu item handlers
  const toggleMenuItem = (id: number) => {
    setMenuItems(menuItems.map(m => m.id === id ? { ...m, checked: !m.checked } : m));
  };

  const updateMenuItemPrice = (id: number, price: number) => {
    setMenuItems(menuItems.map(m => m.id === id ? { ...m, price } : m));
    setEditingItemId(null);
  };

  const selectAllMenuItems = () => {
    setMenuItems(menuItems.map(m => ({ ...m, checked: true })));
  };

  const deselectAllMenuItems = () => {
    setMenuItems(menuItems.map(m => ({ ...m, checked: false })));
  };

  // Payment method handlers
  const togglePaymentMethod = (method: keyof typeof paymentMethods) => {
    setPaymentMethods({ ...paymentMethods, [method]: !paymentMethods[method] });
  };

  // Save handler
  const handleSave = () => {
    if (!restaurantName.trim()) {
      toast.error('Restaurant name is required');
      return;
    }
    toast.success('Setup saved successfully!');
  };

  // Section header component
  const SectionHeader: React.FC<{ id: number; title: string }> = ({ id, title }) => (
    <button
      onClick={() => toggleSection(id)}
      className="w-full flex items-center justify-between p-4 bg-card hover:bg-accent/30 border border-border rounded-lg transition-colors"
    >
      <div className="flex items-center gap-3">
        {openSection === id ? (
          <ChevronDown className="w-5 h-5 text-primary" />
        ) : (
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        )}
        <h3 className="text-base font-semibold text-foreground uppercase tracking-wide">{title}</h3>
      </div>
    </button>
  );

  // Grouped menu items by category
  const groupedMenuItems = menuItems.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  return (
    <div className="p-4 space-y-3 max-w-6xl mx-auto">
      {/* SECTION 1: Basic Details */}
      <div className="space-y-0">
        <SectionHeader id={1} title="Basic Details" />
        {openSection === 1 && (
          <div className="p-6 bg-card border border-t-0 border-border rounded-b-lg animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Restaurant Name *</label>
                <input
                  type="text"
                  value={restaurantName}
                  onChange={(e) => setRestaurantName(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-foreground mb-1">Address</label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Phone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-foreground mb-2">Restaurant Type</label>
                <div className="flex flex-wrap gap-4">
                  {[
                    { value: 'dine-in', label: 'Dine-in only' },
                    { value: 'takeaway', label: 'Takeaway/Delivery only' },
                    { value: 'cloud', label: 'Cloud Kitchen' },
                    { value: 'all', label: 'All of the above' },
                  ].map((option) => (
                    <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="restaurantType"
                        value={option.value}
                        checked={restaurantType === option.value}
                        onChange={(e) => setRestaurantType(e.target.value)}
                        className="w-4 h-4 text-primary accent-primary"
                      />
                      <span className="text-sm text-foreground">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Opens at</label>
                <input
                  type="time"
                  value={opensAt}
                  onChange={(e) => setOpensAt(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Closes at</label>
                <input
                  type="time"
                  value={closesAt}
                  onChange={(e) => setClosesAt(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">GST Number</label>
                <input
                  type="text"
                  value={gstNumber}
                  onChange={(e) => setGstNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Upload Logo</label>
                <label className="flex items-center gap-2 px-3 py-2 border border-dashed border-border rounded-lg bg-background cursor-pointer hover:bg-accent/30 transition-colors">
                  <Upload className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {logo ? logo.name : 'Click to Upload'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setLogo(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 2: Restaurant Details */}
      <div className="space-y-0">
        <SectionHeader id={2} title="Restaurant Details" />
        {openSection === 2 && (
          <div className="p-6 bg-card border border-t-0 border-border rounded-b-lg animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">License Number</label>
                <input
                  type="text"
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">FSSAI Number</label>
                <input
                  type="text"
                  value={fssaiNumber}
                  onChange={(e) => setFssaiNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Location/Branch</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Delivery Zone</label>
                <input
                  type="text"
                  value={deliveryZone}
                  onChange={(e) => setDeliveryZone(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Service Radius</label>
                <div className="relative">
                  <input
                    type="text"
                    value={serviceRadius}
                    onChange={(e) => setServiceRadius(e.target.value)}
                    className="w-full px-3 py-2 pr-12 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">km</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Average Prep Time</label>
                <div className="relative">
                  <input
                    type="text"
                    value={avgPrepTime}
                    onChange={(e) => setAvgPrepTime(e.target.value)}
                    className="w-full px-3 py-2 pr-16 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">minutes</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Tax Type</label>
                <select
                  value={taxType}
                  onChange={(e) => setTaxType(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="gst">GST</option>
                  <option value="vat">VAT</option>
                  <option value="none">None</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Service Charge %</label>
                <input
                  type="text"
                  value={serviceCharge}
                  onChange={(e) => setServiceCharge(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 3: Floors/Areas Setup */}
      <div className="space-y-0">
        <SectionHeader id={3} title="Floors/Areas Setup" />
        {openSection === 3 && (
          <div className="p-6 bg-card border border-t-0 border-border rounded-b-lg animate-fade-in">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Do you have multiple floors or areas?</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="multipleAreas"
                      checked={!hasMultipleAreas}
                      onChange={() => setHasMultipleAreas(false)}
                      className="w-4 h-4 text-primary accent-primary"
                    />
                    <span className="text-sm text-foreground">Single area</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="multipleAreas"
                      checked={hasMultipleAreas}
                      onChange={() => setHasMultipleAreas(true)}
                      className="w-4 h-4 text-primary accent-primary"
                    />
                    <span className="text-sm text-foreground">Multiple areas</span>
                  </label>
                </div>
              </div>

              {hasMultipleAreas && (
                <div className="space-y-3">
                  {floors.map((floor) => (
                    <div key={floor.id} className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground w-24">Floor Name:</span>
                      <input
                        type="text"
                        value={floor.name}
                        onChange={(e) => updateFloorName(floor.id, e.target.value)}
                        placeholder="Enter floor name"
                        className="flex-1 px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                      <button
                        onClick={() => removeFloor(floor.id)}
                        className="flex items-center gap-1 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4" />
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={addFloor}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-primary hover:bg-primary/10 rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Floor/Area
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* SECTION 4: Table Bookings/Setup */}
      <div className="space-y-0">
        <SectionHeader id={4} title="Table Bookings/Setup" />
        {openSection === 4 && (
          <div className="p-6 bg-card border border-t-0 border-border rounded-b-lg animate-fade-in">
            <div className="space-y-6">
              {floors.map((floor) => (
                <div key={floor.id} className="space-y-3">
                  <h4 className="font-semibold text-foreground">{floor.name || `Floor ${floor.id}`}</h4>
                  <div className="space-y-2 pl-4">
                    {tables
                      .filter((t) => t.floorId === floor.id)
                      .map((table) => (
                        <div key={table.id} className="flex items-center gap-4">
                          <span className="text-sm text-muted-foreground">Table {table.tableNumber}:</span>
                          <span className="text-sm text-muted-foreground">Capacity</span>
                          <input
                            type="number"
                            value={table.capacity}
                            onChange={(e) => updateTableCapacity(table.id, parseInt(e.target.value) || 1)}
                            min={1}
                            className="w-20 px-3 py-1.5 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent text-center"
                          />
                          <span className="text-sm text-muted-foreground">seats</span>
                          <button
                            onClick={() => removeTable(table.id)}
                            className="flex items-center gap-1 px-3 py-1.5 text-sm text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                          >
                            <X className="w-4 h-4" />
                            Remove
                          </button>
                        </div>
                      ))}
                    <button
                      onClick={() => addTable(floor.id)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-primary hover:bg-primary/10 rounded-lg transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Add Table
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* SECTION 5: Categories & Cuisines */}
      <div className="space-y-0">
        <SectionHeader id={5} title="Categories & Cuisines" />
        {openSection === 5 && (
          <div className="p-6 bg-card border border-t-0 border-border rounded-b-lg animate-fade-in">
            <div className="space-y-6">
              {/* Categories */}
              <div>
                <h4 className="font-semibold text-foreground mb-3">Categories Selection</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {categories.map((cat) => (
                    <label key={cat.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={cat.checked}
                        onChange={() => toggleCategory(cat.id)}
                        className="w-4 h-4 rounded text-primary accent-primary"
                      />
                      <span className="text-sm text-foreground">{cat.name}</span>
                    </label>
                  ))}
                </div>
                <button className="flex items-center gap-2 px-4 py-2 mt-3 text-sm text-primary hover:bg-primary/10 rounded-lg transition-colors">
                  <Plus className="w-4 h-4" />
                  Add Custom Category
                </button>
              </div>

              {/* Cuisines */}
              <div>
                <h4 className="font-semibold text-foreground mb-3">Cuisines Selection</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {cuisines.map((cuisine) => (
                    <label key={cuisine.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={cuisine.checked}
                        onChange={() => toggleCuisine(cuisine.id)}
                        className="w-4 h-4 rounded text-primary accent-primary"
                      />
                      <span className="text-sm text-foreground">{cuisine.name}</span>
                    </label>
                  ))}
                </div>
                <button className="flex items-center gap-2 px-4 py-2 mt-3 text-sm text-primary hover:bg-primary/10 rounded-lg transition-colors">
                  <Plus className="w-4 h-4" />
                  Add Custom Cuisine
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 6: Order Configure / Menu Items */}
      <div className="space-y-0">
        <SectionHeader id={6} title="Order Configure / Menu Items" />
        {openSection === 6 && (
          <div className="p-6 bg-card border border-t-0 border-border rounded-b-lg animate-fade-in">
            <p className="text-sm text-muted-foreground mb-4">
              Based on your selected categories, common items are listed. Select items you serve and edit prices.
            </p>
            
            <div className="flex gap-3 mb-4">
              <button
                onClick={selectAllMenuItems}
                className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Select All
              </button>
              <button
                onClick={deselectAllMenuItems}
                className="px-4 py-2 text-sm bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors"
              >
                Deselect All
              </button>
            </div>

            <div className="space-y-6">
              {Object.entries(groupedMenuItems).map(([category, items]) => (
                <div key={category}>
                  <h4 className="font-semibold text-foreground mb-3 uppercase">{category}</h4>
                  <div className="space-y-2 pl-4">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-center gap-4">
                        <label className="flex items-center gap-2 cursor-pointer flex-1">
                          <input
                            type="checkbox"
                            checked={item.checked}
                            onChange={() => toggleMenuItem(item.id)}
                            className="w-4 h-4 rounded text-primary accent-primary"
                          />
                          <span className="text-sm text-foreground">{item.name}</span>
                        </label>
                        <span className="text-sm text-muted-foreground">-</span>
                        <span className="text-sm text-muted-foreground">₹</span>
                        {editingItemId === item.id ? (
                          <input
                            type="number"
                            defaultValue={item.price}
                            onBlur={(e) => updateMenuItemPrice(item.id, parseInt(e.target.value) || item.price)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                updateMenuItemPrice(item.id, parseInt((e.target as HTMLInputElement).value) || item.price);
                              }
                            }}
                            className="w-20 px-2 py-1 border border-border rounded bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                            autoFocus
                          />
                        ) : (
                          <span className="text-sm text-foreground w-12">{item.price}</span>
                        )}
                        <button
                          onClick={() => setEditingItemId(item.id)}
                          className="p-1 text-muted-foreground hover:text-primary transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* SECTION 7: Attachments / Payment Methods */}
      <div className="space-y-0">
        <SectionHeader id={7} title="Attachments / Payment Methods" />
        {openSection === 7 && (
          <div className="p-6 bg-card border border-t-0 border-border rounded-b-lg animate-fade-in">
            <div className="space-y-6">
              {/* Payment Methods */}
              <div>
                <h4 className="font-semibold text-foreground mb-3">Payment Methods Accepted</h4>
                <div className="space-y-2">
                  {[
                    { key: 'cash', label: 'Cash' },
                    { key: 'card', label: 'Card (Credit/Debit)' },
                    { key: 'upi', label: 'UPI/Digital Wallets' },
                    { key: 'sodexo', label: 'Sodexo/Meal Cards' },
                    { key: 'credit', label: 'Credit Account (Pay Later)' },
                  ].map((method) => (
                    <label key={method.key} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={paymentMethods[method.key as keyof typeof paymentMethods]}
                        onChange={() => togglePaymentMethod(method.key as keyof typeof paymentMethods)}
                        className="w-4 h-4 rounded text-primary accent-primary"
                      />
                      <span className="text-sm text-foreground">{method.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* UPI Details */}
              <div>
                <h4 className="font-semibold text-foreground mb-3">UPI Details (Optional)</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Google Pay</label>
                    <input
                      type="text"
                      value={googlePay}
                      onChange={(e) => setGooglePay(e.target.value)}
                      placeholder="UPI ID"
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">PhonePe</label>
                    <input
                      type="text"
                      value={phonePe}
                      onChange={(e) => setPhonePe(e.target.value)}
                      placeholder="UPI ID"
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Paytm</label>
                    <input
                      type="text"
                      value={paytm}
                      onChange={(e) => setPaytm(e.target.value)}
                      placeholder="UPI ID"
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Upload Documents */}
              <div>
                <h4 className="font-semibold text-foreground mb-3">Upload Documents</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { key: 'cover', label: 'Cover Image', state: coverImage, setState: setCoverImage },
                    { key: 'gallery', label: 'Gallery', state: gallery, setState: setGallery },
                    { key: 'menu', label: 'Menu PDF', state: menuPdf, setState: setMenuPdf },
                    { key: 'other', label: 'Other Files', state: otherFiles, setState: setOtherFiles },
                  ].map((doc) => (
                    <div key={doc.key}>
                      <label className="block text-sm font-medium text-foreground mb-1">{doc.label}</label>
                      <label className="flex flex-col items-center justify-center h-24 border border-dashed border-border rounded-lg bg-background cursor-pointer hover:bg-accent/30 transition-colors">
                        <Upload className="w-6 h-6 text-muted-foreground mb-1" />
                        <span className="text-xs text-muted-foreground text-center px-2">
                          {doc.state ? doc.state.name : 'Click to Upload'}
                        </span>
                        <input
                          type="file"
                          onChange={(e) => doc.setState(e.target.files?.[0] || null)}
                          className="hidden"
                        />
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="flex justify-center pt-6">
        <button
          onClick={handleSave}
          className="px-8 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors"
        >
          Save
        </button>
      </div>
    </div>
  );
};

export default FBSetup;

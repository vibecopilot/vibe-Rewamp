import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Minus, Printer, Construction } from 'lucide-react';
import toast from 'react-hot-toast';

// Types
interface MenuItem {
  id: number;
  name: string;
  price: number;
  isVeg: boolean;
}

interface CartItem extends MenuItem {
  qty: number;
  checked: boolean;
}

type OrderType = 'dine-in' | 'delivery' | 'pickup';

// Static menu data organized by category - exactly as specified
const menuData: Record<string, { veg: MenuItem[]; nonVeg: MenuItem[] }> = {
  'favourite': {
    veg: [
      { id: 1, name: "Paneer Tikka", price: 80, isVeg: true },
      { id: 2, name: "Paneer Kabab", price: 90, isVeg: true },
      { id: 3, name: "Veg Spring Roles", price: 70, isVeg: true }
    ],
    nonVeg: [
      { id: 4, name: "Chicken Lollipop", price: 240, isVeg: false },
      { id: 5, name: "Hara Bhara Kabab", price: 180, isVeg: false },
      { id: 6, name: "Fish Fingers", price: 200, isVeg: false }
    ]
  },
  'starters': {
    veg: [
      { id: 101, name: "Paneer Tikka", price: 80, isVeg: true },
      { id: 102, name: "Paneer Kabab", price: 90, isVeg: true },
      { id: 103, name: "Veg Spring Roles", price: 70, isVeg: true },
      { id: 104, name: "Hara Bhara Kabab", price: 180, isVeg: true }
    ],
    nonVeg: [
      { id: 105, name: "Chicken Lollipop", price: 240, isVeg: false },
      { id: 106, name: "Fish Fingers", price: 200, isVeg: false },
      { id: 107, name: "Chicken Tikka", price: 280, isVeg: false }
    ]
  },
  'main-course': {
    veg: [
      { id: 201, name: "Paneer Butter Masala", price: 280, isVeg: true },
      { id: 202, name: "Dal Makhani", price: 180, isVeg: true },
      { id: 203, name: "Kadai Paneer", price: 260, isVeg: true },
      { id: 204, name: "Veg Biryani", price: 200, isVeg: true }
    ],
    nonVeg: [
      { id: 205, name: "Butter Chicken", price: 320, isVeg: false },
      { id: 206, name: "Chicken Biryani", price: 250, isVeg: false },
      { id: 207, name: "Fish Curry", price: 350, isVeg: false },
      { id: 208, name: "Mutton Rogan Josh", price: 400, isVeg: false }
    ]
  },
  'beverages': {
    veg: [
      { id: 301, name: "Cold Coffee", price: 120, isVeg: true },
      { id: 302, name: "Masala Chai", price: 40, isVeg: true },
      { id: 303, name: "Fresh Lime Soda", price: 60, isVeg: true },
      { id: 304, name: "Mango Lassi", price: 80, isVeg: true },
      { id: 305, name: "Filter Coffee", price: 50, isVeg: true }
    ],
    nonVeg: []
  },
  'desserts': {
    veg: [
      { id: 401, name: "Gulab Jamun", price: 80, isVeg: true },
      { id: 402, name: "Rasmalai", price: 100, isVeg: true },
      { id: 403, name: "Ice Cream", price: 120, isVeg: true },
      { id: 404, name: "Gajar Halwa", price: 90, isVeg: true }
    ],
    nonVeg: []
  },
  'chinese': {
    veg: [
      { id: 501, name: "Veg Manchurian", price: 200, isVeg: true },
      { id: 502, name: "Hakka Noodles", price: 200, isVeg: true },
      { id: 503, name: "Spring Rolls", price: 150, isVeg: true },
      { id: 504, name: "Veg Fried Rice", price: 180, isVeg: true }
    ],
    nonVeg: [
      { id: 505, name: "Chicken Fried Rice", price: 220, isVeg: false },
      { id: 506, name: "Chicken Manchurian", price: 240, isVeg: false }
    ]
  },
  'south-indian': {
    veg: [
      { id: 601, name: "Masala Dosa", price: 120, isVeg: true },
      { id: 602, name: "Idli Sambhar", price: 80, isVeg: true },
      { id: 603, name: "Medu Vada", price: 70, isVeg: true },
      { id: 604, name: "Uttapam", price: 100, isVeg: true }
    ],
    nonVeg: []
  },
  'north-indian': {
    veg: [
      { id: 701, name: "Paneer Tikka", price: 250, isVeg: true },
      { id: 702, name: "Dal Makhani", price: 180, isVeg: true },
      { id: 703, name: "Kadai Paneer", price: 200, isVeg: true },
      { id: 704, name: "Malai Kofta", price: 220, isVeg: true }
    ],
    nonVeg: [
      { id: 705, name: "Butter Chicken", price: 320, isVeg: false },
      { id: 706, name: "Chicken Tikka", price: 280, isVeg: false },
      { id: 707, name: "Mutton Rogan Josh", price: 400, isVeg: false }
    ]
  },
  'biryani': {
    veg: [
      { id: 801, name: "Veg Biryani", price: 200, isVeg: true },
      { id: 802, name: "Jeera Rice", price: 150, isVeg: true }
    ],
    nonVeg: [
      { id: 803, name: "Chicken Biryani", price: 250, isVeg: false },
      { id: 804, name: "Mutton Biryani", price: 350, isVeg: false },
      { id: 805, name: "Egg Biryani", price: 180, isVeg: false }
    ]
  },
  'bread': {
    veg: [
      { id: 901, name: "Butter Naan", price: 50, isVeg: true },
      { id: 902, name: "Tandoori Roti", price: 30, isVeg: true },
      { id: 903, name: "Garlic Naan", price: 60, isVeg: true },
      { id: 904, name: "Laccha Paratha", price: 40, isVeg: true }
    ],
    nonVeg: []
  },
  'salads': {
    veg: [
      { id: 1001, name: "Green Salad", price: 60, isVeg: true },
      { id: 1002, name: "Caesar Salad", price: 120, isVeg: true },
      { id: 1003, name: "Russian Salad", price: 80, isVeg: true }
    ],
    nonVeg: []
  },
  'snacks': {
    veg: [
      { id: 1101, name: "Samosa", price: 40, isVeg: true },
      { id: 1102, name: "Pakora", price: 50, isVeg: true },
      { id: 1103, name: "French Fries", price: 80, isVeg: true }
    ],
    nonVeg: []
  },
  'combos': {
    veg: [
      { id: 1201, name: "Veg Thali", price: 200, isVeg: true },
      { id: 1202, name: "Gujarati Thali", price: 250, isVeg: true }
    ],
    nonVeg: [
      { id: 1203, name: "Non-Veg Thali", price: 300, isVeg: false }
    ]
  },
  'fastfood': {
    veg: [
      { id: 1301, name: "Veg Burger", price: 80, isVeg: true },
      { id: 1302, name: "Veg Pizza", price: 200, isVeg: true }
    ],
    nonVeg: [
      { id: 1303, name: "Chicken Burger", price: 120, isVeg: false },
      { id: 1304, name: "Chicken Pizza", price: 280, isVeg: false }
    ]
  }
};

// Category tabs
const categoryTabs = [
  { id: 'favourite', label: 'Favourite Items' },
  { id: 'starters', label: 'Starters' },
  { id: 'main-course', label: 'Main Course' },
  { id: 'beverages', label: 'Beverages' },
  { id: 'desserts', label: 'Desserts' },
  { id: 'chinese', label: 'Chinese' },
  { id: 'south-indian', label: 'South Indian' },
  { id: 'north-indian', label: 'North Indian' },
  { id: 'biryani', label: 'Biryani & Rice' },
  { id: 'bread', label: 'Bread & Roti' },
  { id: 'salads', label: 'Salads' },
  { id: 'snacks', label: 'Snacks' },
  { id: 'combos', label: 'Combos/Thalis' },
  { id: 'fastfood', label: 'Fastfood' },
];

// Level 3 tabs
const level3Tabs = [
  { id: 'pos', label: 'POS', active: true },
  { id: 'pantry', label: 'Pantry Management', active: false },
  { id: 'restaurant', label: 'Restaurant', active: false },
  { id: 'status', label: 'Status Setup', active: false },
  { id: 'categories', label: 'Categories Setup', active: false },
  { id: 'subcategories', label: 'Sub Categories Setup', active: false },
  { id: 'menu', label: 'Restaurant Menu', active: false },
  { id: 'bookings', label: 'Restaurant Bookings', active: false },
];

// Level 4 tabs
const level4Tabs = [
  { id: 'pos-main', label: 'POS', active: true },
  { id: 'new-table', label: 'New Table', active: false },
  { id: 'order-delivery', label: 'Order Delivery', active: false },
];

const RestaurantPOS: React.FC = () => {
  const navigate = useNavigate();
  
  // State
  const [searchItem, setSearchItem] = useState('');
  const [searchCode, setSearchCode] = useState('');
  const [orderType, setOrderType] = useState<OrderType>('dine-in');
  const [activeCategory, setActiveCategory] = useState('favourite');
  const [activeLevel3Tab, setActiveLevel3Tab] = useState('pos');
  const [activeLevel4Tab, setActiveLevel4Tab] = useState('pos-main');
  
  // Cart state - initialized with sample items
  const [cart, setCart] = useState<CartItem[]>([
    { id: 1, name: "Paneer Tikka", qty: 1, price: 80, checked: true, isVeg: true },
    { id: 3, name: "Veg Spring Roles", qty: 1, price: 70, checked: true, isVeg: true },
    { id: 4, name: "Chicken Lollipop", qty: 1, price: 240, checked: true, isVeg: false }
  ]);
  
  const [paymentMode, setPaymentMode] = useState('cash');
  const [isPaid, setIsPaid] = useState(false);
  const [useLoyalty, setUseLoyalty] = useState(false);
  const [sendFeedback, setSendFeedback] = useState(false);

  // Get menu items for current category
  const currentMenuItems = useMemo(() => {
    const categoryData = menuData[activeCategory] || { veg: [], nonVeg: [] };
    return categoryData;
  }, [activeCategory]);

  // Filter items based on search
  const filteredMenuItems = useMemo(() => {
    const { veg, nonVeg } = currentMenuItems;
    const searchLower = searchItem.toLowerCase();
    
    if (!searchItem) return currentMenuItems;
    
    return {
      veg: veg.filter(item => item.name.toLowerCase().includes(searchLower)),
      nonVeg: nonVeg.filter(item => item.name.toLowerCase().includes(searchLower))
    };
  }, [currentMenuItems, searchItem]);

  // Calculate total from checked items
  const totalAmount = useMemo(() => {
    return cart.filter(item => item.checked).reduce((sum, item) => sum + (item.price * item.qty), 0);
  }, [cart]);

  // Add to cart
  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(cartItem => cartItem.id === item.id);
      if (existing) {
        toast.success(`${item.name} quantity increased`);
        return prev.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, qty: cartItem.qty + 1 }
            : cartItem
        );
      }
      toast.success(`${item.name} added to cart`);
      return [...prev, { ...item, qty: 1, checked: true }];
    });
  };

  // Update quantity
  const updateQuantity = (itemId: number, delta: number) => {
    setCart(prev => {
      const item = prev.find(i => i.id === itemId);
      if (!item) return prev;
      
      const newQty = item.qty + delta;
      if (newQty <= 0) {
        toast.success(`${item.name} removed from cart`);
        return prev.filter(i => i.id !== itemId);
      }
      return prev.map(i => i.id === itemId ? { ...i, qty: newQty } : i);
    });
  };

  // Toggle item check
  const toggleItemCheck = (itemId: number) => {
    setCart(prev => prev.map(item =>
      item.id === itemId ? { ...item, checked: !item.checked } : item
    ));
  };

  // Handle order type change
  const handleOrderTypeChange = (type: OrderType) => {
    setOrderType(type);
    const typeLabels = { 'dine-in': 'Dine In', 'delivery': 'Delivery', 'pickup': 'Pick Up' };
    toast.success(`Order type changed to ${typeLabels[type]}`);
  };

  // Handle tab clicks
  const handleLevel3TabClick = (tabId: string) => {
    if (tabId !== 'pos') {
      toast('This section is under construction', { icon: '🚧' });
    }
    setActiveLevel3Tab(tabId);
  };

  const handleLevel4TabClick = (tabId: string) => {
    if (tabId !== 'pos-main') {
      toast('This section is under construction', { icon: '🚧' });
    }
    setActiveLevel4Tab(tabId);
  };

  const handleCategoryClick = (categoryId: string) => {
    setActiveCategory(categoryId);
  };

  // Action button handlers
  const handleSave = () => {
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }
    toast.success('Order saved successfully!');
  };

  const handleSaveAndPrint = () => {
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }
    toast.success('Order saved and sent to printer');
  };

  const handleSaveAndKOT = () => {
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }
    toast.success('Order saved and kitchen order sent');
  };

  const handleKOT = () => {
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }
    toast.success('Kitchen order sent');
  };

  const handleKOTAndPrint = () => {
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }
    toast.success('Kitchen order sent and printed');
  };

  // Render under construction placeholder
  const renderUnderConstruction = (title: string) => (
    <div className="flex flex-col items-center justify-center h-80 bg-card border border-border rounded-lg">
      <Construction className="w-16 h-16 text-muted-foreground mb-4" />
      <h3 className="text-xl font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground">This section is under construction</p>
    </div>
  );

  // Item Card Component
  const ItemCard = ({ item }: { item: MenuItem }) => (
    <div
      onClick={() => addToCart(item)}
      className={`bg-card p-4 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] border-l-4 ${
        item.isVeg ? 'border-l-green-500' : 'border-l-red-500'
      } border border-border`}
    >
      <div className="text-center">
        <h4 className="text-sm font-medium text-foreground">{item.name}</h4>
        <p className="text-xs text-muted-foreground mt-1">₹{item.price}</p>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full min-h-[calc(100vh-200px)]">
      {/* Breadcrumb */}
      <div className="text-sm text-muted-foreground mb-4">
        Booking Management &gt; F&B &gt; Restaurant Management &gt; POS
      </div>

      {/* Level 3 Tabs */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2 border-b border-border">
        {level3Tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => handleLevel3TabClick(tab.id)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg whitespace-nowrap transition-colors ${
              activeLevel3Tab === tab.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-muted-foreground hover:bg-accent'
            }`}
          >
            {tab.label}
            {!tab.active && <span className="ml-1 text-xs opacity-70">(UC)</span>}
          </button>
        ))}
      </div>

      {activeLevel3Tab === 'pos' ? (
        <>
          {/* Level 4 Tabs */}
          <div className="flex items-center gap-2 mb-4">
            {level4Tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => handleLevel4TabClick(tab.id)}
                className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                  activeLevel4Tab === tab.id
                    ? 'bg-accent text-accent-foreground border border-primary'
                    : 'bg-secondary text-muted-foreground hover:bg-accent'
                }`}
              >
                {tab.label}
                {!tab.active && <span className="ml-1 text-xs opacity-70">(UC)</span>}
              </button>
            ))}
          </div>

          {activeLevel4Tab === 'pos-main' ? (
            <div className="flex gap-4 flex-1">
              {/* LEFT SECTION - 60% */}
              <div className="w-[60%] flex flex-col bg-card border border-border rounded-lg p-4">
                {/* Top Controls */}
                <div className="flex flex-wrap gap-3 mb-4">
                  <div className="flex-1 min-w-[150px] relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search Item..."
                      value={searchItem}
                      onChange={(e) => setSearchItem(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div className="flex-1 min-w-[150px] relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search Code..."
                      value={searchCode}
                      onChange={(e) => setSearchCode(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  
                  {/* Order Type Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOrderTypeChange('dine-in')}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                        orderType === 'dine-in'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-background text-foreground border border-border hover:bg-accent'
                      }`}
                    >
                      Dine In
                    </button>
                    <button
                      onClick={() => handleOrderTypeChange('delivery')}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                        orderType === 'delivery'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-background text-foreground border border-border hover:bg-accent'
                      }`}
                    >
                      Delivery
                    </button>
                    <button
                      onClick={() => handleOrderTypeChange('pickup')}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                        orderType === 'pickup'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-background text-foreground border border-border hover:bg-accent'
                      }`}
                    >
                      Pick Up
                    </button>
                  </div>
                </div>

                {/* Category Tabs */}
                <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                  {categoryTabs.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => handleCategoryClick(cat.id)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-colors ${
                        activeCategory === cat.id
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary text-muted-foreground hover:bg-accent'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* Menu Items */}
                <div className="flex-1 overflow-y-auto">
                  {/* Veg Section */}
                  {filteredMenuItems.veg.length > 0 && (
                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                        <h3 className="text-base font-semibold text-foreground">Veg</h3>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        {filteredMenuItems.veg.map(item => (
                          <ItemCard key={item.id} item={item} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Non-Veg Section */}
                  {filteredMenuItems.nonVeg.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                        <h3 className="text-base font-semibold text-foreground">Non Veg</h3>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        {filteredMenuItems.nonVeg.map(item => (
                          <ItemCard key={item.id} item={item} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Empty state for search */}
                  {filteredMenuItems.veg.length === 0 && filteredMenuItems.nonVeg.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                      <Search className="w-12 h-12 mb-4 opacity-50" />
                      <p>No items found matching "{searchItem}"</p>
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT SECTION - 40% */}
              <div className="w-[40%] flex flex-col bg-card border border-border rounded-lg overflow-hidden">
                {/* Cart Header */}
                <div className="p-3 bg-secondary border-b border-border">
                  <h3 className="font-semibold text-foreground">Cart Items</h3>
                </div>

                {/* Cart Table */}
                <div className="flex-1 overflow-y-auto">
                  <table className="w-full">
                    <thead className="bg-muted sticky top-0">
                      <tr>
                        <th className="p-2 text-left text-xs font-medium text-muted-foreground w-10">✓</th>
                        <th className="p-2 text-left text-xs font-medium text-muted-foreground">Items</th>
                        <th className="p-2 text-center text-xs font-medium text-muted-foreground w-24">Qty</th>
                        <th className="p-2 text-right text-xs font-medium text-muted-foreground w-20">Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cart.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="p-8 text-center text-muted-foreground">
                            No items in cart
                          </td>
                        </tr>
                      ) : (
                        cart.map(item => (
                          <tr key={item.id} className="border-b border-border">
                            <td className="p-2">
                              <input
                                type="checkbox"
                                checked={item.checked}
                                onChange={() => toggleItemCheck(item.id)}
                                className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                              />
                            </td>
                            <td className="p-2 text-sm text-foreground">{item.name}</td>
                            <td className="p-2">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  onClick={() => updateQuantity(item.id, -1)}
                                  className="w-6 h-6 flex items-center justify-center bg-secondary rounded hover:bg-accent text-foreground"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="w-8 text-center text-sm font-medium">{item.qty}</span>
                                <button
                                  onClick={() => updateQuantity(item.id, 1)}
                                  className="w-6 h-6 flex items-center justify-center bg-secondary rounded hover:bg-accent text-foreground"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                            </td>
                            <td className="p-2 text-right text-sm font-medium text-foreground">
                              ₹{item.price * item.qty}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Order Summary */}
                <div className="border-t border-border">
                  <div className="p-3 bg-muted flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">KOT: 10 Time - 0:330</span>
                    <span className="text-lg font-bold text-primary">Total: ₹{totalAmount.toFixed(1)}</span>
                  </div>

                  {/* Payment Options */}
                  <div className="p-3 border-t border-border">
                    <div className="flex flex-wrap gap-3 mb-3">
                      {['cash', 'due', 'card', 'part-payment', 'other'].map(mode => (
                        <label key={mode} className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="radio"
                            name="paymentMode"
                            value={mode}
                            checked={paymentMode === mode}
                            onChange={() => setPaymentMode(mode)}
                            className="w-3.5 h-3.5 text-primary"
                          />
                          <span className="text-xs text-foreground capitalize">
                            {mode === 'part-payment' ? 'Part Payment' : mode}
                          </span>
                        </label>
                      ))}
                    </div>

                    {/* Additional Options */}
                    <div className="flex flex-wrap gap-4 mb-3">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isPaid}
                          onChange={(e) => setIsPaid(e.target.checked)}
                          className="w-3.5 h-3.5 rounded text-primary"
                        />
                        <span className="text-xs text-foreground">It's Paid</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={useLoyalty}
                          onChange={(e) => setUseLoyalty(e.target.checked)}
                          className="w-3.5 h-3.5 rounded text-primary"
                        />
                        <span className="text-xs text-foreground">Loyalty</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={sendFeedback}
                          onChange={(e) => setSendFeedback(e.target.checked)}
                          className="w-3.5 h-3.5 rounded text-primary"
                        />
                        <span className="text-xs text-foreground">Send Feedback SMS</span>
                      </label>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="p-3 border-t border-border bg-secondary grid grid-cols-5 gap-2">
                    <button
                      onClick={handleSave}
                      className="px-2 py-2 text-xs font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleSaveAndPrint}
                      className="px-2 py-2 text-xs font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-1"
                    >
                      <Printer className="w-3 h-3" />
                      <span className="hidden xl:inline">Save &</span> Print
                    </button>
                    <button
                      onClick={handleSaveAndKOT}
                      className="px-2 py-2 text-xs font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      Save & KOT
                    </button>
                    <button
                      onClick={handleKOT}
                      className="px-2 py-2 text-xs font-medium bg-accent text-accent-foreground border border-primary rounded-lg hover:bg-accent/90 transition-colors"
                    >
                      KOT
                    </button>
                    <button
                      onClick={handleKOTAndPrint}
                      className="px-2 py-2 text-xs font-medium bg-accent text-accent-foreground border border-primary rounded-lg hover:bg-accent/90 transition-colors flex items-center justify-center gap-1"
                    >
                      <Printer className="w-3 h-3" />
                      <span className="hidden xl:inline">KOT &</span> Print
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            renderUnderConstruction(level4Tabs.find(t => t.id === activeLevel4Tab)?.label || 'Section')
          )}
        </>
      ) : (
        renderUnderConstruction(level3Tabs.find(t => t.id === activeLevel3Tab)?.label || 'Section')
      )}
    </div>
  );
};

export default RestaurantPOS;
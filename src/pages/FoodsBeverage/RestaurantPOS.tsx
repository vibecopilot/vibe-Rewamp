import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Minus, Trash2, Clock, Printer, ShoppingCart, Utensils, Leaf, Drumstick, Construction } from 'lucide-react';
import toast from 'react-hot-toast';

// Types
interface MenuItem {
  id: number;
  name: string;
  code: string;
  price: number;
  category: string;
  isVeg: boolean;
}

interface CartItem extends MenuItem {
  quantity: number;
}

type OrderType = 'dine-in' | 'delivery' | 'pickup';
type PaymentMode = 'cash' | 'due' | 'card' | 'part-payment' | 'other';

// Static menu data
const staticMenuItems: MenuItem[] = [
  // Veg Items
  { id: 1, name: 'Paneer Tikka', code: 'VEG001', price: 280, category: 'Favourite Items', isVeg: true },
  { id: 2, name: 'Paneer Kabab', code: 'VEG002', price: 250, category: 'Favourite Items', isVeg: true },
  { id: 3, name: 'Veg Spring Rolls', code: 'VEG003', price: 180, category: 'Favourite Items', isVeg: true },
  { id: 4, name: 'Mushroom Manchurian', code: 'VEG004', price: 220, category: 'Favourite Items', isVeg: true },
  { id: 5, name: 'Veg Momos', code: 'VEG005', price: 150, category: 'Favourite Items', isVeg: true },
  { id: 6, name: 'Aloo Tikki', code: 'VEG006', price: 120, category: 'Favourite Items', isVeg: true },
  // Non-Veg Items
  { id: 7, name: 'Chicken Lollipop', code: 'NV001', price: 320, category: 'Favourite Items', isVeg: false },
  { id: 8, name: 'Hara Bhara Kabab', code: 'NV002', price: 290, category: 'Favourite Items', isVeg: false },
  { id: 9, name: 'Fish Fingers', code: 'NV003', price: 350, category: 'Favourite Items', isVeg: false },
  { id: 10, name: 'Chicken Wings', code: 'NV004', price: 300, category: 'Favourite Items', isVeg: false },
  { id: 11, name: 'Mutton Seekh Kabab', code: 'NV005', price: 380, category: 'Favourite Items', isVeg: false },
  { id: 12, name: 'Prawns Fry', code: 'NV006', price: 420, category: 'Favourite Items', isVeg: false },
];

// Category tabs
const categoryTabs = [
  { id: 'favourite', label: 'Favourite Items', active: true },
  { id: 'starters', label: 'Starters', active: false },
  { id: 'main-course', label: 'Main Course', active: false },
  { id: 'beverages', label: 'Beverages', active: false },
  { id: 'desserts', label: 'Desserts', active: false },
  { id: 'chinese', label: 'Chinese', active: false },
  { id: 'south-indian', label: 'South Indian', active: false },
  { id: 'north-indian', label: 'North Indian', active: false },
  { id: 'biryani', label: 'Biryani & Rice', active: false },
  { id: 'bread', label: 'Bread & Roti', active: false },
  { id: 'salads', label: 'Salads', active: false },
  { id: 'snacks', label: 'Snacks', active: false },
  { id: 'combos', label: 'Combos/Thalis', active: false },
  { id: 'fastfood', label: 'Fastfood', active: false },
];

// Level 3 tabs for Restaurant Management
const level3Tabs = [
  { id: 'pos', label: 'POS', path: '/fb/restaurant/pos', active: true },
  { id: 'pantry', label: 'Pantry Management', path: '', active: false },
  { id: 'restaurant', label: 'Restaurant', path: '', active: false },
  { id: 'status', label: 'Status Setup', path: '', active: false },
  { id: 'categories', label: 'Categories Setup', path: '', active: false },
  { id: 'subcategories', label: 'Sub Categories Setup', path: '', active: false },
  { id: 'menu', label: 'Restaurant Menu', path: '', active: false },
  { id: 'bookings', label: 'Restaurant Bookings', path: '', active: false },
];

// Level 4 tabs for POS
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
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCartItems, setSelectedCartItems] = useState<number[]>([]);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('cash');
  const [isPaid, setIsPaid] = useState(false);
  const [useLoyalty, setUseLoyalty] = useState(false);
  const [sendFeedback, setSendFeedback] = useState(false);
  const [kotNumber, setKotNumber] = useState(1001);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerRunning && cart.length > 0) {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning, cart.length]);

  // Start timer when first item is added
  useEffect(() => {
    if (cart.length > 0 && !timerRunning) {
      setTimerRunning(true);
    }
    if (cart.length === 0) {
      setTimerRunning(false);
      setElapsedTime(0);
    }
  }, [cart.length, timerRunning]);

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Filter menu items based on search
  const filteredItems = staticMenuItems.filter(item => {
    const matchesName = item.name.toLowerCase().includes(searchItem.toLowerCase());
    const matchesCode = item.code.toLowerCase().includes(searchCode.toLowerCase());
    const matchesCategory = activeCategory === 'favourite' && item.category === 'Favourite Items';
    
    return matchesCategory && (searchItem ? matchesName : true) && (searchCode ? matchesCode : true);
  });

  const vegItems = filteredItems.filter(item => item.isVeg);
  const nonVegItems = filteredItems.filter(item => !item.isVeg);

  // Cart functions
  const addToCart = useCallback((item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(cartItem => cartItem.id === item.id);
      if (existing) {
        return prev.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    toast.success(`${item.name} added to cart`);
  }, []);

  const updateQuantity = useCallback((itemId: number, delta: number) => {
    setCart(prev => {
      const item = prev.find(i => i.id === itemId);
      if (!item) return prev;
      
      const newQty = item.quantity + delta;
      if (newQty <= 0) {
        toast.success(`${item.name} removed from cart`);
        return prev.filter(i => i.id !== itemId);
      }
      return prev.map(i => i.id === itemId ? { ...i, quantity: newQty } : i);
    });
  }, []);

  const removeSelected = useCallback(() => {
    if (selectedCartItems.length === 0) {
      toast.error('Please select items to remove');
      return;
    }
    setCart(prev => prev.filter(item => !selectedCartItems.includes(item.id)));
    setSelectedCartItems([]);
    toast.success('Selected items removed');
  }, [selectedCartItems]);

  const toggleCartItemSelection = (itemId: number) => {
    setSelectedCartItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const selectAllCartItems = () => {
    if (selectedCartItems.length === cart.length) {
      setSelectedCartItems([]);
    } else {
      setSelectedCartItems(cart.map(item => item.id));
    }
  };

  // Calculate total
  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Action handlers
  const handleSave = () => {
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }
    toast.success('Order saved successfully');
    resetOrder();
  };

  const handleSaveAndPrint = () => {
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }
    toast.success('Order saved and receipt printed');
    resetOrder();
  };

  const handleSaveAndKOT = () => {
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }
    toast.success(`Order saved and KOT #${kotNumber} generated`);
    setKotNumber(prev => prev + 1);
    resetOrder();
  };

  const handleKOT = () => {
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }
    toast.success(`KOT #${kotNumber} sent to kitchen`);
    setKotNumber(prev => prev + 1);
  };

  const handleKOTAndPrint = () => {
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }
    toast.success(`KOT #${kotNumber} sent to kitchen and printed`);
    setKotNumber(prev => prev + 1);
  };

  const resetOrder = () => {
    setCart([]);
    setSelectedCartItems([]);
    setPaymentMode('cash');
    setIsPaid(false);
    setUseLoyalty(false);
    setSendFeedback(false);
    setElapsedTime(0);
    setTimerRunning(false);
  };

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
    if (categoryId !== 'favourite') {
      toast('This category is under construction', { icon: '🚧' });
    }
    setActiveCategory(categoryId);
  };

  // Render under construction placeholder
  const renderUnderConstruction = (title: string) => (
    <div className="flex flex-col items-center justify-center h-96 bg-card border border-border rounded-lg">
      <Construction className="w-16 h-16 text-muted-foreground mb-4" />
      <h3 className="text-xl font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground">This section is under construction</p>
    </div>
  );

  // Check if showing under construction
  const showUnderConstruction = activeLevel3Tab !== 'pos' || activeLevel4Tab !== 'pos-main' || activeCategory !== 'favourite';

  return (
    <div className="flex flex-col h-full">
      {/* Breadcrumb */}
      <div className="text-sm text-muted-foreground mb-4">
        Booking Management &gt; F&B &gt; Restaurant Management &gt; POS
      </div>

      {/* Level 3 Tabs - Restaurant Management sections */}
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
            {!tab.active && <span className="ml-1 text-xs">(UC)</span>}
          </button>
        ))}
      </div>

      {activeLevel3Tab === 'pos' && (
        <>
          {/* Level 4 Tabs - POS sub-sections */}
          <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
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
                {!tab.active && <span className="ml-1 text-xs">(UC)</span>}
              </button>
            ))}
          </div>

          {activeLevel4Tab === 'pos-main' ? (
            <div className="flex gap-4 flex-1 min-h-0">
              {/* LEFT SECTION - Menu Display */}
              <div className="flex-1 flex flex-col bg-card border border-border rounded-lg p-4 overflow-hidden">
                {/* Search Controls */}
                <div className="flex flex-wrap gap-4 mb-4">
                  <div className="flex-1 min-w-[200px] relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search Item..."
                      value={searchItem}
                      onChange={(e) => setSearchItem(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div className="flex-1 min-w-[200px] relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search Code..."
                      value={searchCode}
                      onChange={(e) => setSearchCode(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  
                  {/* Order Type Buttons */}
                  <div className="flex gap-2">
                    {(['dine-in', 'delivery', 'pickup'] as OrderType[]).map(type => (
                      <button
                        key={type}
                        onClick={() => setOrderType(type)}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                          orderType === type
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-secondary text-muted-foreground hover:bg-accent'
                        }`}
                      >
                        {type === 'dine-in' ? 'Dine In' : type === 'delivery' ? 'Delivery' : 'Pick Up'}
                      </button>
                    ))}
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
                      {!cat.active && ' (UC)'}
                    </button>
                  ))}
                </div>

                {/* Item Display Section */}
                {activeCategory === 'favourite' ? (
                  <div className="flex-1 overflow-y-auto">
                    {/* Veg Section */}
                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-3">
                        <Leaf className="w-5 h-5 text-green-600" />
                        <h3 className="text-lg font-semibold text-foreground">Veg</h3>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {vegItems.map(item => (
                          <div
                            key={item.id}
                            onClick={() => addToCart(item)}
                            className="p-3 bg-background border-2 border-green-500 rounded-lg cursor-pointer hover:shadow-lg transition-shadow"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="w-4 h-4 border-2 border-green-600 flex items-center justify-center">
                                <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                              </span>
                              <span className="text-xs text-muted-foreground">{item.code}</span>
                            </div>
                            <h4 className="text-sm font-medium text-foreground mb-1">{item.name}</h4>
                            <p className="text-sm font-bold text-primary">₹{item.price}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Non-Veg Section */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Drumstick className="w-5 h-5 text-red-600" />
                        <h3 className="text-lg font-semibold text-foreground">Non Veg</h3>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {nonVegItems.map(item => (
                          <div
                            key={item.id}
                            onClick={() => addToCart(item)}
                            className="p-3 bg-background border-2 border-red-500 rounded-lg cursor-pointer hover:shadow-lg transition-shadow"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="w-4 h-4 border-2 border-red-600 flex items-center justify-center">
                                <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                              </span>
                              <span className="text-xs text-muted-foreground">{item.code}</span>
                            </div>
                            <h4 className="text-sm font-medium text-foreground mb-1">{item.name}</h4>
                            <p className="text-sm font-bold text-primary">₹{item.price}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  renderUnderConstruction(categoryTabs.find(c => c.id === activeCategory)?.label || 'Category')
                )}
              </div>

              {/* RIGHT SECTION - Cart & Billing */}
              <div className="w-96 flex flex-col bg-card border border-border rounded-lg overflow-hidden">
                {/* Cart Header */}
                <div className="p-4 border-b border-border bg-secondary">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="w-5 h-5 text-primary" />
                      <h3 className="font-semibold text-foreground">Cart</h3>
                      <span className="text-sm text-muted-foreground">({cart.length} items)</span>
                    </div>
                    {selectedCartItems.length > 0 && (
                      <button
                        onClick={removeSelected}
                        className="p-2 text-destructive hover:bg-destructive/10 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Cart Table */}
                <div className="flex-1 overflow-y-auto">
                  {cart.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                      <Utensils className="w-12 h-12 mb-2 opacity-50" />
                      <p>No items in cart</p>
                    </div>
                  ) : (
                    <table className="w-full">
                      <thead className="bg-muted sticky top-0">
                        <tr>
                          <th className="p-2 text-left text-xs font-medium text-muted-foreground">
                            <input
                              type="checkbox"
                              checked={selectedCartItems.length === cart.length && cart.length > 0}
                              onChange={selectAllCartItems}
                              className="w-4 h-4 rounded border-border"
                            />
                          </th>
                          <th className="p-2 text-left text-xs font-medium text-muted-foreground">Item</th>
                          <th className="p-2 text-center text-xs font-medium text-muted-foreground">Qty</th>
                          <th className="p-2 text-right text-xs font-medium text-muted-foreground">Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cart.map(item => (
                          <tr key={item.id} className="border-b border-border">
                            <td className="p-2">
                              <input
                                type="checkbox"
                                checked={selectedCartItems.includes(item.id)}
                                onChange={() => toggleCartItemSelection(item.id)}
                                className="w-4 h-4 rounded border-border"
                              />
                            </td>
                            <td className="p-2">
                              <div className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${item.isVeg ? 'bg-green-600' : 'bg-red-600'}`}></span>
                                <span className="text-sm text-foreground">{item.name}</span>
                              </div>
                            </td>
                            <td className="p-2">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  onClick={() => updateQuantity(item.id, -1)}
                                  className="w-6 h-6 flex items-center justify-center bg-secondary rounded hover:bg-accent"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                                <button
                                  onClick={() => updateQuantity(item.id, 1)}
                                  className="w-6 h-6 flex items-center justify-center bg-secondary rounded hover:bg-accent"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                            </td>
                            <td className="p-2 text-right text-sm font-medium text-foreground">
                              ₹{item.price * item.quantity}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                {/* Order Summary */}
                <div className="border-t border-border">
                  <div className="p-3 bg-muted flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <span className="text-muted-foreground">KOT: <span className="font-medium text-foreground">{kotNumber}</span></span>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        {formatTime(elapsedTime)}
                      </span>
                    </div>
                    <div className="text-lg font-bold text-primary">
                      Total: ₹{totalAmount}
                    </div>
                  </div>

                  {/* Payment Options */}
                  <div className="p-3 border-t border-border">
                    <p className="text-xs font-medium text-muted-foreground mb-2">Payment Mode</p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {([
                        { value: 'cash', label: 'Cash' },
                        { value: 'due', label: 'Due' },
                        { value: 'card', label: 'Card' },
                        { value: 'part-payment', label: 'Part Payment' },
                        { value: 'other', label: 'Other' },
                      ] as { value: PaymentMode; label: string }[]).map(option => (
                        <label key={option.value} className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="radio"
                            name="paymentMode"
                            value={option.value}
                            checked={paymentMode === option.value}
                            onChange={() => setPaymentMode(option.value)}
                            className="w-3.5 h-3.5 text-primary"
                          />
                          <span className="text-xs text-foreground">{option.label}</span>
                        </label>
                      ))}
                    </div>

                    {/* Additional Options */}
                    <div className="flex flex-wrap gap-3 mb-3">
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
                  <div className="p-3 border-t border-border bg-secondary grid grid-cols-3 gap-2">
                    <button
                      onClick={handleSave}
                      className="px-3 py-2 text-xs font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleSaveAndPrint}
                      className="px-3 py-2 text-xs font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-1"
                    >
                      <Printer className="w-3 h-3" />
                      Save & Print
                    </button>
                    <button
                      onClick={handleSaveAndKOT}
                      className="px-3 py-2 text-xs font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      Save & KOT
                    </button>
                    <button
                      onClick={handleKOT}
                      className="px-3 py-2 text-xs font-medium bg-accent text-accent-foreground border border-primary rounded-lg hover:bg-accent/90 transition-colors"
                    >
                      KOT
                    </button>
                    <button
                      onClick={handleKOTAndPrint}
                      className="px-3 py-2 text-xs font-medium bg-accent text-accent-foreground border border-primary rounded-lg hover:bg-accent/90 transition-colors flex items-center justify-center gap-1 col-span-2"
                    >
                      <Printer className="w-3 h-3" />
                      KOT & Print
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            renderUnderConstruction(level4Tabs.find(t => t.id === activeLevel4Tab)?.label || 'Section')
          )}
        </>
      )}

      {activeLevel3Tab !== 'pos' && renderUnderConstruction(level3Tabs.find(t => t.id === activeLevel3Tab)?.label || 'Section')}
    </div>
  );
};

export default RestaurantPOS;

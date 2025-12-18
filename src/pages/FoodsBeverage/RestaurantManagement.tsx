import React, { useState, useMemo } from 'react';
import { Search, Plus, Minus, Printer, Construction, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';
import FBSetup from './FBSetup';

// Types
interface MenuItem {
  id: number;
  name: string;
  price: number;
}

interface CartItem extends MenuItem {
  qty: number;
  checked: boolean;
}

type OrderType = 'dine-in' | 'delivery' | 'pickup';

// Static menu data
const vegItems: MenuItem[] = [
  { id: 1, name: "Paneer Tikka", price: 80 },
  { id: 2, name: "Paneer Kabab", price: 90 },
  { id: 3, name: "Veg Spring Roles", price: 70 }
];

const nonVegItems: MenuItem[] = [
  { id: 4, name: "Chicken Lollipop", price: 240 },
  { id: 5, name: "Hara Bhara Kabab", price: 180 },
  { id: 6, name: "Fish Fingers", price: 200 }
];

// Level 3 - Main F&B Navigation
const level3Tabs = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'pos', label: 'POS' },
  { id: 'orders', label: 'Orders' },
  { id: 'menu', label: 'Menu' },
  { id: 'inventory', label: 'Inventory' },
  { id: 'reports', label: 'Reports' },
  { id: 'setup', label: 'Setup' },
  { id: 'customers', label: 'Customers' },
  { id: 'staff', label: 'Staff' },
];

// Level 4 - POS sub-tabs
const level4Tabs = [
  { id: 'pos', label: 'POS' },
  { id: 'new-table', label: 'New Table' },
  { id: 'order-delivery', label: 'Order Delivery' },
  { id: 'tables', label: 'Tables' },
];

// Level 5 - Category tabs
const level5Tabs = [
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

const RestaurantManagement: React.FC = () => {
  // Collapse states for each level
  const [level3Collapsed, setLevel3Collapsed] = useState(false);
  const [level4Collapsed, setLevel4Collapsed] = useState(false);
  const [level5Collapsed, setLevel5Collapsed] = useState(false);
  
  // Tab states
  const [activeLevel3Tab, setActiveLevel3Tab] = useState('pos');
  const [activeLevel4Tab, setActiveLevel4Tab] = useState('pos');
  const [activeLevel5Tab, setActiveLevel5Tab] = useState('favourite');
  
  
  // POS states
  const [searchItem, setSearchItem] = useState('');
  const [searchCode, setSearchCode] = useState('');
  const [orderType, setOrderType] = useState<OrderType>('dine-in');
  
  // Cart state
  const [cart, setCart] = useState<CartItem[]>([
    { id: 1, name: "Paneer Tikka", qty: 1, price: 80, checked: true },
    { id: 3, name: "Veg Spring Roles", qty: 1, price: 70, checked: true },
    { id: 4, name: "Chicken Lollipop", qty: 1, price: 240, checked: true }
  ]);
  
  const [paymentMode, setPaymentMode] = useState('cash');
  const [isPaid, setIsPaid] = useState(false);
  const [useLoyalty, setUseLoyalty] = useState(false);
  const [sendFeedback, setSendFeedback] = useState(false);

  // Calculate total
  const totalAmount = useMemo(() => {
    return cart.filter(item => item.checked).reduce((sum, item) => sum + (item.price * item.qty), 0);
  }, [cart]);

  // Cart functions
  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(cartItem => cartItem.id === item.id);
      if (existing) {
        toast.success(`${item.name} quantity increased`);
        return prev.map(cartItem =>
          cartItem.id === item.id ? { ...cartItem, qty: cartItem.qty + 1 } : cartItem
        );
      }
      toast.success(`${item.name} added to cart`);
      return [...prev, { ...item, qty: 1, checked: true }];
    });
  };

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

  const toggleItemCheck = (itemId: number) => {
    setCart(prev => prev.map(item =>
      item.id === itemId ? { ...item, checked: !item.checked } : item
    ));
  };

  const handleOrderTypeChange = (type: OrderType) => {
    setOrderType(type);
    const typeLabels = { 'dine-in': 'Dine In', 'delivery': 'Delivery', 'pickup': 'Pick Up' };
    toast.success(`Order type changed to ${typeLabels[type]}`);
  };

  // Tab handlers
  const handleLevel3TabClick = (tabId: string) => {
    if (tabId !== 'pos' && tabId !== 'setup') {
      toast('This section is under construction', { icon: '🚧' });
    }
    setActiveLevel3Tab(tabId);
  };

  const handleLevel4TabClick = (tabId: string) => {
    if (tabId !== 'pos') {
      toast('This section is under construction', { icon: '🚧' });
    }
    setActiveLevel4Tab(tabId);
  };

  const handleLevel5TabClick = (tabId: string) => {
    if (tabId !== 'favourite') {
      toast('This section is under construction', { icon: '🚧' });
      return;
    }
    setActiveLevel5Tab(tabId);
  };

  // Action handlers
  const handleSave = () => {
    if (cart.length === 0) { toast.error('Cart is empty'); return; }
    toast.success('Order saved successfully!');
  };

  const handleSaveAndPrint = () => {
    if (cart.length === 0) { toast.error('Cart is empty'); return; }
    toast.success('Order saved and sent to printer');
  };

  const handleSaveAndKOT = () => {
    if (cart.length === 0) { toast.error('Cart is empty'); return; }
    toast.success('Order saved and kitchen order sent');
  };

  const handleKOT = () => {
    if (cart.length === 0) { toast.error('Cart is empty'); return; }
    toast.success('Kitchen order sent');
  };

  const handleKOTAndPrint = () => {
    if (cart.length === 0) { toast.error('Cart is empty'); return; }
    toast.success('Kitchen order sent and printed');
  };

  // Under construction placeholder
  const renderUnderConstruction = (title: string) => (
    <div className="flex flex-col items-center justify-center h-80 bg-card border border-border rounded-lg">
      <Construction className="w-16 h-16 text-muted-foreground mb-4" />
      <h3 className="text-xl font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground">This section is under construction</p>
    </div>
  );

  // Item Card
  const ItemCard = ({ item, isVeg }: { item: MenuItem; isVeg: boolean }) => (
    <div
      onClick={() => addToCart(item)}
      className={`bg-card p-4 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] border-l-4 ${
        isVeg ? 'border-l-green-500' : 'border-l-red-500'
      } border border-border`}
    >
      <div className="text-center">
        <h4 className="text-sm font-medium text-foreground">{item.name}</h4>
        <p className="text-xs text-muted-foreground mt-1">₹{item.price}</p>
      </div>
    </div>
  );

  // POS Content (60/40 split)
  const renderPOSContent = () => (
    <div className="flex gap-4 flex-1 min-h-[500px]">
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
            {(['dine-in', 'delivery', 'pickup'] as OrderType[]).map(type => (
              <button
                key={type}
                onClick={() => handleOrderTypeChange(type)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  orderType === type
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-background text-foreground border border-border hover:bg-accent'
                }`}
              >
                {type === 'dine-in' ? 'Dine In' : type === 'delivery' ? 'Delivery' : 'Pick Up'}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Items */}
        <div className="flex-1 overflow-y-auto">
          {/* Veg Section */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-3 h-3 bg-green-500 rounded-full"></span>
              <h3 className="text-base font-semibold text-foreground">Veg</h3>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {vegItems.map(item => (
                <ItemCard key={item.id} item={item} isVeg={true} />
              ))}
            </div>
          </div>

          {/* Non-Veg Section */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-3 h-3 bg-red-500 rounded-full"></span>
              <h3 className="text-base font-semibold text-foreground">Non Veg</h3>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {nonVegItems.map(item => (
                <ItemCard key={item.id} item={item} isVeg={false} />
              ))}
            </div>
          </div>
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
                  <td colSpan={4} className="p-8 text-center text-muted-foreground">No items in cart</td>
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
                    <td className="p-2 text-right text-sm font-medium text-foreground">₹{item.price * item.qty}</td>
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

            <div className="flex flex-wrap gap-4 mb-3">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" checked={isPaid} onChange={(e) => setIsPaid(e.target.checked)} className="w-3.5 h-3.5 rounded text-primary" />
                <span className="text-xs text-foreground">It's Paid</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" checked={useLoyalty} onChange={(e) => setUseLoyalty(e.target.checked)} className="w-3.5 h-3.5 rounded text-primary" />
                <span className="text-xs text-foreground">Loyalty</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" checked={sendFeedback} onChange={(e) => setSendFeedback(e.target.checked)} className="w-3.5 h-3.5 rounded text-primary" />
                <span className="text-xs text-foreground">Send Feedback SMS</span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-3 border-t border-border bg-secondary grid grid-cols-5 gap-2">
            <button onClick={handleSave} className="px-2 py-2 text-xs font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">Save</button>
            <button onClick={handleSaveAndPrint} className="px-2 py-2 text-xs font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 flex items-center justify-center gap-1">
              <Printer className="w-3 h-3" /> Print
            </button>
            <button onClick={handleSaveAndKOT} className="px-2 py-2 text-xs font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">Save & KOT</button>
            <button onClick={handleKOT} className="px-2 py-2 text-xs font-medium bg-accent text-accent-foreground border border-primary rounded-lg hover:bg-accent/90">KOT</button>
            <button onClick={handleKOTAndPrint} className="px-2 py-2 text-xs font-medium bg-accent text-accent-foreground border border-primary rounded-lg hover:bg-accent/90 flex items-center justify-center gap-1">
              <Printer className="w-3 h-3" /> Print
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Get active tab label for under construction
  const getActiveLevel3Label = () => {
    const tab = level3Tabs.find(t => t.id === activeLevel3Tab);
    if (tab) return tab.label;
    const moreTab = moreDropdownItems.find(t => t.id === activeLevel3Tab);
    return moreTab?.label || 'Section';
  };

  return (
    <div className="flex flex-col">
      {/* LEVEL 3 - Main F&B Navigation */}
      <div className="flex items-center w-full bg-background border-b border-border">
        <div className={`flex-1 overflow-hidden transition-all duration-300 ${level3Collapsed ? 'max-h-0' : 'max-h-12'}`}>
          <nav className="w-full overflow-x-auto scrollbar-hide">
            <ul className="flex items-center w-full">
              {level3Tabs.map(tab => (
                <li key={tab.id} className="flex-1 min-w-0">
                  <button
                    onClick={() => handleLevel3TabClick(tab.id)}
                    className={`w-full px-4 py-3 text-xs font-semibold transition-colors whitespace-nowrap uppercase tracking-wide text-center ${
                      activeLevel3Tab === tab.id
                        ? 'text-primary border-b-2 border-primary bg-accent/30'
                        : 'text-foreground hover:bg-accent'
                    }`}
                  >
                    {tab.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        {/* Collapse Button */}
        <button
          onClick={() => setLevel3Collapsed(!level3Collapsed)}
          className="flex-shrink-0 p-2 rounded hover:bg-accent transition-colors mr-2"
          title={level3Collapsed ? "Expand" : "Collapse"}
        >
          {level3Collapsed ? <ChevronDown size={16} className="text-muted-foreground" /> : <ChevronUp size={16} className="text-muted-foreground" />}
        </button>
      </div>

      {/* Content based on Level 3 tab */}
      {activeLevel3Tab === 'pos' ? (
        <>
          {/* LEVEL 4 - POS sub-navigation */}
          <div className="flex items-center w-full border-b border-border bg-muted/30">
            <div className={`flex-1 overflow-hidden transition-all duration-300 ${level4Collapsed ? 'max-h-0' : 'max-h-12'}`}>
              <nav className="w-full overflow-x-auto scrollbar-hide">
                <ul className="flex items-center w-full">
                  {level4Tabs.map(tab => (
                    <li key={tab.id} className="flex-1 min-w-0">
                      <button
                        onClick={() => handleLevel4TabClick(tab.id)}
                        className={`w-full px-4 py-3 text-xs font-semibold transition-colors whitespace-nowrap uppercase tracking-wide text-center ${
                          activeLevel4Tab === tab.id
                            ? 'text-primary border-b-2 border-primary bg-accent/30'
                            : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                        }`}
                      >
                        {tab.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
            {/* Collapse Button */}
            <button
              onClick={() => setLevel4Collapsed(!level4Collapsed)}
              className="flex-shrink-0 p-2 rounded hover:bg-accent transition-colors mr-2"
              title={level4Collapsed ? "Expand" : "Collapse"}
            >
              {level4Collapsed ? <ChevronDown size={14} className="text-muted-foreground" /> : <ChevronUp size={14} className="text-muted-foreground" />}
            </button>
          </div>

          {/* Content based on Level 4 tab */}
          {activeLevel4Tab === 'pos' ? (
            <>
              {/* LEVEL 5 - Category tabs */}
              <div className="flex items-center w-full border-b border-border bg-muted/10">
                <div className={`flex-1 overflow-hidden transition-all duration-300 ${level5Collapsed ? 'max-h-0' : 'max-h-12'}`}>
                  <nav className="w-full overflow-x-auto scrollbar-hide">
                    <ul className="flex items-center w-full">
                      {level5Tabs.map(tab => (
                        <li key={tab.id} className="flex-1 min-w-0">
                          <button
                            onClick={() => handleLevel5TabClick(tab.id)}
                            className={`w-full px-2 py-3 text-xs font-semibold transition-colors whitespace-nowrap uppercase tracking-wide text-center ${
                              activeLevel5Tab === tab.id
                                ? 'text-primary border-b-2 border-primary bg-accent/30'
                                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                            }`}
                          >
                            {tab.label}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </nav>
                </div>
                {/* Collapse Button */}
                <button
                  onClick={() => setLevel5Collapsed(!level5Collapsed)}
                  className="flex-shrink-0 p-2 rounded hover:bg-accent transition-colors mr-2"
                  title={level5Collapsed ? "Expand" : "Collapse"}
                >
                  {level5Collapsed ? <ChevronDown size={12} className="text-muted-foreground" /> : <ChevronUp size={12} className="text-muted-foreground" />}
                </button>
              </div>

              {/* POS Content */}
              <div className="p-4">
                {activeLevel5Tab === 'favourite' ? renderPOSContent() : renderUnderConstruction(level5Tabs.find(t => t.id === activeLevel5Tab)?.label || 'Section')}
              </div>
            </>
          ) : (
            <div className="p-4">
              {renderUnderConstruction(level4Tabs.find(t => t.id === activeLevel4Tab)?.label || 'Section')}
            </div>
          )}
        </>
      ) : activeLevel3Tab === 'setup' ? (
        <FBSetup />
      ) : (
        <div className="p-4">
          {renderUnderConstruction(getActiveLevel3Label())}
        </div>
      )}
    </div>
  );
};

export default RestaurantManagement;

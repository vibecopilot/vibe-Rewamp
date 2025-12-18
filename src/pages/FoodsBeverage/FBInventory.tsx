import React, { useState, useMemo } from 'react';
import { 
  Plus, Search, Eye, Edit2, Trash2, Download, Grid, List, Package, 
  ShoppingCart, Users, BarChart3, AlertTriangle, TrendingDown, X,
  ChevronLeft, ChevronRight, Check, Clock, FileText
} from 'lucide-react';
import toast from 'react-hot-toast';

// Types
interface Ingredient {
  id: number;
  name: string;
  category: string;
  currentStock: number;
  minStockLevel: number;
  maxStockLevel: number;
  unit: string;
  costPerUnit: number;
  supplier: string;
  storageLocation: string;
  expiryDate: string;
  notes: string;
  lastUpdated: string;
}

interface PurchaseOrder {
  id: string;
  date: string;
  supplier: string;
  itemsCount: number;
  totalAmount: number;
  expectedDelivery: string;
  status: 'pending' | 'approved' | 'received' | 'partial' | 'cancelled';
  paymentTerms: string;
  notes: string;
  items: POItem[];
}

interface POItem {
  ingredientId: number;
  ingredientName: string;
  quantity: number;
  unit: string;
  rate: number;
  amount: number;
}

interface Supplier {
  id: number;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  category: string;
  paymentTerms: string;
  isActive: boolean;
  totalOrders: number;
  lastOrder: string;
  address: string;
  city: string;
  state: string;
  pinCode: string;
  gstNumber: string;
  panNumber: string;
}

// Static Data
const initialIngredients: Ingredient[] = [
  { id: 1, name: 'Chicken (Raw)', category: 'Proteins', currentStock: 5, minStockLevel: 10, maxStockLevel: 25, unit: 'kg', costPerUnit: 250, supplier: 'ABC Foods Ltd.', storageLocation: 'Freezer 1', expiryDate: '2025-12-25', notes: '', lastUpdated: '2h ago' },
  { id: 2, name: 'Mutton (Raw)', category: 'Proteins', currentStock: 2, minStockLevel: 8, maxStockLevel: 20, unit: 'kg', costPerUnit: 500, supplier: 'Meat Market', storageLocation: 'Freezer 1', expiryDate: '2025-12-24', notes: '', lastUpdated: '3h ago' },
  { id: 3, name: 'Fish (Raw)', category: 'Proteins', currentStock: 3, minStockLevel: 5, maxStockLevel: 15, unit: 'kg', costPerUnit: 350, supplier: 'ABC Foods Ltd.', storageLocation: 'Freezer 2', expiryDate: '2025-12-22', notes: '', lastUpdated: '4h ago' },
  { id: 4, name: 'Paneer', category: 'Proteins', currentStock: 3, minStockLevel: 5, maxStockLevel: 12, unit: 'kg', costPerUnit: 300, supplier: 'Dairy Mart', storageLocation: 'Refrigerator', expiryDate: '2025-12-23', notes: '', lastUpdated: '5h ago' },
  { id: 5, name: 'Eggs', category: 'Proteins', currentStock: 50, minStockLevel: 100, maxStockLevel: 200, unit: 'pcs', costPerUnit: 6, supplier: 'Organic Farms', storageLocation: 'Refrigerator', expiryDate: '2025-12-28', notes: '', lastUpdated: '1h ago' },
  { id: 6, name: 'Rice (Basmati)', category: 'Grains', currentStock: 25, minStockLevel: 20, maxStockLevel: 50, unit: 'kg', costPerUnit: 80, supplier: 'Grain Traders', storageLocation: 'Dry Storage', expiryDate: '2026-06-15', notes: '', lastUpdated: '1d ago' },
  { id: 7, name: 'Rice (Regular)', category: 'Grains', currentStock: 30, minStockLevel: 25, maxStockLevel: 60, unit: 'kg', costPerUnit: 50, supplier: 'Grain Traders', storageLocation: 'Dry Storage', expiryDate: '2026-06-15', notes: '', lastUpdated: '1d ago' },
  { id: 8, name: 'Wheat Flour', category: 'Grains', currentStock: 40, minStockLevel: 30, maxStockLevel: 80, unit: 'kg', costPerUnit: 40, supplier: 'Grain Traders', storageLocation: 'Dry Storage', expiryDate: '2026-03-15', notes: '', lastUpdated: '2d ago' },
  { id: 9, name: 'Onions', category: 'Vegetables', currentStock: 15, minStockLevel: 10, maxStockLevel: 30, unit: 'kg', costPerUnit: 40, supplier: 'Fresh Veggies Co', storageLocation: 'Vegetable Rack', expiryDate: '2025-12-25', notes: '', lastUpdated: '6h ago' },
  { id: 10, name: 'Tomatoes', category: 'Vegetables', currentStock: 8, minStockLevel: 10, maxStockLevel: 25, unit: 'kg', costPerUnit: 50, supplier: 'Fresh Veggies Co', storageLocation: 'Refrigerator', expiryDate: '2025-12-22', notes: '', lastUpdated: '4h ago' },
  { id: 11, name: 'Potatoes', category: 'Vegetables', currentStock: 20, minStockLevel: 15, maxStockLevel: 40, unit: 'kg', costPerUnit: 30, supplier: 'Fresh Veggies Co', storageLocation: 'Vegetable Rack', expiryDate: '2025-12-30', notes: '', lastUpdated: '1d ago' },
  { id: 12, name: 'Capsicum', category: 'Vegetables', currentStock: 5, minStockLevel: 8, maxStockLevel: 15, unit: 'kg', costPerUnit: 60, supplier: 'Organic Farms', storageLocation: 'Refrigerator', expiryDate: '2025-12-21', notes: '', lastUpdated: '5h ago' },
  { id: 13, name: 'Green Chillies', category: 'Vegetables', currentStock: 2, minStockLevel: 3, maxStockLevel: 8, unit: 'kg', costPerUnit: 80, supplier: 'Fresh Veggies Co', storageLocation: 'Refrigerator', expiryDate: '2025-12-20', notes: '', lastUpdated: '3h ago' },
  { id: 14, name: 'Ginger', category: 'Vegetables', currentStock: 3, minStockLevel: 5, maxStockLevel: 10, unit: 'kg', costPerUnit: 100, supplier: 'Spice House', storageLocation: 'Refrigerator', expiryDate: '2025-12-28', notes: '', lastUpdated: '8h ago' },
  { id: 15, name: 'Garlic', category: 'Vegetables', currentStock: 4, minStockLevel: 5, maxStockLevel: 12, unit: 'kg', costPerUnit: 120, supplier: 'Spice House', storageLocation: 'Dry Storage', expiryDate: '2025-12-30', notes: '', lastUpdated: '8h ago' },
  { id: 16, name: 'Milk', category: 'Dairy', currentStock: 10, minStockLevel: 20, maxStockLevel: 40, unit: 'ltr', costPerUnit: 60, supplier: 'Dairy Mart', storageLocation: 'Refrigerator', expiryDate: '2025-12-20', notes: '', lastUpdated: '1h ago' },
  { id: 17, name: 'Butter', category: 'Dairy', currentStock: 2, minStockLevel: 5, maxStockLevel: 12, unit: 'kg', costPerUnit: 400, supplier: 'Dairy Mart', storageLocation: 'Refrigerator', expiryDate: '2026-01-15', notes: '', lastUpdated: '2h ago' },
  { id: 18, name: 'Cream', category: 'Dairy', currentStock: 3, minStockLevel: 5, maxStockLevel: 10, unit: 'ltr', costPerUnit: 300, supplier: 'Dairy Mart', storageLocation: 'Refrigerator', expiryDate: '2025-12-22', notes: '', lastUpdated: '4h ago' },
  { id: 19, name: 'Curd', category: 'Dairy', currentStock: 5, minStockLevel: 8, maxStockLevel: 15, unit: 'kg', costPerUnit: 60, supplier: 'Dairy Mart', storageLocation: 'Refrigerator', expiryDate: '2025-12-21', notes: '', lastUpdated: '3h ago' },
  { id: 20, name: 'Cooking Oil', category: 'Oil & Ghee', currentStock: 15, minStockLevel: 20, maxStockLevel: 40, unit: 'ltr', costPerUnit: 150, supplier: 'Oil Depot', storageLocation: 'Dry Storage', expiryDate: '2026-06-15', notes: '', lastUpdated: '1d ago' },
  { id: 21, name: 'Ghee', category: 'Oil & Ghee', currentStock: 5, minStockLevel: 8, maxStockLevel: 15, unit: 'kg', costPerUnit: 500, supplier: 'Oil Depot', storageLocation: 'Dry Storage', expiryDate: '2026-03-15', notes: '', lastUpdated: '2d ago' },
  { id: 22, name: 'Garam Masala', category: 'Spices', currentStock: 0.5, minStockLevel: 1, maxStockLevel: 3, unit: 'kg', costPerUnit: 400, supplier: 'Spice House', storageLocation: 'Spice Rack', expiryDate: '2026-06-15', notes: '', lastUpdated: '1d ago' },
  { id: 23, name: 'Turmeric Powder', category: 'Spices', currentStock: 0.8, minStockLevel: 1, maxStockLevel: 3, unit: 'kg', costPerUnit: 200, supplier: 'Spice House', storageLocation: 'Spice Rack', expiryDate: '2026-06-15', notes: '', lastUpdated: '1d ago' },
  { id: 24, name: 'Red Chilli Powder', category: 'Spices', currentStock: 0.6, minStockLevel: 1, maxStockLevel: 3, unit: 'kg', costPerUnit: 300, supplier: 'Spice House', storageLocation: 'Spice Rack', expiryDate: '2026-06-15', notes: '', lastUpdated: '1d ago' },
  { id: 25, name: 'Coriander Powder', category: 'Spices', currentStock: 0.7, minStockLevel: 1, maxStockLevel: 3, unit: 'kg', costPerUnit: 150, supplier: 'Spice House', storageLocation: 'Spice Rack', expiryDate: '2026-06-15', notes: '', lastUpdated: '1d ago' },
  { id: 26, name: 'Tea Leaves', category: 'Beverages', currentStock: 2, minStockLevel: 3, maxStockLevel: 8, unit: 'kg', costPerUnit: 400, supplier: 'Beverage Co', storageLocation: 'Dry Storage', expiryDate: '2026-03-15', notes: '', lastUpdated: '3d ago' },
  { id: 27, name: 'Coffee Powder', category: 'Beverages', currentStock: 1.5, minStockLevel: 2, maxStockLevel: 5, unit: 'kg', costPerUnit: 600, supplier: 'Beverage Co', storageLocation: 'Dry Storage', expiryDate: '2026-03-15', notes: '', lastUpdated: '3d ago' },
];

const initialPurchaseOrders: PurchaseOrder[] = [
  { id: 'PO001', date: 'Dec 15, 2025', supplier: 'ABC Foods', itemsCount: 8, totalAmount: 15450, expectedDelivery: 'Dec 20', status: 'approved', paymentTerms: '15 Days Credit', notes: '', items: [] },
  { id: 'PO002', date: 'Dec 16, 2025', supplier: 'XYZ Suppliers', itemsCount: 5, totalAmount: 8200, expectedDelivery: 'Dec 21', status: 'pending', paymentTerms: '7 Days Credit', notes: '', items: [] },
  { id: 'PO003', date: 'Dec 12, 2025', supplier: 'Fresh Veggies Co', itemsCount: 12, totalAmount: 4560, expectedDelivery: 'Dec 18', status: 'received', paymentTerms: 'Cash', notes: '', items: [] },
  { id: 'PO004', date: 'Dec 14, 2025', supplier: 'Dairy Mart', itemsCount: 6, totalAmount: 6800, expectedDelivery: 'Dec 19', status: 'partial', paymentTerms: '7 Days Credit', notes: '', items: [] },
  { id: 'PO005', date: 'Dec 10, 2025', supplier: 'Spice House', itemsCount: 10, totalAmount: 12300, expectedDelivery: 'Dec 17', status: 'received', paymentTerms: '15 Days Credit', notes: '', items: [] },
  { id: 'PO006', date: 'Dec 13, 2025', supplier: 'Meat Market', itemsCount: 4, totalAmount: 9500, expectedDelivery: 'Dec 18', status: 'cancelled', paymentTerms: 'Cash', notes: '', items: [] },
  { id: 'PO007', date: 'Dec 17, 2025', supplier: 'Grain Traders', itemsCount: 7, totalAmount: 11200, expectedDelivery: 'Dec 22', status: 'pending', paymentTerms: '30 Days Credit', notes: '', items: [] },
  { id: 'PO008', date: 'Dec 11, 2025', supplier: 'Oil Depot', itemsCount: 3, totalAmount: 5400, expectedDelivery: 'Dec 16', status: 'received', paymentTerms: '15 Days Credit', notes: '', items: [] },
  { id: 'PO009', date: 'Dec 16, 2025', supplier: 'ABC Foods', itemsCount: 9, totalAmount: 18750, expectedDelivery: 'Dec 21', status: 'approved', paymentTerms: '15 Days Credit', notes: '', items: [] },
  { id: 'PO010', date: 'Dec 15, 2025', supplier: 'Beverage Co', itemsCount: 5, totalAmount: 7890, expectedDelivery: 'Dec 20', status: 'approved', paymentTerms: '7 Days Credit', notes: '', items: [] },
];

const initialSuppliers: Supplier[] = [
  { id: 1, name: 'ABC Foods Ltd.', contactPerson: 'Rahul Sharma', phone: '9876543210', email: 'abc@foods.com', category: 'Proteins', paymentTerms: '15 Days', isActive: true, totalOrders: 45, lastOrder: 'Dec 15', address: '123 Food Street', city: 'Mumbai', state: 'Maharashtra', pinCode: '400001', gstNumber: '27ABCDE1234F1Z5', panNumber: 'ABCDE1234F' },
  { id: 2, name: 'XYZ Suppliers', contactPerson: 'Priya Singh', phone: '9876543211', email: 'xyz@suppliers.com', category: 'Grains', paymentTerms: '7 Days', isActive: true, totalOrders: 32, lastOrder: 'Dec 16', address: '456 Grain Market', city: 'Delhi', state: 'Delhi', pinCode: '110001', gstNumber: '07XYZAB5678C1Z2', panNumber: 'XYZAB5678C' },
  { id: 3, name: 'Fresh Veggies Co', contactPerson: 'Amit Kumar', phone: '9876543212', email: 'fresh@veggies.com', category: 'Vegetables', paymentTerms: 'Cash', isActive: true, totalOrders: 58, lastOrder: 'Dec 17', address: '789 Vegetable Mandi', city: 'Pune', state: 'Maharashtra', pinCode: '411001', gstNumber: '27FVCEG9012H1Z3', panNumber: 'FVCEG9012H' },
  { id: 4, name: 'Dairy Mart', contactPerson: 'Sita Devi', phone: '9876543213', email: 'dairy@mart.com', category: 'Dairy', paymentTerms: '7 Days', isActive: true, totalOrders: 41, lastOrder: 'Dec 14', address: '321 Milk Lane', city: 'Bangalore', state: 'Karnataka', pinCode: '560001', gstNumber: '29DMILK3456I1Z4', panNumber: 'DMILK3456I' },
  { id: 5, name: 'Spice House', contactPerson: 'Raj Verma', phone: '9876543214', email: 'spice@house.com', category: 'Spices', paymentTerms: '15 Days', isActive: true, totalOrders: 28, lastOrder: 'Dec 10', address: '654 Spice Bazaar', city: 'Hyderabad', state: 'Telangana', pinCode: '500001', gstNumber: '36SPHSE7890J1Z5', panNumber: 'SPHSE7890J' },
  { id: 6, name: 'Meat Market', contactPerson: 'Arun Sharma', phone: '9876543215', email: 'meat@market.com', category: 'Proteins', paymentTerms: 'Cash', isActive: false, totalOrders: 15, lastOrder: 'Dec 13', address: '987 Meat Complex', city: 'Chennai', state: 'Tamil Nadu', pinCode: '600001', gstNumber: '33MTMKT1234K1Z6', panNumber: 'MTMKT1234K' },
  { id: 7, name: 'Grain Traders', contactPerson: 'Neha Gupta', phone: '9876543216', email: 'grain@traders.com', category: 'Grains', paymentTerms: '30 Days', isActive: true, totalOrders: 22, lastOrder: 'Dec 17', address: '147 Grain Hub', city: 'Kolkata', state: 'West Bengal', pinCode: '700001', gstNumber: '19GRTRD5678L1Z7', panNumber: 'GRTRD5678L' },
  { id: 8, name: 'Oil Depot', contactPerson: 'Karan Singh', phone: '9876543217', email: 'oil@depot.com', category: 'Oil & Ghee', paymentTerms: '15 Days', isActive: true, totalOrders: 19, lastOrder: 'Dec 11', address: '258 Oil Lane', city: 'Ahmedabad', state: 'Gujarat', pinCode: '380001', gstNumber: '24OLDPT9012M1Z8', panNumber: 'OLDPT9012M' },
  { id: 9, name: 'Beverage Co', contactPerson: 'Meera Jain', phone: '9876543218', email: 'beverage@co.com', category: 'Beverages', paymentTerms: '7 Days', isActive: true, totalOrders: 25, lastOrder: 'Dec 15', address: '369 Beverage Street', city: 'Jaipur', state: 'Rajasthan', pinCode: '302001', gstNumber: '08BVGCO3456N1Z9', panNumber: 'BVGCO3456N' },
  { id: 10, name: 'Organic Farms', contactPerson: 'Vikram Patel', phone: '9876543219', email: 'organic@farms.com', category: 'Vegetables', paymentTerms: 'Cash', isActive: true, totalOrders: 35, lastOrder: 'Dec 16', address: '741 Farm Road', city: 'Surat', state: 'Gujarat', pinCode: '395001', gstNumber: '24ORGFM7890O1Z0', panNumber: 'ORGFM7890O' },
];

// Tab definitions
const level4Tabs = [
  { id: 'raw-materials', label: 'Raw Materials' },
  { id: 'purchase-orders', label: 'Purchase Orders' },
  { id: 'suppliers', label: 'Suppliers' },
  { id: 'stock-reports', label: 'Stock Reports' },
];

const categories = ['All', 'Proteins', 'Grains', 'Vegetables', 'Dairy', 'Oil & Ghee', 'Spices', 'Beverages', 'Others'];
const units = ['kg', 'ltr', 'pcs', 'gm', 'dozen'];
const stockFilters = ['All', 'Low Stock', 'Out of Stock', 'Good Stock', 'Critical'];

const FBInventory: React.FC = () => {
  const [activeTab, setActiveTab] = useState('raw-materials');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [stockFilter, setStockFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  
  // Data states
  const [ingredients, setIngredients] = useState<Ingredient[]>(initialIngredients);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(initialPurchaseOrders);
  const [suppliers, setSuppliers] = useState<Supplier[]>(initialSuppliers);
  
  // Modal states
  const [showIngredientModal, setShowIngredientModal] = useState(false);
  const [showPOModal, setShowPOModal] = useState(false);
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [viewingItem, setViewingItem] = useState<any>(null);
  const [poStatusFilter, setPOStatusFilter] = useState('All');

  const recordsPerPage = viewMode === 'list' ? 10 : 12;

  // Helper functions
  const getStockStatus = (current: number, min: number) => {
    if (current === 0) return { status: 'out-of-stock', label: 'Out of Stock', color: 'bg-gray-100 text-gray-600' };
    if (current < min * 0.5) return { status: 'critical', label: 'Critical', color: 'bg-red-100 text-red-600' };
    if (current < min) return { status: 'low', label: 'Low', color: 'bg-yellow-100 text-yellow-600' };
    return { status: 'good', label: 'Good', color: 'bg-green-100 text-green-600' };
  };

  const getPOStatusConfig = (status: string) => {
    const configs: Record<string, { label: string; color: string }> = {
      pending: { label: 'Pending', color: 'bg-blue-100 text-blue-600' },
      approved: { label: 'Approved', color: 'bg-yellow-100 text-yellow-600' },
      received: { label: 'Received', color: 'bg-green-100 text-green-600' },
      partial: { label: 'Partial', color: 'bg-orange-100 text-orange-600' },
      cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-600' },
    };
    return configs[status] || configs.pending;
  };

  // Filtered data
  const filteredIngredients = useMemo(() => {
    return ingredients.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
      const status = getStockStatus(item.currentStock, item.minStockLevel);
      const matchesStock = stockFilter === 'All' || 
        (stockFilter === 'Low Stock' && status.status === 'low') ||
        (stockFilter === 'Out of Stock' && status.status === 'out-of-stock') ||
        (stockFilter === 'Good Stock' && status.status === 'good') ||
        (stockFilter === 'Critical' && status.status === 'critical');
      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [ingredients, searchTerm, categoryFilter, stockFilter]);

  const filteredPOs = useMemo(() => {
    return purchaseOrders.filter(po => {
      const matchesSearch = po.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        po.supplier.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = poStatusFilter === 'All' || po.status === poStatusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [purchaseOrders, searchTerm, poStatusFilter]);

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(s => 
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [suppliers, searchTerm]);

  // Pagination
  const getPaginatedData = (data: any[]) => {
    const start = (currentPage - 1) * recordsPerPage;
    return data.slice(start, start + recordsPerPage);
  };

  const totalPages = (data: any[]) => Math.ceil(data.length / recordsPerPage);

  // Stock summary for reports
  const stockSummary = useMemo(() => {
    const critical = ingredients.filter(i => getStockStatus(i.currentStock, i.minStockLevel).status === 'critical').length;
    const low = ingredients.filter(i => getStockStatus(i.currentStock, i.minStockLevel).status === 'low').length;
    const good = ingredients.filter(i => getStockStatus(i.currentStock, i.minStockLevel).status === 'good').length;
    const totalValue = ingredients.reduce((sum, i) => sum + (i.currentStock * i.costPerUnit), 0);
    return { total: ingredients.length, critical, low, good, totalValue };
  }, [ingredients]);

  // CRUD handlers
  const handleSaveIngredient = (data: Partial<Ingredient>) => {
    if (editingItem) {
      setIngredients(prev => prev.map(i => i.id === editingItem.id ? { ...i, ...data } as Ingredient : i));
      toast.success('Ingredient updated successfully!');
    } else {
      const newIngredient: Ingredient = {
        ...data,
        id: Date.now(),
        lastUpdated: 'Just now',
      } as Ingredient;
      setIngredients(prev => [...prev, newIngredient]);
      toast.success('Ingredient added successfully!');
    }
    setShowIngredientModal(false);
    setEditingItem(null);
  };

  const handleDeleteIngredient = (id: number) => {
    if (confirm('Are you sure you want to delete this ingredient?')) {
      setIngredients(prev => prev.filter(i => i.id !== id));
      toast.success('Ingredient deleted successfully!');
    }
  };

  const handleSavePO = () => {
    const newPO: PurchaseOrder = {
      id: `PO${String(purchaseOrders.length + 1).padStart(3, '0')}`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      supplier: 'ABC Foods',
      itemsCount: 5,
      totalAmount: 10000,
      expectedDelivery: 'Dec 25',
      status: 'pending',
      paymentTerms: '15 Days Credit',
      notes: '',
      items: [],
    };
    setPurchaseOrders(prev => [...prev, newPO]);
    toast.success('Purchase Order created successfully!');
    setShowPOModal(false);
  };

  const handlePOAction = (po: PurchaseOrder, action: string) => {
    setPurchaseOrders(prev => prev.map(p => {
      if (p.id === po.id) {
        if (action === 'approve') return { ...p, status: 'approved' as const };
        if (action === 'receive') return { ...p, status: 'received' as const };
        if (action === 'cancel') return { ...p, status: 'cancelled' as const };
      }
      return p;
    }));
    toast.success(`PO ${action === 'approve' ? 'approved' : action === 'receive' ? 'marked as received' : 'cancelled'}!`);
  };

  const handleSaveSupplier = (data: Partial<Supplier>) => {
    if (editingItem) {
      setSuppliers(prev => prev.map(s => s.id === editingItem.id ? { ...s, ...data } as Supplier : s));
      toast.success('Supplier updated successfully!');
    } else {
      const newSupplier: Supplier = {
        ...data,
        id: Date.now(),
        totalOrders: 0,
        lastOrder: '-',
      } as Supplier;
      setSuppliers(prev => [...prev, newSupplier]);
      toast.success('Supplier added successfully!');
    }
    setShowSupplierModal(false);
    setEditingItem(null);
  };

  const toggleSupplierStatus = (id: number) => {
    setSuppliers(prev => prev.map(s => s.id === id ? { ...s, isActive: !s.isActive } : s));
    toast.success('Status updated!');
  };

  // Table header style
  const tableHeaderStyle = 'bg-primary text-white';

  // Render Raw Materials Tab
  const renderRawMaterials = () => {
    const data = getPaginatedData(filteredIngredients);
    
    return (
      <div className="space-y-4">
        {/* Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => { setEditingItem(null); setShowIngredientModal(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Ingredient
          </button>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by ingredient name..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground text-sm w-64 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            
            <select
              value={stockFilter}
              onChange={(e) => { setStockFilter(e.target.value); setCurrentPage(1); }}
              className="px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {stockFilters.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
            
            <div className="flex border border-border rounded-lg overflow-hidden">
              <button
                onClick={() => { setViewMode('grid'); setCurrentPage(1); }}
                className={`p-2 ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'bg-background text-foreground hover:bg-accent'}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => { setViewMode('list'); setCurrentPage(1); }}
                className={`p-2 ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'bg-background text-foreground hover:bg-accent'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
            
            <button
              onClick={() => toast.success('Exporting to Excel...')}
              className="flex items-center gap-2 px-3 py-2 border border-border rounded-lg bg-background text-foreground hover:bg-accent transition-colors"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* List View */}
        {viewMode === 'list' ? (
          <div className="border border-border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className={tableHeaderStyle}>
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium">Ingredient Name</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Current Stock</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Min Stock Level</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Unit</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Cost per Unit</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Last Updated</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                  <th className="px-4 py-3 text-center text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-card">
                {data.length === 0 ? (
                  <tr><td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">No ingredients found</td></tr>
                ) : (
                  data.map((item) => {
                    const status = getStockStatus(item.currentStock, item.minStockLevel);
                    return (
                      <tr key={item.id} className="border-t border-border hover:bg-accent/50">
                        <td className="px-4 py-3 text-sm text-foreground font-medium">{item.name}</td>
                        <td className="px-4 py-3 text-sm text-foreground">{item.currentStock} {item.unit}</td>
                        <td className="px-4 py-3 text-sm text-foreground">{item.minStockLevel} {item.unit}</td>
                        <td className="px-4 py-3 text-sm text-foreground">{item.unit}</td>
                        <td className="px-4 py-3 text-sm text-foreground">₹{item.costPerUnit}/{item.unit}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{item.lastUpdated}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>{status.label}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            <button onClick={() => { setViewingItem(item); setShowViewModal(true); }} className="p-1.5 text-muted-foreground hover:text-primary hover:bg-accent rounded"><Eye className="w-4 h-4" /></button>
                            <button onClick={() => { setEditingItem(item); setShowIngredientModal(true); }} className="p-1.5 text-muted-foreground hover:text-primary hover:bg-accent rounded"><Edit2 className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        ) : (
          /* Grid View */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {data.length === 0 ? (
              <div className="col-span-full text-center py-8 text-muted-foreground">No ingredients found</div>
            ) : (
              data.map((item) => {
                const status = getStockStatus(item.currentStock, item.minStockLevel);
                const percentBelow = item.currentStock < item.minStockLevel 
                  ? Math.round((1 - item.currentStock / item.minStockLevel) * 100) 
                  : 0;
                return (
                  <div key={item.id} className="bg-card border border-border rounded-lg p-4 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-foreground">{item.name}</h4>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${status.color}`}>{status.label}</span>
                    </div>
                    <div className="space-y-1 text-sm text-muted-foreground mb-3">
                      <p>Current: <span className="text-foreground font-medium">{item.currentStock} {item.unit}</span></p>
                      <p>Min Level: {item.minStockLevel} {item.unit}</p>
                      {percentBelow > 0 && (
                        <p className="flex items-center gap-1 text-red-500">
                          <TrendingDown className="w-3 h-3" />
                          {percentBelow}% below min
                        </p>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">Cost: <span className="text-foreground font-medium">₹{item.costPerUnit}/{item.unit}</span></p>
                    <p className="text-xs text-muted-foreground mt-1">Last Updated: {item.lastUpdated}</p>
                    <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                      <button onClick={() => { setViewingItem(item); setShowViewModal(true); }} className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-xs bg-accent text-foreground rounded hover:bg-accent/80">
                        <Eye className="w-3 h-3" /> View
                      </button>
                      <button onClick={() => { setEditingItem(item); setShowIngredientModal(true); }} className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90">
                        <Edit2 className="w-3 h-3" /> Edit
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Pagination */}
        {renderPagination(filteredIngredients)}
      </div>
    );
  };

  // Render Purchase Orders Tab
  const renderPurchaseOrders = () => {
    const data = getPaginatedData(filteredPOs);
    
    return (
      <div className="space-y-4">
        {/* Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => setShowPOModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create PO
          </button>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by PO number or supplier..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground text-sm w-64 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            
            <select
              value={poStatusFilter}
              onChange={(e) => { setPOStatusFilter(e.target.value); setCurrentPage(1); }}
              className="px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Received">Received</option>
              <option value="Partial">Partial</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            
            <div className="flex border border-border rounded-lg overflow-hidden">
              <button onClick={() => { setViewMode('grid'); setCurrentPage(1); }} className={`p-2 ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'bg-background text-foreground hover:bg-accent'}`}><Grid className="w-4 h-4" /></button>
              <button onClick={() => { setViewMode('list'); setCurrentPage(1); }} className={`p-2 ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'bg-background text-foreground hover:bg-accent'}`}><List className="w-4 h-4" /></button>
            </div>
            
            <button onClick={() => toast.success('Exporting to Excel...')} className="flex items-center gap-2 px-3 py-2 border border-border rounded-lg bg-background text-foreground hover:bg-accent transition-colors">
              <Download className="w-4 h-4" /> Export
            </button>
          </div>
        </div>

        {/* List View */}
        {viewMode === 'list' ? (
          <div className="border border-border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className={tableHeaderStyle}>
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium">PO Number</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Supplier</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Items</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Total Amount</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Expected Delivery</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                  <th className="px-4 py-3 text-center text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-card">
                {data.length === 0 ? (
                  <tr><td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">No purchase orders found</td></tr>
                ) : (
                  data.map((po) => {
                    const statusConfig = getPOStatusConfig(po.status);
                    return (
                      <tr key={po.id} className="border-t border-border hover:bg-accent/50">
                        <td className="px-4 py-3 text-sm text-foreground font-medium">#{po.id}</td>
                        <td className="px-4 py-3 text-sm text-foreground">{po.date}</td>
                        <td className="px-4 py-3 text-sm text-foreground">{po.supplier}</td>
                        <td className="px-4 py-3 text-sm text-foreground">{po.itemsCount} items</td>
                        <td className="px-4 py-3 text-sm text-foreground font-medium">₹{po.totalAmount.toLocaleString()}</td>
                        <td className="px-4 py-3 text-sm text-foreground">{po.expectedDelivery}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>{statusConfig.label}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            <button onClick={() => { setViewingItem(po); setShowViewModal(true); }} className="p-1.5 text-muted-foreground hover:text-primary hover:bg-accent rounded"><Eye className="w-4 h-4" /></button>
                            {po.status === 'pending' && (
                              <>
                                <button onClick={() => handlePOAction(po, 'approve')} className="p-1.5 text-green-600 hover:bg-green-50 rounded"><Check className="w-4 h-4" /></button>
                                <button onClick={() => handlePOAction(po, 'cancel')} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><X className="w-4 h-4" /></button>
                              </>
                            )}
                            {po.status === 'approved' && (
                              <button onClick={() => handlePOAction(po, 'receive')} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><Package className="w-4 h-4" /></button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        ) : (
          /* Grid View */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {data.length === 0 ? (
              <div className="col-span-full text-center py-8 text-muted-foreground">No purchase orders found</div>
            ) : (
              data.map((po) => {
                const statusConfig = getPOStatusConfig(po.status);
                return (
                  <div key={po.id} className="bg-card border border-border rounded-lg p-4 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-foreground">#{po.id}</h4>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig.color}`}>{statusConfig.label}</span>
                    </div>
                    <div className="space-y-1 text-sm text-muted-foreground mb-3">
                      <p>Supplier: <span className="text-foreground">{po.supplier}</span></p>
                      <p>Date: {po.date}</p>
                      <p>Items: {po.itemsCount}</p>
                      <p className="text-lg font-bold text-foreground">₹{po.totalAmount.toLocaleString()}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">Expected: {po.expectedDelivery}</p>
                    <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                      <button onClick={() => { setViewingItem(po); setShowViewModal(true); }} className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-xs bg-accent text-foreground rounded hover:bg-accent/80">
                        <Eye className="w-3 h-3" /> View
                      </button>
                      {po.status === 'pending' && (
                        <button onClick={() => handlePOAction(po, 'approve')} className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-xs bg-green-500 text-white rounded hover:bg-green-600">
                          <Check className="w-3 h-3" /> Approve
                        </button>
                      )}
                      {po.status === 'approved' && (
                        <button onClick={() => handlePOAction(po, 'receive')} className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90">
                          <Package className="w-3 h-3" /> Receive
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {renderPagination(filteredPOs)}
      </div>
    );
  };

  // Render Suppliers Tab
  const renderSuppliers = () => {
    const data = getPaginatedData(filteredSuppliers);
    
    return (
      <div className="space-y-4">
        {/* Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => { setEditingItem(null); setShowSupplierModal(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Supplier
          </button>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search suppliers..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground text-sm w-64 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            
            <div className="flex border border-border rounded-lg overflow-hidden">
              <button onClick={() => { setViewMode('grid'); setCurrentPage(1); }} className={`p-2 ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'bg-background text-foreground hover:bg-accent'}`}><Grid className="w-4 h-4" /></button>
              <button onClick={() => { setViewMode('list'); setCurrentPage(1); }} className={`p-2 ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'bg-background text-foreground hover:bg-accent'}`}><List className="w-4 h-4" /></button>
            </div>
            
            <button onClick={() => toast.success('Exporting to Excel...')} className="flex items-center gap-2 px-3 py-2 border border-border rounded-lg bg-background text-foreground hover:bg-accent transition-colors">
              <Download className="w-4 h-4" /> Export
            </button>
          </div>
        </div>

        {/* List View */}
        {viewMode === 'list' ? (
          <div className="border border-border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className={tableHeaderStyle}>
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium">Supplier Name</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Contact Person</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Phone</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Email</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Category</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Payment Terms</th>
                  <th className="px-4 py-3 text-center text-sm font-medium">Status</th>
                  <th className="px-4 py-3 text-center text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-card">
                {data.length === 0 ? (
                  <tr><td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">No suppliers found</td></tr>
                ) : (
                  data.map((supplier) => (
                    <tr key={supplier.id} className="border-t border-border hover:bg-accent/50">
                      <td className="px-4 py-3 text-sm text-foreground font-medium">{supplier.name}</td>
                      <td className="px-4 py-3 text-sm text-foreground">{supplier.contactPerson}</td>
                      <td className="px-4 py-3 text-sm text-foreground">{supplier.phone}</td>
                      <td className="px-4 py-3 text-sm text-foreground">{supplier.email}</td>
                      <td className="px-4 py-3 text-sm text-foreground">{supplier.category}</td>
                      <td className="px-4 py-3 text-sm text-foreground">{supplier.paymentTerms}</td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => toggleSupplierStatus(supplier.id)}
                          className={`relative w-10 h-5 rounded-full transition-colors ${supplier.isActive ? 'bg-primary' : 'bg-gray-300'}`}
                        >
                          <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${supplier.isActive ? 'left-5' : 'left-0.5'}`} />
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => { setViewingItem(supplier); setShowViewModal(true); }} className="p-1.5 text-muted-foreground hover:text-primary hover:bg-accent rounded"><Eye className="w-4 h-4" /></button>
                          <button onClick={() => { setEditingItem(supplier); setShowSupplierModal(true); }} className="p-1.5 text-muted-foreground hover:text-primary hover:bg-accent rounded"><Edit2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          /* Grid View */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {data.length === 0 ? (
              <div className="col-span-full text-center py-8 text-muted-foreground">No suppliers found</div>
            ) : (
              data.map((supplier) => (
                <div key={supplier.id} className="bg-card border border-border rounded-lg p-4 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-foreground">{supplier.name}</h4>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${supplier.isActive ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}>
                      {supplier.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="space-y-1 text-sm text-muted-foreground mb-3">
                    <p>Contact: <span className="text-foreground">{supplier.contactPerson}</span></p>
                    <p className="flex items-center gap-1">📞 {supplier.phone}</p>
                    <p className="flex items-center gap-1">✉️ {supplier.email}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">Category: <span className="text-foreground">{supplier.category}</span></p>
                  <p className="text-sm text-muted-foreground">Payment: <span className="text-foreground">{supplier.paymentTerms}</span></p>
                  <div className="mt-2 pt-2 border-t border-border text-xs text-muted-foreground">
                    <p>Total Orders: {supplier.totalOrders}</p>
                    <p>Last Order: {supplier.lastOrder}</p>
                  </div>
                  <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                    <button onClick={() => { setViewingItem(supplier); setShowViewModal(true); }} className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-xs bg-accent text-foreground rounded hover:bg-accent/80">
                      <Eye className="w-3 h-3" /> View
                    </button>
                    <button onClick={() => { setEditingItem(supplier); setShowSupplierModal(true); }} className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90">
                      <Edit2 className="w-3 h-3" /> Edit
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {renderPagination(filteredSuppliers)}
      </div>
    );
  };

  // Render Stock Reports Tab
  const renderStockReports = () => {
    const criticalItems = ingredients.filter(i => {
      const status = getStockStatus(i.currentStock, i.minStockLevel);
      return status.status === 'critical' || status.status === 'low';
    }).slice(0, 5);

    const categoryValues = categories.slice(1).map(cat => {
      const items = ingredients.filter(i => i.category === cat);
      const value = items.reduce((sum, i) => sum + (i.currentStock * i.costPerUnit), 0);
      return { category: cat, value, count: items.length };
    }).filter(c => c.value > 0);

    const totalValue = categoryValues.reduce((sum, c) => sum + c.value, 0);

    return (
      <div className="space-y-6">
        {/* Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <select className="px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm">
              <option>Last 30 Days</option>
              <option>Last 7 Days</option>
              <option>This Month</option>
              <option>Last Month</option>
            </select>
            <select className="px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm">
              <option>All Categories</option>
              {categories.slice(1).map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex gap-2">
            <button onClick={() => toast.success('Exporting PDF...')} className="flex items-center gap-2 px-3 py-2 border border-border rounded-lg bg-background text-foreground hover:bg-accent">
              <FileText className="w-4 h-4" /> Export PDF
            </button>
            <button onClick={() => toast.success('Exporting Excel...')} className="flex items-center gap-2 px-3 py-2 border border-border rounded-lg bg-background text-foreground hover:bg-accent">
              <Download className="w-4 h-4" /> Export Excel
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Package className="w-4 h-4" />
              <span className="text-xs">Total Items</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{stockSummary.total}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 text-red-500 mb-1">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-xs">Critical Stock</span>
            </div>
            <p className="text-2xl font-bold text-red-500">{stockSummary.critical}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 text-yellow-500 mb-1">
              <TrendingDown className="w-4 h-4" />
              <span className="text-xs">Low Stock</span>
            </div>
            <p className="text-2xl font-bold text-yellow-500">{stockSummary.low}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 text-green-500 mb-1">
              <Check className="w-4 h-4" />
              <span className="text-xs">Good Stock</span>
            </div>
            <p className="text-2xl font-bold text-green-500">{stockSummary.good}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 text-primary mb-1">
              <BarChart3 className="w-4 h-4" />
              <span className="text-xs">Total Value</span>
            </div>
            <p className="text-2xl font-bold text-foreground">₹{stockSummary.totalValue.toLocaleString()}</p>
          </div>
        </div>

        {/* Items Requiring Attention */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="px-4 py-3 bg-red-50 border-b border-border">
            <h3 className="font-semibold text-red-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Items Requiring Immediate Attention
            </h3>
          </div>
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Ingredient</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Current Stock</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Days Until Stockout</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Suggested Order Qty</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Priority</th>
              </tr>
            </thead>
            <tbody>
              {criticalItems.map((item, idx) => (
                <tr key={item.id} className="border-t border-border">
                  <td className="px-4 py-2 text-sm text-foreground">{item.name}</td>
                  <td className="px-4 py-2 text-sm text-foreground">{item.currentStock} {item.unit}</td>
                  <td className="px-4 py-2 text-sm text-foreground">{Math.max(1, Math.round(item.currentStock / 2))} days</td>
                  <td className="px-4 py-2 text-sm text-foreground">{item.maxStockLevel - item.currentStock} {item.unit}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${idx < 2 ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'}`}>
                      {idx < 2 ? 'High' : 'Medium'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Category-wise Stock Value */}
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="font-semibold text-foreground mb-4">Category-wise Stock Value</h3>
          <div className="space-y-3">
            {categoryValues.map(cat => {
              const percentage = Math.round((cat.value / totalValue) * 100);
              return (
                <div key={cat.category}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-foreground">{cat.category}</span>
                    <span className="text-muted-foreground">₹{cat.value.toLocaleString()} ({percentage}%)</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Purchase Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Total POs (Last 30 Days)</p>
            <p className="text-2xl font-bold text-foreground">{purchaseOrders.length}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Total Purchases</p>
            <p className="text-2xl font-bold text-foreground">₹{purchaseOrders.reduce((s, p) => s + p.totalAmount, 0).toLocaleString()}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Average PO Value</p>
            <p className="text-2xl font-bold text-foreground">₹{Math.round(purchaseOrders.reduce((s, p) => s + p.totalAmount, 0) / purchaseOrders.length).toLocaleString()}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Top Supplier</p>
            <p className="text-lg font-bold text-foreground">ABC Foods</p>
            <p className="text-xs text-muted-foreground">3 orders</p>
          </div>
        </div>
      </div>
    );
  };

  // Pagination component
  const renderPagination = (data: any[]) => {
    const total = totalPages(data);
    if (total <= 1) return null;

    return (
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Rows per page:</span>
          <select
            value={recordsPerPage}
            onChange={() => {}}
            className="px-2 py-1 border border-border rounded bg-background text-foreground"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span>{(currentPage - 1) * recordsPerPage + 1}-{Math.min(currentPage * recordsPerPage, data.length)} of {data.length}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-2 border border-border rounded bg-background text-foreground hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm text-foreground">Page {currentPage} of {total}</span>
          <button
            onClick={() => setCurrentPage(p => Math.min(total, p + 1))}
            disabled={currentPage === total}
            className="p-2 border border-border rounded bg-background text-foreground hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  // Get current tab content
  const renderContent = () => {
    switch (activeTab) {
      case 'raw-materials': return renderRawMaterials();
      case 'purchase-orders': return renderPurchaseOrders();
      case 'suppliers': return renderSuppliers();
      case 'stock-reports': return renderStockReports();
      default: return renderRawMaterials();
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* Level 4 Tabs */}
      <div className="flex gap-1 border-b border-border overflow-x-auto">
        {level4Tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setSearchTerm(''); setCurrentPage(1); }}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {renderContent()}

      {/* Ingredient Modal */}
      {showIngredientModal && (
        <IngredientModal
          item={editingItem}
          suppliers={suppliers}
          onClose={() => { setShowIngredientModal(false); setEditingItem(null); }}
          onSave={handleSaveIngredient}
        />
      )}

      {/* PO Modal */}
      {showPOModal && (
        <POModal
          ingredients={ingredients}
          suppliers={suppliers}
          onClose={() => setShowPOModal(false)}
          onSave={handleSavePO}
        />
      )}

      {/* Supplier Modal */}
      {showSupplierModal && (
        <SupplierModal
          item={editingItem}
          onClose={() => { setShowSupplierModal(false); setEditingItem(null); }}
          onSave={handleSaveSupplier}
        />
      )}

      {/* View Modal */}
      {showViewModal && viewingItem && (
        <ViewModal
          item={viewingItem}
          type={activeTab}
          onClose={() => { setShowViewModal(false); setViewingItem(null); }}
        />
      )}
    </div>
  );
};

// Ingredient Modal Component
const IngredientModal: React.FC<{
  item: Ingredient | null;
  suppliers: Supplier[];
  onClose: () => void;
  onSave: (data: Partial<Ingredient>) => void;
}> = ({ item, suppliers, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: item?.name || '',
    category: item?.category || 'Proteins',
    currentStock: item?.currentStock || 0,
    minStockLevel: item?.minStockLevel || 0,
    maxStockLevel: item?.maxStockLevel || 0,
    unit: item?.unit || 'kg',
    costPerUnit: item?.costPerUnit || 0,
    supplier: item?.supplier || '',
    storageLocation: item?.storageLocation || '',
    expiryDate: item?.expiryDate || '',
    notes: item?.notes || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.currentStock) {
      toast.error('Please fill required fields');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">{item ? 'Edit Ingredient' : 'Add Ingredient'}</h2>
          <button onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Ingredient Name *</label>
              <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Category</label>
              <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground">
                {categories.slice(1).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Current Stock *</label>
              <input type="number" value={formData.currentStock} onChange={e => setFormData({...formData, currentStock: Number(e.target.value)})} className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Min Stock Level *</label>
              <input type="number" value={formData.minStockLevel} onChange={e => setFormData({...formData, minStockLevel: Number(e.target.value)})} className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Max Stock Level</label>
              <input type="number" value={formData.maxStockLevel} onChange={e => setFormData({...formData, maxStockLevel: Number(e.target.value)})} className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Unit</label>
              <select value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground">
                {units.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Cost per Unit (₹)</label>
              <input type="number" value={formData.costPerUnit} onChange={e => setFormData({...formData, costPerUnit: Number(e.target.value)})} className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Supplier</label>
              <select value={formData.supplier} onChange={e => setFormData({...formData, supplier: e.target.value})} className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground">
                <option value="">Select Supplier</option>
                {suppliers.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Storage Location</label>
              <input type="text" value={formData.storageLocation} onChange={e => setFormData({...formData, storageLocation: e.target.value})} className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Expiry Date</label>
              <input type="date" value={formData.expiryDate} onChange={e => setFormData({...formData, expiryDate: e.target.value})} className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Notes</label>
            <textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} rows={3} className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground" />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-border rounded-lg text-foreground hover:bg-accent">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// PO Modal Component
const POModal: React.FC<{
  ingredients: Ingredient[];
  suppliers: Supplier[];
  onClose: () => void;
  onSave: () => void;
}> = ({ ingredients, suppliers, onClose, onSave }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    supplier: '',
    expectedDelivery: '',
    paymentTerms: '15 Days Credit',
    notes: '',
  });
  const [items, setItems] = useState<{ ingredientId: number; quantity: number; rate: number }[]>([]);

  const addItem = () => setItems([...items, { ingredientId: 0, quantity: 0, rate: 0 }]);
  const removeItem = (idx: number) => setItems(items.filter((_, i) => i !== idx));
  
  const subtotal = items.reduce((sum, item) => {
    const ing = ingredients.find(i => i.id === item.ingredientId);
    return sum + (item.quantity * (item.rate || ing?.costPerUnit || 0));
  }, 0);
  const tax = subtotal * 0.05;
  const total = subtotal + tax;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Create Purchase Order</h2>
          <button onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
        </div>
        
        <div className="p-4 space-y-4">
          {step === 1 ? (
            <>
              <h3 className="font-medium text-foreground">Step 1: Basic Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">PO Number</label>
                  <input type="text" value="#PO011" disabled className="w-full px-3 py-2 border border-border rounded-lg bg-muted text-muted-foreground" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Supplier *</label>
                  <select value={formData.supplier} onChange={e => setFormData({...formData, supplier: e.target.value})} className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground">
                    <option value="">Select Supplier</option>
                    {suppliers.filter(s => s.isActive).map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Expected Delivery *</label>
                  <input type="date" value={formData.expectedDelivery} onChange={e => setFormData({...formData, expectedDelivery: e.target.value})} className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Payment Terms</label>
                  <select value={formData.paymentTerms} onChange={e => setFormData({...formData, paymentTerms: e.target.value})} className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground">
                    <option>Cash on Delivery</option>
                    <option>7 Days Credit</option>
                    <option>15 Days Credit</option>
                    <option>30 Days Credit</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Notes</label>
                <textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} rows={2} className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground" />
              </div>
              <div className="flex justify-end">
                <button onClick={() => setStep(2)} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">Next: Add Items</button>
              </div>
            </>
          ) : (
            <>
              <h3 className="font-medium text-foreground">Step 2: Add Items</h3>
              <div className="border border-border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Ingredient</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Current Stock</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Quantity</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Rate</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Amount</th>
                      <th className="px-3 py-2 text-center text-xs font-medium text-muted-foreground">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, idx) => {
                      const ing = ingredients.find(i => i.id === item.ingredientId);
                      const amount = item.quantity * (item.rate || ing?.costPerUnit || 0);
                      return (
                        <tr key={idx} className="border-t border-border">
                          <td className="px-3 py-2">
                            <select value={item.ingredientId} onChange={e => {
                              const newItems = [...items];
                              newItems[idx].ingredientId = Number(e.target.value);
                              setItems(newItems);
                            }} className="w-full px-2 py-1 border border-border rounded bg-background text-foreground text-sm">
                              <option value={0}>Select</option>
                              {ingredients.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                            </select>
                          </td>
                          <td className="px-3 py-2 text-sm text-muted-foreground">{ing ? `${ing.currentStock} ${ing.unit}` : '-'}</td>
                          <td className="px-3 py-2">
                            <input type="number" value={item.quantity} onChange={e => {
                              const newItems = [...items];
                              newItems[idx].quantity = Number(e.target.value);
                              setItems(newItems);
                            }} className="w-20 px-2 py-1 border border-border rounded bg-background text-foreground text-sm" />
                          </td>
                          <td className="px-3 py-2">
                            <input type="number" value={item.rate || ing?.costPerUnit || 0} onChange={e => {
                              const newItems = [...items];
                              newItems[idx].rate = Number(e.target.value);
                              setItems(newItems);
                            }} className="w-20 px-2 py-1 border border-border rounded bg-background text-foreground text-sm" />
                          </td>
                          <td className="px-3 py-2 text-sm text-foreground">₹{amount.toLocaleString()}</td>
                          <td className="px-3 py-2 text-center">
                            <button onClick={() => removeItem(idx)} className="p-1 text-red-500 hover:bg-red-50 rounded"><X className="w-4 h-4" /></button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <button onClick={addItem} className="flex items-center gap-2 px-3 py-2 text-sm text-primary hover:bg-accent rounded-lg">
                <Plus className="w-4 h-4" /> Add Item
              </button>
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <div className="flex justify-between text-sm"><span>Subtotal:</span><span>₹{subtotal.toLocaleString()}</span></div>
                <div className="flex justify-between text-sm"><span>Tax (5%):</span><span>₹{tax.toLocaleString()}</span></div>
                <div className="flex justify-between font-bold"><span>Total:</span><span>₹{total.toLocaleString()}</span></div>
              </div>
              <div className="flex justify-between pt-4 border-t border-border">
                <button onClick={() => setStep(1)} className="px-4 py-2 border border-border rounded-lg text-foreground hover:bg-accent">Back</button>
                <div className="flex gap-2">
                  <button onClick={onClose} className="px-4 py-2 border border-border rounded-lg text-foreground hover:bg-accent">Save as Draft</button>
                  <button onClick={onSave} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">Submit for Approval</button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Supplier Modal Component
const SupplierModal: React.FC<{
  item: Supplier | null;
  onClose: () => void;
  onSave: (data: Partial<Supplier>) => void;
}> = ({ item, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: item?.name || '',
    contactPerson: item?.contactPerson || '',
    phone: item?.phone || '',
    email: item?.email || '',
    category: item?.category || 'Proteins',
    paymentTerms: item?.paymentTerms || '15 Days',
    address: item?.address || '',
    city: item?.city || '',
    state: item?.state || '',
    pinCode: item?.pinCode || '',
    gstNumber: item?.gstNumber || '',
    panNumber: item?.panNumber || '',
    isActive: item?.isActive ?? true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      toast.error('Please fill required fields');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">{item ? 'Edit Supplier' : 'Add Supplier'}</h2>
          <button onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <h3 className="font-medium text-foreground">Basic Info</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Supplier Name *</label>
              <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Contact Person</label>
              <input type="text" value={formData.contactPerson} onChange={e => setFormData({...formData, contactPerson: e.target.value})} className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Phone *</label>
              <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Email</label>
              <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground" />
            </div>
          </div>
          
          <h3 className="font-medium text-foreground pt-4">Address</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-foreground mb-1">Address</label>
              <input type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">City</label>
              <input type="text" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">State</label>
              <input type="text" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">PIN Code</label>
              <input type="text" value={formData.pinCode} onChange={e => setFormData({...formData, pinCode: e.target.value})} className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground" />
            </div>
          </div>
          
          <h3 className="font-medium text-foreground pt-4">Business Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Category</label>
              <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground">
                {categories.slice(1).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Payment Terms</label>
              <select value={formData.paymentTerms} onChange={e => setFormData({...formData, paymentTerms: e.target.value})} className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground">
                <option>Cash</option>
                <option>7 Days</option>
                <option>15 Days</option>
                <option>30 Days</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">GST Number</label>
              <input type="text" value={formData.gstNumber} onChange={e => setFormData({...formData, gstNumber: e.target.value})} className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">PAN Number</label>
              <input type="text" value={formData.panNumber} onChange={e => setFormData({...formData, panNumber: e.target.value})} className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground" />
            </div>
          </div>
          
          <div className="flex items-center gap-2 pt-4">
            <input type="checkbox" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} className="w-4 h-4 rounded border-border text-primary" />
            <span className="text-sm text-foreground">Is Active</span>
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-border rounded-lg text-foreground hover:bg-accent">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// View Modal Component
const ViewModal: React.FC<{
  item: any;
  type: string;
  onClose: () => void;
}> = ({ item, type, onClose }) => {
  const renderContent = () => {
    if (type === 'raw-materials') {
      const status = item.currentStock === 0 ? { label: 'Out of Stock', color: 'bg-gray-100 text-gray-600' } :
        item.currentStock < item.minStockLevel * 0.5 ? { label: 'Critical', color: 'bg-red-100 text-red-600' } :
        item.currentStock < item.minStockLevel ? { label: 'Low', color: 'bg-yellow-100 text-yellow-600' } :
        { label: 'Good', color: 'bg-green-100 text-green-600' };
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-foreground">{item.name}</h3>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${status.color}`}>{status.label}</span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-muted-foreground">Category:</span> <span className="text-foreground ml-2">{item.category}</span></div>
            <div><span className="text-muted-foreground">Unit:</span> <span className="text-foreground ml-2">{item.unit}</span></div>
            <div><span className="text-muted-foreground">Current Stock:</span> <span className="text-foreground ml-2">{item.currentStock} {item.unit}</span></div>
            <div><span className="text-muted-foreground">Min Level:</span> <span className="text-foreground ml-2">{item.minStockLevel} {item.unit}</span></div>
            <div><span className="text-muted-foreground">Max Level:</span> <span className="text-foreground ml-2">{item.maxStockLevel} {item.unit}</span></div>
            <div><span className="text-muted-foreground">Cost:</span> <span className="text-foreground ml-2">₹{item.costPerUnit}/{item.unit}</span></div>
            <div><span className="text-muted-foreground">Supplier:</span> <span className="text-foreground ml-2">{item.supplier || '-'}</span></div>
            <div><span className="text-muted-foreground">Storage:</span> <span className="text-foreground ml-2">{item.storageLocation || '-'}</span></div>
            <div><span className="text-muted-foreground">Expiry:</span> <span className="text-foreground ml-2">{item.expiryDate || '-'}</span></div>
            <div><span className="text-muted-foreground">Last Updated:</span> <span className="text-foreground ml-2">{item.lastUpdated}</span></div>
          </div>
          {item.notes && <div><span className="text-muted-foreground text-sm">Notes:</span><p className="text-foreground mt-1">{item.notes}</p></div>}
        </div>
      );
    }
    
    if (type === 'purchase-orders') {
      const statusConfig: Record<string, { label: string; color: string }> = {
        pending: { label: 'Pending', color: 'bg-blue-100 text-blue-600' },
        approved: { label: 'Approved', color: 'bg-yellow-100 text-yellow-600' },
        received: { label: 'Received', color: 'bg-green-100 text-green-600' },
        partial: { label: 'Partial', color: 'bg-orange-100 text-orange-600' },
        cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-600' },
      };
      const status = statusConfig[item.status] || statusConfig.pending;
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-foreground">#{item.id}</h3>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${status.color}`}>{status.label}</span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-muted-foreground">Date:</span> <span className="text-foreground ml-2">{item.date}</span></div>
            <div><span className="text-muted-foreground">Supplier:</span> <span className="text-foreground ml-2">{item.supplier}</span></div>
            <div><span className="text-muted-foreground">Items:</span> <span className="text-foreground ml-2">{item.itemsCount} items</span></div>
            <div><span className="text-muted-foreground">Total:</span> <span className="text-foreground ml-2 font-bold">₹{item.totalAmount.toLocaleString()}</span></div>
            <div><span className="text-muted-foreground">Expected:</span> <span className="text-foreground ml-2">{item.expectedDelivery}</span></div>
            <div><span className="text-muted-foreground">Payment:</span> <span className="text-foreground ml-2">{item.paymentTerms}</span></div>
          </div>
        </div>
      );
    }
    
    if (type === 'suppliers') {
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-foreground">{item.name}</h3>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${item.isActive ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}>
              {item.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-muted-foreground">Contact:</span> <span className="text-foreground ml-2">{item.contactPerson}</span></div>
            <div><span className="text-muted-foreground">Phone:</span> <span className="text-foreground ml-2">{item.phone}</span></div>
            <div><span className="text-muted-foreground">Email:</span> <span className="text-foreground ml-2">{item.email}</span></div>
            <div><span className="text-muted-foreground">Category:</span> <span className="text-foreground ml-2">{item.category}</span></div>
            <div><span className="text-muted-foreground">Payment:</span> <span className="text-foreground ml-2">{item.paymentTerms}</span></div>
            <div><span className="text-muted-foreground">Orders:</span> <span className="text-foreground ml-2">{item.totalOrders}</span></div>
            <div className="col-span-2"><span className="text-muted-foreground">Address:</span> <span className="text-foreground ml-2">{item.address}, {item.city}, {item.state} - {item.pinCode}</span></div>
            <div><span className="text-muted-foreground">GST:</span> <span className="text-foreground ml-2">{item.gstNumber || '-'}</span></div>
            <div><span className="text-muted-foreground">PAN:</span> <span className="text-foreground ml-2">{item.panNumber || '-'}</span></div>
          </div>
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg w-full max-w-lg">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">View Details</h2>
          <button onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-4">
          {renderContent()}
        </div>
        <div className="flex justify-end p-4 border-t border-border">
          <button onClick={onClose} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">Close</button>
        </div>
      </div>
    </div>
  );
};

export default FBInventory;

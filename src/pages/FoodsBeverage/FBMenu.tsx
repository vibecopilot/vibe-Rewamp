import React, { useState, useMemo } from 'react';
import { Search, Grid, List, Eye, Edit, Trash2, Plus, Download, X, Upload, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

// Types
interface MenuItem {
  id: number;
  name: string;
  shortCode: string;
  category: string;
  cuisine: string;
  type: 'Veg' | 'Non-Veg' | 'Egg';
  basePrice: number;
  status: boolean;
  isFavorite: boolean;
  description: string;
  prepTime: number;
  spiceLevel: string;
  variants: { name: string; price: number; active: boolean }[];
  addons: { name: string; price: number; active: boolean }[];
  availableDays: string[];
  availableFrom: string;
  availableTo: string;
}

interface Category {
  id: number;
  name: string;
  itemCount: number;
  displayOrder: number;
  status: boolean;
  color: string;
}

interface Variant {
  id: number;
  name: string;
  usedInItems: number;
  status: boolean;
}

interface Addon {
  id: number;
  name: string;
  price: number;
  usedInItems: number;
  status: boolean;
}

// Static Data
const initialMenuItems: MenuItem[] = [
  { id: 1, name: 'Paneer Tikka', shortCode: 'PT', category: 'Starters', cuisine: 'North Indian', type: 'Veg', basePrice: 250, status: true, isFavorite: true, description: 'Delicious cottage cheese marinated in spices', prepTime: 15, spiceLevel: 'Medium', variants: [{ name: 'Full Plate', price: 250, active: true }, { name: 'Half Plate', price: 150, active: true }], addons: [{ name: 'Extra Chutney', price: 20, active: true }], availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], availableFrom: '09:00 AM', availableTo: '11:00 PM' },
  { id: 2, name: 'Paneer Kabab', shortCode: 'PK', category: 'Starters', cuisine: 'North Indian', type: 'Veg', basePrice: 220, status: true, isFavorite: false, description: 'Soft paneer kababs with mint', prepTime: 12, spiceLevel: 'Medium', variants: [{ name: 'Full Plate', price: 220, active: true }], addons: [], availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], availableFrom: '09:00 AM', availableTo: '11:00 PM' },
  { id: 3, name: 'Veg Spring Rolls', shortCode: 'VSR', category: 'Starters', cuisine: 'Chinese', type: 'Veg', basePrice: 180, status: true, isFavorite: false, description: 'Crispy rolls with vegetable filling', prepTime: 10, spiceLevel: 'Mild', variants: [], addons: [{ name: 'Sweet Chili', price: 15, active: true }], availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], availableFrom: '09:00 AM', availableTo: '11:00 PM' },
  { id: 4, name: 'Hara Bhara Kabab', shortCode: 'HBK', category: 'Starters', cuisine: 'North Indian', type: 'Veg', basePrice: 200, status: true, isFavorite: false, description: 'Spinach and green peas kabab', prepTime: 15, spiceLevel: 'Mild', variants: [], addons: [], availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], availableFrom: '09:00 AM', availableTo: '11:00 PM' },
  { id: 5, name: 'Crispy Corn', shortCode: 'CC', category: 'Starters', cuisine: 'Chinese', type: 'Veg', basePrice: 150, status: true, isFavorite: true, description: 'Crispy fried corn with spices', prepTime: 8, spiceLevel: 'Medium', variants: [], addons: [], availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], availableFrom: '09:00 AM', availableTo: '11:00 PM' },
  { id: 6, name: 'Chicken Tikka', shortCode: 'CT', category: 'Starters', cuisine: 'North Indian', type: 'Non-Veg', basePrice: 280, status: true, isFavorite: true, description: 'Tender chicken marinated in yogurt and spices', prepTime: 20, spiceLevel: 'Hot', variants: [{ name: 'Full Plate', price: 280, active: true }, { name: 'Half Plate', price: 160, active: true }], addons: [{ name: 'Extra Chutney', price: 20, active: true }], availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], availableFrom: '09:00 AM', availableTo: '11:00 PM' },
  { id: 7, name: 'Chicken Lollipop', shortCode: 'CL', category: 'Starters', cuisine: 'Chinese', type: 'Non-Veg', basePrice: 240, status: true, isFavorite: false, description: 'Crispy fried chicken drumettes', prepTime: 18, spiceLevel: 'Medium', variants: [], addons: [], availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], availableFrom: '09:00 AM', availableTo: '11:00 PM' },
  { id: 8, name: 'Fish Fingers', shortCode: 'FF', category: 'Starters', cuisine: 'Continental', type: 'Non-Veg', basePrice: 300, status: true, isFavorite: false, description: 'Crispy breaded fish strips', prepTime: 15, spiceLevel: 'Mild', variants: [], addons: [{ name: 'Tartar Sauce', price: 25, active: true }], availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], availableFrom: '09:00 AM', availableTo: '11:00 PM' },
  { id: 9, name: 'Mutton Seekh Kabab', shortCode: 'MSK', category: 'Starters', cuisine: 'Mughlai', type: 'Non-Veg', basePrice: 350, status: false, isFavorite: false, description: 'Minced mutton kababs on skewers', prepTime: 25, spiceLevel: 'Hot', variants: [], addons: [], availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], availableFrom: '09:00 AM', availableTo: '11:00 PM' },
  { id: 10, name: 'Paneer Butter Masala', shortCode: 'PBM', category: 'Main Course', cuisine: 'North Indian', type: 'Veg', basePrice: 280, status: true, isFavorite: true, description: 'Creamy tomato gravy with paneer cubes', prepTime: 20, spiceLevel: 'Medium', variants: [{ name: 'Full', price: 280, active: true }, { name: 'Half', price: 160, active: true }], addons: [{ name: 'Extra Butter', price: 20, active: true }], availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], availableFrom: '09:00 AM', availableTo: '11:00 PM' },
  { id: 11, name: 'Dal Makhani', shortCode: 'DM', category: 'Main Course', cuisine: 'North Indian', type: 'Veg', basePrice: 180, status: true, isFavorite: true, description: 'Creamy black lentils slow-cooked', prepTime: 25, spiceLevel: 'Mild', variants: [], addons: [], availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], availableFrom: '09:00 AM', availableTo: '11:00 PM' },
  { id: 12, name: 'Kadai Paneer', shortCode: 'KP', category: 'Main Course', cuisine: 'North Indian', type: 'Veg', basePrice: 260, status: true, isFavorite: false, description: 'Paneer cooked with bell peppers in kadai masala', prepTime: 18, spiceLevel: 'Hot', variants: [], addons: [], availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], availableFrom: '09:00 AM', availableTo: '11:00 PM' },
  { id: 13, name: 'Veg Biryani', shortCode: 'VB', category: 'Main Course', cuisine: 'Mughlai', type: 'Veg', basePrice: 200, status: true, isFavorite: false, description: 'Fragrant rice with mixed vegetables', prepTime: 30, spiceLevel: 'Medium', variants: [], addons: [{ name: 'Raita', price: 30, active: true }], availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], availableFrom: '09:00 AM', availableTo: '11:00 PM' },
  { id: 14, name: 'Butter Chicken', shortCode: 'BC', category: 'Main Course', cuisine: 'North Indian', type: 'Non-Veg', basePrice: 320, status: true, isFavorite: true, description: 'Tender chicken in rich tomato butter sauce', prepTime: 25, spiceLevel: 'Medium', variants: [{ name: 'Full', price: 320, active: true }, { name: 'Half', price: 180, active: true }], addons: [{ name: 'Extra Gravy', price: 40, active: true }], availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], availableFrom: '09:00 AM', availableTo: '11:00 PM' },
  { id: 15, name: 'Chicken Biryani', shortCode: 'CB', category: 'Main Course', cuisine: 'Mughlai', type: 'Non-Veg', basePrice: 250, status: true, isFavorite: true, description: 'Aromatic rice layered with spiced chicken', prepTime: 35, spiceLevel: 'Hot', variants: [], addons: [{ name: 'Raita', price: 30, active: true }, { name: 'Mirchi Salan', price: 40, active: true }], availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], availableFrom: '09:00 AM', availableTo: '11:00 PM' },
  { id: 16, name: 'Fish Curry', shortCode: 'FC', category: 'Main Course', cuisine: 'South Indian', type: 'Non-Veg', basePrice: 350, status: false, isFavorite: false, description: 'Fresh fish in tangy coconut curry', prepTime: 25, spiceLevel: 'Hot', variants: [], addons: [], availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], availableFrom: '09:00 AM', availableTo: '11:00 PM' },
  { id: 17, name: 'Mutton Rogan Josh', shortCode: 'MRJ', category: 'Main Course', cuisine: 'Mughlai', type: 'Non-Veg', basePrice: 400, status: true, isFavorite: false, description: 'Slow-cooked mutton in aromatic Kashmiri spices', prepTime: 40, spiceLevel: 'Hot', variants: [], addons: [], availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], availableFrom: '09:00 AM', availableTo: '11:00 PM' },
  { id: 18, name: 'Cold Coffee', shortCode: 'CCF', category: 'Beverages', cuisine: 'Continental', type: 'Veg', basePrice: 120, status: true, isFavorite: true, description: 'Chilled coffee with ice cream', prepTime: 5, spiceLevel: 'Mild', variants: [], addons: [{ name: 'Extra Ice Cream', price: 30, active: true }], availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], availableFrom: '09:00 AM', availableTo: '11:00 PM' },
  { id: 19, name: 'Masala Chai', shortCode: 'MC', category: 'Beverages', cuisine: 'Indian', type: 'Veg', basePrice: 40, status: true, isFavorite: false, description: 'Traditional spiced tea', prepTime: 5, spiceLevel: 'Mild', variants: [], addons: [], availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], availableFrom: '09:00 AM', availableTo: '11:00 PM' },
  { id: 20, name: 'Fresh Lime Soda', shortCode: 'FLS', category: 'Beverages', cuisine: 'Indian', type: 'Veg', basePrice: 60, status: true, isFavorite: false, description: 'Refreshing lime soda', prepTime: 3, spiceLevel: 'Mild', variants: [], addons: [], availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], availableFrom: '09:00 AM', availableTo: '11:00 PM' },
  { id: 21, name: 'Mango Lassi', shortCode: 'ML', category: 'Beverages', cuisine: 'Indian', type: 'Veg', basePrice: 80, status: true, isFavorite: false, description: 'Sweet mango yogurt drink', prepTime: 5, spiceLevel: 'Mild', variants: [], addons: [], availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], availableFrom: '09:00 AM', availableTo: '11:00 PM' },
  { id: 22, name: 'Filter Coffee', shortCode: 'FCF', category: 'Beverages', cuisine: 'South Indian', type: 'Veg', basePrice: 50, status: false, isFavorite: false, description: 'Traditional South Indian filter coffee', prepTime: 5, spiceLevel: 'Mild', variants: [], addons: [], availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], availableFrom: '09:00 AM', availableTo: '11:00 PM' },
  { id: 23, name: 'Gulab Jamun', shortCode: 'GJ', category: 'Desserts', cuisine: 'Indian', type: 'Veg', basePrice: 80, status: true, isFavorite: true, description: 'Sweet milk dumplings in sugar syrup', prepTime: 5, spiceLevel: 'Mild', variants: [{ name: '2 pcs', price: 80, active: true }, { name: '4 pcs', price: 150, active: true }], addons: [], availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], availableFrom: '09:00 AM', availableTo: '11:00 PM' },
  { id: 24, name: 'Rasmalai', shortCode: 'RM', category: 'Desserts', cuisine: 'Indian', type: 'Veg', basePrice: 100, status: true, isFavorite: false, description: 'Soft cottage cheese in sweetened milk', prepTime: 5, spiceLevel: 'Mild', variants: [], addons: [], availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], availableFrom: '09:00 AM', availableTo: '11:00 PM' },
  { id: 25, name: 'Ice Cream', shortCode: 'IC', category: 'Desserts', cuisine: 'Continental', type: 'Veg', basePrice: 120, status: true, isFavorite: false, description: 'Assorted flavors ice cream', prepTime: 2, spiceLevel: 'Mild', variants: [{ name: 'Single Scoop', price: 80, active: true }, { name: 'Double Scoop', price: 120, active: true }], addons: [{ name: 'Chocolate Sauce', price: 20, active: true }], availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], availableFrom: '09:00 AM', availableTo: '11:00 PM' },
  { id: 26, name: 'Gajar Halwa', shortCode: 'GH', category: 'Desserts', cuisine: 'North Indian', type: 'Veg', basePrice: 90, status: false, isFavorite: false, description: 'Sweet carrot pudding', prepTime: 5, spiceLevel: 'Mild', variants: [], addons: [], availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], availableFrom: '09:00 AM', availableTo: '11:00 PM' },
  { id: 27, name: 'Butter Naan', shortCode: 'BN', category: 'Breads', cuisine: 'North Indian', type: 'Veg', basePrice: 50, status: true, isFavorite: false, description: 'Soft butter-topped flatbread', prepTime: 5, spiceLevel: 'Mild', variants: [], addons: [], availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], availableFrom: '09:00 AM', availableTo: '11:00 PM' },
  { id: 28, name: 'Tandoori Roti', shortCode: 'TR', category: 'Breads', cuisine: 'North Indian', type: 'Veg', basePrice: 30, status: true, isFavorite: false, description: 'Whole wheat bread from tandoor', prepTime: 5, spiceLevel: 'Mild', variants: [], addons: [], availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], availableFrom: '09:00 AM', availableTo: '11:00 PM' },
  { id: 29, name: 'Garlic Naan', shortCode: 'GN', category: 'Breads', cuisine: 'North Indian', type: 'Veg', basePrice: 60, status: true, isFavorite: false, description: 'Naan topped with garlic and coriander', prepTime: 5, spiceLevel: 'Mild', variants: [], addons: [], availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], availableFrom: '09:00 AM', availableTo: '11:00 PM' },
  { id: 30, name: 'Laccha Paratha', shortCode: 'LP', category: 'Breads', cuisine: 'North Indian', type: 'Veg', basePrice: 40, status: true, isFavorite: false, description: 'Layered crispy flatbread', prepTime: 8, spiceLevel: 'Mild', variants: [], addons: [], availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], availableFrom: '09:00 AM', availableTo: '11:00 PM' },
  { id: 31, name: 'Jeera Rice', shortCode: 'JR', category: 'Rice', cuisine: 'Indian', type: 'Veg', basePrice: 150, status: true, isFavorite: false, description: 'Cumin-flavored basmati rice', prepTime: 15, spiceLevel: 'Mild', variants: [], addons: [], availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], availableFrom: '09:00 AM', availableTo: '11:00 PM' },
  { id: 32, name: 'Steamed Rice', shortCode: 'SR', category: 'Rice', cuisine: 'Indian', type: 'Veg', basePrice: 100, status: true, isFavorite: false, description: 'Plain steamed basmati rice', prepTime: 12, spiceLevel: 'Mild', variants: [], addons: [], availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], availableFrom: '09:00 AM', availableTo: '11:00 PM' },
];

const initialCategories: Category[] = [
  { id: 1, name: 'Starters', itemCount: 9, displayOrder: 1, status: true, color: '#8B5CF6' },
  { id: 2, name: 'Main Course', itemCount: 8, displayOrder: 2, status: true, color: '#F59E0B' },
  { id: 3, name: 'Beverages', itemCount: 5, displayOrder: 3, status: true, color: '#10B981' },
  { id: 4, name: 'Desserts', itemCount: 4, displayOrder: 4, status: true, color: '#EC4899' },
  { id: 5, name: 'Breads', itemCount: 4, displayOrder: 5, status: true, color: '#6366F1' },
  { id: 6, name: 'Rice', itemCount: 2, displayOrder: 6, status: true, color: '#14B8A6' },
  { id: 7, name: 'Chinese', itemCount: 0, displayOrder: 7, status: true, color: '#EF4444' },
  { id: 8, name: 'South Indian', itemCount: 0, displayOrder: 8, status: false, color: '#F97316' },
  { id: 9, name: 'North Indian', itemCount: 0, displayOrder: 9, status: true, color: '#84CC16' },
  { id: 10, name: 'Biryani', itemCount: 0, displayOrder: 10, status: true, color: '#A855F7' },
];

const initialVariants: Variant[] = [
  { id: 1, name: 'Full Plate', usedInItems: 20, status: true },
  { id: 2, name: 'Half Plate', usedInItems: 18, status: true },
  { id: 3, name: 'Quarter Plate', usedInItems: 5, status: true },
  { id: 4, name: 'Large', usedInItems: 8, status: true },
  { id: 5, name: 'Medium', usedInItems: 8, status: true },
  { id: 6, name: 'Small', usedInItems: 8, status: true },
];

const initialAddons: Addon[] = [
  { id: 1, name: 'Extra Mint Chutney', price: 20, usedInItems: 15, status: true },
  { id: 2, name: 'Extra Onion', price: 10, usedInItems: 20, status: true },
  { id: 3, name: 'Extra Cheese', price: 30, usedInItems: 12, status: true },
  { id: 4, name: 'Less Spicy', price: 0, usedInItems: 25, status: true },
  { id: 5, name: 'Extra Spicy', price: 0, usedInItems: 25, status: true },
  { id: 6, name: 'Extra Butter', price: 20, usedInItems: 10, status: true },
];

const level4MenuTabs = [
  { id: 'items', label: 'Menu Items' },
  { id: 'categories', label: 'Categories' },
  { id: 'variants', label: 'Variants & Addons' },
];

const categoryOptions = ['All Categories', 'Starters', 'Main Course', 'Beverages', 'Desserts', 'Breads', 'Rice'];
const cuisineOptions = ['North Indian', 'South Indian', 'Chinese', 'Continental', 'Mughlai', 'Indian'];
const spiceLevelOptions = ['Mild', 'Medium', 'Hot', 'Extra Hot'];
const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const FBMenu: React.FC = () => {
  const [activeTab, setActiveTab] = useState('items');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [currentPage, setCurrentPage] = useState(1);

  // Data states
  const [menuItems, setMenuItems] = useState<MenuItem[]>(initialMenuItems);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [variants, setVariants] = useState<Variant[]>(initialVariants);
  const [addons, setAddons] = useState<Addon[]>(initialAddons);

  // Modal states
  const [showItemModal, setShowItemModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [showAddonModal, setShowAddonModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{ type: string; id: number; name: string } | null>(null);

  // Edit states
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [viewingItem, setViewingItem] = useState<MenuItem | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingVariant, setEditingVariant] = useState<Variant | null>(null);
  const [editingAddon, setEditingAddon] = useState<Addon | null>(null);

  // Form state for new item
  const [formData, setFormData] = useState<Partial<MenuItem>>({
    name: '', shortCode: '', category: 'Starters', cuisine: 'North Indian', type: 'Veg',
    basePrice: 0, status: true, isFavorite: false, description: '', prepTime: 15,
    spiceLevel: 'Medium', variants: [], addons: [], availableDays: daysOfWeek,
    availableFrom: '09:00 AM', availableTo: '11:00 PM'
  });

  const recordsPerPage = viewMode === 'list' ? 10 : 12;

  // Filtered items
  const filteredItems = useMemo(() => {
    let items = [...menuItems];
    if (categoryFilter !== 'All Categories') {
      items = items.filter(i => i.category === categoryFilter);
    }
    if (searchQuery) {
      items = items.filter(i => i.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return items;
  }, [menuItems, categoryFilter, searchQuery]);

  const filteredCategories = useMemo(() => {
    if (!searchQuery) return categories;
    return categories.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [categories, searchQuery]);

  const totalPages = Math.ceil(
    (activeTab === 'items' ? filteredItems.length : filteredCategories.length) / recordsPerPage
  );
  
  const paginatedItems = filteredItems.slice((currentPage - 1) * recordsPerPage, currentPage * recordsPerPage);
  const paginatedCategories = filteredCategories.slice((currentPage - 1) * recordsPerPage, currentPage * recordsPerPage);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Veg': return <span className="w-4 h-4 rounded-full bg-green-500 inline-block"></span>;
      case 'Non-Veg': return <span className="w-4 h-4 rounded-full bg-red-500 inline-block"></span>;
      case 'Egg': return <span className="w-4 h-4 rounded-full bg-yellow-500 inline-block"></span>;
      default: return null;
    }
  };

  // Handlers
  const handleAddItem = () => {
    setEditingItem(null);
    setFormData({
      name: '', shortCode: '', category: 'Starters', cuisine: 'North Indian', type: 'Veg',
      basePrice: 0, status: true, isFavorite: false, description: '', prepTime: 15,
      spiceLevel: 'Medium', variants: [], addons: [], availableDays: daysOfWeek,
      availableFrom: '09:00 AM', availableTo: '11:00 PM'
    });
    setShowItemModal(true);
  };

  const handleEditItem = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({ ...item });
    setShowItemModal(true);
  };

  const handleViewItem = (item: MenuItem) => {
    setViewingItem(item);
    setShowViewModal(true);
  };

  const handleSaveItem = () => {
    if (!formData.name || !formData.basePrice) {
      toast.error('Please fill required fields');
      return;
    }
    if (editingItem) {
      setMenuItems(prev => prev.map(i => i.id === editingItem.id ? { ...i, ...formData } as MenuItem : i));
      toast.success('Item updated successfully!');
    } else {
      const newItem: MenuItem = { ...formData, id: Date.now() } as MenuItem;
      setMenuItems(prev => [...prev, newItem]);
      toast.success('Item added successfully!');
    }
    setShowItemModal(false);
  };

  const handleDeleteItem = (id: number, name: string) => {
    setShowDeleteConfirm({ type: 'item', id, name });
  };

  const confirmDelete = () => {
    if (!showDeleteConfirm) return;
    const { type, id, name } = showDeleteConfirm;
    if (type === 'item') {
      setMenuItems(prev => prev.filter(i => i.id !== id));
      toast.success(`${name} deleted successfully!`);
    } else if (type === 'category') {
      setCategories(prev => prev.filter(c => c.id !== id));
      toast.success(`${name} deleted successfully!`);
    } else if (type === 'variant') {
      setVariants(prev => prev.filter(v => v.id !== id));
      toast.success(`${name} deleted successfully!`);
    } else if (type === 'addon') {
      setAddons(prev => prev.filter(a => a.id !== id));
      toast.success(`${name} deleted successfully!`);
    }
    setShowDeleteConfirm(null);
  };

  const toggleItemStatus = (id: number) => {
    setMenuItems(prev => prev.map(i => i.id === id ? { ...i, status: !i.status } : i));
    toast.success('Status updated');
  };

  const handleExport = () => {
    toast.success('Exporting menu to Excel...');
  };

  // Category handlers
  const handleAddCategory = () => {
    setEditingCategory(null);
    setShowCategoryModal(true);
  };

  const handleSaveCategory = (name: string, order: number, status: boolean, color: string) => {
    if (editingCategory) {
      setCategories(prev => prev.map(c => c.id === editingCategory.id ? { ...c, name, displayOrder: order, status, color } : c));
      toast.success('Category updated!');
    } else {
      setCategories(prev => [...prev, { id: Date.now(), name, itemCount: 0, displayOrder: order, status, color }]);
      toast.success('Category added!');
    }
    setShowCategoryModal(false);
  };

  // Variant/Addon handlers
  const handleSaveVariant = (name: string, status: boolean) => {
    if (editingVariant) {
      setVariants(prev => prev.map(v => v.id === editingVariant.id ? { ...v, name, status } : v));
      toast.success('Variant updated!');
    } else {
      setVariants(prev => [...prev, { id: Date.now(), name, usedInItems: 0, status }]);
      toast.success('Variant added!');
    }
    setShowVariantModal(false);
  };

  const handleSaveAddon = (name: string, price: number, status: boolean) => {
    if (editingAddon) {
      setAddons(prev => prev.map(a => a.id === editingAddon.id ? { ...a, name, price, status } : a));
      toast.success('Addon updated!');
    } else {
      setAddons(prev => [...prev, { id: Date.now(), name, price, usedInItems: 0, status }]);
      toast.success('Addon added!');
    }
    setShowAddonModal(false);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Level 4 Tabs */}
      <div className="flex items-center w-full border-b border-border bg-muted/30">
        <nav className="w-full overflow-x-auto scrollbar-hide">
          <ul className="flex items-center w-full">
            {level4MenuTabs.map(tab => (
              <li key={tab.id} className="flex-1 min-w-0">
                <button
                  onClick={() => { setActiveTab(tab.id); setCurrentPage(1); setSearchQuery(''); }}
                  className={`w-full px-4 py-3 text-xs font-semibold transition-colors whitespace-nowrap uppercase tracking-wide text-center ${
                    activeTab === tab.id
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

      {/* Tab Content */}
      {activeTab === 'items' && (
        <>
          {/* Controls */}
          <div className="p-4 border-b border-border bg-card">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <button onClick={handleAddItem} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90">
                <Plus className="w-4 h-4" /> Add New Item
              </button>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text" placeholder="Search by item name..." value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                    className="pl-10 pr-4 py-2 w-64 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <select value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
                  className="px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm">
                  {categoryOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
                <div className="flex items-center border border-border rounded-lg overflow-hidden">
                  <button onClick={() => setViewMode('grid')} className={`p-2 ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'bg-background text-foreground hover:bg-accent'}`}>
                    <Grid className="w-4 h-4" />
                  </button>
                  <button onClick={() => setViewMode('list')} className={`p-2 ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'bg-background text-foreground hover:bg-accent'}`}>
                    <List className="w-4 h-4" />
                  </button>
                </div>
                <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-accent">
                  <Download className="w-4 h-4" /> Export
                </button>
              </div>
            </div>
          </div>

          {/* Items List/Grid */}
          <div className="flex-1 p-4 overflow-auto">
            {filteredItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                <Search className="w-16 h-16 mb-4" />
                <p className="text-lg font-medium">No items found</p>
              </div>
            ) : viewMode === 'list' ? (
              <div className="bg-card border border-border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-primary text-white">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Item Name</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Category</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Cuisine</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold uppercase">Type</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase">Base Price</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold uppercase">Status</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedItems.map((item, idx) => (
                      <tr key={item.id} className={`border-b border-border ${idx % 2 === 0 ? 'bg-background' : 'bg-muted/30'}`}>
                        <td className="px-4 py-3 text-sm font-medium text-foreground">{item.name}</td>
                        <td className="px-4 py-3 text-sm text-foreground">{item.category}</td>
                        <td className="px-4 py-3 text-sm text-foreground">{item.cuisine}</td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center gap-1.5 text-xs">
                            {getTypeIcon(item.type)} {item.type}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-semibold text-foreground">₹{item.basePrice}</td>
                        <td className="px-4 py-3 text-center">
                          <button onClick={() => toggleItemStatus(item.id)}
                            className={`relative w-10 h-5 rounded-full transition-colors ${item.status ? 'bg-primary' : 'bg-muted'}`}>
                            <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${item.status ? 'left-5' : 'left-0.5'}`}></span>
                          </button>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button onClick={() => handleViewItem(item)} className="p-1.5 text-primary hover:bg-accent rounded"><Eye className="w-4 h-4" /></button>
                            <button onClick={() => handleEditItem(item)} className="p-1.5 text-warning hover:bg-accent rounded"><Edit className="w-4 h-4" /></button>
                            <button onClick={() => handleDeleteItem(item.id, item.name)} className="p-1.5 text-error hover:bg-accent rounded"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {paginatedItems.map(item => (
                  <div key={item.id} className="bg-card border border-border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    <div className="h-32 bg-muted flex items-center justify-center">
                      <span className="text-4xl">🍽️</span>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-foreground mb-1">{item.name}</h3>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                        {getTypeIcon(item.type)} {item.type}
                      </div>
                      <p className="text-xs text-muted-foreground">{item.category}</p>
                      <p className="text-xs text-muted-foreground mb-2">{item.cuisine}</p>
                      <p className="text-xl font-bold text-primary mb-2">₹{item.basePrice}</p>
                      <p className={`text-xs font-medium ${item.status ? 'text-success' : 'text-error'}`}>
                        {item.status ? '✅ Available' : '❌ Unavailable'}
                      </p>
                      <div className="flex items-center gap-2 mt-3">
                        <button onClick={() => handleViewItem(item)} className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 border border-border rounded text-xs hover:bg-accent">
                          <Eye className="w-3 h-3" /> View
                        </button>
                        <button onClick={() => handleEditItem(item)} className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-primary text-primary-foreground rounded text-xs hover:bg-primary/90">
                          <Edit className="w-3 h-3" /> Edit
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {filteredItems.length > 0 && (
              <div className="flex items-center justify-between mt-4 py-3 px-4 bg-card border border-border rounded-lg">
                <span className="text-sm text-muted-foreground">
                  {(currentPage - 1) * recordsPerPage + 1}-{Math.min(currentPage * recordsPerPage, filteredItems.length)} of {filteredItems.length}
                </span>
                <div className="flex items-center gap-2">
                  <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-border hover:bg-accent disabled:opacity-50"><ChevronLeft className="w-4 h-4" /></button>
                  <span className="text-sm">Page {currentPage} of {totalPages || 1}</span>
                  <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0}
                    className="p-2 rounded-lg border border-border hover:bg-accent disabled:opacity-50"><ChevronRight className="w-4 h-4" /></button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === 'categories' && (
        <>
          <div className="p-4 border-b border-border bg-card">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <button onClick={handleAddCategory} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90">
                <Plus className="w-4 h-4" /> Add Category
              </button>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input type="text" placeholder="Search categories..." value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 w-64 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div className="flex items-center border border-border rounded-lg overflow-hidden">
                  <button onClick={() => setViewMode('grid')} className={`p-2 ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-accent'}`}><Grid className="w-4 h-4" /></button>
                  <button onClick={() => setViewMode('list')} className={`p-2 ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-accent'}`}><List className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 p-4 overflow-auto">
            {viewMode === 'list' ? (
              <div className="bg-card border border-border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-primary text-white">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Category Name</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold uppercase">Item Count</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold uppercase">Display Order</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold uppercase">Status</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedCategories.map((cat, idx) => (
                      <tr key={cat.id} className={`border-b border-border ${idx % 2 === 0 ? 'bg-background' : 'bg-muted/30'}`}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="w-4 h-4 rounded" style={{ backgroundColor: cat.color }}></span>
                            <span className="text-sm font-medium text-foreground">{cat.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-center text-foreground">{cat.itemCount} items</td>
                        <td className="px-4 py-3 text-sm text-center text-foreground">{cat.displayOrder}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${cat.status ? 'bg-success-light text-success' : 'bg-error-light text-error'}`}>
                            {cat.status ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button onClick={() => { setEditingCategory(cat); setShowCategoryModal(true); }} className="p-1.5 text-warning hover:bg-accent rounded"><Edit className="w-4 h-4" /></button>
                            <button onClick={() => setShowDeleteConfirm({ type: 'category', id: cat.id, name: cat.name })} className="p-1.5 text-error hover:bg-accent rounded"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {paginatedCategories.map(cat => (
                  <div key={cat.id} className="bg-card border border-border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-6 h-6 rounded" style={{ backgroundColor: cat.color }}></span>
                      <span className="font-bold text-foreground">{cat.name}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">{cat.itemCount} items</p>
                    <p className="text-sm text-muted-foreground mb-2">Display Order: {cat.displayOrder}</p>
                    <p className={`text-xs font-medium ${cat.status ? 'text-success' : 'text-error'}`}>
                      {cat.status ? '✅ Active' : '❌ Inactive'}
                    </p>
                    <div className="flex items-center gap-2 mt-3">
                      <button onClick={() => { setEditingCategory(cat); setShowCategoryModal(true); }} className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-primary text-primary-foreground rounded text-xs hover:bg-primary/90">
                        <Edit className="w-3 h-3" /> Edit
                      </button>
                      <button onClick={() => setShowDeleteConfirm({ type: 'category', id: cat.id, name: cat.name })} className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 border border-error text-error rounded text-xs hover:bg-error/10">
                        <Trash2 className="w-3 h-3" /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === 'variants' && (
        <div className="flex-1 p-4 overflow-auto space-y-6">
          {/* Variants Section */}
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-foreground">Variants</h3>
              <button onClick={() => { setEditingVariant(null); setShowVariantModal(true); }} className="flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground rounded text-sm hover:bg-primary/90">
                <Plus className="w-4 h-4" /> Add Variant
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {variants.map(v => (
                <div key={v.id} className="flex items-center justify-between p-3 border border-border rounded-lg bg-background">
                  <div>
                    <p className="font-medium text-foreground">{v.name}</p>
                    <p className="text-xs text-muted-foreground">Used in {v.usedInItems} items</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 text-xs rounded-full ${v.status ? 'bg-success-light text-success' : 'bg-error-light text-error'}`}>
                      {v.status ? 'Active' : 'Inactive'}
                    </span>
                    <button onClick={() => { setEditingVariant(v); setShowVariantModal(true); }} className="p-1 text-warning hover:bg-accent rounded"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => setShowDeleteConfirm({ type: 'variant', id: v.id, name: v.name })} className="p-1 text-error hover:bg-accent rounded"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Addons Section */}
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-foreground">Add-ons / Modifiers</h3>
              <button onClick={() => { setEditingAddon(null); setShowAddonModal(true); }} className="flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground rounded text-sm hover:bg-primary/90">
                <Plus className="w-4 h-4" /> Add Addon
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {addons.map(a => (
                <div key={a.id} className="flex items-center justify-between p-3 border border-border rounded-lg bg-background">
                  <div>
                    <p className="font-medium text-foreground">{a.name}</p>
                    <p className="text-xs text-muted-foreground">₹{a.price} • Used in {a.usedInItems} items</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 text-xs rounded-full ${a.status ? 'bg-success-light text-success' : 'bg-error-light text-error'}`}>
                      {a.status ? 'Active' : 'Inactive'}
                    </span>
                    <button onClick={() => { setEditingAddon(a); setShowAddonModal(true); }} className="p-1 text-warning hover:bg-accent rounded"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => setShowDeleteConfirm({ type: 'addon', id: a.id, name: a.name })} className="p-1 text-error hover:bg-accent rounded"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Item Modal */}
      {showItemModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-border bg-primary">
              <h2 className="text-lg font-bold text-white">{editingItem ? 'Edit Item' : 'Add New Item'}</h2>
              <button onClick={() => setShowItemModal(false)} className="p-2 text-white hover:bg-white/20 rounded"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-4 space-y-6">
              {/* Basic Details */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3">Basic Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Item Name *</label>
                    <input type="text" value={formData.name || ''} onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm" placeholder="Enter item name" />
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Short Code</label>
                    <input type="text" value={formData.shortCode || ''} onChange={(e) => setFormData(p => ({ ...p, shortCode: e.target.value }))}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm" placeholder="e.g., PT" />
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Category</label>
                    <select value={formData.category || 'Starters'} onChange={(e) => setFormData(p => ({ ...p, category: e.target.value }))}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm">
                      {categoryOptions.slice(1).map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Cuisine</label>
                    <select value={formData.cuisine || 'North Indian'} onChange={(e) => setFormData(p => ({ ...p, cuisine: e.target.value }))}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm">
                      {cuisineOptions.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Type</label>
                    <div className="flex items-center gap-4 mt-1">
                      {(['Veg', 'Non-Veg', 'Egg'] as const).map(t => (
                        <label key={t} className="flex items-center gap-1.5 cursor-pointer">
                          <input type="radio" name="type" checked={formData.type === t} onChange={() => setFormData(p => ({ ...p, type: t }))} className="w-4 h-4 text-primary" />
                          <span className="text-sm text-foreground">{t}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Base Price * (₹)</label>
                    <input type="number" value={formData.basePrice || ''} onChange={(e) => setFormData(p => ({ ...p, basePrice: Number(e.target.value) }))}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm" placeholder="0" />
                  </div>
                </div>
              </div>

              {/* Additional Details */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3">Additional Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs text-muted-foreground mb-1">Description</label>
                    <textarea value={formData.description || ''} onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm" rows={2} placeholder="Item description..." />
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Prep Time (minutes)</label>
                    <input type="number" value={formData.prepTime || 15} onChange={(e) => setFormData(p => ({ ...p, prepTime: Number(e.target.value) }))}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Spice Level</label>
                    <select value={formData.spiceLevel || 'Medium'} onChange={(e) => setFormData(p => ({ ...p, spiceLevel: e.target.value }))}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm">
                      {spiceLevelOptions.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Availability */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3">Availability</h3>
                <div className="flex flex-wrap items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={formData.status} onChange={(e) => setFormData(p => ({ ...p, status: e.target.checked }))} className="w-4 h-4 rounded text-primary" />
                    <span className="text-sm text-foreground">Is Available</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={formData.isFavorite} onChange={(e) => setFormData(p => ({ ...p, isFavorite: e.target.checked }))} className="w-4 h-4 rounded text-primary" />
                    <span className="text-sm text-foreground">Mark as Favorite</span>
                  </label>
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <span className="text-xs text-muted-foreground">Available Days:</span>
                  {daysOfWeek.map(day => (
                    <label key={day} className="flex items-center gap-1 cursor-pointer">
                      <input type="checkbox" checked={formData.availableDays?.includes(day)}
                        onChange={(e) => {
                          const days = formData.availableDays || [];
                          setFormData(p => ({ ...p, availableDays: e.target.checked ? [...days, day] : days.filter(d => d !== day) }));
                        }} className="w-3 h-3 rounded text-primary" />
                      <span className="text-xs text-foreground">{day}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-4 border-t border-border bg-muted/30">
              <button onClick={() => setShowItemModal(false)} className="px-4 py-2 border border-border rounded-lg text-sm hover:bg-accent">Cancel</button>
              <button onClick={handleSaveItem} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* View Item Modal */}
      {showViewModal && viewingItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-lg shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-border bg-primary">
              <h2 className="text-lg font-bold text-white">{viewingItem.name}</h2>
              <button onClick={() => setShowViewModal(false)} className="p-2 text-white hover:bg-white/20 rounded"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-xs text-muted-foreground">Category</p><p className="text-sm font-medium text-foreground">{viewingItem.category}</p></div>
                <div><p className="text-xs text-muted-foreground">Cuisine</p><p className="text-sm font-medium text-foreground">{viewingItem.cuisine}</p></div>
                <div><p className="text-xs text-muted-foreground">Type</p><p className="text-sm font-medium text-foreground flex items-center gap-1">{getTypeIcon(viewingItem.type)} {viewingItem.type}</p></div>
                <div><p className="text-xs text-muted-foreground">Base Price</p><p className="text-lg font-bold text-primary">₹{viewingItem.basePrice}</p></div>
                <div><p className="text-xs text-muted-foreground">Status</p><p className={`text-sm font-medium ${viewingItem.status ? 'text-success' : 'text-error'}`}>{viewingItem.status ? 'Available' : 'Unavailable'}</p></div>
                <div><p className="text-xs text-muted-foreground">Favorite</p><p className="text-sm font-medium text-foreground">{viewingItem.isFavorite ? '⭐ Yes' : 'No'}</p></div>
              </div>
              {viewingItem.description && (
                <div><p className="text-xs text-muted-foreground">Description</p><p className="text-sm text-foreground">{viewingItem.description}</p></div>
              )}
              {viewingItem.variants.length > 0 && (
                <div><p className="text-xs text-muted-foreground mb-1">Variants</p>
                  <div className="flex flex-wrap gap-2">{viewingItem.variants.map((v, i) => <span key={i} className="px-2 py-1 bg-muted rounded text-xs">{v.name}: ₹{v.price}</span>)}</div>
                </div>
              )}
              {viewingItem.addons.length > 0 && (
                <div><p className="text-xs text-muted-foreground mb-1">Add-ons</p>
                  <div className="flex flex-wrap gap-2">{viewingItem.addons.map((a, i) => <span key={i} className="px-2 py-1 bg-muted rounded text-xs">{a.name}: ₹{a.price}</span>)}</div>
                </div>
              )}
            </div>
            <div className="flex items-center justify-end gap-3 p-4 border-t border-border bg-muted/30">
              <button onClick={() => { setShowViewModal(false); handleEditItem(viewingItem); }} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90">Edit</button>
              <button onClick={() => setShowViewModal(false)} className="px-4 py-2 border border-border rounded-lg text-sm hover:bg-accent">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {showCategoryModal && (
        <CategoryModal
          category={editingCategory}
          onSave={handleSaveCategory}
          onClose={() => { setShowCategoryModal(false); setEditingCategory(null); }}
        />
      )}

      {/* Variant Modal */}
      {showVariantModal && (
        <VariantModal
          variant={editingVariant}
          onSave={handleSaveVariant}
          onClose={() => { setShowVariantModal(false); setEditingVariant(null); }}
        />
      )}

      {/* Addon Modal */}
      {showAddonModal && (
        <AddonModal
          addon={editingAddon}
          onSave={handleSaveAddon}
          onClose={() => { setShowAddonModal(false); setEditingAddon(null); }}
        />
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-lg shadow-xl w-full max-w-sm p-6">
            <h3 className="text-lg font-bold text-foreground mb-2">Confirm Delete</h3>
            <p className="text-sm text-muted-foreground mb-4">Are you sure you want to delete "{showDeleteConfirm.name}"?</p>
            <div className="flex items-center justify-end gap-3">
              <button onClick={() => setShowDeleteConfirm(null)} className="px-4 py-2 border border-border rounded-lg text-sm hover:bg-accent">Cancel</button>
              <button onClick={confirmDelete} className="px-4 py-2 bg-error text-white rounded-lg text-sm font-medium hover:bg-error/90">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Sub-components for modals
const CategoryModal: React.FC<{ category: Category | null; onSave: (name: string, order: number, status: boolean, color: string) => void; onClose: () => void }> = ({ category, onSave, onClose }) => {
  const [name, setName] = useState(category?.name || '');
  const [order, setOrder] = useState(category?.displayOrder || 1);
  const [status, setStatus] = useState(category?.status ?? true);
  const [color, setColor] = useState(category?.color || '#8B5CF6');
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg shadow-xl w-full max-w-md p-6">
        <h3 className="text-lg font-bold text-foreground mb-4">{category ? 'Edit Category' : 'Add Category'}</h3>
        <div className="space-y-4">
          <div><label className="block text-xs text-muted-foreground mb-1">Category Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm" /></div>
          <div><label className="block text-xs text-muted-foreground mb-1">Display Order</label>
            <input type="number" value={order} onChange={(e) => setOrder(Number(e.target.value))} className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm" /></div>
          <div><label className="block text-xs text-muted-foreground mb-1">Color</label>
            <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-16 h-10 border border-border rounded cursor-pointer" /></div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={status} onChange={(e) => setStatus(e.target.checked)} className="w-4 h-4 rounded text-primary" />
            <span className="text-sm text-foreground">Is Active</span>
          </label>
        </div>
        <div className="flex items-center justify-end gap-3 mt-6">
          <button onClick={onClose} className="px-4 py-2 border border-border rounded-lg text-sm hover:bg-accent">Cancel</button>
          <button onClick={() => { if (name) onSave(name, order, status, color); }} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90">Save</button>
        </div>
      </div>
    </div>
  );
};

const VariantModal: React.FC<{ variant: Variant | null; onSave: (name: string, status: boolean) => void; onClose: () => void }> = ({ variant, onSave, onClose }) => {
  const [name, setName] = useState(variant?.name || '');
  const [status, setStatus] = useState(variant?.status ?? true);
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg shadow-xl w-full max-w-md p-6">
        <h3 className="text-lg font-bold text-foreground mb-4">{variant ? 'Edit Variant' : 'Add Variant'}</h3>
        <div className="space-y-4">
          <div><label className="block text-xs text-muted-foreground mb-1">Variant Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm" placeholder="e.g., Full Plate" /></div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={status} onChange={(e) => setStatus(e.target.checked)} className="w-4 h-4 rounded text-primary" />
            <span className="text-sm text-foreground">Is Active</span>
          </label>
        </div>
        <div className="flex items-center justify-end gap-3 mt-6">
          <button onClick={onClose} className="px-4 py-2 border border-border rounded-lg text-sm hover:bg-accent">Cancel</button>
          <button onClick={() => { if (name) onSave(name, status); }} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90">Save</button>
        </div>
      </div>
    </div>
  );
};

const AddonModal: React.FC<{ addon: Addon | null; onSave: (name: string, price: number, status: boolean) => void; onClose: () => void }> = ({ addon, onSave, onClose }) => {
  const [name, setName] = useState(addon?.name || '');
  const [price, setPrice] = useState(addon?.price || 0);
  const [status, setStatus] = useState(addon?.status ?? true);
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg shadow-xl w-full max-w-md p-6">
        <h3 className="text-lg font-bold text-foreground mb-4">{addon ? 'Edit Addon' : 'Add Addon'}</h3>
        <div className="space-y-4">
          <div><label className="block text-xs text-muted-foreground mb-1">Addon Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm" placeholder="e.g., Extra Cheese" /></div>
          <div><label className="block text-xs text-muted-foreground mb-1">Price (₹)</label>
            <input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm" /></div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={status} onChange={(e) => setStatus(e.target.checked)} className="w-4 h-4 rounded text-primary" />
            <span className="text-sm text-foreground">Is Active</span>
          </label>
        </div>
        <div className="flex items-center justify-end gap-3 mt-6">
          <button onClick={onClose} className="px-4 py-2 border border-border rounded-lg text-sm hover:bg-accent">Cancel</button>
          <button onClick={() => { if (name) onSave(name, price, status); }} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90">Save</button>
        </div>
      </div>
    </div>
  );
};

export default FBMenu;

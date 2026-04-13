// @ts-nocheck
import { Home, List, PieChart, Settings, Coffee, AlertCircle, ShoppingBag, ArrowUpRight, RefreshCw, Wallet, Car, Smartphone, Zap, Heart, Gift, Book, Briefcase, Plane, Tags, LayoutGrid, TrendingUp, TrendingDown, Activity, Utensils, Receipt, Monitor, Dumbbell, Stethoscope } from 'lucide-react';

export const IconMap = {
  Coffee: <Coffee size={16} />, AlertCircle: <AlertCircle size={16} />, ShoppingBag: <ShoppingBag size={16} />,
  ArrowUpRight: <ArrowUpRight size={16} />, RefreshCw: <RefreshCw size={16} />, Wallet: <Wallet size={16} />,
  Car: <Car size={16} />, Home: <Home size={16} />, Smartphone: <Smartphone size={16} />, Zap: <Zap size={16} />,
  Heart: <Heart size={16} />, Gift: <Gift size={16} />, Book: <Book size={16} />, Briefcase: <Briefcase size={16} />,
  Plane: <Plane size={16} />, Tags: <Tags size={16} />, LayoutGrid: <LayoutGrid size={16} />,
  TrendingUp: <TrendingUp size={16} />, TrendingDown: <TrendingDown size={16} />, Activity: <Activity size={16} />,
  Utensils: <Utensils size={16} />, Receipt: <Receipt size={16} />, Monitor: <Monitor size={16} />,
  Dumbbell: <Dumbbell size={16} />, Stethoscope: <Stethoscope size={16} />
};

export const HARDCODED_CATEGORIES = [
  { id: 'e1', name: 'Food & Dining', type: 'expense', icon: 'Utensils' },
  { id: 'e2', name: 'Shopping', type: 'expense', icon: 'ShoppingBag' },
  { id: 'e3', name: 'Transportation', type: 'expense', icon: 'Car' },
  { id: 'e4', name: 'Utilities', type: 'expense', icon: 'Zap' },
  { id: 'e5', name: 'Subscriptions', type: 'expense', icon: 'Monitor' },
  { id: 'e6', name: 'Health', type: 'expense', icon: 'Stethoscope' },
  { id: 'e7', name: 'Travel', type: 'expense', icon: 'Plane' },
  { id: 'e8', name: 'Others', type: 'expense', icon: 'LayoutGrid' },
  { id: 'i1', name: 'Salary', type: 'income', icon: 'Briefcase' },
  { id: 'i2', name: 'Freelance', type: 'income', icon: 'Smartphone' },
  { id: 'i3', name: 'Investment', type: 'income', icon: 'TrendingUp' },
  { id: 'i4', name: 'Gift', type: 'income', icon: 'Gift' },
  { id: 'i5', name: 'Other Income', type: 'income', icon: 'ArrowUpRight' },
];

// Mapping suggestions to specific categories
export const CATEGORIZED_SUGGESTIONS = {
  'Food & Dining': ["Lunch", "Dinner", "Snacks", "Grocery", "Coffee", "KFC", "Burger King", "Restaurant Bill"],
  'Shopping': ["Clothes", "Shoes", "Gadgets", "Amazon Purchase", "Gift for friend", "Supermarket"],
  'Transportation': ["Uber", "Bus Fare", "Fuel/Gas", "Parking Fee", "Train Ticket", "Rickshaw"],
  'Utilities': ["Electricity Bill", "Water Bill", "Gas Bill", "Internet Bill", "Trash Collection"],
  'Subscriptions': ["Netflix", "Spotify", "YouTube Premium", "iCloud Storage", "Amazon Prime", "Adobe CC"],
  'Health': ["Pharmacy/Medicine", "Doctor Consultation", "Gym Membership", "Dental Checkup", "Yoga Class"],
  'Travel': ["Flight Ticket", "Hotel Booking", "Visa Fee", "Souvenirs", "Sightseeing"],
  'Salary': ["Monthly Salary", "Performance Bonus", "Overtime Pay"],
  'Freelance': ["Upwork Payout", "Fiverr Project", "Direct Client Work", "Consulting Fee"],
  'Investment': ["Stock Dividends", "Bank Interest", "Crypto Profit", "Gold Investment Return"],
  'Gift': ["Birthday Gift", "Wedding Gift", "Eid Bonus"],
  'Others': ["Miscellaneous", "Laundry", "Home Maintenance", "Charity"]
};

export const INITIAL_ACCOUNTS: any[] = [];

export const INITIAL_TRANSACTIONS: any[] = [];

export const NAV_ITEMS_MAP = [
  { id: 'dashboard', icon: Home, label: 'Home' },
  { id: 'transactions', icon: List, label: 'History' },
  { id: 'analytics', icon: PieChart, label: 'Analytics' },
  { id: 'profile', icon: Settings, label: 'Settings' }
];
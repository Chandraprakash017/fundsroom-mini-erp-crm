import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

interface DashboardStats {
  totalCustomers: number;
  totalProducts: number;
  currentStock: number;
  draftChallans: number;
  confirmedChallans: number;
}

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/dashboard/stats`);
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch dashboard stats', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>
      <div className="bg-white p-6 rounded shadow mb-6">
        <p className="text-lg">Welcome back, {user?.name}!</p>
        <p className="text-gray-600">Role: {user?.role}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded shadow border-l-4 border-blue-500">
          <h3 className="text-gray-500 text-sm font-medium">Total Customers</h3>
          <p className="text-3xl font-bold text-gray-900">{stats?.totalCustomers || 0}</p>
        </div>
        <div className="bg-white p-6 rounded shadow border-l-4 border-green-500">
          <h3 className="text-gray-500 text-sm font-medium">Total Products</h3>
          <p className="text-3xl font-bold text-gray-900">{stats?.totalProducts || 0}</p>
        </div>
        <div className="bg-white p-6 rounded shadow border-l-4 border-yellow-500">
          <h3 className="text-gray-500 text-sm font-medium">Current Stock</h3>
          <p className="text-3xl font-bold text-gray-900">{stats?.currentStock || 0}</p>
        </div>
        <div className="bg-white p-6 rounded shadow border-l-4 border-orange-500">
          <h3 className="text-gray-500 text-sm font-medium">Draft Challans</h3>
          <p className="text-3xl font-bold text-gray-900">{stats?.draftChallans || 0}</p>
        </div>
        <div className="bg-white p-6 rounded shadow border-l-4 border-purple-500">
          <h3 className="text-gray-500 text-sm font-medium">Confirmed Challans</h3>
          <p className="text-3xl font-bold text-gray-900">{stats?.confirmedChallans || 0}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div 
          onClick={() => navigate('/customers')}
          className="bg-blue-500 text-white p-6 rounded shadow cursor-pointer hover:bg-blue-600 transition"
        >
          <h2 className="text-xl font-bold">Customers</h2>
          <p className="mt-2 text-sm opacity-90">Manage CRM</p>
        </div>
        
        <div 
          onClick={() => navigate('/products')}
          className="bg-green-500 text-white p-6 rounded shadow cursor-pointer hover:bg-green-600 transition"
        >
          <h2 className="text-xl font-bold">Products</h2>
          <p className="mt-2 text-sm opacity-90">Manage Inventory</p>
        </div>

        <div 
          onClick={() => navigate('/inventory')}
          className="bg-purple-500 text-white p-6 rounded shadow cursor-pointer hover:bg-purple-600 transition"
        >
          <h2 className="text-xl font-bold">Inventory Logs</h2>
          <p className="mt-2 text-sm opacity-90">Track Movements</p>
        </div>

        <div 
          onClick={() => navigate('/challans')}
          className="bg-orange-500 text-white p-6 rounded shadow cursor-pointer hover:bg-orange-600 transition"
        >
          <h2 className="text-xl font-bold">Sales Challans</h2>
          <p className="mt-2 text-sm opacity-90">Manage Orders</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

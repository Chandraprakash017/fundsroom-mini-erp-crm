import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:5000/api';

interface Challan {
  id: string;
  challanNumber: string;
  status: string;
  createdAt: string;
  customer: {
    name: string;
  };
  items: {
    quantity: number;
    price: number;
    product: {
      name: string;
      sku: string;
    };
  }[];
}

const Challans = () => {
  const [challans, setChallans] = useState<Challan[]>([]);
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchChallans();
  }, []);

  const fetchChallans = async () => {
    try {
      const response = await axios.get(`${API_URL}/challans`);
      setChallans(response.data);
    } catch (error) {
      console.error('Failed to fetch challans', error);
    }
  };

  const handleConfirm = async (id: string) => {
    try {
      await axios.post(`${API_URL}/challans/${id}/confirm`);
      fetchChallans();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to confirm challan');
    }
  };

  const handleCancel = async (id: string) => {
    try {
      await axios.post(`${API_URL}/challans/${id}/cancel`);
      fetchChallans();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to cancel challan');
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Sales Challans</h1>
        <div className="flex gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Dashboard
          </button>
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Challan #</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Items</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {challans.map((challan) => (
              <tr key={challan.id}>
                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{challan.challanNumber}</td>
                <td className="px-6 py-4 whitespace-nowrap">{challan.customer.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(challan.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    challan.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' : 
                    challan.status === 'CANCELLED' ? 'bg-red-100 text-red-800' : 
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {challan.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {challan.items.reduce((acc, item) => acc + item.quantity, 0)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {challan.status === 'DRAFT' && (
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleConfirm(challan.id)}
                        className="text-green-600 hover:text-green-900"
                      >
                        Confirm
                      </button>
                      <button 
                        onClick={() => handleCancel(challan.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {challans.length === 0 && (
          <p className="text-center text-gray-500 mt-4">No challans found.</p>
        )}
      </div>
    </div>
  );
};

export default Challans;

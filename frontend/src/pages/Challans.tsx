import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

interface Customer {
  id: string;
  name: string;
}

interface Product {
  id: string;
  sku: string;
  name: string;
  price: number;
  stock: number;
}

interface ChallanItem {
  quantity: number;
  price: number;
  product: {
    name: string;
    sku: string;
  };
}

interface Challan {
  id: string;
  challanNumber: string;
  status: string;
  createdAt: string;
  customer: {
    name: string;
  };
  items: ChallanItem[];
}

interface SelectedItemInput {
  productId: string;
  quantity: number;
  price: number;
}

const Challans = () => {
  const [challans, setChallans] = useState<Challan[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const { logout } = useAuth();
  const navigate = useNavigate();

  // Form Modals State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [customerId, setCustomerId] = useState('');
  const [itemsInput, setItemsInput] = useState<SelectedItemInput[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchChallans();
    fetchCustomers();
    fetchProducts();
  }, []);

  const fetchChallans = async () => {
    try {
      const response = await axios.get(`${API_URL}/challans`);
      setChallans(response.data);
    } catch (error) {
      console.error('Failed to fetch challans', error);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await axios.get(`${API_URL}/customers`);
      setCustomers(response.data);
    } catch (error) {
      console.error('Failed to fetch customers', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API_URL}/products`);
      setProducts(response.data);
    } catch (error) {
      console.error('Failed to fetch products', error);
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

  const handleOpenAdd = () => {
    setCustomerId(customers[0]?.id || '');
    setItemsInput([{ productId: products[0]?.id || '', quantity: 1, price: products[0]?.price || 0 }]);
    setError('');
    setIsFormOpen(true);
  };

  const handleAddItemRow = () => {
    const defaultProduct = products[0];
    setItemsInput([
      ...itemsInput,
      {
        productId: defaultProduct?.id || '',
        quantity: 1,
        price: defaultProduct?.price || 0
      }
    ]);
  };

  const handleRemoveItemRow = (index: number) => {
    setItemsInput(itemsInput.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, key: keyof SelectedItemInput, value: any) => {
    const updated = [...itemsInput];
    if (key === 'productId') {
      const selectedProd = products.find(p => p.id === value);
      updated[index] = {
        productId: value,
        quantity: updated[index].quantity,
        price: selectedProd ? selectedProd.price : 0,
      };
    } else {
      updated[index] = {
        ...updated[index],
        [key]: value,
      };
    }
    setItemsInput(updated);
  };

  const handleSaveChallan = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!customerId) {
      setError('Please select a customer');
      return;
    }

    if (itemsInput.length === 0) {
      setError('Please add at least one product item');
      return;
    }

    // Basic validation of lines
    for (const item of itemsInput) {
      if (!item.productId) {
        setError('Please select a product for all lines');
        return;
      }
      if (item.quantity <= 0) {
        setError('Quantity must be greater than 0');
        return;
      }
    }

    try {
      await axios.post(`${API_URL}/challans`, {
        customerId,
        items: itemsInput,
      });
      setIsFormOpen(false);
      fetchChallans();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create challan');
    }
  };

  return (
    <div className="p-8 min-h-screen bg-gray-50">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Sales Challans</h1>
        <div className="flex gap-4">
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-blue-600 text-white font-medium rounded shadow hover:bg-blue-700 transition"
          >
            Create Challan
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-gray-500 text-white font-medium rounded shadow hover:bg-gray-600 transition"
          >
            Dashboard
          </button>
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-500 text-white font-medium rounded shadow hover:bg-red-600 transition"
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items Summary</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Value</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {challans.map((challan) => (
              <tr key={challan.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{challan.challanNumber}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{challan.customer.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(challan.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    challan.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' : 
                    challan.status === 'CANCELLED' ? 'bg-red-100 text-red-800' : 
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {challan.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  <div className="max-w-xs truncate">
                    {challan.items.map((item, idx) => (
                      <div key={idx} className="text-xs">
                        • {item.product.name} x {item.quantity}
                      </div>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                  ${challan.items.reduce((acc, item) => acc + (item.quantity * item.price), 0).toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                  {challan.status === 'DRAFT' ? (
                    <div className="flex justify-center gap-3">
                      <button 
                        onClick={() => handleConfirm(challan.id)}
                        className="text-green-600 hover:text-green-900 bg-green-50 px-2 py-1 rounded"
                      >
                        Confirm
                      </button>
                      <button 
                        onClick={() => handleCancel(challan.id)}
                        className="text-red-600 hover:text-red-900 bg-red-50 px-2 py-1 rounded"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {challans.length === 0 && (
          <p className="text-center text-gray-500 mt-6">No challans found.</p>
        )}
      </div>

      {/* Create Challan Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 max-h-[90vh] flex flex-col">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Create Sales Challan (Draft)</h2>
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            
            <form onSubmit={handleSaveChallan} className="flex-1 flex flex-col min-h-0">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Customer</label>
                <select
                  required
                  value={customerId}
                  onChange={e => setCustomerId(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  <option value="" disabled>Select Customer...</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex-1 overflow-y-auto mb-4 border-y py-3 min-h-[150px]">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-semibold text-gray-700">Product Line Items</h3>
                  <button
                    type="button"
                    onClick={handleAddItemRow}
                    className="text-xs bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-2 py-1 rounded font-medium"
                  >
                    + Add Line Item
                  </button>
                </div>

                <div className="space-y-3">
                  {itemsInput.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-gray-50 p-2 rounded border border-gray-200">
                      <div className="flex-1">
                        <label className="block text-[10px] text-gray-400">Product</label>
                        <select
                          required
                          value={item.productId}
                          onChange={e => handleItemChange(idx, 'productId', e.target.value)}
                          className="block w-full px-2 py-1 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-xs"
                        >
                          <option value="" disabled>Select Product...</option>
                          {products.map(p => (
                            <option key={p.id} value={p.id} disabled={p.stock <= 0}>
                              {p.name} (SKU: {p.sku}) - Stock: {p.stock}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="w-20">
                        <label className="block text-[10px] text-gray-400">Qty</label>
                        <input
                          type="number"
                          min="1"
                          required
                          value={item.quantity}
                          onChange={e => handleItemChange(idx, 'quantity', parseInt(e.target.value) || 1)}
                          className="block w-full px-2 py-1 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-xs"
                        />
                      </div>

                      <div className="w-24">
                        <label className="block text-[10px] text-gray-400">Price ($)</label>
                        <input
                          type="number"
                          step="0.01"
                          required
                          value={item.price}
                          onChange={e => handleItemChange(idx, 'price', parseFloat(e.target.value) || 0)}
                          className="block w-full px-2 py-1 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-xs"
                        />
                      </div>

                      <div className="self-end pb-0.5">
                        <button
                          type="button"
                          onClick={() => handleRemoveItemRow(idx)}
                          className="text-red-500 hover:text-red-700 text-sm font-bold px-2 py-1"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}

                  {itemsInput.length === 0 && (
                    <p className="text-center text-gray-400 text-xs py-4">No line items added yet.</p>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center bg-gray-50 p-3 rounded mb-4">
                <span className="text-sm font-medium text-gray-600">Total Challan Amount:</span>
                <span className="text-lg font-bold text-gray-800">
                  ${itemsInput.reduce((acc, item) => acc + (item.quantity * item.price), 0).toFixed(2)}
                </span>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Save Draft
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Challans;

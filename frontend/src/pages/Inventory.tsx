import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:5001/api';

interface Product {
  id: string;
  name: string;
  sku: string;
}

interface StockMovement {
  id: string;
  type: 'IN' | 'OUT';
  quantity: number;
  productId: string;
  createdBy: string;
  createdAt: string;
  product: {
    name: string;
    sku: string;
  };
}

const Inventory = () => {
  const [logs, setLogs] = useState<StockMovement[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const { logout } = useAuth();
  const navigate = useNavigate();

  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [productId, setProductId] = useState('');
  const [type, setType] = useState<'IN' | 'OUT'>('IN');
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLogs();
    fetchProducts();
  }, []);

  const fetchLogs = async () => {
    try {
      const response = await axios.get(`${API_URL}/inventory/logs`);
      setLogs(response.data);
    } catch (error) {
      console.error('Failed to fetch inventory logs', error);
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

  const handleOpenAdd = () => {
    setProductId(products[0]?.id || '');
    setType('IN');
    setQuantity(1);
    setError('');
    setIsFormOpen(true);
  };

  const handleRecordMovement = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!productId) {
      setError('Please select a product');
      return;
    }

    try {
      await axios.post(`${API_URL}/inventory/movement`, {
        productId,
        type,
        quantity: Number(quantity),
      });
      setIsFormOpen(false);
      fetchLogs();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to record movement');
    }
  };

  return (
    <div className="p-8 min-h-screen bg-gray-50">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Inventory Logs</h1>
        <div className="flex gap-4">
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-blue-600 text-white font-medium rounded shadow hover:bg-blue-700 transition"
          >
            Record Movement
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(log.createdAt).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    log.type === 'IN' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {log.type}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {log.product.name} ({log.product.sku})
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                  {log.type === 'IN' ? '+' : '-'}{log.quantity}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {logs.length === 0 && (
          <p className="text-center text-gray-500 mt-6">No inventory logs found.</p>
        )}
      </div>

      {/* Record Stock Movement Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Record Stock Movement</h2>
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            <form onSubmit={handleRecordMovement} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Product</label>
                <select
                  required
                  value={productId}
                  onChange={e => setProductId(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  <option value="" disabled>Select a product...</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Movement Type</label>
                <select
                  value={type}
                  onChange={e => setType(e.target.value as 'IN' | 'OUT')}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  <option value="IN">IN (Receive Stock)</option>
                  <option value="OUT">OUT (Issue Stock)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Quantity</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={quantity}
                  onChange={e => setQuantity(parseInt(e.target.value) || 1)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
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
                  Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;

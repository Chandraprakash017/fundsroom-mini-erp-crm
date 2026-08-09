import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:5001/api';

interface Note {
  id: string;
  content: string;
  createdAt: string;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string | null;
  notes?: Note[];
}

const Customers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const { logout } = useAuth();
  const navigate = useNavigate();

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isNotesOpen, setIsNotesOpen] = useState(false);

  // Active items
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [newNoteText, setNewNoteText] = useState('');

  // Form inputs
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await axios.get(`${API_URL}/customers`);
      setCustomers(response.data);
    } catch (error) {
      console.error('Failed to fetch customers', error);
    }
  };

  const handleOpenAdd = () => {
    setSelectedCustomer(null);
    setName('');
    setEmail('');
    setPhone('');
    setCompany('');
    setError('');
    setIsFormOpen(true);
  };

  const handleOpenEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    setName(customer.name);
    setEmail(customer.email);
    setPhone(customer.phone);
    setCompany(customer.company || '');
    setError('');
    setIsFormOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const payload = { name, email, phone, company: company || null };
    try {
      if (selectedCustomer) {
        // Update
        await axios.put(`${API_URL}/customers/${selectedCustomer.id}`, payload);
      } else {
        // Create
        await axios.post(`${API_URL}/customers`, payload);
      }
      setIsFormOpen(false);
      fetchCustomers();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save customer');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this customer? All associated notes and files will be deleted.')) {
      return;
    }
    try {
      await axios.delete(`${API_URL}/customers/${id}`);
      fetchCustomers();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to delete customer');
    }
  };

  const handleOpenNotes = (customer: Customer) => {
    setSelectedCustomer(customer);
    setNewNoteText('');
    setIsNotesOpen(true);
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim() || !selectedCustomer) return;
    try {
      await axios.post(`${API_URL}/customers/${selectedCustomer.id}/notes`, { content: newNoteText });
      // Fetch updated customer notes
      const response = await axios.get(`${API_URL}/customers/${selectedCustomer.id}`);
      // Update in local state
      setCustomers(customers.map(c => c.id === selectedCustomer.id ? response.data : c));
      setSelectedCustomer(response.data);
      setNewNoteText('');
    } catch (err) {
      console.error('Failed to add note', err);
    }
  };

  return (
    <div className="p-8 min-h-screen bg-gray-50">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Customers CRM</h1>
        <div className="flex gap-4">
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-blue-600 text-white font-medium rounded shadow hover:bg-blue-700 transition"
          >
            + Add Customer
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {customers.map((customer) => (
              <tr key={customer.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{customer.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.phone}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.company || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                  <div className="flex justify-center gap-3">
                    <button
                      onClick={() => handleOpenNotes(customer)}
                      className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 px-2 py-1 rounded"
                    >
                      Notes ({customer.notes?.length || 0})
                    </button>
                    <button
                      onClick={() => handleOpenEdit(customer)}
                      className="text-amber-600 hover:text-amber-900 bg-amber-50 px-2 py-1 rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(customer.id)}
                      className="text-red-600 hover:text-red-900 bg-red-50 px-2 py-1 rounded"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {customers.length === 0 && (
          <p className="text-center text-gray-500 mt-6">No customers found.</p>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              {selectedCustomer ? 'Edit Customer' : 'Add New Customer'}
            </h2>
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Company (Optional)</label>
                <input
                  type="text"
                  value={company}
                  onChange={e => setCompany(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
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
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Notes Modal */}
      {isNotesOpen && selectedCustomer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 max-h-[90vh] flex flex-col">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              CRM Notes: {selectedCustomer.name}
            </h2>
            <p className="text-gray-500 text-sm mb-4">Company: {selectedCustomer.company || 'N/A'}</p>

            <div className="flex-1 overflow-y-auto mb-6 space-y-3 pr-2 border-y py-4">
              {selectedCustomer.notes && selectedCustomer.notes.length > 0 ? (
                selectedCustomer.notes.map((note) => (
                  <div key={note.id} className="bg-gray-50 p-3 rounded border border-gray-200">
                    <p className="text-gray-800 text-sm whitespace-pre-wrap">{note.content}</p>
                    <span className="text-[10px] text-gray-400 mt-1 block">
                      {new Date(note.createdAt).toLocaleString()}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-400 text-sm py-4">No follow-up notes recorded yet.</p>
              )}
            </div>

            <form onSubmit={handleAddNote} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Add New Follow-Up Note</label>
                <textarea
                  required
                  rows={3}
                  value={newNoteText}
                  onChange={e => setNewNoteText(e.target.value)}
                  placeholder="Record call, email details, or next steps..."
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsNotesOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-100"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                >
                  Save Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;

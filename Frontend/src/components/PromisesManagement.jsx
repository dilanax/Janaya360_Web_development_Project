import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// --- ZOD SCHEMAS ---
const createPromiseSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters." }),
  description: z.string().min(10, { message: "Provide a detailed description." }),
  category: z.string().min(1, { message: "Category is required." }),
  politicianId: z.string().min(1, { message: "Link to a politician." })
});

const updateStatusSchema = z.object({
  status: z.string().min(1, { message: "Status is required." }),
  reason: z.string().min(5, { message: "Audit reason required." })
});

const PromisesManagement = () => {
  // --- STATES ---
  const [promises, setPromises] = useState([]);
  const [politicians, setPoliticians] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filters, setFilters] = useState({ status: '', category: '', politicianId: '' });
  
  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPromise, setSelectedPromise] = useState(null);
  const [evidence, setEvidence] = useState(null);
  const [isSearchingNews, setIsSearchingNews] = useState(false);

  // --- FORM HOOKS ---
  const { register: registerCreate, handleSubmit: handleSubmitCreate, reset: resetCreate, formState: { errors: errorsCreate, isSubmitting: isSubmittingCreate } } = useForm({
    resolver: zodResolver(createPromiseSchema), defaultValues: { title: '', description: '', category: 'Economy', politicianId: '' }
  });

  const { register: registerUpdate, handleSubmit: handleSubmitUpdate, reset: resetUpdate, formState: { errors: errorsUpdate, isSubmitting: isSubmittingUpdate } } = useForm({
    resolver: zodResolver(updateStatusSchema), defaultValues: { status: '', reason: '' }
  });

  // --- DATA FETCHING ---
  useEffect(() => {
    const fetchPoliticians = async () => {
      try { const polRes = await api.get('/politicians'); setPoliticians(polRes.data.data || []); } 
      catch (error) { console.error("Failed to load politicians"); }
    };
    fetchPoliticians();
  }, []);

  useEffect(() => {
    const fetchPromises = async () => {
      setIsLoading(true);
      try {
        const params = {};
        if (filters.status) params.status = filters.status;
        if (filters.category) params.category = filters.category;
        if (filters.politicianId) params.politicianId = filters.politicianId;

        const promiseRes = await api.get('/promises', { params });
        setPromises(promiseRes.data.data || []);
      } catch (error) { toast.error("Failed to load promises."); } 
      finally { setIsLoading(false); }
    };
    fetchPromises();
  }, [filters]);

  // --- API HANDLERS ---
  const onSubmitCreate = async (data) => {
    const loadingToast = toast.loading('Saving promise...');
    try {
      await api.post('/promises', data);
      setFilters({ status: '', category: '', politicianId: '' }); 
      resetCreate();
      setShowForm(false);
      toast.success('Promise added successfully!', { id: loadingToast });
      const promiseRes = await api.get('/promises');
      setPromises(promiseRes.data.data || []);
    } catch (error) { toast.error(error.response?.data?.error || 'Failed to add promise', { id: loadingToast }); }
  };

  const openAuditModal = (promise) => {
    setSelectedPromise(promise);
    setEvidence(null); 
    resetUpdate({ status: promise.status, reason: '' }); 
    setIsModalOpen(true);
  };

  const onSubmitUpdate = async (data) => {
    const loadingToast = toast.loading('Updating status...');
    try {
      const response = await api.patch(`/promises/${selectedPromise._id}/status`, data);
      setPromises(promises.map(p => p._id === selectedPromise._id ? response.data.data : p));
      setIsModalOpen(false);
      toast.success('Status updated!', { id: loadingToast });
    } catch (error) { toast.error(error.response?.data?.error || 'Update failed', { id: loadingToast }); }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to permanently delete this promise?")) return;
    const loadingToast = toast.loading('Deleting...');
    try {
      await api.delete(`/promises/${selectedPromise._id}`);
      setPromises(promises.filter(p => p._id !== selectedPromise._id));
      setIsModalOpen(false);
      toast.success('Promise deleted!', { id: loadingToast });
    } catch (error) { toast.error(error.response?.data?.error || 'Delete failed', { id: loadingToast }); }
  };

  const handleSearchNews = async () => {
    setIsSearchingNews(true);
    setEvidence(null);
    try {
      const response = await api.get(`/promises/${selectedPromise._id}/search-evidence`);
      setEvidence(response.data.data);
      if(response.data.data.length === 0) toast.error("No recent news found for this promise.");
    } catch (error) { toast.error("Failed to fetch news."); } 
    finally { setIsSearchingNews(false); }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Kept': return <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">Kept</span>;
      case 'Broken': return <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">Broken</span>;
      case 'In-Progress': return <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200">In Progress</span>;
      default: return <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700 border border-gray-200">Pending</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* CONTROL BAR (Filters & Create Button) */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-4 items-center">
          <span className="text-gray-400 font-medium text-sm">Filter By:</span>
          <select className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-orange-500 outline-none" value={filters.status} onChange={(e) => setFilters({...filters, status: e.target.value})}>
            <option value="">All Statuses</option><option value="Pending">Pending</option><option value="In-Progress">In-Progress</option><option value="Kept">Kept</option><option value="Broken">Broken</option>
          </select>
          <select className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-orange-500 outline-none" value={filters.politicianId} onChange={(e) => setFilters({...filters, politicianId: e.target.value})}>
            <option value="">All Politicians</option>{politicians.map(pol => (<option key={pol._id} value={pol._id}>{pol.name}</option>))}
          </select>
          <button onClick={() => setFilters({ status: '', category: '', politicianId: '' })} className="text-sm text-gray-500 hover:text-orange-600 font-medium transition-colors">Clear</button>
        </div>
        <button onClick={() => setShowForm(!showForm)} className={`px-5 py-2.5 font-bold rounded-lg transition-all shadow-sm ${showForm ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-orange-500 hover:bg-orange-600 text-white shadow-orange-500/30'}`}>
          {showForm ? 'Cancel Form' : '+ New Promise'}
        </button>
      </div>

      {/* CREATE PROMISE FORM */}
      {showForm && (
        <form onSubmit={handleSubmitCreate(onSubmitCreate)} className="p-8 bg-white border border-gray-100 rounded-2xl shadow-lg grid grid-cols-1 md:grid-cols-2 gap-6 transition-all">
          <h3 className="md:col-span-2 text-xl font-bold text-gray-900 border-b border-gray-100 pb-4">Add New Promise</h3>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Promise Title</label>
            <input {...registerCreate('title')} className={`w-full bg-gray-50 border rounded-lg p-3 text-gray-900 focus:ring-2 outline-none transition-all ${errorsCreate.title ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:ring-orange-500'}`} placeholder="e.g., Abolish executive presidency" />
            {errorsCreate.title && <p className="mt-1 text-xs text-red-500">{errorsCreate.title.message}</p>}
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
            <textarea rows="3" {...registerCreate('description')} className={`w-full bg-gray-50 border rounded-lg p-3 text-gray-900 focus:ring-2 outline-none transition-all ${errorsCreate.description ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:ring-orange-500'}`} placeholder="Provide context..."></textarea>
            {errorsCreate.description && <p className="mt-1 text-xs text-red-500">{errorsCreate.description.message}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
            <select {...registerCreate('category')} className={`w-full bg-gray-50 border rounded-lg p-3 text-gray-900 focus:ring-2 outline-none transition-all ${errorsCreate.category ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:ring-orange-500'}`}>
              <option value="Economy">Economy</option><option value="Education">Education</option><option value="Governance">Governance</option><option value="Infrastructure">Infrastructure</option>
            </select>
            {errorsCreate.category && <p className="mt-1 text-xs text-red-500">{errorsCreate.category.message}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Linked Politician</label>
            <select {...registerCreate('politicianId')} className={`w-full bg-gray-50 border rounded-lg p-3 text-gray-900 focus:ring-2 outline-none transition-all ${errorsCreate.politicianId ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:ring-orange-500'}`}>
              <option value="" disabled>Select...</option>
              {politicians.map(pol => (<option key={pol._id} value={pol._id}>{pol.name}</option>))}
            </select>
            {errorsCreate.politicianId && <p className="mt-1 text-xs text-red-500">{errorsCreate.politicianId.message}</p>}
          </div>
          
          <div className="md:col-span-2 flex justify-end mt-2 pt-4 border-t border-gray-100">
            <button disabled={isSubmittingCreate} type="submit" className="px-8 py-3 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-lg shadow-md transition-all disabled:opacity-50">
              {isSubmittingCreate ? 'Saving...' : 'Save to Database'}
            </button>
          </div>
        </form>
      )}

      {/* DATA TABLE */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-10 text-center text-gray-500">Loading data...</div>
        ) : promises.length === 0 ? (
          <div className="p-10 text-center text-gray-500">No promises found.</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="p-5">Promise Details</th>
                <th className="p-5">Politician</th>
                <th className="p-5">Category</th>
                <th className="p-5">Status</th>
                <th className="p-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {promises.map((promise) => (
                <tr key={promise._id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="p-5">
                    <p className="font-bold text-gray-900 mb-1 line-clamp-1">{promise.title}</p>
                    <p className="text-xs text-gray-500 line-clamp-1 max-w-md">{promise.description}</p>
                  </td>
                  <td className="p-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                        {promise.politicianId?.name ? promise.politicianId.name.substring(0,2).toUpperCase() : '?'}
                      </div>
                      <span className="font-medium text-gray-700">{promise.politicianId?.name || 'Unknown'}</span>
                    </div>
                  </td>
                  <td className="p-5 text-sm font-medium text-gray-500">{promise.category}</td>
                  <td className="p-5">{getStatusBadge(promise.status)}</td>
                  <td className="p-5 text-right">
                    <button onClick={() => openAuditModal(promise)} className="px-4 py-2 bg-white border border-gray-200 hover:border-orange-500 hover:text-orange-600 text-gray-600 text-sm font-semibold rounded-lg transition-colors shadow-sm">
                      Audit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* --- AUDIT MODAL --- */}
      {isModalOpen && selectedPromise && (
         <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
         <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
           <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-gray-50">
             <div>
               <h3 className="text-xl font-bold text-gray-900 mb-1">Audit Record</h3>
               <p className="text-gray-500 text-sm">Linked to: <span className="text-orange-600 font-semibold">{selectedPromise.politicianId?.name || 'Unknown'}</span></p>
             </div>
             <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 text-gray-500 transition-colors">&times;</button>
           </div>

           <div className="p-6 overflow-y-auto space-y-6">
             <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
               <h4 className="font-bold text-gray-900 mb-2">{selectedPromise.title}</h4>
               <p className="text-gray-600 text-sm leading-relaxed">{selectedPromise.description}</p>
             </div>

             <form onSubmit={handleSubmitUpdate(onSubmitUpdate)} className="space-y-4">
               <h4 className="font-bold text-gray-800 text-sm border-b border-gray-100 pb-2">Update Status</h4>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                   <label className="block text-sm font-semibold text-gray-700 mb-1">New Status</label>
                   <select {...registerUpdate('status')} className={`w-full bg-white border rounded-lg p-3 text-gray-900 focus:ring-2 outline-none transition-all ${errorsUpdate.status ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:ring-orange-500'}`}>
                     <option value="Pending">Pending</option><option value="In-Progress">In-Progress</option><option value="Kept">Kept</option><option value="Broken">Broken</option>
                   </select>
                   {errorsUpdate.status && <p className="mt-1 text-xs text-red-500">{errorsUpdate.status.message}</p>}
                 </div>
                 <div>
                   <label className="block text-sm font-semibold text-gray-700 mb-1">Audit Reason</label>
                   <input type="text" placeholder="Reason for change..." {...registerUpdate('reason')} className={`w-full bg-white border rounded-lg p-3 text-gray-900 focus:ring-2 outline-none transition-all ${errorsUpdate.reason ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:ring-orange-500'}`} />
                   {errorsUpdate.reason && <p className="mt-1 text-xs text-red-500">{errorsUpdate.reason.message}</p>}
                 </div>
               </div>
               <button disabled={isSubmittingUpdate} type="submit" className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg transition-colors shadow-md disabled:opacity-50 mt-2">
                 {isSubmittingUpdate ? 'Updating...' : 'Save New Status'}
               </button>
             </form>

             <div className="pt-6 border-t border-gray-100">
               <div className="flex justify-between items-center mb-4">
                 <h4 className="font-bold text-gray-800 text-sm">Live News Evidence</h4>
                 <button type="button" onClick={handleSearchNews} disabled={isSearchingNews} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-bold transition-colors disabled:opacity-50">
                   {isSearchingNews ? 'Searching...' : 'Search News API'}
                 </button>
               </div>
               {evidence && evidence.length > 0 && (
                 <div className="space-y-3">
                   {evidence.map((article, idx) => (
                     <a key={idx} href={article.url} target="_blank" rel="noreferrer" className="block p-4 bg-white border border-gray-200 hover:border-orange-500 rounded-xl transition-colors shadow-sm group">
                       <h5 className="text-gray-900 group-hover:text-orange-600 font-bold text-sm mb-1 line-clamp-2">{article.title}</h5>
                       <div className="flex justify-between text-xs text-gray-500 font-medium"><span>{article.source}</span><span>{new Date(article.publishedAt).toLocaleDateString()}</span></div>
                     </a>
                   ))}
                 </div>
               )}
             </div>
           </div>

           <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
             <button onClick={handleDelete} className="px-5 py-2 text-red-600 hover:bg-red-50 font-bold rounded-lg transition-colors text-sm">Delete Record Permanently</button>
           </div>
         </div>
       </div>
      )}
    </div>
  );
};

export default PromisesManagement;
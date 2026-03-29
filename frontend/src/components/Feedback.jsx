import React, { useState, useEffect } from "react";
import axios from "axios";

const Feedback = ({ promiseId }) => {
  const [comment, setComment] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [feedbackList, setFeedbackList] = useState([]);
  const [citizenName, setCitizenName] = useState("");
  const [feedbackType, setFeedbackType] = useState("");
  const [district, setDistrict] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [showToast, setShowToast] = useState(false);


  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
  
// Using default promise ID for demo/testing.
// Supports dynamic promiseId when integrated with multiple promises.

  const activePromiseId = promiseId || "69a6af84dea6363b079b02ac";

  const getFeedback = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/feedback/${activePromiseId}`);
      setFeedbackList(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (activePromiseId) getFeedback();
  }, [activePromiseId]);

  const addFeedback = async () => {
  if (!comment.trim()) return;

  try {
    setLoading(true);

    await axios.post(`${API_URL}/api/feedback/${activePromiseId}`, {
      comment,
      citizenName,
      feedbackType,
      district
    });

    // ✅ Clear form
    setComment("");
    setCitizenName("");
    setFeedbackType("");
    setDistrict("");
    setSearchTerm("");

    // ✅ Show toast
    setShowToast(true);

    // ✅ Hide toast after 3 seconds
    setTimeout(() => setShowToast(false), 3000);

    await getFeedback();
  } catch (err) {
    console.log(err);
  } finally {
    setLoading(false);
  }
};

  const vote = async (id, type) => {
    try {
      await axios.post(`${API_URL}/api/feedback/${id}/vote`, { type });
      getFeedback();
    } catch (err) {
      console.log(err);
    }
  };

  const deleteFeedback = async (id) => {
    if (!window.confirm("Are you sure you want to delete this feedback?")) return;

    try {
      await axios.delete(`${API_URL}/api/feedback/${id}`);
      getFeedback();
    } catch (err) {
      console.log(err);
    }
  };
const updateFeedback = async (id) => {
  try {
    await axios.patch(`${API_URL}/api/feedback/${id}`, {
      comment: editText,
    });

    // ✅ Update UI immediately
    setFeedbackList((prev) =>
      prev.map((item) =>
        item._id === id ? { ...item, comment: editText } : item
      )
    );

    setEditingId(null);
    setEditText("");
  } catch (err) {
    console.log(err);
  }
};

  const districts = [
  // Western Province
  "Colombo", "Gampaha", "Kalutara",

  // Central Province
  "Kandy", "Matale", "Nuwara Eliya",

  // Southern Province
  "Galle", "Matara", "Hambantota",

  // Northern Province
  "Jaffna", "Kilinochchi", "Mannar", "Vavuniya", "Mullaitivu",

  // Eastern Province
  "Batticaloa", "Ampara", "Trincomalee",

  // North Western Province
  "Kurunegala", "Puttalam",

  // North Central Province
  "Anuradhapura", "Polonnaruwa",

  // Uva Province
  "Badulla", "Monaragala",

  // Sabaragamuwa Province
  "Ratnapura", "Kegalle",
];


  return (
    
    <>
    {/* ✅ SUCCESS TOAST */}
   {showToast && (
  <div className="fixed top-20 right-5 z-50">
    <div className="bg-green-600 text-white px-6 py-4 rounded-xl shadow-2xl text-sm flex items-center gap-3">
      ✅ <span className="font-semibold">Feedback submitted successfully</span>
    </div>
  </div>
)}

      <div className="bg-gray-50 py-10">
      <div className="max-w-7xl mx-auto px-7">

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-4xl font-semibold text-gray-900">
            Citizen Feedback
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Share your opinion and help ensure accountability
          </p>
        </div>

        {/* Info banner */}
        <div className="bg-parliament-50 border border-parliament-200 rounded-lg p-3 mb-5 text-sm text-parliament-800">
          Citizen feedback helps ensure transparency, accountability, and trust
          in public governance.
        </div>

        {/* Form + Image */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
            {/* Form */}
            <div>
              <textarea
                className="w-full bg-gray-50 border border-gray-300 rounded-lg p-3 text-sm"
                rows={4}
                maxLength={300}
                placeholder="Write your feedback as a citizen..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              <input
               type="text"
               placeholder="citizenName (optional)"
               className="w-full bg-gray-50 border border-gray-300 rounded-lg p-3 text-sm mb-3"
               value={citizenName}
               onChange={(e) => setCitizenName(e.target.value)}
              />

              <select
              className="w-full bg-gray-50 border border-gray-300 rounded-lg p-3 text-sm mb-3"
              value={feedbackType}
              onChange={(e) => setFeedbackType(e.target.value)}
              >
              <option value="">Select Feedback Type</option>
              <option value="Opinion">Opinion</option>
              <option value="Evidence">Evidence</option>
              <option value="Suggestion">Suggestion</option>
              <option value="Complaint">Complaint</option>
             </select>

            <select
            className="w-full bg-gray-50 border border-gray-300 rounded-lg p-3 text-sm mb-3"
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            >
            <option value="">Select District</option>

           {districts.map((d) => (
           <option key={d} value={d}>
           {d}
            </option>
           ))}
           </select>

              <div className="text-xs text-gray-400 text-right mt-1">
                {comment.length} / 300 characters
              </div>

              <div className="flex justify-end mt-4">
                <button
                  onClick={addFeedback}
                  disabled={!comment.trim() || loading}
                  className={`px-5 py-2 rounded-lg text-sm font-medium text-white ${
                    !comment.trim() || loading
                      ? "bg-parliament-600 opacity-50 cursor-not-allowed"
                      : "bg-parliament-600 hover:bg-parliament-700"
                  }`}
                >
                  {loading ? "Submitting..." : "Submit Feedback"}
                </button>
              </div>
            </div>

            {/* Image */}
            <div className="flex items-center justify-center">
              
             <img
             src="/feedback-citizen.jpg"
             alt="Citizen engagement"
             className="max-h-96 w-full object-cover rounded-lg"
             />
            </div>
          </div>
        </div>

       {/* 🔍 FULL‑WIDTH FEEDBACK SEARCH BAR */}
<div className="mb-6">
  <input
    type="text"
    placeholder="Search feedback by message, name, type, or district..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    className="
      w-full
      bg-white
      border
      border-gray-300
      rounded-lg
      px-5
      py-3
      text-sm
      shadow-sm
      focus:outline-none
      focus:ring-2
      focus:ring-orange-400
      "
  />
</div>


        {/* Feedback list */}
        <div className="space-y-4">
          {feedbackList.length === 0 && (
            <div className="text-sm text-gray-500 text-center mt-6">
              No feedback yet. Be the first citizen to comment.
            </div>
          )}

         {feedbackList
        .filter((item) => {
         const term = searchTerm.toLowerCase();

       return (
       item.comment?.toLowerCase().includes(term) ||
       item.citizenName?.toLowerCase().includes(term) ||
       item.feedbackType?.toLowerCase().includes(term) ||
       item.district?.toLowerCase().includes(term)
       );
     })
     .map((item) => (
  <div
    key={item._id}
    className="bg-orange-50 px-5 py-4 rounded-xl border border-orange-200 shadow-sm flex justify-between items-start"
  >
    {/* LEFT — FEEDBACK CONTENT */}
    <div className="flex-1 pr-4">
      {editingId === item._id ? (
        <textarea
          className="w-full border p-2 rounded text-sm"
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
        />
      ) : (
        <p className="text-gray-800 text-sm font-medium">
          {item.comment}
        </p>
      )}

      <p className="text-xs text-gray-500 mt-1">
        Name: {item.citizenName || "Anonymous"}
      </p>

      <p className="text-xs text-gray-500">
        Type: {item.feedbackType || "Not specified"} 
       
      </p>
      <p className="text-xs text-gray-500">
        District: {item.district || "Not specified"}
       
      </p>
      <p className="text-xs text-gray-500 mt-1">
       Sentiment: {item.sentiment}
      </p>

      <p className="text-xs text-gray-400 mt-1">
        {new Date(item.createdAt).toLocaleDateString()}
      </p>
    </div>

    {/* ✅ RIGHT — ACTION BUTTONS (LIKE YOUR IMAGE) */}
    <div className="flex items-center gap-2">
      <button
        onClick={() => vote(item._id, "up")}
        className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs"
      >
        👍 {item.upvotes}
      </button>

      <button
        onClick={() => vote(item._id, "down")}
        className="flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 text-red-700 text-xs"
      >
        👎 {item.downvotes}
      </button>

      {editingId !== item._id ? (
        <button
          onClick={() => {
            setEditingId(item._id);
            setEditText(item.comment);
          }}
          className="p-1 rounded-full bg-orange-100 text-orange-700 text-xs"
          title="Edit"
        >
          ✏️
        </button>
      ) : (
        <button
          onClick={() => updateFeedback(item._id)}
          className="p-1 rounded-full bg-green-100 text-green-700 text-xs"
          title="Save"
        >
          💾
        </button>
      )}

      <button
        onClick={() => deleteFeedback(item._id)}
        className="p-1 rounded-full bg-gray-200 text-gray-700 text-xs"
        title="Delete"
      >
        🗑
      </button>
    </div>
  </div>
))}

        </div>

      </div>
    </div>
    </>
  );
};

export default Feedback;


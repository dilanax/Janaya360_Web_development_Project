import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

const Feedback = () => {
  // ✅ Promise ID from URL (when coming from /promise/:id/feedback)
  const { id: urlPromiseId } = useParams();

  // ✅ State for navbar-based access
  const [promises, setPromises] = useState([]);
  const [selectedPromiseId, setSelectedPromiseId] = useState("");

  // ✅ Feedback form states
  const [comment, setComment] = useState("");
  const [citizenName, setCitizenName] = useState("");
  const [feedbackType, setFeedbackType] = useState("");
  const [district, setDistrict] = useState("");

  // ✅ Feedback list states
  const [feedbackList, setFeedbackList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  // ✅ Decide the active promise in ONE place
  const activePromiseId = urlPromiseId || selectedPromiseId;

  /* =========================================================
     STEP 1: Load all promises (for navbar → /feedback)
     ========================================================= */
  useEffect(() => {
    const loadPromises = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/promises`);
        setPromises(res.data.data || res.data);
      } catch (err) {
        console.log("Failed to load promises", err);
      }
    };
    loadPromises();
  }, []);

  /* =========================================================
     STEP 2: Load feedback when a promise is selected
     ========================================================= */
  const getFeedback = async () => {
    if (!activePromiseId) return;

    try {
      const res = await axios.get(
        `${API_URL}/api/feedback/${activePromiseId}`
      );
      setFeedbackList(res.data);
    } catch (err) {
      console.log("Failed to load feedback", err);
    }
  };

  useEffect(() => {
    if (activePromiseId) {
      getFeedback();
    }
  }, [activePromiseId]);

  /* =========================================================
     STEP 3: Add feedback
     ========================================================= */
  const addFeedback = async () => {
    if (!comment.trim() || !activePromiseId) return;

    try {
      setLoading(true);

      await axios.post(
        `${API_URL}/api/feedback/${activePromiseId}`,
        {
          comment,
          citizenName,
          feedbackType,
          district,
        }
      );

      setComment("");
      setCitizenName("");
      setFeedbackType("");
      setDistrict("");
      setSearchTerm("");

      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);

      getFeedback();
    } catch (err) {
      console.log("Failed to submit feedback", err);
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     STEP 4: Vote feedback
     ========================================================= */
  const vote = async (feedbackId, type) => {
    try {
      await axios.post(
        `${API_URL}/api/feedback/${feedbackId}/vote`,
        { type }
      );
      getFeedback();
    } catch (err) {
      console.log("Voting failed", err);
    }
  };

  const districts = [
    "Colombo","Gampaha","Kalutara","Kandy","Matale","Nuwara Eliya",
    "Galle","Matara","Hambantota","Jaffna","Kilinochchi","Mannar",
    "Vavuniya","Mullaitivu","Batticaloa","Ampara","Trincomalee",
    "Kurunegala","Puttalam","Anuradhapura","Polonnaruwa",
    "Badulla","Monaragala","Ratnapura","Kegalle",
  ];

  return (
    <>
      {/* ✅ SUCCESS TOAST */}
      {showToast && (
        <div className="fixed top-20 right-5 z-50">
          <div className="bg-green-600 text-white px-6 py-4 rounded-xl shadow-xl text-sm">
            ✅ Feedback submitted successfully
          </div>
        </div>
      )}

      <div className="bg-gray-50 py-10">
        <div className="max-w-7xl mx-auto px-7">

        {/* ✅ PAGE HEADER  */}
           <div className="mb-6">
           <span className="inline-block bg-orange-100 text-orange-600 text-xs font-semibold px-3 py-1 rounded-full mb-2">
           Public Feedback
           </span>

          <h1 className="text-3xl font-bold text-gray-900 mt-2">
           Citizen Feedback
          </h1>

         <p className="text-gray-500 text-sm mt-2 max-w-2xl">
         Share your opinions, suggestions, and concerns to improve transparency
         and accountability in public governance.
        </p>
          </div>
 

        <div className="bg-white border rounded-xl mb-8 p-3">
           <img
            src="/feedback-citizen.jpg"
            alt="Citizen engagement"
            className="w-full h-80 object-contain bg-gray-100"
          />

          </div>
      
          {/* =========================================================
              PROMISE SELECTOR (ONLY WHEN COMING FROM NAVBAR)
             ========================================================= */}
          {!urlPromiseId && (
            <select
              className="w-full bg-white border border-gray-300 rounded-lg p-3 mb-6"
              value={selectedPromiseId}
              onChange={(e) => setSelectedPromiseId(e.target.value)}
            >
              <option value="">Select a Promise to View Feedback</option>
              {promises.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.title}
                </option>
              ))}
            </select>
          )}

          {/* ✅ Guard message (only after UI loads) */}
          {!activePromiseId && (
            <div className="text-center text-gray-600 mt-10">
              Please select a promise to continue.
            </div>
          )}

          {/* =========================================================
              FEEDBACK FORM
             ========================================================= */}
          {activePromiseId && (
            <>
              <div className="bg-white border rounded-xl p-6 mb-6">
                <textarea
                  className="w-full border p-3 rounded mb-3"
                  placeholder="Write your feedback..."
                  maxLength={300}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />

                <input
                  className="w-full border p-3 rounded mb-3"
                  placeholder="Citizen name (optional)"
                  value={citizenName}
                  onChange={(e) => setCitizenName(e.target.value)}
                />

                <select
                  className="w-full border p-3 rounded mb-3"
                  value={feedbackType}
                  onChange={(e) => setFeedbackType(e.target.value)}
                >
                  <option value="">Feedback Type</option>
                  <option value="Opinion">Opinion</option>
                  <option value="Complaint">Complaint</option>
                  <option value="Suggestion">Suggestion</option>
                  <option value="Evidence">Evidence</option>
                </select>

                <select
                  className="w-full border p-3 rounded mb-3"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                >
                  <option value="">Select District</option>
                  {districts.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>

                <div className="text-xs text-gray-500 text-right mb-3">
                  {comment.length} / 300 characters
                </div>

                <button
                  onClick={addFeedback}
                  disabled={!comment.trim() || loading}
                  className="bg-orange-600 text-white px-5 py-2 rounded disabled:opacity-50"
                >
                  {loading ? "Submitting..." : "Submit Feedback"}
                </button>
              </div>

              {/* =========================================================
                  SEARCH
                 ========================================================= */}
              <input
                className="w-full border p-3 rounded mb-6"
                placeholder="Search feedback..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              {/* =========================================================
                  FEEDBACK LIST
                 ========================================================= */}
              <div className="space-y-4">
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
                      className="bg-orange-50 border rounded-xl p-4 flex justify-between"
                    >
                      <div>
                        <p className="font-medium">{item.comment}</p>
                        <p className="text-xs text-gray-500">
                          {item.citizenName || "Anonymous"} | {item.feedbackType} | {item.district}
                        </p>
                        <p className="text-xs text-gray-500">
                          Sentiment: {item.sentiment}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => vote(item._id, "up")}
                          className="bg-green-100 px-2 py-1 rounded text-xs"
                        >
                          👍 {item.upvotes}
                        </button>
                        <button
                          onClick={() => vote(item._id, "down")}
                          className="bg-red-100 px-2 py-1 rounded text-xs"
                        >
                          👎 {item.downvotes}
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Feedback;
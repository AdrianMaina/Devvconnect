import React, { useEffect, useState, useCallback } from "react";
import { getJobs, getApprovedJobs, submitProposal } from "../api/api"; // Ensure path to api.js is correct
import LogoutButton from "../components/LogoutButton"; // Ensure path is correct

const FreelancerDashboard = () => {
  const [activeTab, setActiveTab] = useState("browse"); // "browse" or "approved"
  const [jobs, setJobs] = useState([]);
  const [approvedJobs, setApprovedJobs] = useState([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(new Set());

  // Function to fetch all necessary data for the dashboard
  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const [allJobsData, approvedJobsData] = await Promise.all([
        getJobs(),
        getApprovedJobs(),
      ]);
      setJobs(allJobsData || []); // Ensure it's an array even if API returns null/undefined
      setApprovedJobs(approvedJobsData || []); // Ensure it's an array
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      // Optionally, set an error state here to show to the user
      setJobs([]); // Reset to empty array on error
      setApprovedJobs([]); // Reset to empty array on error
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array for useCallback as getJobs/getApprovedJobs are stable

  // Fetch data on component mount
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]); // fetchDashboardData is now stable due to useCallback

  // Filter jobs based on title
  const filteredJobs = jobs.filter((job) =>
    job.title && job.title.toLowerCase().includes(filter.toLowerCase())
  );

  const handleApply = async (jobId) => {
    if (applying.has(jobId)) return;

    setApplying((prev) => new Set(prev).add(jobId));

    try {
      await submitProposal(jobId); // Pass any necessary proposal data if your API requires it
      alert("Application submitted successfully!");
      // Optionally, you might want to re-fetch jobs or update UI state here
      // For example, disable the apply button for this job or move it.
    } catch (err) {
      console.error("Failed to apply:", err);
      alert(`Failed to apply: ${err.message}`);
    } finally {
      setApplying((prev) => {
        const next = new Set(prev);
        next.delete(jobId);
        return next;
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-gray-900 text-gray-100 p-4 sm:p-8">
      <div className="container mx-auto max-w-6xl">
        <header className="flex justify-between items-center mb-10">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-500">
            Freelancer Dashboard
          </h1>
          <LogoutButton />
        </header>

        <div className="mb-8">
          <div className="flex space-x-1 bg-slate-800 p-1 rounded-xl max-w-md mx-auto">
            <button
              onClick={() => setActiveTab("browse")}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${
                activeTab === "browse"
                  ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg"
                  : "text-gray-400 hover:bg-slate-700/50"
              }`}
            >
              Browse Jobs
            </button>
            <button
              onClick={() => setActiveTab("approved")}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${
                activeTab === "approved"
                  ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg"
                  : "text-gray-400 hover:bg-slate-700/50"
              }`}
            >
              My Approved Jobs
            </button>
          </div>
        </div>

        {activeTab === "browse" ? (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
              <input
                type="text"
                placeholder="Filter jobs by title..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full sm:w-2/3 bg-slate-800 border border-slate-700 text-white placeholder-gray-500 rounded-xl py-3 px-5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              />
              {/* *** ADDED REFRESH BUTTON *** */}
              <button
                onClick={fetchDashboardData}
                disabled={loading}
                className="w-full sm:w-auto py-3 px-6 bg-gradient-to-r from-blue-500 to-teal-500 text-white font-semibold rounded-xl hover:shadow-blue-500/30 hover:shadow-md transition-all disabled:opacity-50"
              >
                {loading ? "Refreshing..." : "Refresh Jobs"}
              </button>
            </div>

            {loading && jobs.length === 0 ? (
              <div className="text-center py-12 text-gray-400">Loading jobs...</div>
            ) : !loading && filteredJobs.length === 0 ? (
              <div className="text-center py-12 bg-slate-800/50 rounded-3xl border border-slate-700">
                <p className="text-gray-400 text-xl">
                  {jobs.length > 0 ? "No jobs match your filter." : "No jobs available at the moment. Check back soon!"}
                </p>
                {jobs.length > 0 && (
                   <button onClick={() => setFilter('')} className="mt-4 text-indigo-400 hover:text-indigo-300">Clear filter</button>
                )}
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredJobs.map((job) => (
                  <div
                    key={job.id}
                    className="bg-slate-800/70 backdrop-blur-sm border border-slate-700 rounded-3xl p-6 shadow-xl hover:shadow-indigo-500/20 hover:border-indigo-600/50 transition-all transform hover:-translate-y-1"
                  >
                    <h3 className="text-xl font-bold text-white mb-3">{job.title}</h3>
                    <p className="text-gray-300 mb-2 text-sm line-clamp-3">
                      {job.description}
                    </p>
                    <div className="text-xs text-gray-400 mb-4">
                      {job.tech_stack && <p>Skills: {job.tech_stack}</p>}
                      {job.timeline && <p>Timeline: {job.timeline}</p>}
                    </div>
                    <div className="flex justify-between items-center mb-4">
                      <p className="text-lg font-semibold text-indigo-300">
                        ${job.budget}
                      </p>
                      {/* Add more job details if available, like client name, post date etc. */}
                    </div>
                    <button
                      onClick={() => handleApply(job.id)}
                      disabled={applying.has(job.id)}
                      className={`w-full py-2.5 px-4 rounded-xl text-sm font-medium transition-all ${
                        applying.has(job.id)
                          ? "bg-slate-600 text-gray-400 cursor-not-allowed"
                          : "bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:shadow-indigo-500/30 hover:shadow-md"
                      }`}
                    >
                      {applying.has(job.id) ? "Applying..." : "Apply Now"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : ( // Approved Jobs Tab
          <div className="space-y-8">
            <h2 className="text-3xl font-bold text-white mb-6">Your Approved Jobs</h2>
            {loading && approvedJobs.length === 0 ? (
                 <div className="text-center py-12 text-gray-400">Loading approved jobs...</div>
            ): !loading && approvedJobs.length === 0 ? (
              <div className="text-center py-12 bg-slate-800/50 rounded-3xl border border-slate-700">
                <p className="text-gray-400 text-xl">No approved jobs yet.</p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {approvedJobs.map((job) => (
                  <div
                    key={job.id}
                    className="bg-slate-800/70 backdrop-blur-sm border border-slate-700 rounded-3xl p-6 shadow-xl hover:shadow-green-500/20 hover:border-green-600/50 transition-all"
                  >
                    <h3 className="text-xl font-bold text-white mb-3">{job.title}</h3>
                    <p className="text-gray-300 mb-4 text-sm line-clamp-3">{job.description}</p>
                    <p className="text-sm text-green-400">Budget: ${job.budget}</p>
                    {/* You can add more details about the approved job here */}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FreelancerDashboard;
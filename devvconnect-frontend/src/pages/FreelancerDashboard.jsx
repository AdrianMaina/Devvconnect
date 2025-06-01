import React, { useEffect, useState, useCallback } from "react";
import { getJobs, getApprovedJobs, submitProposal } from "../api/api";
import LogoutButton from "../components/LogoutButton";
import { useAuth } from "../context/AuthContext";

const FreelancerDashboard = () => {
  const [activeTab, setActiveTab] = useState("browse");
  const [jobs, setJobs] = useState([]);
  const [approvedJobs, setApprovedJobs] = useState([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(new Set());
  const { user } = useAuth();

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const [allJobsData, approvedJobsData] = await Promise.all([
        getJobs(),
        getApprovedJobs(),
      ]);
      setJobs(allJobsData || []);
      setApprovedJobs(approvedJobsData || []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setJobs([]);
      setApprovedJobs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const filteredJobs = jobs.filter((job) =>
    job.title && job.title.toLowerCase().includes(filter.toLowerCase())
  );

  const handleApply = async (jobId) => {
    if (applying.has(jobId)) return;
    setApplying((prev) => new Set(prev).add(jobId));
    try {
      await submitProposal(jobId);
      alert("Application submitted successfully!");
    } catch (err) {
      console.error("Failed to apply:", err);
      alert(`Failed to apply: ${err.message || "Unknown error"}`);
    } finally {
      setApplying((prev) => {
        const next = new Set(prev);
        next.delete(jobId);
        return next;
      });
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full opacity-15 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-gradient-to-r from-pink-400 to-rose-400 rounded-full opacity-15 blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-violet-400 to-fuchsia-400 rounded-full opacity-10 blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 min-h-screen">
        {/* Navigation */}
        <nav className="flex justify-between items-center p-6 backdrop-blur-sm bg-white/5 border-b border-white/10">
          <div className="flex items-center gap-8">
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
              DevConnect
            </h1>
            <div className="flex gap-4">
              <button
                className={`text-lg font-semibold px-4 py-2 rounded-xl transition-all ${
                  activeTab === "browse"
                    ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg"
                    : "text-gray-300 hover:text-white hover:bg-white/10"
                }`}
                onClick={() => setActiveTab("browse")}
              >
                Browse Jobs
              </button>
              <button
                className={`text-lg font-semibold px-4 py-2 rounded-xl transition-all ${
                  activeTab === "approved"
                    ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg"
                    : "text-gray-300 hover:text-white hover:bg-white/10"
                }`}
                onClick={() => setActiveTab("approved")}
              >
                My Approved Jobs
              </button>
            </div>
          </div>
          {/* User Info and Logout Button */}
          <div className="flex items-center gap-4">
            {user && (
              <span className="text-gray-300 text-sm">
                {user.email}
              </span>
            )}
            <LogoutButton />
          </div>
        </nav>

        {/* Main Content */}
        <div className="p-6 max-w-7xl mx-auto">
          {activeTab === "browse" ? (
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
                <input
                  type="text"
                  placeholder="Filter jobs by title..."
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="w-full sm:w-2/3 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 backdrop-blur-sm"
                />
                <button
                  onClick={fetchDashboardData}
                  disabled={loading}
                  className="w-full sm:w-auto py-3 px-6 bg-gradient-to-r from-blue-500 to-teal-500 text-white font-semibold rounded-xl hover:shadow-blue-500/30 hover:shadow-md transition-all disabled:opacity-50 hover:scale-[1.02]"
                >
                  {loading ? "Refreshing..." : "Refresh Jobs"}
                </button>
              </div>

              {loading && jobs.length === 0 ? (
                <div className="text-center py-12 text-gray-300">Loading jobs...</div>
              ) : !loading && filteredJobs.length === 0 ? (
                <div className="text-center py-12 bg-white/10 rounded-3xl border border-white/20 backdrop-blur-sm">
                  <p className="text-gray-300 text-xl">
                    {jobs.length > 0 ? "No jobs match your filter." : "No jobs available at the moment. Check back soon!"}
                  </p>
                  {jobs.length > 0 && (
                     <button onClick={() => setFilter('')} className="mt-4 text-indigo-400 hover:text-indigo-300 transition-colors">Clear filter</button>
                  )}
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredJobs.map((job) => (
                    <div
                      key={job.id}
                      className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-6 shadow-lg hover:shadow-indigo-500/20 hover:border-indigo-600/50 transition-all transform hover:-translate-y-1"
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
                      </div>
                      <button
                        onClick={() => handleApply(job.id)}
                        disabled={applying.has(job.id)}
                        className={`w-full py-2.5 px-4 rounded-xl text-sm font-medium transition-all ${
                          applying.has(job.id)
                            ? "bg-white/5 text-gray-400 cursor-not-allowed border border-white/10"
                            : "bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:shadow-indigo-500/30 hover:shadow-md hover:scale-[1.02]"
                        }`}
                      >
                        {applying.has(job.id) ? "Applying..." : "Apply Now"}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : ( 
            <div className="space-y-8">
              <h2 className="text-3xl font-bold text-white mb-6">Your Approved Jobs</h2>
              {loading && approvedJobs.length === 0 ? (
                   <div className="text-center py-12 text-gray-300">Loading approved jobs...</div>
              ): !loading && approvedJobs.length === 0 ? (
                <div className="text-center py-12 bg-white/10 rounded-3xl border border-white/20 backdrop-blur-sm">
                  <p className="text-gray-300 text-xl">No approved jobs yet.</p>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {approvedJobs.map((job) => (
                    <div
                      key={job.id}
                      className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-6 shadow-lg hover:shadow-green-500/20 hover:border-green-600/50 transition-all"
                    >
                      <h3 className="text-xl font-bold text-white mb-3">{job.title}</h3>
                      <p className="text-gray-300 mb-4 text-sm line-clamp-3">{job.description}</p>
                      <p className="text-sm text-green-400">Budget: ${job.budget}</p>
                      {job.tech_stack && <p className="text-xs text-gray-400 mt-2">Skills: {job.tech_stack}</p>}
                      {job.timeline && <p className="text-xs text-gray-400">Timeline: {job.timeline}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FreelancerDashboard;
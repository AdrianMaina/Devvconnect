import React, { useEffect, useState } from "react";
import { getJobs, getApprovedJobs, submitProposal } from "../api/api";  // Added submitProposal import
import LogoutButton from "../components/LogoutButton";

const FreelancerDashboard = () => {
  const [activeTab, setActiveTab] = useState("browse");
  const [jobs, setJobs] = useState([]);
  const [approvedJobs, setApprovedJobs] = useState([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(new Set());  // Track which jobs are being applied to

  // Fetch jobs and approved jobs on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [allJobs, approved] = await Promise.all([
          getJobs(),
          getApprovedJobs(),
        ]);
        setJobs(allJobs);
        setApprovedJobs(approved);
      } catch (error) {
        console.error("Error fetching jobs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter jobs based on title
  const filteredJobs = jobs.filter((job) =>
    job.title.toLowerCase().includes(filter.toLowerCase())
  );

  // Apply to job (submit proposal) - FIXED
  const handleApply = async (jobId) => {
    if (applying.has(jobId)) return; // Prevent double-clicking
    
    setApplying(prev => new Set(prev).add(jobId));
    
    try {
      await submitProposal(jobId);  // Pass jobId directly
      alert("Proposal submitted successfully!");
      
      // Optionally refresh the jobs to update the UI
      const updatedJobs = await getJobs();
      setJobs(updatedJobs);
    } catch (error) {
      console.error("Failed to submit proposal:", error);
      if (error.message.includes("Already applied")) {
        alert("You have already applied to this job.");
      } else if (error.message.includes("Not authorized")) {
        alert("You must be logged in as a freelancer to apply.");
      } else {
        alert("Failed to apply for the job. Please try again.");
      }
    } finally {
      setApplying(prev => {
        const newSet = new Set(prev);
        newSet.delete(jobId);
        return newSet;
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
          <div className="flex gap-8">
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
                activeTab === "history"
                  ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg"
                  : "text-gray-300 hover:text-white hover:bg-white/10"
              }`}
              onClick={() => setActiveTab("history")}
            >
              Job History
            </button>
          </div>
          <LogoutButton />
        </nav>

        {/* Main Content */}
        <div className="p-6 max-w-7xl mx-auto">
          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
              <p className="text-gray-300">Loading jobs...</p>
            </div>
          ) : activeTab === "browse" ? (
            <div className="space-y-8">
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-4 max-w-2xl mx-auto">
                <input
                  type="text"
                  placeholder="🔍 Filter by title..."
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 backdrop-blur-sm"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                />
              </div>
              
              {filteredJobs.length === 0 ? (
                <div className="text-center py-12 bg-white/10 rounded-3xl border border-white/20">
                  <p className="text-gray-300">No jobs available at the moment.</p>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredJobs.map((job) => (
                    <div key={job.id} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-6 shadow-lg hover:shadow-indigo-500/20 transition-all">
                      <h3 className="text-xl font-bold text-white mb-3">{job.title}</h3>
                      <p className="text-gray-300 mb-4">{job.description}</p>
                      <p className="text-sm text-indigo-300 mb-4">Budget: ${job.budget}</p>
                      <button
                        onClick={() => handleApply(job.id)}
                        disabled={applying.has(job.id)}
                        className={`w-full py-2 rounded-lg font-medium transition-all ${
                          applying.has(job.id)
                            ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                            : "bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:shadow-indigo-500/30 hover:shadow-md"
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
              {approvedJobs.length === 0 ? (
                <div className="text-center py-12 bg-white/10 rounded-3xl border border-white/20">
                  <p className="text-gray-300">No approved jobs yet.</p>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {approvedJobs.map((job) => (
                    <div key={job.id} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-6 shadow-lg hover:shadow-indigo-500/20 transition-all">
                      <h3 className="text-xl font-bold text-white mb-3">{job.title}</h3>
                      <p className="text-gray-300 mb-4">{job.description}</p>
                      <p className="text-sm text-indigo-300">Budget: ${job.budget}</p>
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
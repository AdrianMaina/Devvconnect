import React, { useEffect, useState } from "react";
import {
  postJob,
  fetchMyJobsWithProposals,
  approveProposal,
} from "../api/api";
import LogoutButton from "../components/LogoutButton";
import { useAuth } from "../context/AuthContext";

const ClientDashboard = () => {
  const [activeTab, setActiveTab] = useState("post");
  const [myJobs, setMyJobs] = useState([]);
  const [jobForm, setJobForm] = useState({ title: "", description: "", budget: "" });
  const { user } = useAuth();

  const handleChange = (e) => {
    setJobForm({ ...jobForm, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await postJob(jobForm);
      alert("Job posted!");
      setJobForm({ title: "", description: "", budget: "" });
      setActiveTab("myJobs");
      fetchJobsData(); // Call to fetch data after posting
    } catch (err) {
      console.error("Failed to post job:", err);
      // Optionally, set an error state here to show to the user
    }
  };

  const fetchJobsData = async () => {
    try {
      const jobs = await fetchMyJobsWithProposals();
      setMyJobs(jobs);
    } catch (err) {
      console.error("Failed to fetch my jobs:", err);
    }
  };

  const handleApprove = async (proposalId) => {
    try {
      await approveProposal(proposalId);
      alert("Proposal approved!");
      fetchJobsData(); // Re-fetch to update the UI
    } catch (err) {
      console.error("Failed to approve proposal:", err);
    }
  };

  useEffect(() => {
    if (activeTab === "myJobs") {
      fetchJobsData();
    }
  }, [activeTab]);

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
                  activeTab === "post"
                    ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg"
                    : "text-gray-300 hover:text-white hover:bg-white/10"
                }`}
                onClick={() => setActiveTab("post")}
              >
                Post Job
              </button>
              <button
                className={`text-lg font-semibold px-4 py-2 rounded-xl transition-all ${
                  activeTab === "myJobs"
                    ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg"
                    : "text-gray-300 hover:text-white hover:bg-white/10"
                }`}
                onClick={() => setActiveTab("myJobs")}
              >
                My Jobs
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
          {activeTab === "post" && (
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl shadow-2xl p-8 max-w-2xl mx-auto">
              <h2 className="text-3xl font-bold text-white mb-6 text-center">Post a New Job</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-200">Job Title</label>
                  <input
                    type="text"
                    name="title"
                    placeholder="Enter job title"
                    value={jobForm.title}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 backdrop-blur-sm"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-200">Description</label>
                  <textarea
                    name="description"
                    placeholder="Describe the job details"
                    value={jobForm.description}
                    onChange={handleChange}
                    required
                    rows="4"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 backdrop-blur-sm"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-200">Budget ($)</label>
                  <input
                    type="number"
                    name="budget"
                    placeholder="Enter budget amount"
                    value={jobForm.budget}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 backdrop-blur-sm"
                  />
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl text-lg font-semibold shadow-xl hover:shadow-indigo-600/25 transition-all hover:scale-[1.02]"
                >
                  Post Job
                </button>
              </form>
            </div>
          )}

          {activeTab === "myJobs" && (
            <div className="space-y-8">
              <h2 className="text-3xl font-bold text-white mb-6">Your Posted Jobs</h2>
              {myJobs.length === 0 ? (
                <div className="text-center py-12 bg-white/10 rounded-3xl border border-white/20 backdrop-blur-sm">
                  <p className="text-gray-300">No jobs posted yet.</p>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {myJobs.map((job) => (
                    <div key={job.id} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-6 shadow-lg hover:shadow-indigo-500/20 transition-all">
                      <h3 className="text-xl font-bold text-white mb-3">{job.title}</h3>
                      <p className="text-gray-300 mb-4 line-clamp-3">{job.description}</p>
                      <p className="text-sm text-indigo-300 mb-4">Budget: ${job.budget}</p>
                      
                      <div className="border-t border-white/10 pt-4">
                        <h4 className="font-semibold text-white mb-3">Proposals:</h4>
                        {job.proposals.length === 0 ? (
                          <p className="text-sm text-gray-400">No applications yet</p>
                        ) : (
                          <div className="space-y-3">
                            {job.proposals.map((proposal) => (
                              <div key={proposal.id} className="bg-white/5 p-3 rounded-xl border border-white/10">
                                <p className="text-white"><span className="text-indigo-300">Freelancer:</span> {proposal.freelancer_name}</p>
                                <button
                                  className={`mt-2 w-full py-1 px-3 rounded-lg text-sm font-medium transition-all ${
                                    proposal.approved
                                      ? "bg-green-600/30 text-green-300 border border-green-500/50 cursor-not-allowed"
                                      : "bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:shadow-green-500/30 hover:shadow-md hover:scale-[1.02]"
                                  }`}
                                  onClick={() => handleApprove(proposal.id)}
                                  disabled={proposal.approved}
                                >
                                  {proposal.approved ? "✓ Approved" : "Approve Proposal"}
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
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

export default ClientDashboard;
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { LogOut, Play, Activity, BookOpen, Target, Folder } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [localPath, setLocalPath] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:8080/api/stats', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(res.data);
      } catch (err) {
        console.error('Failed to fetch stats', err);
        if (err.response?.status === 401) {
          handleLogout();
        }
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.reload();
  };

  const handleStartViva = (e) => {
    e.preventDefault();
    if (!localPath.trim()) return alert('Please enter a local repository path');
    
    const newProjectId = Math.random().toString(36).substring(7);
    navigate(`/viva/${newProjectId}`, { state: { localPath: localPath.trim() } });
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-white/10 bg-surface/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Activity className="text-primary w-6 h-6" />
              <span className="font-bold text-xl tracking-tight">Viva Dashboard</span>
            </div>
            <button 
              onClick={handleLogout}
              className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-sm font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Your Overview</h1>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="glass p-6 rounded-2xl flex flex-col justify-between group hover:border-primary/50 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-primary/10 rounded-xl">
                <BookOpen className="text-primary w-6 h-6" />
              </div>
            </div>
            <div>
              <p className="text-4xl font-bold mb-1">{stats?.totalProjects || 0}</p>
              <p className="text-gray-400 text-sm font-medium">Projects Reviewed</p>
            </div>
          </div>

          <div className="glass p-6 rounded-2xl flex flex-col justify-between group hover:border-secondary/50 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-secondary/10 rounded-xl">
                <Target className="text-secondary w-6 h-6" />
              </div>
            </div>
            <div>
              <p className="text-4xl font-bold mb-1">{stats?.totalSessions || 0}</p>
              <p className="text-gray-400 text-sm font-medium">Total Viva Sessions</p>
            </div>
          </div>

          <div className="glass p-6 rounded-2xl flex flex-col justify-between group hover:border-accent/50 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-accent/10 rounded-xl">
                <Activity className="text-accent w-6 h-6" />
              </div>
            </div>
            <div>
              <p className="text-4xl font-bold mb-1">
                {stats?.averageScore ? stats.averageScore.toFixed(1) : '0.0'}<span className="text-xl text-gray-500">/10</span>
              </p>
              <p className="text-gray-400 text-sm font-medium">Average Score</p>
            </div>
          </div>
        </div>

        {/* Start New Session */}
        <h2 className="text-xl font-semibold mb-6">Start New Viva Session</h2>
        <div className="glass rounded-2xl p-6 mb-12">
          <form onSubmit={handleStartViva} className="flex gap-4 items-end">
            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                <Folder className="w-4 h-4" /> Local Repository Path
              </label>
              <input
                type="text"
                required
                className="w-full bg-surface border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                placeholder="e.g., C:/Users/Sambhav/my-backend-project"
                value={localPath}
                onChange={(e) => setLocalPath(e.target.value)}
              />
            </div>
            <button 
              type="submit"
              className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-primary/20 hover:scale-105 h-[50px]"
            >
              <Play className="w-5 h-5" />
              Start Viva
            </button>
          </form>
        </div>

        {/* Recent History */}
        <h2 className="text-xl font-semibold mb-6">Recent Sessions</h2>
        <div className="glass rounded-2xl overflow-hidden">
          {stats?.projectsData && stats.projectsData.length > 0 && stats.projectsData.flatMap(p => p.vivaSessions).length > 0 ? (
            <table className="w-full text-left">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="px-6 py-4 text-sm font-medium text-gray-400">Project ID</th>
                  <th className="px-6 py-4 text-sm font-medium text-gray-400">Score</th>
                  <th className="px-6 py-4 text-sm font-medium text-gray-400">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {stats.projectsData.flatMap(p => p.vivaSessions).slice(0, 5).map((session) => (
                  <tr key={session.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium">{session.projectId}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${session.score >= 7 ? 'bg-accent/20 text-accent' : session.score >= 4 ? 'bg-yellow-500/20 text-yellow-500' : 'bg-red-500/20 text-red-500'}`}>
                        {session.score}/10
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">{new Date(session.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-12 text-center text-gray-500">
              <p>No past sessions found. Start a new Viva session above!</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Activity, Play, CheckCircle, TrendingUp, Clock, BarChart3 } from 'lucide-react';

export default function UserDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(res.data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  const getScoreColor = (score) => {
    if (score >= 7) return 'text-green-400';
    if (score >= 4) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreBg = (score) => {
    if (score >= 7) return 'bg-green-400/10 border-green-400/20';
    if (score >= 4) return 'bg-yellow-400/10 border-yellow-400/20';
    return 'bg-red-400/10 border-red-400/20';
  };

  return (
    <div className="min-h-screen bg-background-primary text-text-primary p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex justify-between items-center bg-background-secondary p-6 rounded-2xl border border-border-primary">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-accent-primary/10 flex items-center justify-center border border-accent-primary/20">
              <Activity className="w-6 h-6 text-accent-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Welcome to Viva Defender</h1>
              <p className="text-text-secondary">Your AI-powered mock viva companion</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-status-error transition-colors"
          >
            Log Out
          </button>
        </div>

        {/* Stats Summary Cards */}
        {stats && stats.totalSessions > 0 && (
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-background-secondary p-5 rounded-2xl border border-border-primary">
              <div className="flex items-center gap-3 mb-2">
                <BarChart3 className="w-5 h-5 text-accent-primary" />
                <span className="text-sm text-text-secondary">Total Sessions</span>
              </div>
              <p className="text-3xl font-bold">{stats.totalSessions}</p>
            </div>
            <div className="bg-background-secondary p-5 rounded-2xl border border-border-primary">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-5 h-5 text-green-400" />
                <span className="text-sm text-text-secondary">Average Score</span>
              </div>
              <p className={`text-3xl font-bold ${getScoreColor(stats.averageScore)}`}>
                {stats.averageScore.toFixed(1)}<span className="text-lg text-text-tertiary">/10</span>
              </p>
            </div>
            <div className="bg-background-secondary p-5 rounded-2xl border border-border-primary">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="w-5 h-5 text-blue-400" />
                <span className="text-sm text-text-secondary">Projects</span>
              </div>
              <p className="text-3xl font-bold">{stats.totalProjects}</p>
            </div>
          </div>
        )}

        {/* Main Action + Progress */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-background-secondary p-8 rounded-2xl border border-border-primary flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-accent-primary/10 flex items-center justify-center mb-2">
              <Play className="w-8 h-8 text-accent-primary ml-1" />
            </div>
            <h2 className="text-xl font-semibold">Start New Session</h2>
            <p className="text-text-secondary text-sm max-w-xs">
              Begin a new mock viva interview to test your knowledge against our AI inquisitor.
            </p>
            <button 
              onClick={() => navigate(`/viva/project-${Date.now()}`)}
              className="mt-4 px-6 py-3 bg-accent-primary hover:bg-accent-hover text-white rounded-xl font-medium transition-all shadow-lg shadow-accent-primary/25"
            >
              Start Session
            </button>
          </div>

          <div className="bg-background-secondary p-6 rounded-2xl border border-border-primary flex flex-col">
            <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <CheckCircle className="w-5 h-5 text-status-success" />
              Recent Progress
            </h2>

            {loading ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-accent-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : !stats || stats.totalSessions === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <p className="text-text-secondary text-sm">
                  You haven't completed any sessions yet. Start your first mock viva to see your progress here!
                </p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-3 max-h-64 pr-1">
                {stats.projectsData.map((project) => 
                  project.vivaSessions.map((session) => {
                    let feedback = '';
                    try {
                      const parsed = JSON.parse(session.feedback);
                      feedback = parsed.feedback || '';
                    } catch {
                      feedback = session.feedback || '';
                    }

                    return (
                      <div key={session.id} className={`p-4 rounded-xl border ${getScoreBg(session.score)}`}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium text-sm truncate max-w-[180px]">{project.name}</span>
                          <span className={`font-bold text-lg ${getScoreColor(session.score)}`}>
                            {session.score}<span className="text-xs text-text-tertiary">/10</span>
                          </span>
                        </div>
                        <p className="text-xs text-text-tertiary line-clamp-2">{feedback}</p>
                        <p className="text-xs text-text-tertiary mt-1">
                          {new Date(session.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>
        
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Plus, BookOpen, Target, Activity, Users } from 'lucide-react';
import { KpiCard } from '../components/dashboard/KpiCard';
import { PerformanceChart } from '../components/dashboard/PerformanceChart';
import { SessionsTable } from '../components/dashboard/SessionsTable';

// Mock chart data for demonstration
const mockChartData = [
  { date: 'Mon', score: 6.5 },
  { date: 'Tue', score: 7.2 },
  { date: 'Wed', score: 8.0 },
  { date: 'Thu', score: 7.8 },
  { date: 'Fri', score: 8.5 },
  { date: 'Sat', score: 9.0 },
  { date: 'Sun', score: 8.8 },
];

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/stats', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(res.data);
      } catch (err) {
        console.error('Failed to fetch stats', err);
        // Do not redirect on local mock fail for now so we can see UI
      } finally {
        setLoading(false);
      }
    };
    
    // Simulate loading for better UX demonstration
    setTimeout(() => {
      fetchStats();
    }, 800);
  }, []);

  const handleStartViva = () => {
    const newProjectId = Math.random().toString(36).substring(7);
    navigate(`/viva/${newProjectId}`);
  };

  // Safe fallbacks for data
  const totalProjects = stats?.totalProjects || 12;
  const totalSessions = stats?.totalSessions || 48;
  const avgScore = stats?.averageScore ? stats.averageScore.toFixed(1) : '8.2';
  
  // Extract all sessions for the table
  const allSessions = stats?.projectsData 
    ? stats.projectsData.flatMap(p => p.vivaSessions)
    : [
        { id: '1', projectId: 'proj-xyz', createdAt: new Date(Date.now() - 10000000).toISOString(), score: 8 },
        { id: '2', projectId: 'proj-abc', createdAt: new Date(Date.now() - 50000000).toISOString(), score: 6 },
        { id: '3', projectId: 'proj-def', createdAt: new Date(Date.now() - 90000000).toISOString(), score: 4 },
        { id: '4', projectId: 'proj-123', createdAt: new Date(Date.now() - 120000000).toISOString(), score: 9 },
      ]; // Mock fallback if API is not running

  if (loading) {
    return (
      <div className="p-8 h-full flex flex-col gap-6 animate-pulse">
        <div className="h-10 bg-background-tertiary rounded-lg w-1/4 mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => <div key={i} className="h-32 bg-background-secondary rounded-xl border border-border-secondary"></div>)}
        </div>
        <div className="h-64 bg-background-secondary rounded-xl border border-border-secondary mt-2"></div>
        <div className="h-64 bg-background-secondary rounded-xl border border-border-secondary mt-2"></div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto w-full">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Dashboard Overview</h1>
          <p className="text-sm text-text-secondary mt-1">Here is what's happening with your Viva sessions today.</p>
        </div>
        <button 
          onClick={handleStartViva}
          className="bg-accent-primary hover:bg-accent-hover text-white px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5" />
          New Session
        </button>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KpiCard 
          title="Total Projects" 
          value={totalProjects} 
          icon={BookOpen} 
          trend={12} 
          trendLabel="vs last month"
        />
        <KpiCard 
          title="Total Sessions" 
          value={totalSessions} 
          icon={Target} 
          trend={24} 
          trendLabel="vs last month"
        />
        <KpiCard 
          title="Avg. Score" 
          value={avgScore} 
          icon={Activity} 
          trend={-2.5} 
          trendLabel="vs last month"
        />
        <KpiCard 
          title="Active Candidates" 
          value="18" 
          icon={Users} 
          trend={8} 
          trendLabel="vs last month"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2">
          <PerformanceChart data={mockChartData} title="Score Trends" />
        </div>
        
        <div className="lg:col-span-1 bg-background-secondary rounded-xl border border-border-secondary shadow-sm p-6 flex flex-col">
          <h3 className="font-semibold text-text-primary text-lg mb-6">Activity Breakdown</h3>
          
          <div className="flex-1 flex flex-col justify-center gap-6">
            <div className="flex flex-col gap-2">
               <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Passed (≥ 7)</span>
                  <span className="font-medium text-text-primary">68%</span>
               </div>
               <div className="h-2 bg-background-tertiary rounded-full overflow-hidden">
                 <div className="h-full bg-status-success w-[68%] rounded-full"></div>
               </div>
            </div>
            
            <div className="flex flex-col gap-2">
               <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Needs Review (5-6)</span>
                  <span className="font-medium text-text-primary">22%</span>
               </div>
               <div className="h-2 bg-background-tertiary rounded-full overflow-hidden">
                 <div className="h-full bg-status-warning w-[22%] rounded-full"></div>
               </div>
            </div>

            <div className="flex flex-col gap-2">
               <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Failed (&lt; 5)</span>
                  <span className="font-medium text-text-primary">10%</span>
               </div>
               <div className="h-2 bg-background-tertiary rounded-full overflow-hidden">
                 <div className="h-full bg-status-error w-[10%] rounded-full"></div>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <SessionsTable sessions={allSessions} />
    </div>
  );
}

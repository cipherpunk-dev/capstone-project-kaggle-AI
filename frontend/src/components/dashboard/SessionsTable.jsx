import React from 'react';
import { Download, ChevronDown, MoreHorizontal, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { cn } from '../../utils/cn';

export function SessionsTable({ sessions }) {
  if (!sessions || sessions.length === 0) {
    return (
      <div className="bg-background-secondary rounded-xl p-12 border border-border-secondary shadow-sm flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-background-tertiary rounded-full flex items-center justify-center mb-4">
           <AlertCircle className="w-8 h-8 text-text-tertiary" />
        </div>
        <h3 className="text-lg font-medium text-text-primary mb-2">No sessions found</h3>
        <p className="text-text-secondary max-w-sm">
          Get started by creating a new Viva session. Your historical data will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-background-secondary rounded-xl border border-border-secondary shadow-sm flex flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="px-6 py-4 border-b border-border-secondary flex items-center justify-between">
        <h3 className="font-semibold text-text-primary text-lg">Recent Sessions</h3>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary px-3 py-1.5 rounded-md hover:bg-background-tertiary transition-colors border border-transparent hover:border-border-primary">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-background-tertiary/50 border-b border-border-primary">
              <th className="px-6 py-3 text-xs font-semibold text-text-tertiary uppercase tracking-wider sticky top-0 bg-background-secondary">
                <div className="flex items-center gap-1 cursor-pointer hover:text-text-secondary">
                  Project ID <ChevronDown className="w-3 h-3" />
                </div>
              </th>
              <th className="px-6 py-3 text-xs font-semibold text-text-tertiary uppercase tracking-wider sticky top-0 bg-background-secondary">Date</th>
              <th className="px-6 py-3 text-xs font-semibold text-text-tertiary uppercase tracking-wider sticky top-0 bg-background-secondary">Status</th>
              <th className="px-6 py-3 text-xs font-semibold text-text-tertiary uppercase tracking-wider sticky top-0 bg-background-secondary text-right">Score</th>
              <th className="px-6 py-3 w-10 sticky top-0 bg-background-secondary"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-secondary">
            {sessions.map((session, i) => {
              const isPass = session.score >= 7;
              const isWarning = session.score >= 5 && session.score < 7;
              
              return (
                <tr 
                  key={session.id || i} 
                  className="hover:bg-background-tertiary/50 transition-colors group"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="font-medium text-text-primary">{session.projectId}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                    {new Date(session.createdAt).toLocaleDateString(undefined, { 
                      year: 'numeric', month: 'short', day: 'numeric', 
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={cn(
                      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
                      isPass ? "bg-status-success/10 text-status-success" : 
                      isWarning ? "bg-status-warning/10 text-status-warning" : 
                      "bg-status-error/10 text-status-error"
                    )}>
                      {isPass ? <CheckCircle2 className="w-3.5 h-3.5" /> : 
                       isWarning ? <AlertCircle className="w-3.5 h-3.5" /> : 
                       <XCircle className="w-3.5 h-3.5" />}
                      {isPass ? 'Passed' : isWarning ? 'Needs Review' : 'Failed'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right font-semibold text-text-primary">
                    {session.score}/10
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button className="text-text-tertiary hover:text-text-primary p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

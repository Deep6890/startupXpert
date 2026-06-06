import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStartup } from '../context/StartupContext';
import { useToast } from '../context/ToastContext';
import DashboardLayout from '../layouts/DashboardLayout';
import { 
  Clock, 
  Trash2, 
  Copy, 
  Play, 
  Eye, 
  Scale, 
  X, 
  Info, 
  TrendingUp, 
  Target, 
  Sparkles, 
  Users, 
  Gauge, 
  AlertCircle, 
  Zap, 
  Layers, 
  Search 
} from 'lucide-react';

const History = () => {
  const { 
    analysisHistory, 
    deleteHistoryItem, 
    restoreStartupVenture, 
    duplicateHistoryItem,
    loadingState 
  } = useStartup();
  
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Modal states
  const [viewingItem, setViewingItem] = useState(null);
  const [selectedForCompare, setSelectedForCompare] = useState([]);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [activatingItem, setActivatingItem] = useState(null);

  const handleToggleCompare = (id) => {
    if (selectedForCompare.includes(id)) {
      setSelectedForCompare(prev => prev.filter(item => item !== id));
    } else {
      if (selectedForCompare.length >= 2) {
        showToast('You can only compare a maximum of 2 validation runs at a time.', 'info');
        return;
      }
      setSelectedForCompare(prev => [...prev, id]);
    }
  };

  const handleCompareClick = () => {
    if (selectedForCompare.length !== 2) {
      showToast('Please select exactly 2 validation records to compare.', 'info');
      return;
    }
    setIsCompareOpen(true);
  };

  const handleMakeActiveConfirm = () => {
    if (activatingItem) {
      restoreStartupVenture(activatingItem);
      setActivatingItem(null);
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    }
  };

  // Metric metadata
  const metricMeta = [
    { key: 'marketDemand', label: 'Market Demand', icon: TrendingUp },
    { key: 'targetAudienceFit', label: 'Target Audience Fit', icon: Target },
    { key: 'problemSolutionFit', label: 'Problem-Solution Fit', icon: Sparkles },
    { key: 'competitorPresence', label: 'Competitor Presence', icon: Users },
    { key: 'revenuePotential', label: 'Revenue Potential', icon: Gauge },
    { key: 'riskLevel', label: 'Risk Level', icon: AlertCircle },
    { key: 'innovationLevel', label: 'Innovation Level', icon: Zap },
    { key: 'scalability', label: 'Scalability', icon: Layers },
    { key: 'feasibility', label: 'Feasibility', icon: Search }
  ];

  // Compare items computation
  const compareItems = selectedForCompare.map(id => 
    analysisHistory.find(item => item.id === id)
  ).filter(Boolean);

  return (
    <DashboardLayout activeTab="history">
      <div className="space-y-6 text-left relative min-h-[calc(100vh-80px)]">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-indigo-500/5 pb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-400 font-mono">Archive Manager</span>
            <h1 className="font-heading text-3xl font-extrabold text-white mt-1">
              Analysis History
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Review previous validation reports, compare scorecards side-by-side, and duplicate configurations.
            </p>
          </div>

          {/* Quick Actions / Compare Bar */}
          {selectedForCompare.length > 0 && (
            <div className="flex items-center gap-3 bg-indigo-950/10 border border-indigo-500/10 p-2.5 rounded-xl animate-[fadeIn_0.2s_ease-out]">
              <span className="text-xs text-gray-400 font-semibold px-1">
                {selectedForCompare.length} of 2 selected for comparison
              </span>
              {selectedForCompare.length === 2 && (
                <button
                  onClick={handleCompareClick}
                  className="flex items-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-indigo-600/10"
                >
                  <Scale className="h-4 w-4" />
                  Compare
                </button>
              )}
              <button
                onClick={() => setSelectedForCompare([])}
                className="text-gray-500 hover:text-white p-1"
                title="Clear selection"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Empty State */}
        {analysisHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 min-h-[50vh] text-center space-y-4 max-w-md mx-auto">
            <div className="h-16 w-16 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.1)]">
              <Clock className="h-8 w-8 animate-pulse" />
            </div>
            <h2 className="font-heading text-xl font-bold text-white">Archive Empty</h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              No validation records found. Complete validation to start tracking history.
            </p>
            <button
              onClick={() => navigate('/onboarding/role')}
              className="rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3.5 text-xs font-bold uppercase tracking-wider shadow-lg shadow-indigo-600/10 transition-all cursor-pointer"
            >
              Validate Startup Idea
            </button>
          </div>
        ) : (
          /* History List Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {analysisHistory.map((item) => (
              <div 
                key={item.id} 
                className="relative rounded-2xl border border-indigo-500/10 bg-[#0e0e16]/60 p-5 backdrop-blur-md flex flex-col justify-between gap-5 hover:border-indigo-500/35 transition-all duration-300 group"
              >
                {/* Checkbox Selector for Compare */}
                <div className="absolute top-4 right-4 flex items-center">
                  <label className="relative flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={selectedForCompare.includes(item.id)}
                      onChange={() => handleToggleCompare(item.id)}
                      className="sr-only peer"
                    />
                    <div className="h-4.5 w-4.5 rounded border border-indigo-500/20 bg-[#0a0a0f] peer-checked:bg-indigo-600 peer-checked:border-indigo-500 flex items-center justify-center transition-all duration-200">
                      <Scale className="h-3 w-3 text-white scale-0 peer-checked:scale-100 transition-transform" />
                    </div>
                  </label>
                </div>

                {/* Info Header */}
                <div className="space-y-1 text-left">
                  <span className="text-[9px] font-mono font-bold text-gray-500 block uppercase">{item.date}</span>
                  <h3 className="font-heading text-lg font-bold text-white truncate max-w-[80%]">
                    {item.startupName}
                  </h3>
                  <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                    {item.summary}
                  </p>
                </div>

                {/* Key Scores Preview Row */}
                <div className="grid grid-cols-3 gap-2 py-3 border-y border-indigo-500/5 bg-indigo-950/5 rounded-xl px-4 text-center">
                  <div>
                    <span className="text-[8px] font-bold text-gray-500 uppercase tracking-wider block">Feasibility</span>
                    <span className="text-sm font-bold text-indigo-400 font-mono">{item.scores?.feasibility?.score || 0}%</span>
                  </div>
                  <div>
                    <span className="text-[8px] font-bold text-gray-500 uppercase tracking-wider block">Risk</span>
                    <span className={`text-sm font-bold font-mono ${
                      item.risk === 'Low' ? 'text-emerald-400' : item.risk === 'Medium' ? 'text-amber-400' : 'text-rose-400'
                    }`}>{item.risk}</span>
                  </div>
                  <div>
                    <span className="text-[8px] font-bold text-gray-500 uppercase tracking-wider block">Innovation</span>
                    <span className="text-sm font-bold text-cyan-400 font-mono">{item.scores?.innovationLevel?.score || 0}%</span>
                  </div>
                </div>

                {/* Operations Toolbar */}
                <div className="flex items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-2">
                    {/* View Scorecard Details */}
                    <button
                      onClick={() => setViewingItem(item)}
                      className="h-8.5 px-3 rounded-lg border border-indigo-500/10 bg-[#0a0a0f] hover:border-indigo-500/30 text-gray-400 hover:text-white flex items-center gap-1.5 text-2xs font-bold uppercase tracking-wider transition-all"
                      title="View Report Scores"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      View
                    </button>

                    {/* Duplicate Card */}
                    <button
                      onClick={() => duplicateHistoryItem(item)}
                      disabled={loadingState}
                      className="h-8.5 px-3 rounded-lg border border-indigo-500/10 bg-[#0a0a0f] hover:border-indigo-500/30 text-gray-400 hover:text-white flex items-center gap-1.5 text-2xs font-bold uppercase tracking-wider transition-all disabled:opacity-50"
                      title="Duplicate Record"
                    >
                      <Copy className="h-3.5 w-3.5" />
                      Duplicate
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Activate Venture */}
                    <button
                      onClick={() => setActivatingItem(item)}
                      className="h-8.5 px-3.5 rounded-lg bg-indigo-600/10 hover:bg-indigo-600 border border-indigo-500/20 text-indigo-400 hover:text-white flex items-center gap-1.5 text-2xs font-bold uppercase tracking-wider transition-all"
                      title="Make this the active working startup"
                    >
                      <Play className="h-3.5 w-3.5" />
                      Make Active
                    </button>

                    {/* Delete Entry */}
                    <button
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to permanently delete validation history for "${item.startupName}"?`)) {
                          deleteHistoryItem(item.id);
                        }
                      }}
                      disabled={loadingState}
                      className="h-8.5 w-8.5 rounded-lg border border-rose-500/15 bg-rose-500/5 hover:bg-rose-500 hover:text-white text-rose-400 flex items-center justify-center transition-all disabled:opacity-50"
                      title="Delete Entry"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}

        {/* 1. VIEW RECORD MODAL */}
        {viewingItem && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/65 backdrop-blur-sm p-4 animate-[fadeIn_0.2s_ease-out]">
            <div className="w-full max-w-2xl rounded-2xl border border-indigo-500/15 bg-[#0e0e16] p-6 shadow-2xl space-y-6 text-left relative max-h-[85vh] overflow-y-auto">
              
              {/* Close Button */}
              <button 
                onClick={() => setViewingItem(null)}
                className="absolute right-4 top-4 h-8 w-8 flex items-center justify-center rounded-lg border border-indigo-500/10 bg-indigo-500/5 text-gray-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase">{viewingItem.date}</span>
                <h2 className="font-heading text-xl font-bold text-white tracking-wide">{viewingItem.startupName} Scorecard</h2>
                <p className="text-xs text-gray-500">Historical AI Validation report summary parameters.</p>
              </div>

              {/* SWOT details from restored metadata */}
              <div className="rounded-xl border border-indigo-500/5 bg-indigo-950/10 p-4 space-y-3">
                <span className="text-2xs font-bold text-gray-500 uppercase tracking-widest block">Startup Profile</span>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-gray-500 block">Venture Focus Domain:</span>
                    <span className="font-semibold text-white">{viewingItem.details?.startupDomain || 'SaaS'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Revenue Streams:</span>
                    <span className="font-semibold text-white">{viewingItem.details?.revenueModel || 'Subscription'}</span>
                  </div>
                </div>
              </div>

              {/* 3x3 Metrics Display */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {metricMeta.map((metric) => {
                  const MIcon = metric.icon;
                  const val = viewingItem.scores?.[metric.key] || { score: 0, status: 'Medium' };
                  return (
                    <div key={metric.key} className="p-3.5 rounded-xl border border-indigo-500/5 bg-indigo-950/5 flex flex-col justify-between gap-1 text-left">
                      <div className="flex items-center gap-2">
                        <MIcon className="h-4 w-4 text-indigo-400 shrink-0" />
                        <span className="text-2xs font-bold uppercase text-gray-500 tracking-wider truncate">{metric.label}</span>
                      </div>
                      <div className="flex items-baseline gap-2 mt-2">
                        <span className="text-lg font-black text-white font-mono">{val.score}%</span>
                        <span className={`text-[8px] font-extrabold uppercase px-1 rounded ${
                          val.status === 'High' || (val.status === 'Low' && metric.key === 'riskLevel')
                            ? 'bg-emerald-500/10 text-emerald-400' 
                            : 'bg-amber-500/10 text-amber-400'
                        }`}>{val.status}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Strategic Summary Box */}
              <div className="p-4 rounded-xl border border-cyan-500/10 bg-cyan-500/5 flex items-start gap-3">
                <Info className="h-5 w-5 text-cyan-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <h4 className="text-2xs font-bold uppercase tracking-widest text-cyan-400">AI Strategic Core Feedback</h4>
                  <p className="text-xs text-cyan-300 leading-relaxed font-sans">{viewingItem.summary}</p>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* 2. MAKE ACTIVE CONFIRMATION MODAL */}
        {activatingItem && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/65 backdrop-blur-sm p-4 animate-[fadeIn_0.2s_ease-out]">
            <div className="w-full max-w-md rounded-2xl border border-indigo-500/15 bg-[#0e0e16] p-6 shadow-2xl space-y-6 text-center relative">
              <button 
                onClick={() => setActivatingItem(null)}
                className="absolute right-4 top-4 h-8 w-8 flex items-center justify-center rounded-lg border border-indigo-500/10 bg-indigo-500/5 text-gray-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="space-y-2">
                <h3 className="font-heading text-lg font-extrabold text-white">Activate Startup Venture Profile?</h3>
                <p className="text-xs text-gray-500 leading-relaxed px-2">
                  This will reload the active working session. Your dashboard, roadmap progress checklist, and generated documents will switch completely to **"{activatingItem.startupName}"**.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setActivatingItem(null)}
                  className="rounded-xl border border-indigo-500/20 bg-[#0a0a0f] px-5 py-3 text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-white transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleMakeActiveConfirm}
                  className="rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-3 text-xs font-bold uppercase tracking-wider shadow-lg shadow-indigo-600/10 transition-all"
                >
                  Confirm &amp; Load
                </button>
              </div>

            </div>
          </div>
        )}

        {/* 3. COMPARE SIDE-BY-SIDE MODAL */}
        {isCompareOpen && compareItems.length === 2 && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/65 backdrop-blur-sm p-4 animate-[fadeIn_0.2s_ease-out]">
            <div className="w-full max-w-3xl rounded-2xl border border-indigo-500/15 bg-[#0e0e16] p-6 shadow-2xl space-y-6 text-left relative max-h-[90vh] overflow-y-auto">
              
              <button 
                onClick={() => setIsCompareOpen(false)}
                className="absolute right-4 top-4 h-8 w-8 flex items-center justify-center rounded-lg border border-indigo-500/10 bg-indigo-500/5 text-gray-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase">Analysis Compare Core</span>
                <h2 className="font-heading text-xl font-bold text-white tracking-wide">Venture Comparison Grid</h2>
                <p className="text-xs text-gray-500">Side-by-side metric comparison of your validation runs.</p>
              </div>

              {/* Side by Side Headings */}
              <div className="grid grid-cols-3 gap-4 border-b border-indigo-500/5 pb-4">
                <div className="text-2xs font-bold text-gray-500 uppercase tracking-widest flex items-end">Validation Metric</div>
                {compareItems.map(item => (
                  <div key={item.id} className="text-left space-y-1">
                    <span className="text-[8px] font-mono text-gray-500 block uppercase">{item.date}</span>
                    <h4 className="text-sm font-bold text-white truncate">{item.startupName}</h4>
                    <span className="inline-block rounded bg-indigo-950 border border-indigo-500/10 px-2 py-0.5 text-[8px] font-bold text-indigo-400 uppercase">
                      {item.details?.startupDomain || 'SaaS'}
                    </span>
                  </div>
                ))}
              </div>

              {/* Comparative Scores list */}
              <div className="space-y-3">
                {metricMeta.map((metric) => {
                  const valA = compareItems[0].scores?.[metric.key]?.score || 0;
                  const valB = compareItems[1].scores?.[metric.key]?.score || 0;
                  const diff = valA - valB;

                  return (
                    <div key={metric.key} className="grid grid-cols-3 gap-4 items-center p-3 rounded-xl border border-indigo-500/5 bg-indigo-950/5">
                      <div className="text-xs font-semibold text-gray-400 truncate">{metric.label}</div>
                      
                      {/* Item A Score */}
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white font-mono">{valA}%</span>
                        {diff !== 0 && (
                          <span className={`text-[9px] font-bold font-mono ${diff > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {diff > 0 ? `(+${diff})` : `(${diff})`}
                          </span>
                        )}
                      </div>

                      {/* Item B Score */}
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white font-mono">{valB}%</span>
                        {diff !== 0 && (
                          <span className={`text-[9px] font-bold font-mono ${diff < 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {diff < 0 ? `(+${Math.abs(diff)})` : `(-${diff})`}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default History;

import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useStartup } from '../context/StartupContext';
import { useToast } from '../context/ToastContext';
import DashboardLayout from '../layouts/DashboardLayout';
import { 
  Sparkles, 
  Layers, 
  FileText, 
  Compass, 
  ArrowUpRight, 
  Clock, 
  Plus, 
  Briefcase,
  TrendingUp,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Gauge,
  Activity,
  Download,
  Info,
  Target,
  Lock
} from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const { 
    user, 
    onboardingRole,
    startupDetails, 
    analysisScores,
    resumeState,
    restoreDraft,
    roadmapNodes,
    getInitials,
    analysisHistory,
    restoreStartupVenture,
    clearDraft,
    startNewValidation
  } = useStartup();

  // Check if a validated startup exists in context
  const hasValidatedStartup = !!startupDetails?.startupName && !!analysisScores && (roadmapNodes?.length || 0) > 0;

  // Handle Quick Resume Draft Click
  const handleQuickResume = () => {
    const restored = restoreDraft();
    if (restored) {
      navigate('/onboarding/details');
    }
  };

  const handleStartFresh = () => {
    if (window.confirm('Are you sure you want to discard your saved draft and start fresh? This action is irreversible.')) {
      clearDraft();
      navigate('/onboarding/role');
    }
  };

  // Compute overall completion stats from roadmapNodes
  const totalTasks = roadmapNodes?.reduce((acc, n) => acc + (n.tasks?.length || 0), 0) || 0;
  const completedTasks = roadmapNodes?.reduce((acc, n) => acc + (n.tasks?.filter(t => t.completed).length || 0), 0) || 0;
  const roadmapProgressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Compute readiness score
  const feasibilityScore = analysisScores?.feasibility?.score || 0;
  const riskScore = analysisScores?.riskLevel?.score || 0;
  const innovationScore = analysisScores?.innovationLevel?.score || 0;
  const readinessScore = hasValidatedStartup 
    ? Math.round((feasibilityScore * 0.4) + ((100 - riskScore) * 0.3) + (innovationScore * 0.3))
    : 0;

  // Find active node (In Progress or first Pending node)
  const currentActiveNode = roadmapNodes?.find(n => n.status === 'In Progress' && n.id !== 'root') || roadmapNodes?.find(n => n.status === 'Pending' && n.id !== 'root');

  // Onboarding verification checks for completion percent
  const isStep1Done = !!onboardingRole?.fullName && !!onboardingRole?.profession;
  const isStep2Done = !!startupDetails?.startupName && !!startupDetails?.startupDescription;
  const onboardingCompletionPercent = isStep2Done ? 66 : (isStep1Done ? 33 : 0);

  // Statistics cards data mapping
  const stats = [
    {
      label: 'TOTAL STARTUPS',
      value: analysisHistory.length,
      subtext: 'Venture index profiles registered',
      icon: Briefcase,
    },
    {
      label: 'ANALYSIS DONE',
      value: analysisHistory.filter(h => h.scores).length,
      subtext: 'Stress-tests fully compiled',
      icon: Layers,
    },
    {
      label: 'SAVED DRAFTS',
      value: resumeState ? 1 : 0,
      subtext: 'Pending onboarding drafts',
      icon: FileText,
    },
    {
      label: 'ROADMAP STEPS',
      value: hasValidatedStartup ? `${completedTasks} / ${totalTasks}` : '0 / 10',
      subtext: 'Venture milestones executed',
      icon: Compass,
    }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 md:space-y-8 text-left">
        
        {/* ── Welcome Banner / Venture Header Card ── */}
        <div className="relative rounded-2xl border border-indigo-500/15 bg-indigo-950/15 p-6 md:p-8 backdrop-blur-md overflow-hidden shadow-[0_0_35px_rgba(99,102,241,0.05)]">
          <div className="absolute -right-24 -top-24 h-48 w-48 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none"></div>
          
          {hasValidatedStartup ? (
            /* 1. Validated User State */
            <div className="space-y-4">
              <div className="space-y-2 max-w-3xl">
                <span className="text-2xs font-extrabold uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-md border border-indigo-500/15">
                  Venture Workspace Active
                </span>
                <h2 className="font-heading text-2xl font-bold text-white pt-1">
                  Active Venture: {startupDetails.startupName} 🚀
                </h2>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Feasibility stress-test compiled. Explore your roadmap milestone mind map, custom generated pitch decks, and SWOT reports.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => navigate('/roadmap')}
                  className="group flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-indigo-500 transition-all duration-300 hover:shadow-[0_0_25px_rgba(99,102,241,0.2)] cursor-pointer"
                >
                  <Compass className="h-4 w-4" />
                  View Interactive Roadmap
                </button>
                <button
                  onClick={() => {
                    startNewValidation();
                    navigate('/onboarding/role');
                  }}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-bold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Validate Other Idea &rarr;
                </button>
              </div>
            </div>
          ) : resumeState ? (
            /* 2. Onboarding User State (Has Saved Draft) */
            <div className="space-y-4">
              <div className="space-y-2 max-w-3xl">
                <span className="text-2xs font-extrabold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/15">
                  Validation Draft In Progress
                </span>
                <h2 className="font-heading text-2xl font-bold text-white pt-1">
                  Resume Your Startup Validation, {user.fullName || 'Founder'} 📝
                </h2>
                <p className="text-sm text-gray-400 leading-relaxed">
                  You have a saved validation draft in progress ({onboardingCompletionPercent}% complete). Resume now to complete your venture stress-test.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={handleQuickResume}
                  className="group flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-indigo-500 transition-all duration-300 hover:shadow-[0_0_25px_rgba(99,102,241,0.2)] cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  Resume Validation Draft
                </button>
                <button
                  onClick={handleStartFresh}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-bold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Start Fresh Validation &rarr;
                </button>
              </div>
            </div>
          ) : (
            /* 3. New User State */
            <div className="space-y-4">
              <div className="space-y-2 max-w-3xl">
                <span className="text-2xs font-extrabold uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-md border border-indigo-500/15">
                  Getting Started
                </span>
                <h2 className="font-heading text-2xl font-bold text-white pt-1">
                  Welcome to StartupXpert, {user.fullName || 'Founder'} 👋
                </h2>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Your account is ready. When you're set, validate your startup idea — our AI will stress-test it across 250+ market parameters.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => navigate('/onboarding/role')}
                  className="group flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-indigo-500 transition-all duration-300 hover:shadow-[0_0_25px_rgba(99,102,241,0.2)] cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  Validate My First Idea
                </button>
                <button
                  onClick={() => showToast('Click around! View the Locked Roadmap, Documents or Settings in the sidebar to see how they look.', 'info')}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-bold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Explore dashboard first &rarr;
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Statistics Cards Row ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className="relative rounded-2xl border border-indigo-500/10 bg-[#0e0e16]/60 p-5 backdrop-blur-md overflow-hidden hover:border-indigo-500/30 transition-all duration-300 text-left">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-extrabold uppercase tracking-wider text-gray-500">{stat.label}</span>
                  <div className="h-7 w-7 rounded-lg border border-indigo-500/10 bg-indigo-500/5 flex items-center justify-center text-indigo-400">
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                </div>
                <p className="mt-4 font-heading text-3xl font-black text-white font-mono leading-none">
                  {stat.value}
                </p>
                <p className="text-[10px] text-gray-500 mt-2">{stat.subtext}</p>
              </div>
            );
          })}
        </div>

        {/* ── Main Content Grid Layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          
          {/* Left Column (Venture History / Validation Metrics) */}
          <div className="lg:col-span-2 space-y-6 md:space-y-8">
            
            {!hasValidatedStartup ? (
              /* Venture History & Actions */
              <div className="rounded-2xl border border-indigo-500/10 bg-[#0e0e16]/60 p-6 backdrop-blur-md flex flex-col justify-between min-h-[380px]">
                <div className="border-b border-indigo-500/5 pb-3 flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
                    <Clock className="h-4.5 w-4.5 text-indigo-400" />
                    VENTURE HISTORY & ACTIONS
                  </span>
                </div>

                {analysisHistory.length === 0 ? (
                  <div className="flex-grow flex flex-col items-center justify-center text-center p-8 space-y-4">
                    <div className="h-16 w-16 rounded-full border border-indigo-500/20 bg-indigo-500/5 flex items-center justify-center text-indigo-400">
                      <Clock className="h-8 w-8 animate-pulse" />
                    </div>
                    <h3 className="font-heading text-base font-bold text-white">No validation records compiled</h3>
                    <p className="text-xs text-gray-500 max-w-sm leading-relaxed">
                      Stress-test a new startup idea to generate metric score grids and roadmap milestones here.
                    </p>
                  </div>
                ) : (
                  <div className="flex-grow py-4 space-y-3 max-h-[300px] overflow-y-auto pr-1">
                    {analysisHistory.map((item) => (
                      <div 
                        key={item.id}
                        onClick={() => {
                          if (window.confirm(`Would you like to load "${item.startupName}" as your active working venture?`)) {
                            restoreStartupVenture(item);
                            navigate('/dashboard');
                          }
                        }}
                        className="p-3.5 rounded-xl border border-indigo-500/5 bg-indigo-950/5 flex items-center justify-between gap-3 group cursor-pointer hover:border-indigo-500/30 transition-all duration-300"
                      >
                        <div className="min-w-0 text-left">
                          <h4 className="text-xs font-bold text-white truncate group-hover:text-indigo-400 transition-colors">{item.startupName}</h4>
                          <p className="text-[9px] text-gray-500 mt-0.5">{item.date} • {item.details?.startupDomain || 'SaaS'}</p>
                        </div>
                        
                        <div className="flex items-center gap-4 shrink-0 font-mono">
                          <div className="text-right">
                            <span className="text-[8px] font-bold text-gray-500 uppercase block">Feasibility</span>
                            <span className="text-xs font-bold text-indigo-400">{item.scores?.feasibility?.score || 0}%</span>
                          </div>
                          <ChevronRight className="h-4 w-4 text-gray-500 group-hover:text-white transition-colors" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="border-t border-indigo-500/5 pt-3 text-left">
                  <button
                    onClick={() => {
                      if (analysisHistory.length === 0) {
                        showToast('No validation history compiled yet.', 'info');
                        return;
                      }
                      showToast('Exporting venture portfolio history... Coming soon in V2.0!', 'info');
                    }}
                    className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 uppercase tracking-wider transition-colors"
                  >
                    Export portfolio history log &gt;
                  </button>
                </div>
              </div>
            ) : (
              /* Validated Scorecard & AI Insights */
              <div className="space-y-6 md:space-y-8">
                {/* AI Validation Scorecard */}
                <div className="rounded-2xl border border-indigo-500/10 bg-[#0e0e16]/60 p-6 backdrop-blur-md space-y-4">
                  <div className="border-b border-indigo-500/5 pb-3 flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
                      <Layers className="h-4.5 w-4.5 text-indigo-400" />
                      AI Validation Scorecard
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { label: 'Market Demand', key: 'marketDemand', icon: Target },
                      { label: 'Target Audience Fit', key: 'targetAudienceFit', icon: Briefcase },
                      { label: 'Problem-Solution Fit', key: 'problemSolutionFit', icon: Sparkles },
                      { label: 'Competitor Presence', key: 'competitorPresence', icon: AlertTriangle },
                      { label: 'Revenue Potential', key: 'revenuePotential', icon: TrendingUp },
                      { label: 'Innovation Level', key: 'innovationLevel', icon: Layers },
                      { label: 'Scalability Factor', key: 'scalability', icon: ArrowUpRight },
                      { label: 'Tech Feasibility', key: 'feasibility', icon: ShieldCheck },
                    ].map((metric) => {
                      const val = analysisScores?.[metric.key] || { score: 75, status: 'High' };
                      const MIcon = metric.icon;
                      return (
                        <div key={metric.key} className="p-3.5 rounded-xl border border-indigo-500/5 bg-indigo-950/5 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="h-7 w-7 rounded-lg border border-indigo-500/10 bg-indigo-500/5 flex items-center justify-center text-indigo-400 shrink-0">
                              <MIcon className="h-3.5 w-3.5" />
                            </div>
                            <span className="text-xs font-semibold text-gray-300 truncate">{metric.label}</span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0 font-mono">
                            <span className="text-xs font-bold text-white">{val.score}%</span>
                            <span className={`rounded px-1.5 py-0.5 text-[8px] font-extrabold uppercase ${
                              val.status === 'High' || (val.status === 'Low' && metric.key === 'riskLevel')
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            }`}>{val.status}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* AI Strategic Insights */}
                <div className="rounded-2xl border border-indigo-500/10 bg-[#0e0e16]/60 p-6 backdrop-blur-md space-y-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2 border-b border-indigo-500/5 pb-3">
                    <Sparkles className="h-4.5 w-4.5 text-cyan-400" />
                    AI Strategic Insight
                  </span>
                  <div className="p-4 rounded-xl border border-cyan-500/15 bg-cyan-500/5 text-left space-y-3 relative overflow-hidden">
                    <div className="absolute right-0 top-0 h-10 w-10 bg-cyan-500/5 rounded-bl-full pointer-events-none"></div>
                    <p className="text-xs text-cyan-300 leading-relaxed font-sans">
                      {analysisScores?.marketDemand?.details || 'Stress-testing market parameters...'}
                    </p>
                    <div className="pt-2 border-t border-cyan-500/10 text-[10px] text-gray-500 flex items-center gap-1.5 font-mono">
                      <Info className="h-3 w-3" />
                      Advice Stable in V1
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column (Startup Progress Panel) */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-indigo-500/10 bg-[#0e0e16]/60 p-6 backdrop-blur-md flex flex-col justify-between min-h-[380px]">
              <div>
                <div className="border-b border-indigo-500/5 pb-3 flex items-center gap-2">
                  <Activity className="h-4.5 w-4.5 text-indigo-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                    STARTUP PROGRESS
                  </span>
                </div>

                {!hasValidatedStartup ? (
                  /* Before Validation Parameters */
                  <div className="space-y-5 pt-4 text-left">
                    
                    {/* Validation Status */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400 font-semibold">Validation Status</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        Not Started
                      </span>
                    </div>

                    {/* Roadmap Status */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400 font-semibold">Roadmap Status</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/5 text-gray-500 flex items-center gap-1 border border-white/5">
                        <Lock className="h-3 w-3" /> Locked
                      </span>
                    </div>

                    {/* Documents Status */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400 font-semibold">Documents Status</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/5 text-gray-500 flex items-center gap-1 border border-white/5">
                        <Lock className="h-3 w-3" /> Locked
                      </span>
                    </div>

                    {/* Onboarding Completion % */}
                    <div className="space-y-1.5 pt-2">
                      <div className="flex justify-between items-center text-[10px] font-bold text-gray-500">
                        <span className="uppercase">Onboarding Completion</span>
                        <span className="text-indigo-400 font-mono">{onboardingCompletionPercent}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-[#0a0a0f] rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400 rounded-full transition-all duration-300"
                          style={{ width: `${onboardingCompletionPercent}%` }}
                        ></div>
                      </div>
                    </div>

                  </div>
                ) : (
                  /* After Validation Parameters */
                  <div className="space-y-5 pt-4 text-left">
                    
                    {/* Startup Readiness Score */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-400 font-semibold">Startup Readiness Score</span>
                        <span className="text-sm font-bold text-cyan-400 font-mono">{readinessScore}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-[#0a0a0f] rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full transition-all duration-300"
                          style={{ width: `${readinessScore}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Current Startup Stage */}
                    <div className="flex items-center justify-between border-t border-indigo-500/5 pt-3.5">
                      <span className="text-xs text-gray-400 font-semibold">Current Startup Stage</span>
                      <span className="text-xs font-bold text-white capitalize">
                        {startupDetails.startupStage || 'Onboarding'}
                      </span>
                    </div>

                    {/* Roadmap Progress % */}
                    <div className="space-y-1.5 border-t border-indigo-500/5 pt-3.5">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-400 font-semibold">Roadmap Progress %</span>
                        <span className="text-xs font-bold text-indigo-400 font-mono">{roadmapProgressPercent}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-[#0a0a0f] rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full transition-all duration-300"
                          style={{ width: `${roadmapProgressPercent}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Active Milestone */}
                    <div className="border-t border-indigo-500/5 pt-3.5 space-y-1">
                      <span className="text-[10px] text-gray-500 font-bold uppercase block">Active Milestone</span>
                      <span className="text-xs font-bold text-white block truncate">
                        {currentActiveNode?.title || 'Launch Strategy & Risk Controls'}
                      </span>
                    </div>

                    {/* Documents Generated */}
                    <div className="border-t border-indigo-500/5 pt-3.5 space-y-2">
                      <span className="text-[10px] text-gray-500 font-bold uppercase block">Documents Generated</span>
                      <div className="space-y-1.5">
                        {[
                          { title: 'Business Plan', desc: 'Core outline dossier' },
                          { title: 'SWOT Analysis', desc: 'Dynamic internal matrices' },
                          { title: 'Startup Roadmap Report', desc: 'Milestones checklist report' },
                        ].map((doc, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-indigo-950/5 border border-indigo-500/5 hover:border-indigo-500/10 transition-colors">
                            <div className="min-w-0 text-left">
                              <span className="text-[10px] font-bold text-white block truncate uppercase">{doc.title}</span>
                            </div>
                            <Link 
                              to="/documents"
                              className="h-6 w-6 flex items-center justify-center rounded border border-indigo-500/10 bg-[#0a0a0f] hover:border-indigo-500/30 text-gray-400 hover:text-white transition-all shrink-0"
                              title={`Download ${doc.title}`}
                            >
                              <Download className="h-3 w-3" />
                            </Link>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                )}
              </div>

              {/* Bottom CTA Button */}
              <div className="border-t border-indigo-500/5 pt-3 mt-4 text-left">
                {!hasValidatedStartup ? (
                  <button
                    onClick={() => navigate(isStep2Done ? '/startup/validate' : isStep1Done ? '/onboarding/details' : '/onboarding/role')}
                    className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 text-xs font-bold uppercase tracking-wider transition-all"
                  >
                    {isStep2Done ? 'Validate Idea' : 'Continue Onboarding'}
                    <ChevronRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => navigate('/roadmap')}
                    className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 text-xs font-bold uppercase tracking-wider transition-all"
                  >
                    Track Milestones
                    <ChevronRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

        </div>

      </div>
    </DashboardLayout>
  );
};

export default Dashboard;

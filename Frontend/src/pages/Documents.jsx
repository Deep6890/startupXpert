import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStartup } from '../context/StartupContext';
import { useToast } from '../context/ToastContext';
import DashboardLayout from '../layouts/DashboardLayout';
import { 
  FileText, 
  Download, 
  Sparkles, 
  Target, 
  TrendingUp, 
  Layers, 
  Info,
  ShieldCheck,
  CheckCircle2,
  FileSpreadsheet,
  X
} from 'lucide-react';
import jsPDF from 'jspdf';

const Documents = () => {
  const { user, startupDetails, analysisScores, roadmapNodes } = useStartup();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(null);
  const [previewDoc, setPreviewDoc] = useState(null);

  const hasValidatedStartup = !!startupDetails?.startupName && !!analysisScores && (roadmapNodes?.length || 0) > 0;

  if (!hasValidatedStartup) {
    return (
      <DashboardLayout activeTab="documents">
        <div className="flex flex-col items-center justify-center p-12 min-h-[60vh] text-center space-y-4 max-w-md mx-auto">
          <div className="h-16 w-16 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 animate-pulse">
            <FileText className="h-8 w-8" />
          </div>
          <h2 className="font-heading text-xl font-bold text-white">Documents Locked</h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            Complete startup validation to unlock startup documents.
          </p>
          <button
            onClick={() => navigate('/onboarding/role')}
            className="rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3.5 text-xs font-bold uppercase tracking-wider shadow-lg shadow-indigo-600/10 transition-all cursor-pointer"
          >
            Validate Startup Idea
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const startupName = startupDetails.startupName || 'Venture';
  const industry = startupDetails.startupDomain || 'SaaS';
  const stage = startupDetails.startupStage || 'Onboarding';

  // SWOT Generator dynamically matching validated startup details
  const getSwotData = () => {
    // Enhance strengths dynamically
    const strengths = [];
    if (analysisScores?.problemSolutionFit?.score > 70) {
      strengths.push(`Excellent problem-solution fit rated at ${analysisScores.problemSolutionFit.score}% viability.`);
    } else {
      strengths.push(`Clear value proposition focusing on: "${startupDetails.problemStatement?.substring(0, 75) || 'core user pain'}..."`);
    }
    if (analysisScores?.scalability?.score > 70) {
      strengths.push(`High scalability factor rated at ${analysisScores.scalability.score}%.`);
    }
    if (analysisScores?.feasibility?.score > 70) {
      strengths.push(`Strong operational feasibility score of ${analysisScores.feasibility.score}%.`);
    }
    strengths.push(`Targeted operational framework for the ${startupDetails.startupDomain || 'industry'} segment.`);

    // Enhance weaknesses dynamically
    const weaknesses = [];
    if (startupDetails.existingCompetitors) {
      weaknesses.push(`Direct competition with existing players: "${startupDetails.existingCompetitors.substring(0, 60)}".`);
    }
    if (startupDetails.availableFunding) {
      weaknesses.push(`Capital dependencies on a "${startupDetails.availableFunding}" funding setup.`);
    }
    if (startupDetails.monthlyBurnCapacity) {
      weaknesses.push(`Operational cash burn constraints capped at "${startupDetails.monthlyBurnCapacity}".`);
    }
    weaknesses.push(`Initial brand trust hurdles and lack of market validation history.`);

    // Enhance opportunities dynamically
    const opportunities = [];
    if (startupDetails.geographicMarket) {
      opportunities.push(`First-mover leverage in the "${startupDetails.geographicMarket}" market.`);
    }
    if (startupDetails.targetAudience) {
      opportunities.push(`Direct acquisition of key segments: "${startupDetails.targetAudience}".`);
    }
    if (startupDetails.revenueModel) {
      opportunities.push(`Expanding high-margin revenues through a "${startupDetails.revenueModel}" model.`);
    }
    opportunities.push(`Leveraging a rapid "${startupDetails.mvpTimeline || '3 months'}" MVP validation cycle.`);

    // Enhance threats dynamically
    const threats = [];
    if (analysisScores?.riskLevel?.score > 50) {
      threats.push(`Increased risk parameters rated with a ${analysisScores.riskLevel.status || 'Medium'} risk status.`);
    } else {
      threats.push(`Market entry barriers and defensive responses from legacy incumbents.`);
    }
    threats.push(`Evolving data privacy regulations in the ${startupDetails.startupDomain || 'industry'} domain.`);
    threats.push(`Potential customer churn if onboarding workflows introduce friction.`);

    return {
      strengths: strengths.slice(0, 4),
      weaknesses: weaknesses.slice(0, 4),
      opportunities: opportunities.slice(0, 4),
      threats: threats.slice(0, 4)
    };
  };

  // PDF Helper functions
  const drawBanner = (doc, title) => {
    doc.setFillColor(99, 102, 241); // Indigo Primary
    doc.rect(0, 0, 210, 20, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(title.toUpperCase(), 15, 13);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('STARTUPXPERT VENTURE OPERATING SYSTEM', 140, 13);
  };

  const drawFooter = (doc, pageNum) => {
    doc.setDrawColor(226, 232, 240);
    doc.line(15, 280, 195, 280);
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`Page ${pageNum}`, 190, 286, { align: 'right' });
    doc.text('CONFIDENTIAL - FOR AUTHORIZED PARTNERS ONLY', 15, 286);
  };

  const drawHeaderTitle = (doc, title, subtitle, y = 35) => {
    doc.setTextColor(15, 23, 42); // slate-900
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text(title, 15, y);
    
    doc.setTextColor(100, 116, 139); // slate-500
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(subtitle.toUpperCase(), 15, y + 5);

    doc.setDrawColor(99, 102, 241);
    doc.setLineWidth(0.8);
    doc.line(15, y + 9, 195, y + 9);
  };

  const wrapAndDrawText = (doc, text, x, y, maxWidth, lineHeight = 5) => {
    const lines = doc.splitTextToSize(text || 'Not specified.', maxWidth);
    lines.forEach((line, index) => {
      doc.text(line, x, y + (index * lineHeight));
    });
    return lines.length * lineHeight;
  };

  const drawSectionHeader = (doc, title, y) => {
    doc.setFillColor(241, 245, 249);
    doc.rect(15, y, 180, 8, 'F');
    doc.setTextColor(99, 102, 241);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(title.toUpperCase(), 20, y + 6);
    return y + 14;
  };

  const generatePDF = (docType) => {
    setIsGenerating(docType);
    showToast(`Compiling ${docType}...`, 'info');

    setTimeout(() => {
      try {
        const doc = new jsPDF();
        const currentDate = new Date().toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        });

        // ─── COVER PAGE (Page 1) ───
        doc.setFillColor(10, 10, 15); // Deep background for cover
        doc.rect(0, 0, 210, 297, 'F');

        // Decorative background elements
        doc.setFillColor(99, 102, 241, 0.1);
        doc.circle(200, 50, 80, 'F');
        doc.setFillColor(34, 211, 238, 0.05);
        doc.circle(10, 250, 100, 'F');

        // Title text
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(28);
        doc.text('STARTUPXPERT', 20, 90);
        
        doc.setDrawColor(99, 102, 241);
        doc.setLineWidth(2);
        doc.line(20, 97, 80, 97);

        doc.setTextColor(156, 163, 175);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(14);
        doc.text(docType.toUpperCase(), 20, 107);

        // Metadata block box
        doc.setFillColor(20, 20, 30);
        doc.rect(20, 160, 170, 70, 'F');
        
        doc.setDrawColor(99, 102, 241, 0.3);
        doc.setLineWidth(0.5);
        doc.rect(20, 160, 170, 70, 'S');

        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text('PROJECT NAME:', 30, 178);
        doc.setFont('helvetica', 'normal');
        doc.text(startupName, 75, 178);

        doc.setFont('helvetica', 'bold');
        doc.text('FOUNDER:', 30, 190);
        doc.setFont('helvetica', 'normal');
        doc.text(user.fullName || 'Innovator', 75, 190);

        doc.setFont('helvetica', 'bold');
        doc.text('INDUSTRY SEGMENT:', 30, 202);
        doc.setFont('helvetica', 'normal');
        doc.text(industry, 75, 202);

        doc.setFont('helvetica', 'bold');
        doc.text('GENERATION DATE:', 30, 214);
        doc.setFont('helvetica', 'normal');
        doc.text(currentDate, 75, 214);

        doc.setFontSize(9);
        doc.setTextColor(100, 116, 139);
        doc.text('POWERED BY THE STARTUPXPERT AI FEASIBILITY CORE', 20, 265);

        // ─── REPORT BODY (Page 2) ───
        doc.addPage();
        drawBanner(doc, docType);
        drawHeaderTitle(doc, startupName, `${docType} - Feasibility Report`, 35);
        
        let cursorY = 50;

        if (docType === 'Business Plan') {
          cursorY = drawSectionHeader(doc, '1. Executive Summary', cursorY);
          doc.setTextColor(71, 85, 105);
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          const summaryText = `This Business Plan outlines the feasibility and launch framework for ${startupName}, a venture focused on resolving major bottlenecks in the ${industry} domain. By employing automation and targeted market distributions, ${startupName} aims to provide a sustainable competitive advantage in its target geographic sectors.`;
          cursorY += wrapAndDrawText(doc, summaryText, 15, cursorY, 180) + 8;

          cursorY = drawSectionHeader(doc, '2. Core Value Proposition', cursorY);
          doc.setFont('helvetica', 'bold');
          doc.text('Problem Statement:', 15, cursorY);
          doc.setFont('helvetica', 'normal');
          cursorY += 5;
          cursorY += wrapAndDrawText(doc, startupDetails.problemStatement || 'Not specified during onboarding.', 15, cursorY, 180) + 8;

          doc.setFont('helvetica', 'bold');
          doc.text('Proposed Solution:', 15, cursorY);
          doc.setFont('helvetica', 'normal');
          cursorY += 5;
          cursorY += wrapAndDrawText(doc, startupDetails.startupDescription || 'Not specified during onboarding.', 15, cursorY, 180) + 8;

          cursorY = drawSectionHeader(doc, '3. Target Market & Model', cursorY);
          doc.setFont('helvetica', 'bold');
          doc.text('Target Audience: ', 15, cursorY);
          doc.setFont('helvetica', 'normal');
          doc.text(startupDetails.targetAudience || 'Not specified.', 50, cursorY);
          cursorY += 7;

          doc.setFont('helvetica', 'bold');
          doc.text('Business Model: ', 15, cursorY);
          doc.setFont('helvetica', 'normal');
          doc.text(startupDetails.revenueModel || 'Not specified.', 50, cursorY);
          cursorY += 7;

          doc.setFont('helvetica', 'bold');
          doc.text('Startup Stage: ', 15, cursorY);
          doc.setFont('helvetica', 'normal');
          doc.text(stage, 50, cursorY);
          cursorY += 10;
        } 
        
        else if (docType === 'Market Analysis') {
          cursorY = drawSectionHeader(doc, '1. Mapped Demographics', cursorY);
          doc.setTextColor(71, 85, 105);
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');

          doc.setFont('helvetica', 'bold');
          doc.text('Target Market Focus:', 15, cursorY);
          doc.setFont('helvetica', 'normal');
          doc.text(startupDetails.targetAudience || 'General niche users.', 60, cursorY);
          cursorY += 7;

          doc.setFont('helvetica', 'bold');
          doc.text('Geographic Coverage:', 15, cursorY);
          doc.setFont('helvetica', 'normal');
          doc.text(startupDetails.geographicMarket || 'Global/National digital.', 60, cursorY);
          cursorY += 10;

          cursorY = drawSectionHeader(doc, '2. Competitor Mappings', cursorY);
          doc.setFont('helvetica', 'bold');
          doc.text('Existing Competitors:', 15, cursorY);
          doc.setFont('helvetica', 'normal');
          cursorY += 5;
          cursorY += wrapAndDrawText(doc, startupDetails.existingCompetitors || 'No direct competitors listed.', 15, cursorY, 180) + 8;

          cursorY = drawSectionHeader(doc, '3. Addressable Market Projection (TAM/SAM)', cursorY);
          doc.setTextColor(71, 85, 105);
          const marketDemand = analysisScores?.marketDemand?.score || 80;
          
          doc.setFont('helvetica', 'bold');
          doc.text('Market Feasibility Indicator: ', 15, cursorY);
          doc.setFont('helvetica', 'normal');
          doc.text(`${marketDemand}% Demand Fit`, 65, cursorY);
          cursorY += 7;

          const marketAnalysisText = `Based on the ${marketDemand}% Market Demand validation score, the addressable B2B market for ${startupName} shows high willingness to adopt digitized workflows. In the target sector, customer segments report severe workflow friction indicating a strong initial niche entry strategy is highly viable.`;
          cursorY += wrapAndDrawText(doc, marketAnalysisText, 15, cursorY, 180) + 8;
        } 
        
        else if (docType === 'SWOT Analysis') {
          const swot = getSwotData();

          cursorY = drawSectionHeader(doc, 'Strengths (Internal Factors)', cursorY);
          doc.setTextColor(16, 185, 129); // emerald green
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(11);
          doc.text('[S] STRENGTHS', 15, cursorY);
          doc.setFontSize(10);
          doc.setTextColor(71, 85, 105);
          doc.setFont('helvetica', 'normal');
          cursorY += 5;
          swot.strengths.forEach((s) => {
            doc.text(`- ${s}`, 15, cursorY);
            cursorY += 6;
          });
          cursorY += 6;

          cursorY = drawSectionHeader(doc, 'Weaknesses (Internal Challenges)', cursorY);
          doc.setTextColor(244, 63, 94); // rose red
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(11);
          doc.text('[W] WEAKNESSES', 15, cursorY);
          doc.setFontSize(10);
          doc.setTextColor(71, 85, 105);
          doc.setFont('helvetica', 'normal');
          cursorY += 5;
          swot.weaknesses.forEach((w) => {
            doc.text(`- ${w}`, 15, cursorY);
            cursorY += 6;
          });
          cursorY += 6;

          cursorY = drawSectionHeader(doc, 'Opportunities (External Vectors)', cursorY);
          doc.setTextColor(99, 102, 241); // Indigo
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(11);
          doc.text('[O] OPPORTUNITIES', 15, cursorY);
          doc.setFontSize(10);
          doc.setTextColor(71, 85, 105);
          doc.setFont('helvetica', 'normal');
          cursorY += 5;
          swot.opportunities.forEach((o) => {
            doc.text(`- ${o}`, 15, cursorY);
            cursorY += 6;
          });
          cursorY += 6;

          cursorY = drawSectionHeader(doc, 'Threats (External Risks)', cursorY);
          doc.setTextColor(217, 119, 6); // amber
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(11);
          doc.text('[T] THREATS', 15, cursorY);
          doc.setFontSize(10);
          doc.setTextColor(71, 85, 105);
          doc.setFont('helvetica', 'normal');
          cursorY += 5;
          swot.threats.forEach((t) => {
            doc.text(`- ${t}`, 15, cursorY);
            cursorY += 6;
          });
          cursorY += 10;
        } 
        
        else if (docType === 'Revenue Model') {
          cursorY = drawSectionHeader(doc, '1. Revenue Streams Mappings', cursorY);
          doc.setFontSize(10);
          doc.setTextColor(71, 85, 105);

          doc.setFont('helvetica', 'bold');
          doc.text('Venture Revenue Model:', 15, cursorY);
          doc.setFont('helvetica', 'normal');
          doc.text(startupDetails.revenueModel || 'Not configured.', 60, cursorY);
          cursorY += 7;

          doc.setFont('helvetica', 'bold');
          doc.text('Estimated Target Pricing:', 15, cursorY);
          doc.setFont('helvetica', 'normal');
          doc.text(startupDetails.estimatedPricing || 'Not configured.', 60, cursorY);
          cursorY += 10;

          cursorY = drawSectionHeader(doc, '2. Operational Capital Projections', cursorY);
          doc.setFont('helvetica', 'bold');
          doc.text('Available Funding Pot:', 15, cursorY);
          doc.setFont('helvetica', 'normal');
          doc.text(startupDetails.availableFunding || 'Bootstrap resources.', 60, cursorY);
          cursorY += 7;

          doc.setFont('helvetica', 'bold');
          doc.text('Estimated Monthly Burn:', 15, cursorY);
          doc.setFont('helvetica', 'normal');
          doc.text(startupDetails.monthlyBurnCapacity || 'Minimal operational burn.', 60, cursorY);
          cursorY += 10;

          cursorY = drawSectionHeader(doc, '3. Stripe checkout SDK Integration', cursorY);
          const billingText = `The platform configures webhook checkout scripts to manage client subscription permissions automatically. Pro and Enterprise tiers set custom billing triggers inside database collections. Net revenue potential score stands at ${analysisScores?.revenuePotential?.score || 75}%.`;
          cursorY += wrapAndDrawText(doc, billingText, 15, cursorY, 180) + 10;
        } 
        
        else if (docType === 'Startup Roadmap Report') {
          cursorY = drawSectionHeader(doc, '1. Operational Progress Summary', cursorY);
          
          const totalTasks = roadmapNodes.reduce((acc, n) => acc + (n.tasks?.length || 0), 0);
          const completedTasks = roadmapNodes.reduce((acc, n) => acc + (n.tasks?.filter(t => t.completed).length || 0), 0);
          const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

          doc.setFontSize(10);
          doc.setTextColor(71, 85, 105);
          doc.setFont('helvetica', 'bold');
          doc.text('Overall Completion:', 15, cursorY);
          doc.setFont('helvetica', 'normal');
          doc.text(`${progressPercent}% checked`, 55, cursorY);
          cursorY += 7;

          doc.setFont('helvetica', 'bold');
          doc.text('Tasks Mapped:', 15, cursorY);
          doc.setFont('helvetica', 'normal');
          doc.text(`${completedTasks} completed out of ${totalTasks} tasks`, 55, cursorY);
          cursorY += 10;

          cursorY = drawSectionHeader(doc, '2. Dynamic Milestones Breakdown', cursorY);
          doc.setFontSize(9);
          roadmapNodes.forEach((node) => {
            if (cursorY > 250) {
              drawFooter(doc, 2);
              doc.addPage();
              drawBanner(doc, docType);
              cursorY = 35;
            }
            doc.setTextColor(15, 23, 42);
            doc.setFont('helvetica', 'bold');
            doc.text(`${node.title} [${node.status}]`, 15, cursorY);
            
            const nodeTasks = node.tasks || [];
            const doneNodeTasks = nodeTasks.filter(t => t.completed).length;
            doc.setTextColor(100, 116, 139);
            doc.setFont('helvetica', 'normal');
            doc.text(`- Tasks: ${doneNodeTasks}/${nodeTasks.length} done. Priority: ${node.priority || 'Medium'}`, 15, cursorY + 4);
            cursorY += 10;
          });
        } 
        
        else if (docType === 'Investor Summary') {
          cursorY = drawSectionHeader(doc, '1. Executive Venture Scores', cursorY);
          doc.setFontSize(10);
          doc.setTextColor(71, 85, 105);

          const feasibility = analysisScores?.feasibility?.score || 75;
          const risk = analysisScores?.riskLevel?.score || 35;
          const innovation = analysisScores?.innovationLevel?.score || 80;
          const readiness = Math.round((feasibility * 0.4) + ((100 - risk) * 0.3) + (innovation * 0.3));

          doc.setFont('helvetica', 'bold');
          doc.text('Startup Readiness Score: ', 15, cursorY);
          doc.setFont('helvetica', 'normal');
          doc.text(`${readiness}%`, 65, cursorY);
          cursorY += 7;

          doc.setFont('helvetica', 'bold');
          doc.text('Market Demand Feasibility: ', 15, cursorY);
          doc.setFont('helvetica', 'normal');
          doc.text(`${analysisScores?.marketDemand?.score || 80}%`, 65, cursorY);
          cursorY += 7;

          doc.setFont('helvetica', 'bold');
          doc.text('Risk Coefficient Index: ', 15, cursorY);
          doc.setFont('helvetica', 'normal');
          doc.text(`${risk}% (${analysisScores?.riskLevel?.status || 'Low'})`, 65, cursorY);
          cursorY += 10;

          cursorY = drawSectionHeader(doc, '2. Financial Summary', cursorY);
          doc.setFont('helvetica', 'bold');
          doc.text('Monthly Cash Burn Capacity:', 15, cursorY);
          doc.setFont('helvetica', 'normal');
          doc.text(startupDetails.monthlyBurnCapacity || 'Minimal overheads.', 70, cursorY);
          cursorY += 7;

          doc.setFont('helvetica', 'bold');
          doc.text('Required Funding Target:', 15, cursorY);
          doc.setFont('helvetica', 'normal');
          doc.text(startupDetails.availableFunding || 'Self-funded bootstrap.', 70, cursorY);
          cursorY += 10;

          cursorY = drawSectionHeader(doc, '3. Launch Recommendation', cursorY);
          const adviceText = `Based on the ${readiness}% Readiness Index, ${startupName} is primed to execute validation actions in the ${industry} domain. We suggest deploying the MVP immediately and testing B2B payment check conversion loops.`;
          cursorY += wrapAndDrawText(doc, adviceText, 15, cursorY, 180) + 10;
        }

        drawFooter(doc, 2);
        
        // Save PDF with correct file name format
        const cleanName = startupName.replace(/\s+/g, '_');
        let filename = `StartupXpert_${docType.replace(/\s+/g, '_')}_${cleanName}.pdf`;
        if (docType === 'Startup Roadmap Report') {
          filename = `StartupXpert_Roadmap_${cleanName}.pdf`;
        }
        
        doc.save(filename);
        setIsGenerating(null);
        showToast(`${docType} exported successfully.`, 'success');
      } catch (err) {
        console.error(err);
        setIsGenerating(null);
        showToast(`Failed to generate ${docType}.`, 'error');
      }
    }, 1500);
  };

  const documentCards = [
    {
      id: 'plan',
      title: 'Business Plan',
      desc: 'Standard executive outline detailing startup value proposition, problem space, target model, and launch milestones.',
      icon: FileText
    },
    {
      id: 'market',
      title: 'Market Analysis',
      desc: 'Breakdown of segment size, geographic target parameters, addressable TAM projections, and mapped competitors.',
      icon: Target
    },
    {
      id: 'swot',
      title: 'SWOT Analysis',
      desc: 'Dynamic matrix of internal Strengths and Weaknesses mapped against external Opportunities and Threats.',
      icon: Layers
    },
    {
      id: 'revenue',
      title: 'Revenue Model',
      desc: 'Pricing strategy details including package tiers mapping, payment webhooks, and billing funnel logic.',
      icon: TrendingUp
    },
    {
      id: 'roadmap_rep',
      title: 'Startup Roadmap Report',
      desc: 'Complete export of all interactive milestones including progress statuses, checked checklists tasks, and notes.',
      icon: FileSpreadsheet
    },
    {
      id: 'investor',
      title: 'Investor Summary',
      desc: 'One-page executive briefing summarizing stress-test scores, risk levels, burn ratios, and funding indicators.',
      icon: ShieldCheck
    }
  ];

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-indigo-500/5 pb-6 text-left">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">Document Center</span>
          <h1 className="font-heading text-3xl font-extrabold text-white mt-1">
            Startup Document Center
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Compile and generate professional PDF dossiers pulling from onboarding stress-tests and dynamic roadmap progress.
          </p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="rounded-2xl border border-indigo-500/10 bg-indigo-950/10 p-5 text-left flex items-start gap-4 shadow-sm backdrop-blur-md">
        <Info className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">Dynamic Compilation Engines Active</h4>
          <p className="text-xs text-gray-400 leading-relaxed">
            All files list real data inputs dynamically matched to your startup idea (**{startupName}** in **{industry}** domain). Regenerating validation checks will instantly refresh these document summaries.
          </p>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
        {documentCards.map((doc) => {
          const CardIcon = doc.icon;
          const isCurrentGen = isGenerating === doc.title;

          return (
            <div 
              key={doc.id}
              className="relative flex flex-col justify-between p-6 rounded-2xl border border-indigo-500/10 bg-[#0e0e16]/60 hover:bg-[#141420]/60 hover:border-indigo-500/30 shadow-md hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-300 group text-left"
            >
              <div className="space-y-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-indigo-500/20 bg-indigo-500/5 text-indigo-400 group-hover:scale-105 transition-transform duration-300">
                  <CardIcon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-wide uppercase">{doc.title}</h3>
                  <p className="text-[11px] text-gray-500 leading-relaxed mt-1">{doc.desc}</p>
                </div>
              </div>

              <div className="pt-6 border-t border-indigo-500/5 mt-4 grid grid-cols-2 gap-3">
                <button
                  onClick={() => setPreviewDoc(doc.title)}
                  className="w-full flex items-center justify-center gap-1 border border-indigo-500/20 bg-indigo-500/5 hover:bg-indigo-500/10 text-indigo-400 py-3 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                >
                  <Sparkles className="h-4 w-4" />
                  Preview
                </button>
                <button
                  onClick={() => generatePDF(doc.title)}
                  disabled={isGenerating !== null}
                  className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 disabled:opacity-50 text-white py-3 text-xs font-bold uppercase tracking-wider shadow-lg shadow-indigo-600/10 transition-all duration-300 cursor-pointer"
                >
                  {isCurrentGen ? (
                    <div className="h-4.5 w-4.5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  ) : (
                    <>
                      <Download className="h-4 w-4" />
                      PDF
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
      {/* Document Preview Overlay */}
      {previewDoc && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/65 backdrop-blur-sm p-4 animate-[fadeIn_0.2s_ease-out]">
          <div className="w-full max-w-2xl rounded-2xl border border-indigo-500/15 bg-[#0e0e16] p-6 shadow-2xl space-y-6 text-left relative max-h-[85vh] overflow-hidden flex flex-col justify-between">
            
            {/* Close Button */}
            <button 
              onClick={() => setPreviewDoc(null)}
              className="absolute right-4 top-4 h-8 w-8 flex items-center justify-center rounded-lg border border-indigo-500/10 bg-indigo-500/5 text-gray-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="space-y-1 border-b border-indigo-500/5 pb-4 shrink-0">
              <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase">Document Previewer</span>
              <h2 className="font-heading text-xl font-bold text-white tracking-wide">{previewDoc}</h2>
              <p className="text-xs text-gray-500">Live preview of dynamically compiled parameters for "{startupName}".</p>
            </div>

            <div className="flex-grow py-4 overflow-y-auto">
              {previewDoc === 'SWOT Analysis' && (() => {
                const swot = getSwotData();
                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4.5 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-left">
                      <h4 className="text-xs font-bold text-emerald-400 uppercase mb-2 flex items-center gap-1.5 font-mono">
                        <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                        [S] Strengths (Internal)
                      </h4>
                      <ul className="text-xs text-gray-300 space-y-2.5 list-disc pl-4 leading-relaxed">
                        {swot.strengths.map((s, i) => <li key={i}>{s}</li>)}
                      </ul>
                    </div>
                    <div className="p-4.5 rounded-xl bg-rose-950/20 border border-rose-500/20 text-left">
                      <h4 className="text-xs font-bold text-rose-400 uppercase mb-2 flex items-center gap-1.5 font-mono">
                        <span className="h-2 w-2 rounded-full bg-rose-500"></span>
                        [W] Weaknesses (Internal)
                      </h4>
                      <ul className="text-xs text-gray-300 space-y-2.5 list-disc pl-4 leading-relaxed">
                        {swot.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
                      </ul>
                    </div>
                    <div className="p-4.5 rounded-xl bg-indigo-950/20 border border-indigo-500/20 text-left">
                      <h4 className="text-xs font-bold text-indigo-400 uppercase mb-2 flex items-center gap-1.5 font-mono">
                        <span className="h-2 w-2 rounded-full bg-indigo-500"></span>
                        [O] Opportunities (External)
                      </h4>
                      <ul className="text-xs text-gray-300 space-y-2.5 list-disc pl-4 leading-relaxed">
                        {swot.opportunities.map((o, i) => <li key={i}>{o}</li>)}
                      </ul>
                    </div>
                    <div className="p-4.5 rounded-xl bg-amber-950/20 border border-amber-500/20 text-left">
                      <h4 className="text-xs font-bold text-amber-400 uppercase mb-2 flex items-center gap-1.5 font-mono">
                        <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                        [T] Threats (External)
                      </h4>
                      <ul className="text-xs text-gray-300 space-y-2.5 list-disc pl-4 leading-relaxed">
                        {swot.threats.map((t, i) => <li key={i}>{t}</li>)}
                      </ul>
                    </div>
                  </div>
                );
              })()}

              {previewDoc === 'Business Plan' && (
                <div className="space-y-4 text-left text-xs text-gray-300 leading-relaxed">
                  <div className="p-4 rounded-xl border border-indigo-500/5 bg-indigo-950/5">
                    <h4 className="font-bold text-white mb-1 font-heading text-sm">1. Executive Summary</h4>
                    <p>
                      This Business Plan outlines the feasibility and launch framework for {startupName}, a venture focused on resolving major bottlenecks in the {industry} domain. By employing automation and targeted market distributions, {startupName} aims to provide a sustainable competitive advantage in its target geographic sectors.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl border border-indigo-500/5 bg-indigo-950/5">
                    <h4 className="font-bold text-white mb-1 font-heading text-sm">2. Core Value Proposition</h4>
                    <p className="font-semibold text-indigo-400">Problem Statement:</p>
                    <p className="mb-2 italic">"{startupDetails.problemStatement || 'Not specified.'}"</p>
                    <p className="font-semibold text-indigo-400">Proposed Solution:</p>
                    <p>"{startupDetails.startupDescription || 'Not specified.'}"</p>
                  </div>
                </div>
              )}

              {previewDoc === 'Market Analysis' && (() => {
                const marketDemand = analysisScores?.marketDemand?.score || 80;
                return (
                  <div className="space-y-4 text-left text-xs text-gray-300 leading-relaxed">
                    <div className="p-4 rounded-xl border border-indigo-500/5 bg-indigo-950/5">
                      <h4 className="font-bold text-white mb-1 font-heading text-sm">1. Geographic &amp; ICP Target</h4>
                      <p>Primary launch territory is set in <strong>{startupDetails.geographicMarket || 'unspecified geographic areas'}</strong>, targeting <strong>{startupDetails.targetAudience || 'niche audiences'}</strong>.</p>
                    </div>
                    <div className="p-4 rounded-xl border border-indigo-500/5 bg-indigo-950/5">
                      <h4 className="font-bold text-white mb-1 font-heading text-sm">2. Competitor Mappings</h4>
                      <p>Rivals tracked: <strong>{startupDetails.existingCompetitors || 'unlisted competitors'}</strong>.</p>
                    </div>
                    <div className="p-4 rounded-xl border border-indigo-500/5 bg-indigo-950/5">
                      <h4 className="font-bold text-white mb-1 font-heading text-sm">3. Market Feasibility Indicator</h4>
                      <p>Market Demand Fit: <strong>{marketDemand}%</strong>. Based on this validation score, the addressable market for {startupName} shows strong demand indices.</p>
                    </div>
                  </div>
                );
              })()}

              {previewDoc === 'Revenue Model' && (
                <div className="space-y-4 text-left text-xs text-gray-300 leading-relaxed">
                  <div className="p-4 rounded-xl border border-indigo-500/5 bg-indigo-950/5">
                    <h4 className="font-bold text-white mb-1 font-heading text-sm">1. Monetization Schemes</h4>
                    <p>Model format is <strong>{startupDetails.revenueModel || 'unspecified revenue streams'}</strong> with an estimated target pricing of <strong>{startupDetails.estimatedPricing || 'unconfigured pricing'}</strong>.</p>
                  </div>
                  <div className="p-4 rounded-xl border border-indigo-500/5 bg-indigo-950/5">
                    <h4 className="font-bold text-white mb-1 font-heading text-sm">2. Financial Capacity</h4>
                    <p>Available funding pot is <strong>{startupDetails.availableFunding || 'bootstrap cash'}</strong> with an estimated monthly cash burn limit of <strong>{startupDetails.monthlyBurnCapacity || 'minimal overheads'}</strong>.</p>
                  </div>
                </div>
              )}

              {previewDoc === 'Startup Roadmap Report' && (() => {
                const totalT = roadmapNodes.reduce((acc, n) => acc + (n.tasks?.length || 0), 0);
                const completedT = roadmapNodes.reduce((acc, n) => acc + (n.tasks?.filter(t => t.completed).length || 0), 0);
                const progressP = totalT > 0 ? Math.round((completedT / totalT) * 100) : 0;
                return (
                  <div className="space-y-4 text-left text-xs text-gray-300 leading-relaxed">
                    <div className="p-4 rounded-xl border border-indigo-500/5 bg-indigo-950/5 flex items-center justify-between">
                      <div>
                        <p>Overall Roadmap Completion: <strong>{progressP}%</strong></p>
                        <p className="text-[11px] text-gray-500">{completedT} completed of {totalT} tasks logged.</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-bold text-white px-1 font-heading text-sm">Milestones Tracks Mapped</h4>
                      <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
                        {roadmapNodes.map(node => (
                          <div key={node.id} className="p-2.5 rounded-lg border border-indigo-500/5 bg-indigo-950/10 flex items-center justify-between gap-3">
                            <span className="font-semibold text-white truncate max-w-[60%]">{node.title}</span>
                            <span className={`text-[10px] font-bold uppercase ${
                              node.status === 'Completed' ? 'text-emerald-400' : node.status === 'In Progress' ? 'text-indigo-400' : 'text-gray-500'
                            }`}>{node.status}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {previewDoc === 'Investor Summary' && (() => {
                const feasibility = analysisScores?.feasibility?.score || 75;
                const risk = analysisScores?.riskLevel?.score || 35;
                const innovation = analysisScores?.innovationLevel?.score || 80;
                const readiness = Math.round((feasibility * 0.4) + ((100 - risk) * 0.3) + (innovation * 0.3));
                return (
                  <div className="space-y-4 text-left text-xs text-gray-300 leading-relaxed">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-3 rounded-xl border border-indigo-500/5 bg-indigo-950/5 text-center">
                        <span className="text-[9px] text-gray-500 block uppercase font-mono">READINESS</span>
                        <span className="text-lg font-bold text-indigo-400 font-mono">{readiness}%</span>
                      </div>
                      <div className="p-3 rounded-xl border border-indigo-500/5 bg-indigo-950/5 text-center">
                        <span className="text-[9px] text-gray-500 block uppercase font-mono">FEASIBILITY</span>
                        <span className="text-lg font-bold text-emerald-400 font-mono">{feasibility}%</span>
                      </div>
                      <div className="p-3 rounded-xl border border-indigo-500/5 bg-indigo-950/5 text-center">
                        <span className="text-[9px] text-gray-500 block uppercase font-mono">RISK INDEX</span>
                        <span className="text-lg font-bold text-rose-400 font-mono">{risk}%</span>
                      </div>
                    </div>
                    <div className="p-4 rounded-xl border border-indigo-500/5 bg-indigo-950/5">
                      <h4 className="font-bold text-white mb-1 font-heading text-sm">Launch Feasibility Recommendation</h4>
                      <p>Based on the {readiness}% Readiness Index, {startupName} is primed to execute validation actions. We suggest deploying the MVP immediately and testing B2B payment check conversion loops.</p>
                    </div>
                  </div>
                );
              })()}
            </div>

            <div className="border-t border-indigo-500/5 pt-4 flex justify-end shrink-0">
              <button
                onClick={() => setPreviewDoc(null)}
                className="rounded-xl border border-indigo-500/20 bg-[#0a0a0f] px-5 py-3 text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-white transition-all cursor-pointer"
              >
                Close Preview
              </button>
            </div>

          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Documents;

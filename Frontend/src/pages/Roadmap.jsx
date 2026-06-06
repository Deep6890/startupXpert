import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  MarkerType,
  Handle,
  Position,
  ReactFlowProvider,
  useReactFlow
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useNavigate } from 'react-router-dom';
import { useStartup } from '../context/StartupContext';
import { useToast } from '../context/ToastContext';
import DashboardLayout from '../layouts/DashboardLayout';
import { 
  Plus, 
  Trash2, 
  Compass, 
  ChevronRight, 
  X, 
  Check, 
  AlertCircle, 
  FileText, 
  Sparkles, 
  Calendar,
  Save,
  Download,
  PlusCircle,
  Clock,
  Briefcase
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Custom Node Component to render Milestone details inside React Flow
const CustomRoadmapNode = ({ data }) => {
  const isRoot = data.id === 'root';
  
  // Status dot colors
  let statusColorClass = 'bg-gray-500';
  let borderClass = 'border-indigo-500/10 shadow-[0_0_15px_rgba(99,102,241,0.02)]';
  if (data.status === 'Completed') {
    statusColorClass = 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]';
    borderClass = 'border-emerald-500/30';
  } else if (data.status === 'In Progress') {
    statusColorClass = 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.4)]';
    borderClass = 'border-indigo-500/35';
  } else if (data.status === 'Blocked') {
    statusColorClass = 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]';
    borderClass = 'border-rose-500/30';
  }

  return (
    <div 
      onClick={data.onClick}
      className={`px-4 py-3 rounded-lg border bg-[#0e0e16]/90 backdrop-blur-md transition-all duration-300 min-w-[190px] text-left relative cursor-pointer hover:scale-[1.02] hover:bg-[#141420]/90 hover:border-indigo-500/50 shadow-md hover:shadow-lg hover:shadow-indigo-500/5 select-none ${borderClass}`}
    >
      {/* Target handle on the left (only if not root) */}
      {!isRoot && (
        <Handle 
          type="target" 
          position={Position.Left} 
          style={{ background: '#6366f1', width: '6px', height: '6px', border: '1px solid #0e0e16' }} 
        />
      )}

      {/* Main Node Content */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 max-w-[130px] truncate">
          {/* Status Dot */}
          <span className={`h-2 w-2 rounded-full shrink-0 ${statusColorClass}`} title={`Status: ${data.status}`}></span>
          <span className="text-xs font-bold text-white tracking-wide truncate">
            {data.title}
          </span>
        </div>
        
        {/* Progress % */}
        <span className="text-[10px] font-mono text-indigo-400 font-semibold shrink-0">
          {Math.round(data.progress)}%
        </span>
      </div>

      {/* Expander target on the right (only if node has children) */}
      {data.hasChildren && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            data.onToggleExpand();
          }}
          className="absolute -right-2 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-full border border-indigo-500/30 bg-[#0e0e16] hover:bg-indigo-600 hover:text-white text-indigo-400 text-[10px] font-bold shadow-sm transition-all z-20 focus:outline-none"
        >
          {data.isExpanded ? '−' : '+'}
        </button>
      )}

      {/* Source handle on the right */}
      <Handle 
        type="source" 
        position={Position.Right} 
        style={{ background: '#6366f1', width: '6px', height: '6px', border: '1px solid #0e0e16' }} 
      />
    </div>
  );
};

// Node registrations
const nodeTypes = {
  roadmapNode: CustomRoadmapNode
};

// FitView Control button inside ReactFlow canvas context
const FitViewButton = () => {
  const { fitView } = useReactFlow();
  return (
    <button
      onClick={() => fitView({ duration: 800, padding: 0.2 })}
      className="absolute top-4 right-4 z-10 flex items-center gap-1.5 rounded-lg border border-indigo-500/15 bg-[#0e0e16]/90 hover:bg-indigo-600 hover:text-white text-indigo-400 text-2xs font-bold uppercase tracking-wider px-3.5 py-2 transition-all shadow-md focus:outline-none cursor-pointer"
      title="Fit view to center roadmap milestones"
    >
      <Compass className="h-3.5 w-3.5 animate-pulse" />
      Fit View
    </button>
  );
};

const Roadmap = () => {
  const { 
    user,
    startupDetails, 
    analysisScores,
    roadmapNodes,
    updateRoadmapNode,
    addRoadmapNode,
    deleteRoadmapNode,
    manageSubTask,
    manageNote
  } = useStartup();
  
  const { showToast } = useToast();
  const navigate = useNavigate();

  const hasValidatedStartup = !!startupDetails?.startupName && !!analysisScores && (roadmapNodes?.length || 0) > 0;

  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [newTaskText, setNewTaskText] = useState('');
  const [newNoteText, setNewNoteText] = useState('');

  if (!hasValidatedStartup) {
    return (
      <DashboardLayout activeTab="roadmap">
        <div className="flex flex-col items-center justify-center p-12 min-h-[60vh] text-center space-y-4 max-w-md mx-auto">
          <div className="h-16 w-16 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 animate-pulse">
            <Compass className="h-8 w-8" />
          </div>
          <h2 className="font-heading text-xl font-bold text-white">Roadmap Locked</h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            Complete startup validation to generate your personalized roadmap.
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
  
  // Custom child addition state
  const [childTitle, setChildTitle] = useState('');
  const [childDesc, setChildDesc] = useState('');

  // Find active selected node
  const activeNode = useMemo(() => {
    return roadmapNodes.find(node => node.id === selectedNodeId) || null;
  }, [roadmapNodes, selectedNodeId]);

  // Layout algorithm helper: computes coordinates based on parent-child tree mapping
  const getLayoutedElements = useCallback((nodes) => {
    const parentMap = {};
    nodes.forEach(n => {
      if (n.parentId) {
        if (!parentMap[n.parentId]) parentMap[n.parentId] = [];
        parentMap[n.parentId].push(n);
      }
    });

    const rootNode = nodes.find(n => n.parentId === null || n.parentId === undefined);
    if (!rootNode) return nodes;

    const positions = {};
    positions[rootNode.id] = { x: 50, y: 280 };

    const positionChildren = (parentId, startX, startY) => {
      const children = parentMap[parentId] || [];
      if (children.length === 0) return;

      const spacingY = 160;
      const totalHeight = (children.length - 1) * spacingY;
      const initialY = startY - totalHeight / 2;

      children.forEach((child, index) => {
        const childX = startX + 280;
        const childY = initialY + (index * spacingY);
        positions[child.id] = { x: childX, y: childY };
        positionChildren(child.id, childX, childY);
      });
    };

    positionChildren(rootNode.id, 50, 280);

    return nodes.map(node => {
      const pos = positions[node.id] || { x: 100, y: 100 };
      return {
        ...node,
        position: pos
      };
    });
  }, []);

  // Filter visible nodes/edges by traversing branch expansions
  const elements = useMemo(() => {
    // Find collapsed nodes
    const collapsedNodeIds = new Set(roadmapNodes.filter(n => n.isExpanded === false).map(n => n.id));
    
    // Recursive search for descendants
    const getDescendants = (parentId) => {
      const children = roadmapNodes.filter(n => n.parentId === parentId);
      let ids = children.map(c => c.id);
      children.forEach(c => {
        ids = [...ids, ...getDescendants(c.id)];
      });
      return ids;
    };

    const hiddenNodeIds = new Set();
    collapsedNodeIds.forEach(id => {
      getDescendants(id).forEach(descId => hiddenNodeIds.add(descId));
    });

    const visibleNodes = roadmapNodes.filter(node => !hiddenNodeIds.has(node.id));
    const layoutedNodes = getLayoutedElements(visibleNodes);

    // React Flow Node Maps
    const rfNodes = layoutedNodes.map(node => {
      const totalTasks = node.tasks?.length || 0;
      const completedTasks = node.tasks?.filter(t => t.completed).length || 0;
      const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

      return {
        id: node.id,
        type: 'roadmapNode',
        position: node.position,
        data: {
          id: node.id,
          title: node.title,
          description: node.description,
          status: node.status,
          priority: node.priority,
          progress: progress,
          isExpanded: node.isExpanded,
          hasChildren: roadmapNodes.some(n => n.parentId === node.id),
          tasksCount: totalTasks,
          completedCount: completedTasks,
          onToggleExpand: () => {
            updateRoadmapNode(node.id, { isExpanded: !node.isExpanded });
          },
          onClick: () => {
            setSelectedNodeId(node.id);
            setIsDrawerOpen(true);
          }
        }
      };
    });

    // React Flow Edge Maps
    const rfEdges = visibleNodes
      .filter(node => node.parentId !== null && node.parentId !== undefined)
      .map(node => ({
        id: `edge-${node.parentId}-${node.id}`,
        source: node.parentId,
        target: node.id,
        type: 'smoothstep',
        animated: node.status === 'In Progress',
        style: { 
          stroke: node.status === 'Completed' 
            ? '#10b981' 
            : node.status === 'In Progress' 
              ? '#6366f1' 
              : 'rgba(99, 102, 241, 0.2)',
          strokeWidth: 2
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: node.status === 'Completed' 
            ? '#10b981' 
            : node.status === 'In Progress' 
              ? '#6366f1' 
              : 'rgba(99, 102, 241, 0.2)'
        }
      }));

    return { nodes: rfNodes, edges: rfEdges };
  }, [roadmapNodes, updateRoadmapNode, getLayoutedElements]);

  // Handle tasks operations inside details drawer
  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    manageSubTask(selectedNodeId, 'add', { text: newTaskText });
    setNewTaskText('');
    showToast('Sub-task added.', 'success');
  };

  const handleToggleTask = (taskId) => {
    manageSubTask(selectedNodeId, 'toggle', { id: taskId });
  };

  const handleDeleteTask = (taskId) => {
    manageSubTask(selectedNodeId, 'delete', { id: taskId });
    showToast('Sub-task deleted.', 'info');
  };

  // Handle notes operations inside details drawer
  const handleAddNote = (e) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    manageNote(selectedNodeId, 'add', { text: newNoteText });
    setNewNoteText('');
    showToast('Note saved.', 'success');
  };

  const handleDeleteNote = (noteId) => {
    manageNote(selectedNodeId, 'delete', { id: noteId });
    showToast('Note deleted.', 'info');
  };

  // Handle custom child creation
  const handleAddChildNode = (e) => {
    e.preventDefault();
    if (!childTitle.trim()) {
      showToast('Title is required to create a child milestone.', 'error');
      return;
    }
    addRoadmapNode(selectedNodeId, childTitle, childDesc);
    setChildTitle('');
    setChildDesc('');
  };

  // Handle node delete operation
  const handleDeleteNodeClick = () => {
    if (selectedNodeId === 'root') {
      showToast('Cannot delete the root Startup Launchpad node.', 'error');
      return;
    }
    const nodeTitle = activeNode?.title || 'Milestone';
    deleteRoadmapNode(selectedNodeId);
    setIsDrawerOpen(false);
    setSelectedNodeId(null);
  };

  // Trigger manual repositioning of the nodes
  const triggerAutoLayout = () => {
    showToast('Running tree positioning auto-layout...', 'info');
  };

  // PDF report builder module using jsPDF and html2canvas
  const handleGeneratePDF = async () => {
    if (!roadmapNodes || roadmapNodes.length === 0) {
      showToast('No roadmap milestones available to generate PDF.', 'error');
      return;
    }

    try {
      showToast('Preparing Roadmap PDF...', 'info');

      let canvasImgData = null;
      try {
        // Select React Flow viewport element
        const canvasElement = document.querySelector('.react-flow__viewport') || document.querySelector('.react-flow');
        if (canvasElement) {
          // Temporarily hide controls & overlays for screenshot purity
          const controls = document.querySelector('.react-flow__controls');
          const minimap = document.querySelector('.react-flow__minimap');
          if (controls) controls.style.display = 'none';
          if (minimap) minimap.style.display = 'none';

          const canvas = await html2canvas(canvasElement, {
            backgroundColor: '#0a0a0f',
            logging: false,
            useCORS: true,
            scale: 1.5 // High resolution scale
          });

          // Restore UI elements
          if (controls) controls.style.display = '';
          if (minimap) minimap.style.display = '';

          canvasImgData = canvas.toDataURL('image/png');
        }
      } catch (screenshotError) {
        console.warn('Could not capture canvas screenshot, generating text-only report.', screenshotError);
      }

      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // PAGE 1: COVER PAGE
      doc.setFillColor(10, 10, 15);
      doc.rect(0, 0, pageWidth, pageHeight, 'F');

      // Header Accent line
      doc.setDrawColor(99, 102, 241);
      doc.setLineWidth(1.5);
      doc.line(20, 40, pageWidth - 20, 40);

      // App Brand Logo
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(28);
      doc.setTextColor(255, 255, 255);
      doc.text('StartupXpert', 20, 30);
      doc.setFontSize(14);
      doc.setTextColor(99, 102, 241);
      doc.text('MILESTONE ROADMAP REPORT', 20, 37);

      // Startup Name & Title
      doc.setFontSize(36);
      doc.setTextColor(255, 255, 255);
      const startupName = startupDetails.startupName || 'Venture Proposal';
      doc.text(startupName, 20, 100);

      // Metadata info table
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(12);
      doc.setTextColor(156, 163, 175);
      doc.text('FOUNDER:', 20, 140);
      doc.setTextColor(255, 255, 255);
      doc.setFont('Helvetica', 'bold');
      doc.text(user.fullName || 'Innovator', 70, 140);

      doc.setFont('Helvetica', 'normal');
      doc.setTextColor(156, 163, 175);
      doc.text('STARTUP STAGE:', 20, 152);
      doc.setTextColor(255, 255, 255);
      doc.setFont('Helvetica', 'bold');
      doc.text(startupDetails.startupStage || 'Validation', 70, 152);

      doc.setFont('Helvetica', 'normal');
      doc.setTextColor(156, 163, 175);
      doc.text('GENERATION DATE:', 20, 164);
      doc.setTextColor(255, 255, 255);
      doc.setFont('Helvetica', 'bold');
      doc.text(new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      }), 70, 164);

      // Verification Badge card
      doc.setFillColor(99, 102, 241, 0.05);
      doc.setDrawColor(99, 102, 241, 0.2);
      doc.rect(20, 200, pageWidth - 40, 40, 'FD');
      doc.setFontSize(14);
      doc.setTextColor(255, 255, 255);
      doc.text('AI Feasibility Score Verified', 30, 214);
      doc.setFontSize(10.5);
      doc.setTextColor(156, 163, 175);
      doc.text('This roadmap was generated dynamically by StartupXpert, combining stress-tested', 30, 223);
      doc.text('market parameters, competitor positions, and cash-flow vectors.', 30, 229);

      // Footer
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(75, 85, 99);
      doc.text('© StartupXpert v1.0.0 Stable Release', 20, pageHeight - 15);


      // PAGE 2: STARTUP SUMMARY & VISUAL SNAPSHOT
      doc.addPage();
      doc.setFillColor(10, 10, 15);
      doc.rect(0, 0, pageWidth, pageHeight, 'F');

      // Title header
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(18);
      doc.setTextColor(255, 255, 255);
      doc.text('Venture Summary & Progress', 20, 25);
      doc.setDrawColor(99, 102, 241, 0.2);
      doc.setLineWidth(0.5);
      doc.line(20, 29, pageWidth - 20, 29);

      // Summary columns (Left col text, right col metrics)
      doc.setFontSize(10);
      doc.setTextColor(156, 163, 175);
      doc.text('STARTUP IDEA:', 20, 40);
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(11);
      const ideaLines = doc.splitTextToSize(startupDetails.startupDescription || 'N/A', (pageWidth / 2) - 25);
      doc.text(ideaLines, 20, 46);

      const ideaHeight = ideaLines.length * 5;
      const problemY = 46 + ideaHeight + 8;
      
      doc.setFontSize(10);
      doc.setTextColor(156, 163, 175);
      doc.text('PROBLEM STATEMENT:', 20, problemY);
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(11);
      const problemLines = doc.splitTextToSize(startupDetails.problemStatement || 'N/A', (pageWidth / 2) - 25);
      doc.text(problemLines, 20, problemY + 6);

      const problemHeight = problemLines.length * 5;
      const audienceY = problemY + 6 + problemHeight + 8;

      doc.setFontSize(10);
      doc.setTextColor(156, 163, 175);
      doc.text('TARGET AUDIENCE:', 20, audienceY);
      doc.setTextColor(255, 255, 255);
      doc.text(startupDetails.targetAudience || 'N/A', 20, audienceY + 6);

      // Right col scores & stats
      const rightColX = (pageWidth / 2) + 10;
      doc.setFontSize(10);
      doc.setTextColor(156, 163, 175);
      doc.text('FEASIBILITY SCORES:', rightColX, 40);

      doc.setFillColor(20, 20, 30);
      doc.rect(rightColX, 45, (pageWidth / 2) - 30, 45, 'F');
      
      doc.setFontSize(12);
      doc.setTextColor(255, 255, 255);
      doc.text('Market Feasibility Index:', rightColX + 5, 55);
      doc.setFontSize(18);
      doc.setTextColor(99, 102, 241);
      doc.text(`${analysisScores?.feasibility?.score || 72}/100`, rightColX + 5, 63);

      doc.setFontSize(12);
      doc.setTextColor(255, 255, 255);
      doc.text('Venture Risk Assessment:', rightColX + 5, 75);
      doc.setFontSize(18);
      doc.setTextColor(239, 68, 68);
      doc.text(analysisScores?.riskLevel?.status || 'Medium', rightColX + 5, 83);

      // Calculate progress stats
      const totalRoadmapTasks = roadmapNodes.reduce((acc, node) => acc + (node.tasks?.length || 0), 0);
      const completedRoadmapTasks = roadmapNodes.reduce((acc, node) => acc + (node.tasks?.filter(t => t.completed).length || 0), 0);
      const overallProgress = totalRoadmapTasks > 0 ? Math.round((completedRoadmapTasks / totalRoadmapTasks) * 100) : 0;

      const inProgressNodes = roadmapNodes.filter(n => n.status === 'In Progress');
      const currentMilestone = inProgressNodes.length > 0 ? inProgressNodes[0].title : 'Product Planning';
      const pendingNodes = roadmapNodes.filter(n => n.status === 'Pending');
      const nextMilestone = pendingNodes.length > 0 ? pendingNodes[0].title : 'Growth & Scaling';

      doc.setFontSize(10);
      doc.setTextColor(156, 163, 175);
      doc.text('ROADMAP COMPLETION:', rightColX, 100);
      doc.setFontSize(18);
      doc.setTextColor(16, 185, 129);
      doc.text(`${overallProgress}% Completed`, rightColX, 108);

      doc.setFontSize(10);
      doc.setTextColor(156, 163, 175);
      doc.text('CURRENT MILESTONE:', rightColX, 118);
      doc.setFontSize(11);
      doc.setTextColor(255, 255, 255);
      doc.text(currentMilestone, rightColX, 124);

      doc.setFontSize(10);
      doc.setTextColor(156, 163, 175);
      doc.text('NEXT UPCOMING MILESTONE:', rightColX, 134);
      doc.setFontSize(11);
      doc.setTextColor(255, 255, 255);
      doc.text(nextMilestone, rightColX, 140);

      if (canvasImgData) {
        // Visual mind map tree box
        doc.setFontSize(14);
        doc.setTextColor(255, 255, 255);
        doc.text('Visual Roadmap Tree Snapshot', 20, 160);
        doc.setDrawColor(99, 102, 241, 0.2);
        doc.rect(20, 165, pageWidth - 40, 95, 'D');

        // Snapshot capture image
        doc.addImage(canvasImgData, 'PNG', 22, 167, pageWidth - 44, 91);
      } else {
        // Fallback warning text
        doc.setFontSize(12);
        doc.setTextColor(156, 163, 175);
        doc.text('Venture milestone stages compiled: check text logs on pages 3+.', 20, 170);
      }


      // PAGES 3+: DETAILED ROADMAP STAGES
      roadmapNodes.forEach((node) => {
        doc.addPage();
        doc.setFillColor(10, 10, 15);
        doc.rect(0, 0, pageWidth, pageHeight, 'F');

        // Stage Title
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(18);
        doc.setTextColor(255, 255, 255);
        doc.text(node.title, 20, 25);

        // Metadata badges in line
        doc.setFontSize(10);
        doc.setTextColor(156, 163, 175);
        doc.text(`Status: `, 20, 33);
        doc.setFont('Helvetica', 'bold');
        
        let statusR = 156, statusG = 163, statusB = 175;
        if (node.status === 'Completed') {
          statusR = 16; statusG = 185; statusB = 129;
        } else if (node.status === 'In Progress') {
          statusR = 99; statusG = 102; statusB = 241;
        }
        doc.setTextColor(statusR, statusG, statusB);
        doc.text(node.status, 35, 33);

        doc.setFont('Helvetica', 'normal');
        doc.setTextColor(156, 163, 175);
        doc.text(` | Priority: `, 55, 33);
        doc.setFont('Helvetica', 'bold');
        
        let priorityR = 156, priorityG = 163, priorityB = 175;
        if (node.priority === 'High') {
          priorityR = 239; priorityG = 68; priorityB = 68;
        } else if (node.priority === 'Medium') {
          priorityR = 245; priorityG = 158; priorityB = 11;
        }
        doc.setTextColor(priorityR, priorityG, priorityB);
        doc.text(node.priority, 72, 33);

        const nodeTasks = node.tasks || [];
        const completedTasks = nodeTasks.filter(t => t.completed).length;
        const progressPercent = nodeTasks.length > 0 ? Math.round((completedTasks / nodeTasks.length) * 100) : 0;

        doc.setFont('Helvetica', 'normal');
        doc.setTextColor(156, 163, 175);
        doc.text(` | Progress: `, 95, 33);
        doc.setFont('Helvetica', 'bold');
        doc.setTextColor(16, 185, 129);
        doc.text(`${progressPercent}%`, 115, 33);

        doc.setDrawColor(99, 102, 241, 0.2);
        doc.setLineWidth(0.5);
        doc.line(20, 37, pageWidth - 20, 37);

        // Description
        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(11);
        doc.setTextColor(209, 213, 219);
        const descLines = doc.splitTextToSize(node.description || 'No description provided.', pageWidth - 40);
        doc.text(descLines, 20, 46);

        const descHeight = descLines.length * 6;
        let runningY = 46 + descHeight + 10;

        // Subtasks Checklist
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(255, 255, 255);
        doc.text('Tasks Checklist', 20, runningY);
        doc.setLineWidth(0.2);
        doc.line(20, runningY + 2, pageWidth - 20, runningY + 2);
        runningY += 8;

        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(10.5);
        if (nodeTasks.length > 0) {
          nodeTasks.forEach((t) => {
            doc.setDrawColor(99, 102, 241);
            doc.rect(20, runningY - 3, 3.5, 3.5, 'D');
            if (t.completed) {
              doc.setFillColor(16, 185, 129);
              doc.rect(20.5, runningY - 2.5, 2.5, 2.5, 'F');
              doc.setTextColor(16, 185, 129);
            } else {
              doc.setTextColor(209, 213, 219);
            }
            doc.text(t.text, 28, runningY);
            runningY += 7;
          });
        } else {
          doc.setTextColor(156, 163, 175);
          doc.text('No tasks assigned to this stage.', 20, runningY);
          runningY += 7;
        }

        runningY += 6;

        // Milestone Notes
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(255, 255, 255);
        doc.text('Milestone Notes Log', 20, runningY);
        doc.line(20, runningY + 2, pageWidth - 20, runningY + 2);
        runningY += 8;

        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(10);
        const nodeNotes = node.notes || [];
        if (nodeNotes.length > 0) {
          nodeNotes.forEach((n) => {
            doc.setTextColor(156, 163, 175);
            const dateStr = new Date(n.timestamp).toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit'
            });
            doc.text(`[${dateStr}]`, 20, runningY);
            doc.setTextColor(209, 213, 219);
            
            const noteLines = doc.splitTextToSize(n.text, pageWidth - 70);
            doc.text(noteLines, 52, runningY);
            runningY += (noteLines.length * 5) + 3;
          });
        } else {
          doc.setTextColor(156, 163, 175);
          doc.text('No notes logged for this milestone.', 20, runningY);
          runningY += 7;
        }

        runningY += 6;

        // AI Recommendations
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(99, 102, 241);
        doc.text('AI Recommendations & Action Plan', 20, runningY);
        doc.setDrawColor(99, 102, 241, 0.4);
        doc.line(20, runningY + 2, pageWidth - 20, runningY + 2);
        runningY += 8;

        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(209, 213, 219);
        const recLines = doc.splitTextToSize(node.recommendations || 'Prepare milestones validation sheets.', pageWidth - 40);
        doc.text(recLines, 20, runningY);
      });


      // LAST PAGE: FINAL SUMMARY
      doc.addPage();
      doc.setFillColor(10, 10, 15);
      doc.rect(0, 0, pageWidth, pageHeight, 'F');

      // Title
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(22);
      doc.setTextColor(255, 255, 255);
      doc.text('Roadmap Review & Readiness Summary', 20, 30);
      doc.setDrawColor(99, 102, 241, 0.3);
      doc.line(20, 35, pageWidth - 20, 35);

      let reviewY = 55;
      
      // Card 1: Readiness Score
      doc.setFillColor(20, 20, 30);
      doc.rect(20, reviewY, pageWidth - 40, 35, 'F');
      
      doc.setFontSize(13);
      doc.setTextColor(255, 255, 255);
      doc.text('Startup Readiness Score:', 30, reviewY + 12);
      doc.setFontSize(18);
      doc.setTextColor(99, 102, 241);
      const readiness = Math.round(((analysisScores?.feasibility?.score || 72) + overallProgress) / 2);
      doc.text(`${readiness} / 100`, 30, reviewY + 25);
      
      doc.setFontSize(10);
      doc.setTextColor(156, 163, 175);
      doc.text('Calculated based on validation stress-tests and executed roadmap tracks.', 100, reviewY + 20);

      reviewY += 45;

      // Card 2: Roadmap Completion Rate
      doc.setFillColor(20, 20, 30);
      doc.rect(20, reviewY, pageWidth - 40, 35, 'F');
      
      doc.setFontSize(13);
      doc.setTextColor(255, 255, 255);
      doc.text('Roadmap Completion Rate:', 30, reviewY + 12);
      doc.setFontSize(18);
      doc.setTextColor(16, 185, 129);
      doc.text(`${overallProgress}%`, 30, reviewY + 25);
      
      doc.setFontSize(10);
      doc.setTextColor(156, 163, 175);
      doc.text(`${completedRoadmapTasks} of ${totalRoadmapTasks} sub-tasks checked as completed.`, 100, reviewY + 20);

      reviewY += 45;

      // Card 3: Remaining Milestones
      doc.setFillColor(20, 20, 30);
      doc.rect(20, reviewY, pageWidth - 40, 35, 'F');
      
      doc.setFontSize(13);
      doc.setTextColor(255, 255, 255);
      doc.text('Remaining Milestones:', 30, reviewY + 12);
      doc.setFontSize(18);
      doc.setTextColor(245, 158, 11);
      const remainingMilestones = roadmapNodes.filter(n => n.status !== 'Completed').length;
      doc.text(`${remainingMilestones} Stages`, 30, reviewY + 25);
      
      doc.setFontSize(10);
      doc.setTextColor(156, 163, 175);
      doc.text('Milestones remaining in pending or in-progress tracks.', 100, reviewY + 20);

      // Investor closing advice
      reviewY += 55;
      doc.setFillColor(99, 102, 241, 0.05);
      doc.setDrawColor(99, 102, 241, 0.2);
      doc.rect(20, reviewY, pageWidth - 40, 45, 'FD');
      
      doc.setFontSize(12);
      doc.setTextColor(255, 255, 255);
      doc.text('Investor Launch Ready Advice:', 30, reviewY + 12);
      
      doc.setFontSize(10.5);
      doc.setTextColor(209, 213, 219);
      let adviceText = 'Your startup is on track for MVP launch. Focus on completing user testing and GTM strategy to lower risk vectors.';
      if (readiness > 80) {
        adviceText = 'Your venture is in the high-probability success zone. Prepare pitch deck models to initiate VC and angel discussions.';
      } else if (readiness < 50) {
        adviceText = 'Core problem-solution validation is currently weak. Iterate on customer discovery surveys before coding product components.';
      }
      const adviceLines = doc.splitTextToSize(adviceText, pageWidth - 60);
      doc.text(adviceLines, 30, reviewY + 22);

      // Download PDF
      doc.save(`StartupXpert_Roadmap_${startupName.replace(/\s+/g, '_')}.pdf`);
      showToast('Roadmap PDF downloaded successfully!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Error generating PDF report.', 'error');
    }
  };

  // Calculate overall checklist totals
  const totals = useMemo(() => {
    const total = roadmapNodes.reduce((acc, n) => acc + (n.tasks?.length || 0), 0);
    const completed = roadmapNodes.reduce((acc, n) => acc + (n.tasks?.filter(t => t.completed).length || 0), 0);
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, percent };
  }, [roadmapNodes]);

  return (
    <DashboardLayout activeTab="roadmap">
      <div className="space-y-6 text-left relative min-h-[calc(100vh-80px)]">
        
        {/* Roadmap Toolbar Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-indigo-500/5 pb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">Startup OS</span>
            <h1 className="font-heading text-2xl font-extrabold text-white mt-1">
              {startupDetails.startupName || 'Venture'} Interactive Roadmap
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Zoom, pan, and click milestones to update checklist, log notes, and add child branches.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {/* Auto Layout Button */}
            <button
              onClick={triggerAutoLayout}
              className="flex items-center gap-1.5 rounded-lg border border-indigo-500/10 bg-indigo-500/5 px-4 py-2 text-xs font-bold uppercase tracking-wider text-gray-300 hover:bg-indigo-500/15 hover:text-white transition-all"
            >
              Auto-Layout
            </button>

            {/* Generate Roadmap PDF */}
            <button
              onClick={handleGeneratePDF}
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 text-xs font-bold uppercase tracking-wider shadow-lg shadow-indigo-600/10 transition-all"
            >
              <Download className="h-4.5 w-4.5" />
              Generate Roadmap PDF
            </button>
          </div>
        </div>

        {/* Global Progress Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 rounded-xl border border-indigo-500/5 bg-indigo-950/10 p-4">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Overall Completion</span>
            <div className="flex items-center gap-3">
              <span className="text-lg font-bold text-white font-mono">{totals.percent}%</span>
              <div className="h-2 flex-grow bg-[#0a0a0f] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full" style={{ width: `${totals.percent}%` }}></div>
              </div>
            </div>
          </div>
          <div className="h-full w-[1px] bg-indigo-500/10 hidden md:block"></div>
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Milestone Tasks Count</span>
            <p className="text-sm font-bold text-white mt-1">
              <span className="text-emerald-400 font-mono">{totals.completed}</span> / <span className="font-mono">{totals.total}</span> sub-tasks checked
            </p>
          </div>
        </div>

        {/* Canvas Area Container */}
        <div className="w-full h-[600px] border border-indigo-500/10 bg-[#0e0e16]/40 rounded-2xl overflow-hidden relative shadow-[0_0_50px_rgba(0,0,0,0.5)] backdrop-blur-md">
          <ReactFlowProvider>
            <div className="w-full h-full relative">
              <ReactFlow
                nodes={elements.nodes}
                edges={elements.edges}
                nodeTypes={nodeTypes}
                fitView
                fitViewOptions={{ padding: 0.2 }}
                minZoom={0.2}
                maxZoom={1.5}
                nodesDraggable={false}
                nodesConnectable={false}
                zoomOnDoubleClick={false}
                selectNodesOnDrag={false}
              >
                <Background color="rgba(99, 102, 241, 0.05)" gap={16} size={1} />
                <Controls className="!bg-[#0e0e16] !border-indigo-500/20 !text-white [&_button]:!border-indigo-500/5 [&_button]:!bg-[#0a0a0f] [&_button]:hover:!bg-[#141420]" />
                <MiniMap 
                  className="!bg-[#0e0e16]/90 !border-indigo-500/20" 
                  nodeColor={() => '#1e1e2f'}
                  maskColor="rgba(10, 10, 15, 0.6)"
                />
              </ReactFlow>
              <FitViewButton />
              
              {/* Canvas Floating Hints */}
              <div className="absolute left-4 bottom-4 p-3 rounded-lg border border-indigo-500/10 bg-[#0e0e16]/90 backdrop-blur-md pointer-events-none text-2xs space-y-1 z-10 shadow-lg text-gray-400">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-indigo-500"></span>
                  <span>In Progress (Animated Track)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                  <span>Completed Track</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-rose-500"></span>
                  <span>Blocked Track</span>
                </div>
              </div>
            </div>
          </ReactFlowProvider>
        </div>

        {/* Sliding Right-Side Detail Drawer */}
        {isDrawerOpen && activeNode && (
          <div className="fixed top-0 right-0 h-screen w-full sm:w-96 z-50 border-l border-indigo-500/10 bg-[#0e0e16]/95 shadow-[-20px_0_50px_rgba(0,0,0,0.6)] backdrop-blur-md flex flex-col justify-between text-left animate-[slideIn_0.25s_ease-out]">
            
            {/* Drawer Header */}
            <div className="p-6 border-b border-indigo-500/5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Compass className="h-5 w-5 text-indigo-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Milestone Details</span>
              </div>
              <button 
                onClick={() => {
                  setIsDrawerOpen(false);
                  setSelectedNodeId(null);
                }}
                className="h-8 w-8 flex items-center justify-center rounded-lg border border-indigo-500/10 bg-indigo-500/5 text-gray-500 hover:text-white hover:bg-indigo-500/10 transition-all focus:outline-none"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Scrollable Content Container */}
            <div className="flex-grow overflow-y-auto p-6 space-y-6">
              
              {/* Inline Editor: Title */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Milestone Name</label>
                <input 
                  type="text" 
                  value={activeNode.title}
                  onChange={(e) => updateRoadmapNode(activeNode.id, { title: e.target.value })}
                  className="w-full rounded-lg border border-indigo-500/10 bg-[#0a0a0f] px-3.5 py-2.5 text-sm text-white focus:border-indigo-500 outline-none transition-all"
                  placeholder="e.g. Market Research"
                />
              </div>

              {/* Inline Editor: Description */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Description</label>
                <textarea
                  value={activeNode.description}
                  onChange={(e) => updateRoadmapNode(activeNode.id, { description: e.target.value })}
                  className="w-full rounded-lg border border-indigo-500/10 bg-[#0a0a0f] px-3.5 py-2.5 text-sm text-white focus:border-indigo-500 outline-none transition-all resize-none"
                  rows={3}
                  placeholder="Describe this operational phase..."
                />
              </div>

              {/* Dropdowns: Status & Priority */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider font-mono">STATUS</label>
                  <select
                    value={activeNode.status}
                    onChange={(e) => updateRoadmapNode(activeNode.id, { status: e.target.value })}
                    className="w-full rounded-lg border border-indigo-500/10 bg-[#0a0a0f] px-3 py-2.5 text-xs text-white focus:border-indigo-500 outline-none cursor-pointer"
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Blocked">Blocked</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider font-mono">PRIORITY</label>
                  <select
                    value={activeNode.priority}
                    onChange={(e) => updateRoadmapNode(activeNode.id, { priority: e.target.value })}
                    className="w-full rounded-lg border border-indigo-500/10 bg-[#0a0a0f] px-3 py-2.5 text-xs text-white focus:border-indigo-500 outline-none cursor-pointer"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              {/* Tasks Checklist */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-indigo-500/5 pb-2">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">Tasks Checklist</span>
                  <span className="rounded bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 text-3xs font-bold text-indigo-400">
                    {activeNode.tasks?.filter(t => t.completed).length || 0} OF {activeNode.tasks?.length || 0} DONE
                  </span>
                </div>

                {/* Subtask list */}
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {activeNode.tasks && activeNode.tasks.length > 0 ? (
                    activeNode.tasks.map((t) => (
                      <div key={t.id} className="flex items-center justify-between gap-2 p-2.5 rounded-lg border border-indigo-500/5 bg-indigo-950/10">
                        <div className="flex items-center gap-2.5">
                          <input 
                            type="checkbox" 
                            checked={t.completed}
                            onChange={() => handleToggleTask(t.id)}
                            className="h-4 w-4 rounded border-indigo-500/30 text-indigo-600 focus:ring-indigo-500/30 focus:ring-offset-[#0a0a0f] cursor-pointer"
                          />
                          <span className={`text-xs ${t.completed ? 'text-gray-500 line-through' : 'text-gray-300'}`}>
                            {t.text}
                          </span>
                        </div>
                        <button 
                          onClick={() => handleDeleteTask(t.id)}
                          className="text-gray-500 hover:text-rose-400 p-1 rounded hover:bg-rose-500/5"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-2xs text-gray-500 italic py-2">No tasks created. Fill inputs to add operational sub-tasks.</p>
                  )}
                </div>

                {/* Inline task adder */}
                <form onSubmit={handleAddTask} className="flex gap-2">
                  <input 
                    type="text" 
                    value={newTaskText}
                    onChange={(e) => setNewTaskText(e.target.value)}
                    placeholder="Create sub-task details..."
                    className="flex-grow rounded-lg border border-indigo-500/10 bg-[#0a0a0f] px-3.5 py-2 text-xs text-white focus:border-indigo-500 outline-none"
                  />
                  <button 
                    type="submit"
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shrink-0 shadow-lg shadow-indigo-600/10 focus:outline-none"
                  >
                    <Plus className="h-4.5 w-4.5" />
                  </button>
                </form>
              </div>

              {/* Notes Log */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-indigo-500/5 pb-2">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">Milestone Notes Log</span>
                  <span className="text-3xs text-indigo-400 font-mono uppercase font-bold">{activeNode.notes?.length || 0} notes logged</span>
                </div>

                {/* Notes List */}
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {activeNode.notes && activeNode.notes.length > 0 ? (
                    activeNode.notes.map((n) => (
                      <div key={n.id} className="p-2.5 rounded-lg border border-indigo-500/5 bg-indigo-950/10 space-y-1 relative group">
                        <button
                          onClick={() => handleDeleteNote(n.id)}
                          className="absolute right-2 top-2 text-gray-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-rose-500/5 transition-all"
                          title="Delete note"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                        <span className="text-[8px] font-bold text-indigo-400 font-mono block">
                          {new Date(n.timestamp).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        <p className="text-2xs text-gray-300 pr-4 leading-relaxed font-sans">{n.text}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-2xs text-gray-500 italic py-2">No notes logged. Enter comment text below to document milestones.</p>
                  )}
                </div>

                {/* Inline note adder */}
                <form onSubmit={handleAddNote} className="flex gap-2">
                  <input 
                    type="text" 
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    placeholder="Log comments or reports..."
                    className="flex-grow rounded-lg border border-indigo-500/10 bg-[#0a0a0f] px-3.5 py-2 text-xs text-white focus:border-indigo-500 outline-none"
                  />
                  <button 
                    type="submit"
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0e0e16] hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/25 shrink-0 focus:outline-none"
                  >
                    <Plus className="h-4.5 w-4.5" />
                  </button>
                </form>
              </div>

              {/* AI Launcher recommendations */}
              <div className="rounded-xl border border-indigo-500/10 bg-indigo-950/15 p-4 text-left space-y-2 relative overflow-hidden">
                <div className="absolute right-0 top-0 h-10 w-10 bg-indigo-500/5 rounded-bl-full pointer-events-none"></div>
                <div className="flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-widest text-indigo-400">
                  <Sparkles className="h-3.5 w-3.5" />
                  AI Launch Advice
                </div>
                <p className="text-2xs text-gray-400 leading-relaxed font-sans">
                  {activeNode.recommendations || 'stress-test target audience variables.'}
                </p>
              </div>

              {/* Node Operations: Custom Child Adder */}
              <div className="border-t border-indigo-500/5 pt-4 space-y-3">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono block">Add Custom Branch Node</span>
                <form onSubmit={handleAddChildNode} className="space-y-2">
                  <input 
                    type="text" 
                    value={childTitle}
                    onChange={(e) => setChildTitle(e.target.value)}
                    placeholder="Milestone Title..."
                    className="w-full rounded-lg border border-indigo-500/10 bg-[#0a0a0f] px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none"
                  />
                  <input 
                    type="text" 
                    value={childDesc}
                    onChange={(e) => setChildDesc(e.target.value)}
                    placeholder="Milestone Description..."
                    className="w-full rounded-lg border border-indigo-500/10 bg-[#0a0a0f] px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none"
                  />
                  <button 
                    type="submit"
                    className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-indigo-500/20 bg-indigo-500/5 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-indigo-400 hover:bg-indigo-500 hover:text-white transition-all focus:outline-none"
                  >
                    <PlusCircle className="h-4 w-4" />
                    Create Child Node
                  </button>
                </form>
              </div>

            </div>

            {/* Drawer Footer Actions */}
            <div className="p-6 border-t border-indigo-500/5 shrink-0 bg-[#08080c]/50">
              <button 
                onClick={handleDeleteNodeClick}
                disabled={activeNode.id === 'root'}
                className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-transparent bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white px-4 py-3 text-xs font-bold uppercase tracking-wider disabled:opacity-20 disabled:hover:bg-rose-500/10 disabled:hover:text-rose-400 transition-all focus:outline-none"
              >
                <Trash2 className="h-4 w-4" />
                Delete Milestone Node
              </button>
            </div>

          </div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default Roadmap;

import React, { createContext, useState, useContext, useEffect } from 'react';
import { useToast } from './ToastContext';

const StartupContext = createContext(null);

export const useStartup = () => {
  const context = useContext(StartupContext);
  if (!context) {
    throw new Error('useStartup must be used within a StartupProvider');
  }
  return context;
};

export const StartupProvider = ({ children }) => {
  const { showToast } = useToast();

  // Helper to determine startup type from user onboarding data
  const getStartupType = (details) => {
    const domain = (details.startupDomain || '').toLowerCase();
    const desc = (details.startupDescription || '').toLowerCase();
    const name = (details.startupName || '').toLowerCase();
    
    if (domain.includes('ai') || domain.includes('intelligence') || domain.includes('machine') || 
        desc.includes('ai ') || desc.includes('artificial intelligence') || desc.includes('gpt') || desc.includes('llm') || desc.includes('machine learning')) {
      return 'AI Startup';
    }
    if (domain.includes('saas') || domain.includes('software') || domain.includes('platform') || 
        desc.includes('saas') || desc.includes('software-as-a-service') || desc.includes('subscription')) {
      return 'SaaS';
    }
    if (domain.includes('e-commerce') || domain.includes('ecommerce') || domain.includes('retail') || domain.includes('shop') || domain.includes('store') || domain.includes('marketplace') ||
        desc.includes('ecommerce') || desc.includes('e-commerce') || desc.includes('marketplace') || desc.includes('product')) {
      return 'E-commerce';
    }
    if (domain.includes('fintech') || domain.includes('finance') || domain.includes('pay') || domain.includes('crypto') || domain.includes('blockchain') ||
        desc.includes('fintech') || desc.includes('financial') || desc.includes('payment')) {
      return 'Fintech';
    }
    return 'Generic';
  };

  // Helper to generate a startup-specific dynamic roadmap based on type
  const generateRoadmapForType = (type, details, scores) => {
    const startupName = details.startupName || 'Venture';
    
    const templates = {
      'SaaS': [
        {
          id: 'stage-1',
          parentId: 'root',
          title: 'Idea Research',
          description: 'Validate SaaS multi-tenant scope, check API availability, and research security regulations.',
          tasks: [
            { id: 't1-1', text: 'Define B2B customer profile requirements', completed: false },
            { id: 't1-2', text: 'Map subscription pricing levels and value metric', completed: false },
            { id: 't1-3', text: 'Confirm key API integrations (e.g. Stripe, AWS)', completed: false }
          ],
          recommendations: 'Focus on solving one specific workflow automation problem extremely well before writing code.',
          priority: 'High'
        },
        {
          id: 'stage-2',
          parentId: 'stage-1',
          title: 'Market Validation',
          description: 'Set up an organic landing page waitlist and pre-sell annual SaaS contracts to early adopters.',
          tasks: [
            { id: 't2-1', text: 'Create dynamic landing page mock with email form', completed: false },
            { id: 't2-2', text: 'Outreach to 100 ICP prospects on LinkedIn/email', completed: false },
            { id: 't2-3', text: 'Collect 20 waitlist signups and 5 pilot letters', completed: false }
          ],
          recommendations: 'Validate demand by aiming for at least a 10% signup rate from organic traffic.',
          priority: 'High'
        },
        {
          id: 'stage-3',
          parentId: 'stage-2',
          title: 'Competitor Analysis',
          description: 'Audit direct SaaS rivals, pricing models, feature comparison matrices, and review complaints on G2.',
          tasks: [
            { id: 't3-1', text: 'Build feature matrix spreadsheet comparing 3 rivals', completed: false },
            { id: 't3-2', text: 'Analyze legacy user complaints on G2 & Capterra', completed: false }
          ],
          recommendations: 'Target competitor weaknesses like poor customer support or outdated mobile interfaces.',
          priority: 'Medium'
        },
        {
          id: 'stage-4',
          parentId: 'root',
          title: 'MVP Development',
          description: 'Build the authentication flow, visual database structures, stripe checkout, and a single core workflow tool.',
          tasks: [
            { id: 't4-1', text: 'Implement JWT authentication & user database', completed: false },
            { id: 't4-2', text: 'Design clean layout shell & visual workspace view', completed: false },
            { id: 't4-3', text: 'Integrate Stripe subscription checkout SDK', completed: false }
          ],
          recommendations: 'Cut any feature that is not absolutely critical to solving the main problem. Keep build below 6 weeks.',
          priority: 'High'
        },
        {
          id: 'stage-5',
          parentId: 'stage-4',
          title: 'User Testing',
          description: 'Onboard a beta group of 10-15 founders and record live user sessions to verify navigation clarity.',
          tasks: [
            { id: 't5-1', text: 'Recruit 10 SaaS beta testers for feedback cohort', completed: false },
            { id: 't5-2', text: 'Integrate session recording widgets (e.g. Hotjar)', completed: false },
            { id: 't5-3', text: 'Conduct 5 walkthrough interviews with feedback logs', completed: false }
          ],
          recommendations: 'Watch users interact with your MVP without instruction to catch design friction points.',
          priority: 'Medium'
        },
        {
          id: 'stage-6',
          parentId: 'stage-5',
          title: 'Business Registration',
          description: 'Incorporate as an LLC/C-Corp, purchase digital liability insurance, and write SaaS Terms of Service.',
          tasks: [
            { id: 't6-1', text: 'File LLC/C-Corp business incorporation papers', completed: false },
            { id: 't6-2', text: 'Draft platform Terms of Service & Privacy Policy', completed: false },
            { id: 't6-3', text: 'Open business banking account and link Stripe', completed: false }
          ],
          recommendations: 'Get general liability insurance early. Keep structural expenses minimal using online portals.',
          priority: 'Low'
        },
        {
          id: 'stage-7',
          parentId: 'root',
          title: 'Marketing Strategy',
          description: 'Setup SEO pipelines, post value-driven content on B2B forums, and run targeted LinkedIn outreach campaigns.',
          tasks: [
            { id: 't7-1', text: 'List on ProductHunt, BetaList, and SaaS lists', completed: false },
            { id: 't7-2', text: 'Write 3 optimized SEO-friendly articles on domain pain', completed: false }
          ],
          recommendations: 'Focus heavily on B2B communities (Reddit, IndieHackers) rather than high paid ads budget.',
          priority: 'High'
        },
        {
          id: 'stage-8',
          parentId: 'stage-7',
          title: 'Revenue Planning',
          description: 'Package plans into Free, Pro, and Enterprise tiers, set up stripe checkout webhooks, and optimize checkout conversion.',
          tasks: [
            { id: 't8-1', text: 'Write stripe payment receipt webhook functions', completed: false },
            { id: 't8-2', text: 'Configure plan limits code constraints in database', completed: false }
          ],
          recommendations: 'Offer a yearly billing tier with a significant discount (e.g., 20%) to secure immediate capital.',
          priority: 'High'
        },
        {
          id: 'stage-9',
          parentId: 'root',
          title: 'Funding Preparation',
          description: 'Compile SaaS metrics (MRR, LTV, CAC, NRR), prepare an investor pitch deck, and set up a data room.',
          tasks: [
            { id: 't9-1', text: 'Build B2B metrics dashboard showing LTV and CAC', completed: false },
            { id: 't9-2', text: 'Design a 10-slide investor presentation deck', completed: false },
            { id: 't9-3', text: 'Project 12-month operational burn budget sheet', completed: false }
          ],
          recommendations: 'Highlight recurring retention potential and high readiness scores to investors.',
          priority: 'Medium'
        },
        {
          id: 'stage-10',
          parentId: 'stage-9',
          title: 'Growth & Scaling',
          description: 'Expand integration options, build custom webhooks, scale backend infrastructure, and set up referral loops.',
          tasks: [
            { id: 't10-1', text: 'Design public API endpoints documentation pages', completed: false },
            { id: 't10-2', text: 'Integrate with Slack and Zapier hubs', completed: false }
          ],
          recommendations: 'Scale customer acquisition only when monthly user churn is consistently below 3%.',
          priority: 'Medium'
        }
      ],
      'E-commerce': [
        {
          id: 'stage-1',
          parentId: 'root',
          title: 'Idea Research',
          description: 'Validate supply chain margins, check product sourcing costs, and evaluate shipping logistics.',
          tasks: [
            { id: 't1-1', text: 'Identify 3 reliable manufacturer options', completed: false },
            { id: 't1-2', text: 'Calculate estimated cost of goods sold (COGS)', completed: false }
          ],
          recommendations: 'Aim for a product margin of at least 60% to absorb customer acquisition costs.',
          priority: 'High'
        },
        {
          id: 'stage-2',
          parentId: 'stage-1',
          title: 'Market Validation',
          description: 'Run small test ad sets to measure interest and launch a pre-order signup catalog page.',
          tasks: [
            { id: 't2-1', text: 'Set up ad account and test creatives', completed: false },
            { id: 't2-2', text: 'Collect 100 email signups on a pre-order page', completed: false }
          ],
          recommendations: 'Validate CTR (Click-Through Rate) on ads before placing a major product order.',
          priority: 'High'
        },
        {
          id: 'stage-3',
          parentId: 'stage-2',
          title: 'Competitor Analysis',
          description: 'Audit rival store layouts, pricing models, packaging details, and shipping speed.',
          tasks: [
            { id: 't3-1', text: 'Analyze 3 competitors checkout flows', completed: false },
            { id: 't3-2', text: 'Compare competitor shipping rates and packaging', completed: false }
          ],
          recommendations: 'Offer free shipping or unique bundles to differentiate from established shops.',
          priority: 'Medium'
        },
        {
          id: 'stage-4',
          parentId: 'root',
          title: 'MVP Development',
          description: 'Set up product storefront pages, shopping cart controls, secure checkout, and order receipt notifications.',
          tasks: [
            { id: 't4-1', text: 'Set up Shopify storefront template or custom grid', completed: false },
            { id: 't4-2', text: 'Configure cart controls and Stripe payment SDK', completed: false },
            { id: 't4-3', text: 'Set up automated invoice email responder', completed: false }
          ],
          recommendations: 'Keep the storefront minimal. Prioritize high-quality product images and clean mobile checkout.',
          priority: 'High'
        },
        {
          id: 'stage-5',
          parentId: 'stage-4',
          title: 'User Testing',
          description: 'Audit checkout speeds, test mobile interface layouts, and verify successful payment flows.',
          tasks: [
            { id: 't5-1', text: 'Test site load speed on mobile connection', completed: false },
            { id: 't5-2', text: 'Verify checkout payment succeeds with test card', completed: false }
          ],
          recommendations: 'Ensure checkout takes fewer than 3 steps to minimize card abandonment.',
          priority: 'Medium'
        },
        {
          id: 'stage-6',
          parentId: 'stage-5',
          title: 'Business Registration',
          description: 'Register sales tax licenses, obtain product liability insurance, and establish the business entity.',
          tasks: [
            { id: 't6-1', text: 'Register for state/national sales tax IDs', completed: false },
            { id: 't6-2', text: 'Purchase ecommerce liability insurance', completed: false }
          ],
          recommendations: 'Consult a local tax professional regarding sales tax nexus requirements for your shipping hubs.',
          priority: 'Low'
        },
        {
          id: 'stage-7',
          parentId: 'root',
          title: 'Marketing Strategy',
          description: 'Launch influencer gift campaigns, run retargeting ads, and set up automated discount triggers.',
          tasks: [
            { id: 't7-1', text: 'Outreach to 15 micro-influencers for gifting', completed: false },
            { id: 't7-2', text: 'Configure Meta/TikTok retargeting pixels', completed: false }
          ],
          recommendations: 'Utilize short-form video content (TikTok/Reels) for organic reach and viral catalog growth.',
          priority: 'High'
        },
        {
          id: 'stage-8',
          parentId: 'stage-7',
          title: 'Revenue Planning',
          description: 'Map gross margins, optimize order values, and plan seasonal markdown strategies.',
          tasks: [
            { id: 't8-1', text: 'Configure upsell recommendations widgets', completed: false },
            { id: 't8-2', text: 'Draft seasonal sales discount calendar', completed: false }
          ],
          recommendations: 'Implement bundles to increase Average Order Value (AOV), improving shipping margin health.',
          priority: 'High'
        },
        {
          id: 'stage-9',
          parentId: 'root',
          title: 'Funding Preparation',
          description: 'Calculate inventory turn ratios, compile margins spreadsheets, and forecast working capital requirements.',
          tasks: [
            { id: 't9-1', text: 'Compile inventory working capital projection sheet', completed: false },
            { id: 't9-2', text: 'Prepare warehouse catalog density decks', completed: false }
          ],
          recommendations: 'Investors in e-commerce focus heavily on inventory turnover speed and positive unit economics.',
          priority: 'Medium'
        },
        {
          id: 'stage-10',
          parentId: 'stage-9',
          title: 'Growth & Scaling',
          description: 'Partner with a 3PL logistics warehouse, open international routes, and expand the product catalogue.',
          tasks: [
            { id: 't10-1', text: 'Onboard a 3PL logistics warehousing partner', completed: false },
            { id: 't10-2', text: 'Launch 2 complementary product SKU additions', completed: false }
          ],
          recommendations: 'Outsource fulfillment to a 3PL as soon as shipping exceeds 50 orders per day.',
          priority: 'Medium'
        }
      ],
      'AI Startup': [
        {
          id: 'stage-1',
          parentId: 'root',
          title: 'Idea Research',
          description: 'Assess foundational models APIs (OpenAI/Claude/Llama), compute hardware budgets, and map vector index options.',
          tasks: [
            { id: 't1-1', text: 'Compare API token costs and rate constraints', completed: false },
            { id: 't1-2', text: 'Map system vector embedding structure', completed: false }
          ],
          recommendations: 'Build models using existing APIs first to prove validation before training custom parameters.',
          priority: 'High'
        },
        {
          id: 'stage-2',
          parentId: 'stage-1',
          title: 'Market Validation',
          description: 'Audit accuracy requirements with early testers, run prompt pipeline mock validation surveys.',
          tasks: [
            { id: 't2-1', text: 'Conduct 15 target client tasks automation surveys', completed: false },
            { id: 't2-2', text: 'Collect pilot signup commitments for beta app', completed: false }
          ],
          recommendations: 'Verify that clients value the task speed output over perfect absolute accuracy.',
          priority: 'High'
        },
        {
          id: 'stage-3',
          parentId: 'stage-2',
          title: 'Competitor Analysis',
          description: 'Differentiate between thin model wrapper apps and proprietary workflows, and review open-source code.',
          tasks: [
            { id: 't3-1', text: 'Audit 5 rival AI wrapper tools pricing structures', completed: false },
            { id: 't3-2', text: 'Identify proprietary dataset acquisition models', completed: false }
          ],
          recommendations: 'Build proprietary dataset integrations or visual logic flows to maintain a defensible moat.',
          priority: 'Medium'
        },
        {
          id: 'stage-4',
          parentId: 'root',
          title: 'MVP Development',
          description: 'Build prompt pipeline controllers, link vector databases, and code the workspace chat shell.',
          tasks: [
            { id: 't4-1', text: 'Configure prompt templates and parsing checks', completed: false },
            { id: 't4-2', text: 'Connect vector DB index for system context RAG', completed: false },
            { id: 't4-3', text: 'Develop clean chat log UI canvas', completed: false }
          ],
          recommendations: 'Optimize LLM system prompts and clean context chunking to keep system token costs low.',
          priority: 'High'
        },
        {
          id: 'stage-5',
          parentId: 'stage-4',
          title: 'User Testing',
          description: 'Measure response generation latency, log hallucination rates, and audit chat interface utility.',
          tasks: [
            { id: 't5-1', text: 'Monitor generation API latency speeds', completed: false },
            { id: 't5-2', text: 'Collect user rating feedback on AI output utility', completed: false }
          ],
          recommendations: 'Implement response streaming (SSE) to improve perceived speed for the end user.',
          priority: 'Medium'
        },
        {
          id: 'stage-6',
          parentId: 'stage-5',
          title: 'Business Registration',
          description: 'Draft model data usage agreements, copyright ownership statements, and incorporate company.',
          tasks: [
            { id: 't6-1', text: 'Draft customer dataset privacy policy rules', completed: false },
            { id: 't6-2', text: 'File official business incorporation papers', completed: false }
          ],
          recommendations: 'State clearly that customer prompt histories are not utilized to train generic models.',
          priority: 'Low'
        },
        {
          id: 'stage-7',
          parentId: 'root',
          title: 'Marketing Strategy',
          description: 'Publish deep technical optimization articles, list on major AI hubs, and build developer SDKs.',
          tasks: [
            { id: 't7-1', text: 'Submit tools to ThereseAnAIForThat & AI Hubs', completed: false },
            { id: 't7-2', text: 'Write technical walkthrough explaining prompt workflows', completed: false }
          ],
          recommendations: 'Leverage developer-oriented communities like Hugging Face or GitHub to gain organic users.',
          priority: 'High'
        },
        {
          id: 'stage-8',
          parentId: 'stage-7',
          title: 'Revenue Planning',
          description: 'Design credit token limits checkout, price pro subscription layers, and map API margin rules.',
          tasks: [
            { id: 't8-1', text: 'Integrate usage credit metering controls', completed: false },
            { id: 't8-2', text: 'Verify pricing structure exceeds system API fees', completed: false }
          ],
          recommendations: 'Implement soft usage limits rather than hard blocks to retain customer satisfaction.',
          priority: 'High'
        },
        {
          id: 'stage-9',
          parentId: 'root',
          title: 'Funding Preparation',
          description: 'Forecast model GPU training and hosting expenses, project margin gains, and format data pitch decks.',
          tasks: [
            { id: 't9-1', text: 'Calculate server and API compute burn costs', completed: false },
            { id: 't9-2', text: 'Create 12-slide AI innovation presentation', completed: false }
          ],
          recommendations: 'Show investors clear unit economics that prove margins expand as request volume grows.',
          priority: 'Medium'
        },
        {
          id: 'stage-10',
          parentId: 'stage-9',
          title: 'Growth & Scaling',
          description: 'Fine-tune local open-source models, scale server concurrency, and configure custom workspace privacy rules.',
          tasks: [
            { id: 't10-1', text: 'Fine-tune custom model on proprietary dataset', completed: false },
            { id: 't10-2', text: 'Deploy dedicated model hosting infrastructure', completed: false }
          ],
          recommendations: 'Fine-tune open-source models (like Llama 3) to reduce reliance on third-party APIs and cut costs.',
          priority: 'Medium'
        }
      ],
      'Fintech': [
        {
          id: 'stage-1',
          parentId: 'root',
          title: 'Idea Research',
          description: 'Evaluate banking compliance, audit payment rails (ACH, Card, Crypto), and check partner bank rules.',
          tasks: [
            { id: 't1-1', text: 'Identify target banking partner requirements', completed: false },
            { id: 't1-2', text: 'Assess regulatory compliance laws (KYC/AML)', completed: false }
          ],
          recommendations: 'Start by mapping out complex flows. Ensure compliance sits at the core of the database schema.',
          priority: 'High'
        },
        {
          id: 'stage-2',
          parentId: 'stage-1',
          title: 'Market Validation',
          description: 'Verify client security and trust priorities, launch secure sandbox registration mocks, and collect feedback.',
          tasks: [
            { id: 't2-1', text: 'Survey users on payment security concerns', completed: false },
            { id: 't2-2', text: 'Onboard 30 pilot sandbox waitlist signups', completed: false }
          ],
          recommendations: 'Trust is paramount. Showcase security protocols prominently on validation pages.',
          priority: 'High'
        },
        {
          id: 'stage-3',
          parentId: 'stage-2',
          title: 'Competitor Analysis',
          description: 'Audit digital banking layouts, fee schedules, wire options, and checkout processing speeds.',
          tasks: [
            { id: 't3-1', text: 'Chart competitor platform card fee metrics', completed: false },
            { id: 't3-2', text: 'Identify transaction speed friction gaps', completed: false }
          ],
          recommendations: 'Compete on simplicity and speed of onboarding rather than processing price wars.',
          priority: 'Medium'
        },
        {
          id: 'stage-4',
          parentId: 'root',
          title: 'MVP Development',
          description: 'Build secure transaction ledgers, implement KYC identity checks, and integrate payment bank APIs.',
          tasks: [
            { id: 't4-1', text: 'Deploy secure transactional database schema', completed: false },
            { id: 't4-2', text: 'Integrate KYC provider flow (e.g. Persona)', completed: false },
            { id: 't4-3', text: 'Connect bank account link tools (e.g. Plaid)', completed: false }
          ],
          recommendations: 'Security is non-negotiable. Write thorough system testing suites for the database ledger.',
          priority: 'High'
        },
        {
          id: 'stage-5',
          parentId: 'stage-4',
          title: 'User Testing',
          description: 'Complete data penetration testing audits, verify transfer flows, and track ledger sync success rate.',
          tasks: [
            { id: 't5-1', text: 'Run database penetration security audits', completed: false },
            { id: 't5-2', text: 'Verify bank deposit transaction speeds', completed: false }
          ],
          recommendations: 'Achieve zero transfer failures in the sandbox environment before requesting launch clearances.',
          priority: 'Medium'
        },
        {
          id: 'stage-6',
          parentId: 'stage-5',
          title: 'Business Registration',
          description: 'Secure state transmitter licenses, hire compliance officer, and file corporate registration.',
          tasks: [
            { id: 't6-1', text: 'Apply for state money transmitter licenses', completed: false },
            { id: 't6-2', text: 'Appoint AML compliance manager', completed: false }
          ],
          recommendations: 'Budget for regulatory filings early; regulatory bottlenecks are the main risk to fintechs.',
          priority: 'Low'
        },
        {
          id: 'stage-7',
          parentId: 'root',
          title: 'Marketing Strategy',
          description: 'Launch deposit match programs, write trust-building case guides, and target search ads.',
          tasks: [
            { id: 't7-1', text: 'Set up deposit matching reward terms', completed: false },
            { id: 't7-2', text: 'Deploy search ads on high-intent target queries', completed: false }
          ],
          recommendations: 'Promote security certifications (SOC2, FDIC insurance pass-through) in all marketing collateral.',
          priority: 'High'
        },
        {
          id: 'stage-8',
          parentId: 'stage-7',
          title: 'Revenue Planning',
          description: 'Configure card interchange fee splits, optimize account subscriptions, and plan interest yields.',
          tasks: [
            { id: 't8-1', text: 'Setup transaction interchange tracking codes', completed: false },
            { id: 't8-2', text: 'Establish subscription account pricing tiers', completed: false }
          ],
          recommendations: 'Model payment margins based on a blend of recurring accounts fees and interchange percentages.',
          priority: 'High'
        },
        {
          id: 'stage-9',
          parentId: 'root',
          title: 'Funding Preparation',
          description: 'Draft regulatory compliance dossiers, map out transaction metrics, and prepare investor capital models.',
          tasks: [
            { id: 't9-1', text: 'Build capital reserve spreadsheet calculator', completed: false },
            { id: 't9-2', text: 'Format security certificates folder data room', completed: false }
          ],
          recommendations: 'Ensure compliance checks and ledger security audits are completed and shared in data rooms.',
          priority: 'Medium'
        },
        {
          id: 'stage-10',
          parentId: 'stage-9',
          title: 'Growth & Scaling',
          description: 'Add cross-border transaction options, launch custom card designs, and scale ledger throughput.',
          tasks: [
            { id: 't10-1', text: 'Integrate international FX transfer rates', completed: false },
            { id: 't10-2', text: 'Integrate physical card design and print flow', completed: false }
          ],
          recommendations: 'Set up multi-region servers to guarantee high availability and transaction compliance.',
          priority: 'Medium'
        }
      ],
      'Generic': [
        {
          id: 'stage-1',
          parentId: 'root',
          title: 'Idea Research',
          description: 'Map out customer paint points, formulate value propositions, and research solution limits.',
          tasks: [
            { id: 't1-1', text: 'Define customer persona profile statement', completed: false },
            { id: 't1-2', text: 'Draft primary value proposition canvas', completed: false }
          ],
          recommendations: 'Clearly specify the single biggest friction point you plan to solve for your niche audience.',
          priority: 'High'
        },
        {
          id: 'stage-2',
          parentId: 'stage-1',
          title: 'Market Validation',
          description: 'Conduct validation surveys, deploy a simple landing page waitlist, and collect user feedback.',
          tasks: [
            { id: 't2-1', text: 'Interview 15 target prospective buyers', completed: false },
            { id: 't2-2', text: 'Collect 50 signups on product waitlist', completed: false }
          ],
          recommendations: 'Measure target interest based on willing feedback response rates and signups.',
          priority: 'High'
        },
        {
          id: 'stage-3',
          parentId: 'stage-2',
          title: 'Competitor Analysis',
          description: 'Map direct/indirect competitor positions, pricing models, and identify product gaps.',
          tasks: [
            { id: 't3-1', text: 'Analyze competitor pricing and packaging tiers', completed: false },
            { id: 't3-2', text: 'List gaps in competitor offerings', completed: false }
          ],
          recommendations: 'Differentiate by offering a faster workflow, cheaper model, or superior UI usability.',
          priority: 'Medium'
        },
        {
          id: 'stage-4',
          parentId: 'root',
          title: 'MVP Development',
          description: 'Develop the visual layout structure, link user database logins, and code core task pages.',
          tasks: [
            { id: 't4-1', text: 'Create user database and login flows', completed: false },
            { id: 't4-2', text: 'Implement primary user workspace screens', completed: false }
          ],
          recommendations: 'Build only what is necessary to validate the solution. Avoid adding bells and whistles.',
          priority: 'High'
        },
        {
          id: 'stage-5',
          parentId: 'stage-4',
          title: 'User Testing',
          description: 'Onboard early cohort testers, record user interaction logs, and compile usability surveys.',
          tasks: [
            { id: 't5-1', text: 'Collect prototype feedback reviews from 10 users', completed: false },
            { id: 't5-2', text: 'Compile usability score feedback checklist', completed: false }
          ],
          recommendations: 'Iterate product improvements based on visual user confusion points and failures.',
          priority: 'Medium'
        },
        {
          id: 'stage-6',
          parentId: 'stage-5',
          title: 'Business Registration',
          description: 'Establish the business entity, set up banking ledgers, and secure basic tax registrations.',
          tasks: [
            { id: 't6-1', text: 'Incorporate business entity and open bank accounts', completed: false },
            { id: 't6-2', text: 'Obtain business licenses and tax registrations', completed: false }
          ],
          recommendations: 'Incorporate locally first. Keep early legal expenditures as close to zero as possible.',
          priority: 'Low'
        },
        {
          id: 'stage-7',
          parentId: 'root',
          title: 'Marketing Strategy',
          description: 'Launch organic community outreach, design refer-a-friend bonuses, and publish media posts.',
          tasks: [
            { id: 't7-1', text: 'Launch user referral system options', completed: false },
            { id: 't7-2', text: 'Create organic social content plan calendar', completed: false }
          ],
          recommendations: 'Focus on organic growth loops (word of mouth, referrals) before spending money on paid ads.',
          priority: 'High'
        },
        {
          id: 'stage-8',
          parentId: 'stage-7',
          title: 'Revenue Planning',
          description: 'Deploy stripe billing models, run checkout optimization, and calculate marketing CAC.',
          tasks: [
            { id: 't8-1', text: 'Deploy Stripe billing checkout system', completed: false },
            { id: 't8-2', text: 'Calculate payment conversion ratios metrics', completed: false }
          ],
          recommendations: 'Test different pricing thresholds to find the optimum balance of volume and yield.',
          priority: 'High'
        },
        {
          id: 'stage-9',
          parentId: 'root',
          title: 'Funding Preparation',
          description: 'Map out 12-month budget sheets, compile pitch decks, and build investor target logs.',
          tasks: [
            { id: 't9-1', text: 'Create 12-month financial burn projection sheet', completed: false },
            { id: 't9-2', text: 'Design investor presentation pitch deck slides', completed: false }
          ],
          recommendations: 'Ensure your financial model details clear paths to profitability and low burn overheads.',
          priority: 'Medium'
        },
        {
          id: 'stage-10',
          parentId: 'stage-9',
          title: 'Growth & Scaling',
          description: 'Deploy partner programs, optimize system landing conversions, and scale data pipeline resources.',
          tasks: [
            { id: 't10-1', text: 'Launch affiliate partner referral programs', completed: false },
            { id: 't10-2', text: 'Optimize backend pipeline database responses', completed: false }
          ],
          recommendations: 'Focus on scaling only when unit economics are positive and user retention is stable.',
          priority: 'Medium'
        }
      ]
    };

    const coreNodes = templates[type] || templates['Generic'];
    
    // Map default status & notes arrays
    const dynamicNodes = coreNodes.map(node => ({
      ...node,
      status: node.id === 'stage-1' ? 'In Progress' : 'Pending',
      isExpanded: true,
      notes: []
    }));

    // Dynamic launch strategy constraints node
    const strategyNode = {
      id: 'stage-launch-strategy',
      parentId: 'root',
      title: 'Launch Strategy & Risk Controls',
      description: `Tailored constraints for your ${type || 'SaaS'} venture.`,
      status: 'Pending',
      priority: 'High',
      isExpanded: true,
      tasks: [
        { id: 'tspec-1', text: `Optimize monetization: "${details.revenueModel || 'Subscription Model'}"`, completed: false },
        { id: 'tspec-2', text: `Mitigate risk vectors: "${scores?.riskLevel?.status || 'Medium'} (${scores?.riskLevel?.score || 35}%)"`, completed: false },
        { id: 'tspec-3', text: `Differentiate from rivals: "${details.existingCompetitors || 'Direct competitors'}"`, completed: false },
        { id: 'tspec-4', text: `Maintain monthly burn target: "${details.monthlyBurnCapacity || 'Within available funding'}"`, completed: false }
      ],
      notes: [],
      recommendations: `Launch advice for target segment "${details.targetAudience || 'Early adopters'}". Feasibility validation: ${scores?.feasibility?.score || 72}%.`
    };

    // Add root node
    return [
      {
        id: 'root',
        parentId: null,
        title: `${startupName} Launchpad`,
        description: `The central operating system node for ${startupName} (${type} startup).`,
        status: 'In Progress',
        priority: 'High',
        isExpanded: true,
        tasks: [],
        notes: [],
        recommendations: 'This is your core startup mission command center. Follow branches to build your venture.'
      },
      strategyNode,
      ...dynamicNodes
    ];
  };

  const getSavedUserEmail = () => {
    const savedUser = localStorage.getItem('startup_user') || localStorage.getItem('startupxpert_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        return parsed && parsed.email ? parsed.email : '';
      } catch (e) {}
    }
    return '';
  };

  // 1. Authentication & User Profile States (persisted under startup_user & startupxpert_user)
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('startup_user') || localStorage.getItem('startupxpert_user');
    const parsed = savedUser ? JSON.parse(savedUser) : null;
    if (parsed) {
      if (parsed.onboardingCompleted === undefined) {
        const savedHistory = localStorage.getItem('startup_history');
        const hasHistory = savedHistory ? JSON.parse(savedHistory).length > 0 : false;
        parsed.onboardingCompleted = hasHistory;
      }
      return parsed;
    }
    return {
      fullName: '',
      email: '',
      role: 'Founder',
      avatarUrl: '', // simulated avatar base64 or URL
      isNewUser: false,
      onboardingCompleted: false
    };
  });

  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('isLoggedIn') === 'true';
  });

  // 2. Settings State (persisted under startup_settings)
  const [settings, setSettings] = useState(() => {
    const email = getSavedUserEmail();
    const key = email ? `${email}_startup_settings` : 'startup_settings';
    const saved = localStorage.getItem(key);
    const parsed = saved ? JSON.parse(saved) : {
      theme: 'Dark Futurism', // dynamic active theme
      notificationsEnabled: true,
      autoSaveDrafts: true,
      analysisPreference: 'Comprehensive'
    };

    // Apply theme immediately on boot to prevent flash
    const activeTheme = parsed.theme || 'Dark Futurism';
    document.documentElement.classList.add('dark');
    document.documentElement.classList.remove('light');
    document.body.classList.remove('theme-dark-futurism', 'theme-midnight-blue', 'theme-neo-emerald');
    if (activeTheme === 'Midnight Blue') {
      document.body.classList.add('theme-midnight-blue');
    } else if (activeTheme === 'Neo Emerald') {
      document.body.classList.add('theme-neo-emerald');
    } else {
      document.body.classList.add('theme-dark-futurism');
    }

    return parsed;
  });

  // Roadmap State (Visual Mind Map Tree Nodes)
  const [roadmapNodes, setRoadmapNodes] = useState(() => {
    const email = getSavedUserEmail();
    const key = email ? `${email}_startup_roadmap` : 'startup_roadmap';
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : [];
  });

  // Auto-save roadmap to localStorage (user scoped)
  useEffect(() => {
    if (isLoggedIn && user && user.email) {
      localStorage.setItem(`${user.email}_startup_roadmap`, JSON.stringify(roadmapNodes));
    }
  }, [roadmapNodes, user.email, isLoggedIn]);

  // Sync Theme (Dark Futurism / Midnight Blue / Neo Emerald)
  useEffect(() => {
    const activeTheme = settings.theme || 'Dark Futurism';

    document.documentElement.classList.add('dark');
    document.documentElement.classList.remove('light');
    document.body.classList.remove('theme-dark-futurism', 'theme-midnight-blue', 'theme-neo-emerald');

    if (activeTheme === 'Midnight Blue') {
      document.body.classList.add('theme-midnight-blue');
    } else if (activeTheme === 'Neo Emerald') {
      document.body.classList.add('theme-neo-emerald');
    } else {
      document.body.classList.add('theme-dark-futurism');
    }
  }, [settings.theme]);

  // 3. Onboarding Role Setup (Step 1)
  const [onboardingRole, setOnboardingRole] = useState(() => {
    const email = getSavedUserEmail();
    const key = email ? `${email}_startup_draft` : 'startup_draft';
    const savedDraft = localStorage.getItem(key);
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        if (parsed.onboardingRole) return parsed.onboardingRole;
      } catch (e) {}
    }
    return {
      fullName: '',
      age: '',
      gender: '',
      city: '',
      country: '',
      profession: '',
      experience: '',
      founderCount: '',
      founderSkillset: [],
    };
  });

  // 4. Onboarding Startup Details (Step 2 - 17 Fields)
  const [startupDetails, setStartupDetails] = useState(() => {
    const email = getSavedUserEmail();
    const key = email ? `${email}_active_startup_details` : 'active_startup_details';
    const saved = localStorage.getItem(key);
    if (saved) return JSON.parse(saved);

    // Fallback: check if there is a draft
    const draftKey = email ? `${email}_startup_draft` : 'startup_draft';
    const savedDraft = localStorage.getItem(draftKey);
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        if (parsed.startupDetails) return parsed.startupDetails;
      } catch (e) {}
    }

    return {
      startupName: '',
      startupDomain: '',
      problemStatement: '',
      startupDescription: '',
      targetAudience: '',
      geographicMarket: '',
      existingCompetitors: '',
      revenueModel: '',
      estimatedPricing: '',
      availableFunding: '',
      monthlyBurnCapacity: '',
      platformType: [],
      techComplexity: '',
      mvpTimeline: '',
      scalabilityGoal: '',
      acquisitionStrategy: '',
      startupStage: '',
    };
  });

  // 5. Analysis Scores (Step 3)
  const [analysisScores, setAnalysisScores] = useState(() => {
    const email = getSavedUserEmail();
    const key = email ? `${email}_active_analysis_scores` : 'active_analysis_scores';
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : null;
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // 6. Upgraded System States & History
  const [analysisHistory, setAnalysisHistory] = useState(() => {
    const email = getSavedUserEmail();
    const key = email ? `${email}_startup_history` : 'startup_history';
    const savedHistory = localStorage.getItem(key);
    return savedHistory ? JSON.parse(savedHistory) : [];
  });

  const [loadingState, setLoadingState] = useState(false);
  const [errorState, setErrorState] = useState(null);
  const [currentStep, setCurrentStep] = useState(() => {
    const email = getSavedUserEmail();
    const key = email ? `${email}_startup_draft` : 'startup_draft';
    const savedDraft = localStorage.getItem(key);
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        if (parsed.currentStep !== undefined) return parsed.currentStep;
      } catch (e) {}
    }
    return 0;
  });
  const [resumeState, setResumeState] = useState(false);

  // Check draft presence on mount
  useEffect(() => {
    const email = getSavedUserEmail();
    const key = email ? `${email}_startup_draft` : 'startup_draft';
    const savedDraft = localStorage.getItem(key);
    if (savedDraft) {
      setResumeState(true);
    }
  }, []);

  // Auto-save startupDetails to localStorage (user scoped)
  useEffect(() => {
    if (isLoggedIn && user && user.email) {
      if (startupDetails && startupDetails.startupName) {
        localStorage.setItem(`${user.email}_active_startup_details`, JSON.stringify(startupDetails));
      } else {
        localStorage.removeItem(`${user.email}_active_startup_details`);
      }
    }
  }, [startupDetails, user.email, isLoggedIn]);

  // Auto-save analysisScores to localStorage (user scoped)
  useEffect(() => {
    if (isLoggedIn && user && user.email) {
      if (analysisScores) {
        localStorage.setItem(`${user.email}_active_analysis_scores`, JSON.stringify(analysisScores));
      } else {
        localStorage.removeItem(`${user.email}_active_analysis_scores`);
      }
    }
  }, [analysisScores, user.email, isLoggedIn]);

  // Dynamic user data loading effect when active user session changes
  useEffect(() => {
    if (isLoggedIn && user && user.email) {
      const email = user.email;
      
      // Load history
      const savedHistory = localStorage.getItem(`${email}_startup_history`);
      const parsedHistory = savedHistory ? JSON.parse(savedHistory) : [];
      setAnalysisHistory(parsedHistory);

      // Load active startup details
      const savedDetails = localStorage.getItem(`${email}_active_startup_details`);
      const parsedDetails = savedDetails ? JSON.parse(savedDetails) : null;

      // Load analysis scores
      const savedScores = localStorage.getItem(`${email}_active_analysis_scores`);
      const parsedScores = savedScores ? JSON.parse(savedScores) : null;

      // Load roadmap nodes
      const savedRoadmap = localStorage.getItem(`${email}_startup_roadmap`);
      const parsedRoadmap = savedRoadmap ? JSON.parse(savedRoadmap) : [];

      if (parsedDetails && parsedDetails.startupName && parsedScores) {
        setStartupDetails(parsedDetails);
        setAnalysisScores(parsedScores);
        setRoadmapNodes(parsedRoadmap);
      } else if (
        parsedHistory && 
        parsedHistory.length > 0 && 
        !localStorage.getItem(`${email}_startup_draft`) && 
        !window.location.pathname.startsWith('/onboarding') && 
        !window.location.pathname.startsWith('/startup/validate') && 
        !window.location.pathname.startsWith('/analysis')
      ) {
        // Validation check on login/restore: auto-activate most recent validation record if history exists
        const mostRecent = parsedHistory[0];
        setAnalysisScores(mostRecent.scores);
        
        const restoredDetails = mostRecent.details || {
          startupName: mostRecent.startupName,
          startupDomain: mostRecent.scores.marketDemand ? 'SaaS' : 'Other',
          revenueModel: mostRecent.scores.revenuePotential ? 'Subscription' : 'Other',
          availableFunding: 'Bootstrapped',
          mvpTimeline: '3 months',
          platformType: ['Web App'],
          problemStatement: 'Restored from history.',
          startupDescription: mostRecent.summary || 'Restored historical venture profile.',
          targetAudience: 'Early adopters',
          startupStage: mostRecent.status || 'Ready'
        };
        setStartupDetails(restoredDetails);

        const startupType = getStartupType(restoredDetails);
        const generatedNodes = generateRoadmapForType(startupType, restoredDetails, mostRecent.scores);
        setRoadmapNodes(generatedNodes);
        
        // Auto-persist active startup details and analysis scores to user scoped storage
        localStorage.setItem(`${email}_active_startup_details`, JSON.stringify(restoredDetails));
        localStorage.setItem(`${email}_active_analysis_scores`, JSON.stringify(mostRecent.scores));
        localStorage.setItem(`${email}_startup_roadmap`, JSON.stringify(generatedNodes));
      } else {
        const savedDraft = localStorage.getItem(`${email}_startup_draft`);
        if (savedDraft) {
          try {
            const parsed = JSON.parse(savedDraft);
            if (parsed.startupDetails) {
              setStartupDetails(parsed.startupDetails);
            }
          } catch (e) {}
        } else {
          setStartupDetails({
            startupName: '',
            startupDomain: '',
            problemStatement: '',
            startupDescription: '',
            targetAudience: '',
            geographicMarket: '',
            existingCompetitors: '',
            revenueModel: '',
            estimatedPricing: '',
            availableFunding: '',
            monthlyBurnCapacity: '',
            platformType: [],
            techComplexity: '',
            mvpTimeline: '',
            scalabilityGoal: '',
            acquisitionStrategy: '',
            startupStage: '',
          });
        }
        setAnalysisScores(null);
        setRoadmapNodes([]);
      }

      // Load settings
      const savedSettings = localStorage.getItem(`${email}_startup_settings`);
      setSettings(savedSettings ? JSON.parse(savedSettings) : {
        theme: 'Dark Futurism',
        notificationsEnabled: true,
        autoSaveDrafts: true,
        analysisPreference: 'Comprehensive'
      });

      // Load onboarding draft
      const savedDraft = localStorage.getItem(`${email}_startup_draft`);
      if (savedDraft) {
        try {
          const parsed = JSON.parse(savedDraft);
          if (parsed.role) setOnboardingRole(parsed.role);
          setResumeState(true);
        } catch (e) {}
      } else {
        setOnboardingRole({
          fullName: user.fullName || '',
          age: '',
          gender: '',
          city: '',
          country: '',
          profession: '',
          experience: '',
          founderCount: '',
          founderSkillset: [],
        });
        setResumeState(false);
      }
    } else if (!isLoggedIn) {
      // Clear/Reset in-memory states to prevent data leakage for unauthenticated states
      setStartupDetails({
        startupName: '',
        startupDomain: '',
        problemStatement: '',
        startupDescription: '',
        targetAudience: '',
        geographicMarket: '',
        existingCompetitors: '',
        revenueModel: '',
        estimatedPricing: '',
        availableFunding: '',
        monthlyBurnCapacity: '',
        platformType: [],
        techComplexity: '',
        mvpTimeline: '',
        scalabilityGoal: '',
        acquisitionStrategy: '',
        startupStage: '',
      });
      setAnalysisScores(null);
      setAnalysisHistory([]);
      setRoadmapNodes([]);
      setOnboardingRole({
        fullName: '',
        age: '',
        gender: '',
        city: '',
        country: '',
        profession: '',
        experience: '',
        founderCount: '',
        founderSkillset: [],
      });
      setResumeState(false);
    }
  }, [user.email, isLoggedIn]);

  // Synchronous State Commit
  const loginUser = (email, password, name = 'Innovator') => {
    const savedHistory = localStorage.getItem(`${email}_startup_history`);
    const hasHistory = savedHistory ? JSON.parse(savedHistory).length > 0 : false;

    const activeUser = {
      fullName: name,
      email: email,
      role: 'Founder',
      avatarUrl: user.avatarUrl || '',
      isNewUser: false,
      onboardingCompleted: true // never force redirect to onboarding on login
    };
    setUser(activeUser);
    setIsLoggedIn(true);
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('startup_user', JSON.stringify(activeUser));
    localStorage.setItem('startupxpert_user', JSON.stringify(activeUser));
  };

  const registerUser = (fullName, email, role) => {
    const activeUser = {
      fullName,
      email,
      role,
      avatarUrl: '',
      isNewUser: true,
      onboardingCompleted: true // don't force 3-step flow on login/register
    };
    setUser(activeUser);
    setIsLoggedIn(true);
    setOnboardingRole(prev => ({ ...prev, fullName }));
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('startup_user', JSON.stringify(activeUser));
    localStorage.setItem('startupxpert_user', JSON.stringify(activeUser));
  };

  const logoutUser = () => {
    setIsLoggedIn(false);
    setUser({ fullName: '', email: '', role: 'Founder', avatarUrl: '' });
    
    // Purge localStorage keys explicitly as requested
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('startup_user');
    localStorage.removeItem('startupxpert_user');
    localStorage.removeItem('startup_roadmap'); // Clear customized nodes
    localStorage.removeItem('active_startup_details');
    localStorage.removeItem('active_analysis_scores');
    
    // Reset nodes
    setRoadmapNodes([]);

    // Clear onboarding states
    setOnboardingRole({
      fullName: '',
      age: '',
      gender: '',
      city: '',
      country: '',
      profession: '',
      experience: '',
      founderCount: '',
      founderSkillset: [],
    });
    setStartupDetails({
      startupName: '',
      startupDomain: '',
      problemStatement: '',
      startupDescription: '',
      targetAudience: '',
      geographicMarket: '',
      existingCompetitors: '',
      revenueModel: '',
      estimatedPricing: '',
      availableFunding: '',
      monthlyBurnCapacity: '',
      platformType: [],
      techComplexity: '',
      mvpTimeline: '',
      scalabilityGoal: '',
      acquisitionStrategy: '',
      startupStage: '',
    });
    setAnalysisScores(null);
    setResumeState(false);
    showToast('Logged out successfully.', 'info');
  };

  const setUserInfo = (userInfo) => {
    setUser(userInfo);
    localStorage.setItem('startup_user', JSON.stringify(userInfo));
    localStorage.setItem('startupxpert_user', JSON.stringify(userInfo));
  };

  const setNewUserStatus = (status) => {
    setUser(prev => {
      const updated = { ...prev, isNewUser: status };
      localStorage.setItem('startup_user', JSON.stringify(updated));
      localStorage.setItem('startupxpert_user', JSON.stringify(updated));
      return updated;
    });
  };

  const saveSettings = (newSettings) => {
    setLoadingState(true);
    setTimeout(() => {
      setSettings(newSettings);
      if (user && user.email) {
        localStorage.setItem(`${user.email}_startup_settings`, JSON.stringify(newSettings));
      }
      setLoadingState(false);
      showToast('Settings saved successfully!', 'success');
    }, 800);
  };

  const resetSettingsDefaults = () => {
    const defaults = {
      theme: 'Dark Futurism',
      notificationsEnabled: true,
      autoSaveDrafts: true,
      analysisPreference: 'Comprehensive'
    };
    setSettings(defaults);
    if (user && user.email) {
      localStorage.setItem(`${user.email}_startup_settings`, JSON.stringify(defaults));
    }
    showToast('Settings reset to defaults.', 'info');
  };

  const setStartupInfo = (info) => {
    setStartupDetails(prev => ({ ...prev, ...info }));
  };

  const setLoading = (loading) => {
    setLoadingState(loading);
  };

  const setError = (err) => {
    setErrorState(err);
  };

  // Onboarding Setup Setters
  const updateOnboardingRole = (fields) => {
    setOnboardingRole(prev => ({
      ...prev,
      ...fields
    }));
    if (fields.fullName) {
      const updatedUser = { ...user, fullName: fields.fullName };
      setUser(updatedUser);
      localStorage.setItem('startup_user', JSON.stringify(updatedUser));
    }
  };

  const updateStartupDetails = (fieldName, value) => {
    setStartupDetails(prev => {
      const updated = { ...prev, [fieldName]: value };
      if (settings.autoSaveDrafts) {
        saveDraftSilent(updated);
      }
      return updated;
    });
  };

  const updateStartupDetailsBulk = (data) => {
    setStartupDetails(prev => {
      const updated = { ...prev, ...data };
      if (settings.autoSaveDrafts) {
        saveDraftSilent(updated);
      }
      return updated;
    });
  };

  // Onboarding draft storage auto-saves
  const saveDraftSilent = (currentDetails) => {
    const draftPayload = {
      onboardingRole,
      startupDetails: currentDetails,
      currentStep,
      timestamp: Date.now()
    };
    if (user && user.email) {
      localStorage.setItem(`${user.email}_startup_draft`, JSON.stringify(draftPayload));
    }
  };

  const saveDraft = (stepIndex, activeDetails) => {
    setLoadingState(true);
    setTimeout(() => {
      const draftPayload = {
        onboardingRole,
        startupDetails: activeDetails || startupDetails,
        currentStep: stepIndex !== undefined ? stepIndex : currentStep,
        timestamp: Date.now()
      };
      if (user && user.email) {
        localStorage.setItem(`${user.email}_startup_draft`, JSON.stringify(draftPayload));
      }
      setResumeState(true);
      setLoadingState(false);
      showToast('Startup draft auto-saved successfully!', 'success');
    }, 800);
  };

  const restoreDraft = () => {
    const email = user.email || getSavedUserEmail();
    const key = email ? `${email}_startup_draft` : 'startup_draft';
    const savedDraft = localStorage.getItem(key);
    if (savedDraft) {
      setLoadingState(true);
      const parsed = JSON.parse(savedDraft);
      
      if (parsed.onboardingRole) setOnboardingRole(parsed.onboardingRole);
      if (parsed.startupDetails) setStartupDetails(parsed.startupDetails);
      if (parsed.currentStep !== undefined) setCurrentStep(parsed.currentStep);
      
      setResumeState(false);
      setLoadingState(false);
      showToast('Onboarding progress draft restored!', 'success');
      return parsed;
    }
    showToast('No active draft found.', 'error');
    return null;
  };

  const clearDraft = () => {
    if (user && user.email) {
      localStorage.removeItem(`${user.email}_startup_draft`);
    }
    setResumeState(false);
    setCurrentStep(0);
  };

  // History & score archiving operations
  const appendHistory = (entry) => {
    const updated = [entry, ...analysisHistory];
    setAnalysisHistory(updated);
    if (user && user.email) {
      localStorage.setItem(`${user.email}_startup_history`, JSON.stringify(updated));
    }
  };

  const startNewValidation = () => {
    // Reset active workspace states in context
    setStartupDetails({
      startupName: '',
      startupDomain: '',
      problemStatement: '',
      startupDescription: '',
      targetAudience: '',
      geographicMarket: '',
      existingCompetitors: '',
      revenueModel: '',
      estimatedPricing: '',
      availableFunding: '',
      monthlyBurnCapacity: '',
      platformType: [],
      techComplexity: '',
      mvpTimeline: '',
      scalabilityGoal: '',
      acquisitionStrategy: '',
      startupStage: '',
    });
    setAnalysisScores(null);
    setRoadmapNodes([]);
    
    // Clear any previous draft
    clearDraft();
    
    // Reset onboarding role fields (keep fullName from user profile)
    setOnboardingRole({
      fullName: user.fullName || '',
      age: '',
      gender: '',
      city: '',
      country: '',
      profession: '',
      experience: '',
      founderCount: '',
      founderSkillset: [],
    });

    // Reset onboarding step counter
    setCurrentStep(0);
    
    // Explicitly delete user-scoped active keys from localStorage
    if (user && user.email) {
      localStorage.removeItem(`${user.email}_active_startup_details`);
      localStorage.removeItem(`${user.email}_active_analysis_scores`);
      localStorage.removeItem(`${user.email}_startup_roadmap`);
      localStorage.removeItem(`${user.email}_startup_draft`);
    }
  };

  const saveAnalysis = (scoresToSave) => {
    setLoadingState(true);
    setTimeout(() => {
      const activeScores = scoresToSave || analysisScores;
      if (!activeScores) {
        setLoadingState(false);
        showToast('No active analysis scores available to save.', 'error');
        return;
      }

      const newHistoryEntry = {
        id: Math.random().toString(36).substring(2, 9),
        startupName: startupDetails.startupName || 'Unnamed Venture',
        date: new Date().toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        scores: activeScores,
        risk: activeScores.riskLevel?.status || 'Medium',
        status: activeScores.feasibility?.status || 'High',
        summary: activeScores.marketDemand?.details || 'Feasibility analysis report compiled.',
        details: { ...startupDetails }
      };

      appendHistory(newHistoryEntry);
      clearDraft();
      
      // Generate dynamically tailored startup roadmap
      const startupType = getStartupType(startupDetails);
      const generatedNodes = generateRoadmapForType(startupType, startupDetails, activeScores);
      setRoadmapNodes(generatedNodes);
      if (user && user.email) {
        localStorage.setItem(`${user.email}_startup_roadmap`, JSON.stringify(generatedNodes));
      }

      // Update onboarding status to completed
      setUser(prev => {
        const updated = { ...prev, onboardingCompleted: true };
        localStorage.setItem('startup_user', JSON.stringify(updated));
        localStorage.setItem('startupxpert_user', JSON.stringify(updated));
        return updated;
      });

      setLoadingState(false);
      showToast('Feasibility analysis archived successfully! Onboarding complete.', 'success');
    }, 1000);
  };

  const updateRoadmapNode = (id, updatedFields) => {
    setRoadmapNodes(prev => prev.map(node => node.id === id ? { ...node, ...updatedFields } : node));
  };

  const addRoadmapNode = (parentId, title, description) => {
    const newNode = {
      id: `custom-node-${Date.now()}`,
      parentId: parentId || 'root',
      title: title || 'Custom Milestone',
      description: description || 'No description provided.',
      status: 'Pending',
      priority: 'Medium',
      isExpanded: true,
      tasks: [],
      notes: [],
      recommendations: 'Identify specific targets and run iterative validations for this custom milestone.'
    };
    setRoadmapNodes(prev => [...prev, newNode]);
    showToast(`Added child node "${title}" successfully.`, 'success');
  };

  const deleteRoadmapNode = (id) => {
    if (id === 'root') {
      showToast('Cannot delete the root Startup Launchpad node.', 'error');
      return;
    }
    const getDescendantIds = (nodeId, nodesList) => {
      const children = nodesList.filter(n => n.parentId === nodeId);
      let ids = children.map(c => c.id);
      children.forEach(c => {
        ids = [...ids, ...getDescendantIds(c.id, nodesList)];
      });
      return ids;
    };

    setRoadmapNodes(prev => {
      const toDelete = [id, ...getDescendantIds(id, prev)];
      return prev.filter(node => !toDelete.includes(node.id));
    });
    showToast('Node and its branches deleted.', 'info');
  };

  const manageSubTask = (nodeId, action, taskPayload) => {
    setRoadmapNodes(prev => prev.map(node => {
      if (node.id !== nodeId) return node;
      
      let updatedTasks = [...node.tasks];
      if (action === 'add') {
        updatedTasks.push({
          id: `task-${Date.now()}`,
          text: taskPayload.text,
          completed: false
        });
      } else if (action === 'toggle') {
        updatedTasks = updatedTasks.map(t => t.id === taskPayload.id ? { ...t, completed: !t.completed } : t);
      } else if (action === 'delete') {
        updatedTasks = updatedTasks.filter(t => t.id !== taskPayload.id);
      }
      return { ...node, tasks: updatedTasks };
    }));
  };

  const manageNote = (nodeId, action, notePayload) => {
    setRoadmapNodes(prev => prev.map(node => {
      if (node.id !== nodeId) return node;
      
      let updatedNotes = [...node.notes];
      if (action === 'add') {
        updatedNotes.push({
          id: `note-${Date.now()}`,
          text: notePayload.text,
          timestamp: Date.now()
        });
      } else if (action === 'delete') {
        updatedNotes = updatedNotes.filter(n => n.id !== notePayload.id);
      }
      return { ...node, notes: updatedNotes };
    }));
  };

  const deleteHistoryItem = (id) => {
    setLoadingState(true);
    setTimeout(() => {
      const updated = analysisHistory.filter((item) => item.id !== id);
      setAnalysisHistory(updated);
      if (user && user.email) {
        localStorage.setItem(`${user.email}_startup_history`, JSON.stringify(updated));
      }
      setLoadingState(false);
      showToast('Analysis entry deleted from history.', 'info');
    }, 600);
  };

  const restoreStartupVenture = (item) => {
    setLoadingState(true);
    setTimeout(() => {
      setAnalysisScores(item.scores);
      
      const restoredDetails = item.details || {
        startupName: item.startupName,
        startupDomain: item.scores.marketDemand ? 'SaaS' : 'Other',
        revenueModel: item.scores.revenuePotential ? 'Subscription' : 'Other',
        availableFunding: 'Bootstrapped',
        mvpTimeline: '3 months',
        platformType: ['Web App'],
        problemStatement: 'Restored from history.',
        startupDescription: item.summary || 'Restored historical venture profile.',
        targetAudience: 'Early adopters',
        startupStage: item.status || 'Ready'
      };
      setStartupDetails(restoredDetails);
      
      // Generate roadmap nodes for this restored item
      const startupType = getStartupType(restoredDetails);
      const generatedNodes = generateRoadmapForType(startupType, restoredDetails, item.scores);
      setRoadmapNodes(generatedNodes);
      if (user && user.email) {
        localStorage.setItem(`${user.email}_startup_roadmap`, JSON.stringify(generatedNodes));
      }
      
      // Sync user onboarding completed status
      setUser(prev => {
        const updated = { ...prev, onboardingCompleted: true };
        localStorage.setItem('startup_user', JSON.stringify(updated));
        localStorage.setItem('startupxpert_user', JSON.stringify(updated));
        return updated;
      });

      setLoadingState(false);
      showToast(`"${item.startupName}" loaded as active venture!`, 'success');
    }, 800);
  };

  const duplicateHistoryItem = (item) => {
    setLoadingState(true);
    setTimeout(() => {
      const duplicated = {
        ...item,
        id: Math.random().toString(36).substring(2, 9),
        startupName: `${item.startupName} (Copy)`,
        date: new Date().toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      };
      const updated = [duplicated, ...analysisHistory];
      setAnalysisHistory(updated);
      if (user && user.email) {
        localStorage.setItem(`${user.email}_startup_history`, JSON.stringify(updated));
      }
      setLoadingState(false);
      showToast(`Duplicated "${item.startupName}" as new venture!`, 'success');
    }, 600);
  };

  const clearHistory = () => {
    setLoadingState(true);
    setTimeout(() => {
      setAnalysisHistory([]);
      if (user && user.email) {
        localStorage.removeItem(`${user.email}_startup_history`);
      }
      setLoadingState(false);
      showToast('All analysis records cleared.', 'info');
    }, 800);
  };

  const runAnalysis = () => {
    setIsAnalyzing(true);
    setAnalysisScores(null);
    setNewUserStatus(false); // Persist isNewUser=false after first validation
    
    setTimeout(() => {
      const mockResult = {
        marketDemand: { score: 84, status: 'High', details: 'Significant demand driven by rapid digital transformation.' },
        targetAudienceFit: { score: 79, status: 'High', details: 'Niche demographics show high initial willingness to pay.' },
        problemSolutionFit: { score: 88, status: 'High', details: 'Directly addresses friction points identified in user studies.' },
        competitorPresence: { score: 45, status: 'Medium', details: 'Moderately crowded space; unique visual workflows recommended.' },
        revenuePotential: { score: 74, status: 'High', details: 'Subscription-based models support robust recurring revenues.' },
        riskLevel: { score: 38, status: 'Low', details: 'Low regulatory hurdles and low initial capital expenditure.' },
        innovationLevel: { score: 81, status: 'High', details: 'Proprietary automated workflow separates it from incumbents.' },
        scalability: { score: 92, status: 'High', details: 'Zero-marginal-cost distribution models permit rapid growth.' },
        feasibility: { score: 72, status: 'Medium', details: 'Requires specialized tech execution but within standard roadmap.' }
      };
      setAnalysisScores(mockResult);
      setIsAnalyzing(false);

    }, 2000);
  };

  const dashboardStats = {
    totalStartups: analysisHistory.length,
    completedAnalysis: analysisHistory.filter((h) => h.scores).length,
    savedDraftCount: resumeState ? 1 : 0,
    roadmapProgress: analysisHistory.length > 0 ? '4 / 10' : '0 / 10',
  };

  // Helper: Get Name Initials
  const getInitials = () => {
    if (!user.fullName) return 'IN';
    return user.fullName
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <StartupContext.Provider
      value={{
        user,
        isLoggedIn,
        settings,
        onboardingRole,
        startupDetails,
        analysisScores,
        isAnalyzing,
        analysisHistory,
        loadingState,
        errorState,
        currentStep,
        resumeState,
        dashboardStats,
        roadmapNodes,

        loginUser,
        registerUser,
        logoutUser,
        setUserInfo,
        saveSettings,
        resetSettingsDefaults,
        updateOnboardingRole,
        updateStartupDetails,
        updateStartupDetailsBulk,
        setStartupInfo,
        runAnalysis,
        setAnalysisScores,
        saveAnalysis,
        saveDraft,
        restoreDraft,
        clearDraft,
        deleteHistoryItem,
        restoreStartupVenture,
        duplicateHistoryItem,
        clearHistory,
        setLoading,
        setError,
        setCurrentStep,
        getInitials,
        setNewUserStatus,
        updateRoadmapNode,
        addRoadmapNode,
        deleteRoadmapNode,
        manageSubTask,
        manageNote,
        startNewValidation
      }}
    >
      {children}
    </StartupContext.Provider>
  );
};

export default StartupContext;

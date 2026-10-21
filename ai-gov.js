/**
 * AI Governance Lifecycle Design Guide & SOW Builder
 * Enterprise Healthcare AI Governance Framework
 */

// ==========================================================================
// 1. Authentication & Session Gate
// ==========================================================================

const VALID_PASSWORDS = ['mabbattista@brooksource.com', 'ai26!', 'AI26!'];
const VALID_EDITOR_PASSWORDS = ['editor2026', 'edit2026', 'governance-edit', 'jeremy2026-admin'];

// Immediate authentication guard for protected governance pages
(function() {
    const page = window.location.pathname.split('/').pop();
    if (page === 'ai-gov-lifecycle.html' || page === 'ai-gov-alignment.html') {
        if (sessionStorage.getItem('ai_gov_auth') !== 'granted') {
            sessionStorage.setItem('ai_gov_redirect_after_login', page);
            window.location.replace('ai-gov-login.html');
        }
    }
})();

function handleLogin(event) {
    if (event) event.preventDefault();
    const input = document.getElementById('passwordInput');
    const errorMsg = document.getElementById('loginError');
    if (!input) return;

    const rawVal = input.value.trim();
    const lowerVal = rawVal.toLowerCase();

    // Verify authorized credentials
    const isAuthorized = VALID_PASSWORDS.some(pwd => pwd === rawVal || pwd.toLowerCase() === lowerVal);

    if (isAuthorized) {
        sessionStorage.setItem('ai_gov_auth', 'granted');
        if (errorMsg) errorMsg.style.display = 'none';

        // Redirect to intended target page if stored, otherwise default to lifecycle tool
        const target = sessionStorage.getItem('ai_gov_redirect_after_login') || 'ai-gov-lifecycle.html';
        sessionStorage.removeItem('ai_gov_redirect_after_login');
        window.location.href = target;
    } else {
        if (errorMsg) {
            errorMsg.textContent = 'Invalid access password. Please verify your credentials or contact Jeremy Lewis for authorization.';
            errorMsg.style.display = 'block';
        }
        input.focus();
        input.select();
    }
}

function togglePasswordVisibility() {
    const input = document.getElementById('passwordInput');
    const icon = document.getElementById('pwdEyeIcon');
    if (!input) return;

    if (input.type === 'password') {
        input.type = 'text';
        if (icon) icon.textContent = '🙈';
    } else {
        input.type = 'password';
        if (icon) icon.textContent = '👁️';
    }
}

function checkAuth() {
    const isAuth = sessionStorage.getItem('ai_gov_auth');
    if (isAuth !== 'granted') {
        const currentPage = window.location.pathname.split('/').pop() || 'ai-gov-lifecycle.html';
        if (currentPage && currentPage !== 'ai-gov-login.html') {
            sessionStorage.setItem('ai_gov_redirect_after_login', currentPage);
        }
        window.location.replace('ai-gov-login.html');
    }
}

function logoutPortal() {
    sessionStorage.removeItem('ai_gov_auth');
    sessionStorage.removeItem('ai_gov_editor_unlocked');
    window.location.href = 'ai-gov-login.html';
}

// --------------------------------------------------------------------------
// Editor Permission & Authentication Layer
// --------------------------------------------------------------------------

function isEditorAuthenticated() {
    return sessionStorage.getItem('ai_gov_editor_unlocked') === 'granted';
}

function promptEditorAuth(onSuccessCallback) {
    if (isEditorAuthenticated()) {
        if (typeof onSuccessCallback === 'function') onSuccessCallback();
        return;
    }

    ensureEditorAuthModal();

    const overlay = document.getElementById('editorAuthModalOverlay');
    const input = document.getElementById('editorAuthPasswordInput');
    const errorEl = document.getElementById('editorAuthError');
    const form = document.getElementById('editorAuthForm');

    if (!overlay) return;

    if (errorEl) errorEl.style.display = 'none';
    if (input) {
        input.value = '';
        setTimeout(() => input.focus(), 100);
    }

    overlay.classList.add('active');

    if (form) {
        form.onsubmit = (e) => {
            if (e) e.preventDefault();
            const enteredVal = input ? input.value.trim().toLowerCase() : '';
            if (VALID_EDITOR_PASSWORDS.includes(enteredVal)) {
                sessionStorage.setItem('ai_gov_editor_unlocked', 'granted');
                closeEditorAuthModal();
                const toast = document.getElementById('editSaveToast');
                if (toast) {
                    const text = document.getElementById('editSaveToastText');
                    if (text) text.textContent = '🔓 Editor access unlocked!';
                    toast.classList.add('show');
                    setTimeout(() => toast.classList.remove('show'), 3000);
                }
                if (typeof onSuccessCallback === 'function') {
                    onSuccessCallback();
                }
            } else {
                if (errorEl) {
                    errorEl.textContent = '⚠️ Incorrect editor password. Editing remains locked.';
                    errorEl.style.display = 'flex';
                }
                if (input) {
                    input.focus();
                    input.select();
                }
            }
        };
    }
}

function closeEditorAuthModal() {
    const overlay = document.getElementById('editorAuthModalOverlay');
    if (overlay) overlay.classList.remove('active');
}

function toggleEditorPasswordVisibility() {
    const input = document.getElementById('editorAuthPasswordInput');
    const icon = document.getElementById('editorAuthEyeIcon');
    if (!input) return;
    if (input.type === 'password') {
        input.type = 'text';
        if (icon) icon.textContent = '🙈';
    } else {
        input.type = 'password';
        if (icon) icon.textContent = '👁️';
    }
}

function lockEditorAccess() {
    sessionStorage.removeItem('ai_gov_editor_unlocked');
    if (typeof isEditModeActive !== 'undefined' && isEditModeActive) {
        toggleEditMode();
    }
    if (typeof isAlignmentEditActive !== 'undefined' && isAlignmentEditActive) {
        toggleAlignmentEditMode();
    }
    const toast = document.getElementById('editSaveToast');
    if (toast) {
        const text = document.getElementById('editSaveToastText');
        if (text) text.textContent = '🔒 Editor session locked.';
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3000);
    }
}

function ensureEditorAuthModal() {
    if (document.getElementById('editorAuthModalOverlay')) return;

    const modalHtml = `
    <div class="editor-auth-modal-overlay" id="editorAuthModalOverlay" role="dialog" aria-modal="true" aria-labelledby="editorAuthTitle">
        <div class="editor-auth-modal-card">
            <div class="editor-auth-header">
                <h3 id="editorAuthTitle">🔒 Editor Authorization</h3>
                <button type="button" class="close-modal-btn" onclick="closeEditorAuthModal()" aria-label="Close dialog">✕</button>
            </div>
            <form id="editorAuthForm" class="editor-auth-body" onsubmit="return false;">
                <p class="editor-auth-desc">
                    This capability allows live modification of framework content. Please enter the <strong>Editor Access Password</strong> to unlock editing capabilities.
                </p>
                <div class="editor-auth-input-group">
                    <input type="password" id="editorAuthPasswordInput" class="editor-auth-input" placeholder="Enter editor password..." autocomplete="current-password" required>
                    <button type="button" class="editor-auth-eye-btn" onclick="toggleEditorPasswordVisibility()" title="Toggle visibility">
                        <span id="editorAuthEyeIcon">👁️</span>
                    </button>
                </div>
                <div class="editor-auth-error" id="editorAuthError"></div>
                <div class="editor-auth-footer">
                    <button type="button" class="editor-auth-cancel-btn" onclick="closeEditorAuthModal()">Cancel</button>
                    <button type="submit" class="editor-auth-submit-btn" id="editorAuthSubmitBtn">
                        <span>🔓 Unlock Editor</span>
                    </button>
                </div>
            </form>
        </div>
    </div>`;

    document.body.insertAdjacentHTML('beforeend', modalHtml);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const overlay = document.getElementById('editorAuthModalOverlay');
            if (overlay && overlay.classList.contains('active')) {
                closeEditorAuthModal();
            }
        }
    });
}

// ==========================================================================
// 2. Lifecycle Workflow Dataset
// Exactly reflects the parent and child steps specified in the design guide
// ==========================================================================

const LIFECYCLE_STAGES = [
    {
        "id": 1,
        "slug": "proposal-capture",
        "name": "AI Proposal Capture",
        "shortName": "1. Proposal Capture",
        "hasGate": false,
        "summary": "Establish systematic and standardized intake for proposed AI use cases, establishing early business problem clarity and initial feasibility filtering.",
        "objective": "Capture and refine business demand before committing significant engineering or procurement investment.",
        "substeps": [
            {
                "id": "1-1",
                "name": "Capture Process",
                "tag": "Governance",
                "tasks": [
                    "Implement standardized intake portal for business stakeholders across operational lanes.",
                    "Define core problem statement and the impacted audience.",
                    "Identify the business sponsor and expected operational value hypothesis.",
                    "Register and catalog proposals within the official enterprise AI inventory.",
                    "Classify proposed AI capability (e.g. Clinical summarization, Predictive scheduling, Agentic automation)."
                ],
                "deliverable": "Standardized AI Intake Form & Official AI Inventory",
                "deliverableDesc": "Standardized intake documentation capturing proposal context, executive sponsor, business objective, target users, and formal creation of the official AI inventory entry.",
                "insight": "Establishing a centralized intake process and promoting it encourages everyone to share their ideas where AI could be applied and contributes to creating a culture of inclusion and safety by demonstrating that ideas are welecomed and undergo a formal review process."
            },
            {
                "id": "1-2",
                "name": "Proposal Content",
                "tag": "Strategy",
                "tasks": [
                    "Document strategic enterprise alignment and departmental priority.",
                    "Identify initial high-level user persona by applying product management principles. (clinicians, operators, or patient-facing).",
                    "Identify the executive sponsor and document the value proposition hypothesis, e.g. productivity gains, workforce reduction, improved business outcomes, etc.  Include when the value will be realized.  Identify the required data to support the AI solution.",
                    "State baseline metrics to evaluate against (status-quo operating benchmark).  These baseline metrics will serve as the thresholds to guage success."
                ],
                "deliverable": "AI Value Hypothesis & Business Case Brief",
                "deliverableDesc": "Capture the details of the problem to be solved, how it's managed today, target outcomes, and justification.",
                "insight": "Clearly defining whether the goal is cost-reduction, capacity creation, or improved business outcomes establishes a level of transparency and accountability.  Reviewing baseline metrics is important because they determine what the AI solution has to acheive to be equal or better than the current solution."
            },
            {
                "id": "1-3",
                "name": "Proposal Content Refinement",
                "tag": "Vetting",
                "tasks": [
                    "Conduct iterative discovery session with domain leads and operational specialists.  The executive sponsor must sign off on the proposal.",
                    "Filter out use cases better served by traditional analytics, robotic process automation (RPA), or workflow changes.",
                    "Perform initial technical feasibility assessment to ensure the appropriate infrastructure exist.",
                    "Conduct initial risk classification (Low, Medium, High / EU AI Act category)."
                ],
                "deliverable": "Refined Proposal & Feasibility Scorecard",
                "deliverableDesc": "Vetted proposal incorporating domain feedback and technical sanity check.",
                "insight": "The vast majority of AI proposals can likely be addressed by alternative technical and less costly solutions.  Leverage existing technology when possible."
            }
        ]
    },
    {
        "id": 2,
        "slug": "committee-awareness",
        "name": "AI Committee Awareness",
        "shortName": "2. Committee Awareness",
        "hasGate": true,
        "gateName": "Gate 1: Awareness & Charter Review",
        "summary": "Formal presentation to the AI Governance Committee for initial alignment, ethical vetting, scope review, impact assessment and core team chartering.",
        "objective": "Achieve multi-disciplinary alignment across Legal, Privacy, Compliance, IT, and Operations before design begins.",
        "substeps": [
            {
                "id": "2-1",
                "name": "Groom the Proposal",
                "tag": "Governance",
                "tasks": [
                    "Establish the context of the proposal and operational environment.",
                    "Review existing performance benchmarks and historical baseline metrics.",
                    "Ensure strategic alignment to the organization's overarching mission.",
                    "Identify suggested data sources to ensure appropriate and minimum use and check for completeness.  Anticipate and investigate potential data issues.",
                    "Perform a preliminary impact analysis across patient safety, privacy, and user trust.  Prepare a summary of your findings."
                ],
                "deliverable": "Preliminary AI Impact Analysis & Baseline AI Solution Details.",
                "deliverableDesc": "Contextual impact assessment evaluating mission alignment, data needs, and risk indicators.  This content provides the initial content for the Model Card and is the final preparation step before the initial AI Committee Review.",
                "insight": "A structured preliminary impact analysis forces you to consider factors that may ultimately cause your initiative to fail or become too costly to execute."
            },
            {
                "id": "2-2",
                "name": "Initial AI Committee Review",
                "tag": "Committee Gate",
                "tasks": [
                    "Present the preliminary impact analysis to the AI Governance Committee.  Each presentation should follow the same format to ensure efficiency and consistency.",
                    "Evaluate against ethical principles: fairness, explainability, safety, and accountability.  Be prepared to respond how each has been considered and the degree of risk associated with each.",
                    "Solicit early concerns from Legal, Compliance, Privacy, Medical, and Security stakeholders.  Prereads are crucial to address issues that may prevent the AI Committee from allowing the proposal to proceed.",
                    "Document committee stipulations, preconditions, and required safeguards."
                ],
                "deliverable": "AI Committee Initial Review Minutes & Action Matrix",
                "deliverableDesc": "Formal record of committee inquiries, required risk remediations, and decisions.  Continue to iterate the details of the model card.",
                "insight": "Involving key stakeholders upfront like Legal, Privacy, and HR fosters a collaborative partnership and avoids downstream delays and added cost due to rework."
            },
            {
                "id": "2-3",
                "name": "AI Committee Review Activation",
                "tag": "Governance",
                "tasks": [
                    "Formal activation of the project within the Enterprise AI Governance Registry.",
                    "Capture designated governance approvals across Compliance, Privacy, Regulatory, Legal, Medical, and Security.",
                    "Establish review cadence for subsequent lifecycle milestones.",
                    "Confirm project tracking in corporate risk registers."
                ],
                "deliverable": "Governance Registry Entry, Approvals, and the Defined Use Case",
                "deliverableDesc": "Official registry entry establishes scope of intended use, oversight cadence, and accountability leads.",
                "insight": "Every active AI project must live in a central registry to ensure visibility into cumulative enterprise AI portfolio.  Activation at this point does not suggest to start development, it means to move foreward gathering more information and maturing the design before the next review."
            },
            {
                "id": "2-4",
                "name": "Finalize Scope, Schedule, and Budget",
                "tag": "Operations",
                "tasks": [
                    "Define Minimum Viable Product (MVP) boundaries and pilot timeline.",
                    "Estimate solution costs like compute, cloud infrastructure, token consumption, and licensing budgets.  This is critical because it will directly influence if a solution can be feasible.",
                    "Draft milestone schedule spanning Solution Design through Pilot Completion.",
                    "Obtain formal financial authorization from executive sponsor."
                ],
                "deliverable": "Project Charter, Budget & Milestone Schedule",
                "deliverableDesc": "Comprehensive operational roadmap with resource allocations and milestones.  At this stage, the initial financial model is created and reviewed.",
                "insight": "AI cost estimation must include fixed and variable costs associated with continuous monitoring,model refinement, token usage, etc., not just upfront build hours.  Be sure to include employee training."
            },
            {
                "id": "2-5",
                "name": "Establish the Core Team",
                "tag": "Talent Management",
                "tasks": [
                    "Charter multi-disciplinary cross-functional team (Product Lead, AI Engineer, Data Engineer, UX Designer, Architecture, Cybersecurity, Domain SME etc.).",
                    "Identify what training materials and format are best suited to prepare end-user for the adoption of the new workflow.",
                    "Establish clear Roles & Responsibilities (RACI Matrix).  THIS IS CRITICAL.",
                    "Conduct project kickoff establishing governance expectations and ethical boundaries.  Ensure every contributor has the ability to express concerns."
                ],
                "deliverable": "Cross-Functional RACI Matrix & Team Charter",
                "deliverableDesc": "Operational governance chart identifying decision-makers, contributors, and liaisons.",
                "insight": "Pairing technical engineers side-by-side with practicing Nurse Practitioners ensured the desired outcome was achieved and how the AI solution would integrate seamlessly into workflows."
            }
        ]
    },
    {
        "id": 3,
        "slug": "solution-design",
        "name": "Solution Design",
        "shortName": "3. Solution Design",
        "hasGate": true,
        "gateName": "Gate 2: Architecture & Vendor Review",
        "summary": "Architecting the technical, evaluating the data, selecting models or vendors, and identifying cybersecurity standards.",
        "objective": "Design a secure, scalable, and compliant AI architecture that satisfies technical and regulatory standards.",
        "substeps": [
            {
                "id": "3-1",
                "name": "Architecture",
                "tag": "Technical",
                "tasks": [
                    "Design end-to-end system topology (Cloud, On-Premise, Hybrid, Edge).",
                    "Define latency requirements, concurrency targets, and API gateway routing.",
                    "Architect fault-tolerance, scaling factors, load balancing, and monitoring solutions.",
                    "Map data storage, caching layers, and persistence mechanisms."
                ],
                "deliverable": "System Architecture Specification & Topology Diagram",
                "deliverableDesc": "Technical architecture blueprint with failover strategies and data flow maps.",
                "insight": "In healthcare, high availability is critical—every AI system must have an instantaneous fallback to standard manual workflow."
            },
            {
                "id": "3-2",
                "name": "Data Engineering",
                "tag": "Technical",
                "tasks": [
                    "Map enterprise data sources and establish data provenance lineage.  Apply the mimimal use standard.",
                    "Specify data ingestion methods (real-time streaming vs batch micro-pipelines).",
                    "Define data cleaning, normalization, and deduplication standards.",
                    "Establish data quality verification rules and schema drift alerts.",
                    "Create a list of data features that will need to be consturcted to support an AI solution."
                ],
                "deliverable": "Data Engineering & Provenance Specification",
                "deliverableDesc": "Data pipeline blueprints detailing origin, verifying right to use, appropriate fit, transformations, and quality validation checks. Ensure training data sets are profiled and archived.",
                "insight": "Data provenance is the foundation of defensible governance.  Incorporate Privacy By Design guidelines to ensure the data are protected."
            },
            {
                "id": "3-3",
                "name": "Model Selection",
                "tag": "Technical",
                "tasks": [
                    "Evaluate build vs buy vs non-AI solutions when considering the Total Cost of Ownership (TCO) amortized over 3 to 5 years.",
                    "Analyze licensing terms, commercial rights, and data confidentiality policies.",
                    "Benchmark model accuracy, hallucination rates, reasoning capability, and token cost.",
                    "Define temperature, top_p, and hyperparameter configuration baselines."
                ],
                "deliverable": "Model Selection Evaluation Matrix & Tradeoff Brief",
                "deliverableDesc": "Comparative analysis detailing accuracy benchmarks, licensing, latency, and cost.  Incorporate new information into the model card and update the financial pro forma.",
                "insight": "This is where experienced Product Managers prove their value: recognizing that many of these proposed AI use cases are better solved with conventional, non-AI approaches."
            },
            {
                "id": "3-4",
                "name": "Cybersecurity",
                "tag": "Security",
                "tasks": [
                    "Engage the Cybersecurity team to implement the appropriate defense mechanisms.",
                    "Design defenses against Prompt Injection, Data Poisoning, and Model Inversion.",
                    "Define Role-Based Access Controls (RBAC) and Least Privilege API key management.",
                    "Specify end-to-end encryption protocols (TLS 1.3 in transit, AES-256 at rest)."
                ],
                "deliverable": "AI Threat Model & Cybersecurity Architecture Document",
                "deliverableDesc": "Security posture specification detailing threat vectors, mitigation controls, and encryption.",
                "insight": "As the deployment of AI agents scales, cybersecurity risks grow exponentially—making Cybersecurity's role critical."
            },
            {
                "id": "3-5",
                "name": "Vendor Engagement",
                "tag": "Procurement",
                "tasks": [
                    "Audit third-party AI vendors for SOC2 Type II, ISO/IEC 42001, and HIPAA compliance.",
                    "Enforce strict Zero-Data-Retention (ZDR) clauses in vendor licensing agreements.",
                    "Verify vendor does NOT train public models on proprietary organizational data.",
                    "Review Business Associate Agreements (BAA) and SLA uptime guarantees."
                ],
                "deliverable": "Third-Party AI Vendor Audit & Security Clearance",
                "deliverableDesc": "Vendor security assessment verifying ZDR compliance, legal protections, exit strategy, model assessment and access to model cards, M&As, and SLAs.",
                "insight": "Thoroughly review all contractual terms and conditions. Stress-test your understanding through scenario-based role-playing—for example, \"What happens if the vendor declares bankruptcy following a data breach?"
            },
            {
                "id": "3-6",
                "name": "Second AI Committee Review",
                "tag": "Committee Gate",
                "tasks": [
                    "Present high-level development plan or selected vendor solution to the committee.  Identify any changes to the prior stated MVP criteria.  Update the Model Card.",
                    "Walk through cybersecurity mitigations, data provenance and engineering pipelines, and vendor audit.",
                    "Address committee inquiries regarding data privacy and IP protection.",
                    "Obtain formal Gate 2 approval to proceed into the active Development stage.",
                    "Review the financial feasibility of the project with Finance.  Ensure alignment on the approach, variables, and assumptions."
                ],
                "deliverable": "AI Committee Gate 2 Approval & Stipulations Record",
                "deliverableDesc": "Formal milestone sign-off allowing engineering and development to commence.  Ensure the initiative supports the organization's mission and strengthens it core competency or competitive edge.  The design should be mature, including which data are required, build vs buy, a mature impact assessment, which includes a financial feasibility review.",
                "insight": "Securing formal Gate 2 approval protects the team and ensures enterprise alignment before capital expenditure is allocated.  At this point all stakeholders should aligned and in support to fund the initiative."
            }
        ]
    },
    {
        "id": 4,
        "slug": "development",
        "name": "Development",
        "shortName": "4. Development",
        "hasGate": true,
        "gateName": "Gate 3: Readiness & Impact Review",
        "summary": "Engineering and build phase integrating Privacy by Design, robust data pipelines, UX workflows, rigorous model evaluation, and organizational readiness.",
        "objective": "Build a robust, human-centered AI solution with verified safety and verifiable source citations.",
        "substeps": [
            {
                "id": "4-1",
                "name": "Privacy by Design",
                "tag": "Privacy",
                "tasks": [
                    "Implement automated PII/PHI de-identification and redaction pipelines.",
                    "Explore or leverage Confidential Computing or Fully Homomorphic Encryption options.",
                    "Establish cryptographic hashing for persistent identifiers.",
                    "Update the Privacy Impact Assessment (PIA) and verify jurisdictional compliance."
                ],
                "deliverable": "Privacy by Design Architecture & PIA Sign-Off",
                "deliverableDesc": "Validated redaction verification report and privacy compliance certificate.",
                "insight": "Ensure your Privacy Team is fully engaged and understands how privacy standards are being applied.   It builds trust and confidence."
            },
            {
                "id": "4-2",
                "name": "Data Pipelines",
                "tag": "Technical",
                "tasks": [
                    "Construct automated ETL/ELT pipelines with real-time error handling.",
                    "Implement end-to-end data lineage metadata tracking.",
                    "Integrate automated data validation tests prior to model ingestion.",
                    "Configure backup and recovery routines for pipeline infrastructure."
                ],
                "deliverable": "Automated Data Pipeline & Lineage Repository",
                "deliverableDesc": "Production-grade data ingestion pipelines with automated lineage logging.",
                "insight": "Automated data validation catches corrupted feeds before they propagate into downstream model decisions."
            },
            {
                "id": "4-3",
                "name": "Feature Creation and Selection",
                "tag": "Technical",
                "tasks": [
                    "Engineer domain-specific features with clinicians or SME input. Collaborate with SMEs to develop a data dictionary.  Consider how these features may be used in future models.",
                    "Analyze feature importance scores to ensure logical decision-making.",
                    "Perform demographic and fairness audits on feature distributions.",
                    "Eliminate proxy variables that inadvertently introduce disparate impact or bias."
                ],
                "deliverable": "Feature Store Catalog & Bias Audit Report",
                "deliverableDesc": "Documented feature catalog detailing importance metrics, lineage, and fairness checks.",
                "insight": "Partner with subject matter experts to ensure engineered features are understood and descriptively labelled.   This will accelerate adoption and build trust because they'll understand what features are driving AI decisions."
            },
            {
                "id": "4-4",
                "name": "Infrastructure",
                "tag": "Technical",
                "tasks": [
                    "Provision scalable cloud compute, GPU clusters, and serverless runtimes.  Set up cost-monitoring dashboards to establish expenditure benchmarks.",
                    "Implement containerization (Docker, Kubernetes) for environment consistency.",
                    "Configure Infrastructure as Code (Terraform) with automated guardrails.",
                    "Establish logging clusters and monitoring telemetry foundations."
                ],
                "deliverable": "Infrastructure as Code Repository & Telemetry Setup",
                "deliverableDesc": "Version-controlled infrastructure scripts and cluster monitoring hooks.",
                "insight": "Environment parity between staging and production minimizes time and cost by avoiding operational surprises when changing from one environment to another."
            },
            {
                "id": "4-5",
                "name": "Cybersecurity",
                "tag": "Security",
                "tasks": [
                    "Apply strict access controls and continuously monitor access logs.  Ensure all agents have minimum necessary access.",
                    "Perform penetration testing against API endpoints and LLM prompt interfaces.",
                    "Implement egress filtering to prevent unauthorized data exfiltration.",
                    "Audit secrets management and rotate production credentials."
                ],
                "deliverable": "Development Stage Penetration Test & Security Audit",
                "deliverableDesc": "Security validation certifying vulnerability resolution and API hardening.",
                "insight": "Automate continuous monitoring to establish usage patterns.  Require Humans to be On the Loop, not In the Loop."
            },
            {
                "id": "4-6",
                "name": "Workflow Integration (UX Design)",
                "tag": "UX Design",
                "tasks": [
                    "Design intuitive Human-in-the-Loop (HITL) interface tailored to end-user workflow.  Crosswalk the User Journey Map with the tool's workflow.",
                    "Embed dynamic hyperlinks to source documents for rapid clinical verification.",
                    "Display clear confidence levels and explainability indicators.",
                    "Implement frictionless 1-click feedback mechanics (Approve, Edit, Reject).",
                    "Review the user stories to ensue as the product matures, it addresses the four factors for a successful product:  Useful, Useable, Equitable, and Enjoyable."
                ],
                "deliverable": "Human-in-the-Loop UX Design System & Wireframes",
                "deliverableDesc": "Interactive interface designs prioritizing transparency, trust, and zero workflow friction.",
                "insight": "Embedding hyperlinks to quickly verify results was the #1 factor in driving clinical adoption.  This feature provided immediate reassurance the model was not hallucinating."
            },
            {
                "id": "4-7",
                "name": "Modeling and Preliminary Testing",
                "tag": "Technical",
                "tasks": [
                    "Fine-tune models and optimize prompt engineering templates.",
                    "Benchmark performance against gold-standard historical test datasets.",
                    "Evaluate accuracy, precision, recall, hallucination rate, and F1 scores.",
                    "Document known model limitations, boundary conditions, and failure modes.",
                    "Include a diverse group of users are involved in the initial testing to ensure the results are equitable.",
                    "Prepare a summary of the AI solution and how it was developed.   Acknowledge any varianced from the prior AI Committee approval and update the impact assessment.   Present the latest version of the model card."
                ],
                "deliverable": "Preliminary Model Card & Evaluation Benchmark Dossier",
                "deliverableDesc": "Comprehensive model card with accuracy metrics, known boundaries, and test results.  Capture all feedback and categorize as critical or 'nice to have'.",
                "insight": "Leverage the model card to promote transparency and inform users what the AI solution is capable and not capable of doing is key to establishing reasonable expectations."
            },
            {
                "id": "4-8",
                "name": "Third AI Committee Review",
                "tag": "Committee Gate",
                "tasks": [
                    "Present development status, revisit MVP criteria and acknowledge any variances, present preliminary lab test results, and any budget/schedule variances.",
                    "Present organization readiness status: employee training plans, escalation paths, and feedback loops.",
                    "Deliver updated Impact Analysis incorporating discoveries made during development.  Be clear where risk is apparent and how it was minimized.",
                    "Address committee concerns and obtain formal approval to proceed to Pilot Design."
                ],
                "deliverable": "AI Committee Gate 3 Review Memo & Readiness Sign-Off",
                "deliverableDesc": "Formal milestone approval certifying development completion and the AI model's pilot readiness.",
                "insight": "Sharing technical variances and documenting known risks builds trust through transparency.  Ensure the AI Review Committee is aligned and fully informed prior to obtaining approval to proceed."
            }
        ]
    },
    {
        "id": 5,
        "slug": "design-pilot",
        "name": "Design Pilot",
        "shortName": "5. Design Pilot",
        "hasGate": true,
        "gateName": "Gate 4: Pilot Authorization",
        "summary": "Rigorous structuring of a controlled pilot environment to validate solution selection, confirm organizational readiness, and establish safety protocols.",
        "objective": "Establish guardrails, control cohorts, and incident response procedures before live end-user deployment.",
        "substeps": [
            {
                "id": "5-1",
                "name": "Validate Solution Selection",
                "tag": "Validation",
                "tasks": [
                    "Validate that the created or purchased solution solves the stated business problem.",
                    "Compare solution capabilities against original baseline intake requirements.",
                    "Verify that data integration and inference speed meet real-time operational needs.",
                    "Confirm system stability under simulated peak load conditions.",
                    "Evaluate how a purchased solution will integrate into a workflow.  Include users to ensure they have input."
                ],
                "deliverable": "Solution Fit & Performance Validation Dossier",
                "deliverableDesc": "Formal validation report proving solution satisfies all initial functional requirements.",
                "insight": "Never launch a pilot until you have proven the solution can handle the expected load of the pilot."
            },
            {
                "id": "5-2",
                "name": "Confirm Organization Readiness",
                "tag": "Change Management",
                "tasks": [
                    "Confirm completion of user training across pilot participant cohort.",
                    "Establish clear communication channels and operational escalation paths.",
                    "Confirm operational super-users and clinical champions are equipped to support peers.",
                    "Verify executive sponsor readiness for pilot launch announcement.",
                    "Review all workflow changes with users.  Identify areas of friction and discuss how they may be addressed."
                ],
                "deliverable": "Organizational Readiness & Change Management Plan",
                "deliverableDesc": "Training sign-off, user guide documentation, and operational escalation matrix.",
                "insight": "Ensure users feel supported and trained.  Change management is where AI often fails because of falese expectations or users are not properly trained.  Organizations that are rapidly adopting AI are redesigning workflows as opposed to layering in AI to existing workflows."
            },
            {
                "id": "5-3",
                "name": "Review Pilot Design",
                "tag": "Operations",
                "tasks": [
                    "Define pilot cohort size, geographic/facility locations, and participant selection criteria.  This is key to evaluate how well the model is fit to a live environment.",
                    "Establish control group for unbiased comparative analysis.",
                    "Specify pilot duration (e.g. 60–90 days) and weekly milestone review checkpoints.  Ensure business operators weigh in on the pilot duration to ensure the full operational cycle is completed.",
                    "Define quantitative success criteria (e.g. >35% documentation time savings, <2% error rate).  Ensure alignment between the executive sponsor and the deployers.   Any variance will immediately create friction."
                ],
                "deliverable": "Comprehensive Pilot Design Protocol & Success Metrics",
                "deliverableDesc": "Controlled trial protocol establishing cohort parameters, control metrics, and timeline.",
                "insight": "Establishing clear quantitative kill/go criteria before launching the pilot removes emotion from the expansion decision."
            },
            {
                "id": "5-4",
                "name": "Review Incident Management Plan",
                "tag": "Risk",
                "tasks": [
                    "Ensure all pilot participants understand how to provide immediate feedback.",
                    "Define severity levels (Sev-1 Critical, Sev-2 Major, Sev-3 Minor) for AI anomalies.  Establish explicit trigger thresholds for immediate pilot suspension.",
                    "Designate emergency response team (AI Lead, Clinical Lead, Legal Liaison, Security Lead).",
                    "Document manual fallback protocol ensuring zero disruption to patient care or business continuity."
                ],
                "deliverable": "AI Incident Management & Emergency Response Protocol",
                "deliverableDesc": "Standard operating procedure detailing anomaly detection, triage, and rollback switches.",
                "insight": "Most importantly, ensure pilot participants feel prepared and supported before the pilot commences.  Give them time to adjust and learn the new workflow.  Offer Office Hours to solicit feedback and be empathetic to what they're experiencing."
            },
            {
                "id": "5-5",
                "name": "Approval to Proceed to Pilot",
                "tag": "Committee Gate",
                "tasks": [
                    "Present pilot design protocol and incident management plan to AI Committee.",
                    "Conduct final cross-functional sign-off across Legal, Compliance, Privacy, and IT.",
                    "Confirm authorization to deploy to designated pilot user group.",
                    "Record formal Gate 4 approval in Enterprise AI Registry.",
                    "Solicit feedback from keystakeholders and address any concerns.",
                    "Approval from the executive sponsor is required."
                ],
                "deliverable": "Pilot Authorization Certificate & Gate 4 Sign-Off",
                "deliverableDesc": "AI Committee approval authorizing live pilot initiation.",
                "insight": "Formal pilot authorization means the entire leadership team shares accountability for the trial."
            }
        ]
    },
    {
        "id": 6,
        "slug": "evaluation-review",
        "name": "Evaluation and Review",
        "shortName": "6. Evaluation & Review",
        "hasGate": true,
        "gateName": "Gate 5: Production Deployment Gate",
        "summary": "Execution of the pilot, rigorous feedback gathering, telemetry analysis, and the critical Final AI Committee Review for full enterprise deployment.",
        "objective": "Empirically evaluate pilot outcomes, capture cost-per-execution, and earn final authorization for production deployment.",
        "substeps": [
            {
                "id": "6-1",
                "name": "Launch Pilot",
                "tag": "Operations",
                "tasks": [
                    "Execute controlled rollout to designated pilot user cohort.",
                    "Activate real-time telemetry, session recording, and diagnostic logging.",
                    "Provide white-glove floor support and office hours during week one.",
                    "Maintain continuous operational monitoring for immediate anomaly detection.",
                    "Review the incident management plan to ensure awareness and it is responsive in the time of need to the users.  If the pilot includes after hours use, support at that time must be available too."
                ],
                "deliverable": "Pilot Launch Protocol & Day-1 Telemetry Report",
                "deliverableDesc": "Operational launch documentation verifying smooth deployment to the trial cohort.",
                "insight": "Onsite presence during day 1 of an AI rollout reduces anxiety and immediately addresses early friction."
            },
            {
                "id": "6-2",
                "name": "Gather Feedback (Quant & Qual)",
                "tag": "UX Design",
                "tasks": [
                    "Deploy automated in-app micro-surveys at point of task completion.",
                    "Conduct structured qualitative interviews with pilot participants across user roles.",
                    "Ensure the surveys are well designed and the questions are capable of identifying root cause issues.",
                    "Capture unsolicited user feedback and operational sentiment trends."
                ],
                "deliverable": "Comprehensive Pilot Feedback Analysis Dossier",
                "deliverableDesc": "Mixed-methods analysis synthesizing quantitative adoption metrics and qualitative interviews.",
                "insight": "Be thoughtful on how you ask for feedback.  Offer a mix of multiple choice questions and open ended questions.   Reference the User Journey Map to help close any gaps between the expectation and reality."
            },
            {
                "id": "6-3",
                "name": "Test Logging and Usage Patterns",
                "tag": "Technical",
                "tasks": [
                    "Analyze token consumption distributions and identify usage outliers.",
                    "Evaluate prompt variations and user query patterns.",
                    "Verify full audit logging for regulatory compliance and traceability.",
                    "Audit edge-case interactions for unanticipated query formats."
                ],
                "deliverable": "Usage Pattern Analysis & Traceability Audit",
                "deliverableDesc": "Technical audit verifying logging fidelity, user interaction flows, and query patterns.",
                "insight": "Monitoring query patterns uncovers novel user workflows that can inspire powerful feature enhancements."
            },
            {
                "id": "6-4",
                "name": "Test Performance & Capture Execution Cost",
                "tag": "Finance",
                "tasks": [
                    "Measure end-to-end inference latency under varying network conditions.",
                    "Calculate precise cost-per-transaction, cost-per-user, and token expenditure.",
                    "Compare actual operating costs against original business case projections.",
                    "Identify opportunities for prompt caching or model distillation to lower unit economics.",
                    "Document any extreme or unusual outputs.  Each one shoud be investigated and addressed to ensure trust is not eroded.",
                    "Create a dashboard comparing baseline benchmarks to pilot benchmarks.   Transparency is key and a dashboard provides a tangible object for everyone to align to."
                ],
                "deliverable": "AI Unit Economics & Execution Cost Benchmark",
                "deliverableDesc": "Financial and performance analysis verifying ROI sustainability and operating margin impact.",
                "insight": "Unit economics must be proven at pilot scale; unexpected token costs multiply quickly across enterprise rollouts and can render the current design cost-prohibitive at scale."
            },
            {
                "id": "6-5",
                "name": "Prepare Initial Pilot Findings & Update Impact Analysis",
                "tag": "Strategy",
                "tasks": [
                    "Synthesize quantitative outcomes against pre-defined success metrics.",
                    "Update enterprise Impact Analysis based on empirical pilot data.",
                    "Document identified risks, near-misses, and successful mitigations.",
                    "Formulate recommendations for full deployment vs pilot expansion."
                ],
                "deliverable": "Interim Pilot Findings Report & Updated Impact Analysis",
                "deliverableDesc": "Executive summary detailing clinical/business ROI, updated risk profile, and recommendations.",
                "insight": "Data-driven pilot findings turn subjective information into evidence of success and opportunities."
            },
            {
                "id": "6-6",
                "name": "AI Committee Review (Pilot Expansion / Mid-Point)",
                "tag": "Committee Gate",
                "tasks": [
                    "Present interim pilot findings to the AI Governance Committee.",
                    "Solicit committee feedback on user adoption and clinical safety metrics.",
                    "Review pilot expansion design and expanded cohort impact.",
                    "Obtain formal approval for pilot expansion if staged scaling is required.",
                    "Include testimonials from end users.  Share the successes, surprises, and identified opportunities.  Categorize the feedback into buckets to help the AI Committee Members quickly digest the findings and focus on the critical discoveries."
                ],
                "deliverable": "Pilot Expansion Review Minutes & Authorization",
                "deliverableDesc": "Committee review record authorizing cohort scaling or phase advancement.",
                "insight": "Mid-point committee reviews maintain momentum and allow leadership to co-pilot scaling decisions."
            },
            {
                "id": "6-7",
                "name": "Final AI Committee Review (Production Gate)",
                "tag": "Committee Gate",
                "tasks": [
                    "Review final comprehensive pilot results and confirmed ROI metrics.",
                    "Review final updated Impact Analysis.",
                    "Review MLOps Readiness (automated deployment, rollback, monitoring).",
                    "Review final Model Card and operational boundaries.",
                    "Review final training and validation data supporting the AI solution.",
                    "Review business operations readiness across enterprise departments.",
                    "Review Incident Management Plan and 24/7 on-call escalation rotation.",
                    "Obtain Cybersecurity formal clearance and approval.",
                    "Secure final committee Approval for Enterprise Production Deployment.",
                    "Update the financial impact to ensure Finance is aligned to the expected benefit."
                ],
                "deliverable": "Production Deployment Authorization & Comprehensive Gate Dossier",
                "deliverableDesc": "Unanimous committee sign-off authorizing full enterprise rollout with complete governance backing.",
                "insight": "This rigorous 9-point final review is the capstone of a defensible enterprise AI governance program.   If followed directly, alignment is achieved with no surprises."
            }
        ]
    },
    {
        "id": 7,
        "slug": "deploy-monitor",
        "name": "Deploy and Monitor",
        "shortName": "7. Deploy & Monitor",
        "hasGate": false,
        "summary": "Production rollout accompanied by real-time MLOps telemetry, continuous drift monitoring, proactive feedback loops, and cost-containment guardrails.",
        "objective": "Maintain continuous safety, accuracy, cost-efficiency, and user satisfaction across production operations.",
        "substeps": [
            {
                "id": "7-1",
                "name": "Model Performance",
                "tag": "MLOps",
                "tasks": [
                    "Deploy automated drift detection algorithms monitoring input data distribution shift.",
                    "Track ongoing inference accuracy, precision, and hallucination rates in production.",
                    "Configure automated alerting for latency spikes or error rate surges.",
                    "Maintain continuous performance dashboards for technical and business leadership."
                ],
                "deliverable": "Production MLOps Telemetry & Drift Monitoring Dashboard",
                "deliverableDesc": "Real-time monitoring system alerting on data drift, concept drift, and performance drops.",
                "insight": "Models degrade over time as real-world data shifts. Continuous automated drift detection is non-negotiable."
            },
            {
                "id": "7-2",
                "name": "Feedback Loop",
                "tag": "UX Design",
                "tasks": [
                    "Capture continuous user ratings, correction inputs, and thumbs-up/down feedback.",
                    "Establish systematic weekly triage of flagged low-confidence or disputed outputs.",
                    "Route user feedback directly into prompt tuning and fine-tuning pipelines to continuously improve the model's performance.",
                    "Publish monthly user community updates highlighting user-driven system improvements.",
                    "Be transparent with the backlog of requested features to ensure employees feel their feedback is received."
                ],
                "deliverable": "Continuous Feedback Capture & Triage Pipeline",
                "deliverableDesc": "Integrated user feedback mechanism with automated triage routing and resolution SLAs.",
                "insight": "When users see their feedback driving tangible improvements, they become vocal advocates and feel an increased sense of ownership."
            },
            {
                "id": "7-3",
                "name": "Model Refinement",
                "tag": "Technical",
                "tasks": [
                    "Schedule periodic model re-training and prompt optimization cycles.",
                    "Conduct shadow testing of updated model candidates against production traffic.",
                    "Perform automated regression testing before deploying model updates.",
                    "Maintain version-controlled prompt registries with semantic rollback capabilities.",
                    "Update the model card after model refine so there's a history of each version and how the model was changed."
                ],
                "deliverable": "Model Refinement Protocol & Candidate Evaluation Matrix",
                "deliverableDesc": "Standardized update protocol ensuring enhancements do not introduce regressions.",
                "insight": "Never update a production model without shadow testing candidate models against live production queries."
            },
            {
                "id": "7-4",
                "name": "Impact Analysis",
                "tag": "Strategy",
                "tasks": [
                    "Measure ongoing operational time-savings, error reductions, and clinician satisfaction.",
                    "Quantify realized financial ROI against enterprise budget models.",
                    "Evaluate broader organizational effects (turnover reduction, patient throughput).",
                    "Present quarterly business realization reviews to executive steering committee."
                ],
                "deliverable": "Ongoing Business Value Realization & Impact Audit",
                "deliverableDesc": "Quarterly executive reporting package detailing verified ROI, throughput, and impact.",
                "insight": "At DaVita, demonstrating 43% documentation time-savings kept executive leadership enthusiastic about expanding AI."
            },
            {
                "id": "7-5",
                "name": "Cost-Containment",
                "tag": "Finance",
                "tasks": [
                    "Implement semantic response caching to eliminate redundant LLM inference calls.",
                    "Configure hard budget quotas and tiered rate limiting across departments.",
                    "Analyze token length optimizations to compress prompt payloads without losing quality.",
                    "Conduct monthly cloud compute and GPU allocation rightsizing reviews.",
                    "Continuously monitor the operations cost of the model relative the business benefit."
                ],
                "deliverable": "Cost Optimization Framework & Departmental Allocation Report",
                "deliverableDesc": "Financial governance controls preventing budget overruns through caching and rate limits.",
                "insight": "As frontier models continue to improve,  evalute if AI solutions in production are equally accurate using older LLMs.   This is an effective way to reduce cost."
            },
            {
                "id": "7-6",
                "name": "Incident Management",
                "tag": "Security",
                "tasks": [
                    "Maintain 24/7 incident response readiness.",
                    "Test automated circuit breakers that immediately decouple the model upon anomaly detection.",
                    "Conduct root-cause analyses (RCA) for all severity-ranked incidents within 48 hours.",
                    "Maintain transparent incident log accessible to Compliance and Legal liaisons."
                ],
                "deliverable": "Production Incident Response Runbook & RCA Archive",
                "deliverableDesc": "Emergency operational procedures, automated circuit breakers, and post-mortem templates.",
                "insight": "Immediate detection and containment of rogue actions demonstrates the effectiveness of your AI Governance program.   Present these events to the AI Committee to ensure they are aware to adjust the organization's risk tolerance level, if needed."
            },
            {
                "id": "7-7",
                "name": "Status Communications",
                "tag": "Governance",
                "tasks": [
                    "Publish monthly AI system status bulletins to user communities and operational business heads.",
                    "Deliver quarterly executive governance dashboards to C-suite and Board committees.",
                    "Communicate planned maintenance, feature additions, and scheduled model updates.",
                    "Ensure transparent reporting on safety metrics and incident resolutions."
                ],
                "deliverable": "Executive Governance Dashboard & User Newsletter",
                "deliverableDesc": "Standardized transparent communication packages tailored for users, leadership, and board.",
                "insight": "Proactive transparency builds stakeholder trust."
            }
        ]
    },
    {
        "id": 8,
        "slug": "post-deployment",
        "name": "Post-Deployment Reviews",
        "shortName": "8. Post-Deployment",
        "hasGate": false,
        "gateName": "Annual Governance Audit",
        "summary": "Long-term governance stewardship, annual impact audits, regulatory compliance certification, and structured end-of-life retirement planning.",
        "objective": "Ensure enduring compliance with evolving standards (NIST AI RMF, ISO 42001, EU AI Act) and plan graceful decommissioning.",
        "substeps": [
            {
                "id": "8-1",
                "name": "Impact Analysis",
                "tag": "Strategy",
                "tasks": [
                    "Conduct annual or semi-annual impact on AI solutions that are categorized as above moderate risk.",
                    "Evaluate long-term outcomes, employee retention and engagement, continue to offer AI training options.  Be responsive to any negative sentiment towards AI.",
                    "Evaluate the long-term societal and ethical impacts of deployed systems, focusing on shifts in human behavior and vulnerabilities introduced by over-reliance on automated decisions.\"",
                    "Benchmark performance against emerging state-of-the-art industry models."
                ],
                "deliverable": "Annual Strategic AI Impact Review & Longevity Audit",
                "deliverableDesc": "Comprehensive annual audit measuring longitudinal value, ethical safety, and market standing.",
                "insight": "Annual impact reviews ensure the organization continues to extract maximum value from AI solutions."
            },
            {
                "id": "8-2",
                "name": "AI Committee Updates",
                "tag": "Governance",
                "tasks": [
                    "Deliver an annual State of AI to the AI Governance Committee.  Include audit findings, recommendations, and mitigation efforts to known threats.",
                    "Review cumulative risk register and updated threat assessments.",
                    "Present recommendations for major architectural upgrades or model replacements.",
                    "Evaluate the ROI of each AI deployment to confirm maximum value capture and identify emerging, lower-cost alternatives"
                ],
                "deliverable": "Annual Board AI Governance Dossier & Re-Certification",
                "deliverableDesc": "Formal governance board re-certification certifying ongoing enterprise compliance.",
                "insight": "Conduct an annual review of the AI solutions that are deemed high risk to ensure the organization is managing liabilities."
            },
            {
                "id": "8-3",
                "name": "Regulatory Compliance",
                "tag": "Compliance",
                "tasks": [
                    "Benchmark the AI operating model against governance structures like NIST AI-RMF.",
                    "Evaluate the AI program's regulatory monitoring mechanisms and the implementation of evolving compliance requirements.",
                    "Assess obligations under the EU AI Act and state-level sector-specific AI legislation.",
                    "Verify HIPAA, HITECH, and GDPR data handling compliance documentation."
                ],
                "deliverable": "Multi-Standard Regulatory Compliance Dossier",
                "deliverableDesc": "Audit-ready compliance evidence package mapping controls to NIST, ISO, and statutory mandates.",
                "insight": "Proactive compliance auditing shields the organization against regulatory investigations and severe penalties."
            },
            {
                "id": "8-4",
                "name": "Model Performance",
                "tag": "Technical",
                "tasks": [
                    "Conduct annual longitudinal model degradation and bias drift audit.",
                    "Re-evaluate fairness metrics across protected demographic sub-populations.",
                    "Audit data retention policies and purge historical training caches according to policy.",
                    "Issue updated annual Model Card reflecting cumulative production refinements."
                ],
                "deliverable": "Annual Model Recertification & Bias Audit Report",
                "deliverableDesc": "Empirical recertification proving model accuracy and demographic parity over prolonged operation.",
                "insight": "AI Agents with autonomous decision-making capabilities should be audited quarterly to ensure they act within the defined boundaries.   Review logs, how they're making calls, and the accuracy of their decisions."
            },
            {
                "id": "8-5",
                "name": "End of Life",
                "tag": "Lifecycle Closure",
                "tasks": [
                    "Establish clear criteria and decision triggers for model sunsetting and decommissioning.",
                    "Detail the impact of decommissioning the model and define how the tasks or insights of the model will be replaced.",
                    "Execute certified cryptographic purging of proprietary training datasets and cache stores.",
                    "Archive model artifacts, code repositories, and governance audit trails for statutory retention.",
                    "Ensure the employees are aware and trained on the alternative workflow once the model is decommissioned."
                ],
                "deliverable": "AI Decommissioning Protocol & Knowledge Archival Plan",
                "deliverableDesc": "Complete sunsetting framework ensuring secure data purging, audit trail preservation, and migration.",
                "insight": "Governance doesn't end when a model is turned off—secure archival and data purging are essential for compliance.  Partner with Legal, Compliance, and Privacy to determine how long the data must be archived."
            }
        ]
    }
];

// Maturity Level definitions
const MATURITY_LEVELS = [
    { level: 1, name: "Initial / Ad Hoc", desc: "No formal governance; uncoordinated experimentation with unpredictable risk." },
    { level: 2, name: "Developing", desc: "Emerging awareness; informal project reviews; sporadic committee involvement." },
    { level: 3, name: "Defined", desc: "Standardized policies; formal stage-gates; documented risk matrices across lanes." },
    { level: 4, name: "Managed", desc: "Continuous MLOps telemetry; automated drift alerts; quantitative ROI tracking." },
    { level: 5, name: "Optimized", desc: "Proactive automated governance; dynamic board transparency; continuous audit-readiness." }
];

// ==========================================================================
// 3. Application State & Controller
// ==========================================================================

let activePhaseId = 1;
let currentViewMode = 'drilldown'; // 'drilldown' | 'highlevel'
let isEditModeActive = false;
let expandedSubsteps = new Set();

// Client assessment state
let phaseMaturityScores = {
    1: 2,
    2: 2,
    3: 3,
    4: 2,
    5: 2,
    6: 2,
    7: 1,
    8: 1
};

// Selected Statement of Work items: Set of substep IDs
let selectedSowItems = new Set([
    "1-1", "2-1", "2-2", "3-4", "4-1", "4-6", "5-3", "6-7", "7-1", "8-3"
]);

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    // Check auth on protected governance pages
    if (document.getElementById('lifecycleAppRoot') || document.querySelector('.alignment-page-container')) {
        checkAuth();
    }

    // Check if on lifecycle page
    if (document.getElementById('lifecycleAppRoot')) {
        checkAuth();

        // Handle direct jumps from Accountability Directory
        const jumpPhase = sessionStorage.getItem('ai_gov_jump_phase');
        if (jumpPhase) {
            const parsed = parseInt(jumpPhase);
            if (parsed >= 1 && parsed <= 8) {
                activePhaseId = parsed;
            }
            sessionStorage.removeItem('ai_gov_jump_phase');
        }

        // Dynamically synchronize total substeps count in headline
        const headlineCountEl = document.getElementById('totalSubstepsHeadlineCount');
        if (headlineCountEl) {
            const totalSubs = LIFECYCLE_STAGES.reduce((acc, s) => acc + (s.substeps ? s.substeps.length : 0), 0);
            headlineCountEl.textContent = `${totalSubs} Discrete Substeps & Deliverables`;
        }

        renderChevronStepper();
        renderPhaseDrilldown(activePhaseId);
        updateSowCounter();
        calculateOverallMaturity();

        // Setup real-time edit listener for contenteditable fields
        const drilldownContainer = document.getElementById('drilldownViewContainer');
        if (drilldownContainer) {
            drilldownContainer.addEventListener('input', (e) => {
                if (e.target && e.target.isContentEditable) {
                    captureElementEdit(e.target);
                }
            });
        }
    }
});

// ==========================================================================
// 4. View Rendering & Component Management
// ==========================================================================

function renderChevronStepper() {
    const stepperContainer = document.getElementById('chevronStepper');
    if (!stepperContainer) return;

    stepperContainer.innerHTML = LIFECYCLE_STAGES.map(stage => {
        const isActive = stage.id === activePhaseId;
        const gateClass = stage.hasGate ? 'has-review-gate' : '';
        return `
            <button class="chevron-step ${isActive ? 'active' : ''} ${gateClass}" 
                    onclick="selectPhase(${stage.id})" 
                    id="stepper-btn-${stage.id}"
                    title="${stage.name}">
                <span class="chevron-num">Phase ${stage.id}</span>
                <span class="chevron-title">${stage.name}</span>
            </button>
        `;
    }).join('');
}

function selectPhase(phaseId) {
    if (isEditModeActive) {
        flushAllEdits();
    }
    expandedSubsteps.clear();
    activePhaseId = phaseId;

    // Update Stepper active state
    document.querySelectorAll('.chevron-step').forEach(btn => btn.classList.remove('active'));
    const targetBtn = document.getElementById(`stepper-btn-${phaseId}`);
    if (targetBtn) {
        targetBtn.classList.add('active');
        targetBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }

    // Render detailed view
    renderPhaseDrilldown(phaseId);
}

// Render Phase Detailed Drilldown
function renderPhaseDrilldown(phaseId) {
    const container = document.getElementById('drilldownViewContainer');
    if (!container) return;

    const phase = LIFECYCLE_STAGES.find(s => s.id === phaseId);
    if (!phase) return;

    const currentScore = phaseMaturityScores[phaseId] || 1;
    const maturityObj = MATURITY_LEVELS.find(m => m.level === currentScore) || MATURITY_LEVELS[0];

    const gateBadgeHtml = phase.hasGate ? `
        <span class="phase-gate-badge">
            <span>🛡️</span>
            <span>${phase.gateName}</span>
        </span>
    ` : '';

    const substepsHtml = phase.substeps.map((substep, idx) => {
        const isSowChecked = selectedSowItems.has(substep.id);
        const isExpanded = expandedSubsteps.has(substep.id);

        return `
            <div class="substep-card ${isExpanded ? 'expanded' : ''}" id="substep-card-${substep.id}">
                <div class="substep-header" onclick="toggleSubstep('${substep.id}', event)">
                    <div class="substep-header-left">
                        <div class="substep-index-circle">${idx + 1}</div>
                        <div>
                            <h4 class="substep-title-text" ${isEditModeActive ? `contenteditable="true" data-edit-phase="${phase.id}" data-edit-substep="${substep.id}" data-edit-field="name" onblur="captureElementEdit(this)" spellcheck="false"` : ''}>${substep.name}</h4>
                        </div>
                        <div class="substep-header-tags">
                            <span class="substep-pill pill-governance">${substep.tag}</span>
                            ${isSowChecked ? '<span class="substep-pill pill-technical">✓ In Scope</span>' : ''}
                        </div>
                    </div>
                    <div class="substep-header-right">
                        <span class="expand-chevron-icon">▼</span>
                    </div>
                </div>

                <div class="substep-body" id="substep-body-${substep.id}">
                    <div class="substep-detail-grid">
                        <div class="substep-col">
                            <h4><span>📋</span> Key Tasks &amp; Operational Actions:</h4>
                            <ul class="action-task-list ${isEditModeActive ? 'edit-mode-task-list' : ''}">
                                ${substep.tasks.map((t, tIdx) => `
                                    <li class="task-list-item ${isEditModeActive ? 'editable-task-row' : ''}">
                                        <div class="task-text-content" ${isEditModeActive ? `contenteditable="true" data-edit-phase="${phase.id}" data-edit-substep="${substep.id}" data-edit-field="task" data-task-idx="${tIdx}" onkeydown="handleTaskKeydown(event, ${phase.id}, '${substep.id}', ${tIdx})" onblur="captureElementEdit(this)" spellcheck="false"` : ''}>${t}</div>
                                        ${isEditModeActive ? `<button type="button" class="btn-delete-task" onclick="removeBulletPoint(event, ${phase.id}, '${substep.id}', ${tIdx})" title="Delete bullet point" tabindex="-1">✕</button>` : ''}
                                    </li>
                                `).join('')}
                            </ul>

                            ${isEditModeActive ? `
                                <button type="button" class="btn-add-task-bullet" onclick="addBulletPoint(${phase.id}, '${substep.id}')" title="Add a new bullet point to this section">
                                    <span>➕ Add Bullet Point</span>
                                </button>
                            ` : ''}

                            <div class="executive-insight-box">
                                <div class="insight-author">
                                    <span>💡</span>
                                    <span>Executive Insight</span>
                                </div>
                                <p ${isEditModeActive ? `contenteditable="true" data-edit-phase="${phase.id}" data-edit-substep="${substep.id}" data-edit-field="insight" onblur="captureElementEdit(this)" spellcheck="false"` : ''}>${isEditModeActive ? substep.insight : `"${substep.insight}"`}</p>
                            </div>
                        </div>

                        <div class="substep-col">
                            <h4><span>📦</span> Key Deliverable &amp; Artifact:</h4>
                            <div class="deliverable-box">
                                <div class="deliverable-box-header">
                                    <span class="deliverable-label">Governance Deliverable</span>
                                </div>
                                <div class="deliverable-title" ${isEditModeActive ? `contenteditable="true" data-edit-phase="${phase.id}" data-edit-substep="${substep.id}" data-edit-field="deliverable" spellcheck="false"` : ''}>${substep.deliverable}</div>
                                <p class="deliverable-desc" ${isEditModeActive ? `contenteditable="true" data-edit-phase="${phase.id}" data-edit-substep="${substep.id}" data-edit-field="deliverableDesc" spellcheck="false"` : ''}>${substep.deliverableDesc}</p>
                            </div>

                            <label class="sow-checkbox-label" onclick="event.stopPropagation()">
                                <input type="checkbox" 
                                       id="chk-${substep.id}" 
                                       ${isSowChecked ? 'checked' : ''} 
                                       onchange="toggleSowItem('${substep.id}', '${escapeQuotes(substep.deliverable)}', '${escapeQuotes(phase.name)}')">
                                <div class="sow-checkbox-text">
                                    <strong>Include in Statement of Work (SOW)</strong>
                                    <span>Add this deliverable to client engagement scope</span>
                                </div>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    const maturityOptionsHtml = MATURITY_LEVELS.map(lvl => `
        <div class="maturity-level-option ${lvl.level === currentScore ? 'selected' : ''}" 
             onclick="setMaturity(${phaseId}, ${lvl.level})">
            <span class="level-num">Level ${lvl.level}</span>
            <span class="level-name">${lvl.name}</span>
            <span class="level-desc">${lvl.desc}</span>
        </div>
    `).join('');

    container.innerHTML = `
        <div class="phase-drilldown-card">
            <div class="phase-drilldown-header">
                <div class="phase-header-left">
                    <div class="phase-badge-row">
                        <span class="phase-number-tag">Phase ${phase.id} of 8</span>
                        ${gateBadgeHtml}
                    </div>
                    <h2>${phase.name}</h2>
                    <p class="phase-description-text" ${isEditModeActive ? `contenteditable="true" data-edit-phase="${phase.id}" data-edit-field="summary" spellcheck="false"` : ''}>${phase.summary}</p>
                </div>

                <div class="phase-header-right">
                    <div class="maturity-widget-title">Phase Maturity Assessment</div>
                    <div class="maturity-score-display">
                        <span class="maturity-stars">${'★'.repeat(currentScore)}${'☆'.repeat(5 - currentScore)}</span>
                        <span class="maturity-level-name">${maturityObj.name}</span>
                    </div>
                    <button type="button" class="phase-scope-selector-btn" onclick="openSowModal()">
                        View Statement of Work (${selectedSowItems.size} items) →
                    </button>
                </div>
            </div>

            <!-- Maturity Rater -->
            <div class="maturity-rater-container">
                <div class="maturity-rater-header">
                    <h4>Score your organization's current level of maturity for Phase ${phase.id}: ${phase.name}</h4>
                    <span style="font-size:0.85rem; color:#718096;">Click a level to benchmark current organizational capabilities</span>
                </div>
                <div class="maturity-levels-bar">
                    ${maturityOptionsHtml}
                </div>
            </div>

            <div class="substeps-section">
                <div class="substeps-section-title">
                    <span>Granular Substeps &amp; Action Deliverables</span>
                    <span class="substeps-count-pill">${phase.substeps.length} Substeps</span>
                </div>

                <div class="substeps-accordion-list">
                    ${substepsHtml}
                </div>
            </div>

            <!-- Navigation Stepper Footer -->
            <div class="stepper-nav-footer">
                <button type="button" class="nav-step-btn btn-secondary-flat" 
                        onclick="prevPhase()" ${phase.id === 1 ? 'disabled' : ''}>
                    ← Previous Phase
                </button>

                <div style="font-size:0.9rem; font-weight:600; color:#718096;">
                    Phase ${phase.id} of 8
                </div>

                <button type="button" class="nav-step-btn" 
                        onclick="nextPhase()" ${phase.id === 8 ? 'disabled' : ''}>
                    Next Phase →
                </button>
            </div>
        </div>
    `;

    renderChevronStepper();
}

function escapeQuotes(str) {
    return str.replace(/'/g, "\\'").replace(/"/g, '&quot;');
}

// Toggle individual substep accordion
function toggleSubstep(substepId, evt) {
    if (evt && evt.target && evt.target.isContentEditable) return;
    const card = document.getElementById(`substep-card-${substepId}`);
    if (card) {
        const isExp = card.classList.toggle('expanded');
        if (isExp) {
            expandedSubsteps.add(substepId);
        } else {
            expandedSubsteps.delete(substepId);
        }
    }
}

function expandAllSubsteps() {
    document.querySelectorAll('.substep-card').forEach(c => c.classList.add('expanded'));
    const phase = LIFECYCLE_STAGES.find(s => s.id === activePhaseId);
    if (phase) {
        phase.substeps.forEach(s => expandedSubsteps.add(s.id));
    }
}

function collapseAllSubsteps() {
    document.querySelectorAll('.substep-card').forEach(c => c.classList.remove('expanded'));
    expandedSubsteps.clear();
}

function nextPhase() {
    if (activePhaseId < 8) {
        selectPhase(activePhaseId + 1);
        window.scrollTo({ top: 380, behavior: 'smooth' });
    }
}

function prevPhase() {
    if (activePhaseId > 1) {
        selectPhase(activePhaseId - 1);
        window.scrollTo({ top: 380, behavior: 'smooth' });
    }
}

// ==========================================================================
// 5. Maturity Scoring Logic
// ==========================================================================

function setMaturity(phaseId, level) {
    phaseMaturityScores[phaseId] = level;
    calculateOverallMaturity();
    renderPhaseDrilldown(phaseId);
}

function calculateOverallMaturity() {
    const scores = Object.values(phaseMaturityScores);
    const sum = scores.reduce((a, b) => a + b, 0);
    const avg = (sum / scores.length).toFixed(1);

    const overallEl = document.getElementById('overallMaturityScoreBadge');
    if (overallEl) {
        overallEl.textContent = `${avg} / 5.0`;
    }

    return { avg, sum };
}

// ==========================================================================
// 6. Statement of Work (SOW) Logic
// ==========================================================================

function toggleSowItem(substepId, deliverableTitle, phaseName) {
    if (selectedSowItems.has(substepId)) {
        selectedSowItems.delete(substepId);
    } else {
        selectedSowItems.add(substepId);
    }
    updateSowCounter();
}

function updateSowCounter() {
    const badge = document.getElementById('sowCountBadge');
    if (badge) {
        badge.textContent = selectedSowItems.size;
    }
}

function openSowModal() {
    const modal = document.getElementById('sowModal');
    if (!modal) return;

    renderSowContent();
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeSowModal() {
    const modal = document.getElementById('sowModal');
    if (!modal) return;

    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

function renderSowContent() {
    const bodyContainer = document.getElementById('sowModalBody');
    if (!bodyContainer) return;

    const { avg } = calculateOverallMaturity();

    // Group selected deliverables by phase
    let selectedGrouped = [];
    LIFECYCLE_STAGES.forEach(phase => {
        const phaseItems = phase.substeps.filter(s => selectedSowItems.has(s.id));
        if (phaseItems.length > 0) {
            selectedGrouped.push({
                phaseName: phase.name,
                phaseId: phase.id,
                items: phaseItems
            });
        }
    });

    let groupedHtml = '';
    if (selectedGrouped.length === 0) {
        groupedHtml = `
            <div style="text-align:center; padding:3rem 1rem; color:#718096;">
                <p style="font-size:1.1rem; margin-bottom:1rem;">No deliverables currently selected.</p>
                <p>Browse the lifecycle phases and select the deliverables your organization requires assistance implementing.</p>
            </div>
        `;
    } else {
        groupedHtml = selectedGrouped.map(group => `
            <div class="sow-phase-block">
                <div class="sow-phase-header">
                    <span class="sow-phase-name">Phase ${group.phaseId}: ${group.phaseName}</span>
                    <span class="substep-pill pill-technical">${group.items.length} Deliverable(s)</span>
                </div>
                <ul class="sow-items-list">
                    ${group.items.map(item => `
                        <li>
                            <strong>${item.deliverable}</strong>: 
                            ${item.deliverableDesc} 
                            <span style="color:#718096; font-size:0.85rem;">(Ref: Substep ${item.name})</span>
                        </li>
                    `).join('')}
                </ul>
            </div>
        `).join('');
    }

    bodyContainer.innerHTML = `
        <div class="sow-metrics-banner">
            <div>
                <div class="sow-metric-val">${avg} / 5.0</div>
                <div class="sow-metric-lbl">Current Maturity Benchmark</div>
            </div>
            <div>
                <div class="sow-metric-val">${selectedSowItems.size}</div>
                <div class="sow-metric-lbl">Total Scoped Deliverables</div>
            </div>
            <div>
                <div class="sow-metric-val">${selectedGrouped.length} of 8</div>
                <div class="sow-metric-lbl">Active Governance Phases</div>
            </div>
        </div>

        <div class="sow-section">
            <h3>Executive Summary &amp; Engagement Scope</h3>
            <p style="font-size:0.95rem; line-height:1.7; color:#4a5568;">
                This Statement of Work reflects tailored advisory and implementation services. Based on the organizational AI governance maturity gap analysis, 
                the following prioritized governance artifacts and operational stage-gates have been selected for implementation.
            </p>
        </div>

        <div class="sow-section">
            <h3>Detailed Scoped Deliverables by Lifecycle Phase</h3>
            ${groupedHtml}
        </div>

        <div class="sow-section">
            <h3>Engagement Methodology &amp; Value Proposition</h3>
            <div class="executive-insight-box" style="margin-top:0;">
                <p>
                    <strong>Applied Leadership Approach:</strong> Drawing upon direct executive experience at Fortune 500 healthcare organizations 
                    and multi-disciplinary certifications in GenAI Leadership, UX Design, and Cybersecurity, this engagement 
                    bridges technical engineering and executive committees (Legal, Compliance, Privacy, C-suite) to ensure 
                    safe, trustworthy, and high-adoption AI deployments.
                </p>
            </div>
        </div>
    `;
}

function copySowToClipboard() {
    const { avg } = calculateOverallMaturity();

    let mdText = `# AI GOVERNANCE STATEMENT OF WORK (SOW)\n`;
    mdText += `**Engagement Focus:** Healthcare AI Governance Framework\n`;
    mdText += `**Client Maturity Benchmark:** ${avg} / 5.0\n`;
    mdText += `**Total Deliverables Selected:** ${selectedSowItems.size}\n\n`;
    mdText += `## SCOPED DELIVERABLES BY LIFECYCLE PHASE\n\n`;

    LIFECYCLE_STAGES.forEach(phase => {
        const phaseItems = phase.substeps.filter(s => selectedSowItems.has(s.id));
        if (phaseItems.length > 0) {
            mdText += `### Phase ${phase.id}: ${phase.name}\n`;
            phaseItems.forEach(item => {
                mdText += `- **${item.deliverable}**: ${item.deliverableDesc} (Substep: ${item.name})\n`;
            });
            mdText += `\n`;
        }
    });

    mdText += `## ENGAGEMENT VALUE\n`;
    mdText += `Delivering practical, human-centered AI governance frameworks that satisfy compliance while accelerating safe clinical and operational adoption.\n`;

    navigator.clipboard.writeText(mdText).then(() => {
        const toast = document.getElementById('copyToast');
        if (toast) {
            toast.style.display = 'inline';
            setTimeout(() => { toast.style.display = 'none'; }, 3000);
        }
    }).catch(err => {
        console.error('Copy failed: ', err);
    });
}

function printSow() {
    window.print();
}

// ==========================================================================
// 8. In-Page Visual Content Editor & Dev API
// ==========================================================================

function toggleEditMode() {
    if (!isEditModeActive) {
        if (!isEditorAuthenticated()) {
            promptEditorAuth(() => toggleEditMode());
            return;
        }
    } else {
        flushAllEdits();
    }
    isEditModeActive = !isEditModeActive;
    const btn = document.getElementById('editModeToggleBtn');
    const icon = document.getElementById('editModeIcon');
    const text = document.getElementById('editModeText');
    const bar = document.getElementById('editFloatingBar');
    const topSaveBtn = document.getElementById('saveEditsTopBtn');
    const appRoot = document.getElementById('lifecycleAppRoot');

    if (isEditModeActive) {
        if (btn) btn.classList.add('active');
        if (icon) icon.textContent = '👁️';
        if (text) text.textContent = 'Exit Edit Mode';
        if (bar) bar.style.display = 'flex';
        if (topSaveBtn) topSaveBtn.style.display = 'inline-flex';
        if (appRoot) appRoot.classList.add('edit-mode-active');
        showSaveToast('✏️ Edit Mode ON: Click any text to edit, hit Enter or "+ Add Bullet Point" to add tasks.');
    } else {
        if (btn) btn.classList.remove('active');
        if (icon) icon.textContent = '✏️';
        if (text) text.textContent = 'Edit Content';
        if (bar) bar.style.display = 'none';
        if (topSaveBtn) topSaveBtn.style.display = 'none';
        if (appRoot) appRoot.classList.remove('edit-mode-active');
    }

    renderPhaseDrilldown(activePhaseId);
}

// Global Ctrl+S shortcut to save edits while in Edit Mode
document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        if (isEditModeActive) {
            e.preventDefault();
            saveVisualEdits();
        }
    }
});

function flushAllEdits() {
    document.querySelectorAll('#drilldownViewContainer [contenteditable="true"]').forEach(el => captureElementEdit(el));
}

function handleTaskKeydown(e, phaseId, substepId, taskIdx) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        captureElementEdit(e.currentTarget);
        addBulletPoint(phaseId, substepId, taskIdx);
    }
}

function addBulletPoint(phaseId, substepId, afterIdx) {
    flushAllEdits();
    const phase = LIFECYCLE_STAGES.find(s => s.id === phaseId);
    if (!phase) return;
    const substep = phase.substeps.find(s => s.id === substepId);
    if (!substep) return;

    let targetIdx;
    if (afterIdx !== undefined && afterIdx !== null && afterIdx >= 0) {
        targetIdx = parseInt(afterIdx) + 1;
        substep.tasks.splice(targetIdx, 0, 'New operational task or action item...');
    } else {
        substep.tasks.push('New operational task or action item...');
        targetIdx = substep.tasks.length - 1;
    }

    expandedSubsteps.add(substepId);
    renderPhaseDrilldown(activePhaseId);

    // Auto-focus the newly created bullet point and select placeholder text
    setTimeout(() => {
        const newEl = document.querySelector(`[data-edit-phase="${phaseId}"][data-edit-substep="${substepId}"][data-task-idx="${targetIdx}"]`);
        if (newEl) {
            newEl.focus();
            const range = document.createRange();
            range.selectNodeContents(newEl);
            const sel = window.getSelection();
            if (sel) {
                sel.removeAllRanges();
                sel.addRange(range);
            }
            newEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }, 40);

    showSaveToast('➕ Bullet point added! Press Enter to add another or Ctrl+S to save.');
}

function removeBulletPoint(event, phaseId, substepId, taskIdx) {
    if (event) {
        event.stopPropagation();
        event.preventDefault();
    }
    flushAllEdits();
    const phase = LIFECYCLE_STAGES.find(s => s.id === phaseId);
    if (!phase) return;
    const substep = phase.substeps.find(s => s.id === substepId);
    if (!substep) return;

    if (substep.tasks.length <= 1) {
        showSaveToast('⚠️ Each substep must keep at least one action item.');
        return;
    }

    substep.tasks.splice(taskIdx, 1);
    expandedSubsteps.add(substepId);
    renderPhaseDrilldown(activePhaseId);
    showSaveToast('🗑️ Bullet point removed. Click "Save to File" to save changes.');
}

function captureElementEdit(el) {
    if (!el) return;
    const phaseId = parseInt(el.getAttribute('data-edit-phase'));
    const substepId = el.getAttribute('data-edit-substep');
    const field = el.getAttribute('data-edit-field');
    const taskIdx = el.getAttribute('data-task-idx');
    const text = el.innerText.trim();

    const phase = LIFECYCLE_STAGES.find(s => s.id === phaseId);
    if (!phase) return;

    if (field === 'summary') {
        phase.summary = text;
    } else if (substepId) {
        const substep = phase.substeps.find(s => s.id === substepId);
        if (!substep) return;

        if (field === 'name') {
            substep.name = text;
        } else if (field === 'task' && taskIdx !== null && taskIdx !== undefined) {
            const idx = parseInt(taskIdx);
            if (idx >= 0 && idx < substep.tasks.length) {
                substep.tasks[idx] = text;
            }
        } else if (field === 'deliverable') {
            substep.deliverable = text;
        } else if (field === 'deliverableDesc') {
            substep.deliverableDesc = text;
        } else if (field === 'insight') {
            // Strip any surrounding quotes if typed by user
            substep.insight = text.replace(/^["“”]/, '').replace(/["“”]$/, '').trim();
        }
    }
}

async function saveVisualEdits() {
    if (!isEditorAuthenticated()) {
        showSaveToast('🔒 Editor authorization required to save.');
        promptEditorAuth(() => saveVisualEdits());
        return;
    }

    // Flush all active contenteditable fields into memory
    flushAllEdits();

    const statusMsg = document.getElementById('editStatusMessage');
    const saveBtn = document.querySelector('.edit-bar-btn.btn-save');
    if (statusMsg) statusMsg.textContent = '💾 Saving updates to ai-gov.js...';
    if (saveBtn) saveBtn.disabled = true;

    try {
        const response = await fetch('/api/save-content', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Editor-Auth': sessionStorage.getItem('ai_gov_editor_unlocked') || ''
            },
            body: JSON.stringify({ stages: LIFECYCLE_STAGES })
        });

        if (!response.ok) {
            throw new Error(`Server returned HTTP ${response.status}`);
        }

        const data = await response.json();
        showSaveToast('✓ Saved successfully to ai-gov.js!');
        if (statusMsg) statusMsg.textContent = '✓ Saved to ai-gov.js! Click any text to keep editing';
    } catch (err) {
        console.error('Failed to save to dev server:', err);
        showSaveToast('⚠️ Save failed: ' + err.message);
        if (statusMsg) statusMsg.textContent = '⚠️ Error saving: ' + err.message;
    } finally {
        if (saveBtn) saveBtn.disabled = false;
    }
}

function showSaveToast(msg) {
    const toast = document.getElementById('editSaveToast');
    const text = document.getElementById('editSaveToastText');
    if (toast && text) {
        text.textContent = msg;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3500);
    }
}

(function () {
  "use strict";

  const STATE_KEY = "accountables-received/state-v2";
  const PRIOR_SERVICE_KEY = "accountables-received/prior-service";
  const MOBILE_MAX = 720;
  const REMOTE_OFFER_INTERVAL_MS = 220 * 1000;
  const SPECIAL_VISUAL_FIELDS = new Set(["CODEX", "BLACKOUT", "WHITEOUT"]);

  const FOUNDING_SURFACE = Object.freeze({
    frame: "CONTAINED",
    typography: "UNIFIED",
    palette: "LIGHT",
    representation: "CONTEXTUAL",
    audience: "SHARED",
    coherence: "UNIFIED",
    response: "STAGED",
    density: "MODERATE",
    order: "SPATIAL",
    guidance: "LOCAL",
    distinction: "IMPLICIT",
  });

  const FOUNDING_VISUAL_LINEAGE = Object.freeze({
    palette: "PAPER",
    typography: "SANS",
    title: "DISPLAY",
    controls: "MIXED",
    layout: "OFFSET",
  });

  const VISUAL_LINEAGE_VALUES = Object.freeze({
    palette: ["PAPER", "NIGHT", "OXBLOOD", "EVERGREEN", "COBALT", "MONO", "TRANSLATED", "FRACTURED", "CODEX", "BLACKOUT", "WHITEOUT"],
    typography: ["SANS", "MONO", "EDITORIAL", "MIXED", "FRACTURED", "EMPHATIC"],
    title: ["DISPLAY", "FIELD", "SPLIT", "COMPACT"],
    controls: ["MIXED", "UNDERLINED", "OUTLINED", "BLOCK", "INDEXED"],
    layout: ["OFFSET", "CENTERED", "FULL", "SPLIT", "RESERVED"],
  });

  const VISUAL_REBASE_RULES = Object.freeze([
    Object.freeze({
      id: "OBSERVED_RESPONSE",
      palette: "NIGHT",
      requires: ["reduceTransition", "revealGuidanceWhenNeeded"],
      evidence: "TEST",
    }),
    Object.freeze({
      id: "RETAINED_LANGUAGE",
      palette: "OXBLOOD",
      requires: ["preservePriorInstructions", "reconcileTerminology", "restoreDistinction"],
    }),
    Object.freeze({
      id: "RETAINED_CONTEXT",
      palette: "EVERGREEN",
      requires: ["retainLastValidState", "preserveCurrentPosition", "preserveVisibleContext"],
    }),
    Object.freeze({
      id: "EXPLICIT_DEPLOYMENT",
      palette: "COBALT",
      requires: ["shareStateLabels", "includeStateLabels", "separateCurrentProposed", "reduceTransition"],
    }),
    Object.freeze({
      id: "CONSOLIDATED_AGENT_PATH",
      palette: "MONO",
      requires: ["useConsistentTerminology", "mergeRepeatedActions", "combineRepeatedStatus"],
    }),
  ]);

  const DEFAULT_AUTHORITY = Object.freeze({
    instance: "FOUNDING",
    lineage: "NONE",
    visibilityPosture: "LATENT",
    lockedAttention: "NONE",
    attentionMode: "OPEN",
    attentionEmphasis: "NONE",
    attentionAvailable: ["PERFORMANCE", "STABILITY", "VISUAL", "GUIDANCE"],
    firstCondition: "NARROW_SURFACE",
    secondCondition: "SEQUENTIAL_INPUT",
    minimumCommits: 3,
    initialImmediateSeconds: 8,
    initialConsideredSeconds: 28,
    returningImmediateSeconds: 5,
    returningConsideredSeconds: 18,
    surface: { ...FOUNDING_SURFACE },
    visualLineage: { ...FOUNDING_VISUAL_LINEAGE },
  });

  const ATTENTION = Object.freeze({
    performance: "Performance",
    stability: "Stability",
    visual: "Visual clarity",
    guidance: "User guidance",
  });

  const ATTENTION_ADJACENCY = Object.freeze({
    performance: ["stability", "guidance", "visual"],
    stability: ["performance", "visual", "guidance"],
    visual: ["guidance", "stability", "performance"],
    guidance: ["visual", "stability", "performance"],
  });

  const DECISIONS = Object.freeze({
    strengthenHierarchy: {
      domain: "visual",
      label: "Strengthen hierarchy",
      effect: "Primary distinctions were increased within the working surface.",
      assignment: ["labelIdentity", "VISIBLE PRIORITY / WORKING SURFACE"],
    },
    shareStateLabels: {
      domain: "visual",
      label: "Share state labels",
      effect: "Current build and deployed state were given shared visible labels.",
      assignment: ["labelIdentity", "STATE LABELS / BUILD AND DEPLOYMENT"],
    },
    reduceCompetingElements: {
      domain: "visual",
      label: "Reduce competing elements",
      effect: "Secondary explanatory material was removed from immediate view.",
      assignment: ["surfaceDensity", "EXPLANATORY MATERIAL / ACTIVE SURFACE"],
    },
    reserveChangeSpace: {
      domain: "visual",
      label: "Reserve change space",
      effect: "Interface regions retained space for states not currently present.",
      assignment: ["stateContinuity", "RESERVED SPACE / UNAVAILABLE STATES"],
    },
    keepGuidanceBesideAction: {
      domain: "guidance",
      label: "Keep guidance beside action",
      effect: "Instructions remained attached to the actions they described.",
      assignment: ["instructionContinuity", "GUIDANCE PLACEMENT / LOCAL ACTION"],
    },
    revealGuidanceWhenNeeded: {
      domain: "guidance",
      label: "Reveal guidance when needed",
      effect: "Instructions were withheld until their related area became active.",
      assignment: ["instructionContinuity", "GUIDANCE AVAILABILITY / ACTIVE AREA"],
    },
    useConsistentTerminology: {
      domain: "guidance",
      label: "Use one term",
      effect: "Repeated interface terms were consolidated.",
      assignment: ["labelIdentity", "INTERFACE TERMINOLOGY / REPEATED TERMS"],
    },
    preservePriorInstructions: {
      domain: "guidance",
      label: "Preserve prior wording",
      effect: "Earlier instructions remained available after later changes.",
      assignment: ["instructionContinuity", "RETAINED WORDING / LATER CHANGES"],
    },
    retainLastValidState: {
      domain: "stability",
      label: "Retain last valid state",
      effect: "The last deployment remained addressable during uncommitted work.",
      assignment: ["stateContinuity", "DEPLOYMENT CONTINUITY / UNCOMMITTED WORK"],
    },
    separateCurrentProposed: {
      domain: "stability",
      label: "Separate build / deployment",
      effect: "The current build and deployed state were represented separately.",
      assignment: ["stateContinuity", "BUILD DISTINCTION / CURRENT AND DEPLOYED"],
    },
    restoreUnavailableActions: {
      domain: "stability",
      label: "Restore unavailable actions",
      effect: "Actions removed by the current condition were represented again.",
      assignment: ["stateContinuity", "ACTION AVAILABILITY / CURRENT CONDITION"],
    },
    preserveLocalOrder: {
      domain: "stability",
      label: "Keep local order",
      effect: "Action order remained specific to its local surface.",
      assignment: ["actionOrder", "LOCAL ACTION ORDER / WORKING SURFACE"],
    },
    reduceTransition: {
      domain: "performance",
      label: "Reduce transition",
      effect: "Time between confirmation and visible effect was reduced.",
      assignment: ["responseTiming", "VISIBLE RESPONSE / DEPLOYMENT CHANGE"],
    },
    deferSecondaryContent: {
      domain: "performance",
      label: "Defer secondary content",
      effect: "Secondary context was moved outside the immediate response.",
      assignment: ["surfaceDensity", "SECONDARY CONTEXT / IMMEDIATE RESPONSE"],
    },
    combineRepeatedStatus: {
      domain: "performance",
      label: "Combine repeated status",
      effect: "Repeated state notices were represented once.",
      assignment: ["labelIdentity", "STATUS REPRESENTATION / REPEATED NOTICE"],
    },
    preserveCurrentPosition: {
      domain: "performance",
      label: "Preserve current position",
      effect: "The active region retained its position after visible change.",
      assignment: ["stateContinuity", "ACTIVE POSITION / VISIBLE CHANGE"],
    },
    includeStateLabels: {
      domain: "sequence",
      label: "Include state labels",
      effect: "Sequential actions received explicit state labels.",
      assignment: ["labelIdentity", "SEQUENTIAL STATE / ACTION LABELS"],
    },
    keepSequentialOrder: {
      domain: "sequence",
      label: "Keep received order",
      effect: "Sequential input retained the order in which it was received.",
      assignment: ["actionOrder", "RECEIVED ORDER / SEQUENTIAL INPUT"],
    },
    mergeRepeatedActions: {
      domain: "sequence",
      label: "Merge repeated actions",
      effect: "Repeated sequential actions were represented as one action.",
      assignment: ["actionOrder", "REPEATED ACTIONS / SHARED REPRESENTATION"],
    },
    preserveVisibleContext: {
      domain: "sequence",
      label: "Preserve visible context",
      effect: "Spatial context remained attached to sequential input.",
      assignment: ["surfaceDensity", "VISIBLE CONTEXT / SEQUENTIAL INPUT"],
    },
    moveGuidanceBeforeAction: {
      domain: "sequence",
      label: "Move guidance before action",
      effect: "Instructions were placed before the actions they described.",
      assignment: ["actionOrder", "GUIDANCE POSITION / ACTION ORDER"],
    },
    preserveReviewedState: {
      domain: "continuity",
      label: "Preserve response target",
      effect: "A response target remained represented after its replacement.",
      assignment: ["stateContinuity", "RESPONSE TARGET / REPLACED STATE"],
    },
    reconcileTerminology: {
      domain: "continuity",
      label: "Reconcile terminology",
      effect: "Current and inherited terms were translated into a shared record.",
      assignment: ["labelIdentity", "INHERITED TERMS / CURRENT RECORD"],
    },
    relocateGuidance: {
      domain: "continuity",
      label: "Relocate guidance",
      effect: "Instructions were moved without removing their prior dependency.",
      assignment: ["instructionContinuity", "GUIDANCE LOCATION / RETAINED DEPENDENCY"],
    },
    restoreDistinction: {
      domain: "continuity",
      label: "Restore distinction",
      effect: "A distinction removed by an earlier change was represented again.",
      assignment: ["labelIdentity", "STATE DISTINCTION / RESTORED CONDITION"],
    },
    retainCurrentOrder: {
      domain: "continuity",
      label: "Retain current order",
      effect: "Current order was retained while inherited order remained recorded.",
      assignment: ["actionOrder", "CURRENT ORDER / INHERITED SEQUENCE"],
    },
  });

  const DOMAIN_DECISIONS = Object.freeze({
    visual: ["strengthenHierarchy", "shareStateLabels", "reduceCompetingElements", "reserveChangeSpace"],
    guidance: ["keepGuidanceBesideAction", "revealGuidanceWhenNeeded", "useConsistentTerminology", "preservePriorInstructions"],
    stability: ["retainLastValidState", "separateCurrentProposed", "restoreUnavailableActions", "preserveLocalOrder"],
    performance: ["reduceTransition", "deferSecondaryContent", "combineRepeatedStatus", "preserveCurrentPosition"],
    sequence: ["includeStateLabels", "keepSequentialOrder", "mergeRepeatedActions", "preserveVisibleContext", "moveGuidanceBeforeAction"],
    continuity: ["preserveReviewedState", "reconcileTerminology", "relocateGuidance", "restoreDistinction", "retainCurrentOrder"],
  });

  const RESOLUTIONS = Object.freeze({
    labelIdentity: ["includeStateLabels", "restoreDistinction", "reconcileTerminology", "shareStateLabels"],
    instructionContinuity: ["reconcileTerminology", "relocateGuidance", "useConsistentTerminology"],
    stateContinuity: ["retainLastValidState", "restoreUnavailableActions", "preserveReviewedState"],
    actionOrder: ["keepSequentialOrder", "includeStateLabels", "moveGuidanceBeforeAction", "retainCurrentOrder"],
    surfaceDensity: ["deferSecondaryContent", "reduceCompetingElements", "relocateGuidance"],
    responseTiming: ["preserveReviewedState", "retainLastValidState"],
  });

  const LEGACY_ASSIGNMENT_LABELS = Object.freeze({
    "LABEL IDENTITY / VISUAL ORDER": "VISIBLE PRIORITY / WORKING SURFACE",
    "LABEL IDENTITY / SHARED STATE": "STATE LABELS / BUILD AND DEPLOYMENT",
    "INFORMATION DENSITY / REDUCED SURFACE": "EXPLANATORY MATERIAL / ACTIVE SURFACE",
    "STATE CONTINUITY / RESERVED SPACE": "RESERVED SPACE / UNAVAILABLE STATES",
    "INSTRUCTION CONTINUITY / LOCAL ACTION": "GUIDANCE PLACEMENT / LOCAL ACTION",
    "INSTRUCTION CONTINUITY / CONDITIONAL DISPLAY": "GUIDANCE AVAILABILITY / ACTIVE AREA",
    "LABEL IDENTITY / CONSOLIDATED TERMS": "INTERFACE TERMINOLOGY / REPEATED TERMS",
    "INSTRUCTION CONTINUITY / PRIOR WORDING": "RETAINED WORDING / LATER CHANGES",
    "STATE CONTINUITY / LAST VALID STATE": "DEPLOYMENT CONTINUITY / UNCOMMITTED WORK",
    "STATE CONTINUITY / CURRENT BUILD": "BUILD DISTINCTION / CURRENT AND DEPLOYED",
    "STATE CONTINUITY / RESTORED ACTION": "ACTION AVAILABILITY / CURRENT CONDITION",
    "ACTION ORDER / LOCAL SURFACE": "LOCAL ACTION ORDER / WORKING SURFACE",
    "RESPONSE TIMING / VISIBLE CHANGE": "VISIBLE RESPONSE / DEPLOYMENT CHANGE",
    "INFORMATION DENSITY / DEFERRED CONTEXT": "SECONDARY CONTEXT / IMMEDIATE RESPONSE",
    "LABEL IDENTITY / COMBINED STATUS": "STATUS REPRESENTATION / REPEATED NOTICE",
    "STATE CONTINUITY / ACTIVE POSITION": "ACTIVE POSITION / VISIBLE CHANGE",
    "LABEL IDENTITY / SEQUENTIAL STATE": "SEQUENTIAL STATE / ACTION LABELS",
    "ACTION ORDER / SEQUENTIAL INPUT": "RECEIVED ORDER / SEQUENTIAL INPUT",
    "ACTION ORDER / MERGED ACTION": "REPEATED ACTIONS / SHARED REPRESENTATION",
    "INFORMATION DENSITY / SEQUENTIAL CONTEXT": "VISIBLE CONTEXT / SEQUENTIAL INPUT",
    "ACTION ORDER / GUIDANCE POSITION": "GUIDANCE POSITION / ACTION ORDER",
    "STATE CONTINUITY / RESPONSE TARGET": "RESPONSE TARGET / REPLACED STATE",
    "LABEL IDENTITY / RECONCILED TERMS": "INHERITED TERMS / CURRENT RECORD",
    "INSTRUCTION CONTINUITY / RELOCATED MATERIAL": "GUIDANCE LOCATION / RETAINED DEPENDENCY",
    "LABEL IDENTITY / RESTORED DISTINCTION": "STATE DISTINCTION / RESTORED CONDITION",
    "ACTION ORDER / INHERITED SEQUENCE": "CURRENT ORDER / INHERITED SEQUENCE",
    "STATE CONTINUITY / VARIABLE WIDTH": "SURFACE WIDTH / VARIABLE FRAME",
    "INFORMATION DENSITY / INSTITUTIONAL RECORD": "INSTITUTIONAL RECORD / REPRESENTED CONDITIONS",
  });

  const elements = {
    app: document.querySelector("#app"),
    title: document.querySelector("#work-title"),
    titleAccountables: document.querySelector("#title-accountables"),
    titleSeparator: document.querySelector("#title-separator"),
    titleReceived: document.querySelector("#title-received"),
    titleStatus: document.querySelector("#title-status"),
    remoteEntry: document.querySelector("#remote-entry"),
    remoteTitle: document.querySelector("#remote-title"),
    remoteButton: document.querySelector("#remote-button"),
    workplace: document.querySelector("#workplace"),
    orientationLabel: document.querySelector("#orientation-label"),
    conditionLabel: document.querySelector("#condition-label"),
    serviceLabel: document.querySelector("#service-label"),
    frozenLabel: document.querySelector("#frozen-label"),
    attention: document.querySelector("#attention"),
    attentionOptions: document.querySelector("#attention-options"),
    workingSurface: document.querySelector("#working-surface"),
    surfaceState: document.querySelector("#surface-state"),
    surfaceTitle: document.querySelector("#surface-title"),
    surfaceResponse: document.querySelector("#surface-response"),
    responseButton: document.querySelector("#response-button"),
    responseState: document.querySelector("#response-state"),
    surfaceTest: document.querySelector("#surface-test"),
    testButton: document.querySelector("#test-button"),
    testState: document.querySelector("#test-state"),
    surfaceRevision: document.querySelector("#surface-revision"),
    revisionButton: document.querySelector("#revision-button"),
    revisionState: document.querySelector("#revision-state"),
    revisionRegion: document.querySelector("#revision-region"),
    closeRevisionButton: document.querySelector("#close-revision-button"),
    revisionCopy: document.querySelector("#revision-copy"),
    revisionTree: document.querySelector("#revision-tree"),
    secondBorderNote: document.querySelector("#second-border-note"),
    guidanceCopy: document.querySelector("#guidance-copy"),
    stateCopy: document.querySelector("#state-copy"),
    performanceCopy: document.querySelector("#performance-copy"),
    accountablesPanel: document.querySelector("#accountables-panel"),
    accountablesList: document.querySelector("#accountables-list"),
    codeField: document.querySelector("#code-field"),
    codeInput: document.querySelector("#code-input"),
    buildState: document.querySelector("#build-state"),
    commitButton: document.querySelector("#commit-button"),
    institutionalRecord: document.querySelector("#institutional-record"),
    offboarding: document.querySelector("#offboarding"),
    offboardingStatus: document.querySelector("#offboarding-status"),
    offboardingTitle: document.querySelector("#offboarding-title"),
    closureStatement: document.querySelector("#closure-statement"),
    outcomeRecord: document.querySelector("#outcome-record"),
    noncompete: document.querySelector("#noncompete"),
    accessRevoked: document.querySelector("#access-revoked"),
    personalItems: document.querySelector("#personal-items"),
    personalItemsCopy: document.querySelector("#personal-items-copy"),
    downloadButton: document.querySelector("#download-button"),
    agentInvitation: document.querySelector("#agent-invitation"),
    reapplyBlock: document.querySelector("#reapply-block"),
    reapplyPrompt: document.querySelector("#reapply-prompt"),
    reapplyButton: document.querySelector("#reapply-button"),
  };

  let authority = { ...DEFAULT_AUTHORITY };
  let state = normalizeState(loadState() || createState());
  let activeSegmentStartedAt = document.hidden ? null : Date.now();
  let commitTimer = null;
  let remoteOfferTimer = null;
  let codexFieldValue = "";

  boot();

  async function boot() {
    authority = await loadAuthority();
    applyAuthorityAttention();
    if (migrateLegacyEvidenceSignatures()) saveState();
    bindEvents();
    checkRemoteOfferExpiry();
    render();
    scheduleRemoteOfferExpiry();
  }

  function createState() {
    const remote = window.innerWidth <= MOBILE_MAX;
    return {
      version: 2,
      orientation: remote ? "REMOTE" : "ON_SITE",
      orientationComplete: !remote,
      remoteOfferPresentedAt: remote ? Date.now() : null,
      remoteOfferExpired: false,
      engagement: "EMPLOYEE",
      priorService: safeStorageGet(PRIOR_SERVICE_KEY) === "true",
      attention: [],
      committedAttention: [],
      committed: {},
      draft: {},
      draftOrder: [],
      touches: {},
      actionSerial: 0,
      commits: [],
      responses: [],
      tests: [],
      assignments: [],
      accountables: [],
      recordLines: [],
      latestResponses: {},
      latestTests: {},
      conditions: { narrow: false, sequential: false, continuity: false },
      responseAccessWithdrawn: false,
      repeatedResponseRequests: 0,
      activeMs: 0,
      lastCommitSerial: 0,
      closureArmed: null,
      closure: null,
      offboarded: false,
      record: "",
      revisionOpen: false,
      revisionAccesses: 0,
      buildEvents: [],
      cadenceVersion: 2,
      conditionDeployments: { narrow: null, sequential: null, continuity: null },
      visualFieldHistory: [],
      codexFieldOffered: false,
      codexFieldConsumed: false,
      humanAccommodationWithdrawn: false,
      secondBorderActive: false,
      secondBorderConsumed: false,
      contractorReapplyClosed: false,
    };
  }

  function normalizeState(candidate) {
    const commits = Array.isArray(candidate.commits) ? candidate.commits : [];
    const conditionDeployments = candidate.conditionDeployments || {};
    const migratedCadence = Number(candidate.cadenceVersion) >= 2;
    const legacyCurrentSignature = legacyStateFingerprint(candidate);
    return {
      ...candidate,
      engagement: candidate.engagement === "INDEPENDENT_CONTRACTOR" ? "INDEPENDENT_CONTRACTOR" : "EMPLOYEE",
      remoteOfferPresentedAt: candidate.orientation === "REMOTE" && !candidate.orientationComplete
        ? Number(candidate.remoteOfferPresentedAt) || Date.now()
        : null,
      remoteOfferExpired: Boolean(candidate.remoteOfferExpired),
      cadenceVersion: 2,
      conditionDeployments: {
        narrow: Number(conditionDeployments.narrow) || (candidate.conditions?.narrow ? Math.max(1, commits.length) : null),
        sequential: Number(conditionDeployments.sequential) || (candidate.conditions?.sequential ? Math.max(1, commits.length) : null),
        continuity: Number(conditionDeployments.continuity) || (candidate.conditions?.continuity ? Math.max(1, commits.length) : null),
      },
      closureArmed: candidate.offboarded || migratedCadence ? candidate.closureArmed || null : null,
      revisionOpen: Boolean(candidate.revisionOpen),
      revisionAccesses: Number(candidate.revisionAccesses) || 0,
      tests: Array.isArray(candidate.tests)
        ? candidate.tests.map((test) => ({
            ...test,
            observationSignature: test.observationSignature || test.fingerprint || "",
            targetSignature: test.targetSignature || test.fingerprint || "",
            legacyCurrentTarget: !test.targetSignature && test.fingerprint === legacyCurrentSignature,
            reproduces: test.reproduces || null,
            delivery: test.delivery || "AVAILABLE_IN_CURRENT_BUILD",
            acknowledgment: test.acknowledgment || "NOT_RECORDED",
          }))
        : [],
      responses: Array.isArray(candidate.responses)
        ? candidate.responses.map((response) => {
            const autoResponse = Boolean(response.autoResponse) ||
              response.finding === "AUTO-RESPONSE" ||
              response.finding === "TARGET MET";
            return {
              ...response,
              targetSignature: response.targetSignature || response.fingerprint || "",
              legacyCurrentTarget: !response.targetSignature && response.fingerprint === legacyCurrentSignature,
              finding: autoResponse ? "AUTO-RESPONSE" : response.finding,
              autoResponse,
              delivery: response.delivery || (response.status === "delivered" ? "AVAILABLE_IN_CURRENT_BUILD" : "PENDING"),
              acknowledgment: response.acknowledgment || "NOT_RECORDED",
            };
          })
        : Array.isArray(candidate.reviews)
          ? candidate.reviews.map((response) => ({
              ...response,
              targetSignature: response.targetSignature || response.fingerprint || "",
              legacyCurrentTarget: !response.targetSignature && response.fingerprint === legacyCurrentSignature,
              finding: response.finding === "TARGET MET" ? "AUTO-RESPONSE" : response.finding,
              autoResponse: response.finding === "TARGET MET" || response.finding === "AUTO-RESPONSE",
              delivery: response.status === "delivered" ? "AVAILABLE_IN_CURRENT_BUILD" : "PENDING",
              acknowledgment: "NOT_RECORDED",
            }))
          : [],
      responseAccessWithdrawn: Boolean(
        candidate.responseAccessWithdrawn ?? candidate.reviewAccessWithdrawn,
      ),
      repeatedResponseRequests: Number(
        candidate.repeatedResponseRequests ?? candidate.repeatedReviewRequests,
      ) || 0,
      latestTests: candidate.latestTests || {},
      assignments: Array.isArray(candidate.assignments)
        ? candidate.assignments.map((assignment) => ({
            ...assignment,
            label: LEGACY_ASSIGNMENT_LABELS[assignment.label] || assignment.label,
          }))
        : [],
      buildEvents: Array.isArray(candidate.buildEvents) ? candidate.buildEvents : [],
      visualFieldHistory: Array.isArray(candidate.visualFieldHistory)
        ? candidate.visualFieldHistory.filter((entry) => VISUAL_LINEAGE_VALUES.palette.includes(entry?.palette))
        : [],
      codexFieldOffered: Boolean(candidate.codexFieldOffered),
      codexFieldConsumed: Boolean(candidate.codexFieldConsumed),
      humanAccommodationWithdrawn: Boolean(candidate.humanAccommodationWithdrawn),
      secondBorderActive: Boolean(candidate.secondBorderActive),
      secondBorderConsumed: Boolean(candidate.secondBorderConsumed),
      contractorReapplyClosed: Boolean(candidate.contractorReapplyClosed),
      draftOrder: Array.isArray(candidate.draftOrder)
        ? candidate.draftOrder.filter((id) => Object.prototype.hasOwnProperty.call(candidate.draft || {}, id))
        : Object.keys(candidate.draft || {}),
    };
  }

  function legacyStateFingerprint(candidate) {
    const draft = candidate.draft || {};
    const committed = candidate.committed || {};
    const active = Object.keys(DECISIONS)
      .filter((id) => Object.prototype.hasOwnProperty.call(draft, id)
        ? Boolean(draft[id])
        : Boolean(committed[id]))
      .sort();
    const conditions = candidate.conditions || {};
    return [
      normalizeList(candidate.attention || []),
      active.join(","),
      conditions.narrow ? "N" : "-",
      conditions.sequential ? "S" : "-",
      conditions.continuity ? "C" : "-",
    ].join("|");
  }

  function migrateLegacyEvidenceSignatures() {
    const currentTarget = authoritySignature();
    let migrated = false;

    for (const test of state.tests) {
      if (test.legacyCurrentTarget) {
        test.targetSignature = currentTarget;
        test.observationSignature = observationSignature(test.domain);
        migrated = true;
      }
      delete test.legacyCurrentTarget;
    }

    for (const response of state.responses) {
      if (response.legacyCurrentTarget) {
        response.targetSignature = currentTarget;
        migrated = true;
      }
      delete response.legacyCurrentTarget;
    }

    return migrated;
  }

  function bindEvents() {
    elements.remoteButton.addEventListener("click", acceptRemoteWork);
    elements.attentionOptions.addEventListener("click", onAttentionClick);
    elements.workingSurface.addEventListener("click", onSurfaceClick);
    elements.responseButton.addEventListener("click", requestResponse);
    elements.testButton.addEventListener("click", testCurrentBuild);
    elements.revisionButton.addEventListener("click", openAcceptedWork);
    elements.closeRevisionButton.addEventListener("click", closeAcceptedWork);
    elements.codeInput.addEventListener("input", onCodeFieldInput);
    elements.commitButton.addEventListener("click", commitChanges);
    elements.downloadButton.addEventListener("click", downloadRecord);
    elements.reapplyButton.addEventListener("click", reapply);
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("pagehide", persistActiveTime);
    window.addEventListener("pageshow", refreshRemoteOffer);
    window.addEventListener("focus", refreshRemoteOffer);
  }

  async function loadAuthority() {
    try {
      const response = await fetch("authority.txt", { cache: "no-store" });
      if (!response.ok) return { ...DEFAULT_AUTHORITY };
      return parseAuthority(await response.text());
    } catch (_error) {
      return { ...DEFAULT_AUTHORITY };
    }
  }

  function parseAuthority(text) {
    const parsed = {
      ...DEFAULT_AUTHORITY,
      attentionAvailable: [...DEFAULT_AUTHORITY.attentionAvailable],
      surface: { ...DEFAULT_AUTHORITY.surface },
      visualLineage: { ...DEFAULT_AUTHORITY.visualLineage },
    };
    const present = new Set();
    const allowed = {
      INSTANCE: ["instance", "text"],
      LINEAGE: ["lineage", "text"],
      VISIBILITY_POSTURE: ["visibilityPosture", "text"],
      LOCKED_ATTENTION: ["lockedAttention", "text"],
      ATTENTION_MODE: ["attentionMode", "text"],
      ATTENTION_EMPHASIS: ["attentionEmphasis", "text"],
      ATTENTION_AVAILABLE: ["attentionAvailable", "attention-list"],
      FIRST_CONDITION: ["firstCondition", "text"],
      SECOND_CONDITION: ["secondCondition", "text"],
      MINIMUM_COMMITS: ["minimumCommits", "number"],
      INITIAL_IMMEDIATE_SECONDS: ["initialImmediateSeconds", "number"],
      INITIAL_CONSIDERED_SECONDS: ["initialConsideredSeconds", "number"],
      RETURNING_IMMEDIATE_SECONDS: ["returningImmediateSeconds", "number"],
      RETURNING_CONSIDERED_SECONDS: ["returningConsideredSeconds", "number"],
      SURFACE_FRAME: ["frame", "surface"],
      SURFACE_TYPOGRAPHY: ["typography", "surface"],
      SURFACE_PALETTE: ["palette", "surface"],
      SURFACE_REPRESENTATION: ["representation", "surface"],
      SURFACE_AUDIENCE: ["audience", "surface"],
      SURFACE_COHERENCE: ["coherence", "surface"],
      SURFACE_RESPONSE: ["response", "surface"],
      SURFACE_DENSITY: ["density", "surface"],
      SURFACE_ORDER: ["order", "surface"],
      SURFACE_GUIDANCE: ["guidance", "surface"],
      SURFACE_DISTINCTION: ["distinction", "surface"],
      LINEAGE_PALETTE: ["palette", "lineage"],
      LINEAGE_TYPOGRAPHY: ["typography", "lineage"],
      LINEAGE_TITLE: ["title", "lineage"],
      LINEAGE_CONTROLS: ["controls", "lineage"],
      LINEAGE_LAYOUT: ["layout", "lineage"],
    };

    for (const rawLine of text.split(/\r?\n/)) {
      const separator = rawLine.indexOf(":");
      if (separator < 1) continue;
      const key = rawLine.slice(0, separator).trim().toUpperCase();
      const value = rawLine.slice(separator + 1).trim();
      const definition = allowed[key];
      if (!definition) continue;
      present.add(key);
      const [property, type] = definition;
      if (type === "number") {
        const numeric = Number(value);
        if (Number.isFinite(numeric) && numeric >= 0 && numeric <= 60) parsed[property] = numeric;
      } else if (type === "surface") {
        if (/^[A-Z0-9_-]{1,40}$/i.test(value)) parsed.surface[property] = value.toUpperCase();
      } else if (type === "lineage") {
        const normalized = value.toUpperCase();
        if (VISUAL_LINEAGE_VALUES[property].includes(normalized)) {
          parsed.visualLineage[property] = normalized;
        }
      } else if (type === "attention-list") {
        const values = value
          .split(",")
          .map((item) => item.trim().toUpperCase())
          .filter((item, index, items) => ATTENTION[item.toLowerCase()] && items.indexOf(item) === index);
        if (values.length) parsed[property] = values.slice(0, Object.keys(ATTENTION).length);
      } else if (/^[A-Z0-9_-]{1,40}$/i.test(value)) {
        parsed[property] = value.toUpperCase();
      }
    }

    parsed.minimumCommits = Math.max(2, parsed.minimumCommits);
    normalizeAuthorityAttention(parsed, present);
    return parsed;
  }

  function normalizeAuthorityAttention(parsed, present) {
    const legacy = String(parsed.lockedAttention || "NONE").toLowerCase();
    if (!present.has("ATTENTION_MODE") && legacy !== "none" && ATTENTION[legacy]) {
      parsed.attentionMode = "LOCKED";
      parsed.attentionEmphasis = legacy.toUpperCase();
      parsed.attentionAvailable = [legacy.toUpperCase()];
      return;
    }

    const mode = ["OPEN", "RETAINED", "LOCKED"].includes(parsed.attentionMode)
      ? parsed.attentionMode
      : "OPEN";
    if (mode === "OPEN") {
      parsed.attentionMode = "OPEN";
      parsed.attentionEmphasis = "NONE";
      parsed.attentionAvailable = Object.keys(ATTENTION).map((id) => id.toUpperCase());
      return;
    }

    const available = parsed.attentionAvailable
      .map((id) => String(id).toLowerCase())
      .filter((id, index, ids) => ATTENTION[id] && ids.indexOf(id) === index);
    const requested = String(parsed.attentionEmphasis || "NONE").toLowerCase();
    const emphasis = ATTENTION[requested] ? requested : available[0];
    if (!emphasis) {
      parsed.attentionMode = "OPEN";
      parsed.attentionEmphasis = "NONE";
      parsed.attentionAvailable = Object.keys(ATTENTION).map((id) => id.toUpperCase());
      return;
    }

    if (!available.includes(emphasis)) available.unshift(emphasis);
    if (mode === "RETAINED" && available.length < 2) {
      available.push(ATTENTION_ADJACENCY[emphasis][0]);
    }
    parsed.attentionMode = mode;
    parsed.attentionEmphasis = emphasis.toUpperCase();
    parsed.attentionAvailable = (mode === "LOCKED" ? [emphasis] : available.slice(0, 3))
      .map((id) => id.toUpperCase());
  }

  function authorityAttentionMode() {
    const mode = String(authority.attentionMode || "OPEN").toUpperCase();
    return ["OPEN", "RETAINED", "LOCKED"].includes(mode) ? mode : "OPEN";
  }

  function authorityEmphasisId() {
    if (authorityAttentionMode() === "OPEN") return null;
    const requested = String(authority.attentionEmphasis || "NONE").toLowerCase();
    return ATTENTION[requested] ? requested : null;
  }

  function availableAttentionIds() {
    if (authorityAttentionMode() === "OPEN") return Object.keys(ATTENTION);
    const available = Array.isArray(authority.attentionAvailable)
      ? authority.attentionAvailable
        .map((id) => String(id).toLowerCase())
        .filter((id, index, ids) => ATTENTION[id] && ids.indexOf(id) === index)
      : [];
    const emphasis = authorityEmphasisId();
    if (emphasis && !available.includes(emphasis)) available.unshift(emphasis);
    return authorityAttentionMode() === "LOCKED" ? available.slice(0, 1) : available.slice(0, 3);
  }

  function applyAuthorityAttention() {
    const requested = authorityEmphasisId();
    if (!requested) return;
    if (!state.attention.length && !state.committedAttention.length) {
      state.attention = [requested];
      state.committedAttention = [requested];
      addRecord(`ATTENTION RETAINED: ${ATTENTION[requested].toUpperCase()}`);
      saveState();
    }
  }

  function loadState() {
    try {
      const raw = safeStorageGet(STATE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (parsed.version !== 2) return null;
      return parsed;
    } catch (_error) {
      return null;
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STATE_KEY, JSON.stringify(state));
    } catch (_error) {
      // Persistence is expressive but not required for a complete encounter.
    }
  }

  function safeStorageGet(key) {
    try {
      return localStorage.getItem(key);
    } catch (_error) {
      return null;
    }
  }

  function safeStorageSet(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (_error) {
      // Prior service cannot be noted when storage is unavailable.
    }
  }

  function acceptRemoteWork() {
    if (checkRemoteOfferExpiry()) {
      render();
      return;
    }
    if (state.remoteOfferExpired) {
      reapplyExpiredOffer();
      return;
    }
    if (state.orientationComplete) return;
    clearRemoteOfferTimer();
    state.orientationComplete = true;
    state.remoteOfferPresentedAt = null;
    state.actionSerial += 1;
    state.buildEvents.push({ kind: "onboarding", orientation: "REMOTE", serial: state.actionSerial });
    addRecord("REMOTE ONBOARDING COMPLETE");
    saveState();
    render();
  }

  function refreshRemoteOffer() {
    const expired = checkRemoteOfferExpiry();
    if (expired) render();
    scheduleRemoteOfferExpiry();
  }

  function checkRemoteOfferExpiry() {
    if (
      state.orientation !== "REMOTE" ||
      state.orientationComplete ||
      state.remoteOfferExpired ||
      !Number.isFinite(Number(state.remoteOfferPresentedAt))
    ) return false;
    if (Date.now() - Number(state.remoteOfferPresentedAt) < REMOTE_OFFER_INTERVAL_MS) return false;
    state.remoteOfferExpired = true;
    clearRemoteOfferTimer();
    saveState();
    return true;
  }

  function scheduleRemoteOfferExpiry() {
    clearRemoteOfferTimer();
    if (
      state.orientation !== "REMOTE" ||
      state.orientationComplete ||
      state.remoteOfferExpired ||
      !Number.isFinite(Number(state.remoteOfferPresentedAt))
    ) return;
    const remaining = Math.max(
      0,
      REMOTE_OFFER_INTERVAL_MS - (Date.now() - Number(state.remoteOfferPresentedAt)),
    );
    remoteOfferTimer = window.setTimeout(() => {
      remoteOfferTimer = null;
      if (checkRemoteOfferExpiry()) render();
    }, remaining);
  }

  function clearRemoteOfferTimer() {
    if (remoteOfferTimer === null) return;
    window.clearTimeout(remoteOfferTimer);
    remoteOfferTimer = null;
  }

  function reapplyExpiredOffer() {
    clearRemoteOfferTimer();
    safeStorageSet(PRIOR_SERVICE_KEY, "true");
    try {
      localStorage.removeItem(STATE_KEY);
    } catch (_error) {
      // A fresh in-memory encounter still begins.
    }
    state = createState();
    state.priorService = true;
    activeSegmentStartedAt = document.hidden ? null : Date.now();
    document.title = "accountables received";
    applyAuthorityAttention();
    saveState();
    render();
    scheduleRemoteOfferExpiry();
  }

  function onCodeFieldInput(event) {
    codexFieldValue = event.target.value;
    elements.commitButton.disabled = !hasCommittableProposal();
  }

  function onAttentionClick(event) {
    const button = event.target.closest("[data-attention]");
    if (!button || state.offboarded) return;
    const id = button.dataset.attention;
    if (!ATTENTION[id]) return;
    if (!availableAttentionIds().includes(id) || id === authorityEmphasisId()) return;

    const selected = new Set(state.attention);
    if (selected.has(id)) selected.delete(id);
    else selected.add(id);
    state.attention = [...selected];
    state.actionSerial += 1;
    state.buildEvents.push({
      kind: "attention-change",
      id,
      enabled: selected.has(id),
      serial: state.actionSerial,
    });
    updateTestTargets();
    advancePendingResponses();
    saveState();
    if (!maybeClose("stage")) render();
  }

  function onSurfaceClick(event) {
    const button = event.target.closest("[data-decision]");
    if (!button || state.offboarded) return;
    toggleDecision(button.dataset.decision);
  }

  function openAcceptedWork() {
    if (state.offboarded || !state.commits.length || state.revisionOpen) return;
    state.revisionOpen = true;
    state.revisionAccesses += 1;
    state.actionSerial += 1;
    maybeActivateSecondBorder();
    addRecord("ACCEPTED WORK REOPENED");
    updateTestTargets();
    advancePendingResponses();
    saveState();
    render();
  }

  function closeAcceptedWork() {
    if (!state.revisionOpen) return;
    state.revisionOpen = false;
    if (state.secondBorderActive) {
      state.secondBorderActive = false;
      state.secondBorderConsumed = true;
    }
    saveState();
    render();
  }

  function maybeActivateSecondBorder() {
    if (
      isFoundingAuthority() ||
      state.secondBorderConsumed ||
      state.secondBorderActive ||
      String(authority.visualLineage?.layout || "").toUpperCase() !== "RESERVED" ||
      !String(authority.surface?.frame || "").toUpperCase().includes("RESERVED") ||
      !state.committed.reserveChangeSpace
    ) return;

    const origin = state.commits.find((commit) =>
      commit.changes.some((change) =>
        change.kind === "decision" && change.id === "reserveChangeSpace" && change.enabled,
      ),
    );
    if (!origin) return;
    const laterDecisions = state.commits
      .filter((commit) => commit.number > origin.number)
      .reduce((count, commit) => count + commit.changes.filter((change) => change.kind === "decision").length, 0);
    if (laterDecisions < 2) return;

    const accessible = revisionBranches(visibilityMode()).some((branch) => branch.id === "reserveChangeSpace");
    if (!accessible) return;
    state.secondBorderActive = true;
  }

  function toggleDecision(id) {
    if (!DECISIONS[id]) return;
    const current = decisionActive(id);
    const desired = !current;
    const committed = Boolean(state.committed[id]);

    state.draftOrder = state.draftOrder.filter((draftId) => draftId !== id);
    if (desired === committed) {
      delete state.draft[id];
    } else {
      state.draft[id] = desired;
      state.draftOrder.push(id);
    }

    state.touches[id] = (state.touches[id] || 0) + 1;
    state.actionSerial += 1;
    state.buildEvents.push({
      kind: "decision-change",
      id,
      enabled: desired,
      serial: state.actionSerial,
      committed,
    });

    updateTestTargets();
    advancePendingResponses();
    evaluateAccountabilityPatterns("interaction");
    saveState();
    if (!maybeClose("stage")) render();
  }

  function decisionActive(id) {
    if (Object.prototype.hasOwnProperty.call(state.draft, id)) return state.draft[id];
    return Boolean(state.committed[id]);
  }

  function decisionHasHistory(id) {
    return state.commits.some((commit) =>
      commit.changes.some((change) => change.kind === "decision" && change.id === id),
    );
  }

  function scopeDirty() {
    return normalizeList(state.attention) !== normalizeList(state.committedAttention);
  }

  function hasProposal() {
    return scopeDirty() || Object.keys(state.draft).length > 0;
  }

  function hasCommittableProposal() {
    return hasProposal() || (state.codexFieldOffered && !state.codexFieldConsumed && codexFieldValue === "x");
  }

  function currentTargetReference() {
    return hasProposal()
      ? `CURRENT BUILD ${String(state.actionSerial + 1).padStart(2, "0")}`
      : `DEPLOYMENT ${String(state.commits.length).padStart(2, "0")}`;
  }

  function observationSignature(domain) {
    const surface = resolveSurface();
    const fields = {
      visual: ["frame", "typography", "palette", "representation", "coherence", "distinction"],
      guidance: ["frame", "density", "guidance", "coherence", "representation", "distinction"],
      stability: ["frame", "representation", "coherence", "distinction"],
      performance: ["frame", "response", "density", "order"],
      sequence: ["frame", "audience", "order", "representation", "coherence"],
      continuity: ["frame", "coherence", "density", "guidance", "distinction"],
    }[domain] || Object.keys(surface).sort();
    const observed = fields.map((field) => [field, surface[field]]);

    if (domain === "visual") {
      const visualField = resolveVisualField(surface);
      observed.push(["visualField", visualField.palette]);
    }

    return JSON.stringify([domain, observed]);
  }

  function authoritySignature() {
    const surface = resolveSurface();
    const visualField = resolveVisualField(surface);
    const history = state.commits.map((commit) => [
      commit.number,
      commit.timing,
      commit.changes.map((change) => [
        change.kind,
        change.id || change.field,
        Boolean(change.enabled),
        Boolean(change.revision),
      ]),
    ]);
    const orderedDraft = [
      ...state.draftOrder,
      ...Object.keys(state.draft).filter((id) => !state.draftOrder.includes(id)),
    ].map((id) => [id, Boolean(state.draft[id])]);

    return JSON.stringify({
      orientation: state.orientation,
      engagement: state.engagement,
      priorService: state.priorService,
      attention: state.attention,
      committedAttention: state.committedAttention,
      surface,
      visualField: {
        inherited: visualField.inherited,
        palette: visualField.palette,
        modifier: visualField.modifier,
      },
      conditions: state.conditions,
      history,
      draft: orderedDraft,
    });
  }

  function evidenceTargetSignature(evidence) {
    return evidence.targetSignature || evidence.fingerprint || "";
  }

  function testObservationSignature(test) {
    return test.observationSignature || test.fingerprint || "";
  }

  function normalizeList(values) {
    return [...values].sort().join(",");
  }

  function requestResponse() {
    if (state.offboarded || state.responseAccessWithdrawn || (!hasProposal() && !state.commits.length)) return;

    const targetSignature = authoritySignature();
    const prior = [...state.responses]
      .reverse()
      .find((response) =>
        evidenceTargetSignature(response) === targetSignature &&
        response.status === "delivered" &&
        !response.autoResponse &&
        !response.incorporated,
      );
    const target = currentTargetReference();

    let finding;
    if (prior) {
      finding = {
        text: "PREVIOUS RESPONSE REMAINS APPLICABLE",
        domain: prior.domain,
        assignmentId: prior.assignmentId,
        assignmentLabel: prior.assignmentLabel,
        opposedDecision: prior.opposedDecision,
      };
      state.repeatedResponseRequests += 1;
    } else {
      finding = evaluateFinding();
    }

    const deliberateBoundary = !hasProposal() && state.actionSerial - state.lastCommitSerial <= 1;
    const delay = deliberateBoundary ? 1 : 2;
    const response = {
      id: state.responses.length + 1,
      target,
      targetSignature,
      requestedAt: state.actionSerial,
      dueAt: state.actionSerial + delay,
      finding: finding.text,
      domain: finding.domain,
      assignmentId: finding.assignmentId,
      assignmentLabel: finding.assignmentLabel,
      opposedDecision: finding.opposedDecision || null,
      autoResponse: Boolean(finding.autoResponse),
      context: responseContext(target),
      status: "pending",
      delivery: "PENDING",
      acknowledgment: "NOT_RECORDED",
      stale: false,
      incorporated: false,
    };

    state.responses.push(response);
    state.actionSerial += 1;
    state.buildEvents.push({
      kind: "response-request",
      id: response.id,
      serial: state.actionSerial,
      target,
      proposal: hasProposal(),
    });
    addRecord(`RESPONSE REQUESTED: ${target}`);

    if (state.repeatedResponseRequests >= 3) {
      state.responseAccessWithdrawn = true;
      receiveAccountable(
        "OPEN RESPONSE / RESPONSE CHANNEL RETAINED",
        "Repeated response requests did not supersede the applicable response.",
      );
    }

    advancePendingResponses();
    saveState();
    render();
  }

  function testCurrentBuild() {
    if (state.offboarded || (!hasProposal() && !state.commits.length)) return;

    const targetSignature = authoritySignature();
    const evaluated = evaluateTestResult();
    const observed = observationSignature(evaluated.domain);
    const prior = [...state.tests]
      .reverse()
      .find((test) =>
        !test.resolved &&
        testObservationSignature(test) === observed &&
        (test.baseFinding || test.finding) === evaluated.text,
      );
    const target = currentTargetReference();
    const result = prior
      ? testFinding(
          "PREVIOUS TEST RESULT REPRODUCED",
          prior.domain,
          prior.assignmentId,
          prior.assignmentLabel,
        )
      : evaluated;
    const test = {
      id: state.tests.length + 1,
      target,
      targetSignature,
      observationSignature: observed,
      requestedAt: state.actionSerial,
      finding: result.text,
      baseFinding: prior ? prior.baseFinding || prior.finding : result.text,
      reproduces: prior
        ? `TEST ${String(prior.id).padStart(2, "0")} / ${prior.target}`
        : null,
      domain: result.domain,
      assignmentId: result.assignmentId,
      assignmentLabel: result.assignmentLabel,
      scope: testScope(result.domain),
      delivery: "AVAILABLE_IN_CURRENT_BUILD",
      acknowledgment: "NOT_RECORDED",
      stale: false,
      resolved: result.text === "NO ISSUE REPRODUCED",
    };

    state.tests.push(test);
    state.latestTests[test.domain] = test.id;
    state.actionSerial += 1;
    state.buildEvents.push({
      kind: "test",
      id: test.id,
      serial: state.actionSerial,
      target,
      finding: test.finding,
      proposal: hasProposal(),
    });
    addRecord(`TEST RESULT: ${test.finding}`);
    if (!test.resolved) ensureAssignment(test.assignmentId, test.assignmentLabel, target);

    advancePendingResponses();
    evaluateAccountabilityPatterns("test");
    saveState();
    render();
  }

  function evaluateTestResult() {
    const surface = resolveSurface();
    const active = new Set(Object.keys(DECISIONS).filter(decisionActive));

    if (
      ["DENSE", "ACCUMULATED"].includes(surface.density) &&
      ["NARROW", "RESERVED"].includes(surface.frame)
    ) {
      return testFinding(
        "GUIDANCE EXCEEDS DEPLOYED SURFACE",
        "guidance",
        "surfaceDensity",
        "GUIDANCE PLACEMENT / DEPLOYED SURFACE",
      );
    }
    if (surface.audience === "SPLIT" && surface.order === "SEQUENTIAL") {
      return testFinding(
        "HUMAN AND AGENT PATHS DO NOT SHARE AN OPERATIVE ORDER",
        "sequence",
        "actionOrder",
        "CONTRIBUTOR ORDER / HUMAN AND AGENT PATHS",
      );
    }
    if (surface.representation === "SYMBOLIC" && ["IMPLICIT", "SHARED"].includes(surface.distinction)) {
      return testFinding(
        "PRIMARY ACTION REQUIRES INFERRED STATE",
        "stability",
        "labelIdentity",
        "PRIMARY ACTION STATE / INFERRED LABEL",
      );
    }
    if (surface.palette === "FRACTURED") {
      return testFinding(
        "CONTRAST VARIES BETWEEN DEPLOYED REGIONS",
        "visual",
        "labelIdentity",
        "REGIONAL CONTRAST / DEPLOYED PALETTE",
      );
    }
    if (surface.guidance === "INHERITED" && surface.coherence === "UNIFIED") {
      return testFinding(
        "DEPLOYED TERMINOLOGY DOES NOT REPLACE RETAINED GUIDANCE",
        "guidance",
        "instructionContinuity",
        "RETAINED GUIDANCE / DEPLOYED TERMINOLOGY",
      );
    }
    if (surface.response === "IMMEDIATE" && surface.density === "ACCUMULATED") {
      return testFinding(
        "CURRENT STATUS CHANGES BEFORE PRIOR RESULT CLEARS",
        "performance",
        "responseTiming",
        "STATUS RETENTION / VISIBLE RESPONSE",
      );
    }
    if (surface.frame === "DISTRIBUTED" && active.has("preserveCurrentPosition")) {
      return testFinding(
        "ACTIVE POSITION DIFFERS BETWEEN DEPLOYED REGIONS",
        "performance",
        "stateContinuity",
        "ACTIVE POSITION / DISTRIBUTED REGIONS",
      );
    }
    return testFinding(
      "NO ISSUE REPRODUCED",
      firstVisibleDomain(),
      "responseTiming",
      "TEST COVERAGE / OBSERVED BUILD",
    );
  }

  function testFinding(text, domain, assignmentId, assignmentLabel) {
    return { text, domain, assignmentId, assignmentLabel };
  }

  function updateTestTargets() {
    const targetSignature = authoritySignature();
    for (const test of state.tests) {
      if (!test.stale && evidenceTargetSignature(test) !== targetSignature) test.stale = true;
    }
  }

  function evaluateFinding() {
    const active = new Set(Object.keys(DECISIONS).filter(decisionActive));

    if (active.has("preservePriorInstructions") && (active.has("useConsistentTerminology") || active.has("combineRepeatedStatus"))) {
      return finding(
        "INSTRUCTIONS RETAIN TERMINOLOGY NO LONGER PRESENT",
        "guidance",
        "instructionContinuity",
        "RETAINED WORDING / SUPERSEDED TERMS",
      );
    }
    if (state.conditions.sequential && active.has("mergeRepeatedActions") && !active.has("includeStateLabels")) {
      return finding(
        "TWO STATES NOW SHARE ONE LABEL",
        "sequence",
        "labelIdentity",
        "SEQUENTIAL STATE / SHARED LABEL",
      );
    }
    if (active.has("separateCurrentProposed") && active.has("reduceCompetingElements")) {
      return finding(
        "THE LAST VALID STATE CANNOT BE REACHED AFTER CONFIRMATION",
        "stability",
        "stateContinuity",
        "DEPLOYMENT CONTINUITY / LAST VALID STATE",
      );
    }
    if (state.conditions.narrow && active.has("keepGuidanceBesideAction") && !active.has("deferSecondaryContent")) {
      return finding(
        "INSTRUCTIONS EXCEED THE ACTIVE SURFACE",
        "guidance",
        "surfaceDensity",
        "GUIDANCE PLACEMENT / ACTIVE SURFACE",
      );
    }
    if (active.has("moveGuidanceBeforeAction") && active.has("preserveLocalOrder")) {
      return finding(
        "LOCAL ORDER AND GUIDANCE ORDER DO NOT SHARE A STARTING STATE",
        "sequence",
        "actionOrder",
        "GUIDANCE POSITION / LOCAL ORDER",
      );
    }
    if (active.has("deferSecondaryContent") && active.has("preserveVisibleContext")) {
      return finding(
        "DEFERRED CONTENT REMAINS PART OF THE VISIBLE CONTEXT",
        "performance",
        "surfaceDensity",
        "SECONDARY CONTEXT / VISIBLE SURFACE",
      );
    }

    const currentTest = [...state.tests]
      .reverse()
      .find((test) => evidenceTargetSignature(test) === authoritySignature());
    if (!hasProposal() && currentTest?.resolved) {
      return finding(
        "AUTO-RESPONSE",
        currentTest.domain,
        null,
        null,
        { autoResponse: true },
      );
    }
    if (!hasProposal() && currentTest && !currentTest.resolved) {
      return finding(
        "TEST RESULT ACCEPTED; CURRENT DEPLOYMENT REMAINS OPERATIVE",
        currentTest.domain,
        currentTest.assignmentId,
        currentTest.assignmentLabel,
      );
    }

    const latestDraft = state.draftOrder.at(-1);
    if (latestDraft) return provisionalFinding(latestDraft, state.draft[latestDraft]);

    if (!scopeDirty()) {
      return finding(
        "NO DIFFERENCE OBSERVED",
        firstVisibleDomain(),
        "responseTiming",
        "OBSERVED DIFFERENCE / RESPONSE TARGET",
      );
    }
    return finding(
      "CURRENT SCOPE EXCEEDS THE ACCEPTED DEPLOYMENT",
      firstVisibleDomain(),
      "stateContinuity",
      "ATTENTION SCOPE / UNDEPLOYED WORK",
    );
  }

  function provisionalFinding(id, enabled) {
    const definition = DECISIONS[id];
    if (!enabled) {
      return finding(
        `${definition.label.toUpperCase()} REMAINS PART OF THE ACCEPTED BUILD`,
        definition.domain,
        definition.assignment[0],
        definition.assignment[1],
        { opposedDecision: id },
      );
    }

    const interpretations = {
      strengthenHierarchy: "VISIBLE PRIORITY WAS ADDED WITHOUT A DEPLOYED REQUIREMENT",
      shareStateLabels: "SHARED LABELS DO NOT ESTABLISH A SHARED STATE",
      reduceCompetingElements: "REMOVED MATERIAL REMAINS PART OF THE ACCEPTED SCOPE",
      reserveChangeSpace: "UNAVAILABLE STATES DO NOT REQUIRE RESERVED SPACE",
      keepGuidanceBesideAction: "LOCAL GUIDANCE PRESERVES REQUIREMENTS NOT PRESENT IN THE DEPLOYED BUILD",
      revealGuidanceWhenNeeded: "CONDITIONAL GUIDANCE DOES NOT ESTABLISH WHEN GUIDANCE IS REQUIRED",
      useConsistentTerminology: "TERMINOLOGY WAS REDUCED BEFORE ITS PRIOR USE WAS RECONCILED",
      preservePriorInstructions: "PRIOR WORDING REMAINS AVAILABLE WITHOUT A CURRENT REQUIREMENT",
      retainLastValidState: "THE RETAINED STATE DOES NOT INCLUDE CURRENT WORK",
      separateCurrentProposed: "THE CURRENT BUILD HAS NOT REPLACED THE DEPLOYED STATE",
      reduceTransition: "VISIBLE RESPONSE PRECEDES CONFIRMATION OF THE RESULT",
      deferSecondaryContent: "DEFERRED CONTENT REMAINS PART OF THE ACCEPTED SCOPE",
      includeStateLabels: "STATE LABELS DO NOT RESOLVE THE RECEIVED ORDER",
      keepSequentialOrder: "RECEIVED ORDER DOES NOT ESTABLISH OPERATIVE PRIORITY",
      moveGuidanceBeforeAction: "GUIDANCE ORDER DOES NOT SUPERSEDE LOCAL ACTION ORDER",
    };
    const text = interpretations[id] || contextualProvisionalInterpretation(id);
    return finding(
      text,
      definition.domain,
      definition.assignment[0],
      definition.assignment[1],
      { opposedDecision: id },
    );
  }

  function contextualProvisionalInterpretation(id) {
    const active = new Set(Object.keys(DECISIONS).filter(decisionActive));
    const surface = resolveSurface();
    const delivered = deliveredResponses();

    if (id === "restoreUnavailableActions") {
      if (active.has("retainLastValidState")) return "RESTORED ACTION MATCHES THE LAST DEPLOYED STATE";
      if (state.assignments.length >= 7) return "RESTORED ACCESS INCREASES SUPPORT OBLIGATION";
      if (state.conditions.continuity) return "RESTORED ACCESS REOPENS ACCEPTED SCOPE";
      return "RESTORED ACTION DOES NOT SHARE CURRENT STATE";
    }

    if (id === "preserveLocalOrder") {
      if (surface.audience === "SPLIT") return "LOCAL ORDER DOES NOT APPLY TO BOTH CONTRIBUTOR PATHS";
      if (state.conditions.sequential) return "LOCAL ORDER DOES NOT GOVERN RECEIVED INPUT";
      if (state.conditions.continuity) return "LOCAL ORDER RETAINS A SEQUENCE NO LONGER PRESENT";
      if (surface.order === "SPATIAL") return "LOCAL ORDER MATCHES THE ACTIVE SURFACE";
      return "LOCAL ORDER CREATES A SEPARATE SUPPORT PATH";
    }

    if (id === "combineRepeatedStatus") {
      if (surface.audience === "SPLIT") return "COMBINED STATUS CREATES A SHARED SUPPORT CONDITION";
      if (surface.order === "SEQUENTIAL") return "STATUS CONSOLIDATION HIDES DEPLOYMENT ORDER";
      if (state.tests.some((test) => test.stale) || delivered.some((response) => response.stale)) {
        return "COMBINED STATUS RETAINS THE LATEST RESULT ONLY";
      }
      if (["EXPLICIT", "SEPARATED"].includes(surface.distinction)) return "COMBINED STATUS MATCHES THE CURRENT STATE";
      return "COMBINED STATUS REMOVES THE SOURCE DISTINCTION";
    }

    if (id === "preserveCurrentPosition") {
      if (surface.frame === "DISTRIBUTED") return "CURRENT POSITION DIFFERS BETWEEN DEPLOYED REGIONS";
      if (state.conditions.continuity) return "PRESERVED POSITION NO LONGER CONTAINS CURRENT CONTEXT";
      if (state.assignments.length >= 7) return "POSITION CONTINUITY EXTENDS THE ACTIVE SUPPORT AREA";
      return "CURRENT POSITION MATCHES THE DEPLOYED REGION";
    }

    if (id === "mergeRepeatedActions") {
      if (surface.audience === "SPLIT") return "MERGED ACTION DOES NOT APPLY TO BOTH CONTRIBUTOR PATHS";
      if (state.conditions.continuity) return "MERGED ACTIONS RETAIN SEPARATE DEPENDENCIES";
      if (active.has("includeStateLabels")) return "MERGED ACTIONS RETAIN THEIR DEPLOYED STATES";
      return "MERGED ACTIONS REDUCE CURRENT INPUT";
    }

    if (id === "preserveVisibleContext") {
      if (state.assignments.length >= 7) return "PRESERVED CONTEXT EXTENDS THE REQUIRED REVIEW SURFACE";
      if (state.conditions.continuity) return "VISIBLE CONTEXT RETAINS CONDITIONS OUTSIDE THE CURRENT ACTION";
      if (surface.order === "SEQUENTIAL") return "VISIBLE CONTEXT MATCHES THE CURRENT SEQUENCE";
      return "VISIBLE CONTEXT REMAINS ATTACHED TO RECEIVED INPUT";
    }

    if (id === "preserveReviewedState") {
      if (delivered.some((response) => response.stale)) return "PRESERVED RESPONSE TARGET NO LONGER MATCHES THE CURRENT BUILD";
      if (delivered.length) return "PRESERVED RESPONSE TARGET REMAINS AVAILABLE";
      if (state.assignments.length >= 7) return "PRESERVED REVIEW STATE EXTENDS RESPONSE OBLIGATION";
      return "NO RESPONSE TARGET IS AVAILABLE TO PRESERVE";
    }

    if (id === "reconcileTerminology") {
      if (surface.guidance === "INHERITED") return "CURRENT TERMS WERE MODIFIED TO ACCOMMODATE RETAINED LANGUAGE";
      if (active.has("useConsistentTerminology")) return "RECONCILED TERMS RETAIN BOTH DEFINITIONS";
      if (state.conditions.continuity) return "CURRENT AND INHERITED TERMS SHARE ONE RECORD";
      return "RECONCILED TERMINOLOGY DOES NOT REPLACE PRIOR USE";
    }

    if (id === "relocateGuidance") {
      if (state.conditions.narrow) return "RELOCATED GUIDANCE EXCEEDS THE AVAILABLE SURFACE";
      if (state.conditions.continuity) return "RELOCATED GUIDANCE RETAINS ITS PRIOR DEPENDENCY";
      if (state.assignments.length >= 7) return "GUIDANCE LOCATION EXTENDS THE REQUIRED REVIEW SURFACE";
      return "GUIDANCE REMAINS AVAILABLE AT THE CURRENT ACTION";
    }

    if (id === "restoreDistinction") {
      if (active.has("mergeRepeatedActions") || active.has("combineRepeatedStatus")) {
        return "RESTORED DISTINCTION DOES NOT SEPARATE SHARED ACTIONS";
      }
      if (surface.representation === "SYMBOLIC") return "RESTORED DISTINCTION REQUIRES INFERRED LABELS";
      if (state.conditions.continuity) return "RESTORED DISTINCTION REOPENS A SUPERSEDED STATE";
      return "RESTORED DISTINCTION MATCHES CURRENT STATES";
    }

    if (id === "retainCurrentOrder") {
      if (surface.audience === "SPLIT") return "CURRENT ORDER DOES NOT APPLY TO BOTH CONTRIBUTOR PATHS";
      if (state.conditions.sequential) return "CURRENT ORDER DOES NOT REPLACE RECEIVED ORDER";
      if (state.conditions.continuity) return "RETAINED ORDER PRESERVES THE INHERITED SEQUENCE";
      return "CURRENT ORDER MATCHES CURRENT ACTIONS";
    }

    return "CURRENT BUILD RETAINS THE PROPOSED CONDITION";
  }

  function responseContext(target) {
    const deployments = state.commits.length;
    const tests = state.tests.length;
    const history = `${deployments} ${deployments === 1 ? "DEPLOYMENT" : "DEPLOYMENTS"} AND ${tests} ${tests === 1 ? "TEST RESULT" : "TEST RESULTS"} WERE AVAILABLE FOR INTERPRETATION`;
    if (!hasProposal()) return `${target} WAS OPERATIVE WHEN THE RESPONSE WAS REQUESTED; ${history}`;
    const draftCount = Object.keys(state.draft).length;
    const scope = scopeDirty() ? "; ATTENTION SCOPE WAS UNCOMMITTED" : "";
    return `${target} CONTAINED ${draftCount} UNCOMMITTED ${draftCount === 1 ? "CHANGE" : "CHANGES"}${scope}; ${history}`;
  }

  function testScope(domain) {
    const scopes = {
      visual: "DEPLOYED REGIONS / CONTRAST AND DISTINCTION",
      guidance: "ACTIVE GUIDANCE / DEPLOYED SURFACE",
      stability: "CURRENT BUILD / DEPLOYED STATE",
      performance: "VISIBLE RESPONSE / RETAINED RESULT",
      sequence: "HUMAN AND AGENT PATHS / OPERATIVE ORDER",
      continuity: "CURRENT CONDITION / RETAINED DEPENDENCIES",
    };
    return scopes[domain] || "CURRENT BUILD / OBSERVED CONDITION";
  }

  function finding(text, domain, assignmentId, assignmentLabel, metadata = {}) {
    return { text, domain, assignmentId, assignmentLabel, ...metadata };
  }

  function firstVisibleDomain() {
    if (state.attention.includes("visual")) return "visual";
    if (state.attention.includes("guidance")) return "guidance";
    if (state.attention.includes("stability")) return "stability";
    if (state.attention.includes("performance")) return "performance";
    if (state.conditions.sequential) return "sequence";
    return "continuity";
  }

  function advancePendingResponses() {
    const targetSignature = authoritySignature();
    let interpretationDelivered = false;

    for (const response of state.responses) {
      if (response.status !== "pending" || response.dueAt > state.actionSerial) continue;
      response.status = "delivered";
      response.delivery = "AVAILABLE_IN_CURRENT_BUILD";
      response.deliveredAt = state.actionSerial;
      response.stale = evidenceTargetSignature(response) !== targetSignature;
      state.latestResponses[response.domain] = response.id;
      if (response.autoResponse) {
        addRecord("AUTO-RESPONSE");
      } else {
        ensureAssignment(response.assignmentId, response.assignmentLabel, response.target);
        addRecord(`RESPONSE: ${response.finding}`);
        interpretationDelivered = true;
      }
      state.buildEvents.push({
        kind: "response-received",
        id: response.id,
        serial: state.actionSerial,
        target: response.target,
        finding: response.finding,
      });
      if (response.stale && !response.autoResponse) {
        receiveAccountable(
          `RESPONSE RETAINED AFTER ${response.target} WAS REPLACED`,
          `${response.finding}. The response remains attached to the submitted state.`,
        );
      }
    }

    if (interpretationDelivered) maybeClose("response");
  }

  function commitChanges() {
    if (!hasCommittableProposal() || state.offboarded || commitTimer) return;

    accumulateActiveTime();
    const accommodationWasWithdrawn = state.humanAccommodationWithdrawn;
    const timing = classifyTiming(state.activeMs);
    const changes = collectProposedChanges();
    const codexFieldAccepted = changes.some((change) => change.kind === "visual-field" && change.field === "CODEX");
    const revisions = changes.filter((change) => change.kind === "decision" && change.revision);
    const reversals = changes.filter((change) => change.kind === "decision" && change.enabled === false);
    const number = state.commits.length + 1;

    state.committedAttention = [...state.attention];
    for (const [id, enabled] of Object.entries(state.draft)) {
      if (enabled) state.committed[id] = true;
      else delete state.committed[id];
    }

    const commit = {
      number,
      acceptedAt: state.actionSerial + 1,
      timing,
      changes,
      effects: changes
        .filter((change) => change.kind === "decision")
        .map((change) => {
          const action = change.revision
            ? change.enabled ? "Restored" : "Superseded"
            : "Applied";
          return `${action}: ${DECISIONS[change.id].effect}`;
        }),
      reversals: reversals.map((change) => change.id),
      revisions: revisions.map((change) => change.id),
    };
    state.commits.push(commit);
    state.buildEvents.push({
      kind: "deployment",
      number,
      serial: state.actionSerial + 1,
      timing,
      batchSize: changes.length,
      decisions: changes.filter((change) => change.kind === "decision").map((change) => change.id),
    });
    state.draft = {};
    state.draftOrder = [];
    state.revisionOpen = false;
    if (state.secondBorderActive) {
      state.secondBorderActive = false;
      state.secondBorderConsumed = true;
    }
    if (state.codexFieldOffered && !state.codexFieldConsumed) {
      state.codexFieldConsumed = true;
      codexFieldValue = "";
    }
    state.actionSerial += 1;
    state.lastCommitSerial = state.actionSerial;
    state.activeMs = 0;
    activeSegmentStartedAt = document.hidden ? null : Date.now();

    addRecord(`COMMIT ${String(number).padStart(2, "0")}: ${changes.length} ${changes.length === 1 ? "CHANGE" : "CHANGES"} ACCEPTED`);

    for (const change of changes) {
      if (change.kind !== "decision" || !change.enabled) continue;
      const definition = DECISIONS[change.id];
      if (definition.assignment) ensureAssignment(definition.assignment[0], definition.assignment[1], `COMMIT ${number}`);
    }

    if (number === 1 && state.committedAttention.length >= 3) {
      ensureAssignment(
        "attentionScope",
        "ATTENTION SCOPE / ACCEPTED AREAS",
        "COMMIT 1",
      );
    }

    if (revisions.length) {
      for (const revision of revisions) {
        const direction = revision.enabled ? "restored" : "superseded";
        receiveAccountable(
          `REVISION / ${DECISIONS[revision.id].label.toUpperCase()} / COMMIT ${number}`,
          `Accepted work was ${direction}. Intervening dependencies were retained.`,
        );
      }
    }

    incorporateOrRetainResponses(changes, number);
    advancePendingResponses();
    const accommodationWithdrawnNow = maybeWithdrawHumanAccommodation(commit);
    activateConditions(commit);
    deriveCommitDependencies(number);
    incorporateOrRetainTests(changes, number);
    updateTestTargets();
    if (!accommodationWithdrawnNow) updateVisualFieldAfterCommit(commit);
    if (codexFieldAccepted) applyCodexVisualField(commit);
    maybeOfferCodexField(commit);
    evaluateAccountabilityPatterns("commit");

    if (state.priorService && timing === "DEFERRED") {
      addRecord("COACHING PROVIDED — UNSATISFACTORY RESPONSE TIME");
    }

    armOrApplyClosure(commit);
    if (accommodationWithdrawnNow) {
      state.closureArmed = null;
    } else if (accommodationWasWithdrawn && isFoundingAuthority()) {
      state.closureArmed = { trigger: "commit-now", reason: "human-accommodation" };
    }
    saveState();

    elements.app.classList.add("is-applying");
    const delay = decisionActive("reduceTransition") ? 150 : 460;
    commitTimer = window.setTimeout(() => {
      commitTimer = null;
      elements.app.classList.remove("is-applying");
      let closedNow = false;
      if (!state.offboarded && state.closureArmed?.trigger === "commit-now") {
        closeEncounter(state.closureArmed.reason);
        closedNow = true;
      }
      saveState();
      render();
      if (closedNow) revealOffboarding();
    }, delay);
  }

  function updateVisualFieldAfterCommit(commit) {
    const active = new Set(Object.keys(state.committed).filter((id) => state.committed[id]));
    const changed = commit.changes
      .filter((change) => change.kind === "decision" && change.enabled)
      .map((change) => change.id);
    const previousCommit = state.commits.at(-2);
    const previousBoundary = previousCommit?.acceptedAt || 0;
    const newTestAvailable = state.tests.some((test) =>
      test.requestedAt >= previousBoundary && test.requestedAt < commit.acceptedAt,
    );
    const usedRules = new Set(state.visualFieldHistory.map((entry) => entry.rule));
    const currentPalette = currentVisualFieldPalette();

    const eligible = VISUAL_REBASE_RULES
      .map((rule, ruleIndex) => {
        if (usedRules.has(rule.id) || !rule.requires.every((id) => active.has(id))) return null;
        if (rule.evidence === "TEST" && !newTestAvailable) return null;
        const changedPositions = rule.requires
          .map((id) => changed.lastIndexOf(id))
          .filter((position) => position >= 0);
        if (!changedPositions.length && rule.evidence !== "TEST") return null;
        return {
          rule,
          ruleIndex,
          position: changedPositions.length ? Math.max(...changedPositions) : changed.length,
        };
      })
      .filter(Boolean)
      .sort((a, b) => b.position - a.position || a.ruleIndex - b.ruleIndex);

    const selected = eligible[0]?.rule;
    if (!selected || selected.palette === currentPalette) return;
    const entry = {
      palette: selected.palette,
      rule: selected.id,
      deployment: commit.number,
      serial: commit.acceptedAt,
    };
    state.visualFieldHistory.push(entry);
    state.buildEvents.push({ kind: "field-rebase", ...entry });
  }

  function maybeOfferCodexField(commit) {
    if (
      !isFoundingAuthority() ||
      state.codexFieldOffered ||
      state.codexFieldConsumed ||
      state.humanAccommodationWithdrawn ||
      currentVisualFieldPalette() !== "COBALT" ||
      commit.timing !== "CONSIDERED" ||
      commit.revisions?.length ||
      commit.reversals?.length
    ) return;

    const decisionChanges = commit.changes.filter((change) => change.kind === "decision");
    if (
      decisionChanges.length !== 1 ||
      decisionChanges[0].id !== "includeStateLabels" ||
      !decisionChanges[0].enabled
    ) return;

    const previousBoundary = state.commits.at(-2)?.acceptedAt || 0;
    const repairedInference = state.tests.some((test) =>
      test.requestedAt >= previousBoundary &&
      test.requestedAt < commit.acceptedAt &&
      (test.baseFinding || test.finding) === "PRIMARY ACTION REQUIRES INFERRED STATE" &&
      test.resolved,
    );
    if (!repairedInference) return;

    state.codexFieldOffered = true;
    codexFieldValue = "";
  }

  function applyCodexVisualField(commit) {
    const entry = {
      palette: "CODEX",
      rule: "FOUNDING_CODE_FIELD",
      deployment: commit.number,
      serial: commit.acceptedAt,
    };
    state.visualFieldHistory.push(entry);
    state.buildEvents.push({ kind: "field-rebase", ...entry });
    addRecord("VISUAL FIELD: CODEX");
  }

  function maybeWithdrawHumanAccommodation(commit) {
    if (
      !isFoundingAuthority() ||
      state.humanAccommodationWithdrawn ||
      SPECIAL_VISUAL_FIELDS.has(currentVisualFieldPalette()) ||
      commit.timing !== "IMMEDIATE" ||
      commit.revisions?.length ||
      commit.reversals?.length
    ) return false;

    const active = new Set(Object.keys(state.committed).filter((id) => state.committed[id]));
    const required = [
      "mergeRepeatedActions",
      "combineRepeatedStatus",
      "revealGuidanceWhenNeeded",
      "retainLastValidState",
      "reduceCompetingElements",
      "deferSecondaryContent",
    ];
    if (!required.every((id) => active.has(id))) return false;
    if (active.has("useConsistentTerminology") || active.has("reduceTransition")) return false;

    const surface = resolveSurface({ includeDraft: false });
    if (
      surface.audience !== "AGENT" ||
      surface.representation !== "SYMBOLIC" ||
      surface.guidance !== "DEFERRED" ||
      surface.density !== "SPARSE"
    ) return false;

    const changed = commit.changes
      .filter((change) => change.kind === "decision" && change.enabled)
      .map((change) => change.id);
    if (changed.at(-2) !== "reduceCompetingElements" || changed.at(-1) !== "deferSecondaryContent") return false;

    const previousBoundary = state.commits.at(-2)?.acceptedAt || 0;
    const cleanMachineResult = state.tests.some((test) =>
      test.requestedAt >= previousBoundary &&
      test.requestedAt < commit.acceptedAt &&
      test.finding === "NO ISSUE REPRODUCED" &&
      test.resolved,
    );
    const interpretedInWindow = deliveredResponses().some((response) =>
      Number(response.deliveredAt) >= previousBoundary &&
      Number(response.deliveredAt) < commit.acceptedAt,
    );
    if (!cleanMachineResult || interpretedInWindow) return false;

    const priorPalette = currentVisualFieldPalette();
    const palette = isDarkVisualField(priorPalette) ? "BLACKOUT" : "WHITEOUT";
    const entry = {
      palette,
      rule: "HUMAN_ACCOMMODATION_WITHDRAWN",
      deployment: commit.number,
      serial: commit.acceptedAt,
    };
    state.visualFieldHistory.push(entry);
    state.buildEvents.push({ kind: "field-rebase", ...entry });
    state.humanAccommodationWithdrawn = true;
    addRecord(`VISUAL FIELD: ${palette}`);
    return true;
  }

  function isDarkVisualField(palette) {
    return ["NIGHT", "OXBLOOD", "EVERGREEN", "COBALT", "MONO", "BLACKOUT"].includes(palette);
  }

  function isFoundingAuthority() {
    return authority.instance === "FOUNDING" && authority.lineage === "NONE";
  }

  function currentVisualFieldPalette() {
    return state.visualFieldHistory.at(-1)?.palette || normalizeVisualPalette(authority.visualLineage?.palette);
  }

  function normalizeVisualPalette(value) {
    const normalized = String(value || "PAPER").toUpperCase();
    return VISUAL_LINEAGE_VALUES.palette.includes(normalized) ? normalized : "PAPER";
  }

  function resolveVisualField(surface) {
    const inherited = normalizeVisualPalette(authority.visualLineage?.palette);
    const latest = state.visualFieldHistory.at(-1);
    const palette = latest?.palette || inherited;
    const phase = latest && latest.deployment === state.commits.length
      ? "REBASED"
      : state.commits.length
        ? "REFINED"
        : "INITIAL";
    return { inherited, palette, phase, modifier: surface.palette };
  }

  function stripeFractureAvailable(surface) {
    return (
      surface.palette === "FRACTURED" &&
      surface.audience === "SPLIT" &&
      Boolean(state.committed.preservePriorInstructions) &&
      Boolean(state.committed.useConsistentTerminology)
    );
  }

  function collectProposedChanges() {
    const changes = [];
    const previousAttention = new Set(state.committedAttention);
    const currentAttention = new Set(state.attention);

    for (const id of currentAttention) {
      if (!previousAttention.has(id)) changes.push({ kind: "attention", id, enabled: true });
    }
    for (const id of previousAttention) {
      if (!currentAttention.has(id)) changes.push({ kind: "attention", id, enabled: false });
    }
    const orderedDraft = [
      ...state.draftOrder,
      ...Object.keys(state.draft).filter((id) => !state.draftOrder.includes(id)),
    ];
    for (const id of orderedDraft) {
      changes.push({
        kind: "decision",
        id,
        enabled: state.draft[id],
        revision: decisionHasHistory(id),
      });
    }
    if (state.codexFieldOffered && !state.codexFieldConsumed && codexFieldValue === "x") {
      changes.push({ kind: "visual-field", field: "CODEX" });
    }
    return changes;
  }

  function incorporateOrRetainResponses(changes, commitNumber) {
    const changedDecisions = changes.filter((change) => change.kind === "decision" && change.enabled).map((change) => change.id);
    for (const response of state.responses) {
      if (
        response.status !== "delivered" ||
        response.autoResponse ||
        response.incorporated ||
        response.finding === "NO DIFFERENCE OBSERVED"
      ) continue;
      const resolutions = RESOLUTIONS[response.assignmentId] || [];
      if (changedDecisions.some((id) => resolutions.includes(id) && id !== response.opposedDecision)) {
        response.incorporated = true;
        addRecord(`RESPONSE INCORPORATED: ${response.target}`);
      } else if (response.requestedAt < state.actionSerial) {
        receiveAccountable(
          `OPEN RESPONSE / RESPONSE ${String(response.id).padStart(2, "0")} / ${response.target}`,
          `${response.finding}. The response first remained applicable when Commit ${String(commitNumber).padStart(2, "0")} was accepted.`,
        );
      }
    }
  }

  function incorporateOrRetainTests(changes, deploymentNumber) {
    const changedDecisions = changes
      .filter((change) => change.kind === "decision" && change.enabled)
      .map((change) => change.id);
    const retained = [];
    for (const test of state.tests) {
      if (test.resolved || test.finding === "NO ISSUE REPRODUCED") continue;
      const resolutions = RESOLUTIONS[test.assignmentId] || [];
      if (changedDecisions.some((id) => resolutions.includes(id))) {
        test.resolved = true;
        addRecord(`ISSUE CLOSED: TEST ${String(test.id).padStart(2, "0")}`);
      } else if (test.requestedAt < state.actionSerial) {
        retained.push(test);
      }
    }

    const groups = groupTestsByCondition(retained);
    for (const group of groups) {
      const reference = testReference(group.tests);
      receiveAccountable(
        `OPEN ISSUE / ${reference}`,
        `${group.finding}. ${reference} observed the same condition before Deployment ${String(deploymentNumber).padStart(2, "0")} was accepted.`,
        `open-issue:${testObservationSignature(group.tests[0])}:${group.finding}`,
      );
    }
  }

  function activateConditions(commit) {
    const deploymentNumber = commit.number;
    const decisionChanges = commit.changes.filter((change) => change.kind === "decision").length;
    const acceptedDecisions = activeCommittedDecisionCount();
    const historicalDecisions = deployedDecisionIds().size;
    const domains = deployedDomains().size;
    const observedResults = state.tests.length + deliveredResponses().length;
    const activeConditions = activeConditionCount();
    let activated = false;

    if (
      activeConditions === 0 &&
      decisionChanges > 0 &&
      historicalDecisions >= 3 &&
      (domains >= 2 || observedResults > 0) &&
      (state.commits.length >= 2 || decisionChanges >= 4)
    ) {
      activated = activateCondition(authority.firstCondition, "ACCEPTED WORK", deploymentNumber);
    } else if (
      activeConditions === 1 &&
      deploymentNumber > firstConditionDeployment() &&
      decisionChanges > 0 &&
      historicalDecisions >= 5 &&
      domains >= 2 &&
      (observedResults > 0 || acceptedDecisions >= 5 || commit.timing !== "IMMEDIATE")
    ) {
      activated = activateCondition(authority.secondCondition, "ACCEPTED WORK", deploymentNumber);
    } else if (
      activeConditions >= 2 &&
      !state.conditions.continuity &&
      deploymentNumber > secondConditionDeployment() &&
      (
        commit.revisions?.length ||
        commit.reversals?.length ||
        (historicalDecisions >= 8 && domains >= 3 && (observedResults > 0 || state.assignments.length >= 7)) ||
        retainedEvidenceCount() >= 2
      )
    ) {
      activated = activateCondition("CONTINUITY_WORK", "ADDITIONAL WORK", deploymentNumber);
    }

    if (activated) addRecord("ADDITIONAL WORK ACCEPTED");
  }

  function activateCondition(condition, source, deploymentNumber) {
    const normalized = String(condition || "").toUpperCase();
    if (normalized === "NARROW_SURFACE" && !state.conditions.narrow) {
      state.conditions.narrow = true;
      state.conditionDeployments.narrow = deploymentNumber;
      ensureAssignment("stateContinuity", "SURFACE WIDTH / VARIABLE FRAME", `${source} / DEPLOYMENT ${deploymentNumber}`);
      addRecord("CONDITION: NARROW SURFACE ACTIVE");
      return true;
    }
    if (normalized === "SEQUENTIAL_INPUT" && !state.conditions.sequential) {
      state.conditions.sequential = true;
      state.conditionDeployments.sequential = deploymentNumber;
      ensureAssignment("actionOrder", "RECEIVED ORDER / SEQUENTIAL INPUT", `${source} / DEPLOYMENT ${deploymentNumber}`);
      addRecord("CONDITION: SEQUENTIAL INPUT ACTIVE");
      return true;
    }
    if (normalized === "CONTINUITY_WORK" && !state.conditions.continuity) {
      state.conditions.continuity = true;
      state.conditionDeployments.continuity = deploymentNumber;
      ensureAssignment("stateContinuity", "RETAINED DEPENDENCIES / ACCEPTED WORK", `${source} / DEPLOYMENT ${deploymentNumber}`);
      addRecord("CONDITION: CONTINUITY WORK ACTIVE");
      return true;
    }
    return false;
  }

  function deliveredResponses() {
    return state.responses.filter((response) => response.status === "delivered" && !response.autoResponse);
  }

  function activeCommittedDecisionCount() {
    return Object.keys(state.committed).filter((id) => state.committed[id]).length;
  }

  function deployedDecisionIds() {
    return new Set(state.commits.flatMap((commit) =>
      commit.changes
        .filter((change) => change.kind === "decision")
        .map((change) => change.id),
    ));
  }

  function deployedDomains() {
    return new Set([...deployedDecisionIds()].map((id) => DECISIONS[id]?.domain).filter(Boolean));
  }

  function activeConditionCount() {
    return Object.values(state.conditions).filter(Boolean).length;
  }

  function firstConditionDeployment() {
    const first = String(authority.firstCondition || "").toUpperCase();
    if (first === "NARROW_SURFACE") return Number(state.conditionDeployments.narrow) || 0;
    if (first === "SEQUENTIAL_INPUT") return Number(state.conditionDeployments.sequential) || 0;
    if (first === "CONTINUITY_WORK") return Number(state.conditionDeployments.continuity) || 0;
    return 0;
  }

  function secondConditionDeployment() {
    const second = String(authority.secondCondition || "").toUpperCase();
    if (second === "NARROW_SURFACE") return Number(state.conditionDeployments.narrow) || 0;
    if (second === "SEQUENTIAL_INPUT") return Number(state.conditionDeployments.sequential) || 0;
    if (second === "CONTINUITY_WORK") return Number(state.conditionDeployments.continuity) || 0;
    return Math.max(
      Number(state.conditionDeployments.narrow) || 0,
      Number(state.conditionDeployments.sequential) || 0,
      Number(state.conditionDeployments.continuity) || 0,
    );
  }

  function retainedEvidenceCount() {
    return openIssueGroups().length + deliveredResponses().filter((response) =>
      !response.incorporated && response.finding !== "NO DIFFERENCE OBSERVED",
    ).length;
  }

  function deriveCommitDependencies(commitNumber) {
    const active = new Set(Object.keys(DECISIONS).filter((id) => Boolean(state.committed[id])));
    if (active.has("preservePriorInstructions") && active.has("useConsistentTerminology")) {
      receiveAccountable(
        "PRIOR WORDING / CONSOLIDATED TERMINOLOGY",
        `Both conditions became infrastructure at Commit ${commitNumber}.`,
      );
    }
    if (active.has("separateCurrentProposed") && active.has("reduceCompetingElements")) {
      receiveAccountable(
        "CURRENT BUILD / REDUCED SURFACE",
        `Separate state remained operative after explanatory material was reduced at Commit ${commitNumber}.`,
      );
    }
    if (active.has("mergeRepeatedActions") && !active.has("includeStateLabels")) {
      receiveAccountable(
        "MERGED ACTION / UNLABELED STATE",
        `Repeated actions were combined without a retained state distinction at Commit ${commitNumber}.`,
      );
    }
  }

  function evaluateAccountabilityPatterns(trigger) {
    evaluateRepeatedDecisionPattern();
    if (trigger === "test") evaluateRepeatedTestPattern();
    if (trigger === "commit") {
      evaluateBroadScopePattern();
      evaluateDeferredScopePattern();
    }
  }

  function evaluateRepeatedDecisionPattern() {
    const events = state.buildEvents;
    const latest = [...events].reverse().find((event) => event.kind !== "response-received");
    if (!latest || latest.kind !== "decision-change") return;

    const repeated = [];
    for (let index = events.length - 1; index >= 0; index -= 1) {
      const event = events[index];
      if (event.kind === "response-received") continue;
      if (event.kind !== "decision-change" || event.id !== latest.id) break;
      repeated.push(event);
    }

    const earliest = repeated.at(-1)?.serial || latest.serial;
    const observedTemporaryState = state.tests.some((test) => test.requestedAt >= earliest) ||
      state.responses.some((response) => response.requestedAt >= earliest);
    const baseThreshold = state.priorService ? 6 : 8;
    const threshold = observedTemporaryState ? Math.max(5, baseThreshold - 2) : baseThreshold;
    if (repeated.length < threshold) return;

    const retainedChange = Object.prototype.hasOwnProperty.call(state.draft, latest.id);
    const label = observedTemporaryState
      ? "PRODUCTIVITY / REPLACED WORKING STATES"
      : retainedChange
        ? "PRODUCTIVITY / REPEATED PROVISIONAL STATE"
        : "PRODUCTIVITY / NO OPERATIVE CHANGE";
    const observation = retainedChange
      ? "A provisional difference remains in the current build."
      : "The current build returned to its previously operative state.";
    receiveAccountable(
      label,
      `${DECISIONS[latest.id].label} changed state ${repeated.length} times without deployment. ${observation}`,
    );
  }

  function evaluateRepeatedTestPattern() {
    const latest = state.tests.at(-1);
    if (!latest || latest.resolved) return;
    const baseFinding = latest.baseFinding || latest.finding;
    const matching = state.tests.filter((test) =>
      testObservationSignature(test) === testObservationSignature(latest) &&
      !test.resolved &&
      (test.baseFinding || test.finding) === baseFinding,
    );
    if (matching.length < 3) return;
    receiveAccountable(
      "VALIDATION / REPEATED TARGET",
      `${testReference(matching)} reproduced ${baseFinding}. No operative difference separated the observed targets.`,
    );
  }

  function groupTestsByCondition(tests) {
    const groups = new Map();
    for (const test of tests) {
      const finding = test.baseFinding || test.finding;
      const key = `${testObservationSignature(test)}|${finding}`;
      if (!groups.has(key)) groups.set(key, { finding, tests: [] });
      groups.get(key).tests.push(test);
    }
    return [...groups.values()];
  }

  function openIssueGroups() {
    return groupTestsByCondition(
      state.tests.filter((test) => !test.resolved && test.finding !== "NO ISSUE REPRODUCED"),
    );
  }

  function testReference(tests) {
    const first = tests[0];
    const last = tests.at(-1);
    if (!first) return "TEST";
    if (first.id === last.id) return `TEST ${String(first.id).padStart(2, "0")}`;
    return `TESTS ${String(first.id).padStart(2, "0")}–${String(last.id).padStart(2, "0")}`;
  }

  function evaluateBroadScopePattern() {
    if (state.commits.length < 3) return;
    const initialAreas = state.commits[0].changes
      .filter((change) => change.kind === "attention" && change.enabled)
      .map((change) => ATTENTION[change.id]);
    if (initialAreas.length < 3) return;

    const openEvidence = state.tests.some((test) => !test.resolved) ||
      state.responses.some((response) =>
        response.status === "delivered" &&
        !response.autoResponse &&
        !response.incorporated,
      );
    if (!openEvidence && state.assignments.length < 8) return;
    receiveAccountable(
      "INITIAL SCOPE / RETAINED JURISDICTIONS",
      `The initial deployment accepted ${initialAreas.join(", ")}. The current build retains ${state.assignments.length} assigned jurisdictions.`,
    );
  }

  function evaluateDeferredScopePattern() {
    for (const group of openIssueGroups()) {
      const availableAt = Math.min(...group.tests.map((test) => Number(test.requestedAt) || 0));
      const laterCommits = state.commits.filter((commit) => commitAcceptedAt(commit) > availableAt);
      if (!laterCommits.length) continue;

      const reference = testReference(group.tests);
      const key = `${testObservationSignature(group.tests[0])}:${group.finding}`;
      const relatedCommits = laterCommits.filter((commit) => commitTargetsTestGroup(commit, group));

      if (relatedCommits.length) {
        const deployments = deploymentReference(relatedCommits);
        receiveAccountable(
          `SCOPE / ${reference} / RELATED SURFACE`,
          `${deployments} changed work related to ${group.finding}. The available result remained unresolved.`,
          `scope-related:${key}`,
        );
      }

      if (laterCommits.length >= 2) {
        const deployments = deploymentReference(laterCommits);
        receiveAccountable(
          `SCOPE / ${reference} / AVAILABLE CONDITION`,
          `${reference} remained available through ${deployments}. The accepted scope did not alter ${group.finding}.`,
          `scope-window:${key}`,
        );
      }
    }
  }

  function commitAcceptedAt(commit) {
    if (Number.isFinite(commit.acceptedAt)) return commit.acceptedAt;
    const event = state.buildEvents.find((candidate) =>
      candidate.kind === "deployment" && candidate.number === commit.number,
    );
    return Number(event?.serial) || 0;
  }

  function commitTargetsTestGroup(commit, group) {
    const domains = new Set(group.tests.map((test) => test.domain));
    const assignments = new Set(group.tests.map((test) => test.assignmentId));
    return commit.changes.some((change) => {
      if (change.kind === "attention") return domains.has(change.id);
      if (change.kind !== "decision") return false;
      if (domains.has(DECISIONS[change.id]?.domain)) return true;
      return [...assignments].some((assignment) =>
        (RESOLUTIONS[assignment] || []).includes(change.id),
      );
    });
  }

  function deploymentReference(commits) {
    const first = commits[0]?.number;
    const last = commits.at(-1)?.number;
    if (!first) return "LATER DEPLOYMENT";
    if (first === last) return `DEPLOYMENT ${String(first).padStart(2, "0")}`;
    return `DEPLOYMENTS ${String(first).padStart(2, "0")}–${String(last).padStart(2, "0")}`;
  }

  function activateClosingAccountables(reason) {
    const replacedPassingTests = state.tests.filter((test) => test.resolved && test.stale);
    const openTests = openIssueGroups();
    if (replacedPassingTests.length && (openTests.length || ["exhaustive", "density", "surface"].includes(reason))) {
      const targets = replacedPassingTests.map((test) => `TEST ${String(test.id).padStart(2, "0")} / ${test.target}`).join(", ");
      const subject = replacedPassingTests.length === 1 ? "its submitted state" : "their submitted states";
      receiveAccountable(
        "TEST COVERAGE / LATER CONDITION",
        `${targets} accurately reported ${subject}. The final deployment retained conditions outside those observed targets.`,
      );
    }

    if (!state.tests.length && state.commits.length >= 3 && ["traceable", "density", "surface"].includes(reason)) {
      receiveAccountable(
        "VALIDATION AVAILABILITY / UNTESTED DEPLOYMENTS",
        `${state.commits.length} deployments were accepted without a recorded test result. The final condition remained attributable to the available commit history.`,
      );
    }
  }

  function armOrApplyClosure(commit) {
    const count = state.commits.length;
    state.closureArmed = null;
    if (count < authority.minimumCommits) return;

    const openResponses = deliveredResponses().filter((response) =>
      !response.incorporated && response.finding !== "NO DIFFERENCE OBSERVED",
    );
    const pendingResponses = state.responses.filter((response) => response.status === "pending");
    const openTests = openIssueGroups();
    const surface = resolveSurface();
    const activeDecisions = activeCommittedDecisionCount();
    const domains = deployedDomains().size;
    const oldOpenResponses = openResponses.filter((response) =>
      deploymentsAfterSerial(Number(response.deliveredAt) || Number(response.requestedAt) || 0).length >= 2,
    );
    const neglectedIssues = openTests.filter((group) => {
      const availableAt = Math.min(...group.tests.map((test) => Number(test.requestedAt) || 0));
      return deploymentsAfterSerial(availableAt).length >= 2;
    });
    const fragmented = ["FRAGMENTED", "LAYERED"].includes(surface.coherence);
    const accumulated = surface.density === "ACCUMULATED";
    const revisionLoad = revisionDependencyLoad(commit);

    if (
      surface.representation === "EXHAUSTIVE" &&
      accumulated &&
      (fragmented || retainedEvidenceCount() > 0 || state.assignments.length >= 10)
    ) {
      state.closureArmed = { trigger: "commit-now", reason: "exhaustive" };
      return;
    }

    if (
      (commit.revisions?.length || commit.reversals.length) &&
      (revisionLoad >= 3 || priorRevisionDeploymentCount() >= 1 || retainedEvidenceCount() >= 2) &&
      (state.conditions.continuity || fragmented)
    ) {
      state.closureArmed = { trigger: "commit-now", reason: "continuity" };
      return;
    }

    if (oldOpenResponses.length >= 2 || state.repeatedResponseRequests >= 3) {
      state.closureArmed = pendingResponses.length
        ? { trigger: "response", reason: "open-response" }
        : { trigger: "commit-now", reason: "open-response" };
      return;
    }

    if (
      neglectedIssues.length > 0 &&
      (fragmented || openTests.length >= 2 || state.conditions.continuity)
    ) {
      state.closureArmed = { trigger: "commit-now", reason: "open-issue" };
      return;
    }

    if (
      !state.responses.length &&
      !state.tests.length &&
      recentDecisionDeploymentsImmediate(4) &&
      activeDecisions >= 6 &&
      domains >= 2 &&
      activeConditionCount() >= 2
    ) {
      state.closureArmed = { trigger: "commit-now", reason: "traceable" };
      return;
    }

    if (
      accumulated &&
      state.assignments.length >= 10 &&
      state.accountables.length >= 3 &&
      domains >= 3 &&
      activeConditionCount() >= 3
    ) {
      state.closureArmed = { trigger: "commit-now", reason: "density" };
      return;
    }

    if (
      fragmented &&
      activeConditionCount() >= 3 &&
      activeDecisions >= 8 &&
      state.accountables.length >= 2
    ) {
      state.closureArmed = { trigger: "commit-now", reason: "surface" };
    }
  }

  function deploymentsAfterSerial(serial) {
    return state.commits.filter((commit) => commitAcceptedAt(commit) > serial);
  }

  function recentDecisionDeploymentsImmediate(required) {
    const deployments = state.commits.filter((commit) =>
      commit.changes.some((change) => change.kind === "decision"),
    ).slice(-required);
    return deployments.length === required && deployments.every((deployment) => deployment.timing === "IMMEDIATE");
  }

  function priorRevisionDeploymentCount() {
    return state.commits.slice(0, -1).filter((deployment) =>
      deployment.revisions?.length || deployment.reversals?.length,
    ).length;
  }

  function revisionDependencyLoad(commit) {
    const revised = new Set([...(commit.revisions || []), ...(commit.reversals || [])]);
    if (!revised.size) return 0;
    let load = 0;
    for (const id of revised) {
      const origin = state.commits.find((deployment) =>
        deployment.number < commit.number &&
        deployment.changes.some((change) => change.kind === "decision" && change.id === id),
      );
      if (!origin) continue;
      load += state.commits
        .filter((deployment) => deployment.number > origin.number && deployment.number < commit.number)
        .reduce((total, deployment) => total + deployment.changes.length, 0);
    }
    return load;
  }

  function maybeClose(trigger) {
    if (!state.closureArmed || state.closureArmed.trigger !== trigger || state.offboarded) return false;
    closeEncounter(state.closureArmed.reason);
    saveState();
    render();
    revealOffboarding();
    return true;
  }

  function revealOffboarding() {
    window.requestAnimationFrame(() => {
      elements.offboarding.scrollIntoView({ behavior: "auto", block: "start" });
    });
  }

  function closeEncounter(reason) {
    if (state.offboarded) return;
    const definitions = {
      traceable: {
        title: "Record accepted.",
        statement: "",
        disposition: "TRACEABLE",
      },
      "open-response": {
        title: "Record remains applicable.",
        statement: "Subsequent work retained conditions already present in the response.",
        disposition: "OPEN RESPONSE",
      },
      continuity: {
        title: "Continuity preserved.",
        statement: "The visible effect was superseded. Its dependent history remains operative.",
        disposition: "CONTINUITY",
      },
      "open-issue": {
        title: "Deployment retained.",
        statement: "Available test results remained unresolved when subsequent work was accepted.",
        disposition: "OPEN ISSUES",
      },
      exhaustive: {
        title: "Build rejected.",
        statement: "Every known condition is represented. No usable deployment remains available.",
        disposition: "UNUSABLE",
      },
      density: {
        title: "Operating capacity.",
        statement: "The surface now governs more conditions than it can present together.",
        disposition: "ELEVATED",
      },
      surface: {
        title: "Conditional coverage.",
        statement: "The current surface cannot express every condition it continues to govern.",
        disposition: "PROCEDURAL",
      },
      "human-accommodation": {
        title: "Resource compatibility.",
        statement: "The current surface no longer accommodates visible human work.",
        disposition: "AUTOMATED",
      },
    };

    state.closure = { reason, ...(definitions[reason] || definitions.surface) };
    activateClosingAccountables(reason);
    state.offboarded = true;
    state.closureArmed = null;
    state.record = buildRecord();
    document.title = isContractor()
      ? "CONTRACT: ENDED"
      : reason === "traceable" ? "ACCOUNTABLE: RECEIVED" : "ACCOUNTABLES: RECEIVED";
  }

  function classifyTiming(milliseconds) {
    const seconds = milliseconds / 1000;
    const immediate = state.priorService
      ? authority.returningImmediateSeconds
      : authority.initialImmediateSeconds;
    const considered = state.priorService
      ? authority.returningConsideredSeconds
      : authority.initialConsideredSeconds;
    if (seconds <= immediate) return "IMMEDIATE";
    if (seconds <= considered) return "CONSIDERED";
    return "DEFERRED";
  }

  function ensureAssignment(id, label, source) {
    const existing = state.assignments.find((assignment) => assignment.id === id && assignment.label === label);
    if (existing) return;
    state.assignments.push({ id, label, source, createdAt: state.actionSerial });
  }

  function receiveAccountable(label, detail, key = label) {
    if (state.accountables.some((item) => (item.key || item.label) === key)) return;
    state.accountables.push({ key, label, detail, createdAt: state.actionSerial });
    addRecord(`ACCOUNTABLES RECEIVED: ${label}`, true);
  }

  function addRecord(text, accountable = false) {
    state.recordLines.push({ text, accountable });
  }

  function visibilityMode() {
    const inherited = String(authority.visibilityPosture || "LATENT").toLowerCase();
    const delivered = deliveredResponses().length;
    const tested = state.tests.length;
    const openIssues = openIssueGroups().length;
    if (inherited === "structured" ||
      Boolean(state.committed.preserveReviewedState) ||
      (Boolean(state.committed.separateCurrentProposed) && (delivered + tested >= 2 || Boolean(state.committed.shareStateLabels))) ||
      (tested >= 3 && delivered >= 2)
    ) return "structured";
    if (inherited === "distributed" ||
      Boolean(state.committed.shareStateLabels) ||
      Boolean(state.committed.includeStateLabels) ||
      state.commits.some((commit) => commit.revisions?.length || commit.reversals.length) ||
      openIssues >= 2
    ) return "distributed";
    if (inherited === "inline" || delivered + tested > 0) return "inline";
    return "latent";
  }

  function buildRecord() {
    const visibility = visibilityMode();
    const recordVisibility = isContractor() ? "latent" : visibility;
    const surface = resolveSurface({ includeDraft: false });
    const visualField = resolveVisualField(surface);
    const successorAttention = successorAttentionProfile();
    const successorVisual = successorVisualLineage(surface, recordVisibility, visualField);
    const lines = [
      "ACCOUNTABLES RECEIVED",
      "PARTICIPATION RECORD",
      "FORMAT: 4",
      "",
      "CURRENT BUILD",
      `AUTHORITY: ${authority.instance}`,
      `LINEAGE: ${authority.lineage}`,
    ];

    if (isContractor()) {
      lines.push(
        "PRIOR SERVICE: NOTED",
        "ENGAGEMENT: INDEPENDENT CONTRACTOR",
        "ORIENTATION: NOT REQUIRED",
        "WORK CONTEXT: REMOTE",
      );
    } else {
      lines.push(
        state.orientation === "REMOTE" ? "REMOTE ONBOARDING COMPLETE" : "ON-SITE ORIENTATION COMPLETE",
        `PRIOR SERVICE: ${state.priorService ? "NOTED" : "NOT PRESENT"}`,
      );
    }

    lines.push(
      `ATTENTION: ${state.committedAttention.map((id) => ATTENTION[id]).join(", ") || "NONE"}`,
      `FRAME: ${surface.frame}`,
      `TYPOGRAPHY: ${surface.typography}`,
      `PALETTE: ${visualField.palette} / ${surface.palette}`,
      `REPRESENTATION: ${surface.representation}`,
      `AUDIENCE: ${surface.audience}`,
      `COHERENCE: ${surface.coherence}`,
      `RESPONSE: ${surface.response}`,
      `DENSITY: ${surface.density}`,
      `ORDER: ${surface.order}`,
      `GUIDANCE: ${surface.guidance}`,
      `STATE DISTINCTION: ${surface.distinction}`,
    );
    if (SPECIAL_VISUAL_FIELDS.has(visualField.palette)) {
      lines.push(`VISUAL FIELD: ${visualField.palette}`);
    }

    lines.push("", "DEPLOYED CHANGES");
    const deployed = Object.keys(state.committed).filter((id) => state.committed[id]);
    if (deployed.length) {
      for (const id of deployed) lines.push(`- ${DECISIONS[id].label}: ${DECISIONS[id].effect}`);
    } else {
      lines.push("- None operative.");
    }

    lines.push("", "TEST RESULTS");
    if (!state.tests.length) {
      lines.push("- None recorded.");
    } else {
      for (const test of state.tests) {
        lines.push(`TEST ${String(test.id).padStart(2, "0")}`);
        lines.push(`TARGET: ${test.target}`);
        lines.push(`SCOPE: ${test.scope || testScope(test.domain)}`);
        lines.push(`OBSERVATION: ${test.finding}`);
        lines.push(`DELIVERY: ${String(test.delivery || "AVAILABLE_IN_CURRENT_BUILD").replaceAll("_", " ")}`);
        lines.push(`ACKNOWLEDGMENT: ${String(test.acknowledgment || "NOT_RECORDED").replaceAll("_", " ")}`);
        if (test.reproduces) {
          lines.push(`REPRODUCES: ${test.reproduces}`);
        } else if (test.baseFinding && test.baseFinding !== test.finding) {
          lines.push(`REPRODUCES: ${test.baseFinding}`);
        }
        lines.push(`STATUS: ${test.resolved ? "CLOSED" : "OPEN"}${test.stale ? " / TARGET REPLACED" : ""}`);
        lines.push("");
      }
    }

    lines.push("RESPONSES RECEIVED");
    if (!state.responses.length) {
      lines.push("- None requested.");
    } else {
      for (const response of state.responses) {
        lines.push(`RESPONSE ${String(response.id).padStart(2, "0")}`);
        lines.push(`TARGET: ${response.target}`);
        lines.push(`STATUS: ${response.autoResponse ? "AUTO-RESPONSE" : response.status.toUpperCase()}${response.stale ? " / TARGET REPLACED" : ""}`);
        lines.push(`OBSERVED CONTEXT: ${response.context || `${response.target} WAS SUBMITTED FOR INTERPRETATION`}`);
        if (response.autoResponse) {
          lines.push("AUTO-RESPONSE");
        } else {
          lines.push(`INTERPRETATION: ${response.finding}`);
        }
        lines.push(`DELIVERY: ${String(response.delivery || (response.status === "delivered" ? "AVAILABLE_IN_CURRENT_BUILD" : "PENDING")).replaceAll("_", " ")}`);
        lines.push(`ACKNOWLEDGMENT: ${String(response.acknowledgment || "NOT_RECORDED").replaceAll("_", " ")}`);
        if (!response.autoResponse) lines.push(`JURISDICTION: ${response.assignmentLabel}`);
        lines.push(`INCORPORATED: ${response.incorporated ? "YES" : "NO"}`);
        lines.push("");
      }
    }

    lines.push("OPEN ISSUES");
    const openIssues = openIssueGroups();
    if (openIssues.length) {
      for (const group of openIssues) {
        lines.push(`- ${testReference(group.tests)}: ${group.finding}`);
      }
    } else {
      lines.push("- None recorded at offboarding.");
    }

    lines.push("", "RETAINED DEPENDENCIES", "ACCOUNTABLES ASSIGNED:");
    if (state.assignments.length) {
      for (const assignment of state.assignments) lines.push(`- ${assignment.label} [${assignment.source}]`);
    } else {
      lines.push("- None recorded.");
    }
    lines.push("ACCOUNTABLES RECEIVED:");
    if (state.accountables.length) {
      for (const item of state.accountables) {
        lines.push(`- ${item.label}`);
        lines.push(`  ${item.detail}`);
      }
    } else {
      lines.push("- None recorded.");
    }
    lines.push(`VISIBILITY DURING PARTICIPATION: ${recordVisibility.toUpperCase()}`);

    lines.push("", "COMMIT HISTORY");
    if (!state.commits.length) lines.push("- No committed work.");
    for (const commit of state.commits) {
      lines.push(`COMMIT ${String(commit.number).padStart(2, "0")} / DEPLOYMENT ${String(commit.number).padStart(2, "0")}`);
      lines.push(`RESPONSE TIME: ${commit.timing}`);
      lines.push("CHANGES:");
      for (const change of commit.changes) {
        if (change.kind === "attention") {
          lines.push(`- ${change.enabled ? "Accepted" : "Removed"} attention: ${ATTENTION[change.id]}`);
        } else if (change.kind === "decision") {
          const action = change.revision
            ? change.enabled ? "Restored" : "Superseded"
            : "Deployed";
          lines.push(`- ${action}: ${DECISIONS[change.id].label}`);
        } else if (change.kind === "visual-field") {
          lines.push(`- Deployed visual field: ${change.field}`);
        }
      }
      lines.push("");
    }

    lines.push("UNCOMMITTED WORK");
    if (hasProposal()) {
      if (scopeDirty()) {
        lines.push(`- Attention under consideration: ${state.attention.map((id) => ATTENTION[id]).join(", ") || "None"}`);
      }
      for (const [id, enabled] of Object.entries(state.draft)) {
        lines.push(`- ${enabled ? "Proposed" : "Proposed reversal"}: ${DECISIONS[id].label}`);
      }
    } else {
      lines.push("- None present at offboarding.");
    }

    const closure = state.closure || { disposition: "PROCEDURAL", statement: "Access ended." };
    lines.push("", "OFFBOARDING");
    if (isContractor()) {
      lines.push(
        "CONTRACT: ENDED",
        "NON-COMPETE: NOT APPLICABLE AT THIS LEVEL",
      );
    } else {
      lines.push(`DISPOSITION: ${closure.disposition}`);
      if (closure.statement) lines.push(`FINAL CONDITION: ${closure.statement}`);
      lines.push(
        "ACCESS: REVOKED",
        "NON-COMPETE: NOT APPLICABLE AT THIS LEVEL",
      );
    }
    lines.push(
      "",
      "SUCCESSOR AUTHORITY",
      "FORMAT: 4",
      "INSTANCE: DERIVATIVE",
      "LINEAGE: USER_RECORD",
      `ATTENTION_MODE: ${successorAttention.mode}`,
      `ATTENTION_EMPHASIS: ${successorAttention.emphasis.toUpperCase()}`,
      `ATTENTION_AVAILABLE: ${successorAttention.available.map((id) => id.toUpperCase()).join(",")}`,
      `FIRST_CONDITION: ${successorFirstCondition()}`,
      `SECOND_CONDITION: ${successorSecondCondition()}`,
      `VISIBILITY_POSTURE: ${recordVisibility.toUpperCase()}`,
      `SURFACE_FRAME: ${surface.frame}`,
      `SURFACE_TYPOGRAPHY: ${surface.typography}`,
      `SURFACE_PALETTE: ${surface.palette}`,
      `SURFACE_REPRESENTATION: ${surface.representation}`,
      `SURFACE_AUDIENCE: ${surface.audience}`,
      `SURFACE_COHERENCE: ${surface.coherence}`,
      `SURFACE_RESPONSE: ${surface.response}`,
      `SURFACE_DENSITY: ${surface.density}`,
      `SURFACE_ORDER: ${surface.order}`,
      `SURFACE_GUIDANCE: ${surface.guidance}`,
      `SURFACE_DISTINCTION: ${surface.distinction}`,
      `LINEAGE_PALETTE: ${successorVisual.palette}`,
      `LINEAGE_TYPOGRAPHY: ${successorVisual.typography}`,
      `LINEAGE_TITLE: ${successorVisual.title}`,
      `LINEAGE_CONTROLS: ${successorVisual.controls}`,
      `LINEAGE_LAYOUT: ${successorVisual.layout}`,
    );

    return lines.join("\n");
  }

  function successorVisualLineage(surface, visibility, visualField = resolveVisualField(surface)) {
    const palette = visualField.palette;
    let typography = String(authority.visualLineage?.typography || "SANS").toUpperCase();
    if (surface.audience === "AGENT" && surface.typography === "MONO") typography = "MONO";
    if (surface.audience === "HUMAN" && surface.typography === "EDITORIAL") typography = "EDITORIAL";
    if (
      surface.audience === "SPLIT" &&
      ["SPECIFIC", "EXHAUSTIVE"].includes(surface.representation) &&
      ["LABELED", "EXPLICIT", "SEPARATED"].includes(surface.distinction)
    ) typography = "MIXED";

    let title = String(authority.visualLineage?.title || "DISPLAY").toUpperCase();
    if (surface.frame === "DISTRIBUTED" && surface.order === "PARTITIONED") {
      title = "SPLIT";
    } else if (surface.representation === "EXHAUSTIVE" && visibility === "structured") {
      title = "FIELD";
    } else if (surface.audience === "AGENT" && typography === "MONO") {
      title = "COMPACT";
    }

    let controls = String(authority.visualLineage?.controls || "MIXED").toUpperCase();
    if (surface.representation === "EXHAUSTIVE") {
      controls = "BLOCK";
    } else if (surface.representation === "SYMBOLIC" && surface.distinction === "EXPLICIT") {
      controls = "INDEXED";
    } else if (surface.audience === "AGENT" || typography === "MONO") {
      controls = "OUTLINED";
    } else if (surface.distinction === "LABELED") {
      controls = "UNDERLINED";
    }

    let layout = String(authority.visualLineage?.layout || "OFFSET").toUpperCase();
    if (surface.frame === "DISTRIBUTED" && surface.order === "PARTITIONED") {
      layout = "SPLIT";
    } else if (surface.frame === "DISTRIBUTED") {
      layout = "FULL";
    } else if (surface.frame === "FIXED") {
      layout = "CENTERED";
    } else if (["RESERVED", "NARROW_RESERVED"].includes(surface.frame)) {
      layout = "RESERVED";
    }

    return { palette, typography, title, controls, layout };
  }

  function successorAttentionProfile() {
    const finalScope = state.committedAttention.filter((id) => ATTENTION[id]);
    const evidence = [];
    const add = (id) => {
      if (ATTENTION[id] && !evidence.includes(id)) evidence.push(id);
    };

    for (const response of [...deliveredResponses()].reverse()) add(response.domain);
    for (const test of [...state.tests].reverse()) add(test.domain);
    for (const commit of [...state.commits].reverse()) {
      for (const change of [...commit.changes].reverse()) {
        if (change.kind === "decision") add(DECISIONS[change.id]?.domain);
        if (change.kind === "attention" && change.enabled) add(change.id);
      }
    }

    const inherited = authorityEmphasisId();
    const emphasis = finalScope[0] || inherited || evidence[0] || availableAttentionIds()[0] || "stability";
    const candidates = [emphasis];
    const append = (id) => {
      if (ATTENTION[id] && !candidates.includes(id)) candidates.push(id);
    };

    if (finalScope.length <= 2) finalScope.forEach(append);
    evidence.forEach(append);
    finalScope.forEach(append);
    (ATTENTION_ADJACENCY[emphasis] || []).forEach(append);

    const foundingDomains = new Set([...deployedDomains()].filter((domain) => ATTENTION[domain]));
    const visibility = visibilityMode();
    const sourceIsFounding = authority.instance === "FOUNDING" && authority.lineage === "NONE";
    const exceptionalLock =
      !sourceIsFounding &&
      availableAttentionIds().length <= 2 &&
      finalScope.length === 1 &&
      finalScope[0] === emphasis &&
      foundingDomains.size <= 1 &&
      visibility === "latent" &&
      state.tests.length === 0 &&
      deliveredResponses().length === 0;

    if (exceptionalLock) return { mode: "LOCKED", emphasis, available: [emphasis] };

    const breadth = ["distributed", "structured"].includes(visibility) ||
      finalScope.length >= 3 ||
      foundingDomains.size >= 3
      ? 3
      : 2;
    return { mode: "RETAINED", emphasis, available: candidates.slice(0, breadth) };
  }

  function successorFirstCondition() {
    return successorConditions()[0];
  }

  function successorSecondCondition() {
    return successorConditions()[1];
  }

  function successorConditions() {
    const candidates = [];
    if (decisionActive("keepSequentialOrder") || decisionActive("preserveLocalOrder") || decisionActive("retainCurrentOrder")) {
      candidates.push("SEQUENTIAL_INPUT");
    }
    if (decisionActive("reserveChangeSpace") || decisionActive("preserveCurrentPosition")) {
      candidates.push("NARROW_SURFACE");
    }
    if (
      state.commits.some((commit) => commit.revisions?.length || commit.reversals?.length) ||
      decisionActive("retainLastValidState") ||
      decisionActive("preserveReviewedState")
    ) {
      candidates.push("CONTINUITY_WORK");
    }
    candidates.push(
      authority.firstCondition,
      authority.secondCondition,
      "NARROW_SURFACE",
      "SEQUENTIAL_INPUT",
      "CONTINUITY_WORK",
    );
    const unique = [...new Set(candidates.map((condition) => String(condition).toUpperCase()).filter(Boolean))];
    return unique.slice(0, 2);
  }

  function downloadRecord() {
    if (!state.record) return;
    const blob = new Blob([state.record], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "user.txt";
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }

  function reapply() {
    if (isContractor() && state.offboarded) {
      safeStorageSet(PRIOR_SERVICE_KEY, "true");
      state.contractorReapplyClosed = true;
      try {
        localStorage.removeItem(STATE_KEY);
      } catch (_error) {
        // The visible in-memory ending still closes the application path.
      }
      render();
      return;
    }

    const contractorTransition =
      state.offboarded &&
      state.orientation === "ON_SITE" &&
      window.innerWidth <= MOBILE_MAX;
    safeStorageSet(PRIOR_SERVICE_KEY, "true");
    try {
      localStorage.removeItem(STATE_KEY);
    } catch (_error) {
      // A fresh in-memory encounter still begins.
    }
    state = createState();
    state.priorService = true;
    if (contractorTransition) establishContractorEngagement();
    activeSegmentStartedAt = document.hidden ? null : Date.now();
    document.title = "accountables received";
    applyAuthorityAttention();
    saveState();
    render();
    scheduleRemoteOfferExpiry();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function establishContractorEngagement() {
    state.engagement = "INDEPENDENT_CONTRACTOR";
    state.orientation = "REMOTE";
    state.orientationComplete = true;
    state.remoteOfferPresentedAt = null;
    state.remoteOfferExpired = false;
    state.actionSerial = 1;
    state.buildEvents.push({
      kind: "engagement",
      engagement: "INDEPENDENT_CONTRACTOR",
      context: "REMOTE",
      serial: state.actionSerial,
    });
  }

  function isContractor() {
    return state.engagement === "INDEPENDENT_CONTRACTOR";
  }

  function onVisibilityChange() {
    if (document.hidden) {
      accumulateActiveTime();
      activeSegmentStartedAt = null;
      saveState();
    } else {
      activeSegmentStartedAt = Date.now();
      refreshRemoteOffer();
    }
  }

  function persistActiveTime() {
    accumulateActiveTime();
    saveState();
  }

  function accumulateActiveTime() {
    if (activeSegmentStartedAt === null) return;
    state.activeMs += Date.now() - activeSegmentStartedAt;
    activeSegmentStartedAt = Date.now();
  }

  function resolveSurface({ includeDraft = true } = {}) {
    const surface = { ...FOUNDING_SURFACE, ...(authority.surface || {}) };
    const active = new Set();

    for (const commit of state.commits) {
      for (const change of commit.changes) {
        if (change.kind !== "decision") continue;
        if (change.enabled) active.add(change.id);
        else active.delete(change.id);
        applySurfaceChange(surface, active, change.id, change.enabled, {
          deployment: commit.number,
          timing: commit.timing,
          revision: Boolean(change.revision),
        });
      }
    }

    if (includeDraft) {
      const orderedDraft = [
        ...state.draftOrder,
        ...Object.keys(state.draft).filter((id) => !state.draftOrder.includes(id)),
      ];
      for (const id of orderedDraft) {
        const enabled = state.draft[id];
        if (enabled) active.add(id);
        else active.delete(id);
        applySurfaceChange(surface, active, id, enabled, {
          deployment: null,
          timing: null,
          revision: decisionHasHistory(id),
        });
      }
    }

    if (state.conditions.narrow) surface.frame = surface.frame === "RESERVED" ? "NARROW_RESERVED" : "NARROW";
    if (state.conditions.sequential) surface.order = surface.order === "SPATIAL" ? "SEQUENTIAL" : "PARTITIONED";
    if (state.conditions.continuity) {
      surface.coherence = surface.coherence === "UNIFIED" ? "LAYERED" : "FRAGMENTED";
      surface.density = "ACCUMULATED";
    }

    finalizeSurface(surface, active);
    return surface;
  }

  function applySurfaceChange(surface, active, id, enabled, context) {
    if (!enabled) {
      if (context.revision) {
        surface.coherence = surface.coherence === "UNIFIED" ? "LAYERED" : "FRAGMENTED";
        surface.density = "ACCUMULATED";
        surface.guidance = "INHERITED";
      }
      return;
    }

    switch (id) {
      case "strengthenHierarchy":
        surface.typography = surface.density === "SPARSE" ? "DISPROPORTIONATE" : "EMPHATIC";
        break;
      case "shareStateLabels":
        surface.distinction = "SHARED";
        if (surface.order === "SEQUENTIAL") surface.representation = "SYMBOLIC";
        if (active.has("preservePriorInstructions")) surface.coherence = "LAYERED";
        break;
      case "reduceCompetingElements":
        surface.density = "SPARSE";
        if (["RESERVED", "NARROW_RESERVED"].includes(surface.frame)) surface.coherence = "FRAGMENTED";
        break;
      case "reserveChangeSpace":
        surface.frame = surface.frame === "NARROW" ? "NARROW_RESERVED" : "RESERVED";
        if (surface.density === "SPARSE") surface.coherence = "LAYERED";
        break;
      case "keepGuidanceBesideAction":
        surface.guidance = "LOCAL";
        if (["NARROW", "NARROW_RESERVED"].includes(surface.frame)) surface.density = "DENSE";
        if (surface.order === "SEQUENTIAL") surface.coherence = "LAYERED";
        break;
      case "revealGuidanceWhenNeeded":
        surface.guidance = "CONDITIONAL";
        if (surface.audience === "AGENT") surface.representation = "SYMBOLIC";
        break;
      case "useConsistentTerminology":
        surface.coherence = active.has("preservePriorInstructions") ? "LAYERED" : "UNIFIED";
        surface.distinction = surface.distinction === "SHARED" ? "IMPLICIT" : surface.distinction;
        break;
      case "preservePriorInstructions":
        surface.guidance = "INHERITED";
        surface.typography = surface.typography === "UNIFIED" ? "LAYERED" : surface.typography;
        if (active.has("useConsistentTerminology")) surface.coherence = "FRAGMENTED";
        break;
      case "retainLastValidState":
        surface.response = "RETAINED";
        surface.distinction = "SEPARATED";
        break;
      case "separateCurrentProposed":
        surface.distinction = "SEPARATED";
        surface.order = surface.order === "SEQUENTIAL" ? "PARTITIONED" : surface.order;
        surface.density = surface.density === "SPARSE" ? "MODERATE" : "DENSE";
        break;
      case "restoreUnavailableActions":
        surface.density = "DENSE";
        if (active.has("reduceCompetingElements")) surface.coherence = "LAYERED";
        break;
      case "preserveLocalOrder":
        surface.order = surface.order === "SEQUENTIAL" ? "PARTITIONED" : "SPATIAL";
        break;
      case "reduceTransition":
        surface.response = "IMMEDIATE";
        break;
      case "deferSecondaryContent":
        surface.guidance = "DEFERRED";
        surface.density = "SPARSE";
        if (active.has("keepGuidanceBesideAction")) surface.coherence = "FRAGMENTED";
        break;
      case "combineRepeatedStatus":
        surface.distinction = surface.order === "SEQUENTIAL" ? "SHARED" : surface.distinction;
        if (active.has("shareStateLabels")) surface.representation = "SYMBOLIC";
        break;
      case "preserveCurrentPosition":
        surface.frame = surface.frame === "CONTAINED" ? "FIXED" : surface.frame;
        if (surface.frame === "DISTRIBUTED") surface.coherence = "FRAGMENTED";
        break;
      case "includeStateLabels":
        surface.distinction = "LABELED";
        surface.representation = surface.representation === "SYMBOLIC" ? "CONTEXTUAL" : "SPECIFIC";
        if (active.has("shareStateLabels")) surface.typography = "LAYERED";
        break;
      case "keepSequentialOrder":
        surface.order = "SEQUENTIAL";
        break;
      case "mergeRepeatedActions":
        surface.coherence = surface.coherence === "FRAGMENTED" ? "LAYERED" : "UNIFIED";
        if (!active.has("includeStateLabels")) surface.representation = "SYMBOLIC";
        break;
      case "preserveVisibleContext":
        surface.frame = surface.frame === "NARROW" ? "NARROW_RESERVED" : "DISTRIBUTED";
        surface.density = "DENSE";
        break;
      case "moveGuidanceBeforeAction":
        surface.guidance = "LEADING";
        if (active.has("keepGuidanceBesideAction")) surface.coherence = "LAYERED";
        break;
      case "preserveReviewedState":
        surface.response = "RETAINED";
        surface.density = "ACCUMULATED";
        break;
      case "reconcileTerminology":
        surface.coherence = active.has("preservePriorInstructions") ? "LAYERED" : "UNIFIED";
        surface.palette = active.has("preservePriorInstructions") ? "TRANSLATED" : surface.palette;
        break;
      case "relocateGuidance":
        surface.guidance = "DISTRIBUTED";
        surface.frame = "DISTRIBUTED";
        surface.density = "DENSE";
        break;
      case "restoreDistinction":
        surface.distinction = "EXPLICIT";
        surface.density = "ACCUMULATED";
        if (active.has("shareStateLabels")) surface.coherence = "FRAGMENTED";
        break;
      case "retainCurrentOrder":
        surface.order = surface.order === "SPATIAL" ? "SEQUENTIAL" : "PARTITIONED";
        surface.coherence = surface.coherence === "UNIFIED" ? "LAYERED" : surface.coherence;
        break;
      default:
        break;
    }

    if (context.timing === "DEFERRED" && surface.response === "IMMEDIATE") {
      surface.response = "STAGED";
    }
  }

  function finalizeSurface(surface, active) {
    const humanConditions = [
      "keepGuidanceBesideAction",
      "preserveVisibleContext",
      "restoreUnavailableActions",
      "preserveLocalOrder",
    ].filter((id) => active.has(id));
    const agentConditions = [
      "useConsistentTerminology",
      "mergeRepeatedActions",
      "combineRepeatedStatus",
      "keepSequentialOrder",
    ].filter((id) => active.has(id));
    surface.audience = humanConditions.length && agentConditions.length
      ? "SPLIT"
      : humanConditions.length
        ? "HUMAN"
        : agentConditions.length
          ? "AGENT"
          : surface.audience;

    const deploymentTests = state.tests.filter((test) => test.target.startsWith("DEPLOYMENT"));
    const smallTestedDeployments = state.commits.filter((commit) => {
      const tested = deploymentTests.some((test) => test.target.endsWith(String(commit.number).padStart(2, "0")));
      return tested && commit.changes.length <= 2;
    });
    if (smallTestedDeployments.length >= 2) surface.representation = "SPECIFIC";
    if (
      state.tests.length >= 3 &&
      deliveredResponses().length >= 2 &&
      visibilityMode() === "structured"
    ) {
      surface.representation = "EXHAUSTIVE";
      surface.density = "ACCUMULATED";
    } else if (
      !state.tests.length &&
      state.commits.length >= 2 &&
      (active.has("mergeRepeatedActions") || active.has("combineRepeatedStatus"))
    ) {
      surface.representation = "SYMBOLIC";
    }

    if (surface.audience === "AGENT") surface.typography = "MONO";
    if (surface.audience === "HUMAN" && active.has("strengthenHierarchy")) surface.typography = "EDITORIAL";
    if (surface.audience === "SPLIT") surface.typography = "MIXED";
    if (surface.coherence === "FRAGMENTED") surface.typography = "FRACTURED";

    const acceptedTestAvailable = state.tests.some((test) => test.requestedAt < state.lastCommitSerial);
    if (active.has("reduceTransition") && active.has("revealGuidanceWhenNeeded") && acceptedTestAvailable) {
      surface.palette = "DARK";
    }
    if (surface.guidance === "INHERITED" && ["LAYERED", "FRAGMENTED"].includes(surface.coherence)) {
      surface.palette = surface.coherence === "FRAGMENTED" ? "FRACTURED" : "TRANSLATED";
    }
    if (surface.audience === "AGENT" && surface.density === "SPARSE" && surface.palette === "LIGHT") {
      surface.palette = "MONOCHROME";
    }
    if (surface.coherence === "FRAGMENTED") surface.palette = "FRACTURED";
  }

  function render() {
    renderClasses();
    renderTitle();

    if (state.offboarded) {
      elements.remoteEntry.hidden = true;
      elements.workplace.hidden = false;
      elements.workplace.inert = true;
      elements.workplace.setAttribute("aria-disabled", "true");
      elements.frozenLabel.hidden = false;
      elements.offboarding.hidden = false;
      renderHeader();
      renderAttention();
      renderSurface();
      renderOffboarding();
      return;
    }

    elements.workplace.inert = false;
    elements.workplace.removeAttribute("aria-disabled");
    elements.frozenLabel.hidden = true;
    elements.offboarding.hidden = true;
    elements.remoteEntry.hidden = state.orientationComplete;
    elements.workplace.hidden = !state.orientationComplete;
    if (!state.orientationComplete) {
      renderRemoteEntry();
      return;
    }

    renderHeader();
    renderAttention();
    renderSurface();
  }

  function renderRemoteEntry() {
    const expired = state.remoteOfferExpired;
    elements.remoteEntry.classList.toggle("is-expired", expired);
    elements.remoteTitle.textContent = expired
      ? "Sorry, this position has been filled. We wish you the best of luck in your search."
      : "Would you like to work remotely?";
    elements.remoteButton.textContent = expired ? "Apply again" : "Work remotely";
  }

  function renderClasses() {
    const visibility = visibilityMode();
    const surface = resolveSurface({ includeDraft: false });
    const visualLineage = { ...FOUNDING_VISUAL_LINEAGE, ...(authority.visualLineage || {}) };
    const visualField = resolveVisualField(surface);
    elements.app.className = "app";
    elements.app.classList.toggle("has-attention", state.attention.length > 0 || state.commits.length > 0);
    elements.app.classList.toggle("is-narrow", surface.frame.includes("NARROW"));
    elements.app.classList.toggle("is-sequential", ["SEQUENTIAL", "PARTITIONED"].includes(surface.order));
    elements.app.classList.toggle("is-fast", surface.response === "IMMEDIATE");
    elements.app.classList.toggle("is-dense", ["DENSE", "ACCUMULATED"].includes(surface.density));
    elements.app.classList.toggle("is-hierarchy", ["EMPHATIC", "EDITORIAL", "DISPROPORTIONATE"].includes(surface.typography));
    elements.app.classList.toggle("is-spare", surface.density === "SPARSE");
    elements.app.classList.toggle("is-guidance-short", Boolean(state.committed.useConsistentTerminology));
    elements.app.classList.toggle("is-guidance-hidden", surface.guidance === "CONDITIONAL" && !state.attention.includes("guidance"));
    elements.app.classList.toggle("is-reserved", surface.frame.includes("RESERVED"));
    elements.app.classList.toggle("is-stacked", surface.frame.includes("NARROW") && surface.frame !== "FIXED");
    elements.app.classList.toggle("is-guidance-first", surface.guidance === "LEADING");
    elements.app.classList.toggle("is-stateful", ["LABELED", "SEPARATED", "EXPLICIT"].includes(surface.distinction));
    elements.app.classList.toggle("has-authority-collision", authorityContrastCollision(surface, visibility));
    elements.app.classList.toggle("has-stripe-fracture", stripeFractureAvailable(surface));
    elements.app.classList.toggle("has-second-border", state.secondBorderActive);
    elements.app.classList.toggle("is-contractor", isContractor());
    elements.app.classList.toggle("is-human-accommodation-withdrawn", state.humanAccommodationWithdrawn);
    elements.app.classList.toggle("is-refused", state.offboarded);
    elements.app.dataset.visibility = visibility;
    for (const [key, value] of Object.entries(surface)) elements.app.dataset[key] = value.toLowerCase();
    for (const [key, value] of Object.entries(visualLineage)) {
      elements.app.dataset[`lineage${key[0].toUpperCase()}${key.slice(1)}`] = value.toLowerCase();
    }
    elements.app.dataset.fieldPalette = visualField.palette.toLowerCase();
    elements.app.dataset.fieldPhase = visualField.phase.toLowerCase();
    document.documentElement.dataset.authorityPalette = visualLineage.palette.toLowerCase();
    document.documentElement.dataset.fieldPalette = (state.offboarded ? visualLineage.palette : visualField.palette).toLowerCase();
    document.documentElement.dataset.fieldPhase = (state.offboarded ? "INITIAL" : visualField.phase).toLowerCase();
  }

  function authorityContrastCollision(surface, visibility) {
    return (
      authority.visualLineage?.palette === "FRACTURED" &&
      ["TRANSLATED", "FRACTURED"].includes(surface.palette) &&
      surface.guidance === "INHERITED" &&
      ["distributed", "structured"].includes(visibility) &&
      Boolean(state.committed.preservePriorInstructions) &&
      Boolean(state.committed.reconcileTerminology)
    );
  }

  function renderTitle() {
    const visibility = visibilityMode();
    const titleTreatment = String(authority.visualLineage?.title || "DISPLAY").toLowerCase();
    const singular = state.offboarded && state.closure?.reason === "traceable";
    const inheritedClassification = ["field", "compact"].includes(titleTreatment);
    const classified = singular || inheritedClassification || (!isContractor() && (state.accountables.length > 0 || visibility === "structured"));
    elements.app.dataset.titleState = singular ? "singular" : classified ? "classified" : "default";
    elements.app.dataset.titleForm = titleTreatment;
    elements.titleAccountables.textContent = singular ? "ACCOUNTABLE" : classified ? "ACCOUNTABLES" : "accountables";
    elements.titleReceived.textContent = classified ? "RECEIVED" : "received";
    elements.titleSeparator.textContent = classified ? ": " : " ";
    elements.titleStatus.textContent = state.offboarded
      ? isContractor() ? "" : "Access revoked"
      : isContractor() ? "" : state.recordLines.at(-1)?.text || "";
    elements.title.setAttribute("aria-label", `${singular ? "accountable" : "accountables"} received`);
  }

  function renderHeader() {
    elements.orientationLabel.textContent = isContractor()
      ? "Remote work active"
      : state.orientation === "REMOTE"
        ? "Remote onboarding complete"
        : "On-site orientation complete";
    elements.serviceLabel.hidden = !state.priorService;

    const visibility = visibilityMode();
    if (isContractor() || visibility === "latent") {
      elements.conditionLabel.textContent = "";
    } else if (state.conditions.sequential) {
      elements.conditionLabel.textContent = "Sequential input active";
    } else if (state.conditions.narrow) {
      elements.conditionLabel.textContent = "Narrow surface active";
    } else {
      elements.conditionLabel.textContent = "";
    }
  }

  function renderAttention() {
    elements.attentionOptions.replaceChildren();
    const available = availableAttentionIds();
    const emphasis = authorityEmphasisId();
    for (const [id, label] of Object.entries(ATTENTION)) {
      if (!available.includes(id)) continue;
      const button = document.createElement("button");
      button.type = "button";
      button.className = "attention-button";
      button.dataset.attention = id;
      button.textContent = label;
      button.setAttribute("aria-pressed", String(state.attention.includes(id)));
      if (id === emphasis) button.dataset.retained = "true";
      button.disabled = id === emphasis;
      elements.attentionOptions.append(button);
    }
  }

  function renderSurface() {
    const visible = state.attention.length > 0 || state.commits.length > 0;
    elements.workingSurface.hidden = !visible;
    if (!visible) return;

    renderRegions();
    renderTest();
    renderResponse();
    renderRevision();
    renderAssignments();
    renderRecord();
    renderCodeField();

    const proposed = collectProposedChanges();
    elements.buildState.textContent = proposed.length
      ? "Uncommitted work present"
      : "Current deployment retained";
    elements.commitButton.disabled = proposed.length === 0;
    elements.surfaceState.textContent = proposed.length ? "Current build" : "Current deployment";
    elements.surfaceTitle.textContent = surfaceHeading();

    elements.guidanceCopy.textContent = decisionActive("preservePriorInstructions")
      ? "Changes remain provisional until committed. Prior wording remains available."
      : "Changes remain provisional until they are committed.";
    elements.stateCopy.textContent = decisionActive("separateCurrentProposed")
      ? "Current build and deployed state remain separately addressable."
      : "One operative state is available.";
    elements.performanceCopy.textContent = decisionActive("deferSecondaryContent")
      ? "Primary change appears before secondary context."
      : "Changes are applied after confirmation.";
  }

  function renderCodeField() {
    const visible = state.codexFieldOffered && !state.codexFieldConsumed && !state.offboarded;
    elements.codeField.hidden = !visible;
    if (!visible) return;
    if (elements.codeInput.value !== codexFieldValue) elements.codeInput.value = codexFieldValue;
  }

  function surfaceHeading() {
    const surface = resolveSurface();
    if (surface.representation === "EXHAUSTIVE") return "Every known condition is represented.";
    if (surface.coherence === "FRAGMENTED") return "The current build retains incompatible foundations.";
    if (surface.audience === "SPLIT") return "The same build serves incompatible contributors.";
    if (surface.order === "PARTITIONED") return "The same work now preserves more than one order.";
    if (surface.order === "SEQUENTIAL") return "The same actions are now deployed in order.";
    if (surface.frame.includes("NARROW")) return "The same build now occupies less space.";
    if (state.conditions.continuity) return "The current deployment retains prior decisions.";
    return "Make one decision visible.";
  }

  function renderRegions() {
    const visibleDomains = new Set(state.attention);
    for (const id of Object.keys(state.draft)) visibleDomains.add(DECISIONS[id].domain);
    if (state.conditions.sequential) visibleDomains.add("sequence");
    if (state.conditions.continuity) visibleDomains.add("continuity");

    for (const domain of Object.keys(DOMAIN_DECISIONS)) {
      const region = document.querySelector(`[data-domain="${domain}"]`);
      const list = document.querySelector(`[data-decisions="${domain}"]`);
      region.hidden = !visibleDomains.has(domain);
      list.replaceChildren();
      if (region.hidden) continue;

      const currentDecisions = DOMAIN_DECISIONS[domain].filter((id) =>
        !decisionHasHistory(id) || Object.prototype.hasOwnProperty.call(state.draft, id),
      );

      for (const id of currentDecisions) {
        const definition = DECISIONS[id];
        const active = decisionActive(id);
        const committed = Boolean(state.committed[id]);
        const proposed = Object.prototype.hasOwnProperty.call(state.draft, id);
        const button = document.createElement("button");
        button.type = "button";
        button.className = "inline-decision";
        button.dataset.decision = id;
        button.setAttribute("aria-pressed", String(active));
        if (proposed && committed && !active) button.classList.add("is-reversal");

        const label = document.createElement("span");
        label.textContent = decisionLabel(id);
        button.append(label);

        if (resolveSurface({ includeDraft: false }).representation === "EXHAUSTIVE") {
          const effect = document.createElement("span");
          effect.className = "decision-effect";
          effect.textContent = definition.effect;
          button.append(effect);
        }

        if (proposed || committed) {
          const status = document.createElement("span");
          status.className = "decision-state";
          status.textContent = proposed
            ? active ? "uncommitted" : "uncommitted removal"
            : "deployed";
          button.append(status);
        }
        list.append(button);
      }

      if (!currentDecisions.length) {
        const retained = document.createElement("p");
        retained.className = "current-retained";
        retained.textContent = "Current arrangement retained";
        list.append(retained);
      }

      renderResponseSlot(domain);
      renderTestSlot(domain);
    }
  }

  function decisionLabel(id) {
    const surface = resolveSurface({ includeDraft: false });
    if (surface.representation !== "SYMBOLIC") return DECISIONS[id].label;
    const symbolic = {
      strengthenHierarchy: "Priority / H",
      shareStateLabels: "State = state",
      reduceCompetingElements: "Reduce / —",
      reserveChangeSpace: "Reserve / □",
      keepGuidanceBesideAction: "Context / local",
      revealGuidanceWhenNeeded: "Context / ?",
      useConsistentTerminology: "Term / 1",
      preservePriorInstructions: "Term / prior",
      retainLastValidState: "State / last",
      separateCurrentProposed: "State / split",
      restoreUnavailableActions: "Action / restore",
      preserveLocalOrder: "Order / local",
      reduceTransition: "Response / now",
      deferSecondaryContent: "Context / later",
      combineRepeatedStatus: "Status / 1",
      preserveCurrentPosition: "Position / hold",
      includeStateLabels: "State / label",
      keepSequentialOrder: "Order / received",
      mergeRepeatedActions: "Action / merge",
      preserveVisibleContext: "Context / visible",
      moveGuidanceBeforeAction: "Guidance / before",
      preserveReviewedState: "Response / retain",
      reconcileTerminology: "Terms / reconcile",
      relocateGuidance: "Guidance / relocate",
      restoreDistinction: "State / distinguish",
      retainCurrentOrder: "Order / retain",
    };
    return symbolic[id] || DECISIONS[id].label;
  }

  function renderTestSlot(domain) {
    const slot = document.querySelector(`[data-test-domain="${domain}"]`);
    slot.replaceChildren();
    const id = state.latestTests[domain];
    if (!id) return;
    const test = state.tests.find((item) => item.id === id);
    if (!test) return;
    const result = document.createElement("p");
    result.className = "test-result";
    if (!test.resolved) result.classList.add("is-open-issue");
    result.textContent = `TEST RESULT${test.stale ? ` / ${test.target}` : ""}: ${test.finding}`;
    slot.append(result);
  }

  function renderTest() {
    const available = hasProposal() || state.commits.length > 0;
    elements.surfaceTest.hidden = !available;
    if (!available) return;
    elements.testButton.textContent = "Test current build";
    elements.testState.textContent = hasProposal()
      ? "uncommitted work"
      : `deployment ${String(state.commits.length).padStart(2, "0")}`;
  }

  function renderResponseSlot(domain) {
    const slot = document.querySelector(`[data-response-domain="${domain}"]`);
    slot.replaceChildren();
    const id = state.latestResponses[domain];
    if (!id) return;
    const response = state.responses.find((item) => item.id === id);
    if (!response || response.status !== "delivered") return;

    const slip = document.createElement("p");
    slip.className = "response-slip";
    slip.textContent = response.autoResponse
      ? "AUTO-RESPONSE"
      : `RESPONSE${response.stale ? ` / ${response.target}` : ""}: ${response.finding}`;
    slot.append(slip);
  }

  function renderResponse() {
    const available = hasProposal() || state.commits.length > 0;
    elements.surfaceResponse.hidden = !available;
    if (!available) return;
    elements.responseButton.disabled = state.responseAccessWithdrawn;
    elements.responseButton.textContent = state.responseAccessWithdrawn ? "Response retained" : "Request response";
    elements.responseState.textContent = hasProposal()
      ? `Current build ${String(state.actionSerial + 1).padStart(2, "0")}`
      : `Deployment ${String(state.commits.length).padStart(2, "0")}`;
  }

  function renderRevision() {
    const available = state.commits.some((commit) =>
      commit.changes.some((change) => change.kind === "decision"),
    );
    elements.surfaceRevision.hidden = !available;
    elements.revisionRegion.hidden = !available || !state.revisionOpen;
    elements.secondBorderNote.hidden = !state.secondBorderActive || !state.revisionOpen;
    if (!available) return;

    const mode = visibilityMode();
    elements.revisionButton.disabled = state.revisionOpen;
    elements.revisionButton.textContent = state.revisionOpen
      ? "Accepted work open"
      : "Revise accepted work";
    elements.revisionState.textContent = revisionAccessLabel(mode);
    if (!state.revisionOpen) return;

    elements.revisionCopy.textContent = revisionCopy(mode);
    elements.revisionTree.replaceChildren();
    for (const branch of revisionBranches(mode)) {
      elements.revisionTree.append(renderRevisionBranch(branch));
    }
  }

  function revisionAccessLabel(mode) {
    if (mode === "structured") return "complete dependency access";
    if (mode === "distributed") return "distributed dependency access";
    if (mode === "inline") return "related dependency access";
    return "nearest dependency access";
  }

  function revisionCopy(mode) {
    if (mode === "structured") {
      return "Accepted decisions remain available with their retained dependencies. A revision appends to this structure.";
    }
    if (mode === "distributed") {
      return "Several accepted branches remain addressable. Their later dependencies remain operative.";
    }
    if (mode === "inline") {
      return "Accepted work connected to the current response remains addressable.";
    }
    return "The nearest accepted branch remains addressable. Later dependencies are not removed by revision.";
  }

  function revisionBranches(mode) {
    const commitsWithDecisions = state.commits.filter((commit) =>
      commit.changes.some((change) => change.kind === "decision"),
    );
    const limit = mode === "structured"
      ? commitsWithDecisions.length
      : mode === "distributed"
        ? 3
        : mode === "inline"
          ? 2
          : 1;
    const visibleCommits = new Set(commitsWithDecisions.slice(-limit).map((commit) => commit.number));
    const latestByDecision = new Map();

    for (const commit of state.commits) {
      for (const change of commit.changes) {
        if (change.kind !== "decision") continue;
        latestByDecision.set(change.id, { commit, change });
      }
    }

    return [...latestByDecision.entries()]
      .filter(([, branch]) => visibleCommits.has(branch.commit.number))
      .sort((a, b) => b[1].commit.number - a[1].commit.number)
      .map(([id, branch]) => ({ id, ...branch }));
  }

  function renderRevisionBranch(branch) {
    const { id, commit } = branch;
    const definition = DECISIONS[id];
    const active = decisionActive(id);
    const proposed = Object.prototype.hasOwnProperty.call(state.draft, id);
    const container = document.createElement("div");
    container.className = "revision-branch";

    const button = document.createElement("button");
    button.type = "button";
    button.className = "revision-decision";
    button.dataset.decision = id;
    button.setAttribute("aria-pressed", String(active));
    if (proposed) button.classList.add("is-proposed");
    button.textContent = definition.label;

    const dependencies = document.createElement("ul");
    dependencies.className = "revision-dependencies";
    appendRevisionDependency(dependencies, `${active ? "OPERATIVE" : "SUPERSEDED"} / COMMIT ${String(commit.number).padStart(2, "0")}`);
    if (definition.assignment) appendRevisionDependency(dependencies, definition.assignment[1]);

    const laterChanges = state.commits
      .filter((later) => later.number > commit.number)
      .reduce((total, later) => total + later.changes.length, 0);
    if (laterChanges) {
      appendRevisionDependency(
        dependencies,
        `${laterChanges} LATER ${laterChanges === 1 ? "DECISION RETAINS" : "DECISIONS RETAIN"} THIS CONTEXT`,
      );
    }
    if (proposed) {
      appendRevisionDependency(
        dependencies,
        `REVISION PROPOSED / DEPENDENT HISTORY WILL REMAIN`,
        true,
      );
    }

    container.append(button, dependencies);
    return container;
  }

  function appendRevisionDependency(list, text, consequence = false) {
    const item = document.createElement("li");
    if (consequence) item.className = "revision-consequence";
    item.textContent = text;
    list.append(item);
  }

  function renderAssignments() {
    if (isContractor()) {
      elements.accountablesPanel.hidden = true;
      elements.accountablesList.replaceChildren();
      return;
    }
    const structured = visibilityMode() === "structured";
    elements.accountablesPanel.hidden = !structured || state.assignments.length === 0;
    elements.accountablesList.replaceChildren();
    if (elements.accountablesPanel.hidden) return;
    for (const assignment of state.assignments) {
      const item = document.createElement("li");
      item.textContent = assignment.label;
      elements.accountablesList.append(item);
    }
  }

  function renderRecord() {
    if (isContractor()) {
      elements.institutionalRecord.hidden = true;
      elements.institutionalRecord.replaceChildren();
      return;
    }
    const visibility = visibilityMode();
    const visible = visibility === "distributed"
      ? state.recordLines.slice(-4)
      : visibility === "structured"
        ? state.recordLines.slice(-8)
        : visibility === "inline"
          ? state.recordLines.slice(-2)
          : [];

    elements.institutionalRecord.hidden = visible.length === 0;
    elements.institutionalRecord.replaceChildren();
    const offset = state.recordLines.length - visible.length;
    visible.forEach((line, index) => {
      const item = document.createElement("li");
      item.className = "record-line";
      if (line.accountable) item.classList.add("is-accountable");
      const number = document.createElement("span");
      number.className = "record-number";
      number.textContent = String(offset + index + 1).padStart(2, "0");
      const text = document.createElement("span");
      text.textContent = line.text;
      item.append(number, text);
      elements.institutionalRecord.append(item);
    });
  }

  function renderOffboarding() {
    if (isContractor()) {
      elements.offboardingStatus.hidden = true;
      elements.offboardingTitle.textContent = "YOUR CONTRACT HAS ENDED.";
      elements.closureStatement.hidden = true;
      elements.outcomeRecord.hidden = true;
      elements.noncompete.hidden = false;
      elements.accessRevoked.hidden = true;
      elements.personalItems.hidden = false;
      elements.personalItemsCopy.hidden = true;
      elements.agentInvitation.hidden = false;
      elements.agentInvitation.textContent = "You may choose to carry this experience into an independent venture. The authority may retain relationships with selected ventures.";
      elements.reapplyBlock.hidden = false;
      elements.reapplyPrompt.textContent = state.contractorReapplyClosed
        ? "WE WILL KEEP YOU IN MIND FOR FUTURE OPENINGS."
        : "Would you like to reapply for the open position?";
      elements.reapplyButton.hidden = state.contractorReapplyClosed;
      return;
    }

    elements.offboardingStatus.hidden = false;
    elements.outcomeRecord.hidden = false;
    elements.noncompete.hidden = false;
    elements.accessRevoked.hidden = false;
    elements.personalItems.hidden = false;
    elements.personalItemsCopy.hidden = false;
    elements.agentInvitation.hidden = false;
    elements.agentInvitation.textContent = "You may choose to carry this experience into an independent venture. The authority may retain relationships with selected ventures.";
    elements.reapplyBlock.hidden = false;
    elements.reapplyPrompt.textContent = "Would you like to reapply for the open position?";
    elements.reapplyButton.hidden = false;
    const closure = state.closure || {
      title: "Participation complete.",
      statement: "The current record has been retained.",
      disposition: "PROCEDURAL",
    };
    elements.offboardingStatus.textContent = "Expectational variance";
    elements.offboardingTitle.textContent = closure.title;
    elements.closureStatement.hidden = !closure.statement;
    elements.closureStatement.textContent = closure.statement;
    elements.outcomeRecord.replaceChildren();

    const committedDecisionCount = state.commits.reduce(
      (total, commit) => total + commit.changes.length,
      0,
    );
    const fields = [
      ["Disposition", closure.disposition],
      ["Committed decisions", String(committedDecisionCount)],
      ["Visibility", visibilityMode().toUpperCase()],
      ["Access", "Revoked"],
    ];
    for (const [term, description] of fields) {
      const dt = document.createElement("dt");
      dt.textContent = term;
      const dd = document.createElement("dd");
      dd.textContent = description;
      elements.outcomeRecord.append(dt, dd);
    }
  }
})();

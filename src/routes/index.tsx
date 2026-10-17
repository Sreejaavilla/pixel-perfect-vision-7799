import { createFileRoute } from "@tanstack/react-router";
import { useState, type ComponentType } from "react";
import {
  LayoutDashboard,
  Network,
  KeyRound,
  FileSearch,
  Users,
  ShieldAlert,
  FileText,
  Lock,
  ChevronRight,
  Target,
  CheckCircle2,
  CircleDot,
  Fingerprint,
  ArrowLeft,
  XCircle,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "The Breach Files — Case 07: The Glasshouse Incident" },
      {
        name: "description",
        content: "Interactive cyber-forensics simulation at NovaCorp.",
      },
      { property: "og:title", content: "The Breach Files — Case 07" },
      {
        property: "og:description",
        content: "Investigate the Glasshouse Incident at NovaCorp.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

type Icon = ComponentType<{ className?: string }>;
type Stage = {
  id: number;
  key: string;
  title: string;
  desc: string;
  icon: Icon;
};
type View = "overview" | "report" | string;

const STAGES: Stage[] = [
  {
    id: 1,
    key: "network",
    title: "Network Investigation",
    desc: "Review network activity around the incident window.",
    icon: Network,
  },
  {
    id: 2,
    key: "access",
    title: "Access Investigation",
    desc: "Examine who held access to the restricted roadmap.",
    icon: KeyRound,
  },
  {
    id: 3,
    key: "evidence",
    title: "Evidence Analysis",
    desc: "Inspect artifacts tied to the export workflow.",
    icon: FileSearch,
  },
  {
    id: 4,
    key: "witness",
    title: "Witness Investigation",
    desc: "Weigh statements and competing explanations.",
    icon: Users,
  },
  {
    id: 5,
    key: "response",
    title: "Incident Response",
    desc: "Recommend a defensible containment response.",
    icon: ShieldAlert,
  },
];

const EVIDENCE = [
  { label: "Network events", count: 5, icon: Network },
  { label: "Access-control records", count: 12, icon: KeyRound },
  { label: "Evidence artifacts", count: 8, icon: FileSearch },
  { label: "Witness interviews", count: 4, icon: Users },
];

const NETWORK_EVENTS = [
  {
    time: "09:32:08",
    title: "Scheduled workflow starts",
    source: "ExportBridge scheduler",
    detail:
      "A scheduled ExportBridge job begins under the service identity svc-exportbridge. This record does not identify the human who originally configured or triggered the workflow.",
  },
  {
    time: "09:36:14",
    title: "Restricted resource requested",
    source: "Internal application gateway",
    detail:
      "A request associated with svc-exportbridge targets the Project Glasshouse roadmap. This establishes a resource request, not proof that the entire document was successfully retrieved.",
  },
  {
    time: "09:37:02",
    title: "Resource read recorded",
    source: "Document audit log",
    detail:
      "The document audit record reports a successful read of the restricted roadmap by svc-exportbridge.",
  },
  {
    time: "09:39:41",
    title: "Export package staged",
    source: "ExportBridge worker",
    detail:
      "The workflow records that an export package was staged. This event alone does not establish that the package was transmitted to or received by an external party.",
  },
  {
    time: "09:40:00",
    title: "Incident flagged",
    source: "Security monitoring",
    detail:
      "A security alert flags activity involving the restricted project. The alert is a lead for investigation, not independent proof of malicious intent.",
  },
];

const NETWORK_QUESTIONS = [
  {
    prompt: "What is the strongest conclusion supported by these records?",
    options: [
      "An external attacker definitely stole the roadmap.",
      "The service workflow accessed the restricted resource and staged an export package.",
      "A named employee deliberately leaked the roadmap.",
      "The package was confirmed received by an external recipient.",
    ],
    correct: 1,
    explanation:
      "The audit and workflow records support access and staging. They do not establish external receipt, a human initiator, or malicious intent.",
  },
  {
    prompt:
      "What should investigators verify before claiming data exfiltration?",
    options: [
      "Assume staging means the package left the company.",
      "Close the case because a scheduled workflow is always safe.",
      "Correlate transfer, destination, and recipient-side evidence with the export event.",
      "Identify an employee based only on the service account name.",
    ],
    correct: 2,
    explanation:
      "A staged package is not the same as a completed external transfer. Investigators need corroborating transmission and destination evidence.",
  },
];

function Dashboard() {
  const [completed, setCompleted] = useState(0);
  const [view, setView] = useState<View>("overview");

  const unlocked = (id: number) => id <= completed + 1;
  const progress = Math.round((completed / STAGES.length) * 100);
  const current = STAGES[Math.min(completed, STAGES.length - 1)]!;
  const reportUnlocked = completed === STAGES.length;

  const open = (nextView: View) => {
    const stage = STAGES.find((item) => item.key === nextView);
    if (stage && !unlocked(stage.id)) return;
    if (nextView === "report" && !reportUnlocked) return;
    setView(nextView);
  };

  const nav: {
    key: View;
    label: string;
    icon: Icon;
    locked: boolean;
  }[] = [
    {
      key: "overview",
      label: "Overview",
      icon: LayoutDashboard,
      locked: false,
    },
    ...STAGES.map((stage) => ({
      key: stage.key,
      label: stage.title,
      icon: stage.icon,
      locked: !unlocked(stage.id),
    })),
    {
      key: "report",
      label: "Final Report",
      icon: FileText,
      locked: !reportUnlocked,
    },
  ];

  const activeStage = STAGES.find((stage) => stage.key === view);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="flex w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar">
        <div className="flex h-14 items-center gap-2 border-b border-sidebar-border px-4">
          <Fingerprint className="h-5 w-5 text-primary" />
          <span className="font-mono text-sm font-bold tracking-widest">
            BREACH FILES
          </span>
        </div>

        <nav className="flex-1 space-y-0.5 p-2">
          {nav.map((item) => (
            <button
              key={item.key}
              onClick={() => open(item.key)}
              disabled={item.locked}
              className={`flex w-full items-center gap-3 rounded-sm px-3 py-2 text-left text-sm transition-colors ${
                view === item.key
                  ? "border-l-2 border-primary bg-sidebar-accent text-sidebar-accent-foreground"
                  : "border-l-2 border-transparent text-sidebar-foreground hover:bg-sidebar-accent/60"
              } disabled:cursor-not-allowed disabled:opacity-40`}
            >
              <item.icon className="h-4 w-4" />
              <span className="flex-1">{item.label}</span>
              {item.locked && <Lock className="h-3 w-3" />}
            </button>
          ))}
        </nav>

        <div className="border-t border-sidebar-border p-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Forensics Terminal v0.2
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex min-h-14 flex-wrap items-center gap-4 border-b border-border px-6 py-3">
          <div className="font-mono text-sm tracking-widest">
            THE BREACH FILES{" "}
            <span className="text-muted-foreground">/ CASE 07</span>
          </div>

          <div className="flex items-center gap-2 rounded-sm border border-primary/40 px-2 py-1 font-mono text-[11px] tracking-widest text-primary">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary glow" />
            INVESTIGATION ACTIVE
          </div>

          <div className="ml-auto flex items-center gap-3">
            <span className="font-mono text-xs text-muted-foreground">
              PROGRESS
            </span>
            <ProgressBar value={progress} className="w-40" />
            <span className="w-10 font-mono text-xs text-primary">
              {progress}%
            </span>
          </div>
        </header>

        <main className="grid-bg flex-1 overflow-auto p-6">
          {activeStage ? (
            <StageView
              stage={activeStage}
              done={activeStage.id <= completed}
              onBack={() => setView("overview")}
              onComplete={() => {
                setCompleted((value) => Math.max(value, activeStage.id));
                setView("overview");
              }}
            />
          ) : view === "report" ? (
            <Panel title="Final Report" icon={FileText}>
              <p className="text-sm text-muted-foreground">
                The final report workspace will be available after all five
                investigation stages are implemented.
              </p>
            </Panel>
          ) : (
            <Overview completed={completed} unlocked={unlocked} open={open} />
          )}
        </main>

        <footer className="flex min-h-9 flex-wrap items-center gap-4 border-t border-border bg-sidebar px-6 py-2 font-mono text-[11px] tracking-wider text-muted-foreground">
          <span>
            STATUS:{" "}
            <span className="text-primary">
              {reportUnlocked ? "READY FOR REPORT" : "OPEN"}
            </span>
          </span>
          <span>
            STAGE:{" "}
            <span className="text-foreground">
              {String(current.id).padStart(2, "0")} —{" "}
              {current.title.toUpperCase()}
            </span>
          </span>
          <span className="ml-auto">
            PROGRESS:{" "}
            <span className="text-foreground">
              {completed}/{STAGES.length}
            </span>
          </span>
        </footer>
      </div>
    </div>
  );
}

function Overview({
  completed,
  unlocked,
  open,
}: {
  completed: number;
  unlocked: (id: number) => boolean;
  open: (view: View) => void;
}) {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="border border-border bg-card p-6">
        <div className="mb-1 font-mono text-xs tracking-widest text-warning">
          CASE 07 — BRIEFING
        </div>

        <h1 className="font-mono text-3xl font-bold tracking-wide">
          THE GLASSHOUSE INCIDENT
        </h1>

        <dl className="mt-5 grid grid-cols-2 gap-px border border-border bg-border md:grid-cols-4">
          {[
            ["Case ID", "BF-007"],
            ["Organisation", "NovaCorp"],
            ["Classification", "CONFIDENTIAL"],
            ["Incident time", "09:40 UTC"],
          ].map(([label, value]) => (
            <div key={label} className="bg-card px-4 py-3">
              <dt className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                {label}
              </dt>
              <dd
                className={`mt-1 font-mono text-sm ${
                  value === "CONFIDENTIAL" ? "text-warning" : ""
                }`}
              >
                {value}
              </dd>
            </div>
          ))}
        </dl>

        <p className="mt-5 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          At 09:40 UTC, a restricted internal project roadmap at NovaCorp was
          flagged after activity involving an export workflow. Your task as a
          digital forensic investigator is to reconstruct what happened,
          separate confirmed facts from assumptions, and recommend a defensible
          response.
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2">
          <SectionLabel>Investigation Objectives</SectionLabel>

          <div className="space-y-2">
            {STAGES.map((stage) => {
              const isDone = stage.id <= completed;
              const available = unlocked(stage.id);

              return (
                <div
                  key={stage.id}
                  className={`flex items-center gap-4 border bg-card p-4 transition-colors ${
                    available && !isDone
                      ? "border-primary/50"
                      : "border-border"
                  } ${!available ? "opacity-50" : ""}`}
                >
                  <span className="font-mono text-lg text-muted-foreground">
                    {String(stage.id).padStart(2, "0")}
                  </span>

                  <stage.icon
                    className={`h-5 w-5 ${
                      available ? "text-primary" : "text-muted-foreground"
                    }`}
                  />

                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold">{stage.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {stage.desc}
                    </div>
                  </div>

                  <StatusTag
                    state={isDone ? "done" : available ? "open" : "locked"}
                  />

                  <button
                    onClick={() => open(stage.key)}
                    disabled={!available}
                    className="flex items-center gap-1 border border-border px-3 py-1.5 font-mono text-xs tracking-wider transition-colors hover:border-primary hover:text-primary disabled:pointer-events-none"
                  >
                    {available ? "OPEN" : <Lock className="h-3 w-3" />}
                    {available && <ChevronRight className="h-3 w-3" />}
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        <div className="space-y-6">
          <Panel title="Mission" icon={Target}>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Reconstruct the incident timeline, determine whether restricted
              data was accessed or delivered externally, evaluate competing
              explanations, and recommend a defensible response.
            </p>
          </Panel>

          <div>
            <SectionLabel>
              Evidence Summary{" "}
              <span className="text-warning">· simulated</span>
            </SectionLabel>

            <div className="grid grid-cols-2 gap-2">
              {EVIDENCE.map((item) => (
                <div
                  key={item.label}
                  className="border border-border bg-card p-3"
                >
                  <item.icon className="h-4 w-4 text-muted-foreground" />
                  <div className="mt-2 font-mono text-2xl text-primary">
                    {item.count}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {item.label}
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-2 font-mono text-[10px] text-muted-foreground">
              Counts are simulated case data.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StageView({
  stage,
  done,
  onBack,
  onComplete,
}: {
  stage: Stage;
  done: boolean;
  onBack: () => void;
  onComplete: () => void;
}) {
  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <button
        onClick={onBack}
        className="flex items-center gap-1 font-mono text-xs text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="h-3 w-3" /> BACK TO OVERVIEW
      </button>

      {stage.id === 1 ? (
        <NetworkInvestigation done={done} onComplete={onComplete} />
      ) : (
        <Panel
          title={`Stage ${String(stage.id).padStart(2, "0")} — ${stage.title}`}
          icon={stage.icon}
        >
          <p className="text-sm text-muted-foreground">{stage.desc}</p>
          <p className="mt-3 text-sm text-muted-foreground">
            This investigation workspace is under development.
          </p>
        </Panel>
      )}
    </div>
  );
}

function NetworkInvestigation({
  done,
  onComplete,
}: {
  done: boolean;
  onComplete: () => void;
}) {
  const [selectedEvent, setSelectedEvent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [checked, setChecked] = useState(false);

  // Grade only the option the participant actually selected.
  // Option indexes are zero-based: Question 1 = B (1), Question 2 = C (2).
  const correctCount = NETWORK_QUESTIONS.reduce((score, question, index) => {
    const selectedOption = answers[index];
    return score + (selectedOption === question.correct ? 1 : 0);
  }, 0);

  const allAnswered = NETWORK_QUESTIONS.every(
    (_, index) => answers[index] !== undefined,
  );

  const passed = allAnswered && correctCount === NETWORK_QUESTIONS.length;

  return (
    <div className="space-y-5">
      <Panel title="Stage 01 — Network Investigation" icon={Network}>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Reconstruct the activity surrounding the Glasshouse incident. Select
          each event to inspect its record, then answer both questions using
          only what the evidence supports.
        </p>

        <div className="mt-4 flex flex-wrap gap-2 font-mono text-[10px] tracking-widest">
          <span className="border border-primary/40 px-2 py-1 text-primary">
            CASE BF-007
          </span>
          <span className="border border-border px-2 py-1 text-muted-foreground">
            SIMULATED EVIDENCE
          </span>
        </div>
      </Panel>

      <Panel title="Event Timeline" icon={Network}>
        <div className="space-y-2">
          {NETWORK_EVENTS.map((event, index) => (
            <button
              key={event.time}
              onClick={() => setSelectedEvent(index)}
              className={`flex w-full items-start gap-3 border p-3 text-left transition-colors ${
                selectedEvent === index
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <span className="min-w-[76px] font-mono text-xs text-primary">
                {event.time}
              </span>

              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold">
                  {event.title}
                </span>
                <span className="mt-1 block text-xs text-muted-foreground">
                  {event.source}
                </span>
              </span>

              <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
            </button>
          ))}
        </div>

        <div className="mt-4 border border-primary/30 bg-background p-4">
          <div className="font-mono text-[10px] tracking-widest text-primary">
            SELECTED RECORD — {NETWORK_EVENTS[selectedEvent].time} UTC
          </div>

          <h3 className="mt-2 text-sm font-semibold">
            {NETWORK_EVENTS[selectedEvent].title}
          </h3>

          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            {NETWORK_EVENTS[selectedEvent].detail}
          </p>

          <div className="mt-3 font-mono text-[10px] text-muted-foreground">
            SOURCE: {NETWORK_EVENTS[selectedEvent].source}
          </div>
        </div>
      </Panel>

      <Panel title="Investigator Assessment" icon={Target}>
        <p className="mb-4 text-xs text-muted-foreground">
          Select one answer per question. Both must be correct to complete this
          stage.
        </p>

        <div className="space-y-6">
          {NETWORK_QUESTIONS.map((question, questionIndex) => (
            <section key={question.prompt}>
              <div className="font-mono text-[10px] tracking-widest text-primary">
                QUESTION 0{questionIndex + 1}
              </div>

              <h3 className="mt-2 text-sm font-semibold">
                {question.prompt}
              </h3>

              <div className="mt-3 space-y-2">
                {question.options.map((option, optionIndex) => {
                  const isSelected = answers[questionIndex] === optionIndex;
                  const isCorrectOption = question.correct === optionIndex;
                  const selectedCorrect =
                    checked && isSelected && isCorrectOption;
                  const selectedWrong =
                    checked && isSelected && !isCorrectOption;

                  return (
                    <button
                      key={option}
                      onClick={() => {
                        if (done) return;

                        setAnswers((previous) => ({
                          ...previous,
                          [questionIndex]: optionIndex,
                        }));
                        setChecked(false);
                      }}
                      disabled={done}
                      className={`flex w-full items-start gap-3 border p-3 text-left text-xs leading-relaxed transition-colors ${
                        selectedCorrect
                          ? "border-primary bg-primary/10"
                          : selectedWrong
                            ? "border-destructive bg-destructive/10"
                            : isSelected
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                      } disabled:cursor-default`}
                    >
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center border border-border font-mono text-[10px]">
                        {String.fromCharCode(65 + optionIndex)}
                      </span>

                      <span className="flex-1">{option}</span>

                      {selectedCorrect && (
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                      )}

                      {selectedWrong && (
                        <span className="flex shrink-0 items-center gap-1 font-mono text-[10px] text-destructive">
                          <XCircle className="h-4 w-4" />
                          INCORRECT
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {checked && (
                <p className="mt-2 border-l-2 border-primary pl-3 text-xs leading-relaxed text-muted-foreground">
                  {question.explanation}
                </p>
              )}
            </section>
          ))}
        </div>

        {checked && (
          <div className="mt-5 border border-border p-3">
            <div className="font-mono text-sm text-primary">
              SCORE: {correctCount * 50}/100
            </div>

            <p className="mt-1 text-xs text-muted-foreground">
              {passed
                ? "Assessment passed. You may record completion."
                : `Assessment not passed. ${correctCount} of ${NETWORK_QUESTIONS.length} answers correct. Review your selected answers and try again.`}
            </p>
          </div>
        )}

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            onClick={() => setChecked(true)}
            disabled={!allAnswered || done}
            className="border border-primary px-4 py-2 font-mono text-xs font-bold tracking-wider text-primary hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            CHECK ANSWERS
          </button>

          {checked && !passed && !done && (
            <button
              onClick={() => setChecked(false)}
              className="border border-border px-4 py-2 font-mono text-xs tracking-wider hover:border-primary"
            >
              REVIEW & RETRY
            </button>
          )}

          {done ? (
            <span className="flex items-center gap-2 px-3 py-2 font-mono text-xs text-primary">
              <CheckCircle2 className="h-4 w-4" />
              STAGE COMPLETE
            </span>
          ) : checked && passed ? (
            <button
              onClick={onComplete}
              className="bg-primary px-4 py-2 font-mono text-xs font-bold tracking-wider text-primary-foreground"
            >
              COMPLETE STAGE 01
            </button>
          ) : null}
        </div>
      </Panel>
    </div>
  );
}

function Panel({
  title,
  icon: IconComponent,
  children,
}: {
  title: string;
  icon?: Icon;
  children: React.ReactNode;
}) {
  return (
    <section className="border border-border bg-card p-5">
      <div className="mb-3 flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-foreground">
        {IconComponent && (
          <IconComponent className="h-4 w-4 text-primary" />
        )}
        {title}
      </div>
      {children}
    </section>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-3 font-mono text-xs uppercase tracking-widest text-muted-foreground">
      {children}
    </div>
  );
}

function StatusTag({ state }: { state: "done" | "open" | "locked" }) {
  const status = {
    done: {
      label: "COMPLETE",
      className: "text-primary border-primary/40",
      icon: CheckCircle2,
    },
    open: {
      label: "AVAILABLE",
      className: "text-warning border-warning/40",
      icon: CircleDot,
    },
    locked: {
      label: "LOCKED",
      className: "text-muted-foreground border-border",
      icon: Lock,
    },
  }[state];

  const IconComponent = status.icon;

  return (
    <span
      className={`hidden items-center gap-1 border px-2 py-0.5 font-mono text-[10px] tracking-widest sm:flex ${status.className}`}
    >
      <IconComponent className="h-3 w-3" /> {status.label}
    </span>
  );
}

function ProgressBar({
  value,
  className = "",
}: {
  value: number;
  className?: string;
}) {
  return (
    <div className={`h-1.5 overflow-hidden bg-muted ${className}`}>
      <div
        className="h-full bg-primary glow transition-all"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

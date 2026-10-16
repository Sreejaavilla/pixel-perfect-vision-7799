import { createFileRoute } from "@tanstack/react-router";
import { useState, type ComponentType } from "react";
import {
  LayoutDashboard, Network, KeyRound, FileSearch, Users, ShieldAlert, FileText,
  Lock, ChevronRight, Target, CheckCircle2, CircleDot, Fingerprint, ArrowLeft,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "The Breach Files — Case 07: The Glasshouse Incident" },
      { name: "description", content: "Interactive cyber-forensics simulation: investigate the Glasshouse Incident at NovaCorp." },
      { property: "og:title", content: "The Breach Files — Case 07" },
      { property: "og:description", content: "Investigate the Glasshouse Incident at NovaCorp." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

type Icon = ComponentType<{ className?: string }>;
type Stage = { id: number; key: string; title: string; desc: string; icon: Icon };

const STAGES: Stage[] = [
  { id: 1, key: "network", title: "Network Investigation", desc: "Review network activity around the incident window.", icon: Network },
  { id: 2, key: "access", title: "Access Investigation", desc: "Examine who held access to the restricted roadmap.", icon: KeyRound },
  { id: 3, key: "evidence", title: "Evidence Analysis", desc: "Inspect artifacts tied to the export workflow.", icon: FileSearch },
  { id: 4, key: "witness", title: "Witness Investigation", desc: "Weigh statements and competing explanations.", icon: Users },
  { id: 5, key: "response", title: "Incident Response", desc: "Recommend a defensible containment response.", icon: ShieldAlert },
];

const EVIDENCE = [
  { label: "Network events", count: 24, icon: Network },
  { label: "Access-control records", count: 12, icon: KeyRound },
  { label: "Evidence artifacts", count: 8, icon: FileSearch },
  { label: "Witness interviews", count: 4, icon: Users },
];

type View = "overview" | "report" | string;

function Dashboard() {
  const [completed, setCompleted] = useState(0); // number of stages completed
  const [view, setView] = useState<View>("overview");
  const unlocked = (id: number) => id <= completed + 1;
  const progress = Math.round((completed / STAGES.length) * 100);
  const current = STAGES[Math.min(completed, STAGES.length - 1)];
  const reportUnlocked = completed === STAGES.length;

  const open = (v: View) => {
    const s = STAGES.find((x) => x.key === v);
    if (s && !unlocked(s.id)) return;
    if (v === "report" && !reportUnlocked) return;
    setView(v);
  };

  const nav: { key: View; label: string; icon: Icon; locked: boolean }[] = [
    { key: "overview", label: "Overview", icon: LayoutDashboard, locked: false },
    ...STAGES.map((s) => ({ key: s.key, label: s.title, icon: s.icon, locked: !unlocked(s.id) })),
    { key: "report", label: "Final Report", icon: FileText, locked: !reportUnlocked },
  ];

  const activeStage = STAGES.find((s) => s.key === view);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="flex w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar">
        <div className="flex h-14 items-center gap-2 border-b border-sidebar-border px-4">
          <Fingerprint className="h-5 w-5 text-primary" />
          <span className="font-mono text-sm font-bold tracking-widest">BREACH FILES</span>
        </div>
        <nav className="flex-1 space-y-0.5 p-2">
          {nav.map((n) => (
            <button
              key={n.key}
              onClick={() => open(n.key)}
              disabled={n.locked}
              className={`flex w-full items-center gap-3 rounded-sm px-3 py-2 text-left text-sm transition-colors ${
                view === n.key
                  ? "border-l-2 border-primary bg-sidebar-accent text-sidebar-accent-foreground"
                  : "border-l-2 border-transparent text-sidebar-foreground hover:bg-sidebar-accent/60"
              } disabled:cursor-not-allowed disabled:opacity-40`}
            >
              <n.icon className="h-4 w-4" />
              <span className="flex-1">{n.label}</span>
              {n.locked && <Lock className="h-3 w-3" />}
            </button>
          ))}
        </nav>
        <div className="border-t border-sidebar-border p-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Forensics Terminal v0.1
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center gap-6 border-b border-border px-6">
          <div className="font-mono text-sm tracking-widest">
            THE BREACH FILES <span className="text-muted-foreground">/ CASE 07</span>
          </div>
          <div className="flex items-center gap-2 rounded-sm border border-primary/40 px-2 py-1 font-mono text-[11px] tracking-widest text-primary">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary glow" />
            INVESTIGATION ACTIVE
          </div>
          <div className="ml-auto flex items-center gap-3">
            <span className="font-mono text-xs text-muted-foreground">PROGRESS</span>
            <ProgressBar value={progress} className="w-40" />
            <span className="w-10 font-mono text-xs text-primary">{progress}%</span>
          </div>
        </header>

        <main className="grid-bg flex-1 overflow-auto p-6">
          {activeStage ? (
            <StageView
              stage={activeStage}
              done={activeStage.id <= completed}
              onBack={() => setView("overview")}
              onComplete={() => { setCompleted((c) => Math.max(c, activeStage.id)); setView("overview"); }}
            />
          ) : view === "report" ? (
            <Panel title="Final Report">
              <p className="text-sm text-muted-foreground">Report drafting will be available in a later build.</p>
            </Panel>
          ) : (
            <Overview completed={completed} unlocked={unlocked} open={open} />
          )}
        </main>

        <footer className="flex h-9 items-center gap-6 border-t border-border bg-sidebar px-6 font-mono text-[11px] tracking-wider text-muted-foreground">
          <span>STATUS: <span className="text-primary">{reportUnlocked ? "READY FOR REPORT" : "OPEN"}</span></span>
          <span>STAGE: <span className="text-foreground">{String(current.id).padStart(2, "0")} — {current.title.toUpperCase()}</span></span>
          <span className="ml-auto">PROGRESS: <span className="text-foreground">{completed}/{STAGES.length}</span></span>
        </footer>
      </div>
    </div>
  );
}

function Overview({ completed, unlocked, open }: { completed: number; unlocked: (id: number) => boolean; open: (v: View) => void }) {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="border border-border bg-card p-6">
        <div className="mb-1 font-mono text-xs tracking-widest text-warning">CASE 07 — BRIEFING</div>
        <h1 className="font-mono text-3xl font-bold tracking-wide">THE GLASSHOUSE INCIDENT</h1>
        <dl className="mt-5 grid grid-cols-2 gap-px border border-border bg-border md:grid-cols-4">
          {[
            ["Case ID", "BF-007"], ["Organisation", "NovaCorp"],
            ["Classification", "CONFIDENTIAL"], ["Incident time", "09:40 UTC"],
          ].map(([k, v]) => (
            <div key={k} className="bg-card px-4 py-3">
              <dt className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{k}</dt>
              <dd className={`mt-1 font-mono text-sm ${v === "CONFIDENTIAL" ? "text-warning" : ""}`}>{v}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-5 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          At 09:40 UTC, a restricted internal project roadmap at NovaCorp was accessed through an export
          workflow. The circumstances are unclear. Your task as a digital forensic investigator is to
          determine what happened.
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2">
          <SectionLabel>Investigation Objectives</SectionLabel>
          <div className="space-y-2">
            {STAGES.map((s) => {
              const done = s.id <= completed;
              const avail = unlocked(s.id);
              return (
                <div key={s.id} className={`flex items-center gap-4 border bg-card p-4 transition-colors ${avail && !done ? "border-primary/50" : "border-border"} ${!avail ? "opacity-50" : ""}`}>
                  <span className="font-mono text-lg text-muted-foreground">{String(s.id).padStart(2, "0")}</span>
                  <s.icon className={`h-5 w-5 ${avail ? "text-primary" : "text-muted-foreground"}`} />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold">{s.title}</div>
                    <div className="text-xs text-muted-foreground">{s.desc}</div>
                  </div>
                  <StatusTag state={done ? "done" : avail ? "open" : "locked"} />
                  <button
                    onClick={() => open(s.key)}
                    disabled={!avail}
                    className="flex items-center gap-1 border border-border px-3 py-1.5 font-mono text-xs tracking-wider transition-colors hover:border-primary hover:text-primary disabled:pointer-events-none"
                  >
                    {avail ? "OPEN" : <Lock className="h-3 w-3" />} {avail && <ChevronRight className="h-3 w-3" />}
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        <div className="space-y-6">
          <Panel title="Mission" icon={Target}>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Reconstruct the incident timeline, determine whether restricted data was accessed or delivered
              externally, evaluate competing explanations, and recommend a defensible response.
            </p>
          </Panel>
          <div>
            <SectionLabel>Evidence Summary <span className="text-warning">· illustrative</span></SectionLabel>
            <div className="grid grid-cols-2 gap-2">
              {EVIDENCE.map((e) => (
                <div key={e.label} className="border border-border bg-card p-3">
                  <e.icon className="h-4 w-4 text-muted-foreground" />
                  <div className="mt-2 font-mono text-2xl text-primary">{e.count}</div>
                  <div className="text-[11px] text-muted-foreground">{e.label}</div>
                </div>
              ))}
            </div>
            <p className="mt-2 font-mono text-[10px] text-muted-foreground">Counts are simulated placeholders for this exercise.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StageView({ stage, done, onBack, onComplete }: { stage: Stage; done: boolean; onBack: () => void; onComplete: () => void }) {
  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <button onClick={onBack} className="flex items-center gap-1 font-mono text-xs text-muted-foreground hover:text-primary">
        <ArrowLeft className="h-3 w-3" /> BACK TO OVERVIEW
      </button>
      <Panel title={`Stage ${String(stage.id).padStart(2, "0")} — ${stage.title}`} icon={stage.icon}>
        <p className="text-sm text-muted-foreground">{stage.desc}</p>
        <p className="mt-3 text-sm text-muted-foreground">Stage workspace is under construction in this prototype.</p>
        <button
          onClick={onComplete}
          disabled={done}
          className="mt-5 bg-primary px-4 py-2 font-mono text-xs font-bold tracking-wider text-primary-foreground glow disabled:opacity-40"
        >
          {done ? "STAGE COMPLETE" : "MARK STAGE COMPLETE"}
        </button>
      </Panel>
    </div>
  );
}

function Panel({ title, icon: I, children }: { title: string; icon?: Icon; children: React.ReactNode }) {
  return (
    <section className="border border-border bg-card p-5">
      <div className="mb-3 flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-foreground">
        {I && <I className="h-4 w-4 text-primary" />} {title}
      </div>
      {children}
    </section>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className="mb-3 font-mono text-xs uppercase tracking-widest text-muted-foreground">{children}</div>;
}

function StatusTag({ state }: { state: "done" | "open" | "locked" }) {
  const map = {
    done: { t: "COMPLETE", c: "text-primary border-primary/40", i: CheckCircle2 },
    open: { t: "AVAILABLE", c: "text-warning border-warning/40", i: CircleDot },
    locked: { t: "LOCKED", c: "text-muted-foreground border-border", i: Lock },
  }[state];
  return (
    <span className={`hidden items-center gap-1 border px-2 py-0.5 font-mono text-[10px] tracking-widest sm:flex ${map.c}`}>
      <map.i className="h-3 w-3" /> {map.t}
    </span>
  );
}

function ProgressBar({ value, className = "" }: { value: number; className?: string }) {
  return (
    <div className={`h-1.5 overflow-hidden bg-muted ${className}`}>
      <div className="h-full bg-primary glow transition-all" style={{ width: `${value}%` }} />
    </div>
  );
}

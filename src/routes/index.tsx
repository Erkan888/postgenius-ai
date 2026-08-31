import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  Copy,
  Crown,
  KeyRound,
  Linkedin,
  Loader2,
  LogOut,
  Sparkles,
  Trash2,
  Twitter,
  Wand2,
  Zap,
} from "lucide-react";

import { PostGeniusLogo } from "@/components/PostGeniusLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import {
  FREE_LIMIT,
  PRO_PRICE_USD,
  createCheckoutSession,
  deleteGeneration,
  generatePost,
  getWorkspace,
  type WorkspaceState,
} from "@/lib/postgenius.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PostGenius — Turn notes into viral LinkedIn posts & X threads" },
      {
        name: "description",
        content:
          "PostGenius uses Gemini AI to transform rough notes into high-converting LinkedIn posts and X threads in seconds. Free plan available, Pro at $29/month.",
      },
      { property: "og:title", content: "PostGenius — Ideas into viral posts in seconds" },
      {
        property: "og:description",
        content:
          "Paste your notes, pick a tone and platform, and get a publish-ready post or thread instantly.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

type Tone = "professional" | "casual" | "witty";
type Platform = "linkedin" | "twitter";

const TONES: Array<{ id: Tone; label: string; hint: string }> = [
  { id: "professional", label: "Professional", hint: "Authoritative, clean, board-ready" },
  { id: "casual", label: "Casual", hint: "Warm, human, conversational" },
  { id: "witty", label: "Witty", hint: "Sharp, playful, quotable" },
];

function Home() {
  const { user, loading, signOut } = useAuth();

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <BackgroundGlow />
      <Nav user={user} loading={loading} onSignOut={signOut} />
      <main>
        <Hero signedIn={Boolean(user)} />
        <Features />
        <section id="workspace" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-20">
          <SectionHeading
            eyebrow="Workspace"
            title="Your generation studio"
            subtitle="Paste raw notes, choose a tone and a platform, and ship a post that earns attention."
          />
          {loading ? (
            <div className="mt-10 flex justify-center">
              <Loader2 className="size-6 animate-spin text-primary" />
            </div>
          ) : user ? (
            <Workspace />
          ) : (
            <SignedOutWorkspace />
          )}
        </section>
        <Pricing signedIn={Boolean(user)} />
      </main>
      <Footer />
    </div>
  );
}

function BackgroundGlow() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10">
      <div className="absolute -top-48 left-1/2 size-[44rem] -translate-x-1/2 rounded-full bg-primary/25 blur-[160px]" />
      <div className="absolute bottom-0 right-0 size-[28rem] rounded-full bg-accent/10 blur-[140px]" />
    </div>
  );
}

function Nav({
  user,
  loading,
  onSignOut,
}: {
  user: { email?: string | null } | null;
  loading: boolean;
  onSignOut: () => void;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5">
        <PostGeniusLogo />
        <nav className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
          <a href="#features" className="transition-colors hover:text-foreground">
            Features
          </a>
          <a href="#workspace" className="transition-colors hover:text-foreground">
            Workspace
          </a>
          <a href="#pricing" className="transition-colors hover:text-foreground">
            Pricing
          </a>
        </nav>
        <div className="flex items-center gap-2">
          {loading ? null : user ? (
            <>
              <span className="hidden max-w-[12rem] truncate text-sm text-muted-foreground sm:block">
                {user.email}
              </span>
              <Button variant="ghost" size="sm" onClick={onSignOut}>
                <LogOut className="size-4" /> Sign out
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/auth">Sign in</Link>
              </Button>
              <Button size="sm" className="bg-gradient-violet" asChild>
                <Link to="/auth">Get started free</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

function Hero({ signedIn }: { signedIn: boolean }) {
  return (
    <section className="mx-auto max-w-5xl px-4 pb-10 pt-20 text-center sm:pt-28">
      <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1.5 text-xs font-medium text-foreground">
        <Sparkles className="size-3.5 text-primary" />
        Powered by Google Gemini
      </span>
      <h1 className="mt-7 text-4xl font-semibold leading-[1.08] sm:text-6xl">
        Transform Your Ideas Into{" "}
        <span className="text-gradient-violet">Viral Posts in Seconds</span>
      </h1>
      <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg">
        Drop in messy notes. PostGenius rewrites them into scroll-stopping LinkedIn posts and X
        threads with the tone your audience actually responds to.
      </p>
      <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
        {signedIn ? (
          <Button size="lg" className="bg-gradient-violet glow-violet" asChild>
            <a href="#workspace">
              Open workspace <ArrowRight className="size-4" />
            </a>
          </Button>
        ) : (
          <Button size="lg" className="bg-gradient-violet glow-violet" asChild>
            <Link to="/auth">
              Start free — {FREE_LIMIT} posts / month <ArrowRight className="size-4" />
            </Link>
          </Button>
        )}
        <Button size="lg" variant="secondary" asChild>
          <a href="#pricing">See pricing</a>
        </Button>
      </div>
      <p className="mt-5 text-xs text-muted-foreground">
        No credit card required · Cancel anytime · Your keys stay server-side
      </p>
    </section>
  );
}

function SectionHeading({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">{title}</h2>
      <p className="mt-3 text-muted-foreground">{subtitle}</p>
    </div>
  );
}

const FEATURES = [
  {
    icon: Wand2,
    title: "Notes in, banger out",
    body: "Bullet points, voice-note dumps, half-finished thoughts — all become publish-ready copy.",
  },
  {
    icon: Zap,
    title: "Three distinct tones",
    body: "Professional, casual or witty. Same idea, tuned to the room you're speaking to.",
  },
  {
    icon: Linkedin,
    title: "Platform-native formatting",
    body: "LinkedIn hooks and line breaks, or numbered X threads that stay under the limit.",
  },
  {
    icon: KeyRound,
    title: "Secure by design",
    body: "AI calls run server-side. No API key ever touches the browser.",
  },
];

function Features() {
  return (
    <section id="features" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-16">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((f) => (
          <div
            key={f.title}
            className="rounded-2xl border border-border bg-card/60 p-6 backdrop-blur transition-colors hover:border-primary/40"
          >
            <span className="inline-flex size-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <f.icon className="size-5" />
            </span>
            <h3 className="mt-4 text-base font-semibold">{f.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function SignedOutWorkspace() {
  return (
    <div className="mt-10 rounded-3xl border border-border bg-card/60 p-10 text-center panel-shadow backdrop-blur">
      <span className="mx-auto inline-flex size-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
        <Sparkles className="size-6" />
      </span>
      <h3 className="mt-5 text-xl font-semibold">Sign in to start generating</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        Create a free account to unlock the workspace, keep your generation history, and track your
        monthly usage.
      </p>
      <Button className="mt-6 bg-gradient-violet" asChild>
        <Link to="/auth">
          Create free account <ArrowRight className="size-4" />
        </Link>
      </Button>
    </div>
  );
}

function Workspace() {
  const queryClient = useQueryClient();
  const fetchWorkspace = useServerFn(getWorkspace);
  const runGenerate = useServerFn(generatePost);
  const runDelete = useServerFn(deleteGeneration);

  const [notes, setNotes] = useState("");
  const [tone, setTone] = useState<Tone>("professional");
  const [platform, setPlatform] = useState<Platform>("linkedin");
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [limitReached, setLimitReached] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const workspace = useQuery<WorkspaceState>({
    queryKey: ["workspace"],
    queryFn: () => fetchWorkspace(),
  });

  const generate = useMutation({
    mutationFn: () => runGenerate({ data: { notes, tone, platform } }),
    onMutate: () => {
      setError(null);
      setLimitReached(false);
      setResult(null);
    },
    onSuccess: (res) => {
      if (res.status === "not_configured") {
        setConfigOpen(true);
        return;
      }
      if (res.status === "limit_reached") {
        setLimitReached(true);
        return;
      }
      setResult(res.generation.content);
      void queryClient.invalidateQueries({ queryKey: ["workspace"] });
    },
    onError: (err: unknown) =>
      setError(err instanceof Error ? err.message : "Generation failed. Please try again."),
  });

  const remove = useMutation({
    mutationFn: (id: string) => runDelete({ data: { id } }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["workspace"] }),
  });

  const state = workspace.data;
  const used = state?.generationsUsed ?? 0;
  const limit = state?.limit ?? null;

  async function copy(text: string) {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="mt-10 space-y-5">
      {workspace.isError && (
        <Banner tone="error">
          We couldn&apos;t load your workspace.{" "}
          <button className="underline" onClick={() => void workspace.refetch()}>
            Retry
          </button>
        </Banner>
      )}

      {state && !state.aiConfigured && (
        <Banner tone="warning">
          AI generation isn&apos;t configured yet.{" "}
          <button className="underline" onClick={() => setConfigOpen(true)}>
            View setup steps
          </button>
        </Banner>
      )}

      <div className="grid gap-5 lg:grid-cols-[1.1fr_1fr]">
        <div className="rounded-3xl border border-border bg-card/70 p-6 panel-shadow backdrop-blur">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold">Your notes</h3>
            <span
              className={cn(
                "rounded-full border px-3 py-1 text-xs",
                state?.plan === "pro"
                  ? "border-primary/40 bg-primary/10 text-foreground"
                  : "border-border bg-secondary text-muted-foreground",
              )}
            >
              {state?.plan === "pro"
                ? "Pro · unlimited"
                : `Free · ${used}/${limit ?? FREE_LIMIT} used`}
            </span>
          </div>

          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={8}
            maxLength={4000}
            placeholder={
              "e.g. Shipped our onboarding revamp. Time-to-first-value went 3 days -> 11 minutes. The trick was killing the setup wizard and defaulting everything."
            }
            className="mt-4 resize-none bg-background/60"
          />
          <p className="mt-2 text-right text-xs text-muted-foreground">{notes.length}/4000</p>

          <div className="mt-5">
            <Label className="text-xs uppercase tracking-widest text-muted-foreground">Tone</Label>
            <div className="mt-2 grid gap-2 sm:grid-cols-3">
              {TONES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTone(t.id)}
                  className={cn(
                    "rounded-xl border p-3 text-left transition-all",
                    tone === t.id
                      ? "border-primary bg-primary/10"
                      : "border-border bg-background/40 hover:border-primary/40",
                  )}
                >
                  <span className="block text-sm font-medium">{t.label}</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">{t.hint}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5">
            <Label className="text-xs uppercase tracking-widest text-muted-foreground">
              Platform
            </Label>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {(
                [
                  { id: "linkedin", label: "LinkedIn post", icon: Linkedin },
                  { id: "twitter", label: "X / Twitter thread", icon: Twitter },
                ] as const
              ).map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPlatform(p.id)}
                  className={cn(
                    "flex items-center gap-2 rounded-xl border p-3 text-sm font-medium transition-all",
                    platform === p.id
                      ? "border-primary bg-primary/10"
                      : "border-border bg-background/40 hover:border-primary/40",
                  )}
                >
                  <p.icon className="size-4" /> {p.label}
                </button>
              ))}
            </div>
          </div>

          <Button
            className="mt-6 w-full bg-gradient-violet glow-violet"
            size="lg"
            disabled={generate.isPending || notes.trim().length < 10}
            onClick={() => generate.mutate()}
          >
            {generate.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Writing your post…
              </>
            ) : (
              <>
                <Sparkles className="size-4" /> Generate{" "}
                {platform === "linkedin" ? "post" : "thread"}
              </>
            )}
          </Button>
          {notes.trim().length > 0 && notes.trim().length < 10 && (
            <p className="mt-2 text-xs text-muted-foreground">
              Add a little more detail — at least 10 characters.
            </p>
          )}
        </div>

        <div className="rounded-3xl border border-border bg-card/70 p-6 panel-shadow backdrop-blur">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Output</h3>
            {result && (
              <Button variant="secondary" size="sm" onClick={() => void copy(result)}>
                {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                {copied ? "Copied" : "Copy"}
              </Button>
            )}
          </div>

          <div className="mt-4">
            {generate.isPending ? (
              <div className="space-y-3">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-4 animate-pulse rounded bg-secondary"
                    style={{ width: `${90 - i * 9}%` }}
                  />
                ))}
              </div>
            ) : error ? (
              <Banner tone="error">
                {error}{" "}
                <button className="underline" onClick={() => generate.mutate()}>
                  Try again
                </button>
              </Banner>
            ) : limitReached ? (
              <Banner tone="warning">
                You&apos;ve used all {FREE_LIMIT} free generations this month. Upgrade to Pro for
                unlimited posts.{" "}
                <a className="underline" href="#pricing">
                  See Pro
                </a>
              </Banner>
            ) : result ? (
              <article className="whitespace-pre-wrap rounded-2xl border border-border bg-background/60 p-4 text-sm leading-relaxed">
                {result}
              </article>
            ) : (
              <div className="rounded-2xl border border-dashed border-border p-10 text-center">
                <Wand2 className="mx-auto size-6 text-muted-foreground" />
                <p className="mt-3 text-sm text-muted-foreground">
                  Nothing generated yet. Your finished post will appear here.
                </p>
              </div>
            )}
          </div>

          <div className="mt-8">
            <h4 className="text-sm font-semibold">Saved generations</h4>
            {workspace.isLoading ? (
              <div className="mt-3 space-y-2">
                {[0, 1].map((i) => (
                  <div key={i} className="h-12 animate-pulse rounded-xl bg-secondary" />
                ))}
              </div>
            ) : state && state.history.length > 0 ? (
              <ul className="mt-3 space-y-2">
                {state.history.map((g) => (
                  <li
                    key={g.id}
                    className="group rounded-xl border border-border bg-background/40 p-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <button
                        type="button"
                        className="flex-1 text-left"
                        onClick={() => {
                          setResult(g.content);
                          setError(null);
                          setLimitReached(false);
                        }}
                      >
                        <span className="text-xs uppercase tracking-wider text-primary">
                          {g.platform === "linkedin" ? "LinkedIn" : "X thread"} · {g.tone}
                        </span>
                        <span className="mt-1 line-clamp-2 block text-sm text-muted-foreground">
                          {g.content}
                        </span>
                      </button>
                      <button
                        type="button"
                        aria-label="Delete generation"
                        className="text-muted-foreground transition-colors hover:text-destructive"
                        onClick={() => remove.mutate(g.id)}
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">
                No saved posts yet — your generations will be stored here automatically.
              </p>
            )}
          </div>
        </div>
      </div>

      <ConfigDialog open={configOpen} onOpenChange={setConfigOpen} />
    </div>
  );
}

function Banner({ tone, children }: { tone: "error" | "warning"; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "flex items-start gap-2 rounded-xl border px-4 py-3 text-sm",
        tone === "error"
          ? "border-destructive/40 bg-destructive/10 text-foreground"
          : "border-accent/40 bg-accent/10 text-foreground",
      )}
    >
      <AlertTriangle className="mt-0.5 size-4 shrink-0" />
      <p>{children}</p>
    </div>
  );
}

function ConfigDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [key, setKey] = useState("");
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="size-4 text-primary" /> AI configuration required
          </DialogTitle>
          <DialogDescription>
            PostGenius calls Gemini from the server, so the API key is never exposed in the browser.
          </DialogDescription>
        </DialogHeader>
        <ol className="list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
          <li>
            Get a Gemini API key from Google AI Studio (or use the built-in AI credits — no key
            needed).
          </li>
          <li>
            Store it as the server secret <code className="text-foreground">GEMINI_API_KEY</code>{" "}
            through the secure secret form — never in the code.
          </li>
          <li>Reload this page and generate again.</li>
        </ol>
        <div className="space-y-2">
          <Label htmlFor="ai-key">Key preview (not stored here)</Label>
          <Input
            id="ai-key"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="AIza…"
            type="password"
          />
          <p className="text-xs text-muted-foreground">
            This field is a local reminder only. For security, keys must be saved through the secure
            secret form, not this modal.
          </p>
        </div>
        <Button className="bg-gradient-violet" onClick={() => onOpenChange(false)}>
          Got it
        </Button>
      </DialogContent>
    </Dialog>
  );
}

function Pricing({ signedIn }: { signedIn: boolean }) {
  const navigate = useNavigate();
  const startCheckout = useServerFn(createCheckoutSession);
  const [notice, setNotice] = useState<string | null>(null);

  const checkout = useMutation({
    mutationFn: () => startCheckout({ data: { origin: window.location.origin } }),
    onSuccess: (res) => {
      if (res.status === "not_configured") {
        setNotice(
          "Stripe isn't connected yet. Add the Stripe secret key through the secure secret form to activate subscription checkout.",
        );
        return;
      }
      window.location.href = res.url;
    },
    onError: () => setNotice("Checkout couldn't start. Please try again."),
  });

  return (
    <section id="pricing" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-20">
      <SectionHeading
        eyebrow="Pricing"
        title="Start free, scale when it works"
        subtitle="Every plan writes with the same engine. Pro just removes the ceiling."
      />
      <div className="mx-auto mt-10 grid max-w-4xl gap-5 md:grid-cols-2">
        <div className="rounded-3xl border border-border bg-card/60 p-8 backdrop-blur">
          <h3 className="text-lg font-semibold">Free</h3>
          <p className="mt-1 text-sm text-muted-foreground">For testing the waters.</p>
          <p className="mt-6 text-4xl font-semibold">
            $0<span className="text-base font-normal text-muted-foreground">/month</span>
          </p>
          <ul className="mt-6 space-y-3 text-sm">
            {[
              `${FREE_LIMIT} generations per month`,
              "LinkedIn posts & X threads",
              "All three tones",
              "Saved generation history",
            ].map((f) => (
              <li key={f} className="flex items-center gap-2">
                <Check className="size-4 text-primary" /> {f}
              </li>
            ))}
          </ul>
          <Button variant="secondary" className="mt-8 w-full" asChild={!signedIn}>
            {signedIn ? <span>Your current plan</span> : <Link to="/auth">Get started free</Link>}
          </Button>
        </div>

        <div className="relative rounded-3xl border border-primary/50 bg-card/80 p-8 panel-shadow backdrop-blur">
          <span className="absolute -top-3 left-8 rounded-full bg-gradient-violet px-3 py-1 text-xs font-medium text-primary-foreground">
            Most popular
          </span>
          <h3 className="flex items-center gap-2 text-lg font-semibold">
            <Crown className="size-4 text-primary" /> Pro
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">For people who post daily.</p>
          <p className="mt-6 text-4xl font-semibold">
            ${PRO_PRICE_USD}
            <span className="text-base font-normal text-muted-foreground">/month</span>
          </p>
          <ul className="mt-6 space-y-3 text-sm">
            {[
              "Unlimited generations",
              "Priority generation queue",
              "Full history & one-click copy",
              "Cancel anytime",
            ].map((f) => (
              <li key={f} className="flex items-center gap-2">
                <Check className="size-4 text-primary" /> {f}
              </li>
            ))}
          </ul>
          <Button
            className="mt-8 w-full bg-gradient-violet glow-violet"
            disabled={checkout.isPending}
            onClick={() => {
              if (!signedIn) {
                void navigate({ to: "/auth" });
                return;
              }
              setNotice(null);
              checkout.mutate();
            }}
          >
            {checkout.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Starting checkout…
              </>
            ) : (
              <>Upgrade to Pro</>
            )}
          </Button>
          {notice && (
            <p className="mt-3 text-xs text-muted-foreground">
              <AlertTriangle className="mr-1 inline size-3.5" />
              {notice}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border/60 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 sm:flex-row">
        <PostGeniusLogo />
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} PostGenius. Written by AI, approved by you.
        </p>
      </div>
    </footer>
  );
}

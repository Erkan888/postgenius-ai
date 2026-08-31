import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const FREE_LIMIT = 5;
export const PRO_PRICE_USD = 29;

type Tone = "professional" | "casual" | "witty";
type Platform = "linkedin" | "twitter";

const TONES: Tone[] = ["professional", "casual", "witty"];
const PLATFORMS: Platform[] = ["linkedin", "twitter"];

export type WorkspaceState = {
  plan: "free" | "pro";
  generationsUsed: number;
  limit: number | null;
  aiConfigured: boolean;
  displayName: string | null;
  email: string | null;
  history: Array<{
    id: string;
    notes: string;
    tone: string;
    platform: string;
    content: string;
    created_at: string;
  }>;
};

function periodExpired(start: string): boolean {
  return Date.now() - new Date(start).getTime() > 30 * 24 * 60 * 60 * 1000;
}

function aiIsConfigured(): boolean {
  return Boolean(process.env["GEMINI_API_KEY"] || process.env["LOVABLE_API_KEY"]);
}

export const getWorkspace = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<WorkspaceState> => {
    const { supabase, userId } = context;

    const { data: profile } = await supabase
      .from("profiles")
      .select("plan, generations_used, usage_period_start, display_name, email")
      .eq("id", userId)
      .maybeSingle();

    let generationsUsed = profile?.generations_used ?? 0;
    if (profile && periodExpired(profile.usage_period_start)) {
      generationsUsed = 0;
      await supabase
        .from("profiles")
        .update({ generations_used: 0, usage_period_start: new Date().toISOString() })
        .eq("id", userId);
    }

    const { data: history } = await supabase
      .from("generations")
      .select("id, notes, tone, platform, content, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20);

    const plan = (profile?.plan === "pro" ? "pro" : "free") as "free" | "pro";

    return {
      plan,
      generationsUsed,
      limit: plan === "pro" ? null : FREE_LIMIT,
      aiConfigured: aiIsConfigured(),
      displayName: profile?.display_name ?? null,
      email: profile?.email ?? null,
      history: history ?? [],
    };
  });

function buildPrompt(notes: string, tone: Tone, platform: Platform): string {
  const platformBrief =
    platform === "linkedin"
      ? "a high-converting LinkedIn post: a scroll-stopping first line, short punchy paragraphs with generous line breaks, a concrete takeaway, a closing question, and 3-5 relevant hashtags."
      : "a high-converting X/Twitter thread: 5-8 numbered tweets, each under 280 characters, tweet 1 is a strong hook, the last tweet has a clear call to action, and no hashtag spam.";

  return `You are an elite ghostwriter for founders and operators.

Rewrite the raw notes below into ${platformBrief}

Tone: ${tone}.
Rules: no preamble, no explanations, no markdown code fences. Output only the finished post text, ready to publish. Never invent statistics.

RAW NOTES:
${notes}`;
}

async function callGemini(prompt: string): Promise<string> {
  const geminiKey = process.env["GEMINI_API_KEY"];

  if (geminiKey) {
    const res = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": geminiKey },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      },
    );
    if (!res.ok) {
      const detail = await res.text();
      console.error("Gemini API error", res.status, detail);
      throw new Error(
        res.status === 429
          ? "The AI provider is rate limited right now. Please try again in a moment."
          : "The AI provider rejected the request. Check the Gemini configuration.",
      );
    }
    const json = (await res.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    const text = json.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
    if (!text.trim()) throw new Error("The AI returned an empty response. Try again.");
    return text.trim();
  }

  const gatewayKey = process.env["LOVABLE_API_KEY"];
  if (!gatewayKey) throw new Error("AI is not configured.");

  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${gatewayKey}`,
    },
    body: JSON.stringify({
      model: "google/gemini-3.5-flash",
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!res.ok) {
    const detail = await res.text();
    console.error("AI gateway error", res.status, detail);
    throw new Error(
      res.status === 429
        ? "Too many requests right now. Please try again in a moment."
        : "The AI service is unavailable. Please try again.",
    );
  }
  const json = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const text = json.choices?.[0]?.message?.content ?? "";
  if (!text.trim()) throw new Error("The AI returned an empty response. Try again.");
  return text.trim();
}

export const generatePost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { notes: string; tone: Tone; platform: Platform }) => {
    const notes = (input?.notes ?? "").trim();
    if (notes.length < 10) throw new Error("Add at least 10 characters of notes.");
    if (notes.length > 4000) throw new Error("Notes are limited to 4000 characters.");
    if (!TONES.includes(input.tone)) throw new Error("Invalid tone.");
    if (!PLATFORMS.includes(input.platform)) throw new Error("Invalid platform.");
    return { notes, tone: input.tone, platform: input.platform };
  })
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    if (!aiIsConfigured()) {
      return { status: "not_configured" as const };
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("plan, generations_used, usage_period_start")
      .eq("id", userId)
      .maybeSingle();

    const plan = profile?.plan === "pro" ? "pro" : "free";
    let used = profile?.generations_used ?? 0;
    if (profile && periodExpired(profile.usage_period_start)) used = 0;

    if (plan === "free" && used >= FREE_LIMIT) {
      return { status: "limit_reached" as const, generationsUsed: used, limit: FREE_LIMIT };
    }

    const content = await callGemini(buildPrompt(data.notes, data.tone, data.platform));

    const { data: inserted, error } = await supabase
      .from("generations")
      .insert({
        user_id: userId,
        notes: data.notes,
        tone: data.tone,
        platform: data.platform,
        content,
      })
      .select("id, notes, tone, platform, content, created_at")
      .single();
    if (error) throw new Error("Could not save your generation. Please try again.");

    const nextUsed = used + 1;
    await supabase
      .from("profiles")
      .update({
        generations_used: nextUsed,
        ...(profile && periodExpired(profile.usage_period_start)
          ? { usage_period_start: new Date().toISOString() }
          : {}),
      })
      .eq("id", userId);

    return {
      status: "ok" as const,
      generation: inserted,
      generationsUsed: nextUsed,
      limit: plan === "pro" ? null : FREE_LIMIT,
    };
  });

export const deleteGeneration = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => {
    if (!input?.id) throw new Error("Missing id.");
    return { id: input.id };
  })
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("generations")
      .delete()
      .eq("id", data.id)
      .eq("user_id", context.userId);
    if (error) throw new Error("Could not delete that post.");
    return { ok: true };
  });

export const createCheckoutSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { origin: string }) => ({ origin: String(input?.origin ?? "") }))
  .handler(async ({ data, context }) => {
    const stripeKey =
      process.env["STRIPE_LIVE_API_KEY"] ?? process.env["STRIPE_SECRET_KEY"] ?? null;

    if (!stripeKey) {
      return { status: "not_configured" as const };
    }

    const origin = /^https?:\/\//.test(data.origin) ? data.origin : "";
    const body = new URLSearchParams();
    body.set("mode", "subscription");
    body.set("success_url", `${origin}/?checkout=success`);
    body.set("cancel_url", `${origin}/?checkout=cancelled`);
    body.set("client_reference_id", context.userId);
    body.set("line_items[0][quantity]", "1");
    body.set("line_items[0][price_data][currency]", "usd");
    body.set("line_items[0][price_data][unit_amount]", String(PRO_PRICE_USD * 100));
    body.set("line_items[0][price_data][recurring][interval]", "month");
    body.set("line_items[0][price_data][product_data][name]", "PostGenius Pro");
    if (context.claims?.email) body.set("customer_email", String(context.claims.email));

    const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${stripeKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });
    if (!res.ok) {
      console.error("Stripe error", res.status, await res.text());
      throw new Error("Could not start checkout. Please try again.");
    }
    const session = (await res.json()) as { url?: string };
    if (!session.url) throw new Error("Stripe did not return a checkout URL.");
    return { status: "ok" as const, url: session.url };
  });

import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { HeadphonesIcon, CheckCircle2, Copy, Send, Ticket, Loader2, MessageSquare } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useLang } from "@/i18n/LanguageContext";
import { useProfile } from "@/lib/profile";
import { lsGet, pushHistory, KEYS } from "@/lib/storage";
import { toast } from "sonner";

export const Route = createFileRoute("/expert")({
  head: () => ({
    meta: [
      { title: "Talk to an Expert — AgriSmart AI" },
      { name: "description", content: "Submit your farming question to a human agriculture expert and get a reference ticket to track your request." },
      { property: "og:title", content: "Talk to an Expert — AgriSmart AI" },
      { property: "og:description", content: "Connect with human agriculture experts for personalised advice." },
    ],
  }),
  component: ExpertPage,
});

interface Ticket {
  id: string;
  name: string;
  contact: string;
  topic: string;
  crop?: string;
  disease?: string;
  message: string;
  status: "Open" | "In Progress" | "Resolved";
  createdAt: number;
}

const TOPIC_KEYS = ["exp.topic.crop", "exp.topic.disease", "exp.topic.market", "exp.topic.scheme", "exp.topic.other"];

function ExpertPage() {
  const { t } = useLang();
  const { profile } = useProfile();
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [topic, setTopic] = useState("exp.topic.crop");
  const [crop, setCrop] = useState("");
  const [disease, setDisease] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState<Ticket | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);

  useEffect(() => {
    setTickets(lsGet<Ticket[]>(KEYS.expertTickets, []));
  }, []);

  // Prefill from profile
  useEffect(() => {
    if (profile?.name && !name) setName(profile.name);
  }, [profile]); // eslint-disable-line

  const generateTicket = (): string => {
    const date = new Date();
    const ymd = `${date.getFullYear().toString().slice(2)}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;
    const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
    return `AGR-${ymd}-${rand}`;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !contact.trim() || !message.trim()) {
      toast.error(t("exp.required"));
      return;
    }
    setBusy(true);
    // Simulate network round-trip
    await new Promise((r) => setTimeout(r, 700));
    const ticket: Ticket = {
      id: generateTicket(),
      name: name.trim(),
      contact: contact.trim(),
      topic,
      crop: crop.trim() || undefined,
      disease: disease.trim() || undefined,
      message: message.trim(),
      status: "Open",
      createdAt: Date.now(),
    };
    const next = pushHistory<Ticket>(KEYS.expertTickets, ticket, 50);
    setTickets(next);
    setSubmitted(ticket);
    setBusy(false);
    // Reset form
    setMessage(""); setCrop(""); setDisease("");
  };

  const copyTicket = async (id: string) => {
    try {
      await navigator.clipboard.writeText(id);
      toast.success(t("common.copied"));
    } catch {
      toast.error(t("ai.errorGeneric"));
    }
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-4 md:px-6 py-10 md:py-14">
        <header className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-bold uppercase tracking-wider mb-3">
            <HeadphonesIcon className="h-3.5 w-3.5" /> {t("nav.expert")}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{t("exp.title")}</h1>
          <p className="mt-2 text-muted-foreground max-w-2xl">{t("exp.subtitle")}</p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          {/* Form / Success */}
          <section className="rounded-2xl border border-border bg-card p-6 shadow-card">
            {submitted ? (
              <div className="text-center py-8 animate-fade-in-up">
                <div className="mx-auto h-16 w-16 rounded-2xl bg-success/15 text-success flex items-center justify-center mb-4">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h2 className="text-2xl font-bold">{t("exp.success.title")}</h2>
                <p className="mt-2 text-muted-foreground max-w-md mx-auto">{t("exp.success.desc")}</p>

                <div className="mt-6 mx-auto inline-flex flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 px-6 py-5">
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-bold">{t("exp.ticket")}</p>
                  <div className="flex items-center gap-2">
                    <Ticket className="h-5 w-5 text-primary" />
                    <span className="text-2xl font-extrabold tracking-wider text-primary">{submitted.id}</span>
                    <button
                      onClick={() => copyTicket(submitted.id)}
                      className="ml-2 h-9 w-9 rounded-lg border border-border bg-card hover:bg-muted flex items-center justify-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
                      aria-label={t("common.copy")}
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => setSubmitted(null)}
                  className="mt-6 inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
                >
                  {t("exp.newReq")}
                </button>
              </div>
            ) : (
              <form onSubmit={submit} className="grid gap-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label={t("exp.name")} required>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={t("exp.namePh")}
                      className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </Field>
                  <Field label={t("exp.contact")} required>
                    <input
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                      placeholder={t("exp.contactPh")}
                      className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </Field>
                </div>

                <Field label={t("exp.topic")}>
                  <div className="flex flex-wrap gap-2">
                    {TOPIC_KEYS.map((k) => {
                      const active = topic === k;
                      return (
                        <button
                          key={k}
                          type="button"
                          onClick={() => setTopic(k)}
                          aria-pressed={active}
                          className={`rounded-full border px-3 py-1.5 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary ${
                            active
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border bg-background hover:bg-muted"
                          }`}
                        >
                          {t(k)}
                        </button>
                      );
                    })}
                  </div>
                </Field>

                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label={t("exp.crop")}>
                    <input
                      value={crop}
                      onChange={(e) => setCrop(e.target.value)}
                      placeholder={t("exp.cropPh")}
                      className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </Field>
                  <Field label={t("exp.disease")}>
                    <input
                      value={disease}
                      onChange={(e) => setDisease(e.target.value)}
                      placeholder={t("exp.diseasePh")}
                      className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </Field>
                </div>

                <Field label={t("exp.message")} required>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={t("exp.messagePh")}
                    rows={5}
                    maxLength={1500}
                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-y"
                  />
                  <p className="mt-1 text-[11px] text-muted-foreground text-right">{message.length}/1500</p>
                </Field>

                <button
                  type="submit"
                  disabled={busy}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-primary px-4 py-3 text-sm font-bold text-primary-foreground shadow-glow disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
                >
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  {busy ? t("exp.submitting") : t("exp.submit")}
                </button>
              </form>
            )}
          </section>

          {/* Previous tickets */}
          <aside className="rounded-2xl border border-border bg-card p-5 shadow-card h-fit">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="h-4 w-4 text-primary" />
              <h3 className="font-bold">{t("exp.tickets.title")}</h3>
            </div>
            {tickets.length === 0 ? (
              <p className="text-sm italic text-muted-foreground py-6 text-center">{t("exp.tickets.empty")}</p>
            ) : (
              <ul className="space-y-3">
                {tickets.map((tk) => (
                  <li key={tk.id} className="rounded-xl border border-border bg-background/50 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-sm text-primary">{tk.id}</span>
                      <span className="rounded-full bg-warning/15 text-warning px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                        {tk.status}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{t(tk.topic)}</p>
                    <p className="text-sm mt-1.5 line-clamp-2">{tk.message}</p>
                    <p className="text-[10px] text-muted-foreground mt-2">
                      {new Date(tk.createdAt).toLocaleString()}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </aside>
        </div>
      </div>
    </AppShell>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm font-semibold mb-2">
        {label} {required && <span className="text-destructive">*</span>}
      </span>
      {children}
    </label>
  );
}

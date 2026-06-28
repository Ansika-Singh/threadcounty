import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, MapPin, Twitter, Linkedin, Github } from "lucide-react";
import { z } from "zod";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — ThreadCounty" },
      { name: "description", content: "Get in touch with the ThreadCounty team. Sales, support and partnership inquiries welcome." },
      { property: "og:title", content: "Contact ThreadCounty" },
      { property: "og:description", content: "Reach the team for sales, support or partnerships." },
    ],
  }),
  component: ContactPage,
});

const schema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  subject: z.string().trim().max(200).optional(),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(5000),
});

function ContactPage() {
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse({ name, email, subject, message });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("contact_messages").insert(parsed.data);
    setSubmitting(false);
    if (error) {
      toast.error("Could not send message. Please try again.");
      return;
    }
    toast.success("Message sent. We'll be in touch shortly.");
    setName(""); setEmail(""); setSubject(""); setMessage("");
  }

  return (
    <PublicLayout>
      <section className="border-b border-border bg-background py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <ScrollReveal direction="up">
            <div className="tag mx-auto mb-4 w-fit">Contact</div>
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Let's talk textiles.</h1>
            <p className="mt-4 text-muted-foreground">
              Sales, support, research partnerships or just a question — we read every message.
            </p>
          </ScrollReveal>
        </div>
      </section>
      <section className="bg-surface py-16">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 lg:grid-cols-[1fr_1.5fr] overflow-hidden">
          <ScrollReveal direction="left" distance="24px" duration={700} className="h-full">
            <div className="space-y-6">
              <div>
                <div className="tag mb-2">Email</div>
                <a href="mailto:hello@threadcounty.com" className="flex items-center gap-2 text-base font-medium hover:text-brand transition-colors duration-300">
                  <Mail className="size-4 text-brand" /> hello@threadcounty.com
                </a>
              </div>
              <div>
                <div className="tag mb-2">Office</div>
                <p className="flex items-start gap-2 text-sm text-muted-foreground leading-relaxed">
                  <MapPin className="mt-0.5 size-4 text-brand shrink-0" /> 14 Loom Street, 4th Floor<br />Bangalore, India 560001
                </p>
              </div>
              <div>
                <div className="tag mb-2">Social</div>
                <div className="flex gap-3">
                  <a href="https://twitter.com/threadcounty" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="grid size-9 place-items-center rounded-sm border border-border hover:border-brand hover:text-brand hover:bg-brand/5 transition-all duration-300">
                    <Twitter className="size-4" />
                  </a>
                  <a href="https://linkedin.com/company/threadcounty" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="grid size-9 place-items-center rounded-sm border border-border hover:border-brand hover:text-brand hover:bg-brand/5 transition-all duration-300">
                    <Linkedin className="size-4" />
                  </a>
                  <a href="https://github.com/Ansika-Singh/textile-sight-ai" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="grid size-9 place-items-center rounded-sm border border-border hover:border-brand hover:text-brand hover:bg-brand/5 transition-all duration-300">
                    <Github className="size-4" />
                  </a>
                </div>
              </div>
              <div className="rounded-md border border-border bg-card p-5 shadow-sm">
                <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Response time</div>
                <p className="mt-2 text-sm leading-relaxed">Within 1 business day for sales and partnership inquiries; under 4 hours for paying customer support.</p>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal direction="right" distance="24px" duration={700}>
            <form onSubmit={onSubmit} className="space-y-4 rounded-md border border-border bg-card p-6 shadow-sm">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required maxLength={100} className="h-9 rounded-sm border-border text-xs focus-visible:ring-brand" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required maxLength={255} className="h-9 rounded-sm border-border text-xs focus-visible:ring-brand" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} maxLength={200} className="h-9 rounded-sm border-border text-xs focus-visible:ring-brand" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" rows={6} value={message} onChange={(e) => setMessage(e.target.value)} required maxLength={5000} className="rounded-sm border-border text-xs focus-visible:ring-brand" />
              </div>
              <Button type="submit" disabled={submitting} className="rounded-sm bg-foreground text-background hover:bg-foreground/90 w-full sm:w-auto h-10 px-6 font-semibold uppercase tracking-wider text-xs hover:scale-[1.01] active:scale-[0.99] transition-all">
                {submitting ? "Sending…" : "Send message"}
              </Button>
            </form>
          </ScrollReveal>
        </div>
      </section>
    </PublicLayout>
  );
}


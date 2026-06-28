import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — ThreadCounty" },
      { name: "description", content: "ThreadCounty privacy policy — how we collect, use, and protect your data." },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <PublicLayout>
      <section className="mx-auto max-w-3xl px-6 py-20">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-10">
          <ArrowLeft className="size-4" /> Back to home
        </Link>

        <div className="tag mb-4">Legal</div>
        <h1 className="text-4xl font-semibold tracking-tight">Privacy Policy</h1>
        <p className="mt-3 font-mono text-xs text-muted-foreground uppercase tracking-widest">Effective: 1 June 2026</p>

        <div className="mt-12 space-y-10 text-sm leading-relaxed text-muted-foreground">
          <Section title="1. Who we are">
            ThreadCounty Labs ("ThreadCounty", "we", "us") operates the ThreadCounty platform at{" "}
            <span className="text-foreground font-mono">textile-sight-ai.vercel.app</span>. We provide AI-powered
            textile analysis services including thread density measurement, weave identification, and QC reporting.
          </Section>

          <Section title="2. Information we collect">
            <ul className="mt-3 space-y-2 list-disc list-inside">
              <li><span className="text-foreground font-medium">Account data:</span> Email address and password (hashed) when you register.</li>
              <li><span className="text-foreground font-medium">Fabric images:</span> Images you upload for analysis, stored securely in Supabase Storage.</li>
              <li><span className="text-foreground font-medium">Analysis reports:</span> Thread count results, weave classifications, and AI-generated suggestions.</li>
              <li><span className="text-foreground font-medium">Usage data:</span> Pages visited, features used, and session durations via anonymous analytics.</li>
              <li><span className="text-foreground font-medium">Billing data:</span> Plan selection. Payment processing is handled by third-party providers; we do not store raw card numbers.</li>
            </ul>
          </Section>

          <Section title="3. How we use your information">
            <ul className="mt-3 space-y-2 list-disc list-inside">
              <li>To provide, operate, and improve the ThreadCounty analysis service.</li>
              <li>To generate and store your textile analysis reports.</li>
              <li>To send transactional emails (account confirmation, password reset).</li>
              <li>To administer your subscription and provide customer support.</li>
              <li>To improve our computer vision models using aggregated, anonymised data (never individually identifiable).</li>
            </ul>
          </Section>

          <Section title="4. Data storage and security">
            Your data is stored on Supabase infrastructure with row-level security policies ensuring you can only
            access your own data. Fabric images are stored in private buckets accessible only via signed URLs.
            All data is encrypted in transit (TLS 1.3) and at rest (AES-256).
          </Section>

          <Section title="5. Data retention">
            We retain your account data and reports for as long as your account is active. You can delete individual
            reports from the Archive page at any time. To permanently delete your account and all associated data,
            contact us at{" "}
            <a href="mailto:privacy@threadcounty.com" className="text-brand hover:underline">
              privacy@threadcounty.com
            </a>.
          </Section>

          <Section title="6. Third-party services">
            We use the following third-party services:
            <ul className="mt-3 space-y-2 list-disc list-inside">
              <li><span className="text-foreground font-medium">Supabase:</span> Database, authentication, and file storage.</li>
              <li><span className="text-foreground font-medium">Vercel:</span> Hosting and edge delivery.</li>
              <li><span className="text-foreground font-medium">Google Gemini API:</span> AI vision model for fabric analysis.</li>
            </ul>
            Each provider has its own privacy policy and data protection agreements with us.
          </Section>

          <Section title="7. Your rights">
            Depending on your location, you may have the right to: access your personal data, correct inaccurate data,
            request deletion ("right to be forgotten"), object to processing, and data portability.
            To exercise these rights, contact{" "}
            <a href="mailto:privacy@threadcounty.com" className="text-brand hover:underline">
              privacy@threadcounty.com
            </a>.
          </Section>

          <Section title="8. Cookies">
            We use only essential cookies required for authentication session management. We do not use tracking or
            advertising cookies.
          </Section>

          <Section title="9. Changes to this policy">
            We may update this policy from time to time. We will notify registered users via email of any material
            changes. Continued use of the service after changes constitutes acceptance.
          </Section>

          <Section title="10. Contact">
            Questions about this policy? Email us at{" "}
            <a href="mailto:privacy@threadcounty.com" className="text-brand hover:underline">
              privacy@threadcounty.com
            </a>.
          </Section>
        </div>
      </section>
    </PublicLayout>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      <div className="mt-2">{children}</div>
    </div>
  );
}

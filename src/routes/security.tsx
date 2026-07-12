import { createFileRoute } from "@tanstack/react-router";
import { PageContainer } from "@/components/layout";
import { ShieldCheck, Lock, FileCheck2, HardDrive } from "lucide-react";

export const Route = createFileRoute("/security")({
  head: () => ({ meta: [{ title: "Data Security — Eco-Recovery Hub" }] }),
  component: Security,
});

function Security() {
  const items = [
    { icon: Lock, title: "Certified Data Wiping", body: "NIST 800-88 compliant erasure on all storage devices before refurbishment." },
    { icon: HardDrive, title: "Physical Destruction", body: "Drives that fail wipe are shredded on-site; certificates provided." },
    { icon: FileCheck2, title: "Chain of Custody", body: "Every device is tracked from pickup to processing with timestamped logs." },
    { icon: ShieldCheck, title: "ISO 27001 Partners", body: "We only work with collection centers vetted to international standards." },
  ];
  return (
    <PageContainer>
      <div className="max-w-3xl">
        <div className="grid h-12 w-12 place-items-center rounded-xl bg-eco-soft"><ShieldCheck className="h-6 w-6 text-leaf" /></div>
        <h1 className="mt-4 font-display text-4xl font-bold">Data Security First</h1>
        <p className="mt-3 text-muted-foreground text-lg">Your old devices may still hold passwords, photos, and account data. We treat every drive like it contains your most sensitive files — because it might.</p>
      </div>

      <div className="mt-10 grid sm:grid-cols-2 gap-4">
        {items.map((i) => (
          <div key={i.title} className="surface-card p-6">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-eco-soft"><i.icon className="h-5 w-5 text-leaf" /></div>
            <h3 className="mt-4 font-display text-lg font-semibold">{i.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{i.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 surface-card p-6 bg-eco-soft">
        <h2 className="font-display text-2xl font-bold">Before you hand over a device</h2>
        <ol className="mt-3 space-y-2 list-decimal list-inside text-sm">
          <li>Sign out of all accounts (Apple ID, Google, Microsoft).</li>
          <li>Disable activation locks and remote-find features.</li>
          <li>Back up data you want to keep.</li>
          <li>Perform a factory reset.</li>
          <li>Remove SIM and SD cards.</li>
        </ol>
      </div>
    </PageContainer>
  );
}

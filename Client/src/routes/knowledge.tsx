import { createFileRoute } from "@tanstack/react-router";
import { PageContainer } from "@/components/layout";
import { articles } from "@/lib/mock-data";
import { BookOpen } from "lucide-react";

export const Route = createFileRoute("/knowledge")({
  head: () => ({ meta: [{ title: "Education — Eco-Recovery Hub" }] }),
  component: Knowledge,
});

function Knowledge() {
  return (
    <PageContainer>
      <div className="flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-xl bg-eco-soft"><BookOpen className="h-5 w-5 text-leaf" /></div>
        <div>
          <h1 className="font-display text-4xl font-bold">Education</h1>
          <p className="text-muted-foreground">Learn how to sort, prepare and recover materials across every sector.</p>
        </div>
      </div>


      <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {articles.map((a) => (
          <article key={a.id} className="surface-card p-6 hover:border-eco transition-colors cursor-pointer">
            <div className="text-xs font-medium uppercase tracking-wider text-leaf">{a.category}</div>
            <h2 className="mt-2 font-display text-xl font-semibold">{a.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{a.excerpt}</p>
            <div className="mt-4 text-xs text-muted-foreground">{a.time}</div>
          </article>
        ))}
      </div>
    </PageContainer>
  );
}

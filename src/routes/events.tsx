import { createFileRoute, Link } from "@tanstack/react-router";
import { PageContainer, RequireUser } from "@/components/layout";
import { store, useUser } from "@/lib/mock-store";
import { useState, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Calendar,
  MapPin,
  Clock,
  User,
  Plus,
  Users,
  Search,
  CheckCircle,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Leaf
} from "lucide-react";

export const Route = createFileRoute("/events")({
  head: () => ({ meta: [{ title: "Community Events — Eco-Recovery Hub" }] }),
  component: () => (
    <RequireUser>
      <EventsPage />
    </RequireUser>
  ),
});

function EventsPage() {
  const snap = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
  const user = snap.user!;

  const [searchTerm, setSearchTerm] = useState("");
  const [filterMode, setFilterMode] = useState<"all" | "joined">("all");

  // Filtered Events
  const filteredEvents = snap.events.filter((e) => {
    const matchesSearch =
      e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterMode === "joined") {
      return matchesSearch && e.volunteers.includes(user.id);
    }
    return matchesSearch;
  });

  return (
    <PageContainer>
      {/* HEADER */}
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-eco/30 bg-eco-soft/50 px-3 py-1 text-xs font-semibold text-leaf">
          <Calendar className="h-3.5 w-3.5" />
          Sustainability Action Drives
        </div>
        <h1 className="font-display text-4xl font-bold tracking-tight">
          Join Community <span className="text-gradient-eco">Recycling Events</span>
        </h1>
        <p className="text-muted-foreground text-sm max-w-xl mx-auto">
          Participate in local cleanups, tree plantings, expos, and collection drives. Earn Eco Points for volunteering and make a hands-on impact.
        </p>
      </div>

      {/* FILTER & SEARCH */}
      <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 max-w-4xl mx-auto">
        <div className="relative w-full sm:flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search events by title, description, or city..."
            className="pl-9 h-10 rounded-xl text-sm"
          />
        </div>

        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => setFilterMode("all")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              filterMode === "all"
                ? "bg-leaf text-white shadow-sm"
                : "bg-muted/65 text-muted-foreground hover:bg-muted"
            }`}
          >
            All Events
          </button>
          <button
            onClick={() => setFilterMode("joined")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              filterMode === "joined"
                ? "bg-leaf text-white shadow-sm"
                : "bg-muted/65 text-muted-foreground hover:bg-muted"
            }`}
          >
            My Registrations
          </button>
        </div>
      </div>

      {/* EVENTS GRID */}
      <div className="mt-10 max-w-5xl mx-auto">
        {filteredEvents.length === 0 ? (
          <div className="surface-card p-16 text-center space-y-4 max-w-md mx-auto">
            <Calendar className="h-10 w-10 text-muted-foreground/40 mx-auto" />
            <h3 className="font-bold text-sm">No events found</h3>
            <p className="text-xs text-muted-foreground">
              Try a different search query or change your filter. Make sure you register to events to see them in 'My Registrations'.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {filteredEvents.map((e) => {
              const joined = e.volunteers.includes(user.id);
              
              return (
                <div
                  key={e.id}
                  className="surface-card overflow-hidden hover:border-eco transition-all duration-300 flex flex-col shadow-sm"
                >
                  {/* Event Image */}
                  <div className="relative h-48 bg-muted">
                    <img src={e.imageUrl} alt={e.title} className="w-full h-full object-cover" />
                    {joined && (
                      <div className="absolute top-3 right-3 bg-leaf/90 backdrop-blur-xs text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" /> Registered
                      </div>
                    )}
                  </div>

                  {/* Event Details */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="text-[10px] uppercase font-bold text-leaf tracking-wider">
                        Hosted by {e.host}
                      </div>
                      <h3 className="font-display font-bold text-lg text-foreground">
                        {e.title}
                      </h3>
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                        {e.description}
                      </p>
                    </div>

                    {/* Metadata boxes */}
                    <div className="grid grid-cols-2 gap-2 text-xs py-3 border-y border-border/60 text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-leaf shrink-0" />
                        <div className="min-w-0">
                          <span className="text-[9px] block uppercase font-semibold text-muted-foreground/80">Date & Time</span>
                          <span className="font-medium text-foreground truncate block">{e.date} @ {e.time}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-leaf shrink-0" />
                        <div className="min-w-0">
                          <span className="text-[9px] block uppercase font-semibold text-muted-foreground/80">Location</span>
                          <span className="font-medium text-foreground truncate block">{e.location.split(",")[0]}</span>
                        </div>
                      </div>
                    </div>

                    {/* Footer / CTA row */}
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Users className="h-4 w-4 text-leaf" />
                        <span className="font-bold text-foreground">{e.volunteers.length}</span>
                        <span>attending</span>
                      </div>

                      <Button
                        size="sm"
                        onClick={() => {
                          if (joined) {
                            store.leaveEvent(e.id);
                            toast.info("Registration canceled.");
                          } else {
                            store.joinEvent(e.id);
                            toast.success("Successfully registered! +50 Eco Points!");
                          }
                        }}
                        className={`rounded-xl text-xs font-bold px-4 h-8 ${
                          joined
                            ? "bg-muted text-muted-foreground hover:bg-muted/80"
                            : "bg-eco-gradient text-eco-foreground hover:opacity-90 shadow-sm"
                        }`}
                      >
                        {joined ? "Cancel Join" : "Volunteer Now"}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Info strip */}
      <div className="mt-16 max-w-4xl mx-auto rounded-2xl bg-eco-soft/40 border border-eco/30 p-6 flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-eco-gradient shadow-md">
          <Leaf className="h-6 w-6 text-eco-foreground" />
        </span>
        <div className="flex-1">
          <h4 className="font-display font-bold text-lg">Are you a registered recycling institution?</h4>
          <p className="text-xs text-muted-foreground mt-0.5">
            Institutional users like Koforidua Technical University can organize events, manage campus collections, post schedules, and broadcast clean-up announcements through their admin panel.
          </p>
        </div>
        <Button asChild variant="outline" className="rounded-xl text-xs h-9 shrink-0">
          <Link to="/community">Check Campus campaigns</Link>
        </Button>
      </div>
    </PageContainer>
  );
}

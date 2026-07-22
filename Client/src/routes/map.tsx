import { createFileRoute } from "@tanstack/react-router";
import { PageContainer } from "@/components/layout";
import { centers } from "@/lib/mock-data";
import { MapPin, Navigation, LocateFixed, Loader2, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef, useCallback } from "react";

export const Route = createFileRoute("/map")({
  head: () => ({ meta: [{ title: "Recycling Map — Eco-Recovery Hub" }] }),
  component: MapView,
});

// ─── Haversine distance formula ─────────────────────────────────────────────
function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function fmtDist(km: number): string {
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
}

// ─── Google Maps loader ──────────────────────────────────────────────────────
const GMAP_KEY = (import.meta as any).env?.VITE_GOOGLE_MAPS_KEY ?? "";

type GMap = google.maps.Map;
type GMarker = google.maps.Marker;

declare global {
  interface Window {
    google: typeof google;
    __gmapsLoaded?: boolean;
    __gmapsCallbacks?: Array<() => void>;
    __gmapsInitCb?: () => void;
  }
}

function loadGoogleMaps(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.__gmapsLoaded) { resolve(); return; }
    if (!window.__gmapsCallbacks) window.__gmapsCallbacks = [];
    window.__gmapsCallbacks.push(resolve);

    if (!document.getElementById("gmaps-script")) {
      window.__gmapsInitCb = () => {
        window.__gmapsLoaded = true;
        (window.__gmapsCallbacks ?? []).forEach((cb) => cb());
        window.__gmapsCallbacks = [];
      };
      const script = document.createElement("script");
      script.id = "gmaps-script";
      script.async = true;
      if (GMAP_KEY) {
        script.src = `https://maps.googleapis.com/maps/api/js?key=${GMAP_KEY}&callback=__gmapsInitCb&libraries=marker`;
      } else {
        // Fallback: no key, limited usage
        script.src = `https://maps.googleapis.com/maps/api/js?callback=__gmapsInitCb`;
      }
      script.onerror = () => reject(new Error("Google Maps failed to load"));
      document.head.appendChild(script);
    }
  });
}

// ─── Main Component ──────────────────────────────────────────────────────────

function MapView() {
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState<string | null>(null);
  const [mapsReady, setMapsReady] = useState(false);
  const [mapsError, setMapsError] = useState<string | null>(null);

  const mapDivRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<GMap | null>(null);
  const markersRef = useRef<Map<string, GMarker>>(new Map());
  const userMarkerRef = useRef<GMarker | null>(null);

  const filtered = centers.filter((c) =>
    `${c.name} ${c.address}`.toLowerCase().includes(q.toLowerCase())
  );

  // Compute real distances when user position is known
  const withDistances = filtered.map((c) => ({
    ...c,
    realDist: userPos ? haversineKm(userPos.lat, userPos.lng, c.lat, c.lng) : null,
  }));

  // Sort by real distance if we have it
  const sorted = userPos
    ? [...withDistances].sort((a, b) => (a.realDist ?? 9e9) - (b.realDist ?? 9e9))
    : withDistances;

  // ── Load Google Maps on mount ─────────────────────────────────────────────
  useEffect(() => {
    loadGoogleMaps()
      .then(() => setMapsReady(true))
      .catch((e: Error) => setMapsError(e.message));
  }, []);

  // ── Init map once SDK is ready and div is available ───────────────────────
  useEffect(() => {
    if (!mapsReady || !mapDivRef.current || mapRef.current) return;

    const defaultCenter = { lat: 5.95, lng: -0.7 }; // Center of Ghana

    const map = new window.google.maps.Map(mapDivRef.current, {
      center: defaultCenter,
      zoom: 7,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      styles: [
        { elementType: "geometry", stylers: [{ color: "#0f1c14" }] },
        { elementType: "labels.text.fill", stylers: [{ color: "#a8d9a3" }] },
        { elementType: "labels.text.stroke", stylers: [{ color: "#0f1c14" }] },
        { featureType: "road", elementType: "geometry", stylers: [{ color: "#1e3a28" }] },
        { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#27512f" }] },
        { featureType: "water", elementType: "geometry", stylers: [{ color: "#0a2015" }] },
        { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#3aa06e" }] },
        { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#14291c" }] },
        { featureType: "administrative", elementType: "geometry.stroke", stylers: [{ color: "#2d6b3d" }] },
        { featureType: "administrative.country", elementType: "labels.text.fill", stylers: [{ color: "#5ecf7a" }] },
        { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#5ecf7a" }] },
        { featureType: "landscape", elementType: "geometry", stylers: [{ color: "#12231a" }] },
      ],
    });
    mapRef.current = map;

    // Add center markers
    centers.forEach((c) => {
      const marker = new window.google.maps.Marker({
        position: { lat: c.lat, lng: c.lng },
        map,
        title: c.name,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          fillColor: "#3edb7a",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 2,
          scale: 10,
        },
        animation: window.google.maps.Animation.DROP,
      });

      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="font-family:system-ui;padding:4px 8px;color:#0f1c14;min-width:160px">
            <strong style="font-size:14px">${c.name}</strong>
            <p style="margin:4px 0 2px;font-size:12px;color:#555">${c.address}</p>
            <p style="margin:0;font-size:11px;color:#2d7a44">${c.accepts.join(" · ")}</p>
          </div>
        `,
      });

      marker.addListener("click", () => {
        infoWindow.open(map, marker);
        setSelected(c.id);
      });

      markersRef.current.set(c.id, marker);
    });
  }, [mapsReady]);

  // ── Highlight selected marker ─────────────────────────────────────────────
  useEffect(() => {
    markersRef.current.forEach((marker, id) => {
      marker.setIcon({
        path: window.google?.maps?.SymbolPath?.CIRCLE,
        fillColor: id === selected ? "#ff9f3a" : "#3edb7a",
        fillOpacity: 1,
        strokeColor: "#ffffff",
        strokeWeight: id === selected ? 3 : 2,
        scale: id === selected ? 14 : 10,
      });
      if (id === selected) {
        marker.setZIndex(100);
      }
    });
  }, [selected]);

  // ── Pan to selected center ────────────────────────────────────────────────
  const panToCenter = useCallback((centerId: string) => {
    setSelected(centerId);
    const c = centers.find((x) => x.id === centerId);
    if (c && mapRef.current) {
      mapRef.current.panTo({ lat: c.lat, lng: c.lng });
      mapRef.current.setZoom(13);
    }
  }, []);

  // ── Update user location marker ───────────────────────────────────────────
  useEffect(() => {
    if (!mapsReady || !mapRef.current) return;
    if (!userPos) return;

    if (userMarkerRef.current) {
      userMarkerRef.current.setPosition(userPos);
    } else {
      userMarkerRef.current = new window.google.maps.Marker({
        position: userPos,
        map: mapRef.current,
        title: "Your Location",
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          fillColor: "#60a5fa",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 3,
          scale: 12,
        },
        zIndex: 200,
      });
    }
    mapRef.current.panTo(userPos);
    mapRef.current.setZoom(10);
  }, [userPos, mapsReady]);

  // ── Geolocation ───────────────────────────────────────────────────────────
  const locate = () => {
    if (!navigator.geolocation) {
      setLocError("Geolocation is not supported by your browser.");
      return;
    }
    setLocating(true);
    setLocError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      (err) => {
        setLocError(`Location error: ${err.message}`);
        setLocating(false);
      },
      { timeout: 10000 }
    );
  };

  // ── "Go" button — opens Google Maps directions ────────────────────────────
  const openDirections = (c: (typeof centers)[0]) => {
    const dest = `${c.lat},${c.lng}`;
    const origin = userPos ? `${userPos.lat},${userPos.lng}` : "";
    const url = origin
      ? `https://www.google.com/maps/dir/${origin}/${dest}`
      : `https://www.google.com/maps/search/?api=1&query=${dest}`;
    window.open(url, "_blank", "noopener");
  };

  return (
    <PageContainer>
      <h1 className="font-display text-4xl font-bold">Recycling Map</h1>
      <p className="mt-2 text-muted-foreground">Certified collection centers and drop-off points.</p>

      <div className="mt-6 grid lg:grid-cols-[1fr_2fr] gap-6">
        {/* ── Sidebar ─────────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-3">
          <div className="flex gap-2">
            <Input
              placeholder="Search by city or name…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <Button
              id="locate-me-btn"
              variant="outline"
              size="icon"
              onClick={locate}
              disabled={locating}
              title="Use my location"
              className="shrink-0"
            >
              {locating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LocateFixed className="h-4 w-4" />
              )}
            </Button>
          </div>

          {locError && (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
              {locError}
            </div>
          )}

          {userPos && (
            <div className="rounded-lg bg-blue-500/10 border border-blue-500/30 px-3 py-2 text-xs text-blue-400">
              📍 Your location detected — centers sorted by distance
            </div>
          )}

          <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
            {sorted.map((c) => (
              <button
                key={c.id}
                id={`center-card-${c.id}`}
                onClick={() => panToCenter(c.id)}
                className={`surface-card p-4 w-full text-left transition-all duration-200 cursor-pointer hover:border-leaf/50 ${
                  selected === c.id ? "border-leaf ring-1 ring-leaf/40 bg-eco-soft/30" : ""
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`grid h-10 w-10 place-items-center rounded-xl shrink-0 transition-colors ${
                      selected === c.id ? "bg-eco-gradient" : "bg-eco-soft"
                    }`}
                  >
                    <MapPin
                      className={`h-5 w-5 ${selected === c.id ? "text-white" : "text-leaf"}`}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold">{c.name}</div>
                    <div className="text-sm text-muted-foreground">{c.address}</div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {c.accepts.map((a) => (
                        <span key={a} className="rounded-full bg-muted px-2 py-0.5 text-xs">
                          {a}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-xs text-right shrink-0">
                    <div className="font-semibold tabular-nums text-muted-foreground">
                      {c.realDist != null ? fmtDist(c.realDist) : "Ghana Center"}
                    </div>
                    <Button
                      id={`go-btn-${c.id}`}
                      size="sm"
                      variant="ghost"
                      className="mt-1 h-7 px-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        openDirections(c);
                      }}
                    >
                      <Navigation className="h-3.5 w-3.5 mr-1" />
                      Go
                    </Button>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ── Map Panel ───────────────────────────────────────────────────── */}
        <div className="surface-card overflow-hidden relative min-h-[500px] rounded-2xl">
          {/* Google Maps target div */}
          <div ref={mapDivRef} className="absolute inset-0" id="google-map-canvas" />

          {/* Loading skeleton */}
          {!mapsReady && !mapsError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/80 backdrop-blur-sm z-10">
              <Loader2 className="h-8 w-8 animate-spin text-leaf" />
              <p className="text-sm text-muted-foreground">Loading map…</p>
            </div>
          )}

          {/* Error / No API key state */}
          {(mapsError || (!GMAP_KEY && !mapsReady)) && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-10 p-8 text-center bg-background/90 backdrop-blur-sm">
              <AlertTriangle className="h-10 w-10 text-amber-400" />
              <div>
                <p className="font-semibold">Google Maps API key required</p>
                <p className="mt-1 text-sm text-muted-foreground max-w-xs">
                  Add{" "}
                  <code className="rounded bg-muted px-1 text-xs font-mono">VITE_GOOGLE_MAPS_KEY</code>{" "}
                  to your Vercel environment variables and{" "}
                  <code className="rounded bg-muted px-1 text-xs font-mono">Client/.env.production</code>{" "}
                  to enable the live map.
                </p>
              </div>
              {/* Fallback pin display for centers */}
              <div className="mt-2 grid grid-cols-2 gap-2 w-full max-w-sm">
                {centers.map((c) => (
                  <a
                    key={c.id}
                    id={`map-fallback-link-${c.id}`}
                    href={`https://www.google.com/maps/search/?api=1&query=${c.lat},${c.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-xl border border-border bg-card/60 px-3 py-2 text-xs hover:border-leaf/50 transition-colors"
                  >
                    <MapPin className="h-3.5 w-3.5 text-leaf shrink-0" />
                    <span className="truncate font-medium">{c.name}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* "Locate me" overlay button on the map */}
          {mapsReady && (
            <div className="absolute top-3 right-3 z-10">
              <Button
                id="map-locate-btn"
                size="sm"
                variant="default"
                className="shadow-lg gap-1.5 bg-card/90 backdrop-blur text-foreground border border-border hover:bg-leaf hover:text-white hover:border-leaf transition-colors"
                onClick={locate}
                disabled={locating}
              >
                {locating ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <LocateFixed className="h-3.5 w-3.5" />
                )}
                {locating ? "Locating…" : "My Location"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { PageContainer, RequireUser } from "@/components/layout";
import { store, useUser } from "@/lib/mock-store";
import { useState, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UserAvatar } from "@/routes/settings";
import { toast } from "sonner";
import {
  MessageSquare,
  Send,
  Heart,
  Share2,
  Bookmark,
  TrendingUp,
  Calendar,
  Award,
  Leaf,
  Camera,
  MapPin,
  Tag,
  Globe,
  Plus,
  Compass,
  AlertTriangle,
  ThumbsUp,
  CheckCircle,
  Clock,
  Sparkles,
  ShoppingBag,
  Flame,
  ShieldCheck,
  Flag
} from "lucide-react";

export const Route = createFileRoute("/community")({
  head: () => ({ meta: [{ title: "Community Feed — Eco-Recovery Hub" }] }),
  component: () => (
    <RequireUser>
      <CommunityPage />
    </RequireUser>
  ),
});

function CommunityPage() {
  const snap = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
  const user = snap.user!;
  
  // Tab/filter state for Left Sidebar
  const [feedFilter, setFeedFilter] = useState<"all" | "my" | "saved">("all");
  
  // Post Creator states
  const [postText, setPostText] = useState("");
  const [postSector, setPostSector] = useState("");
  const [postHashtags, setPostHashtags] = useState("");
  const [postVisibility, setPostVisibility] = useState<"Public" | "Friends" | "Institution Only" | "Private">("Public");
  const [postMediaUrl, setPostMediaUrl] = useState<string | null>(null);
  const [postLocation, setPostLocation] = useState("");
  const [showCreatorDetails, setShowCreatorDetails] = useState(false);
  
  // Comment states
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");
  
  // Local saved posts list (simulation)
  const [savedPostIds, setSavedPostIds] = useState<string[]>(["post-1"]);

  // Handler: Create Post
  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postText.trim()) return toast.error("Write something to post!");
    
    // Auto-extract hashtags if user typed them in text or input field
    let tags = postHashtags;
    if (!tags && postText.includes("#")) {
      const extracted = postText.match(/#[a-zA-Z0-9]+/g);
      if (extracted) tags = extracted.join(" ");
    }
    
    const formattedText = tags ? `${postText}\n\n${tags}` : postText;
    
    store.createPost(
      formattedText,
      postSector || undefined,
      postMediaUrl || undefined,
      postMediaUrl ? "image" : undefined,
      postVisibility
    );
    
    toast.success("Post published! Earned +10 Eco Points!");
    setPostText("");
    setPostSector("");
    setPostHashtags("");
    setPostMediaUrl(null);
    setPostLocation("");
    setShowCreatorDetails(false);
  };

  // Handler: Add Comment
  const handleAddComment = (postId: string) => {
    if (!commentText.trim()) return;
    store.addComment(postId, commentText.trim());
    setCommentText("");
    toast.success("Comment added!");
  };

  // Toggle Save Post
  const toggleSavePost = (postId: string) => {
    setSavedPostIds(prev => 
      prev.includes(postId) ? prev.filter(id => id !== postId) : [...prev, postId]
    );
    toast.success(savedPostIds.includes(postId) ? "Post removed from Saved" : "Post saved!");
  };

  // Filter posts based on Left Sidebar selection
  const filteredPosts = snap.posts.filter(p => {
    if (feedFilter === "my") return p.userId === user.id;
    if (feedFilter === "saved") return savedPostIds.includes(p.id);
    // Standard feed displays posts visible based on role/relationship
    if (p.visibility === "Private" && p.userId !== user.id) return false;
    if (p.visibility === "Institution Only" && user.institution !== p.userName && user.institution !== "Eco-Recovery-Hub HQ") {
      // Basic check: if it's institution-only and user has different institution, hide
      const userInstName = user.institution || user.orgName || "";
      if (!userInstName) return false;
    }
    return true;
  });

  return (
    <PageContainer className="py-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-7xl mx-auto">
        
        {/* ========================================== */}
        {/* LEFT SIDEBAR (Span 3) */}
        {/* ========================================== */}
        <aside className="lg:col-span-3 space-y-4">
          <div className="surface-card p-4 space-y-2 sticky top-20">
            <div className="flex items-center gap-3 pb-3 border-b border-border">
              <UserAvatar user={user} size="md" className="rounded-xl" />
              <div className="min-w-0">
                <div className="font-bold text-sm truncate">{user.fullName}</div>
                <div className="text-xs text-muted-foreground truncate">{user.accountType} account</div>
              </div>
            </div>

            <nav className="space-y-1 pt-2">
              <button
                onClick={() => setFeedFilter("all")}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                  feedFilter === "all" ? "bg-eco-soft text-leaf" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <span className="flex items-center gap-2">
                  <Compass className="h-4 w-4" /> Discover Feed
                </span>
                <span className="text-xs bg-muted px-2 py-0.5 rounded-full font-semibold">
                  {snap.posts.length}
                </span>
              </button>

              <button
                onClick={() => setFeedFilter("my")}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                  feedFilter === "my" ? "bg-eco-soft text-leaf" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <span className="flex items-center gap-2">
                  <UserAvatar user={user} size="sm" className="h-4 w-4 rounded" /> My Posts
                </span>
                <span className="text-xs bg-muted px-2 py-0.5 rounded-full font-semibold">
                  {snap.posts.filter(p => p.userId === user.id).length}
                </span>
              </button>

              <button
                onClick={() => setFeedFilter("saved")}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                  feedFilter === "saved" ? "bg-eco-soft text-leaf" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <span className="flex items-center gap-2">
                  <Bookmark className="h-4 w-4" /> Saved Posts
                </span>
                <span className="text-xs bg-muted px-2 py-0.5 rounded-full font-semibold">
                  {savedPostIds.length}
                </span>
              </button>
            </nav>

            <div className="border-t border-border pt-4 mt-2 space-y-1">
              <div className="text-[10px] font-bold text-muted-foreground uppercase px-3 mb-1">Hub Quick Links</div>
              <Button asChild variant="ghost" className="w-full justify-start text-xs rounded-xl h-8 text-muted-foreground hover:text-foreground">
                <Link to="/marketplace"><ShoppingBag className="mr-2 h-3.5 w-3.5" /> Marketplace</Link>
              </Button>
              <Button asChild variant="ghost" className="w-full justify-start text-xs rounded-xl h-8 text-muted-foreground hover:text-foreground">
                <Link to="/scanner"><Sparkles className="mr-2 h-3.5 w-3.5" /> AI Scanner</Link>
              </Button>
              <Button asChild variant="ghost" className="w-full justify-start text-xs rounded-xl h-8 text-muted-foreground hover:text-foreground">
                <Link to="/leaderboard"><Award className="mr-2 h-3.5 w-3.5" /> Leaderboard</Link>
              </Button>
              <Button asChild variant="ghost" className="w-full justify-start text-xs rounded-xl h-8 text-muted-foreground hover:text-foreground">
                <Link to="/messages"><MessageSquare className="mr-2 h-3.5 w-3.5" /> Messages</Link>
              </Button>
            </div>
          </div>
        </aside>

        {/* ========================================== */}
        {/* CENTER COMMUNITY FEED (Span 6) */}
        {/* ========================================== */}
        <main className="lg:col-span-6 space-y-5">
          {/* CREATE POST CARD */}
          <div className="surface-card p-5 space-y-4">
            <div className="flex gap-3">
              <UserAvatar user={user} size="md" className="rounded-xl" />
              <div className="flex-1">
                <Textarea
                  value={postText}
                  onChange={(e) => setPostText(e.target.value)}
                  placeholder="What's happening in your recycling journey?"
                  className="w-full resize-none border-0 focus-visible:ring-0 p-0 text-sm placeholder:text-muted-foreground/75 bg-transparent min-h-[60px]"
                />
              </div>
            </div>

            {/* Media Simulation preview */}
            {postMediaUrl && (
              <div className="relative rounded-xl overflow-hidden aspect-video bg-muted border border-border">
                <img src={postMediaUrl} alt="Uploaded material preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setPostMediaUrl(null)}
                  className="absolute top-2 right-2 p-1 rounded-full bg-black/60 text-white hover:bg-black/85"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Expandable creator tools */}
            {showCreatorDetails && (
              <div className="grid sm:grid-cols-2 gap-3 border-t border-border/60 pt-4 text-xs">
                <div className="space-y-1">
                  <label className="font-semibold text-muted-foreground">Select Sector Tag</label>
                  <select
                    value={postSector}
                    onChange={(e) => setPostSector(e.target.value)}
                    className="w-full h-8 rounded-lg border border-input bg-transparent px-2 text-xs"
                  >
                    <option value="">No Sector tag</option>
                    <option value="e-waste">🔌 E-Waste</option>
                    <option value="plastic">🧴 Plastic</option>
                    <option value="metal">🥫 Metal</option>
                    <option value="glass">🍾 Glass</option>
                    <option value="paper-cardboard">📦 Paper & Cardboard</option>
                    <option value="textile">👕 Clothing & Textiles</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-muted-foreground">Visibility</label>
                  <select
                    value={postVisibility}
                    onChange={(e) => setPostVisibility(e.target.value as any)}
                    className="w-full h-8 rounded-lg border border-input bg-transparent px-2 text-xs"
                  >
                    <option value="Public">🌍 Public</option>
                    <option value="Friends">👥 Friends</option>
                    <option value="Institution Only">🏫 Campus / Institution</option>
                    <option value="Private">🔒 Private (Just Me)</option>
                  </select>
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="font-semibold text-muted-foreground">Add Hashtags</label>
                  <Input
                    placeholder="e.g. #PlasticRecycling #GoGreen"
                    value={postHashtags}
                    onChange={(e) => setPostHashtags(e.target.value)}
                    className="h-8 text-xs rounded-lg"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="font-semibold text-muted-foreground">Location</label>
                  <Input
                    placeholder="e.g. KTU Campus, Koforidua"
                    value={postLocation}
                    onChange={(e) => setPostLocation(e.target.value)}
                    className="h-8 text-xs rounded-lg"
                  />
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
              <div className="flex items-center gap-1.5">
                {/* Simulated Image Upload */}
                <button
                  type="button"
                  onClick={() => {
                    setPostMediaUrl("https://images.unsplash.com/photo-1611270624018-c89493793674?w=800&q=80");
                    toast.info("Simulated camera photo attachment");
                  }}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-muted-foreground hover:bg-muted transition-colors"
                >
                  <Camera className="h-4 w-4 text-leaf" /> Photo
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreatorDetails(prev => !prev)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-muted-foreground hover:bg-muted transition-colors"
                >
                  <Tag className="h-4 w-4 text-leaf" /> Metadata
                </button>
              </div>

              <div className="flex items-center gap-2">
                {showCreatorDetails && (
                  <Button variant="ghost" size="sm" className="rounded-xl text-xs h-8" onClick={() => setShowCreatorDetails(false)}>
                    Collapse
                  </Button>
                )}
                <Button onClick={handleCreatePost} size="sm" className="bg-eco-gradient text-eco-foreground hover:opacity-90 rounded-xl px-4 text-xs font-bold h-8">
                  Post <Send className="ml-1.5 h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>

          {/* COMMUNITY FEED LIST */}
          <div className="space-y-4">
            {filteredPosts.length === 0 ? (
              <div className="surface-card p-10 text-center space-y-2">
                <Leaf className="h-10 w-10 text-muted-foreground/50 mx-auto" />
                <h3 className="font-bold">No posts in this feed yet</h3>
                <p className="text-xs text-muted-foreground">Be the first to share your recycling milestone!</p>
              </div>
            ) : (
              filteredPosts.map((p) => {
                const liked = p.likes.includes(user.id);
                const isHelpful = p.helpful.includes(user.id);
                const isNiceWork = p.niceWork.includes(user.id);
                const isSaved = savedPostIds.includes(p.id);

                return (
                  <article key={p.id} className="surface-card p-5 space-y-4 hover:border-eco-soft transition-colors">
                    {/* Header */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <UserAvatar user={{ fullName: p.userName, avatar: p.userAvatar, role: p.userRole }} size="md" className="rounded-xl" />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-sm text-foreground hover:underline cursor-pointer">
                              {p.userName}
                            </span>
                            {p.userRole === "Admin" && (
                              <span className="inline-flex items-center gap-0.5 rounded bg-leaf/15 text-leaf px-1.5 py-0.5 text-[9px] font-bold uppercase">
                                <ShieldCheck className="h-2.5 w-2.5" /> Staff
                              </span>
                            )}
                            {p.userBadges?.map(badge => (
                              <span key={badge} className="text-[10px] hidden sm:inline" title={badge}>
                                {badge.split(" ")[0]}
                              </span>
                            ))}
                          </div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                            <Clock className="h-3 w-3" /> {p.timestamp.includes("Z") ? "Just now" : p.timestamp}
                            <span>·</span>
                            <span className="capitalize">{p.visibility.toLowerCase()}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          store.reportPost(p.id);
                          toast.warning("Post reported to platform moderators.");
                        }}
                        className="p-1.5 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                        title="Report Inappropriate Content"
                      >
                        <Flag className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* Sector Tag Indicator */}
                    {p.sector && (
                      <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-eco-soft/40 text-leaf text-xs font-semibold uppercase tracking-wider">
                        ♻ {p.sector} sector
                      </div>
                    )}

                    {/* Post Text */}
                    <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                      {p.text}
                    </p>

                    {/* Attached Image/Video */}
                    {p.mediaUrl && (
                      <div className="rounded-2xl overflow-hidden border border-border bg-muted/40">
                        <img src={p.mediaUrl} alt="Post material visual" className="w-full max-h-[360px] object-cover" />
                      </div>
                    )}

                    {/* Likes and Reactions counters */}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      {p.likes.length > 0 && (
                        <span>💚 {p.likes.length} nice works</span>
                      )}
                      {p.helpful.length > 0 && (
                        <span>💡 {p.helpful.length} helpfuls</span>
                      )}
                      {p.niceWork.length > 0 && (
                        <span>👏 {p.niceWork.length} congratulations</span>
                      )}
                    </div>

                    {/* Interaction Buttons row */}
                    <div className="flex flex-wrap items-center justify-between gap-1 border-y border-border py-1.5 text-xs text-muted-foreground">
                      <button
                        onClick={() => store.likePost(p.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold hover:bg-muted transition-colors ${
                          liked ? "text-leaf" : ""
                        }`}
                      >
                        <ThumbsUp className="h-4 w-4" />
                        <span>Recycled</span>
                      </button>

                      <button
                        onClick={() => store.reactToPost(p.id, "helpful")}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold hover:bg-muted transition-colors ${
                          isHelpful ? "text-amber-500" : ""
                        }`}
                      >
                        <Sparkles className="h-4 w-4" />
                        <span>Helpful</span>
                      </button>

                      <button
                        onClick={() => store.reactToPost(p.id, "niceWork")}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold hover:bg-muted transition-colors ${
                          isNiceWork ? "text-blue-500" : ""
                        }`}
                      >
                        <Flame className="h-4 w-4" />
                        <span>Nice Work</span>
                      </button>

                      <button
                        onClick={() => setActiveCommentPostId(activeCommentPostId === p.id ? null : p.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold hover:bg-muted transition-colors"
                      >
                        <MessageSquare className="h-4 w-4" />
                        <span>Comment ({p.comments.length})</span>
                      </button>

                      <button
                        onClick={() => toggleSavePost(p.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold hover:bg-muted transition-colors ${
                          isSaved ? "text-leaf" : ""
                        }`}
                      >
                        <Bookmark className="h-4 w-4" />
                        <span>Save</span>
                      </button>
                    </div>

                    {/* Expanded Comments container */}
                    {activeCommentPostId === p.id && (
                      <div className="space-y-4 pt-2">
                        {/* New Comment input bar */}
                        <div className="flex gap-2">
                          <UserAvatar user={user} size="sm" className="rounded-lg" />
                          <div className="flex-1 flex gap-2">
                            <Input
                              value={commentText}
                              onChange={(e) => setCommentText(e.target.value)}
                              placeholder="Write a comment..."
                              className="text-xs h-8 rounded-lg"
                              onKeyDown={(e) => { if (e.key === "Enter") handleAddComment(p.id); }}
                            />
                            <Button size="sm" onClick={() => handleAddComment(p.id)} className="h-8 rounded-lg bg-eco-soft text-leaf hover:bg-leaf hover:text-white px-3">
                              <Send className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>

                        {/* Comments list */}
                        {p.comments.length > 0 && (
                          <div className="space-y-3 pl-3 border-l-2 border-border/50">
                            {p.comments.map((comment) => (
                              <div key={comment.id} className="flex gap-2.5 text-xs">
                                <UserAvatar user={{ fullName: comment.userName, avatar: comment.userAvatar, role: comment.userRole }} size="sm" className="rounded-lg h-7 w-7" />
                                <div className="flex-1 bg-muted/40 p-2.5 rounded-xl border border-border/50">
                                  <div className="flex justify-between items-baseline mb-0.5">
                                    <span className="font-bold text-foreground">{comment.userName}</span>
                                    <span className="text-[9px] text-muted-foreground">Just now</span>
                                  </div>
                                  <p className="text-muted-foreground text-xs leading-relaxed">{comment.text}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </article>
                );
              })
            )}
          </div>
        </main>

        {/* ========================================== */}
        {/* RIGHT SIDEBAR (Span 3) */}
        {/* ========================================== */}
        <aside className="lg:col-span-3 space-y-4">
          
          {/* CHALLENGES SYSTEM */}
          <div className="surface-card p-4 space-y-3">
            <h3 className="font-display font-bold text-sm flex items-center gap-1.5 text-foreground">
              <Flame className="h-4 w-4 text-leaf" /> Active Challenges
            </h3>
            
            <div className="space-y-3.5">
              {snap.challenges.map((c) => {
                const percent = Math.min(100, Math.round((c.progress / c.targetQuantity) * 100));
                return (
                  <div key={c.id} className="text-xs space-y-1.5 p-2.5 rounded-xl border border-border/60 bg-muted/20">
                    <div className="flex justify-between items-start font-bold">
                      <span className="truncate max-w-[140px] text-foreground">{c.title}</span>
                      <span className="text-leaf shrink-0 bg-eco-soft px-1.5 py-0.5 rounded-md text-[9px] font-bold">
                        +{c.points} pts
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-tight">{c.description}</p>
                    
                    {/* Progress slider bar */}
                    <div className="pt-1.5 space-y-1">
                      <div className="flex justify-between text-[9px] text-muted-foreground">
                        <span>Progress: {c.progress}/{c.targetQuantity}</span>
                        <span>{percent}%</span>
                      </div>
                      <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-eco-gradient h-full transition-all duration-500 rounded-full"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center text-[9px] text-muted-foreground pt-1 border-t border-border/40 mt-1">
                      <span className="capitalize">Sector: {c.sector}</span>
                      <span>{c.daysRemaining} days left</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* UPCOMING EVENTS */}
          <div className="surface-card p-4 space-y-3">
            <h3 className="font-display font-bold text-sm flex items-center gap-1.5 text-foreground">
              <Calendar className="h-4 w-4 text-leaf" /> Upcoming Events
            </h3>
            
            <div className="space-y-3">
              {snap.events.slice(0, 2).map((e) => {
                const joined = e.volunteers.includes(user.id);
                return (
                  <div key={e.id} className="text-xs space-y-2 p-2.5 rounded-xl border border-border bg-card">
                    <div className="h-20 rounded-lg overflow-hidden bg-muted">
                      <img src={e.imageUrl} alt={e.title} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-foreground leading-tight">{e.title}</h4>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{e.location}</p>
                    </div>
                    <div className="flex items-center justify-between text-[9px] text-muted-foreground pt-1">
                      <span>{e.date} · {e.time}</span>
                      <span>{e.volunteers.length} attending</span>
                    </div>
                    
                    <Button
                      size="sm"
                      onClick={() => {
                        if (joined) {
                          store.leaveEvent(e.id);
                          toast.info("Unregistered from event.");
                        } else {
                          store.joinEvent(e.id);
                          toast.success("Successfully registered for event!");
                        }
                      }}
                      className={`w-full text-[10px] h-7 rounded-lg ${
                        joined ? "bg-muted text-muted-foreground hover:bg-muted/80" : "bg-eco-soft text-leaf hover:bg-leaf hover:text-white"
                      }`}
                    >
                      {joined ? "Cancel Registration" : "Join Event"}
                    </Button>
                  </div>
                );
              })}
            </div>
            
            <Button asChild size="sm" variant="outline" className="w-full text-xs h-8 rounded-xl">
              <Link to="/events">View All Events</Link>
            </Button>
          </div>

          {/* TRENDING TOPICS */}
          <div className="surface-card p-4 space-y-3">
            <h3 className="font-display font-bold text-sm flex items-center gap-1.5 text-foreground">
              <TrendingUp className="h-4 w-4 text-leaf" /> Trending Topics
            </h3>
            
            <div className="space-y-2.5 text-xs">
              {[
                { tag: "#PlasticRecycling", count: "142 posts" },
                { tag: "#EWaste", count: "89 posts" },
                { tag: "#CleanCampus", count: "65 posts" },
                { tag: "#GoGreen", count: "48 posts" },
                { tag: "#EcoRecoveryHub", count: "34 posts" },
              ].map((t) => (
                <div key={t.tag} className="flex justify-between items-center group">
                  <span className="font-semibold text-leaf hover:underline cursor-pointer group-hover:text-leaf/80">{t.tag}</span>
                  <span className="text-[10px] text-muted-foreground">{t.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* TOP RECYCLERS MINI LIST */}
          <div className="surface-card p-4 space-y-3">
            <h3 className="font-display font-bold text-sm flex items-center gap-1.5 text-foreground">
              <Award className="h-4 w-4 text-leaf" /> Top Recyclers
            </h3>
            
            <div className="space-y-2 text-xs">
              {[
                { rank: 1, name: "Afia Mensah", pts: "9,240", badge: "🥇" },
                { rank: 2, name: "Kwame Opoku", pts: "8,110", badge: "🥈" },
                { rank: 3, name: "Nana Amankwah", pts: "7,320", badge: "🥉" }
              ].map((r) => (
                <div key={r.rank} className="flex items-center justify-between py-1 border-b border-border/40 last:border-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-muted-foreground w-4">{r.rank}</span>
                    <span className="font-medium text-foreground">{r.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-muted-foreground font-semibold">{r.pts} pts</span>
                    <span>{r.badge}</span>
                  </div>
                </div>
              ))}
            </div>
            
            <Button asChild size="sm" variant="outline" className="w-full text-xs h-8 rounded-xl">
              <Link to="/leaderboard">Open Leaderboard</Link>
            </Button>
          </div>

        </aside>
      </div>
    </PageContainer>
  );
}

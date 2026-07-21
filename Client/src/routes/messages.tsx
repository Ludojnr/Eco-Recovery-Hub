import { createFileRoute } from "@tanstack/react-router";
import { PageContainer, RequireUser } from "@/components/layout";
import { store, useUser } from "@/lib/mock-store";
import { UserAvatar } from "@/routes/settings";
import { useState, useSyncExternalStore, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Send,
  MessageSquare,
  Search,
  CheckCircle,
  FileImage,
  Paperclip,
  X,
  User,
  PlusCircle,
  Image,
  Bell
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/messages")({
  head: () => ({ meta: [{ title: "Messages — Eco-Recovery Hub" }] }),
  component: () => (
    <RequireUser>
      <MessagesHandler />
    </RequireUser>
  ),
});

function MessagesHandler() {
  const snap = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
  const currentUser = useUser();
  const user = snap.user ?? currentUser;

  if (!user) return null;

  if (user.role === "Admin") {
    return <AdminChatDashboard snap={snap} user={user} />;
  }
  return <UserChatPanel snap={snap} user={user} />;
}

// Helper to format timestamps nicely
function formatTime(isoString: string) {
  try {
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return "Just now";
  }
}

// ----------------------------------------------------
// USER CHAT VIEW
// ----------------------------------------------------
function UserChatPanel({ snap, user }: { snap: any; user: any }) {
  const [text, setText] = useState("");
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Retrieve user's conversation with admin, or mock a blank one
  let chat = snap.chats.find((c: any) => c.userId === user.id);
  if (!chat) {
    chat = {
      userId: user.id,
      userName: user.fullName,
      status: "active",
      messages: [
        {
          id: "welcome",
          senderId: "admin-system",
          senderName: "Eco-Recovery-Hub Support",
          text: "Hello! Welcome to Eco-Recovery-Hub Direct Chat Support. How can our team assist you today?",
          timestamp: new Date().toISOString(),
        }
      ]
    };
  }

  // Clear user's unread count when viewing
  useEffect(() => {
    store.clearUnreadCount(user.id, false);
  }, [chat.messages.length]);

  // Scroll to bottom when message arrives
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat.messages.length]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    store.sendMessage(user.id, text.trim());
    setText("");
  };

  const handleAttachScan = (scan: any) => {
    store.sendMessage(user.id, `Attached Material Reference: ${scan.item}`, {
      url: scan.imageUrl || "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=400",
      name: scan.item,
      isImage: true,
    });
    setShowAttachMenu(false);
    toast.success(`Attached photo of ${scan.item} to chat!`);
  };

  // Get user's approved/pending scans for attachment selection
  const userScans = snap.scans.filter((s: any) => s.userId === user.id);

  return (
    <PageContainer>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <h1 className="font-display text-3xl font-bold">Help &amp; Direct Support</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Chat directly with Eco-Recovery-Hub administrators and logistics coordinators.</p>
          </div>
          {user.role === "User" && (
            <span className="text-xs bg-leaf/10 text-leaf border border-leaf/20 rounded-full px-2 py-1 flex items-center gap-1 font-medium">
              <span className="h-2 w-2 rounded-full bg-leaf animate-ping" /> Support Live
            </span>
          )}
        </div>

        <div className="mt-6 grid md:grid-cols-[1fr_280px] gap-6 surface-card overflow-hidden h-[550px] border border-border">
          {/* Chat Stream Panel */}
          <div className="flex flex-col h-full bg-muted/5">
            {/* Thread Header */}
            <div className="p-4 border-b bg-background flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-eco-gradient text-eco-foreground font-bold text-sm">
                A
              </div>
              <div>
                <div className="font-semibold text-sm">Eco-Recovery Hub Admin Support</div>
                <div className="text-xs text-muted-foreground">Typically replies in a few minutes</div>
              </div>
            </div>

            {/* Message list */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {chat.messages.map((m: any) => {
                const isMe = m.senderId === user.id;
                return (
                  <div key={m.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                    <div className={`flex max-w-[75%] flex-col ${isMe ? "items-end" : "items-start"} space-y-2`}>
                      <div className={`text-[10px] px-1 ${isMe ? "text-right text-muted-foreground" : "text-left text-muted-foreground"}`}>
                        {m.senderName} · {formatTime(m.timestamp)}
                      </div>
                      <div className={`rounded-3xl px-4 py-3 text-sm leading-relaxed ${
                        isMe 
                          ? "bg-eco-gradient text-white shadow-[0_8px_30px_-14px_rgba(16,185,129,0.55)] rounded-br-none" 
                          : "bg-muted/90 text-foreground border border-border shadow-sm rounded-bl-none"
                      }`}>
                        {m.text}
                        {m.fileUrl && (
                          <div className="mt-3 overflow-hidden rounded-2xl border border-border/80 bg-muted">
                            {m.isImage ? (
                              <img src={m.fileUrl} alt={m.fileName} className="h-28 w-full object-cover" />
                            ) : (
                              <div className="p-2 flex items-center gap-2 text-xs text-muted-foreground">
                                <Paperclip className="h-4 w-4 text-leaf" />
                                <span className="truncate">{m.fileName}</span>
                              </div>
                            )}
                            <div className="p-2 text-[10px] text-muted-foreground border-t bg-background text-center font-semibold">
                              {m.fileName}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form className="p-3 bg-background border-t border-border flex gap-2 relative items-center" onSubmit={handleSend}>
              <button
                type="button"
                onClick={() => setShowAttachMenu((s) => !s)}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full hover:bg-muted text-muted-foreground transition-colors"
                title="Attach photo of scanned material"
              >
                <Paperclip className="h-5 w-5" />
              </button>

              <Input 
                value={text} 
                onChange={(e) => setText(e.target.value)} 
                placeholder="Write your support inquiry or logistics query..." 
                className="text-sm shadow-none border-border"
              />
              <Button type="submit" className="bg-eco-gradient text-eco-foreground px-4 shrink-0">
                <Send className="h-4 w-4" />
              </Button>

              {/* Attach Scanned Material Panel */}
              {showAttachMenu && (
                <div className="absolute bottom-16 left-3 w-72 bg-popover text-popover-foreground border shadow-lg rounded-xl p-3 z-50 animate-in fade-in slide-in-from-bottom-2 duration-150">
                  <div className="flex justify-between items-center border-b pb-2 mb-2">
                    <span className="font-semibold text-xs text-foreground">Attach Material Image</span>
                    <button type="button" onClick={() => setShowAttachMenu(false)} className="text-muted-foreground hover:text-foreground">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  {userScans.length === 0 ? (
                    <div className="text-center py-6 text-xs text-muted-foreground">
                      No scanned materials available. Scan items first to attach them!
                    </div>
                  ) : (
                    <div className="max-h-40 overflow-y-auto space-y-1">
                      {userScans.map((s: any) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => handleAttachScan(s)}
                          className="w-full text-left p-1.5 hover:bg-muted rounded-lg text-xs flex items-center gap-2 transition-colors border"
                        >
                          <div className="h-8 w-8 rounded bg-muted overflow-hidden flex items-center justify-center shrink-0">
                            {s.imageUrl ? (
                              <img src={s.imageUrl} alt={s.item} className="h-full w-full object-cover" />
                            ) : (
                              <span>📦</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate text-foreground">{s.item}</div>
                            <div className="text-[10px] text-muted-foreground uppercase">{s.sector}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </form>
          </div>

          {/* Right Sidebar Details */}
          <div className="hidden md:block p-4 border-l border-border bg-background space-y-6">
            <div>
              <h3 className="font-display font-semibold text-sm">Direct Support Guide</h3>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                Eco-Recovery-Hub Support coordinates with recycling operations. Send us chat inquiries about:
              </p>
              <ul className="text-xs mt-3 space-y-2 list-disc pl-4 text-muted-foreground">
                <li>KYC Verification statuses</li>
                <li>Material rejection issues</li>
                <li>Logistics and driver updates for pickup collections</li>
                <li>Points disbursement anomalies</li>
              </ul>
            </div>
            
            <div className="border border-dashed border-border rounded-xl p-3 bg-muted/10">
              <h4 className="font-semibold text-xs text-leaf">Attach Material Tip</h4>
              <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">
                Click the paperclip attachment icon to link images of materials you previously scanned. This allows administrators to review quality issues quickly.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

// ----------------------------------------------------
// ADMIN SUPPORT DASHBOARD
// ----------------------------------------------------
function AdminChatDashboard({ snap, user }: { snap: any; user: any }) {
  const [activeChatId, setActiveChatId] = useState<string | null>(snap.chats[0]?.userId || null);
  const [adminText, setAdminText] = useState("");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "resolved">("active");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeChat = snap.chats.find((c: any) => c.userId === activeChatId);

  // Clear admin's unread counts when reading
  useEffect(() => {
    if (activeChatId) {
      store.clearUnreadCount(activeChatId, true);
    }
  }, [activeChatId, activeChat?.messages.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeChat?.messages.length]);

  const handleAdminSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeChatId || !adminText.trim()) return;
    store.sendMessage(activeChatId, adminText.trim());
    setAdminText("");
  };

  const sendQuickReply = (text: string) => {
    if (!activeChatId) return;
    store.sendMessage(activeChatId, text);
    toast.success("Quick reply sent!");
  };

  // Predefined Quick Replies for Admins
  const quickReplies = [
    "Your pickup request has been scheduled successfully.",
    "We have reviewed and verified your organization's KYC profile.",
    "Your recovery points have been approved and added to your balance.",
    "Could you please upload a clearer image of the material labels?",
    "A logistics driver will contact you at your phone number shortly."
  ];

  // Filters the conversation list
  const filteredChats = snap.chats.filter((c: any) => {
    const matchesSearch = c.userName.toLowerCase().includes(search.toLowerCase()) || 
                          c.userEmail.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === "all" ? true : c.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <PageContainer>
      <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
        <div>
          <h1 className="font-display text-4xl font-bold">Admin Support Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Communicate with platform users, review attached items, and handle logistics queries.</p>
        </div>
      </div>

      <div className="grid md:grid-cols-[300px_1fr] border border-border h-[600px] rounded-xl overflow-hidden shadow-sm">
        
        {/* Left Side: Conversation list */}
        <div className="border-r border-border bg-background flex flex-col h-full">
          {/* List Search & Filter Header */}
          <div className="p-3 border-b space-y-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                className="pl-8 text-xs h-8 shadow-none"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <div className="flex gap-1">
              {["active", "resolved", "all"].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status as any)}
                  className={`flex-1 py-1 text-[10px] font-bold uppercase rounded border transition-colors ${
                    filterStatus === status 
                      ? "bg-leaf text-white border-transparent"
                      : "bg-muted/30 text-muted-foreground border-border hover:bg-muted"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Conversations stream */}
          <div className="flex-1 overflow-y-auto divide-y divide-border/60">
            {filteredChats.length === 0 ? (
              <div className="text-center py-8 text-xs text-muted-foreground">
                No chats match filter criteria.
              </div>
            ) : (
              filteredChats.map((c: any) => {
                const isActive = c.userId === activeChatId;
                const lastMsg = c.messages[c.messages.length - 1];
                return (
                  <button
                    key={c.userId}
                    onClick={() => setActiveChatId(c.userId)}
                    className={`w-full text-left p-3.5 transition-colors flex items-start gap-2.5 hover:bg-muted/10 ${
                      isActive ? "bg-eco-soft/30 border-l-4 border-leaf" : ""
                    }`}
                  >
                    <UserAvatar user={{ fullName: c.userName, avatar: snap.users.find((u: any) => u.id === c.userId)?.avatar, role: "User" }} size="sm" className="rounded-full shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline">
                        <div className="font-bold text-xs truncate text-foreground">{c.userName}</div>
                        <div className="text-[9px] text-muted-foreground shrink-0">{formatTime(c.lastMessageAt)}</div>
                      </div>
                      <div className="text-xs text-muted-foreground truncate mt-0.5">{lastMsg ? lastMsg.text : "No messages"}</div>
                      
                      <div className="flex gap-1.5 mt-1">
                        {c.status === "resolved" && (
                          <span className="text-[9px] bg-eco-soft text-leaf px-1.5 rounded font-semibold font-sans">Resolved</span>
                        )}
                        {c.adminUnreadCount > 0 && (
                          <span className="text-[9px] bg-destructive text-white px-1.5 rounded font-bold font-mono">
                            {c.adminUnreadCount} New
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Active Chat Panel */}
        <div className="flex flex-col h-full bg-muted/5">
          {activeChat ? (
            <>
              {/* Header with resolve button */}
              <div className="p-4 border-b bg-background flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <UserAvatar user={{ fullName: activeChat.userName, avatar: snap.users.find((u: any) => u.id === activeChat.userId)?.avatar, role: "User" }} size="sm" className="rounded-full" />
                  <div>
                    <div className="font-bold text-sm flex items-center gap-1.5">
                      {activeChat.userName}
                      <span className="text-xs text-muted-foreground font-normal">({activeChat.userEmail})</span>
                    </div>
                    <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                      Status: <span className={`font-semibold capitalize ${activeChat.status === "active" ? "text-leaf" : "text-muted-foreground"}`}>{activeChat.status}</span>
                    </div>
                  </div>
                </div>

                {activeChat.status === "active" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      store.markChatResolved(activeChat.userId);
                      toast.success(`Marked conversation with ${activeChat.userName} as resolved.`);
                    }}
                    className="border-leaf text-leaf hover:bg-eco-soft/20 font-semibold"
                  >
                    <CheckCircle className="h-3.5 w-3.5 mr-1" /> Mark Resolved
                  </Button>
                )}
              </div>

              {/* Chat messages */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {activeChat.messages.map((m: any) => {
                  const isMe = m.senderId === user.id || m.senderId === "admin";
                  return (
                    <div key={m.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                      <div className={`flex max-w-[75%] flex-col ${isMe ? "items-end" : "items-start"} space-y-2`}>
                        <div className={`text-[10px] px-1 ${isMe ? "text-right text-foreground/80" : "text-left text-muted-foreground"}`}>
                          {m.senderName} · {formatTime(m.timestamp)}
                        </div>
                        <div className={`rounded-3xl px-4 py-3 text-sm leading-relaxed ${
                          isMe 
                            ? "bg-eco-gradient text-white shadow-[0_8px_30px_-14px_rgba(16,185,129,0.55)] rounded-br-none" 
                            : "bg-muted/90 text-foreground border border-border shadow-sm rounded-bl-none"
                        }`}>
                          {m.text}
                          {m.fileUrl && (
                            <div className="mt-3 overflow-hidden rounded-2xl border border-border/80 bg-muted">
                              {m.isImage ? (
                                <img src={m.fileUrl} alt={m.fileName} className="h-28 w-full object-cover" />
                              ) : (
                                <div className="p-2 flex items-center gap-2 text-xs text-muted-foreground">
                                  <Paperclip className="h-4 w-4 text-leaf" />
                                  <span className="truncate">{m.fileName}</span>
                                </div>
                              )}
                              <div className="p-2 text-[10px] text-muted-foreground border-t bg-background text-center font-semibold">
                                {m.fileName}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Replies Panel */}
              <div className="px-4 py-2 bg-background border-t border-border flex flex-wrap gap-1 items-center">
                <span className="text-[10px] text-muted-foreground uppercase font-bold mr-1.5">Quick Replies:</span>
                {quickReplies.map((reply, i) => (
                  <button
                    key={i}
                    onClick={() => sendQuickReply(reply)}
                    className="text-[10px] bg-muted hover:bg-eco-soft hover:text-leaf transition-all border border-border px-2 py-0.5 rounded-full text-left truncate max-w-[180px]"
                    title={reply}
                  >
                    {reply}
                  </button>
                ))}
              </div>

              {/* Message Entry box */}
              <form className="p-3 bg-background border-t border-border flex gap-2" onSubmit={handleAdminSend}>
                <Input
                  value={adminText}
                  onChange={(e) => setAdminText(e.target.value)}
                  placeholder={`Reply to ${activeChat.userName}...`}
                  className="text-sm shadow-none"
                />
                <Button type="submit" className="bg-eco-gradient text-eco-foreground shrink-0 px-4">
                  <Send className="h-4 w-4" /> Send
                </Button>
              </form>
            </>
          ) : (
            <div className="flex-1 grid place-items-center text-muted-foreground text-sm">
              <div className="text-center">
                <MessageSquare className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
                Select a conversation from the sidebar to begin support.
              </div>
            </div>
          )}
        </div>

      </div>
    </PageContainer>
  );
}

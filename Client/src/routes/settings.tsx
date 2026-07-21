import { createFileRoute } from "@tanstack/react-router";
import { PageContainer, RequireUser } from "@/components/layout";
import { store, useUser } from "@/lib/mock-store";
import { useState, useRef, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Shield, User, Landmark, Camera, Upload, X, Leaf, RefreshCw } from "lucide-react";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — Eco-Recovery Hub" }] }),
  component: () => <RequireUser><Settings /></RequireUser>,
});

// -------------------------------------------------------
// Avatar component — shared by card & navbar
// -------------------------------------------------------
export function UserAvatar({
  user,
  size = "md",
  className = "",
}: {
  user: { fullName: string; avatar?: string; role?: string };
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  const sizeMap = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-16 w-16 text-2xl",
    xl: "h-24 w-24 text-4xl",
  };

  if (user.role === "Admin") {
    return (
      <span
        className={`${sizeMap[size]} grid place-items-center rounded-2xl bg-eco-gradient text-eco-foreground shrink-0 shadow-sm ${className}`}
      >
        <Leaf className="h-[45%] w-[45%]" strokeWidth={2.2} />
      </span>
    );
  }

  if (user.avatar) {
    return (
      <img
        src={user.avatar}
        alt={user.fullName}
        className={`${sizeMap[size]} rounded-2xl object-cover shrink-0 shadow-sm border border-border ${className}`}
      />
    );
  }

  return (
    <span
      className={`${sizeMap[size]} grid place-items-center rounded-2xl bg-eco-gradient text-eco-foreground font-bold shrink-0 shadow-sm ${className}`}
    >
      {user.fullName.charAt(0).toUpperCase()}
    </span>
  );
}

// -------------------------------------------------------
// Photo Picker modal
// -------------------------------------------------------
function PhotoPicker({ onClose, onSave }: { onClose: () => void; onSave: (dataUrl: string) => void }) {
  const [mode, setMode] = useState<"choose" | "camera">("choose");
  const [preview, setPreview] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const startCamera = useCallback(async () => {
    try {
      setCameraError(null);
      const ms = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      setStream(ms);
      if (videoRef.current) {
        videoRef.current.srcObject = ms;
        videoRef.current.play();
      }
      setMode("camera");
    } catch {
      setCameraError("Camera access denied or not available on this device.");
    }
  }, []);

  const stopCamera = useCallback(() => {
    stream?.getTracks().forEach((t) => t.stop());
    setStream(null);
  }, [stream]);

  const takeSnapshot = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const v = videoRef.current;
    const c = canvasRef.current;
    c.width = v.videoWidth;
    c.height = v.videoHeight;
    c.getContext("2d")!.drawImage(v, 0, 0);
    const dataUrl = c.toDataURL("image/jpeg", 0.85);
    setPreview(dataUrl);
    stopCamera();
    setMode("choose");
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast.error("Please select an image file.");
    if (file.size > 5 * 1024 * 1024) return toast.error("Image must be under 5 MB.");
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-background border border-border rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="font-display font-semibold text-lg">Update Profile Photo</h2>
          <button onClick={handleClose} className="grid h-8 w-8 place-items-center rounded-full hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Camera live view */}
          {mode === "camera" && (
            <div className="relative rounded-xl overflow-hidden bg-black aspect-video">
              <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
              <canvas ref={canvasRef} className="hidden" />
              <button
                onClick={takeSnapshot}
                className="absolute bottom-4 left-1/2 -translate-x-1/2 h-12 w-12 rounded-full bg-white border-4 border-eco shadow-lg hover:scale-105 transition-transform grid place-items-center"
                aria-label="Take photo"
              >
                <Camera className="h-5 w-5 text-eco" />
              </button>
              <button
                onClick={() => { stopCamera(); setMode("choose"); }}
                className="absolute top-3 right-3 h-8 w-8 rounded-full bg-black/50 text-white grid place-items-center hover:bg-black/70"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Preview */}
          {preview && mode !== "camera" && (
            <div className="flex flex-col items-center gap-3">
              <img src={preview} alt="Preview" className="h-40 w-40 rounded-2xl object-cover border-2 border-eco shadow-lg" />
              <button
                onClick={() => setPreview(null)}
                className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1"
              >
                <RefreshCw className="h-3 w-3" /> Choose a different photo
              </button>
            </div>
          )}

          {/* Action buttons */}
          {!preview && mode !== "camera" && (
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => fileRef.current?.click()}
                className="flex flex-col items-center gap-2 rounded-xl border border-border bg-muted/50 p-5 hover:border-eco hover:bg-eco-soft transition-colors"
              >
                <Upload className="h-7 w-7 text-leaf" />
                <span className="text-sm font-medium">Upload photo</span>
                <span className="text-xs text-muted-foreground">JPG, PNG, WebP · max 5 MB</span>
              </button>
              <button
                onClick={startCamera}
                className="flex flex-col items-center gap-2 rounded-xl border border-border bg-muted/50 p-5 hover:border-eco hover:bg-eco-soft transition-colors"
              >
                <Camera className="h-7 w-7 text-leaf" />
                <span className="text-sm font-medium">Take a photo</span>
                <span className="text-xs text-muted-foreground">Use your device camera</span>
              </button>
            </div>
          )}

          {cameraError && (
            <p className="text-xs text-destructive bg-destructive/10 rounded-lg px-3 py-2">{cameraError}</p>
          )}

          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        </div>

        {/* Footer */}
        <div className="flex gap-2 px-5 py-4 border-t border-border">
          <Button variant="outline" className="flex-1" onClick={handleClose}>Cancel</Button>
          <Button
            className="flex-1 bg-eco-gradient text-eco-foreground"
            disabled={!preview}
            onClick={() => { if (preview) { onSave(preview); handleClose(); } }}
          >
            Save Photo
          </Button>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------
// Main Settings Page
// -------------------------------------------------------
function Settings() {
  const user = useUser()!;
  const [showPhotoPicker, setShowPhotoPicker] = useState(false);

  const [indForm, setIndForm] = useState({
    fullName: user.fullName,
    phone: user.phone,
    institution: user.institution,
    location: user.location,
  });

  const [instForm, setInstForm] = useState({
    orgName: user.orgName || user.institution || "",
    orgType: user.orgType || "University",
    orgLocation: user.orgLocation || user.location || "",
    contactPerson: user.contactPerson || user.fullName || "",
    orgEmail: user.orgEmail || user.email || "",
    orgPhone: user.orgPhone || user.phone || "",
  });

  const handleIndSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    store.updateProfile({ fullName: indForm.fullName, phone: indForm.phone, institution: indForm.institution, location: indForm.location });
    toast.success("Profile settings updated!");
  };

  const handleInstSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    store.updateProfile({
      fullName: instForm.contactPerson,
      phone: instForm.orgPhone,
      institution: instForm.orgName,
      location: instForm.orgLocation,
      orgName: instForm.orgName,
      orgType: instForm.orgType,
      orgLocation: instForm.orgLocation,
      contactPerson: instForm.contactPerson,
      orgEmail: instForm.orgEmail,
      orgPhone: instForm.orgPhone,
    });
    toast.success("Institutional organization profile updated!");
  };

  const handleSavePhoto = (dataUrl: string) => {
    store.updateProfile({ avatar: dataUrl });
    toast.success("Profile photo updated!");
  };

  const handleRemovePhoto = () => {
    store.updateProfile({ avatar: undefined });
    toast.success("Profile photo removed.");
  };

  const isInst = user.accountType === "Institutional";
  const isAdmin = user.role === "Admin";

  return (
    <PageContainer>
      {showPhotoPicker && (
        <PhotoPicker
          onClose={() => setShowPhotoPicker(false)}
          onSave={handleSavePhoto}
        />
      )}

      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h1 className="font-display text-4xl font-bold">Profile Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your account information, profile photo, and personal details.</p>
        </div>

        {/* User Card with Avatar */}
        <div className="surface-card p-6 flex flex-col sm:flex-row items-center gap-6">
          {/* Avatar section */}
          <div className="relative shrink-0 group">
            <UserAvatar user={user} size="xl" />
            {!isAdmin && (
              <button
                onClick={() => setShowPhotoPicker(true)}
                className="absolute inset-0 rounded-2xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 text-white text-xs font-medium"
                aria-label="Change photo"
              >
                <Camera className="h-6 w-6" />
                Change
              </button>
            )}
          </div>

          <div className="flex-1 text-center sm:text-left">
            <h2 className="font-display text-xl font-bold flex flex-wrap justify-center sm:justify-start items-center gap-2">
              {user.fullName}
              <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                isInst ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"
              }`}>
                {user.accountType}
              </span>
            </h2>
            <div className="text-xs text-muted-foreground mt-1">
              Role: <span className="font-semibold text-foreground uppercase">{user.role}</span> · Registered since {new Date(user.memberSince).toLocaleDateString()}
            </div>

            {/* Photo actions */}
            {!isAdmin && (
              <div className="mt-3 flex flex-wrap gap-2 justify-center sm:justify-start">
                <Button size="sm" variant="outline" onClick={() => setShowPhotoPicker(true)} className="text-xs h-7 gap-1.5">
                  <Upload className="h-3 w-3" /> {user.avatar ? "Change Photo" : "Add Photo"}
                </Button>
                {user.avatar && (
                  <Button size="sm" variant="ghost" onClick={handleRemovePhoto} className="text-xs h-7 text-destructive hover:text-destructive gap-1.5">
                    <X className="h-3 w-3" /> Remove
                  </Button>
                )}
              </div>
            )}
            {isAdmin && (
              <p className="mt-2 text-xs text-muted-foreground italic">Admin accounts use the platform logo as their avatar.</p>
            )}
          </div>
        </div>

        {/* Form Panel */}
        <div className="surface-card p-6">
          <h3 className="font-display font-semibold text-lg flex items-center gap-2 mb-6">
            {isInst ? <Landmark className="h-5 w-5 text-leaf" /> : <User className="h-5 w-5 text-leaf" />}
            {isInst ? "Institutional Profile Details" : "Personal Profile Details"}
          </h3>

          {!isInst ? (
            <form className="space-y-4" onSubmit={handleIndSubmit}>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Full Name</Label>
                  <Input value={indForm.fullName} onChange={(e) => setIndForm({ ...indForm, fullName: e.target.value })} required />
                </div>
                <div className="space-y-1.5">
                  <Label>Email (Non-editable)</Label>
                  <Input value={user.email} disabled className="bg-muted/50" />
                </div>
                <div className="space-y-1.5">
                  <Label>Phone Number</Label>
                  <Input value={indForm.phone} onChange={(e) => setIndForm({ ...indForm, phone: e.target.value })} required />
                </div>
                <div className="space-y-1.5">
                  <Label>Affiliated Institution / School</Label>
                  <Input value={indForm.institution} onChange={(e) => setIndForm({ ...indForm, institution: e.target.value })} />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label>General Location / Area</Label>
                  <Input value={indForm.location} onChange={(e) => setIndForm({ ...indForm, location: e.target.value })} required />
                </div>
              </div>
              <Button type="submit" className="bg-eco-gradient text-eco-foreground">Save Changes</Button>
            </form>
          ) : (
            <form className="space-y-4" onSubmit={handleInstSubmit}>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Organization Name</Label>
                  <Input value={instForm.orgName} onChange={(e) => setInstForm({ ...instForm, orgName: e.target.value })} required />
                </div>
                <div className="space-y-1.5">
                  <Label>Organization Type</Label>
                  <select
                    value={instForm.orgType}
                    onChange={(e) => setInstForm({ ...instForm, orgType: e.target.value })}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    required
                  >
                    <option value="University">University</option>
                    <option value="School">School</option>
                    <option value="College">College</option>
                    <option value="Company">Company</option>
                    <option value="NGO">NGO (Non-Governmental Org)</option>
                    <option value="Government Agency">Government Agency</option>
                    <option value="Environmental Organization">Environmental Organization</option>
                    <option value="Corporate Recycling Partner">Corporate Recycling Partner</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label>Contact Person Name</Label>
                  <Input value={instForm.contactPerson} onChange={(e) => setInstForm({ ...instForm, contactPerson: e.target.value })} required />
                </div>
                <div className="space-y-1.5">
                  <Label>Primary Registration Email (Non-editable)</Label>
                  <Input value={user.email} disabled className="bg-muted/50" />
                </div>
                <div className="space-y-1.5">
                  <Label>Organization Email</Label>
                  <Input type="email" value={instForm.orgEmail} onChange={(e) => setInstForm({ ...instForm, orgEmail: e.target.value })} required />
                </div>
                <div className="space-y-1.5">
                  <Label>Organization Phone Number</Label>
                  <Input value={instForm.orgPhone} onChange={(e) => setInstForm({ ...instForm, orgPhone: e.target.value })} required />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label>Campus / Office Location Address</Label>
                  <Input value={instForm.orgLocation} onChange={(e) => setInstForm({ ...instForm, orgLocation: e.target.value })} required />
                </div>
              </div>
              <Button type="submit" className="bg-eco-gradient text-eco-foreground">Save Organization Profile</Button>
            </form>
          )}
        </div>
      </div>
    </PageContainer>
  );
}

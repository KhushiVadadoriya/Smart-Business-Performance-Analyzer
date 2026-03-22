import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";

import {
  getUserProfile,
  uploadUserProfilePicture,
  updateUserProfile,
  type ProfileUpdatePayload,
  type UserProfile,
} from "../../api/auth";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { useAuthStore } from "../../store/authStore";

const BUSINESS_TYPES = [
  "E-Commerce",
  "SaaS",
  "Restaurant/Cafe",
  "Agency/Service",
  "Other",
] as const;

type ProfileFormState = {
  full_name: string;
  business_name: string;
  business_type: string;
};

function toFormState(user: UserProfile): ProfileFormState {
  return {
    full_name: user.full_name ?? "",
    business_name: user.business_name ?? "",
    business_type: user.business_type ?? "",
  };
}

function toPayload(form: ProfileFormState): ProfileUpdatePayload {
  return {
    full_name: form.full_name.trim() || null,
    business_name: form.business_name.trim() || null,
    business_type: form.business_type.trim() || null,
  };
}

export function ProfilePage() {
  const [searchParams] = useSearchParams();
  const onboarding = searchParams.get("onboarding") === "1";

  const cachedUser = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  const [profile, setProfile] = useState<UserProfile | null>(cachedUser);
  const [form, setForm] = useState<ProfileFormState>({
    full_name: "",
    business_name: "",
    business_type: "",
  });
  const [selectedPicture, setSelectedPicture] = useState<File | null>(null);
  const [picturePreviewUrl, setPicturePreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(!cachedUser);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(onboarding);

  useEffect(() => {
    let mounted = true;

    async function loadProfile() {
      setLoading(true);
      try {
        const data = await getUserProfile();
        if (!mounted) return;
        setProfile(data);
        setForm(toFormState(data));
        setUser(data);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    if (cachedUser) {
      setProfile(cachedUser);
      setForm(toFormState(cachedUser));
      setLoading(false);
      return;
    }

    void loadProfile();

    return () => {
      mounted = false;
    };
  }, [cachedUser, setUser]);

  useEffect(() => {
    if (!selectedPicture) {
      setPicturePreviewUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(selectedPicture);
    setPicturePreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedPicture]);

  const initials = useMemo(() => {
    const source = profile?.full_name?.trim() || profile?.email || "U";
    return source.slice(0, 2).toUpperCase();
  }, [profile]);

  function onChange<K extends keyof ProfileFormState>(key: K, value: ProfileFormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      let latestProfile = profile;

      if (selectedPicture) {
        latestProfile = await uploadUserProfilePicture(selectedPicture);
      }

      const updated = await updateUserProfile(toPayload(form));
      latestProfile = {
        ...latestProfile,
        ...updated,
      };

      setProfile(latestProfile);
      setUser(latestProfile);
      setEditing(false);
      setSelectedPicture(null);
      toast.success("Profile updated.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <Card>
        <div className="text-sm text-[var(--sbpa-dark)]/70">Loading profile...</div>
      </Card>
    );
  }

  if (!profile) {
    return (
      <Card>
        <div className="text-sm text-[var(--sbpa-dark)]/70">Unable to load profile right now.</div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="flex items-center justify-between gap-4">
        <div>
          <div className="text-lg font-black text-[var(--sbpa-dark)]">My Profile</div>
          <div className="text-sm text-[var(--sbpa-dark)]/60">
            Manage your account and business context.
          </div>
        </div>
        {!editing ? (
          <Button onClick={() => setEditing(true)}>Edit Profile</Button>
        ) : (
          <Button variant="secondary" onClick={() => setEditing(false)}>
            Cancel
          </Button>
        )}
      </Card>

      {onboarding ? (
        <Card className="border-[var(--sbpa-primary)]/30">
          <div className="text-sm font-bold text-[var(--sbpa-dark)]">Complete your profile setup</div>
          <div className="mt-1 text-sm text-[var(--sbpa-dark)]/65">
            Add your business details to continue with tailored analysis.
          </div>
        </Card>
      ) : null}

      {!editing ? (
        <Card>
          <div className="flex items-center gap-4">
            {profile.profile_picture_url ? (
              <img
                src={profile.profile_picture_url}
                alt="Profile"
                className="size-14 rounded-2xl object-cover"
              />
            ) : (
              <div className="grid size-14 place-items-center rounded-2xl bg-[var(--sbpa-primary)] text-sm font-black text-white">
                {initials}
              </div>
            )}
            <div>
              <div className="text-base font-black text-[var(--sbpa-dark)]">
                {profile.full_name || "Unnamed User"}
              </div>
              <div className="text-sm text-[var(--sbpa-dark)]/65">{profile.email}</div>
            </div>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <div className="text-xs font-semibold uppercase text-[var(--sbpa-dark)]/50">Business Name</div>
              <div className="mt-1 text-sm font-semibold text-[var(--sbpa-dark)]">
                {profile.business_name || "Not provided"}
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase text-[var(--sbpa-dark)]/50">Business Type</div>
              <div className="mt-1">
                <span className="inline-flex rounded-full bg-[var(--sbpa-primary)]/12 px-3 py-1 text-xs font-semibold text-[var(--sbpa-dark)]">
                  {profile.business_type || "Not set"}
                </span>
              </div>
            </div>
          </div>
        </Card>
      ) : (
        <Card>
          <form onSubmit={onSave} className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-[var(--sbpa-dark)]/70">Full Name</label>
              <input
                value={form.full_name}
                onChange={(e) => onChange("full_name", e.target.value)}
                className="mt-1 w-full rounded-2xl border border-[var(--sbpa-dark)]/10 bg-[var(--sbpa-card)] px-3 py-2 text-sm outline-none transition focus:border-[var(--sbpa-primary)]"
                placeholder="Jane Doe"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-[var(--sbpa-dark)]/70">Profile Picture</label>
              <input
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                onChange={(e) => setSelectedPicture(e.target.files?.[0] ?? null)}
                className="mt-1 w-full rounded-2xl border border-[var(--sbpa-dark)]/10 bg-[var(--sbpa-card)] px-3 py-2 text-sm outline-none transition focus:border-[var(--sbpa-primary)]"
              />
              <div className="mt-1 text-xs text-[var(--sbpa-dark)]/60">Allowed: JPG, PNG, WEBP (max 5MB)</div>

              {picturePreviewUrl ? (
                <img
                  src={picturePreviewUrl}
                  alt="Selected profile preview"
                  className="mt-2 size-16 rounded-xl object-cover"
                />
              ) : profile.profile_picture_url ? (
                <img
                  src={profile.profile_picture_url}
                  alt="Current profile"
                  className="mt-2 size-16 rounded-xl object-cover"
                />
              ) : null}
            </div>

            <div>
              <label className="text-sm font-semibold text-[var(--sbpa-dark)]/70">Business Name</label>
              <input
                value={form.business_name}
                onChange={(e) => onChange("business_name", e.target.value)}
                className="mt-1 w-full rounded-2xl border border-[var(--sbpa-dark)]/10 bg-[var(--sbpa-card)] px-3 py-2 text-sm outline-none transition focus:border-[var(--sbpa-primary)]"
                placeholder="Acme Foods"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-[var(--sbpa-dark)]/70">Business Type</label>
              <select
                value={form.business_type}
                onChange={(e) => onChange("business_type", e.target.value)}
                className="mt-1 w-full rounded-2xl border border-[var(--sbpa-dark)]/10 bg-[var(--sbpa-card)] px-3 py-2 text-sm outline-none transition focus:border-[var(--sbpa-primary)]"
              >
                <option value="">Select business type</option>
                {BUSINESS_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
}

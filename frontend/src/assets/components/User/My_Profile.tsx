import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../../services/api";
import route from "../../../utils/route";
import "../../../css/records.css";

export default function My_Profile() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<number | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (!raw) {
      navigate("/login");
      return;
    }
    const parsed = JSON.parse(raw) as {
      id?: number;
      user_name?: string;
      user_email?: string;
      name?: string;
      email?: string;
      avatar_url?: string | null;
    };
    const id = parsed.id;
    if (!id) {
      navigate("/login");
      return;
    }
    setUserId(id);
    setName(parsed.user_name ?? parsed.name ?? "");
    setEmail(parsed.user_email ?? parsed.email ?? "");
    setAvatarUrl(parsed.avatar_url ?? null);

    api
      .get<{ status: string; user: { name: string; email: string; avatar_url?: string | null } }>(
        route("user.show", { id }).toString(),
      )
      .then((res) => {
        if (res.data.status === "success" && res.data.user) {
          setName(res.data.user.name);
          setEmail(res.data.user.email);
          if (res.data.user.avatar_url) {
            setAvatarUrl(res.data.user.avatar_url);
          }
        }
      })
      .catch(() => {
        /* keep localStorage fallbacks */
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  const persistUserAvatar = (url: string | null) => {
    const raw = localStorage.getItem("user");
    if (!raw) return;
    const prev = JSON.parse(raw) as Record<string, unknown>;
    const next = { ...prev, avatar_url: url };
    localStorage.setItem("user", JSON.stringify(next));
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    setStatus(null);
    const form = new FormData();
    form.append("avatar", file);
    try {
      const res = await api.post<{ status: string; avatar_url?: string }>("/user/avatar", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data.status === "success" && res.data.avatar_url) {
        setAvatarUrl(res.data.avatar_url);
        persistUserAvatar(res.data.avatar_url);
        setStatus({ type: "success", message: "Profile photo updated." });
      }
    } catch {
      setStatus({ type: "error", message: "Could not upload photo. Try a smaller JPG or PNG." });
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
    setTimeout(() => setStatus(null), 4000);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (userId == null) return;

    if (!password || password.length < 6) {
      setStatus({ type: "error", message: "Password must be at least 6 characters." });
      return;
    }
    if (password !== passwordConfirmation) {
      setStatus({ type: "error", message: "Passwords do not match." });
      return;
    }

    try {
      const res = await api.put(route("user.update", { id: userId }).toString(), {
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });

      if (res.data.status === "success") {
        const raw = localStorage.getItem("user");
        const prev = raw ? JSON.parse(raw) : {};
        localStorage.setItem(
          "user",
          JSON.stringify({
            ...prev,
            user_name: name,
            user_email: email,
            name,
            email,
          }),
        );
        setPassword("");
        setPasswordConfirmation("");
        setStatus({ type: "success", message: "Password updated successfully." });
      } else {
        setStatus({ type: "error", message: "Could not update password." });
      }
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? String((err as { response?: { data?: { message?: string } } }).response?.data?.message ?? "")
          : "";
      setStatus({ type: "error", message: msg || "Request failed." });
    }

    setTimeout(() => setStatus(null), 5000);
  };

  if (loading) return <p>Loading profile...</p>;

  return (
    <main className="dashboard-main">
      <div className="records-container">
        <div className="header-left">
          <h2>Profile settings</h2>
        </div>

        <div className="return-right">
          <ul>
            <li>
              <Link to="/user_dashboard" className="return-link">
                Return
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {status && <div className={`form-message ${status.type}`}>{status.message}</div>}

      <div className="table-container profile-form-container">
        <div className="profile-form" style={{ maxWidth: "480px" }}>
          <div className="profile-avatar-wrap">
            <button
              type="button"
              className="profile-avatar-button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
              aria-label="Upload profile photo"
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt="" className="profile-avatar-img" />
              ) : (
                <span className="profile-avatar-placeholder">
                  {uploadingAvatar ? "…" : (name || "?").slice(0, 1).toUpperCase()}
                </span>
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={handleAvatarChange}
            />
            <p className="profile-avatar-hint">{uploadingAvatar ? "Uploading…" : "Tap the circle to upload a photo"}</p>
          </div>

          <div style={{ marginBottom: "1.25rem" }}>
            <label style={{ display: "block", fontWeight: 600, marginBottom: "0.35rem" }}>Full name</label>
            <input type="text" value={name} readOnly disabled className="profile-readonly" />
          </div>

          <div style={{ marginBottom: "1.75rem" }}>
            <label style={{ display: "block", fontWeight: 600, marginBottom: "0.35rem" }}>Email</label>
            <input type="email" value={email} readOnly disabled className="profile-readonly" />
          </div>

          <h3 style={{ fontSize: "1rem", marginBottom: "0.75rem" }}>Change password</h3>
          <form onSubmit={handleChangePassword}>
            <label style={{ display: "block", marginBottom: "0.75rem" }}>
              <span style={{ fontWeight: 600, display: "block", marginBottom: "0.35rem" }}>New password</span>
              <input
                type="password"
                name="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: "100%", padding: "0.65rem" }}
              />
            </label>
            <label style={{ display: "block", marginBottom: "1rem" }}>
              <span style={{ fontWeight: 600, display: "block", marginBottom: "0.35rem" }}>Confirm new password</span>
              <input
                type="password"
                name="password_confirmation"
                autoComplete="new-password"
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                style={{ width: "100%", padding: "0.65rem" }}
              />
            </label>
            <button type="submit" className="donation-button">
              Change password
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

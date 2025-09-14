import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import "./Profile.css";

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    mobile_number: "",
    bio: "",
    address: "",
    profile_image: null,
  });
  const [imagePreview, setImagePreview] = useState(null); // For preview
  const [errors, setErrors] = useState({});
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const headers = {
    Authorization: `Bearer ${user?.token}`,
    "Content-Type": "multipart/form-data",
  };

  const IMAGE_KEY = "profile_image_data";

  const fetchProfile = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/users/profile", {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      if (res.data.success) {
        setProfile(res.data.profile);
        setForm({
          first_name: res.data.profile.first_name || "",
          last_name: res.data.profile.last_name || "",
          mobile_number: res.data.profile.mobile_number || "",
          bio: res.data.profile.bio || "",
          address: res.data.profile.address || "",
          profile_image: null,
        });

        // Load image from localStorage if exists
        const storedImage = localStorage.getItem(IMAGE_KEY);
        if (storedImage) {
          setImagePreview(storedImage);
        } else if (res.data.profile.profile_image) {
          setImagePreview(res.data.profile.profile_image);
        }
      }
    } catch (err) {
      console.log("No profile yet:", err.response?.data);
    }
  };

  useEffect(() => {
    if (user?.token) fetchProfile();
  }, [user]);

  const handleChange = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: "" }));
  };

  const handleImageChange = (file) => {
    handleChange("profile_image", file);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        localStorage.setItem(IMAGE_KEY, reader.result); // Save to localStorage
      };
      reader.readAsDataURL(file);
    }
  };

  const validate = () => {
    let tempErrors = {};
    if (!form.first_name.trim()) tempErrors.first_name = "First name is required.";
    if (!form.last_name.trim()) tempErrors.last_name = "Last name is required.";
    if (!form.mobile_number.trim()) tempErrors.mobile_number = "Mobile number is required.";
    return tempErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setMsg("");
    try {
      const formData = new FormData();
      formData.append("email", user.email);
      for (const key in form) {
        if (form[key]) formData.append(key, form[key]);
      }

      if (profile) {
        await axios.put("http://localhost:5000/api/users/profile", formData, {
          headers,
        });
        setMsg("Profile updated successfully!");
      } else {
        await axios.post("http://localhost:5000/api/users/profile", formData, {
          headers,
        });
        setMsg("Profile created successfully!");
      }

      setEditing(false);
      fetchProfile();
    } catch (err) {
      setMsg(err.response?.data?.message || "Error saving profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-container">
      <h2>My Profile</h2>

      {msg && <p className="message">{msg}</p>}

      {!editing && profile ? (
        <div className="profile-card">
          <img
            src={
              imagePreview ||
              profile.profile_image ||
              `https://ui-avatars.com/api/?name=${profile.first_name || "U"}`
            }
            alt="Profile"
          />
          <h3>
            {profile.first_name} {profile.last_name}
          </h3>
          <p>Email: {profile.email}</p>
          <p>Mobile: {profile.mobile_number || "-"}</p>
          <p>Bio: {profile.bio || "No bio yet"}</p>
          <p>Address: {profile.address || "No address set"}</p>

          <button className="btn" onClick={() => setEditing(true)}>
            Edit Profile
          </button>
        </div>
      ) : (
        <form className="profile-form" onSubmit={handleSubmit} noValidate>
          <label>
            First Name
            <input
              type="text"
              value={form.first_name}
              onChange={(e) => handleChange("first_name", e.target.value)}
            />
            {errors.first_name && <small style={{ color: "red" }}>{errors.first_name}</small>}
          </label>
          <label>
            Last Name
            <input
              type="text"
              value={form.last_name}
              onChange={(e) => handleChange("last_name", e.target.value)}
            />
            {errors.last_name && <small style={{ color: "red" }}>{errors.last_name}</small>}
          </label>
          <label>
            Mobile
            <input
              type="text"
              value={form.mobile_number}
              onChange={(e) => handleChange("mobile_number", e.target.value)}
            />
            {errors.mobile_number && <small style={{ color: "red" }}>{errors.mobile_number}</small>}
          </label>
          <label>
            Bio
            <textarea
              value={form.bio}
              onChange={(e) => handleChange("bio", e.target.value)}
            />
          </label>
          <label>
            Address
            <textarea
              value={form.address}
              onChange={(e) => handleChange("address", e.target.value)}
            />
          </label>
          <label>
            Profile Image
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageChange(e.target.files[0])}
            />
          </label>
          {imagePreview && (
            <div style={{ margin: "10px 0" }}>
              <img src={imagePreview} alt="Preview" style={{ width: "100px", borderRadius: "50%" }} />
            </div>
          )}

          <button type="submit" className="btn" disabled={loading}>
            {loading
              ? "Saving..."
              : profile
              ? "Update Profile"
              : "Create Profile"}
          </button>
          {profile && (
            <button
              type="button"
              className="btn-outline"
              onClick={() => setEditing(false)}
            >
              Cancel
            </button>
          )}
        </form>
      )}
    </div>
  );
}

import React, { useState, useMemo } from "react"
import { Link, useNavigate } from "react-router-dom"
import { ArrowLeft, CheckSquare, Save, RotateCcw, Check, UserCircle2, AlertCircle } from "lucide-react"
import { useApp } from "../context/AppContext.jsx"
import { getToday } from "../lib/dateUtils.js"
import { calculateAge, validateProfile } from "../lib/profileHelpers.js"
import { CountrySelect } from "../components/CountrySelect.jsx"
import { CategoryManager } from "../components/CategoryManager.jsx"

export function Profile() {
  const navigate = useNavigate()
  const { profile, updateProfile } = useApp()
  const todayStr = getToday()

  // Form State initialized from persisted profile
  const [formValues, setFormValues] = useState({
    name: profile.name || "",
    dob: profile.dob || "",
    email: profile.email || "",
    country: profile.country || "",
  })

  const [touched, setTouched] = useState({
    name: false,
    dob: false,
    email: false,
    country: false,
  })

  const [toastMessage, setToastMessage] = useState(null)
  const [showUnsavedModal, setShowUnsavedModal] = useState(false)

  // Validation
  const validation = useMemo(() => {
    return validateProfile(formValues, todayStr)
  }, [formValues, todayStr])

  // Calculated Age
  const calculatedAge = useMemo(() => {
    return calculateAge(formValues.dob, todayStr)
  }, [formValues.dob, todayStr])

  // Check if form has unsaved changes
  const hasChanges = useMemo(() => {
    return (
      (formValues.name || "").trim() !== (profile.name || "").trim() ||
      (formValues.dob || "") !== (profile.dob || "") ||
      (formValues.email || "").trim() !== (profile.email || "").trim() ||
      (formValues.country || "").trim() !== (profile.country || "").trim()
    )
  }, [formValues, profile])

  // Field change handler
  const handleChange = (field, value) => {
    setFormValues((prev) => ({ ...prev, [field]: value }))
  }

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
  }

  const backButtonRef = React.useRef(null)

  // Focus management on page transition
  React.useEffect(() => {
    window.scrollTo(0, 0)
    backButtonRef.current?.focus()
  }, [])

  // Handle Save
  const handleSave = (e) => {
    e?.preventDefault()
    // Mark all touched
    setTouched({ name: true, dob: true, email: true, country: true })

    if (!validation.isValid) return

    updateProfile({
      name: formValues.name.trim() || "User",
      dob: formValues.dob,
      email: formValues.email.trim().toLowerCase(),
      country: formValues.country.trim(),
    })

    setToastMessage("Profile saved")
    setTimeout(() => setToastMessage(null), 3000)
  }

  // Handle Discard
  const handleDiscard = () => {
    setFormValues({
      name: profile.name || "",
      dob: profile.dob || "",
      email: profile.email || "",
      country: profile.country || "",
    })
    setTouched({ name: false, dob: false, email: false, country: false })
  }

  // Handle Back button navigation with unsaved prompt
  const handleBack = (e) => {
    e?.preventDefault()
    if (hasChanges) {
      setShowUnsavedModal(true)
    } else {
      navigate("/")
    }
  }

  const displayName = formValues.name.trim() || "User"
  const userInitial = displayName.charAt(0).toUpperCase()

  return (
    <div className="min-h-screen bg-[#141416] text-[#e4e4e7] flex flex-col items-center justify-start py-6 px-3 sm:px-6 lg:px-8 animate-smooth-in">
      <div className="w-full max-w-[1400px] flex flex-col gap-6">
        
        {/* Top Header Row with Navigation */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2 border-b border-white/5 pb-4">
          <div className="flex items-center gap-4">
            {/* Back to dashboard button */}
            <button
              ref={backButtonRef}
              onClick={handleBack}
              aria-label="Back to dashboard"
              className="squircle-md p-2.5 bg-[#1c1c1f] hover:bg-[#25252a] text-zinc-300 hover:text-white border border-white/10 transition-colors flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#0A6CFF]"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            {/* TaskFlow Brand Mark link */}
            <button
              type="button"
              onClick={handleBack}
              className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-[#0A6CFF] squircle-md pr-2 text-left"
            >
              <div className="w-10 h-10 squircle-md bg-gradient-to-br from-[#0A6CFF] to-[#0047b3] flex items-center justify-center text-white shadow-lg shadow-[#0A6CFF]/20 border border-white/10 group-hover:scale-105 transition-transform">
                <CheckSquare className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white leading-none">
                  Profile & Settings
                </h1>
                <p className="text-xs text-zinc-400 mt-1">
                  Manage personal details and task category organization
                </p>
              </div>
            </button>
          </div>

          <div className="flex items-center gap-2 sm:self-center">
            <span className="text-xs text-zinc-400 hidden sm:inline">
              TaskFlow Pro Workspace
            </span>
          </div>
        </header>

        {/* Success Toast */}
        {toastMessage && (
          <div className="fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white squircle-lg shadow-2xl animate-smooth-pop font-semibold text-xs border border-emerald-400/40">
            <Check className="w-4 h-4 stroke-[3]" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Main 2-Column Responsive Grid */}
        <main className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          
          {/* ========================================================
              CARD A: PERSONAL DETAILS
             ======================================================== */}
          <section className="theme-card squircle-2xl p-5 sm:p-7 relative overflow-hidden flex flex-col justify-between border border-white/10 shadow-xl">
            <div>
              {/* Header with Title & Avatar Preview */}
              <div className="flex items-center justify-between mb-6 pb-5 border-b border-white/5">
                <div className="flex items-center gap-4">
                  {/* Large 96px Circular Avatar */}
                  <div className="relative">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-[#00388a] via-[#0A6CFF] to-[#60a5fa] p-[3px] shadow-xl shadow-[#0A6CFF]/25">
                      <div className="w-full h-full rounded-full bg-[#141416] flex items-center justify-center text-white font-black text-3xl sm:text-4xl tracking-tight">
                        {userInitial}
                      </div>
                    </div>
                    <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#1c1c1f]" />
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight leading-snug">
                      Hi, <span className="text-[#3b82f6]">{displayName}</span>
                    </h2>
                    <p className="text-xs text-zinc-400 mt-1">
                      Personalize your identity across TaskFlow
                    </p>
                  </div>
                </div>
              </div>

              {/* Form Fields: Clean 2-Column Grid */}
              <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* 1. Name (Required, 1-30 chars) */}
                <div className="sm:col-span-2 flex flex-col gap-1.5">
                  <label htmlFor="profile-name" className="text-xs font-semibold text-zinc-300">
                    Full Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    id="profile-name"
                    type="text"
                    value={formValues.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    onBlur={() => handleBlur("name")}
                    placeholder="Enter your name..."
                    maxLength={30}
                    aria-invalid={touched.name && Boolean(validation.errors.name)}
                    aria-describedby={touched.name && validation.errors.name ? "name-error" : undefined}
                    className={`squircle-md px-3.5 py-2.5 bg-[#141416] border text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#0A6CFF] transition-all ${
                      touched.name && validation.errors.name
                        ? "border-rose-500/60 focus:ring-rose-500"
                        : "border-white/10 hover:border-white/20"
                    }`}
                  />
                  {touched.name && validation.errors.name && (
                    <span id="name-error" className="text-[11px] text-rose-400 font-medium">
                      {validation.errors.name}
                    </span>
                  )}
                </div>

                {/* 2. Date of Birth */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="profile-dob" className="text-xs font-semibold text-zinc-300">
                    Date of Birth
                  </label>
                  <input
                    id="profile-dob"
                    type="date"
                    max={todayStr}
                    min="1900-01-01"
                    value={formValues.dob}
                    onChange={(e) => handleChange("dob", e.target.value)}
                    onBlur={() => handleBlur("dob")}
                    aria-invalid={touched.dob && Boolean(validation.errors.dob)}
                    aria-describedby={touched.dob && validation.errors.dob ? "dob-error" : undefined}
                    className={`squircle-md px-3.5 py-2.5 bg-[#141416] border text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#0A6CFF] transition-all ${
                      touched.dob && validation.errors.dob
                        ? "border-rose-500/60 focus:ring-rose-500"
                        : "border-white/10 hover:border-white/20"
                    }`}
                  />
                  {touched.dob && validation.errors.dob && (
                    <span id="dob-error" className="text-[11px] text-rose-400 font-medium">
                      {validation.errors.dob}
                    </span>
                  )}
                </div>

                {/* 3. Age (Read-only, auto-calculated) */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="profile-age" className="text-xs font-semibold text-zinc-300">
                    Age
                  </label>
                  <div
                    id="profile-age"
                    className="squircle-md px-3.5 py-2.5 bg-[#141416]/50 border border-white/5 text-xs sm:text-sm text-zinc-300 font-medium select-none flex items-center justify-between"
                  >
                    <span>{calculatedAge !== null ? `${calculatedAge} years` : "Not set"}</span>
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Auto</span>
                  </div>
                  <span className="text-[10px] text-zinc-500">
                    Calculated from your date of birth
                  </span>
                </div>

                {/* 4. Email */}
                <div className="sm:col-span-2 flex flex-col gap-1.5">
                  <label htmlFor="profile-email" className="text-xs font-semibold text-zinc-300">
                    Email Address
                  </label>
                  <input
                    id="profile-email"
                    type="email"
                    value={formValues.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    onBlur={() => handleBlur("email")}
                    placeholder="user@example.com"
                    aria-invalid={touched.email && Boolean(validation.errors.email)}
                    aria-describedby={touched.email && validation.errors.email ? "email-error" : undefined}
                    className={`squircle-md px-3.5 py-2.5 bg-[#141416] border text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#0A6CFF] transition-all ${
                      touched.email && validation.errors.email
                        ? "border-rose-500/60 focus:ring-rose-500"
                        : "border-white/10 hover:border-white/20"
                    }`}
                  />
                  {touched.email && validation.errors.email && (
                    <span id="email-error" className="text-[11px] text-rose-400 font-medium">
                      {validation.errors.email}
                    </span>
                  )}
                </div>

                {/* 5. Country (Searchable Combobox) */}
                <div className="sm:col-span-2 flex flex-col gap-1.5">
                  <label htmlFor="country-select" className="text-xs font-semibold text-zinc-300">
                    Country
                  </label>
                  <CountrySelect
                    value={formValues.country}
                    onChange={(c) => handleChange("country", c)}
                  />
                </div>
              </form>
            </div>

            {/* Bottom Actions: Save & Discard Buttons */}
            <div className="flex items-center justify-between gap-3 pt-6 mt-6 border-t border-white/5">
              <button
                type="button"
                onClick={handleDiscard}
                disabled={!hasChanges}
                className="squircle-md px-4 py-2.5 text-xs sm:text-sm font-medium text-zinc-400 hover:text-white bg-[#141416] hover:bg-[#25252a] disabled:opacity-40 disabled:pointer-events-none border border-white/10 transition-colors flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Discard Changes</span>
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={!hasChanges || !validation.isValid}
                className="squircle-md px-5 py-2.5 text-xs sm:text-sm font-semibold text-white bg-[#0A6CFF] hover:bg-[#005ae0] disabled:bg-white/10 disabled:text-zinc-500 disabled:cursor-not-allowed shadow-lg shadow-[#0A6CFF]/25 transition-all flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#0A6CFF]"
              >
                <Save className="w-4 h-4" />
                <span>Save Profile</span>
              </button>
            </div>
          </section>

          {/* ========================================================
              CARD B: TASK CATEGORIES
             ======================================================== */}
          <section className="flex flex-col h-full">
            <CategoryManager />
          </section>
        </main>
      </div>

      {/* Unsaved Changes Warning Modal */}
      {showUnsavedModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-modal-backdrop">
          <div className="squircle-2xl bg-[#1c1c1f] border border-white/10 p-6 max-w-sm w-full shadow-2xl animate-smooth-pop flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 squircle-md bg-amber-500/15 border border-amber-500/25 flex items-center justify-center text-amber-400 flex-shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">
                  Unsaved Changes
                </h3>
                <p className="text-xs text-zinc-300 mt-1">
                  You have unsaved edits in your profile. Leaving will discard these changes.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-white/5">
              <button
                type="button"
                onClick={() => setShowUnsavedModal(false)}
                className="squircle-md px-3.5 py-1.5 text-xs font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                Keep Editing
              </button>
              <button
                type="button"
                onClick={() => navigate("/")}
                className="squircle-md px-3.5 py-1.5 text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white transition-colors"
              >
                Leave Without Saving
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

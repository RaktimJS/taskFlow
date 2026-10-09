import React from "react"
import { HashRouter, Routes, Route, Navigate } from "react-router-dom"
import { AppProvider } from "./context/AppContext.jsx"
import { Dashboard } from "./pages/Dashboard.jsx"
import { Profile } from "./pages/Profile.jsx"

export default function App() {
  return (
    <AppProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </AppProvider>
  )
}

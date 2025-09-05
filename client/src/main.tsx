import React from "react";
import ReactDOM from "react-dom/client";
import "./app.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import App from "./App";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import SurveyResults from "./pages/SurveyResults";
import Login from "./pages/Login";
import DisciplineSelect from "./pages/DisciplineSelect";
import Survey from "./pages/Survey";
import GlobeDiscipline from "./pages/GlobeDiscipline";
import DisciplineChoice from "./pages/DisciplineChoice";

// ✅ new components
import ScrollToTop from "./components/ScrollToTop";
import Navbar from "./components/Navbar";

function AlumniDashboard() {
  return <div className="p-6">Alumni Dashboard (coming soon)</div>;
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* Login page → no App / Navbar */}
        <Route path="/login" element={<Login />} />

        {/* Everything else wrapped in App (which already includes Navbar) */}
        <Route path="/" element={<App />}>
          <Route index element={<Navigate to="/login" replace />} />
          <Route path="auth" element={<Auth />} />
          <Route path="disciplines" element={<DisciplineSelect />} />
          <Route path="survey" element={<Survey />} />
          <Route path="globe/:discipline" element={<GlobeDiscipline />} />
          <Route path="alumni-dashboard" element={<AlumniDashboard />} />
          <Route path="profile" element={<Profile />} />
          <Route path="survey-results" element={<SurveyResults />} />
          <Route path="discipline-choice" element={<DisciplineChoice />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);

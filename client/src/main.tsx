import React from "react";
import ReactDOM from "react-dom/client";
import "./app.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import App from "./App";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import SurveyResults from "./pages/SurveyResults";
// ✅ new pages
import Login from "./pages/Login";
import DisciplineSelect from "./pages/DisciplineSelect";
import Survey from "./pages/Survey";
import GlobeDiscipline from "./pages/GlobeDiscipline";

function AlumniDashboard() {
  return <div className="p-6">Alumni Dashboard (coming soon)</div>;
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
<BrowserRouter>
  <Routes>
    {/* Login page → no Navbar */}
    <Route path="/login" element={<Login />} />

    {/* Everything else → inside App with Navbar */}
    <Route path="/" element={<App />}>
      <Route index element={<Navigate to="/login" replace />} />
      <Route path="auth" element={<Auth />} />
      <Route path="disciplines" element={<DisciplineSelect />} />
      <Route path="survey" element={<Survey />} />
      <Route path="globe/:discipline" element={<GlobeDiscipline />} />
      <Route path="alumni-dashboard" element={<AlumniDashboard />} />
      <Route path="profile" element={<Profile />} />
      <Route path="/survey-results" element={<SurveyResults />} />
    </Route>
  </Routes>
</BrowserRouter>

  </React.StrictMode>
);

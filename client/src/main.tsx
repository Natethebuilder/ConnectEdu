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
import LearningHub from "./pages/learning/[discipline]";
import MentorOnboarding from "./pages/MentorOnboarding";
import MentorDashboard from "./pages/MentorDashboard";
import MentorSettings from "./pages/MentorSettings";
import EmailConfirmed from "./pages/EmailConfirmed";
import PasswordReset from "./pages/PasswordReset";
import AuthCallback from "./pages/AuthCallback";
import MentorHub from "./pages/MentorHub";
import ChatPage from "./pages/ChatPage";
import Messages from "./pages/Messages";

import ScrollToTop from "./components/ScrollToTop";

// Initialize auth store right away so public routes (/auth, /login) see session
import { useSupabaseAuth } from "./store/supabaseAuth";
useSupabaseAuth.getState().initAuth();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* Public pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/auth" element={<Auth />} />

        {/* Supabase magic routes */}
        <Route path="/auth/v1/callback" element={<AuthCallback />} />
        <Route path="/auth/reset" element={<PasswordReset />} />
        <Route path="/email-confirmed" element={<EmailConfirmed />} />

        {/* Authenticated section */}
        <Route path="/" element={<App />}>
          <Route index element={<Navigate to="/login" replace />} />
          <Route path="disciplines" element={<DisciplineSelect />} />
          <Route path="survey" element={<Survey />} />
          <Route path="globe/:discipline" element={<GlobeDiscipline />} />
          <Route path="profile" element={<Profile />} />
          <Route path="survey-results" element={<SurveyResults />} />
          <Route path="discipline-choice" element={<DisciplineChoice />} />
          <Route path="learning/:discipline" element={<LearningHub />} />
          <Route path="mentor-onboarding" element={<MentorOnboarding />} />
          <Route path="mentor-dashboard" element={<MentorDashboard />} />
          <Route path="mentor-settings" element={<MentorSettings />} />
          <Route path="mentor-hub/:discipline" element={<MentorHub />} />
          <Route path="chat/:otherId" element={<ChatPage />} />
          <Route path="messages" element={<Messages />} />

        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);

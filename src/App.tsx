
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/AdminDashboard";
import AuditLogsViewer from "./pages/AuditLogsViewer";
import RetentionManagement from "./pages/RetentionManagement";
import ComplianceReporting from "./pages/ComplianceReporting";
import Pricing from "./pages/Pricing";
import BillingPage from "./pages/BillingPage";
import VelaDeployment from "./pages/VelaDeployment";
import MobileVela from "./pages/MobileVela";






import Unauthorized from "./pages/Unauthorized";


import NotFound from "./pages/NotFound";



const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider defaultTheme="light">
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/billing" element={<BillingPage />} />

            <Route path="/profile" element={<Profile />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/audit-logs" element={<AuditLogsViewer />} />
            <Route path="/admin/retention" element={<RetentionManagement />} />
            <Route path="/admin/compliance" element={<ComplianceReporting />} />
            <Route path="/vela-deployment" element={<VelaDeployment />} />
            <Route path="/mobile-vela" element={<MobileVela />} />




            <Route path="/unauthorized" element={<Unauthorized />} />



            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;

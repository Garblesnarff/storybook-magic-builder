
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Routes, Route } from "react-router-dom";
import { BookProvider } from "./contexts/BookContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Index from "./pages/Index";
import HomePage from "./pages/HomePage";
import AuthPage from "./pages/AuthPage";
import BooksPage from "./pages/BooksPage";
import EditorPage from "./pages/EditorPage";
import EditorPlaceholderPage from "./pages/EditorPlaceholderPage";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";

const App = () => (
  <TooltipProvider>
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/books" element={
        <ProtectedRoute>
          <BooksPage />
        </ProtectedRoute>
      } />
      <Route path="/editor/:id" element={
        <ProtectedRoute>
          <EditorPage />
        </ProtectedRoute>
      } />
      <Route path="/editor" element={
        <ProtectedRoute>
          <EditorPlaceholderPage />
        </ProtectedRoute>
      } />
      <Route path="/settings" element={
        <ProtectedRoute>
          <SettingsPage />
        </ProtectedRoute>
      } />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
    <Toaster />
    <Sonner />
  </TooltipProvider>
);

export default App;

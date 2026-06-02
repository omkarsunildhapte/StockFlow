import Navbar from "@/components/Navbar";
import { Toaster } from "@/components/ui/sonner";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
      <Toaster richColors position="top-right" />
    </div>
  );
}

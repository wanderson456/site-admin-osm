import type { Metadata } from "next";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import "./globals.css";

export const metadata: Metadata = {
  title: "OSM BAD BOYS",
  description: "Administração do grupo OSM BAD BOYS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-[#101315] text-white">

        <div className="flex min-h-screen">

          <Sidebar />

          <section className="flex min-w-0 flex-1 flex-col">

            <Header />

            <main className="flex-1">
              {children}
            </main>

          </section>

        </div>

      </body>
    </html>
  );
}
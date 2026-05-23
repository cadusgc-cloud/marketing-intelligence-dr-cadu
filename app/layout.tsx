import type { Metadata } from "next";
import Link from "next/link";
import { buildNavigationGroups } from "@/lib/product-routes";
import "./globals.css";

export const metadata: Metadata = {
  title: "Marketing Intelligence OS - Dr. Cadu",
  description: "Sistema local e deterministico de inteligencia editorial, marketing medico organico e execucao manual segura."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const navigationGroups = buildNavigationGroups();
  return (
    <html lang="pt-BR">
      <body>
        <div className="min-h-screen">
          <header className="border-b border-slate-200 bg-white">
            <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
              <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
                <div>
                  <p className="text-sm font-medium text-ocean">MVP local, sem dados pessoais e sem integracoes externas</p>
                  <h1 className="text-2xl font-semibold tracking-normal text-ink">Marketing Intelligence OS - Dr. Cadu</h1>
                </div>
                <Link href="/command-center" className="w-fit rounded-md bg-ocean px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-800">
                  Abrir Command Center
                </Link>
              </div>
              <nav aria-label="Navegacao principal" className="grid gap-3 lg:grid-cols-3 xl:grid-cols-6">
                {navigationGroups.map((group) => (
                  <section key={group.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">{group.title}</h2>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {group.routes.map((route) => (
                        <Link key={route.path} href={route.path} className="rounded-md px-2 py-1 text-sm font-medium text-slate-700 hover:bg-white hover:text-ocean">
                          {route.title}
                        </Link>
                      ))}
                    </div>
                  </section>
                ))}
              </nav>
            </div>
          </header>
          <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>
        </div>
      </body>
    </html>
  );
}

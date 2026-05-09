import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Marketing Intelligence OS — Dr. Cadu",
  description: "Agente determinístico de inteligência de marketing para relatórios agregados."
};

const links = [
  ["/", "Dashboard"],
  ["/reports", "Relatórios"],
  ["/reports/new", "Importar"],
  ["/insights", "Insights"],
  ["/content", "Content Studio"],
  ["/calendar", "Calendário"],
  ["/audit", "Auditoria"],
  ["/signals", "Sinais"],
  ["/data", "Dados"],
  ["/weekly", "Central Semanal"],
  ["/benchmarks", "Benchmarks"],
  ["/settings", "Configurações"]
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <div className="min-h-screen">
          <header className="border-b border-slate-200 bg-white">
            <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
              <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
                <div>
                  <p className="text-sm font-medium text-ocean">MVP sem dados pessoais, sem integrações externas</p>
                  <h1 className="text-2xl font-semibold tracking-normal text-ink">Marketing Intelligence OS — Dr. Cadu</h1>
                </div>
                <Link href="/reports/new" className="w-fit rounded-md bg-ocean px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-800">
                  Novo relatório
                </Link>
              </div>
              <nav className="flex flex-wrap gap-2">
                {links.map(([href, label]) => (
                  <Link key={href} href={href} className="rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
                    {label}
                  </Link>
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

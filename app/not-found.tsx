import { ErrorState } from "@/components/product";

export default function NotFoundPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <ErrorState title="Rota nao encontrada" description="Este caminho nao faz parte do manifesto operacional atual. Use o Command Center para retomar a rotina guiada." recoveryHref="/command-center" recoveryLabel="Abrir Command Center" />
    </main>
  );
}

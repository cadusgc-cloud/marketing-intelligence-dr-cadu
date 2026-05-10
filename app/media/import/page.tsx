import MediaManifestImportClient from "./MediaManifestImportClient";

export default function MediaCatalogingPage() {
  return (
    <div className="space-y-6">
      <section className="panel">
        <p className="text-sm font-medium text-ocean">Catalogação do acervo</p>
        <h2 className="mt-1 text-2xl font-semibold">Catalogação do Acervo</h2>
        <p className="mt-2 text-sm text-slate-500">Transforme listas de fotos e vídeos em rascunhos organizados para a Biblioteca de Mídias.</p>
        <p className="mt-4 rounded-md bg-amber-50 p-3 text-sm font-medium text-amber">
          Nesta fase, a catalogação usa texto colado ou uma lista simulada de arquivos. Nenhum arquivo real é lido, enviado ou analisado visualmente.
        </p>
      </section>

      <MediaManifestImportClient />

      <section className="panel">
        <h3 className="text-lg font-semibold">Como usar com seu acervo real</h3>
        <ol className="mt-3 grid gap-2 text-sm text-slate-600 md:grid-cols-2">
          <li>1. Exportar a lista de arquivos da pasta.</li>
          <li>2. Colar a lista no sistema.</li>
          <li>3. Revisar sugestões de pilar, funil e uso.</li>
          <li>4. Aprovar ou ajustar manualmente.</li>
          <li>5. Transformar em itens da Biblioteca de Mídias.</li>
          <li>6. Encaixar no plano diário e semanal de stories.</li>
        </ol>
      </section>
    </div>
  );
}

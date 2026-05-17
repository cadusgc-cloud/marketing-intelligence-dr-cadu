import { LocalCopyButton } from "@/components/LocalCopyButton";
import { CONTENT_PROMPTS, buildPromptLibraryMarkdown } from "@/lib/drCaduContentPlan";

export default function PromptLibraryPage() {
  const markdown = buildPromptLibraryMarkdown(CONTENT_PROMPTS);

  return (
    <div className="space-y-6">
      <section className="panel">
        <p className="text-sm font-medium text-ocean">Biblioteca interna</p>
        <h2 className="mt-1 text-2xl font-semibold">Prompts copiaveis para producao de conteudo</h2>
        <p className="mt-2 text-sm text-slate-500">Prompts para uso manual. O app nao chama OpenAI, ChatGPT ou qualquer API externa.</p>
        <div className="mt-4">
          <LocalCopyButton text={markdown} label="Copiar biblioteca inteira" />
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        {CONTENT_PROMPTS.map((item) => (
          <article key={item.id} className="panel">
            <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
              <div>
                <span className="badge bg-cyan-50 text-ocean">{item.category}</span>
                <h3 className="mt-3 text-lg font-semibold">{item.title}</h3>
              </div>
              <LocalCopyButton text={item.prompt} label="Copiar prompt" />
            </div>
            <pre className="mt-4 whitespace-pre-wrap rounded-md bg-slate-50 p-3 font-sans text-sm text-slate-700">{item.prompt}</pre>
          </article>
        ))}
      </section>
    </div>
  );
}

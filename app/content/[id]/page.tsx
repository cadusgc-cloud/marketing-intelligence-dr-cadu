import Link from "next/link";
import { notFound } from "next/navigation";
import { LocalCopyButton } from "@/components/LocalCopyButton";
import { buildContentPackageMarkdown, getContentPackageById, getWeeklyContentPlan } from "@/lib/drCaduContentPlan";

export function generateStaticParams() {
  return getWeeklyContentPlan().packages.map((pkg) => ({ id: pkg.id }));
}
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="panel">
      <h3 className="text-lg font-semibold">{title}</h3>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default function ContentPackagePage({ params }: { params: { id: string } }) {
  const pkg = getContentPackageById(params.id);
  if (!pkg) notFound();

  const markdown = buildContentPackageMarkdown(pkg);
  const hashtags = pkg.feed.hashtags.join(" ");
  const allPrompts = [pkg.feed.artPrompt, pkg.feed.reviewPrompt, pkg.carousel.artPrompt, pkg.shortVideo.scriptPrompt, pkg.shortVideo.coverPrompt, pkg.youtubeLong.thumbnailPrompt, pkg.youtubeLong.expansionPrompt].join("\n\n");

  return (
    <div className="space-y-6">
      <section className="panel">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
          <div>
            <p className="text-sm font-medium text-ocean">{pkg.day} - {pkg.primaryChannel}</p>
            <h2 className="mt-1 text-2xl font-semibold">{pkg.title}</h2>
            <p className="mt-2 text-sm text-slate-600">{pkg.objective}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="badge bg-cyan-50 text-ocean">{pkg.pillar}</span>
              <span className="badge bg-slate-100 text-slate-700">{pkg.contentFunction}</span>
              <span className="badge bg-amber-50 text-amber">{pkg.priority}</span>
              <span className="badge bg-green-50 text-leaf">{pkg.status}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <LocalCopyButton text={markdown} label="Copiar pacote" />
            <Link href="/plan" className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Voltar ao plano</Link>
          </div>
        </div>
      </section>

      <Section title="A. Estrategia">
        <div className="grid gap-3 md:grid-cols-2">
          {[
            ["Objetivo", pkg.objective],
            ["Publico", pkg.strategy.audience],
            ["Dor/interesse", pkg.strategy.painOrInterest],
            ["Promessa editorial segura", pkg.strategy.safeEditorialPromise],
            ["Canal principal", pkg.primaryChannel],
            ["Canais derivados", pkg.derivedChannels.join(", ")],
            ["Pilar", pkg.pillar],
            ["Formato", pkg.format],
            ["Gancho", pkg.strategy.hook],
            ["CTA", pkg.strategy.cta],
            ["Nivel de esforco", pkg.strategy.effort],
            ["Observacoes de gravacao", pkg.strategy.recordingNotes]
          ].map(([label, value]) => (
            <div key={label} className="rounded-md bg-slate-50 p-3">
              <p className="text-sm font-semibold">{label}</p>
              <p className="mt-1 text-sm text-slate-600">{value}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="B. Instagram Feed">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-md bg-slate-50 p-3">
            <div className="flex items-center justify-between gap-2"><p className="font-semibold">Legenda pronta</p><LocalCopyButton text={pkg.feed.caption} label="Copiar legenda" /></div>
            <pre className="mt-3 whitespace-pre-wrap font-sans text-sm text-slate-700">{pkg.feed.caption}</pre>
          </div>
          <div className="space-y-3">
            <div className="rounded-md bg-slate-50 p-3"><p className="font-semibold">Versao curta</p><p className="mt-1 text-sm text-slate-600">{pkg.feed.shortVersion}</p></div>
            <div className="rounded-md bg-slate-50 p-3"><p className="font-semibold">Versao humana</p><p className="mt-1 text-sm text-slate-600">{pkg.feed.humanVersion}</p></div>
            <div className="rounded-md bg-slate-50 p-3"><div className="flex items-center justify-between gap-2"><p className="font-semibold">Hashtags</p><LocalCopyButton text={hashtags} label="Copiar hashtags" /></div><p className="mt-1 text-sm text-slate-600">{hashtags}</p></div>
            <div className="rounded-md bg-slate-50 p-3"><p className="font-semibold">Visual e prompts</p><p className="mt-1 text-sm text-slate-600">{pkg.feed.visualSuggestion}</p><p className="mt-2 text-xs text-slate-500">{pkg.feed.artPrompt}</p></div>
          </div>
        </div>
      </Section>

      <Section title="C. Instagram Carrossel">
        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <p className="font-semibold">{pkg.carousel.title}</p>
            <ol className="mt-3 list-decimal space-y-2 pl-4 text-sm text-slate-600">
              {pkg.carousel.slides.map((slide) => <li key={slide}>{slide}</li>)}
            </ol>
          </div>
          <div className="rounded-md bg-slate-50 p-3 text-sm text-slate-600">
            <p><span className="font-semibold text-ink">Legenda:</span> {pkg.carousel.caption}</p>
            <p className="mt-2"><span className="font-semibold text-ink">CTA:</span> {pkg.carousel.cta}</p>
            <p className="mt-2"><span className="font-semibold text-ink">Design:</span> {pkg.carousel.designNote}</p>
            <p className="mt-2"><span className="font-semibold text-ink">Prompt:</span> {pkg.carousel.artPrompt}</p>
          </div>
        </div>
      </Section>

      <Section title="D. Stories">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {pkg.stories.map((story) => (
            <article key={story.order} className="rounded-md bg-slate-50 p-3 text-sm">
              <span className="badge bg-white text-slate-700">Story {story.order} - {story.type}</span>
              <p className="mt-2 font-semibold text-ink">{story.text}</p>
              <p className="mt-1 text-slate-600">Visual: {story.visualSuggestion}</p>
              <p className="mt-1 text-slate-600">Objetivo: {story.objective}</p>
              {story.interaction ? <p className="mt-1 text-slate-600">Interacao: {story.interaction}</p> : null}
              {story.cta ? <p className="mt-1 text-slate-600">CTA: {story.cta}</p> : null}
            </article>
          ))}
        </div>
      </Section>

      <Section title="E. Reels / TikTok / Shorts">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-md bg-slate-50 p-3">
            <p className="font-semibold">Gancho de 3 segundos</p>
            <p className="mt-1 text-sm text-slate-600">{pkg.shortVideo.hook3s}</p>
            <p className="mt-3 font-semibold">Roteiro</p>
            <p className="mt-1 text-sm text-slate-600">{pkg.shortVideo.script}</p>
            <p className="mt-3 font-semibold">Fala natural</p>
            <p className="mt-1 text-sm text-slate-600">{pkg.shortVideo.naturalSpeech}</p>
          </div>
          <div className="rounded-md bg-slate-50 p-3 text-sm text-slate-600">
            <p className="font-semibold text-ink">Texto na tela</p>
            <ul className="mt-2 space-y-1">{pkg.shortVideo.onScreenText.map((item) => <li key={item}>- {item}</li>)}</ul>
            <p className="mt-3 font-semibold text-ink">Cortes sugeridos</p>
            <ul className="mt-2 space-y-1">{pkg.shortVideo.suggestedCuts.map((item) => <li key={item}>- {item}</li>)}</ul>
            <p className="mt-3"><span className="font-semibold text-ink">Prompt de roteiro:</span> {pkg.shortVideo.scriptPrompt}</p>
            <p className="mt-2"><span className="font-semibold text-ink">Prompt de capa:</span> {pkg.shortVideo.coverPrompt}</p>
          </div>
        </div>
      </Section>

      <Section title="F. YouTube video longo">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-md bg-slate-50 p-3 text-sm text-slate-600">
            <p className="font-semibold text-ink">{pkg.youtubeLong.title}</p>
            <p className="mt-2">{pkg.youtubeLong.description}</p>
            <p className="mt-3 font-semibold text-ink">Roteiro por blocos</p>
            <ul className="mt-2 space-y-1">{pkg.youtubeLong.blockScript.map((item) => <li key={item}>- {item}</li>)}</ul>
          </div>
          <div className="rounded-md bg-slate-50 p-3 text-sm text-slate-600">
            <p><span className="font-semibold text-ink">Abertura:</span> {pkg.youtubeLong.opening}</p>
            <p className="mt-2"><span className="font-semibold text-ink">Fechamento:</span> {pkg.youtubeLong.closing}</p>
            <p className="mt-2"><span className="font-semibold text-ink">Chapters:</span> {pkg.youtubeLong.chapters.join(" | ")}</p>
            <p className="mt-2"><span className="font-semibold text-ink">Thumbnail:</span> {pkg.youtubeLong.thumbnailPrompt}</p>
          </div>
        </div>
      </Section>

      <Section title="G. Reaproveitamento">
        <ul className="space-y-2 text-sm text-slate-600">{pkg.repurposing.map((item) => <li key={item}>- {item}</li>)}</ul>
      </Section>

      <Section title="H. Checklist etico e prompts">
        <div className="grid gap-4 lg:grid-cols-2">
          <ul className="space-y-2 text-sm text-slate-600">{pkg.ethicalChecklist.map((item) => <li key={item}>- {item}</li>)}</ul>
          <div className="rounded-md bg-slate-50 p-3">
            <div className="flex items-center justify-between gap-2"><p className="font-semibold">Prompts do pacote</p><LocalCopyButton text={allPrompts} label="Copiar prompts" /></div>
            <pre className="mt-3 max-h-72 overflow-auto whitespace-pre-wrap font-sans text-sm text-slate-600">{allPrompts}</pre>
          </div>
        </div>
      </Section>
    </div>
  );
}

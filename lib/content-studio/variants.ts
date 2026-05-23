import { evaluateMarketingContentQuality } from "@/lib/content-studio/quality";
import type { ContentVariant } from "@/lib/content-studio/types";

const variantFrames = [
  ["mais_humana", "Mais humana", "Fala simples, proxima e sem cara de campanha", "Uma forma humana de pensar em {theme}: antes da decisao, vale entender contexto, limite e seguranca."],
  ["tecnica_simples", "Tecnica simples", "Explica sem jargao e sem prometer", "{theme} pode ser explicado com uma ideia simples: decisao boa precisa de avaliacao, criterio e tempo."],
  ["reflexiva", "Mais reflexiva", "Boa para fim de dia ou fim de semana", "Nem tudo precisa virar pressa. {theme} merece uma conversa mais calma."],
  ["anti_marketing", "Anti-marketing elegante", "Contrapoe exagero sem atacar ninguem", "O marketing pode simplificar demais. {theme} pede menos promessa e mais clareza."],
  ["curta", "Mais curta", "Frase de apoio para story", "{theme}: pensar com calma tambem e cuidado."],
  ["fim_de_semana", "Fim de semana", "Tom leve, sem fingir bastidor em tempo real", "Uma ideia leve para guardar: {theme}, sem pressa e sem promessa."],
  ["segunda", "Inicio de semana", "Organizacao e planejamento", "Comecar a semana lembrando: {theme} combina com planejamento, nao improviso."],
  ["plastica_em_evidencia", "Plastica em Evidencia", "Leitura critica e sobria", "Para o Plastica em Evidencia: {theme} merece ser olhado sem exagero."],
  ["story", "Versao story", "Sticker curto", "{theme} em uma frase: clareza antes da decisao."],
  ["reel", "Versao reel", "Gancho para fala curta", "Antes de decidir sobre {theme}, vale entender uma coisa que o Instagram nem sempre mostra."]
] as const;

export function generateContentVariants(theme: string): ContentVariant[] {
  return variantFrames.map(([id, label, useCase, template]) => {
    const text = template.replace("{theme}", theme);
    return {
      id: `variant-${slug(theme)}-${id}`,
      label,
      useCase,
      text,
      quality: evaluateMarketingContentQuality(text)
    };
  });
}

function slug(value: string): string {
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

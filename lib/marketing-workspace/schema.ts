export const workspaceSchemaVersion = "8.0.0";
export const workspaceStorageKey = "marketing-os-dr-cadu-workspace-v8";
export const workspaceNotice = "Workspace local tecnico. Nao inserir pacientes, prontuarios, credenciais, tokens, cookies, localizacao precisa ou documentos reais.";

export const safeWorkspaceChannels = ["Instagram", "Stories", "Reels", "Carrossel", "YouTube Shorts", "Meta Ads manual"];
export const safeWorkspaceFormats = ["story", "reel", "post", "carrossel", "ads_manual", "runbook", "backup"];
export const safeWorkspacePillars = [
  "expectativa_realista",
  "estetica_natural",
  "seguranca",
  "cicatrizacao",
  "consulta_nao_e_venda",
  "plastica_em_evidencia",
  "ciencia_simples"
];

export const workspaceMigrations = [
  {
    fromVersion: "7.x",
    toVersion: workspaceSchemaVersion,
    description: "Normaliza workspace antigo para schema local V8 com snapshots, historico e runbook."
  }
];

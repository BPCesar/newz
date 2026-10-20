export const STAGES = [
  ["novo", "Novo"],
  ["contato", "Em contato"],
  ["reuniao", "Reunião"],
  ["proposta", "Proposta enviada"],
  ["negociacao", "Negociação"],
  ["ganho", "Ganho"],
  ["perdido", "Perdido"],
] as const;

export const stageLabel = (s: string) => STAGES.find(([k]) => k === s)?.[1] ?? s;

export type Contact = {
  id: number;
  kind: string;
  stage: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  city: string;
  segment: string;
  source: string;
  estimated_value: string;
  message: string;
  created: string;
};

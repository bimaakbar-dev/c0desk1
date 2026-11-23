import { atom } from "nanostores";

export const pipelineStore = atom<{
  running: boolean;
  topic: string | null;
  phase: string | null;
}>({
  running: false,
  topic: null,
  phase: null,
});
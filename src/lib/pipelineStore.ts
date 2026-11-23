import { atom } from "nanostores";

export interface PipelineState {
  running: boolean;
  topic: string | null;
  phase: string | null;
  stage: string | null;
}

export const pipelineStore = atom<PipelineState>({
  running: false,
  topic: null,
  phase: null,
  stage: null,
});
export interface Scene {
  sceneNumber: number;
  duration: string;
  visual: string;
  voiceover: string;
  mood: string;
}

export interface ScriptResponse {
  title: string;
  scenes: Scene[];
}

export enum AppState {
  IDLE = 'IDLE',
  TRANSCRIBING = 'TRANSCRIBING',
  REVIEW_TRANSCRIPT = 'REVIEW_TRANSCRIPT',
  GENERATING_SCRIPT = 'GENERATING_SCRIPT',
  SCRIPT_READY = 'SCRIPT_READY',
  ERROR = 'ERROR'
}

export interface TranscriptionResult {
  text: string;
  fileName: string;
}


export interface Message {
  action: 'translate';
  text: string;
}

export interface TranslationResponse {
  translation?: string;
  error?: string;
}

export interface Source {
  title: string;
  source_url: string;
  doc_type: string;
  country: string;
  page_content: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: Source[];
  isError?: boolean;
  isWarmingUp?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
}

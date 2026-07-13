import { api } from "./client";
import type { ChatAnswer } from "./types";

export async function askQuestion(question: string, documentId?: string) {
  const { data } = await api.post<ChatAnswer>("/chat/sessions/default/messages", { question, top_k: 5, document_id: documentId });
  return data;
}

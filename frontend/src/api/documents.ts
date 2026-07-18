import { api } from "./client";
import type { DocumentRecord, DocumentVersion } from "./types";

function getErrorDetail(error: unknown) {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (error as { response?: { status?: number; data?: { detail?: string } } }).response;
    if (response?.status === 404) {
      return "PDF upload service was not found. Please restart the backend server so the new PDF upload route is loaded.";
    }
    return response?.data?.detail;
  }
  if (typeof error === "object" && error !== null && "message" in error) {
    const message = String((error as { message?: unknown }).message);
    if (message === "Network Error") {
      return "Backend API is not running. Start or restart the backend server, then upload the PDF again.";
    }
  }
  return undefined;
}

export async function listDocuments() {
  const { data } = await api.get<DocumentRecord[]>("/documents");
  return data;
}

export async function uploadDocument(payload: { title: string; source_filename: string; content: string; space: string }) {
  const { data } = await api.post<DocumentRecord>("/documents", payload);
  return data;
}

export async function uploadDocumentFile(payload: { title: string; space: string; file: File }) {
  const formData = new FormData();
  formData.append("title", payload.title);
  formData.append("space", payload.space);
  formData.append("file", payload.file);
  try {
    const { data } = await api.post<DocumentRecord>("/documents/upload-file", formData);
    return data;
  } catch (error) {
    throw new Error(getErrorDetail(error) ?? "Could not extract text from this PDF.");
  }
}

export async function listDocumentVersions(documentId: string) {
  const { data } = await api.get<DocumentVersion[]>(`/documents/${documentId}/versions`);
  return data;
}

export async function downloadDocument(document: DocumentRecord) {
  const { data } = await api.get<Blob>(`/documents/${document.id}/download`, { responseType: "blob" });
  const url = URL.createObjectURL(data);
  const anchor = window.document.createElement("a");
  anchor.href = url;
  anchor.download = document.source_filename;
  window.document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export async function archiveDocument(documentId: string) {
  const { data } = await api.patch<DocumentRecord>(`/documents/${documentId}/archive`);
  return data;
}

export async function unarchiveDocument(documentId: string) {
  const { data } = await api.patch<DocumentRecord>(`/documents/${documentId}/unarchive`);
  return data;
}

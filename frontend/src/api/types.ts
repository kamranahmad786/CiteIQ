export type DocumentRecord = {
  id: string;
  title: string;
  source_filename: string;
  space: string;
  status: string;
  created_at: string;
  version_id: string;
};

export type DocumentVersion = {
  version_id: string;
  title: string;
  source_filename: string;
  status: string;
  created_at: string;
  retention: string;
};

export type Citation = {
  chunk_id: string;
  document_title: string;
  page_start: number;
  page_end: number;
  section?: string | null;
  score: number;
  content: string;
};

export type ChatAnswer = {
  answer: string;
  citations: Citation[];
};

export type UserProfile = {
  id: string;
  email: string;
  name: string;
  roles: string[];
  organisation: string;
};

export type AuthResponse = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: UserProfile;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type SignupPayload = {
  name: string;
  email: string;
  password: string;
  organisation: string;
};

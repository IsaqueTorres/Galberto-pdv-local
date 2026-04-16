let currentSessionId: number | null = null;

export function setCurrentSession(id: number | null) {
  currentSessionId = id;
}

export function getCurrentSession() {
  return currentSessionId;
}
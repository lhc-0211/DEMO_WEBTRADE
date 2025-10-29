export function getOrCreateSessionId(): string {
  let id = sessionStorage.getItem("sessionIdSocket");
  if (!id) {
    id = crypto.randomUUID(); // tạo sessionId ngẫu nhiên
    sessionStorage.setItem("sessionIdSocket", id);
  }
  return id;
}

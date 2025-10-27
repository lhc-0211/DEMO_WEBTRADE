export function getOrCreateSessionId(): string {
  let id = localStorage.getItem("sessionIdSocket");
  if (!id) {
    id = crypto.randomUUID(); // tạo sessionId ngẫu nhiên
    localStorage.setItem("sessionIdSocket", id);
  }
  return id;
}

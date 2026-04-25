const API_BASE_URL = (import.meta.env.VITE_CHATBOT_API_BASE_URL || "").trim();

function resolveUrl(path) {
  if (API_BASE_URL) {
    return `${API_BASE_URL.replace(/\/+$/, "")}${path}`;
  }
  return `/api${path}`;
}

export async function askChatbot({
  query,
  topK = 5,
  includeDebug = false,
  diseaseName = null,
  sectionType = null,
  sourceType = null,
  biomarker = null,
  timeoutMs = 90000,
  maxRetries = 1,
}) {
  let response = null;
  let attempt = 0;
  while (attempt <= maxRetries) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    try {
      response = await fetch(resolveUrl("/chat/answer"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        signal: controller.signal,
        body: JSON.stringify({
          query,
          top_k: topK,
          include_debug: includeDebug,
          disease_name: diseaseName,
          section_type: sectionType,
          source_type: sourceType,
          biomarker,
        }),
      });
      break;
    } catch (error) {
      const isTimeout = error?.name === "AbortError";
      if (!isTimeout || attempt >= maxRetries) {
        if (isTimeout) {
          throw new Error("Yêu cầu quá thời gian chờ, vui lòng thử lại.");
        }
        throw error;
      }
      attempt += 1;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  if (!response) {
    throw new Error("Không nhận được phản hồi từ API.");
  }

  if (!response.ok) {
    let detail = `HTTP ${response.status}`;
    try {
      const data = await response.json();
      detail = data?.detail || detail;
    } catch {
      // Keep fallback detail.
    }
    throw new Error(detail);
  }

  return response.json();
}

export async function prepareTtsText({ text }) {
  const response = await fetch(resolveUrl("/voice/tts/prepare"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });
  if (!response.ok) {
    let detail = `HTTP ${response.status}`;
    try {
      const data = await response.json();
      detail = data?.detail || detail;
    } catch {
      // Keep fallback detail.
    }
    throw new Error(detail);
  }
  return response.json();
}


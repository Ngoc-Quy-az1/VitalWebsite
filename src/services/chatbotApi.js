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

export async function streamChatbot({
  query,
  topK = 5,
  includeDebug = false,
  diseaseName = null,
  sectionType = null,
  sourceType = null,
  biomarker = null,
  onToken = () => {},
  onDone = () => {},
  timeoutMs = 90000,
}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  let response;

  try {
    response = await fetch(resolveUrl("/chat/stream"), {
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
  } catch (error) {
    clearTimeout(timeoutId);
    if (error?.name === "AbortError") {
      throw new Error("Yêu cầu quá thời gian chờ, vui lòng thử lại.");
    }
    throw error;
  }

  if (!response.ok) {
    clearTimeout(timeoutId);
    let detail = `HTTP ${response.status}`;
    try {
      const data = await response.json();
      detail = data?.detail || detail;
    } catch {
      // Keep fallback detail.
    }
    throw new Error(detail);
  }

  if (!response.body) {
    clearTimeout(timeoutId);
    throw new Error("Trình duyệt không hỗ trợ streaming response.");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let finalPayload = null;
  let collectedAnswer = "";

  const consumeFrame = (frame) => {
    const lines = frame.split(/\r?\n/);
    let eventName = "message";
    const dataLines = [];
    for (const line of lines) {
      if (line.startsWith("event:")) {
        eventName = line.slice("event:".length).trim();
      } else if (line.startsWith("data:")) {
        dataLines.push(line.slice("data:".length).trim());
      }
    }
    if (dataLines.length === 0) return;

    const payload = JSON.parse(dataLines.join("\n"));
    if (eventName === "token") {
      const token = payload?.token || "";
      if (token) {
        collectedAnswer += token;
        onToken(token);
      }
      return;
    }
    if (eventName === "done") {
      finalPayload = payload;
      onDone(payload);
      return;
    }
    if (eventName === "error") {
      throw new Error(payload?.detail || "Không thể stream câu trả lời.");
    }
  };

  try {
    while (true) {
      const { done, value } = await reader.read();
      buffer += decoder.decode(value || new Uint8Array(), { stream: !done });
      const frames = buffer.split(/\r?\n\r?\n/);
      buffer = frames.pop() || "";
      frames.filter(Boolean).forEach(consumeFrame);
      if (done) break;
    }
    if (buffer.trim()) {
      consumeFrame(buffer);
    }
  } finally {
    clearTimeout(timeoutId);
    reader.releaseLock();
  }

  return finalPayload || { answer: collectedAnswer };
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

export async function analyzeHealthReportImage({ file, language = "vi", patientId = null }) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("language", language);
  if (patientId) {
    formData.append("patient_id", patientId);
  }

  const response = await fetch(resolveUrl("/health-report/analyze-image"), {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    let detail = `HTTP ${response.status}`;
    try {
      const data = await response.json();
      detail = data?.detail || detail;
    } catch {
      // fallback
    }
    throw new Error(detail);
  }

  return response.json();
}

export async function analyzeAndAnswerHealthReportImage({
  file,
  question = "Phân tích ảnh đã tải lên",
  language = "vi",
  patientId = null,
  topK = 5,
}) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("question", question);
  formData.append("language", language);
  formData.append("top_k", String(topK));
  if (patientId) {
    formData.append("patient_id", patientId);
  }

  const response = await fetch(resolveUrl("/health-report/analyze-and-answer"), {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    let detail = `HTTP ${response.status}`;
    try {
      const data = await response.json();
      detail = data?.detail || detail;
    } catch {
      // fallback
    }
    throw new Error(detail);
  }
  return response.json();
}

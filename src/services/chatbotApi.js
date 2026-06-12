export function getApiUrl(path) {
  let baseUrl = import.meta.env.VITE_CHATBOT_API_BASE_URL || "";
  if (baseUrl) {
    if (baseUrl.endsWith("/")) {
      baseUrl = baseUrl.slice(0, -1);
    }
    const apiPath = path.startsWith("/auth-api") ? path.replace(/^\/auth-api/, "/api") : path;
    return `${baseUrl}${apiPath}`;
  }
  return path;
}

async function refreshTokensDirectly() {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) {
    throw new Error("No refresh token");
  }
  const response = await fetch(getApiUrl("/auth-api/auth/refresh"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refreshToken }),
  });
  if (!response.ok) {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    window.dispatchEvent(new Event("auth-logout"));
    throw new Error("Session expired. Please log in again.");
  }
  const data = await response.json();
  localStorage.setItem("token", data.token);
  if (data.refreshToken) {
    localStorage.setItem("refreshToken", data.refreshToken);
  }
  return data.token;
}

export async function fetchWithAuth(url, options = {}) {
  let token = localStorage.getItem("token");
  
  const headers = { ...(options.headers || {}) };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  if (options.body && options.body instanceof FormData) {
    delete headers["Content-Type"];
  } else if (!headers["Content-Type"] && (!options.method || options.method === "POST" || options.method === "PUT")) {
    headers["Content-Type"] = "application/json";
  }

  const finalOptions = { ...options, headers };
  let response = await fetch(getApiUrl(url), finalOptions);

  if (response.status === 401) {
    try {
      const newToken = await refreshTokensDirectly();
      headers["Authorization"] = `Bearer ${newToken}`;
      
      // For FormData we must not set manual Content-Type boundary
      const retryHeaders = { ...headers };
      if (options.body && options.body instanceof FormData) {
        delete retryHeaders["Content-Type"];
      }
      
      const retryOptions = { ...options, headers: retryHeaders };
      response = await fetch(getApiUrl(url), retryOptions);
    } catch (refreshError) {
      console.error("Token refresh failed:", refreshError);
      throw new Error("Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.");
    }
  }

  return response;
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
  sessionId = null,
}) {
  let response = null;
  let attempt = 0;
  while (attempt <= maxRetries) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    try {
      response = await fetchWithAuth("/auth-api/ai/1", {
        method: "POST",
        headers: {},
        signal: controller.signal,
        body: JSON.stringify({
          query,
          top_k: topK,
          include_debug: includeDebug,
          disease_name: diseaseName,
          section_type: sectionType,
          source_type: sourceType,
          biomarker,
          session_id: sessionId,
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
  sessionId = null,
  signal = null,
}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  let response;

  try {
    response = await fetchWithAuth("/auth-api/ai/2", {
      method: "POST",
      signal: signal || controller.signal,
      body: JSON.stringify({
        query,
        top_k: topK,
        include_debug: includeDebug,
        disease_name: diseaseName,
        section_type: sectionType,
        source_type: sourceType,
        biomarker,
        session_id: sessionId,
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
  const response = await fetchWithAuth("/auth-api/ai/3", {
    method: "POST",
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

export async function voiceStt({ audio_base64, language = 'vi' }) {
  const response = await fetchWithAuth('/auth-api/ai/6', {
    method: 'POST',
    body: JSON.stringify({ audio_base64, language }),
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

export async function analyzeHealthReportImage({ file, language = "vi", patientId = null }) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("language", language);
  if (patientId) {
    formData.append("patient_id", patientId);
  }

  const response = await fetchWithAuth("/auth-api/ai/4", {
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
  timeoutMs = 300000,
  sessionId = null,
  signal = null,
}) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("question", question);
  formData.append("language", language);
  formData.append("top_k", String(topK));
  if (patientId) {
    formData.append("patient_id", patientId);
  }
  if (sessionId) {
    formData.append("session_id", sessionId);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  let response;
  try {
    response = await fetchWithAuth("/auth-api/ai/5", {
      method: "POST",
      body: formData,
      signal: signal || controller.signal,
    });
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error("Phân tích ảnh quá thời gian chờ (OCR + AI). Vui lòng thử lại.");
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }

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


const API_BASE_URL = (import.meta.env.VITE_CHATBOT_API_BASE_URL || "").trim();

function resolveUrl(path) {
  if (API_BASE_URL) {
    return `${API_BASE_URL.replace(/\/+$/, "")}${path}`;
  }
  return `/api${path}`;
}

async function explainApiMisconfiguration(status) {
  if (status !== 404) {
    return null;
  }
  try {
    const healthRes = await fetch(resolveUrl("/health"));
    if (!healthRes.ok) {
      return "Không kết nối được chatbot API (cổng 8000). Chạy: .\\scripts\\run_chatbot_api.ps1 trong VitalAI.";
    }
    const health = await healthRes.json();
    if (health?.service === "vitalai-medical-tools") {
      return (
        "Cổng 8000 đang chạy medical_tools (sai). Dừng lệnh uvicorn medical_tools trên cổng 8000, " +
        "chạy medical_tools trên 8010 (.\\scripts\\run_medical_tools.ps1) và chatbot trên 8000 (.\\scripts\\run_chatbot_api.ps1)."
      );
    }
    if (health?.service !== "vitalai-chatbot-api") {
      return `API /health trả service không mong đợi: ${health?.service ?? "unknown"}.`;
    }
  } catch {
    return "Không kết nối được chatbot API. Kiểm tra backend VitalAI đang chạy trên cổng 8000.";
  }
  return null;
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
    const misconfig = await explainApiMisconfiguration(response.status);
    if (misconfig) {
      throw new Error(misconfig);
    }
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
  timeoutMs = 300000,
}) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("question", question);
  formData.append("language", language);
  formData.append("top_k", String(topK));
  if (patientId) {
    formData.append("patient_id", patientId);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  let response;
  try {
    response = await fetch(resolveUrl("/health-report/analyze-and-answer"), {
      method: "POST",
      body: formData,
      signal: controller.signal,
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


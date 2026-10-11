/**
 * Client-side document extractor & resilient uploader
 * Bypasses Vercel Serverless 4.5MB payload limit by extracting text locally for large files
 * and safely handling all HTTP responses (preventing unhandled JSON parse crashes on 413 / HTML errors).
 */

/**
 * Extracts raw text from DOCX (ZIP archive) without external dependencies
 */
async function extractDocxTextLocally(buffer: ArrayBuffer): Promise<string> {
  try {
    const bytes = new Uint8Array(buffer);
    const view = new DataView(buffer);
    let pos = 0;
    const xmlTexts: string[] = [];

    while (pos < bytes.length - 30) {
      // Check for ZIP Local File Header magic bytes PK\x03\x04
      if (
        bytes[pos] === 0x50 &&
        bytes[pos + 1] === 0x4b &&
        bytes[pos + 2] === 0x03 &&
        bytes[pos + 3] === 0x04
      ) {
        const compression = view.getUint16(pos + 8, true);
        const compressedSize = view.getUint32(pos + 18, true);
        const nameLen = view.getUint16(pos + 26, true);
        const extraLen = view.getUint16(pos + 28, true);
        const fileNameBytes = bytes.subarray(pos + 30, pos + 30 + nameLen);
        const entryName = new TextDecoder().decode(fileNameBytes);

        const dataStart = pos + 30 + nameLen + extraLen;
        if (
          (entryName === "word/document.xml" || entryName.startsWith("word/header") || entryName.startsWith("word/footer")) &&
          dataStart + compressedSize <= bytes.length
        ) {
          const compressedData = bytes.subarray(dataStart, dataStart + compressedSize);
          try {
            let decompressedBuffer: ArrayBuffer | null = null;
            if (compression === 8 && typeof DecompressionStream !== "undefined") {
              const ds = new DecompressionStream("deflate-raw");
              const writer = ds.writable.getWriter();
              writer.write(compressedData);
              writer.close();
              decompressedBuffer = await new Response(ds.readable).arrayBuffer();
            } else if (compression === 0) {
              decompressedBuffer = compressedData.buffer.slice(
                compressedData.byteOffset,
                compressedData.byteOffset + compressedData.byteLength
              );
            }
            if (decompressedBuffer && decompressedBuffer.byteLength > 0) {
              const xml = new TextDecoder("utf-8").decode(decompressedBuffer);
              const matches = xml.match(/<w:t[^>]*>([^<]+)<\/w:t>/g);
              if (matches) {
                xmlTexts.push(matches.map((m) => m.replace(/<[^>]+>/g, "")).join(" "));
              } else {
                xmlTexts.push(xml.replace(/<[^>]+>/g, " "));
              }
            }
          } catch {
            // Skip unparseable zip chunk
          }
        }
        pos = dataStart + compressedSize;
      } else {
        pos++;
      }
    }

    return xmlTexts.join("\n");
  } catch {
    return "";
  }
}

export async function extractTextLocally(file: File): Promise<string> {
  const extension = (file.name.split(".").pop() || "").toLowerCase();

  // 1. Plain text, markdown, CSV, RTF
  if (["txt", "csv", "tsv", "rtf", "md"].includes(extension)) {
    return await file.text();
  }

  // 2. Binary files (PDF, DOCX, DOC)
  const arrayBuffer = await file.arrayBuffer();

  // Handle DOCX locally
  if (extension === "docx") {
    const docxText = await extractDocxTextLocally(arrayBuffer);
    if (docxText && docxText.trim().length > 30) {
      return docxText;
    }
  }

  const bytes = new Uint8Array(arrayBuffer);
  const latinStr = new TextDecoder("latin1").decode(bytes);

  // If PDF, extract text streams & text operators (BT ... ET)
  if (extension === "pdf") {
    const textChunks: string[] = [];

    // Match text blocks inside BT (Begin Text) ... ET (End Text)
    const btMatches = latinStr.match(/BT[\s\S]*?ET/g);
    if (btMatches && btMatches.length > 0) {
      for (const block of btMatches) {
        const strMatches = block.match(/\(([^)]+)\)/g);
        if (strMatches) {
          const blockText = strMatches.map((s) => s.slice(1, -1)).join(" ");
          if (blockText.trim().length > 1) {
            textChunks.push(blockText);
          }
        }
      }
    }

    // Try decompressing streams using browser native DecompressionStream if available
    if (textChunks.length < 5 && typeof DecompressionStream !== "undefined") {
      const streamRegex = /stream[\r\n]+([\s\S]*?)[\r\n]+endstream/g;
      let m;
      let streamCount = 0;
      while ((m = streamRegex.exec(latinStr)) !== null && streamCount < 75) {
        streamCount++;
        const streamContent = m[1];
        try {
          const streamBytes = new Uint8Array(streamContent.length);
          for (let i = 0; i < streamContent.length; i++) {
            streamBytes[i] = streamContent.charCodeAt(i);
          }

          let decompressed: ArrayBuffer | null = null;
          // Try standard zlib deflate first
          try {
            const ds = new DecompressionStream("deflate");
            const writer = ds.writable.getWriter();
            writer.write(streamBytes);
            writer.close();
            decompressed = await new Response(ds.readable).arrayBuffer();
          } catch {
            // Try deflate-raw fallback
            try {
              const ds = new DecompressionStream("deflate-raw");
              const writer = ds.writable.getWriter();
              writer.write(streamBytes.slice(2)); // strip zlib header
              writer.close();
              decompressed = await new Response(ds.readable).arrayBuffer();
            } catch {
              // Not a deflate stream
            }
          }

          if (decompressed && decompressed.byteLength > 0) {
            const decoded = new TextDecoder("latin1").decode(decompressed);
            const subBt = decoded.match(/\(([^)]+)\)/g);
            if (subBt) {
              textChunks.push(subBt.map((s) => s.slice(1, -1)).join(" "));
            }
          }
        } catch {
          // Skip stream error
        }
      }
    }

    if (textChunks.length > 0) {
      return textChunks.join("\n");
    }
  }

  // Fallback: extract continuous printable ASCII sequences (> 3 chars)
  const printable = latinStr.replace(/[^\x20-\x7E\n\r\t]/g, " ");
  const words = printable.split(/\s+/).filter((w) => w.length > 2);
  return words.join(" ");
}

/**
 * Robust lease agreement uploader with multi-stage fallbacks:
 * 1. Checks file size. If > 3.8MB, extracts text in the browser and sends JSON to bypass Vercel 4.5MB limit.
 * 2. If <= 3.8MB, sends via FormData. If Vercel responds with 413, automatically falls back to client text extraction.
 * 3. Safely parses HTTP response (never crashes on plain text or HTML error pages).
 */
export async function uploadAndParseAgreement(file: File) {
  if (!file) throw new Error("No file provided");

  const MAX_DIRECT_UPLOAD_BYTES = 3.8 * 1024 * 1024; // 3.8 MB (safely below Vercel's 4.5 MB hard limit)

  // Stage 1: If file exceeds serverless threshold, extract text locally first
  if (file.size > MAX_DIRECT_UPLOAD_BYTES) {
    try {
      const localText = await extractTextLocally(file);
      if (localText && localText.trim().length > 30) {
        const res = await fetch("/api/contracts/parse-agreement", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: localText,
            fileName: file.name,
            fileSize: file.size,
          }),
        });

        const contentType = res.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          const json = await res.json();
          if (res.ok && json.success) return json;
          throw new Error(json.error || "Failed to extract terms from document.");
        }
        const textErr = await res.text();
        throw new Error(textErr || `Server returned ${res.status}`);
      }
    } catch (localErr: any) {
      console.warn("Client text extraction attempt failed, falling back to direct upload:", localErr);
    }
  }

  // Stage 2: Direct multipart/form-data upload
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/api/contracts/parse-agreement", {
    method: "POST",
    body: formData,
  });

  // Safe response parsing — handles 413 Request Entity Too Large or HTML error pages gracefully
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    const json = await res.json();
    if (res.ok && json.success) {
      return json;
    }
    throw new Error(json.error || "Failed to extract terms from document.");
  }

  // If server returned non-JSON (e.g. 413 Request Entity Too Large)
  const rawResponseText = await res.text();
  const isTooLarge = res.status === 413 || rawResponseText.toLowerCase().includes("request entity too large");

  if (isTooLarge) {
    // Stage 3: Reactive fallback — extract text locally and re-send as lightweight JSON
    const fallbackText = await extractTextLocally(file);
    if (fallbackText && fallbackText.trim().length > 30) {
      const retryRes = await fetch("/api/contracts/parse-agreement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: fallbackText,
          fileName: file.name,
          fileSize: file.size,
        }),
      });

      const retryContentType = retryRes.headers.get("content-type") || "";
      if (retryContentType.includes("application/json")) {
        const retryJson = await retryRes.json();
        if (retryRes.ok && retryJson.success) return retryJson;
        throw new Error(retryJson.error || "Failed to extract terms from document.");
      }
    }

    throw new Error(
      `File (${(file.size / (1024 * 1024)).toFixed(1)} MB) exceeds serverless upload limit (4.5 MB). Please upload a compressed PDF or document under 4 MB.`
    );
  }

  throw new Error(rawResponseText || `Server returned HTTP ${res.status}`);
}

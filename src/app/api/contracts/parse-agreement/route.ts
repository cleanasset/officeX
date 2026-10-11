import { NextResponse } from "next/server";
import { parseCommercialLeaseText } from "@/lib/rent-roll/lease-agreement-parser";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No agreement file provided" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileName = file.name || "agreement";
    const extension = fileName.split(".").pop()?.toLowerCase() || "";

    let extractedText = "";

    if (extension === "pdf") {
      try {
        // PDF extraction with pdf-parse v2
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { PDFParse } = require("pdf-parse");
        const parser = new PDFParse({ data: buffer });
        await parser.load();
        const pdfResult = await parser.getText();
        await parser.destroy();
        extractedText = typeof pdfResult === "string" ? pdfResult : (pdfResult?.text || "");
      } catch (pdfErr: any) {
        console.warn("PDF extraction warning, attempting fallback text read:", pdfErr?.message);
        // Fallback: extract ASCII printable strings from raw buffer
        extractedText = buffer.toString("latin1").replace(/[^\x20-\x7E\n\r\t]/g, " ");
      }
    } else if (extension === "docx" || extension === "doc") {
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const mammoth = require("mammoth");
        const docResult = await mammoth.extractRawText({ buffer });
        extractedText = docResult.value || "";
      } catch (docErr: any) {
        console.warn("Mammoth extraction warning:", docErr?.message);
        extractedText = buffer.toString("utf-8");
      }
    } else {
      // Plain text, Markdown, CSV, RTF
      extractedText = buffer.toString("utf-8");
    }

    if (!extractedText || extractedText.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Could not extract readable text from document. Please verify the file is not empty or password protected.",
        },
        { status: 422 }
      );
    }

    // Parse commercial lease particulars
    const leaseData = parseCommercialLeaseText(extractedText, fileName);

    return NextResponse.json({
      success: true,
      fileName,
      fileSize: file.size,
      textLength: extractedText.length,
      sampleSnippet: extractedText.slice(0, 300),
      data: leaseData,
    });
  } catch (error: any) {
    console.error("Agreement parsing error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to parse lease agreement",
      },
      { status: 500 }
    );
  }
}

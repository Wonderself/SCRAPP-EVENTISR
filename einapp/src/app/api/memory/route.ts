import { NextRequest, NextResponse } from "next/server";
import { listMemoryFiles, readMemoryFile, writeMemoryFile, isValidMemoryFile } from "@/lib/memory";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const file = searchParams.get("file");

    if (file) {
      if (!isValidMemoryFile(file)) {
        return NextResponse.json({ error: "invalid file" }, { status: 400 });
      }
      const content = readMemoryFile(file);
      return NextResponse.json({ content });
    }

    const files = listMemoryFiles();
    return NextResponse.json({ files });
  } catch (error: any) {
    console.error("[Memory API] GET error:", error);
    return NextResponse.json({ error: error.message || "Unknown error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { file, content } = await req.json();
    if (!file || !isValidMemoryFile(file)) {
      return NextResponse.json({ error: "invalid file" }, { status: 400 });
    }
    writeMemoryFile(file, content);
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("[Memory API] POST error:", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

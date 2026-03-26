import { NextRequest, NextResponse } from "next/server";
import { listMemoryFiles, readMemoryFile, writeMemoryFile, isValidMemoryFile } from "@/lib/memory";

export async function GET(req: NextRequest) {
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
}

export async function POST(req: NextRequest) {
  const { file, content } = await req.json();

  try {
    writeMemoryFile(file, content);
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

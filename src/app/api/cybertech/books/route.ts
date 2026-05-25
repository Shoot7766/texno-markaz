import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const booksFilePath = path.join(process.cwd(), "src/app/(marketing)/cyber-tech/books.json");

export async function GET() {
  try {
    const fileContent = await fs.readFile(booksFilePath, "utf-8");
    const books = JSON.parse(fileContent);
    return NextResponse.json(books);
  } catch (error) {
    console.error("Error reading books.json:", error);
    return NextResponse.json([], { status: 200 }); // Return empty array instead of 404
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!Array.isArray(body)) {
      return NextResponse.json({ error: "Noto'g'ri kitoblar formati" }, { status: 400 });
    }
    await fs.writeFile(booksFilePath, JSON.stringify(body, null, 2), "utf-8");
    return NextResponse.json({ success: true, message: "Kitoblar muvaffaqiyatli saqlandi!" });
  } catch (error: any) {
    console.error("Error writing books.json:", error);
    return NextResponse.json({ error: error.message || "Kitoblarni saqlashda xatolik" }, { status: 500 });
  }
}

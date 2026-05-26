import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/admin";
import fs from "fs/promises";
import path from "path";

const booksFilePath = path.join(process.cwd(), "src/app/(marketing)/cyber-tech/books.json");

export async function GET() {
  try {
    const supabase = createServiceClient();
    
    // Fetch books from hidden course record in Supabase
    const { data: dbCourse } = await supabase
      .from("courses")
      .select("description")
      .eq("slug", "cyber-tech-books-data")
      .maybeSingle();

    if (dbCourse?.description) {
      const books = JSON.parse(dbCourse.description);
      return NextResponse.json(books);
    }

    // Fallback/Seed from local books.json for the first run
    const fileContent = await fs.readFile(booksFilePath, "utf-8");
    const initialBooks = JSON.parse(fileContent);

    // Seed into Supabase for next requests
    await supabase.from("courses").upsert({
      id: "b000000b-0000-4000-8000-000000000000",
      name: "Cyber Tech Kutubxonasi",
      slug: "cyber-tech-books-data",
      description: JSON.stringify(initialBooks),
      price: 0,
      duration: "0",
      is_active: false
    });

    return NextResponse.json(initialBooks);
  } catch (error) {
    console.error("Error reading books from Supabase GET:", error);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!Array.isArray(body)) {
      return NextResponse.json({ error: "Noto'g'ri kitoblar formati" }, { status: 400 });
    }

    const supabase = createServiceClient();

    // Save/Upsert books JSON directly into the cloud database
    const { error } = await supabase.from("courses").upsert({
      id: "b000000b-0000-4000-8000-000000000000",
      name: "Cyber Tech Kutubxonasi",
      slug: "cyber-tech-books-data",
      description: JSON.stringify(body),
      price: 0,
      duration: "0",
      is_active: false
    });

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ success: true, message: "Kitoblar muvaffaqiyatli saqlandi!" });
  } catch (error: any) {
    console.error("Error writing books to Supabase POST:", error);
    return NextResponse.json({ error: error.message || "Kitoblarni saqlashda xatolik" }, { status: 500 });
  }
}

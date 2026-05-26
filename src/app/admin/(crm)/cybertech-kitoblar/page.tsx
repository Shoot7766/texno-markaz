import fs from "fs/promises";
import path from "path";
import { createServiceClient } from "@/lib/supabase/admin";
import { CybertechBooksClient } from "./client";

export const metadata = { title: "CT Kitoblar Boshqaruvi" };

export default async function AdminCybertechBooksPage() {
  let initialBooks = [];

  try {
    const supabase = createServiceClient();
    
    // Fetch books from hidden course record in Supabase
    const { data: dbCourse } = await supabase
      .from("courses")
      .select("description")
      .eq("slug", "cyber-tech-books-data")
      .maybeSingle();

    if (dbCourse?.description) {
      initialBooks = JSON.parse(dbCourse.description);
    } else {
      // Fallback/Seed from local books.json for first run
      const booksFilePath = path.join(process.cwd(), "src/app/(marketing)/cyber-tech/books.json");
      const fileContent = await fs.readFile(booksFilePath, "utf-8");
      initialBooks = JSON.parse(fileContent);

      // Seed into Supabase
      await supabase.from("courses").upsert({
        id: "b000000b-0000-4000-8000-000000000000",
        name: "Cyber Tech Kutubxonasi",
        slug: "cyber-tech-books-data",
        description: JSON.stringify(initialBooks),
        price: 0,
        duration: "0",
        is_active: false
      });
    }
  } catch (error) {
    console.error("Error reading books inside server component:", error);
  }

  return (
    <CybertechBooksClient initialBooks={initialBooks} />
  );
}

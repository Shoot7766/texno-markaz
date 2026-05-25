import fs from "fs/promises";
import path from "path";
import { CybertechBooksClient } from "./client";

export const metadata = { title: "CT Kitoblar Boshqaruvi" };

export default async function AdminCybertechBooksPage() {
  const booksFilePath = path.join(process.cwd(), "src/app/(marketing)/cyber-tech/books.json");
  let initialBooks = [];

  try {
    const fileContent = await fs.readFile(booksFilePath, "utf-8");
    initialBooks = JSON.parse(fileContent);
  } catch (error) {
    console.error("Error reading books.json inside server component:", error);
  }

  return (
    <CybertechBooksClient initialBooks={initialBooks} />
  );
}

import { z } from "zod";

export const arizaSchema = z.object({
  first_name: z.string().trim().min(2, "Ism kamida 2 belgi").max(80),
  last_name: z.string().trim().min(2, "Familiya kamida 2 belgi").max(80),
  phone: z
    .string()
    .trim()
    .regex(/^\+998[0-9]{9}$/, "Telefon: +998901234567 formatida kiriting"),
  age: z.number().min(10).max(80),
  course_or_package: z.string().min(1, "Kurs yoki paketni tanlang"),
  preferred_time: z.string().max(200).default(""),
  source: z.enum(["instagram", "telegram", "tanish", "maktab", "boshqa"]),
  comment: z.string().max(2000).default(""),
  visitor_id: z.string().optional(),
  /** Spam honeypot — bo‘sh bo‘lishi kerak */
  website: z.string().optional(),
});

export type ArizaInput = z.infer<typeof arizaSchema>;

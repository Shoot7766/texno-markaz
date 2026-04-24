/** Supabase nested select `courses(...)` may return one row or an array depending on typings. */
export type CourseRef = { name: string | null; slug: string | null };

export type NestedCourseField = CourseRef | CourseRef[] | null | undefined;

export function pickNestedCourse(courses: NestedCourseField): CourseRef | null {
  if (!courses) return null;
  return Array.isArray(courses) ? courses[0] ?? null : courses;
}

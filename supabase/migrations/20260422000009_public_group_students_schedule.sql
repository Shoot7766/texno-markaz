create or replace function public.get_public_group_students(p_group_id uuid default null)
returns table (
  group_id uuid,
  student_id uuid,
  student_name text
)
language sql
security definer
set search_path = public
as $$
  select
    s.group_id,
    s.id as student_id,
    trim(s.first_name || ' ' || s.last_name) as student_name
  from public.students s
  join public.groups g on g.id = s.group_id
  where s.status = 'active'
    and g.is_active = true
    and (p_group_id is null or s.group_id = p_group_id);
$$;

grant execute on function public.get_public_group_students(uuid) to anon, authenticated;


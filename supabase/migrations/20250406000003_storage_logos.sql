-- Supabase Storage: logo (ommaviy o‘qish, faqat admin yozadi)
insert into storage.buckets (id, name, public)
values ('logos', 'logos', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "Logos public read" on storage.objects;
create policy "Logos public read"
  on storage.objects for select
  using (bucket_id = 'logos');

drop policy if exists "admins upload logos" on storage.objects;
create policy "admins upload logos"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'logos'
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.is_admin = true
    )
  );

drop policy if exists "admins update logos" on storage.objects;
create policy "admins update logos"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'logos'
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.is_admin = true
    )
  );

drop policy if exists "admins delete logos" on storage.objects;
create policy "admins delete logos"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'logos'
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.is_admin = true
    )
  );

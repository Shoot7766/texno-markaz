-- Update center_name from Texno Markaz to Cyber Tech Academy
update public.settings
set center_name = 'Cyber Tech Academy'
where center_name = 'Texno Markaz';

-- If no row exists, insert default
insert into public.settings (center_name)
select 'Cyber Tech Academy'
where not exists (select 1 from public.settings);

begin;

drop policy if exists "profiles_update_admin" on public.profiles;

create or replace function public.change_user_role(
  requested_user_id uuid,
  requested_role public.app_role
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  current_app_role public.app_role;
  target_role public.app_role;
begin
  select role
  into current_app_role
  from public.profiles
  where id = current_user_id
    and is_active = true;

  if current_user_id is null or current_app_role <> 'admin' then
    raise exception 'Only an active Admin can change user roles.';
  end if;

  if requested_user_id = current_user_id then
    raise exception 'You cannot change your own role.';
  end if;

  select role
  into target_role
  from public.profiles
  where id = requested_user_id
  for update;

  if target_role is null then
    raise exception 'User profile not found.';
  end if;

  if target_role = requested_role then
    return;
  end if;

  update public.profiles
  set role = requested_role
  where id = requested_user_id;
end;
$$;

revoke all on function public.change_user_role(uuid, public.app_role)
from public, anon;
grant execute on function public.change_user_role(uuid, public.app_role)
to authenticated;

commit;

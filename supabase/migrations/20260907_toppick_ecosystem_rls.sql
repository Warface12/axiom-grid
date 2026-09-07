-- Align click ledger with existing affiliate_click and add self-only RLS for consumer tables.
-- Additive. Service role still bypasses RLS for Admin/API.

alter table if exists public.affiliate_click add column if not exists click_id text;
create unique index if not exists affiliate_click_click_id_uidx on public.affiliate_click (click_id) where click_id is not null;

do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'user_profile' and policyname = 'user_profile_self') then
    create policy user_profile_self on public.user_profile
      for all using (auth.uid() = auth_user_id) with check (auth.uid() = auth_user_id);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'notification_preference' and policyname = 'notification_preference_self') then
    create policy notification_preference_self on public.notification_preference
      for all using (exists (select 1 from public.user_profile p where p.id = user_id and p.auth_user_id = auth.uid()))
      with check (exists (select 1 from public.user_profile p where p.id = user_id and p.auth_user_id = auth.uid()));
  end if;
  if not exists (select 1 from pg_policies where tablename = 'user_saved_item' and policyname = 'user_saved_item_self') then
    create policy user_saved_item_self on public.user_saved_item
      for all using (exists (select 1 from public.user_profile p where p.id = user_id and p.auth_user_id = auth.uid()))
      with check (exists (select 1 from public.user_profile p where p.id = user_id and p.auth_user_id = auth.uid()));
  end if;
  if not exists (select 1 from pg_policies where tablename = 'user_follow' and policyname = 'user_follow_self') then
    create policy user_follow_self on public.user_follow
      for all using (exists (select 1 from public.user_profile p where p.id = user_id and p.auth_user_id = auth.uid()))
      with check (exists (select 1 from public.user_profile p where p.id = user_id and p.auth_user_id = auth.uid()));
  end if;
  if not exists (select 1 from pg_policies where tablename = 'user_notification' and policyname = 'user_notification_self') then
    create policy user_notification_self on public.user_notification
      for all using (exists (select 1 from public.user_profile p where p.id = user_id and p.auth_user_id = auth.uid()))
      with check (exists (select 1 from public.user_profile p where p.id = user_id and p.auth_user_id = auth.uid()));
  end if;
  if not exists (select 1 from pg_policies where tablename = 'partner_membership' and policyname = 'partner_membership_self_read') then
    create policy partner_membership_self_read on public.partner_membership
      for select using (auth.uid() = auth_user_id);
  end if;
end $$;

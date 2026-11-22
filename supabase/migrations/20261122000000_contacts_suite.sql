-- Emails des personnes qui veulent connaître la suite (restitution, débat).
-- Table à part : aucun lien avec les réponses à la consultation, ni identifiant commun, ni heure.
-- Migration rejouable : en développement local, elle repasse sur une base PGlite existante.

create table if not exists public.contacts_suite (
  email text primary key,
  jour date not null
);

alter table public.contacts_suite enable row level security;
revoke all on public.contacts_suite from public, anon, authenticated;
grant all on public.contacts_suite to service_role;

-- Ajoute l'email s'il n'y est pas déjà. Même réponse dans les deux cas, pour ne rien révéler.
create or replace function public.inscrire_contact_suite(_email text, _jour date)
returns boolean language plpgsql security definer set search_path = public as $$
begin
  insert into contacts_suite (email, jour) values (lower(trim(_email)), _jour)
  on conflict (email) do nothing;
  return true;
end $$;

create or replace function public.admin_contacts_suite()
returns jsonb language sql stable security definer set search_path = public as $$
  select coalesce(jsonb_agg(to_jsonb(c) order by c.email), '[]'::jsonb) from contacts_suite c;
$$;

-- La purge planifiée supprime aussi ces emails à la même date que les inscriptions aux ateliers.
create or replace function public.purger_donnees_ateliers(_a_partir_du date)
returns integer language plpgsql security definer set search_path = public as $$
declare n integer := 0;
begin
  delete from limites_envoi where cree_le < now() - interval '24 hours';
  delete from admin_sessions where expires_at < now() - interval '7 days';
  if (now() at time zone 'Europe/Paris')::date >= _a_partir_du then
    delete from inscriptions_ateliers;
    get diagnostics n = row_count;
    delete from contacts_suite;
  end if;
  return n;
end $$;

revoke all on function public.inscrire_contact_suite(text, date) from public, anon, authenticated;
revoke all on function public.admin_contacts_suite() from public, anon, authenticated;
revoke all on function public.purger_donnees_ateliers(date) from public, anon, authenticated;
grant execute on function public.inscrire_contact_suite(text, date) to service_role;
grant execute on function public.admin_contacts_suite() to service_role;
grant execute on function public.purger_donnees_ateliers(date) to service_role;

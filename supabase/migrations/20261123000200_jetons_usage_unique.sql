-- Jeton de formulaire à usage unique : un même envoi ne peut pas être enregistré deux fois.
-- Table séparée : seulement l'empreinte salée du jeton, ni heure, ni lien avec les réponses.
-- Elle est vidée après la clôture de la consultation. Migration rejouable.

create table if not exists public.jetons_utilises (
  empreinte text primary key
);
alter table public.jetons_utilises enable row level security;
revoke all on public.jetons_utilises from public, anon, authenticated;
grant all on public.jetons_utilises to service_role;

drop function if exists public.enregistrer_reponse(jsonb);
drop function if exists public.enregistrer_reponse(jsonb, text);
create function public.enregistrer_reponse(r jsonb, _jeton text default null)
returns jsonb language plpgsql security definer set search_path = public as $$
declare rang integer; n integer;
begin
  perform pg_advisory_xact_lock(hashtext('reponses_consultation'));
  -- Consommation du jeton dans la même transaction que la réponse : tout ou rien.
  if _jeton is not null then
    insert into jetons_utilises (empreinte) values (_jeton) on conflict do nothing;
    get diagnostics n = row_count;
    if n = 0 then
      return jsonb_build_object('statut', 'jeton_deja_utilise');
    end if;
  end if;
  insert into reponses_consultation (jour, age, genre, region, lieu_vie, situation, parent, liens_enfance, lien_sujet, classement,
    mesure_manquante, presence_debat, poids_vote, provenance, version_questionnaire, ordre_affichage, mesures_rejetees)
  values ((r->>'jour')::date, r->>'age', r->>'genre', r->>'region', r->>'lieu_vie', r->>'situation', r->>'parent',
    array(select jsonb_array_elements_text(r->'liens_enfance')),
    array(select jsonb_array_elements_text(r->'lien_sujet')),
    array(select jsonb_array_elements_text(r->'classement')),
    nullif(r->>'mesure_manquante', ''), r->>'presence_debat', r->>'poids_vote', r->>'provenance',
    r->>'version_questionnaire',
    array(select jsonb_array_elements_text(r->'ordre_affichage')),
    array(select jsonb_array_elements_text(coalesce(r->'mesures_rejetees', '[]'::jsonb))));
  select count(*)::integer into rang from reponses_consultation;
  return jsonb_build_object('statut', 'ok', 'rang', rang);
end $$;

-- Vide la table des jetons à partir du lendemain de la clôture (heure de Paris).
create or replace function public.purger_jetons_utilises(_a_partir_du date)
returns integer language plpgsql security definer set search_path = public as $$
declare n integer := 0;
begin
  if (now() at time zone 'Europe/Paris')::date >= _a_partir_du then
    delete from jetons_utilises;
    get diagnostics n = row_count;
  end if;
  return n;
end $$;

revoke all on function public.enregistrer_reponse(jsonb, text) from public, anon, authenticated;
revoke all on function public.purger_jetons_utilises(date) from public, anon, authenticated;
grant execute on function public.enregistrer_reponse(jsonb, text) to service_role;
grant execute on function public.purger_jetons_utilises(date) to service_role;

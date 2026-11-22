-- Compteur public des réponses et rang de chaque réponse.
-- Le rang est calculé sous verrou au moment de l'envoi et renvoyé à la seule personne qui répond.
-- Il n'est stocké nulle part. Migration rejouable.

create or replace function public.nombre_reponses()
returns integer language sql stable security definer set search_path = public as $$
  select count(*)::integer from reponses_consultation;
$$;

drop function if exists public.enregistrer_reponse(jsonb);
create function public.enregistrer_reponse(r jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
declare rang integer;
begin
  -- Verrou court : deux envois simultanés ne reçoivent jamais le même rang.
  perform pg_advisory_xact_lock(hashtext('reponses_consultation'));
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

revoke all on function public.nombre_reponses() from public, anon, authenticated;
revoke all on function public.enregistrer_reponse(jsonb) from public, anon, authenticated;
grant execute on function public.nombre_reponses() to service_role;
grant execute on function public.enregistrer_reponse(jsonb) to service_role;

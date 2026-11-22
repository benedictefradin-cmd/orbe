-- Questionnaire v2 : ordre d'affichage des mesures, mesures non soutenues, version du questionnaire.
-- Les réponses déjà enregistrées ne sont ni modifiées ni supprimées : elles reçoivent la version 'v1',
-- et les nouvelles colonnes restent vides (null) pour elles, car ces questions n'existaient pas.
-- Migration rejouable : en développement local, elle repasse sur une base PGlite existante.

alter table public.reponses_consultation
  add column if not exists version_questionnaire text not null default 'v1',
  add column if not exists ordre_affichage text[],
  add column if not exists mesures_rejetees text[];

-- La valeur par défaut ne sert qu'à marquer les réponses existantes. Ensuite, chaque envoi indique sa version.
alter table public.reponses_consultation alter column version_questionnaire drop default;

create index if not exists reponses_consultation_version on public.reponses_consultation (version_questionnaire);

-- Le type de retour change (jsonb au lieu d'uuid) : la fonction est recréée.
drop function if exists public.enregistrer_reponse(jsonb);
create function public.enregistrer_reponse(r jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
begin
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
  return jsonb_build_object('statut', 'ok');
end $$;

revoke all on function public.enregistrer_reponse(jsonb) from public, anon, authenticated;
grant execute on function public.enregistrer_reponse(jsonb) to service_role;

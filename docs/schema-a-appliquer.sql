-- Schéma complet à coller dans Supabase, SQL Editor, si vous n'utilisez pas la CLI Supabase.
-- Généré à partir de supabase/migrations, dans l'ordre. Sur une base existante, ne collez que les migrations
-- qui n'y sont pas encore (les migrations après la première sont rejouables). Fonctions serveur attendues :
--   synchroniser_ateliers, etat_places, promouvoir_liste_attente, inscrire_atelier, annuler_par_jeton,
--   inscription_par_jeton, enregistrer_reponse, verifier_limite, admin_session_creer, admin_session_valide,
--   admin_session_revoquer, admin_reponses, admin_inscriptions, admin_cocher, admin_commenter, admin_annuler,
--   purger_donnees_ateliers, inscrire_contact_suite, admin_contacts_suite, nombre_reponses,
--   purger_jetons_utilises

-- ═════ supabase/migrations/20261121000000_consultation_ateliers.sql
-- Consultation citoyenne et ateliers · schéma initial
-- Tout passe par des fonctions appelées côté serveur (rôle service_role).
-- Aucune table ni fonction n'est accessible aux rôles anon et authenticated.

-- ───────────── Tables ─────────────

create table public.ateliers (
  id text primary key,
  titre text not null,
  debut timestamptz not null,
  fin timestamptz not null,
  capacite integer check (capacite is null or capacite > 0) -- null = illimité
);

-- Une ligne par réponse complète. Ni IP, ni identifiant d'appareil, ni email, ni heure.
create table public.reponses_consultation (
  id uuid primary key default gen_random_uuid(),
  jour date not null,
  age text not null,
  genre text not null,
  region text not null,
  lieu_vie text not null,
  situation text not null,
  parent text not null,
  liens_enfance text[] not null,
  lien_sujet text[] not null default '{}',
  classement text[] not null,
  mesure_manquante text,
  presence_debat text,
  poids_vote text,
  provenance text
);
create index reponses_consultation_jour on public.reponses_consultation (jour);

-- Une ligne par personne inscrite.
create table public.inscriptions_ateliers (
  id uuid primary key default gen_random_uuid(),
  cree_le timestamptz not null default now(),
  prenom text not null,
  nom text not null,
  email text not null,
  departement text,
  situations text[] not null default '{}',
  situation_autre text,
  structure text,
  motivation text,
  accessibilite text,
  majeur_confirme_le timestamptz not null,
  consentement_organisation_le timestamptz not null,
  actualites_ir_le timestamptz,
  actualites_fai_le timestamptz,
  jeton_annulation uuid not null unique default gen_random_uuid(),
  commentaire text
);
create index inscriptions_ateliers_email on public.inscriptions_ateliers (lower(email));

-- Les dates choisies par chaque personne, avec un statut par date.
create table public.inscriptions_dates (
  inscription_id uuid not null references public.inscriptions_ateliers (id) on delete cascade,
  atelier_id text not null references public.ateliers (id),
  statut text not null check (statut in ('inscrit', 'liste_attente', 'annule')),
  cree_le timestamptz not null default now(),
  promu_le timestamptz,          -- sortie de la liste d'attente
  prevenu_le timestamptz,        -- l'organisatrice a prévenu la personne promue
  annule_le timestamptz,
  annule_par text check (annule_par in ('personne', 'organisatrice')),
  lien_visio_envoye_le timestamptz,
  present_le timestamptz,
  primary key (inscription_id, atelier_id)
);
create index inscriptions_dates_file on public.inscriptions_dates (atelier_id, statut, cree_le);

-- Limite d'envois : empreinte salée de l'adresse IP, jamais reliée aux réponses, conservée 24 h.
create table public.limites_envoi (
  empreinte text not null,
  cree_le timestamptz not null default now()
);
create index limites_envoi_empreinte on public.limites_envoi (empreinte, cree_le);

create table public.admin_sessions (
  id uuid primary key,
  cree_le timestamptz not null default now(),
  expires_at timestamptz not null,
  revoked_at timestamptz
);

-- ───────────── Verrouillage ─────────────

alter table public.ateliers enable row level security;
alter table public.reponses_consultation enable row level security;
alter table public.inscriptions_ateliers enable row level security;
alter table public.inscriptions_dates enable row level security;
alter table public.limites_envoi enable row level security;
alter table public.admin_sessions enable row level security;

revoke all on all tables in schema public from public, anon, authenticated;
grant all on all tables in schema public to service_role;

-- ───────────── Ateliers ─────────────

-- Aligne la table sur src/lib/config.ts (source de vérité des dates et capacités).
create or replace function public.synchroniser_ateliers(_ateliers jsonb)
returns void language plpgsql security definer set search_path = public as $$
begin
  insert into ateliers (id, titre, debut, fin, capacite)
  select a->>'id', a->>'titre', (a->>'debut')::timestamptz, (a->>'fin')::timestamptz, nullif(a->>'capacite', '')::integer
  from jsonb_array_elements(_ateliers) a
  on conflict (id) do update set titre = excluded.titre, debut = excluded.debut, fin = excluded.fin, capacite = excluded.capacite;
end $$;

create or replace function public.etat_places()
returns jsonb language sql stable security definer set search_path = public as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'atelier_id', a.id,
    'capacite', a.capacite,
    'inscrits', (select count(*) from inscriptions_dates d where d.atelier_id = a.id and d.statut = 'inscrit'),
    'attente', (select count(*) from inscriptions_dates d where d.atelier_id = a.id and d.statut = 'liste_attente')
  ) order by a.id), '[]'::jsonb)
  from ateliers a;
$$;

-- Fait monter, dans l'ordre d'arrivée, les personnes en liste d'attente tant qu'il reste des places.
-- Appelée uniquement sous le verrou des places.
create or replace function public.promouvoir_liste_attente()
returns integer language plpgsql security definer set search_path = public as $$
declare a record; libres integer; n integer := 0; k integer;
begin
  for a in select id, capacite from ateliers where capacite is not null loop
    select a.capacite - count(*) into libres from inscriptions_dates where atelier_id = a.id and statut = 'inscrit';
    if libres > 0 then
      with suivants as (
        select inscription_id from inscriptions_dates
        where atelier_id = a.id and statut = 'liste_attente'
        order by cree_le, inscription_id limit libres
      )
      update inscriptions_dates d set statut = 'inscrit', promu_le = now()
      from suivants s where d.atelier_id = a.id and d.inscription_id = s.inscription_id;
      get diagnostics k = row_count;
      n := n + k;
    end if;
  end loop;
  return n;
end $$;

-- Inscription sous verrou : pas de surréservation même avec des envois simultanés.
create or replace function public.inscrire_atelier(r jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  insc_id uuid; jeton uuid; aid text; cap integer; pris integer; st text;
  dates jsonb := '[]'::jsonb;
begin
  perform pg_advisory_xact_lock(hashtext('ateliers_places'));

  if exists (
    select 1 from inscriptions_ateliers i join inscriptions_dates d on d.inscription_id = i.id
    where lower(i.email) = lower(r->>'email') and d.statut <> 'annule'
  ) then
    return jsonb_build_object('statut', 'deja_inscrit');
  end if;

  if jsonb_array_length(coalesce(r->'ateliers', '[]'::jsonb)) = 0 then
    return jsonb_build_object('statut', 'atelier_invalide');
  end if;

  insert into inscriptions_ateliers (prenom, nom, email, departement, situations, situation_autre, structure, motivation, accessibilite,
    majeur_confirme_le, consentement_organisation_le, actualites_ir_le, actualites_fai_le)
  values (r->>'prenom', r->>'nom', lower(r->>'email'), nullif(r->>'departement', ''),
    coalesce(array(select jsonb_array_elements_text(r->'situations')), '{}'), nullif(r->>'situation_autre', ''), nullif(r->>'structure', ''),
    nullif(r->>'motivation', ''), nullif(r->>'accessibilite', ''),
    now(), now(),
    case when (r->>'actualites_ir')::boolean then now() end,
    case when (r->>'actualites_fai')::boolean then now() end)
  returning id, jeton_annulation into insc_id, jeton;

  for aid in select distinct jsonb_array_elements_text(r->'ateliers') loop
    select capacite into cap from ateliers where id = aid;
    if not found then
      raise exception 'atelier_invalide';
    end if;
    select count(*) into pris from inscriptions_dates where atelier_id = aid and statut = 'inscrit';
    st := case when cap is null or pris < cap then 'inscrit' else 'liste_attente' end;
    insert into inscriptions_dates (inscription_id, atelier_id, statut) values (insc_id, aid, st);
    dates := dates || jsonb_build_object('atelier_id', aid, 'statut', st);
  end loop;

  return jsonb_build_object('statut', 'ok', 'jeton', jeton, 'dates', dates);
end $$;

-- Annulation par la personne, depuis son lien. Ne supprime jamais.
create or replace function public.annuler_par_jeton(_jeton uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare insc_id uuid; n integer;
begin
  perform pg_advisory_xact_lock(hashtext('ateliers_places'));
  select id into insc_id from inscriptions_ateliers where jeton_annulation = _jeton;
  if insc_id is null then
    return jsonb_build_object('statut', 'introuvable');
  end if;
  update inscriptions_dates set statut = 'annule', annule_le = now(), annule_par = 'personne'
  where inscription_id = insc_id and statut <> 'annule';
  get diagnostics n = row_count;
  if n = 0 then
    return jsonb_build_object('statut', 'deja_annule');
  end if;
  perform promouvoir_liste_attente();
  return jsonb_build_object('statut', 'ok', 'annulees', n);
end $$;

-- Lecture d'une inscription depuis le lien d'annulation (prénom et dates seulement).
create or replace function public.inscription_par_jeton(_jeton uuid)
returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object('prenom', i.prenom, 'dates', coalesce((
    select jsonb_agg(jsonb_build_object('atelier_id', d.atelier_id, 'statut', d.statut) order by d.atelier_id)
    from inscriptions_dates d where d.inscription_id = i.id), '[]'::jsonb))
  from inscriptions_ateliers i where i.jeton_annulation = _jeton;
$$;

-- ───────────── Consultation ─────────────

create or replace function public.enregistrer_reponse(r jsonb)
returns uuid language plpgsql security definer set search_path = public as $$
declare rid uuid;
begin
  insert into reponses_consultation (jour, age, genre, region, lieu_vie, situation, parent, liens_enfance, lien_sujet, classement,
    mesure_manquante, presence_debat, poids_vote, provenance)
  values ((r->>'jour')::date, r->>'age', r->>'genre', r->>'region', r->>'lieu_vie', r->>'situation', r->>'parent',
    array(select jsonb_array_elements_text(r->'liens_enfance')),
    array(select jsonb_array_elements_text(r->'lien_sujet')),
    array(select jsonb_array_elements_text(r->'classement')),
    nullif(r->>'mesure_manquante', ''), r->>'presence_debat', r->>'poids_vote', r->>'provenance')
  returning id into rid;
  return rid;
end $$;

-- ───────────── Anti robots ─────────────

-- Vrai si l'envoi est autorisé. Purge au passage les empreintes de plus de 24 h.
create or replace function public.verifier_limite(_empreinte text, _max integer)
returns boolean language plpgsql security definer set search_path = public as $$
declare n integer;
begin
  delete from limites_envoi where cree_le < now() - interval '24 hours';
  select count(*) into n from limites_envoi where empreinte = _empreinte and cree_le > now() - interval '1 hour';
  if n >= _max then
    return false;
  end if;
  insert into limites_envoi (empreinte) values (_empreinte);
  return true;
end $$;

-- ───────────── Administration ─────────────

create or replace function public.admin_session_creer(_id uuid, _expire timestamptz)
returns void language sql security definer set search_path = public as $$
  insert into admin_sessions (id, expires_at) values (_id, _expire);
$$;

create or replace function public.admin_session_valide(_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from admin_sessions where id = _id and revoked_at is null and expires_at > now());
$$;

create or replace function public.admin_session_revoquer(_id uuid)
returns void language sql security definer set search_path = public as $$
  update admin_sessions set revoked_at = now() where id = _id and revoked_at is null;
$$;

create or replace function public.admin_reponses()
returns jsonb language sql stable security definer set search_path = public as $$
  select coalesce(jsonb_agg(to_jsonb(r) - 'id' order by r.jour, r.id), '[]'::jsonb) from reponses_consultation r;
$$;

create or replace function public.admin_inscriptions()
returns jsonb language sql stable security definer set search_path = public as $$
  select coalesce(jsonb_agg(to_jsonb(i) || jsonb_build_object('dates', coalesce((
    select jsonb_agg(to_jsonb(d) - 'inscription_id' order by d.atelier_id)
    from inscriptions_dates d where d.inscription_id = i.id), '[]'::jsonb)) order by i.cree_le), '[]'::jsonb)
  from inscriptions_ateliers i;
$$;

-- Cases du tableau de bord : lien de visio envoyé, présent le jour J, personne prévenue.
create or replace function public.admin_cocher(_inscription uuid, _atelier text, _champ text, _valeur boolean)
returns boolean language plpgsql security definer set search_path = public as $$
declare n integer;
begin
  if _champ = 'lien_visio' then
    update inscriptions_dates set lien_visio_envoye_le = case when _valeur then now() end where inscription_id = _inscription and atelier_id = _atelier;
  elsif _champ = 'present' then
    update inscriptions_dates set present_le = case when _valeur then now() end where inscription_id = _inscription and atelier_id = _atelier;
  elsif _champ = 'prevenu' then
    update inscriptions_dates set prevenu_le = case when _valeur then now() end where inscription_id = _inscription and atelier_id = _atelier;
  else
    raise exception 'champ_invalide';
  end if;
  get diagnostics n = row_count;
  return n > 0;
end $$;

create or replace function public.admin_commenter(_inscription uuid, _texte text)
returns boolean language plpgsql security definer set search_path = public as $$
declare n integer;
begin
  update inscriptions_ateliers set commentaire = nullif(trim(_texte), '') where id = _inscription;
  get diagnostics n = row_count;
  return n > 0;
end $$;

-- Annulation par l'organisatrice, date par date (ou toutes si _atelier est null).
create or replace function public.admin_annuler(_inscription uuid, _atelier text)
returns integer language plpgsql security definer set search_path = public as $$
declare n integer;
begin
  perform pg_advisory_xact_lock(hashtext('ateliers_places'));
  update inscriptions_dates set statut = 'annule', annule_le = now(), annule_par = 'organisatrice'
  where inscription_id = _inscription and (_atelier is null or atelier_id = _atelier) and statut <> 'annule';
  get diagnostics n = row_count;
  if n > 0 then
    perform promouvoir_liste_attente();
  end if;
  return n;
end $$;

-- ───────────── Conservation ─────────────

-- Supprime toutes les inscriptions à partir de la date prévue. Les consentements aux actualités
-- doivent avoir été transmis aux deux structures avant (export du tableau de bord).
create or replace function public.purger_donnees_ateliers(_a_partir_du date)
returns integer language plpgsql security definer set search_path = public as $$
declare n integer := 0;
begin
  delete from limites_envoi where cree_le < now() - interval '24 hours';
  delete from admin_sessions where expires_at < now() - interval '7 days';
  if (now() at time zone 'Europe/Paris')::date >= _a_partir_du then
    delete from inscriptions_ateliers;
    get diagnostics n = row_count;
  end if;
  return n;
end $$;

-- ───────────── Droits sur les fonctions ─────────────

revoke all on all functions in schema public from public, anon, authenticated;
grant execute on all functions in schema public to service_role;
alter default privileges in schema public revoke all on tables from public, anon, authenticated;
alter default privileges in schema public revoke all on functions from public, anon, authenticated;

-- ═════ supabase/migrations/20261121000100_purges_planifiees.sql
-- Purges planifiées avec pg_cron (activé par défaut sur Supabase).
-- Chaque nuit à 3 h, heure UTC, la fonction supprime les empreintes de plus de 24 h,
-- les sessions expirées, et toutes les inscriptions aux ateliers à partir du 31 mars 2027.
-- Le site appelle aussi cette purge à chaque ouverture du tableau de bord.
create extension if not exists pg_cron;

select cron.schedule(
  'purge-consultation-ateliers',
  '0 3 * * *',
  $$select public.purger_donnees_ateliers('2027-03-31')$$
);

-- Empreintes d'adresse IP : purge horaire en plus de la purge à chaque envoi.
select cron.schedule(
  'purge-limites-envoi',
  '15 * * * *',
  $$delete from public.limites_envoi where cree_le < now() - interval '24 hours'$$
);

-- ═════ supabase/migrations/20261122000000_contacts_suite.sql
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

-- ═════ supabase/migrations/20261123000000_consultation_v2.sql
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

-- ═════ supabase/migrations/20261123000100_compteur_reponses.sql
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

-- ═════ supabase/migrations/20261123000200_jetons_usage_unique.sql
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

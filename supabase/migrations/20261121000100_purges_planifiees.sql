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

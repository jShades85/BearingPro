-- Add 'planning' as the initial status for newly-converted projects.
-- A project that just converted from Closed Won hasn't been scheduled yet,
-- so 'scheduled' was semantically wrong. Correct progression:
-- planning → scheduled → in-progress → on-hold → completed / cancelled

alter table projects
  drop constraint if exists projects_status_check;

alter table projects
  add constraint projects_status_check
    check (status in ('planning','quoted','scheduled','in-progress','on-hold','completed','cancelled'));

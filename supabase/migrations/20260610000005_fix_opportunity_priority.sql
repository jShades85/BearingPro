-- UI uses 'med' not 'medium' — align DB constraint with frontend type
alter table opportunities drop constraint opportunities_priority_check;
alter table opportunities
  add constraint opportunities_priority_check
  check (priority in ('low','med','high','urgent'));
alter table opportunities alter column priority set default 'med';

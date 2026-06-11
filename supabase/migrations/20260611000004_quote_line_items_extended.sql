-- Extend quote_line_items for full-page quote builder

ALTER TABLE quote_line_items
  ADD COLUMN section_name  text,
  ADD COLUMN unit_cost     numeric not null default 0,
  ADD COLUMN unit          text    not null default 'ea',
  ADD COLUMN item_type     text    not null default 'product',
  ADD COLUMN sort_order    int     not null default 0;

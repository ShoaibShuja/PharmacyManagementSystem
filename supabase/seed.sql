-- Safe, non-user seed data for local development.
-- Run after the initial migration. This file is idempotent.

insert into public.medicine_categories (name, description)
values
  ('Pain Relief', 'Medicines commonly used for pain and fever.'),
  ('Antibiotics', 'Antibacterial medicines requiring controlled stock handling.'),
  ('Vitamins', 'Vitamin and mineral supplements.'),
  ('First Aid', 'Basic first-aid products and supplies.')
on conflict ((lower(name))) do nothing;

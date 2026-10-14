-- Quark — phase 3: outside content and its approval (docs/04, decided 13 Oct 2026).
--
-- 1. The sources the plan draws from, each with its rule.
-- 2. How an item was approved: automatically (CC0 or public domain, and the model found nothing to
--    flag) or by a guardian on /parent/content. A guardian's no is kept: a rejected item is never
--    approved again and never shown to a child.
-- 3. The flags vocabulary gains 'frightening' (judged for a 7-year-old).

insert into content_sources (slug, name, license_note, base_url) values
  ('met', 'The Metropolitan Museum of Art',
   'Collection API. CC0 when isPublicDomain is true: approved automatically if the model flags nothing. Anything else waits for a guardian.',
   'https://collectionapi.metmuseum.org/public/collection/v1/'),
  ('aic', 'Art Institute of Chicago',
   'API with IIIF images. CC0 when is_public_domain is true: approved automatically if the model flags nothing. Anything else waits for a guardian.',
   'https://api.artic.edu/api/v1/'),
  ('commons', 'Wikimedia Commons',
   'License read per file from imageinfo extmetadata. CC0 or public domain: approved automatically if the model flags nothing. CC BY, CC BY-SA and the rest wait for a guardian and carry their attribution.',
   'https://commons.wikimedia.org/w/api.php'),
  ('musopen', 'Musopen',
   'Checked by hand: the site does not answer automated requests, so the license and performer are confirmed by a person. Never approved automatically.',
   'https://musopen.org/')
on conflict (slug) do update set name = excluded.name, license_note = excluded.license_note, base_url = excluded.base_url;

alter table content_items
  add column approved_how text check (approved_how in ('auto', 'guardian')),
  add column rejected_at  timestamptz,
  add column rejected_by  uuid references guardians(id);

update content_items set approved_how = case when approved_by is null then 'auto' else 'guardian' end where approved;

alter table content_items
  add constraint content_items_approved_how check (approved = (approved_how is not null)),
  add constraint content_items_rejected_not_approved check (rejected_at is null or not approved);

comment on column content_items.flags is
  'Tagged by the model (core/prompts/flag-content.md): nudity, violence, frightening (for a 7-year-old), needs_review.';
comment on column content_items.approved_how is
  'auto: CC0 or public domain with no flags. guardian: approved on /parent/content.';

BEGIN;

INSERT INTO users (name, email, entries, joined) values ('Tim', 'tim@mail', 5, '2020-09-01');
INSERT INTO login (hash, email) values ('$2b$10$Z4EL6WZfN6vs4bInGlkUdO.IAVNzJaiFqndtadSwVJL8ZWa5KBSmO', 'tim@mail');

COMMIT;

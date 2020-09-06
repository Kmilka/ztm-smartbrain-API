BEGIN TRANSACTION;

CREATE TABLE login (
    id serial PRIMARY KEY,
    email text UNIQUE NOT NULL,
    hash VARCHAR(100) NOT NULL
);

CREATE INDEX idx_eml ON login (email);

COMMIT;
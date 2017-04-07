-- Table definitions for the tournament project.
--
-- Put your SQL 'create table' statements in this file; also 'create view'
-- statements if you choose to use it.
--
-- You can write comments in this file by starting them with two dashes, like
-- these lines here.

-- CREATE DATABASE IF NOT EXISTS tournament;

DROP TABLE IF EXISTS matches;
DROP TABLE IF EXISTS players;
DROP TABLE IF EXISTS fixtures;


CREATE TABLE fixtures (
  id        serial PRIMARY KEY,
  created   timestamp DEFAULT current_timestamp,
  name      varchar(256) UNIQUE NOT NULL CHECK (name != '')
);

INSERT INTO fixtures (name) VALUES ('default');
INSERT INTO fixtures (name) VALUES ('play-2019');

CREATE TABLE players (
  id        serial PRIMARY KEY,
  created   timestamp DEFAULT current_timestamp,
  name      varchar(256) UNIQUE NOT NULL CHECK (name != ''),
  fid       int REFERENCES fixtures (id) NOT NULL DEFAULT 1
);

CREATE TABLE matches (
  id        serial PRIMARY KEY,
  created   timestamp DEFAULT current_timestamp,
  winner    int REFERENCES players (id) NOT NULL,
  loser     int REFERENCES players (id) NOT NULL,
  round     int NOT NULL,
  fid       int REFERENCES fixtures (id) NOT NULL DEFAULT 1,
  UNIQUE (winner, loser, round)
);

INSERT INTO players (name, fid) VALUES ('bob', 1);
INSERT INTO players (name, fid) VALUES ('sam', 1);
INSERT INTO matches (winner, loser, round, fid) VALUES (1, 2, 0, 1);

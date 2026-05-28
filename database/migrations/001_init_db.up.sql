CREATE TABLE leagues (
    league_id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    tier TEXT
);

CREATE TABLE teams (
    team_id INTEGER PRIMARY KEY,
    name TEXT,
    tag TEXT,
    logo_url TEXT
);

CREATE TABLE players (
    player_id INTEGER PRIMARY KEY,
    name TEXT NOT NULL
);

CREATE TABLE series (
    series_id INTEGER PRIMARY KEY,
    league_id INTEGER REFERENCES leagues(league_id),
    team_a_id INTEGER REFERENCES teams(team_id),
    team_b_id INTEGER REFERENCES teams(team_id),
    start_time TEXT NOT NULL,
    team_a_score INTEGER NOT NULL DEFAULT 0,
    team_b_score INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE series_match (
    series_id INTEGER NOT NULL,
    match_id INTEGER NOT NULL,
    PRIMARY KEY (series_id, match_id)
);
CREATE INDEX series_match_match_id_idx ON series_match(match_id);

CREATE TABLE matches (
    match_id INTEGER PRIMARY KEY,
    league_id INTEGER REFERENCES leagues(league_id),
    radiant_team_id INTEGER REFERENCES teams(team_id),
    dire_team_id INTEGER REFERENCES teams(team_id),
    radiant_heroes TEXT NOT NULL,
    dire_heroes TEXT NOT NULL,
    radiant_players TEXT NOT NULL,
    dire_players TEXT NOT NULL,
    duration INTEGER NOT NULL,
    start_time TEXT NOT NULL,
    radiant_win INTEGER NOT NULL,
    patch TEXT
);

CREATE TABLE matches_metadata (
    match_id INTEGER PRIMARY KEY REFERENCES matches(match_id) ON DELETE CASCADE,
    radiant_captain INTEGER REFERENCES players(player_id),
    dire_captain INTEGER REFERENCES players(player_id),
    picks_bans TEXT,
    players_data TEXT,
    radiant_gold_adv TEXT,
    radiant_xp_adv TEXT,
    radiant_score INTEGER NOT NULL,
    dire_score INTEGER NOT NULL,
    version INTEGER
);

CREATE TABLE scraper_metadata (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    last_fetched_match_id INTEGER NOT NULL,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE allowed_teams (
    team_id INTEGER PRIMARY KEY,
    name TEXT NOT NULL
);

INSERT INTO allowed_teams (team_id, name) VALUES
    (9572001, 'PARIVISION'),
    (9247354, 'Team Falcons'),
    (9823272, 'Team Yandex'),
    (9467224, 'Aurora Gaming'),
    (8255888, 'BB'),
    (7119388, 'Team Spirit'),
    (2163, 'Team Liquid'),
    (7554697, 'Nigma Galaxy'),
    (8291895, 'Tundra Esports'),
    (15, 'LGD Gaming');

INSERT INTO scraper_metadata (id, last_fetched_match_id) VALUES (1, "8607168614");

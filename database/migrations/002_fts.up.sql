CREATE VIRTUAL TABLE teams_fts USING fts5(
    name, content='teams', content_rowid='team_id',
    tokenize='trigram'
);
CREATE VIRTUAL TABLE leagues_fts USING fts5(
    name, content='leagues', content_rowid='league_id',
    tokenize='trigram'
);
CREATE VIRTUAL TABLE players_fts USING fts5(
    name, content='players', content_rowid='player_id',
    tokenize='trigram'
);

CREATE TRIGGER teams_ai AFTER INSERT ON teams BEGIN
    INSERT INTO teams_fts(rowid, name) VALUES (new.team_id, new.name);
END;
CREATE TRIGGER teams_ad AFTER DELETE ON teams BEGIN
    INSERT INTO teams_fts(teams_fts, rowid, name) VALUES('delete', old.team_id, old.name);
END;
CREATE TRIGGER teams_au AFTER UPDATE ON teams BEGIN
    INSERT INTO teams_fts(teams_fts, rowid, name) VALUES('delete', old.team_id, old.name);
    INSERT INTO teams_fts(rowid, name) VALUES (new.team_id, new.name);
END;

CREATE TRIGGER leagues_ai AFTER INSERT ON leagues BEGIN
    INSERT INTO leagues_fts(rowid, name) VALUES (new.league_id, new.name);
END;
CREATE TRIGGER leagues_ad AFTER DELETE ON leagues BEGIN
    INSERT INTO leagues_fts(leagues_fts, rowid, name) VALUES('delete', old.league_id, old.name);
END;
CREATE TRIGGER leagues_au AFTER UPDATE ON leagues BEGIN
    INSERT INTO leagues_fts(leagues_fts, rowid, name) VALUES('delete', old.league_id, old.name);
    INSERT INTO leagues_fts(rowid, name) VALUES (new.league_id, new.name);
END;

CREATE TRIGGER players_ai AFTER INSERT ON players BEGIN
    INSERT INTO players_fts(rowid, name) VALUES (new.player_id, new.name);
END;
CREATE TRIGGER players_ad AFTER DELETE ON players BEGIN
    INSERT INTO players_fts(players_fts, rowid, name) VALUES('delete', old.player_id, old.name);
END;
CREATE TRIGGER players_au AFTER UPDATE ON players BEGIN
    INSERT INTO players_fts(players_fts, rowid, name) VALUES('delete', old.player_id, old.name);
    INSERT INTO players_fts(rowid, name) VALUES (new.player_id, new.name);
END;

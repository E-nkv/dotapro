package filtersmetadata

import (
	"context"
	"database/sql"
	"errors"
	"sync"
	"time"

	"dotapro/cmd/api/errs"
	"dotapro/constants"
	"dotapro/db"
	"dotapro/types"

	"github.com/uptrace/bun"
)

const (
	TeamSearchColumns   = "t.team_id, t.name, t.logo_url"
	LeagueSearchColumns = "l.league_id, l.name"
	PlayerSearchColumns = "p.player_id, p.name"

	TeamsTable   = "teams_fts AS f JOIN teams AS t ON t.team_id = f.rowid"
	LeaguesTable = "leagues_fts AS f JOIN leagues AS l ON l.league_id = f.rowid"
	PlayersTable = "players_fts AS f JOIN players AS p ON p.player_id = f.rowid"

	FilterByFTSName    = "f.name MATCH ?"
	TeamsOrderByRank   = "bm25(teams_fts)"
	LeaguesOrderByRank = "bm25(leagues_fts)"
	PlayersOrderByRank = "bm25(players_fts)"
)

type Model struct {
	DB *bun.DB

	recentMu      sync.RWMutex
	recentLeagues []types.LeagueSearchResult
	recentExpires time.Time
}

func NewModel(db *bun.DB) *Model { return &Model{DB: db} }

func (m *Model) SearchTeams(ctx context.Context, query string) ([]types.TeamSearchResult, error) {
	ftsQuery := db.EscapeFTS5Query(query)
	if ftsQuery == "" {
		return []types.TeamSearchResult{}, nil
	}

	var results []types.TeamSearchResult
	err := m.DB.NewSelect().
		ColumnExpr(TeamSearchColumns).
		TableExpr(TeamsTable).
		Where(FilterByFTSName, ftsQuery).
		OrderExpr(TeamsOrderByRank).
		Limit(constants.SearchLimit).
		Scan(ctx, &results)

	if err != nil && !errors.Is(err, sql.ErrNoRows) {
		return nil, err
	}
	if results == nil {
		return []types.TeamSearchResult{}, nil
	}
	return results, nil
}

func (m *Model) SearchLeagues(ctx context.Context, query string) ([]types.LeagueSearchResult, error) {
	ftsQuery := db.EscapeFTS5Query(query)
	if ftsQuery == "" {
		return []types.LeagueSearchResult{}, nil
	}

	var results []types.LeagueSearchResult
	err := m.DB.NewSelect().
		ColumnExpr(LeagueSearchColumns).
		TableExpr(LeaguesTable).
		Where(FilterByFTSName, ftsQuery).
		OrderExpr(LeaguesOrderByRank).
		Limit(constants.SearchLimit).
		Scan(ctx, &results)

	if err != nil && !errors.Is(err, sql.ErrNoRows) {
		return nil, err
	}
	if results == nil {
		return []types.LeagueSearchResult{}, nil
	}
	return results, nil
}

func (m *Model) SearchPlayers(ctx context.Context, query string) ([]types.PlayerSearchResult, error) {
	ftsQuery := db.EscapeFTS5Query(query)
	if ftsQuery == "" {
		return []types.PlayerSearchResult{}, nil
	}

	var results []types.PlayerSearchResult
	err := m.DB.NewSelect().
		ColumnExpr(PlayerSearchColumns).
		TableExpr(PlayersTable).
		Where(FilterByFTSName, ftsQuery).
		OrderExpr(PlayersOrderByRank).
		Limit(constants.SearchLimit).
		Scan(ctx, &results)

	if err != nil && !errors.Is(err, sql.ErrNoRows) {
		return nil, err
	}
	if results == nil {
		return []types.PlayerSearchResult{}, nil
	}
	return results, nil
}

func (m *Model) GetTeamName(ctx context.Context, id int64) (map[string]string, error) {
	var result struct {
		Name string `bun:"name"`
	}

	err := m.DB.NewSelect().
		Column("name").
		TableExpr("teams").
		Where("team_id = ?", id).
		Scan(ctx, &result)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, errs.ErrNotFound
		}
		return nil, err
	}

	return map[string]string{"name": result.Name}, nil
}

func (m *Model) GetLeagueName(ctx context.Context, id int64) (map[string]string, error) {
	var result struct {
		Name string `bun:"name"`
	}

	err := m.DB.NewSelect().
		Column("name").
		TableExpr("leagues").
		Where("league_id = ?", id).
		Scan(ctx, &result)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, errs.ErrNotFound
		}
		return nil, err
	}

	return map[string]string{"name": result.Name}, nil
}

func (m *Model) GetPlayerName(ctx context.Context, id int64) (map[string]string, error) {
	var result struct {
		Name string `bun:"name"`
	}

	err := m.DB.NewSelect().
		Column("name").
		TableExpr("players").
		Where("player_id = ?", id).
		Scan(ctx, &result)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, errs.ErrNotFound
		}
		return nil, err
	}

	return map[string]string{"name": result.Name}, nil
}

func (m *Model) GetRecentLeagues(ctx context.Context) ([]types.LeagueSearchResult, error) {
	m.recentMu.RLock()
	if time.Now().Before(m.recentExpires) && m.recentLeagues != nil {
		m.recentMu.RUnlock()
		return m.recentLeagues, nil
	}
	m.recentMu.RUnlock()

	m.recentMu.Lock()
	defer m.recentMu.Unlock()
	if time.Now().Before(m.recentExpires) && m.recentLeagues != nil {
		return m.recentLeagues, nil
	}

	var results []types.LeagueSearchResult
	err := m.DB.NewSelect().
		ColumnExpr("l.league_id, l.name").
		TableExpr("leagues AS l").
		Where("EXISTS (SELECT 1 FROM matches AS mm WHERE mm.league_id = l.league_id)").
		OrderExpr("l.league_id DESC").
		Limit(constants.RecentLeaguesLimit).
		Scan(ctx, &results)
	if err != nil && !errors.Is(err, sql.ErrNoRows) {
		return nil, err
	}
	if results == nil {
		results = []types.LeagueSearchResult{}
	}
	m.recentLeagues = results
	m.recentExpires = time.Now().Add(constants.RecentLeaguesCacheTTL)
	return results, nil
}

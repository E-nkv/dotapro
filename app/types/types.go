package types

import (
	"database/sql/driver"
	"encoding/json"
	"fmt"
	"time"

	"github.com/uptrace/bun"
)

type Int64Slice []int64

func (s Int64Slice) Value() (driver.Value, error) {
	if s == nil {
		return "[]", nil
	}
	b, err := json.Marshal(s)
	if err != nil {
		return nil, err
	}
	return string(b), nil
}

func (s *Int64Slice) Scan(src any) error {
	if src == nil {
		*s = nil
		return nil
	}
	var data []byte
	switch v := src.(type) {
	case string:
		data = []byte(v)
	case []byte:
		data = v
	default:
		return fmt.Errorf("Int64Slice: unsupported type %T", src)
	}
	if len(data) == 0 {
		*s = Int64Slice{}
		return nil
	}
	return json.Unmarshal(data, (*[]int64)(s))
}

type Int32Slice []int32

func (s Int32Slice) Value() (driver.Value, error) {
	if s == nil {
		return "[]", nil
	}
	b, err := json.Marshal(s)
	if err != nil {
		return nil, err
	}
	return string(b), nil
}

func (s *Int32Slice) Scan(src any) error {
	if src == nil {
		*s = nil
		return nil
	}
	var data []byte
	switch v := src.(type) {
	case string:
		data = []byte(v)
	case []byte:
		data = v
	default:
		return fmt.Errorf("Int32Slice: unsupported type %T", src)
	}
	if len(data) == 0 {
		*s = Int32Slice{}
		return nil
	}
	return json.Unmarshal(data, (*[]int32)(s))
}

// --- DB Models ---

type League struct {
	bun.BaseModel `bun:"table:leagues"`
	LeagueID      int64  `bun:"league_id,pk"`
	Name          string `bun:"name,notnull"`
	Tier          string `bun:"tier"`
}

type Team struct {
	bun.BaseModel `bun:"table:teams"`
	TeamID        int64  `bun:"team_id,pk"`
	Name          string `bun:"name"`
	Tag           string `bun:"tag"`
	LogoURL       string `bun:"logo_url"`
}

type Player struct {
	bun.BaseModel `bun:"table:players"`
	PlayerID      int64  `bun:"player_id,pk"`
	Name          string `bun:"name,notnull"`
}

type Series struct {
	bun.BaseModel `bun:"table:series"`
	SeriesID      int64     `bun:"series_id,pk"`
	LeagueID      int64     `bun:"league_id,nullzero"`
	TeamAID       int64     `bun:"team_a_id,nullzero"`
	TeamBID       int64     `bun:"team_b_id,nullzero"`
	StartTime     time.Time `bun:"start_time,notnull"`
	TeamAScore    int16     `bun:"team_a_score,default:0"`
	TeamBScore    int16     `bun:"team_b_score,default:0"`
}

type Match struct {
	bun.BaseModel  `bun:"table:matches"`
	MatchID        int64      `bun:"match_id,pk"`
	LeagueID       int64      `bun:"league_id,nullzero"`
	RadiantTeamID  int64      `bun:"radiant_team_id,nullzero"`
	DireTeamID     int64      `bun:"dire_team_id,nullzero"`
	RadiantHeroes  Int64Slice `bun:"radiant_heroes,notnull"`
	DireHeroes     Int64Slice `bun:"dire_heroes,notnull"`
	RadiantPlayers Int64Slice `bun:"radiant_players,notnull"`
	DirePlayers    Int64Slice `bun:"dire_players,notnull"`
	Duration       int        `bun:"duration,notnull"`
	StartTime      time.Time  `bun:"start_time,notnull"`
	RadiantWin     bool       `bun:"radiant_win,notnull"`
	Patch          string     `bun:"patch"`
}

type MatchMetadata struct {
	bun.BaseModel  `bun:"table:matches_metadata"`
	MatchID        int64           `bun:"match_id,pk"`
	RadiantCaptain *int64          `bun:"radiant_captain"`
	DireCaptain    *int64          `bun:"dire_captain"`
	PicksBans      json.RawMessage `bun:"picks_bans"`
	PlayersData    json.RawMessage `bun:"players_data"`
	RadiantGoldAdv Int32Slice      `bun:"radiant_gold_adv"`
	RadiantXPAdv   Int32Slice      `bun:"radiant_xp_adv"`
	RadiantScore   int             `bun:"radiant_score,notnull"`
	DireScore      int             `bun:"dire_score,notnull"`
	Version        int             `bun:"version"`
}

type SeriesMatch struct {
	bun.BaseModel `bun:"table:series_match"`
	SeriesID      int64 `bun:"series_id,pk"`
	MatchID       int64 `bun:"match_id,pk"`
}

// --- API Response Types ---

type PaginationData struct {
	NextCursor *int64 `json:"nc"`
	HasMore    bool   `json:"has_more"`
}

type TeamInfo struct {
	ID      int64  `json:"id" bun:"id"`
	Name    string `json:"name" bun:"name"`
	Tag     string `json:"tag,omitempty" bun:"tag"`
	LogoURL string `json:"logo_url,omitempty" bun:"logo_url"`
	Score   int    `json:"score,omitempty" bun:"score"`
	Captain *int64 `json:"captain" bun:"captain"`
}

type TeamSearchResult struct {
	TeamID  int64  `json:"team_id" bun:"team_id"`
	Name    string `json:"name" bun:"name"`
	LogoURL string `json:"logo_url,omitempty" bun:"logo_url"`
}

type LeagueSearchResult struct {
	LeagueID int64  `json:"league_id" bun:"league_id"`
	Name     string `json:"name" bun:"name"`
}

type PlayerSearchResult struct {
	PlayerID int64  `json:"player_id" bun:"player_id"`
	Name     string `json:"name" bun:"name"`
}

type LeagueInfo struct {
	ID      int64  `json:"id" bun:"id"`
	Name    string `json:"name" bun:"name"`
	Tier    string `json:"tier" bun:"tier"`
	LogoURL string `json:"logo_url,omitempty" bun:"logo_url"`
}

type MatchSummary struct {
	MatchID       int64      `json:"match_id" bun:"match_id"`
	StartTime     time.Time  `json:"start_time" bun:"start_time"`
	Duration      int        `json:"duration" bun:"duration"`
	RadiantWin    bool       `json:"radiant_win" bun:"radiant_win"`
	RadiantTeam   TeamInfo   `json:"radiant_team" bun:"radiant_team"`
	DireTeam      TeamInfo   `json:"dire_team" bun:"dire_team"`
	League        LeagueInfo `json:"league" bun:"league"`
	SeriesID      int64      `json:"series_id" bun:"series_id"`
	RadiantHeroes Int64Slice `json:"radiant_heroes" bun:"radiant_heroes"`
	DireHeroes    Int64Slice `json:"dire_heroes" bun:"dire_heroes"`
}

type MatchDetail struct {
	MatchID        int64           `json:"match_id" bun:"match_id"`
	StartTime      time.Time       `json:"start_time" bun:"start_time"`
	Duration       int             `json:"duration" bun:"duration"`
	RadiantWin     bool            `json:"radiant_win" bun:"radiant_win"`
	Patch          string          `json:"patch" bun:"patch"`
	Version        int             `json:"version" bun:"version"`
	RadiantTeam    TeamInfo        `json:"radiant_team" bun:"radiant_team"`
	DireTeam       TeamInfo        `json:"dire_team" bun:"dire_team"`
	League         LeagueInfo      `json:"league" bun:"league"`
	SeriesID       int64           `json:"series_id" bun:"series_id"`
	PicksBans      json.RawMessage `json:"picks_bans" bun:"picks_bans"`
	PlayersData    json.RawMessage `json:"players_data" bun:"players_data"`
	RadiantGoldAdv Int32Slice      `json:"radiant_gold_adv" bun:"radiant_gold_adv"`
	RadiantXPAdv   Int32Slice      `json:"radiant_xp_adv" bun:"radiant_xp_adv"`
	RadiantHeroes  Int64Slice      `json:"radiant_heroes,omitempty" bun:"radiant_heroes"`
	DireHeroes     Int64Slice      `json:"dire_heroes,omitempty" bun:"dire_heroes"`
	RadiantPlayers Int64Slice      `json:"radiant_players,omitempty" bun:"radiant_players"`
	DirePlayers    Int64Slice      `json:"dire_players,omitempty" bun:"dire_players"`
}

type GetMatchesFilter struct {
	LeagueID *int64 `json:"league_id"`
	TeamID   *int64 `json:"team_id"`
	PlayerID *int64 `json:"player_id"`
	HeroID   *int64 `json:"hero_id"`
	Sort     string `json:"sort"`
	Limit    int    `json:"limit"`
	Cursor   *int64 `json:"c"`
}

type GetSeriesFilter struct {
	LeagueID *int64 `json:"league_id"`
	TeamID   *int64 `json:"team_id"`
	Sort     string `json:"sort"`
	Limit    int    `json:"limit"`
	Cursor   *int64 `json:"c"`
}

type SeriesSummary struct {
	SeriesID   int64      `json:"series_id" bun:"series_id"`
	StartTime  time.Time  `json:"start_time" bun:"start_time"`
	TeamA      TeamInfo   `json:"team_a" bun:"team_a"`
	TeamB      TeamInfo   `json:"team_b" bun:"team_b"`
	League     LeagueInfo `json:"league" bun:"league"`
	TeamAScore int16      `json:"team_a_score" bun:"team_a_score"`
	TeamBScore int16      `json:"team_b_score" bun:"team_b_score"`
}

type SeriesMatchDetail struct {
	MatchID        int64           `json:"match_id" bun:"match_id"`
	Duration       int             `json:"duration" bun:"duration"`
	RadiantWin     bool            `json:"radiant_win" bun:"radiant_win"`
	PicksBans      json.RawMessage `json:"picks_bans" bun:"picks_bans"`
	PlayersData    json.RawMessage `json:"players_data" bun:"players_data"`
	RadiantGoldAdv Int32Slice      `json:"radiant_gold_adv" bun:"radiant_gold_adv"`
	RadiantXPAdv   Int32Slice      `json:"radiant_xp_adv" bun:"radiant_xp_adv"`
	RadiantScore   int             `json:"radiant_score" bun:"radiant_score"`
	DireScore      int             `json:"dire_score" bun:"dire_score"`
	RadiantCaptain *int64          `json:"radiant_captain" bun:"radiant_captain"`
	DireCaptain    *int64          `json:"dire_captain" bun:"dire_captain"`
}

type SeriesDetail struct {
	SeriesID   int64               `json:"series_id" bun:"series_id"`
	StartTime  time.Time           `json:"start_time" bun:"start_time"`
	TeamA      TeamInfo            `json:"team_a" bun:"team_a"`
	TeamB      TeamInfo            `json:"team_b" bun:"team_b"`
	League     LeagueInfo          `json:"league" bun:"league"`
	TeamAScore int16               `json:"team_a_score" bun:"team_a_score"`
	TeamBScore int16               `json:"team_b_score" bun:"team_b_score"`
	Matches    []SeriesMatchDetail `json:"matches" bun:"matches"`
}

// --- OpenDota Source Types ---

type ODMatch struct {
	MatchID        int64           `json:"match_id"`
	RadiantWin     bool            `json:"radiant_win"`
	StartTime      int64           `json:"start_time"`
	Duration       int             `json:"duration"`
	SeriesID       int64           `json:"series_id"`
	RadiantGoldAdv []int32         `json:"radiant_gold_adv"`
	RadiantXPAdv   []int32         `json:"radiant_xp_adv"`
	Patch          string          `json:"patch"`
	Version        int             `json:"version"`
	League         ODLeague        `json:"league"`
	RadiantTeam    ODTeam          `json:"radiant_team"`
	DireTeam       ODTeam          `json:"dire_team"`
	Players        json.RawMessage `json:"players"`
	PicksBans      json.RawMessage `json:"picks_bans"`
}

type ODLeague struct {
	ID   int64  `json:"id"`
	Name string `json:"name"`
	Tier string `json:"tier"`
}

type ODTeam struct {
	ID      int64  `json:"id"`
	Name    string `json:"name"`
	Tag     string `json:"tag"`
	LogoURL string `json:"logo_url"`
	Score   int    `json:"score"`
	Captain *int64 `json:"captain"`
}

type ODPlayerShort struct {
	PlayerID   int64  `json:"player_id"`
	HeroID     int64  `json:"hero_id"`
	PlayerSlot int    `json:"player_slot"`
	Name       string `json:"name"`
}

// --- Scraper-Only DB Models ---

type ScraperMetadata struct {
	bun.BaseModel      `bun:"table:scraper_metadata"`
	ID                 int16 `bun:"id,pk"`
	LastFetchedMatchID int64 `bun:"last_fetched_match_id,notnull"`
}

type AllowedTeam struct {
	TeamID int64  `bun:"team_id,pk"`
	Name   string `bun:"name,notnull"`
}

type SeriesInfo struct {
	SeriesID  int64
	LeagueID  int64
	TeamOneID int64
	TeamTwoID int64
	StartTime time.Time
}

type SeriesScore struct {
	SeriesID  int64
	TeamAWins int16
	TeamBWins int16
}

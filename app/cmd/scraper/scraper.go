package main

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"slices"
	"time"

	"dotapro/cmd/scraper/config"
	"dotapro/types"

	"github.com/rs/zerolog/log"
	"github.com/uptrace/bun"
)

func newHTTPClient() *http.Client {
	return &http.Client{
		Timeout: config.CONFIG.HTTPTimeout,
		Transport: &http.Transport{
			MaxIdleConns:        10,
			MaxIdleConnsPerHost: 10,
			IdleConnTimeout:     30 * time.Second,
			DisableKeepAlives:   false,
		},
	}
}

type ResponseMatch struct {
	MatchID float64 `json:"match_id"`
}

type OpendotaResponse struct {
	Rows []ResponseMatch `json:"rows"`
}

type OpendotaMatchResponse struct {
	Rows []json.RawMessage `json:"rows"`
}

var queryBuilder = &QueryBuilder{}
var validator = NewValidator()

type BatchProcessor struct {
	leagues      map[int64]types.League
	teams        map[int64]types.Team
	players      map[int64]types.Player
	seriesMap    map[int64]types.Series
	seriesInfo   map[int64]types.SeriesInfo
	seriesScores map[int64]types.SeriesScore

	validMatches       []types.Match
	validMetadata      []types.MatchMetadata
	validSeriesMatches []types.SeriesMatch

	odMatches []types.ODMatch
	ids       []int64
}

func NewBatchProcessor() *BatchProcessor {
	return &BatchProcessor{
		leagues:            make(map[int64]types.League, config.CONFIG.BatchSize),
		teams:              make(map[int64]types.Team, config.CONFIG.BatchSize*2),
		players:            make(map[int64]types.Player, config.CONFIG.BatchSize*10),
		seriesMap:          make(map[int64]types.Series, config.CONFIG.BatchSize),
		seriesInfo:         make(map[int64]types.SeriesInfo, config.CONFIG.BatchSize),
		seriesScores:       make(map[int64]types.SeriesScore, config.CONFIG.BatchSize),
		validMatches:       make([]types.Match, 0, config.CONFIG.BatchSize),
		validMetadata:      make([]types.MatchMetadata, 0, config.CONFIG.BatchSize),
		validSeriesMatches: make([]types.SeriesMatch, 0, config.CONFIG.BatchSize),
		odMatches:          make([]types.ODMatch, 0, config.CONFIG.BatchSize),
		ids:                make([]int64, 0, config.CONFIG.BatchSize),
	}
}

func (bp *BatchProcessor) clear() {
	for k := range bp.leagues {
		delete(bp.leagues, k)
	}
	for k := range bp.teams {
		delete(bp.teams, k)
	}
	for k := range bp.players {
		delete(bp.players, k)
	}
	for k := range bp.seriesMap {
		delete(bp.seriesMap, k)
	}
	for k := range bp.seriesInfo {
		delete(bp.seriesInfo, k)
	}
	for k := range bp.seriesScores {
		delete(bp.seriesScores, k)
	}
	bp.validMatches = bp.validMatches[:0]
	bp.validMetadata = bp.validMetadata[:0]
	bp.validSeriesMatches = bp.validSeriesMatches[:0]
	bp.odMatches = bp.odMatches[:0]
	bp.ids = bp.ids[:0]
}

func ScrapeMatches(ctx context.Context, DB *bun.DB, maxBatches int) error {
	var matchesInserted int
	var errorCount int

	if err := ctx.Err(); err != nil {
		return fmt.Errorf("context cancelled before scraping started: %w", err)
	}

	allowedTeamIDs, err := fetchAllowedTeamIDs(DB)
	if err != nil {
		return fmt.Errorf("error fetching allowed team IDs: %w", err)
	}
	if len(allowedTeamIDs) == 0 {
		log.Warn().Msg("no allowed_teams in database; skipping scrape")
		return nil
	}
	log.Info().Int("team_count", len(allowedTeamIDs)).Msg("using allowed teams filter")

	lastFetchedMatchID, err := fetchLastID(DB)
	if err != nil {
		return fmt.Errorf("error getting last_fetched_match_id: %w", err)
	}

	matchesToFetchLimit := maxBatches * config.CONFIG.BatchSize
	matchIDs, err := fetchMatchIDs(ctx, lastFetchedMatchID, matchesToFetchLimit, allowedTeamIDs)
	if err != nil {
		errorCount++
		return fmt.Errorf("error fetching match ids: %w", err)
	}

	N := len(matchIDs)

	processor := NewBatchProcessor()
	defer processor.clear()

	for i := 0; i < N; i += config.CONFIG.BatchSize {
		if err := ctx.Err(); err != nil {
			return fmt.Errorf("scraping cancelled: %w", err)
		}

		batchNum := i/config.CONFIG.BatchSize + 1
		end := minInt(i+config.CONFIG.BatchSize, N)
		currentBatchIDs := matchIDs[i:end]

		if len(currentBatchIDs) == 0 {
			continue
		}

		currentBatchMatches, err := fetchODMatches(ctx, currentBatchIDs)
		if err != nil {
			errorCount++
			return fmt.Errorf("error scraping matches batch %d: %w", batchNum, err)
		}

		if err := processBatch(ctx, currentBatchMatches, DB, processor, &matchesInserted, &errorCount); err != nil {
			errorCount++
			return fmt.Errorf("error processing matches batch %d: %w", batchNum, err)
		}

		matchesInserted += len(currentBatchIDs)

		maxID := maxInt64(currentBatchIDs)
		if err := updateLastID(ctx, DB, maxID); err != nil {
			errorCount++
			return fmt.Errorf("error updating last fetched match id: %w", err)
		}

		processor.clear()
	}

	log.Info().
		Int("matches_inserted", matchesInserted).
		Int("error_count", errorCount).
		Msg("scraping complete")

	return nil
}

func minInt(a, b int) int {
	if a <= b {
		return a
	}
	return b
}

func maxInt64(slice []int64) int64 {
	if len(slice) == 0 {
		return 0
	}
	return slices.Max(slice)
}

func makeOpendotaRequestExplorer(ctx context.Context, query string) (*http.Response, error) {
	encodedQuery := url.PathEscape(query)
	opendotaURL := fmt.Sprintf("https://api.opendota.com/api/explorer?sql=%s", encodedQuery)

	req, err := http.NewRequestWithContext(ctx, "GET", opendotaURL, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	resp, err := newHTTPClient().Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to make OpenDota explorer request: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		resp.Body.Close()
		return nil, fmt.Errorf("OpenDota explorer request failed with status: %s", resp.Status)
	}

	return resp, nil
}

func fetchMatchIDs(ctx context.Context, lastFetchedMatchID int64, limit int, allowedTeamIDs []int64) ([]int64, error) {
	retryConfig := RetryConfig{
		MaxAttempts: config.CONFIG.MaxRetries,
		BaseDelay:   500 * time.Millisecond,
		MaxDelay:    10 * time.Second,
		Multiplier:  2.0,
	}

	var ids []int64
	var fetchErr error

	err := RetryWithBackoff(ctx, retryConfig, func(ctx context.Context) error {
		resp, err := makeOpendotaRequestExplorer(ctx, queryBuilder.GetIds(lastFetchedMatchID, limit, allowedTeamIDs))
		if err != nil {
			return err
		}
		defer resp.Body.Close()

		var opendotaResp OpendotaResponse
		if err := json.NewDecoder(resp.Body).Decode(&opendotaResp); err != nil {
			return fmt.Errorf("failed to decode OpenDota response: %w", err)
		}

		ids = make([]int64, 0, len(opendotaResp.Rows))
		for _, m := range opendotaResp.Rows {
			ids = append(ids, int64(m.MatchID))
		}

		return nil
	})

	if err != nil {
		fetchErr = fmt.Errorf("failed to fetch match IDs after retries: %w", err)
		return nil, fetchErr
	}

	return ids, nil
}

func fetchODMatches(ctx context.Context, matchIDs []int64) ([]json.RawMessage, error) {
	retryConfig := RetryConfig{
		MaxAttempts: config.CONFIG.MaxRetries,
		BaseDelay:   500 * time.Millisecond,
		MaxDelay:    10 * time.Second,
		Multiplier:  2.0,
	}

	var matches []json.RawMessage
	var fetchErr error

	err := RetryWithBackoff(ctx, retryConfig, func(ctx context.Context) error {
		resp, err := makeOpendotaRequestExplorer(ctx, queryBuilder.GetMatches(matchIDs))
		if err != nil {
			return err
		}
		defer resp.Body.Close()

		var opendotaMatchResp OpendotaMatchResponse
		if err := json.NewDecoder(resp.Body).Decode(&opendotaMatchResp); err != nil {
			return fmt.Errorf("failed to decode OpenDota match response: %w", err)
		}

		matches = opendotaMatchResp.Rows
		return nil
	})

	if err != nil {
		fetchErr = fmt.Errorf("failed to fetch match details after retries: %w", err)
		return nil, fetchErr
	}

	return matches, nil
}

func parseRawMatches(rawBatch []json.RawMessage, odMatches []types.ODMatch) ([]types.ODMatch, error) {
	odMatches = odMatches[:0]
	for i, raw := range rawBatch {
		var m types.ODMatch
		if err := json.Unmarshal(raw, &m); err != nil {
			return nil, fmt.Errorf("failed to unmarshal match data at index %d: %w", i, err)
		}
		odMatches = append(odMatches, m)
	}
	return odMatches, nil
}

func extractRelatedEntities(odMatches []types.ODMatch, leagues map[int64]types.League, teams map[int64]types.Team, players map[int64]types.Player, seriesMap map[int64]types.Series, seriesInfo map[int64]types.SeriesInfo) {
	for _, m := range odMatches {
		if m.League.ID > 0 {
			leagues[m.League.ID] = types.League{
				LeagueID: m.League.ID,
				Name:     m.League.Name,
				Tier:     m.League.Tier,
			}
		}

		if m.RadiantTeam.ID > 0 {
			teams[m.RadiantTeam.ID] = types.Team{
				TeamID:  m.RadiantTeam.ID,
				Name:    m.RadiantTeam.Name,
				Tag:     m.RadiantTeam.Tag,
				LogoURL: m.RadiantTeam.LogoURL,
			}
		}

		if m.DireTeam.ID > 0 {
			teams[m.DireTeam.ID] = types.Team{
				TeamID:  m.DireTeam.ID,
				Name:    m.DireTeam.Name,
				Tag:     m.DireTeam.Tag,
				LogoURL: m.DireTeam.LogoURL,
			}
		}

		if m.SeriesID > 0 {
			info := types.SeriesInfo{
				SeriesID:  m.SeriesID,
				StartTime: time.Unix(m.StartTime, 0),
			}
			if m.League.ID > 0 {
				info.LeagueID = m.League.ID
			}
			if m.RadiantTeam.ID > 0 && m.DireTeam.ID > 0 {
				info.TeamOneID = m.RadiantTeam.ID
				info.TeamTwoID = m.DireTeam.ID
			}

			if existingInfo, exists := seriesInfo[m.SeriesID]; !exists || m.StartTime < existingInfo.StartTime.Unix() {
				seriesInfo[m.SeriesID] = info
			}

			s := types.Series{
				SeriesID:  m.SeriesID,
				StartTime: time.Unix(m.StartTime, 0),
			}
			if m.League.ID > 0 {
				s.LeagueID = m.League.ID
			}
			if m.RadiantTeam.ID > 0 {
				s.TeamAID = m.RadiantTeam.ID
			}
			if m.DireTeam.ID > 0 {
				s.TeamBID = m.DireTeam.ID
			}
			seriesMap[m.SeriesID] = s
		}

		var matchPlayers []types.ODPlayerShort
		if err := json.Unmarshal(m.Players, &matchPlayers); err != nil {
			log.Warn().Err(err).Int64("match_id", m.MatchID).Msg("failed to unmarshal players data")
			continue
		}

		for _, p := range matchPlayers {
			if p.PlayerID > 0 && p.Name != "" {
				if _, exists := players[p.PlayerID]; !exists {
					players[p.PlayerID] = types.Player{
						PlayerID: p.PlayerID,
						Name:     p.Name,
					}
				}
			}
		}
	}
}

func buildMatchEntities(om types.ODMatch, players map[int64]types.Player) (types.Match, types.MatchMetadata, types.SeriesMatch) {
	m := types.Match{
		MatchID:    om.MatchID,
		Duration:   om.Duration,
		StartTime:  time.Unix(om.StartTime, 0),
		RadiantWin: om.RadiantWin,
		Patch:      om.Patch,
	}
	if om.League.ID > 0 {
		m.LeagueID = om.League.ID
	}
	if om.RadiantTeam.ID > 0 {
		m.RadiantTeamID = om.RadiantTeam.ID
	}
	if om.DireTeam.ID > 0 {
		m.DireTeamID = om.DireTeam.ID
	}

	var matchPlayers []types.ODPlayerShort
	if err := json.Unmarshal(om.Players, &matchPlayers); err != nil {
		log.Warn().Err(err).Int64("match_id", om.MatchID).Msg("failed to unmarshal players data")
	}

	for _, p := range matchPlayers {
		if p.PlayerSlot < 128 {
			m.RadiantHeroes = append(m.RadiantHeroes, p.HeroID)
			m.RadiantPlayers = append(m.RadiantPlayers, p.PlayerID)
		} else {
			m.DireHeroes = append(m.DireHeroes, p.HeroID)
			m.DirePlayers = append(m.DirePlayers, p.PlayerID)
		}
	}

	md := types.MatchMetadata{
		MatchID:        om.MatchID,
		PicksBans:      om.PicksBans,
		PlayersData:    om.Players,
		RadiantGoldAdv: om.RadiantGoldAdv,
		RadiantXPAdv:   om.RadiantXPAdv,
		RadiantScore:   om.RadiantTeam.Score,
		DireScore:      om.DireTeam.Score,
		Version:        om.Version,
	}
	if om.RadiantTeam.Captain != nil {
		if _, exists := players[*om.RadiantTeam.Captain]; exists {
			md.RadiantCaptain = om.RadiantTeam.Captain
		}
	}
	if om.DireTeam.Captain != nil {
		if _, exists := players[*om.DireTeam.Captain]; exists {
			md.DireCaptain = om.DireTeam.Captain
		}
	}

	var sm types.SeriesMatch
	if om.SeriesID > 0 {
		sm = types.SeriesMatch{
			SeriesID: om.SeriesID,
			MatchID:  om.MatchID,
		}
	}

	return m, md, sm
}

func insertRelatedEntities(ctx context.Context, tx bun.Tx, leagues map[int64]types.League, teams map[int64]types.Team, players map[int64]types.Player, seriesMap map[int64]types.Series, seriesInfo map[int64]types.SeriesInfo) error {
	if len(leagues) > 0 {
		lSlice := mapsToSlice(leagues)
		valid := lSlice[:0]
		for _, l := range lSlice {
			if err := validator.ValidateLeague(l); err != nil {
				continue
			}
			valid = append(valid, l)
		}
		if len(valid) > 0 {
			if _, err := tx.NewInsert().Model(&valid).On("CONFLICT (league_id) DO NOTHING").Exec(ctx); err != nil {
				return fmt.Errorf("failed to insert leagues: %w", err)
			}
		}
	}

	if len(teams) > 0 {
		tSlice := mapsToSlice(teams)
		valid := tSlice[:0]
		for _, t := range tSlice {
			if err := validator.ValidateTeam(t); err != nil {
				continue
			}
			valid = append(valid, t)
		}
		if len(valid) > 0 {
			if _, err := tx.NewInsert().Model(&valid).On("CONFLICT (team_id) DO NOTHING").Exec(ctx); err != nil {
				return fmt.Errorf("failed to insert teams: %w", err)
			}
		}
	}

	if len(players) > 0 {
		pSlice := mapsToSlice(players)
		valid := pSlice[:0]
		for _, p := range pSlice {
			if err := validator.ValidatePlayer(p); err != nil {
				continue
			}
			valid = append(valid, p)
		}
		if len(valid) > 0 {
			if _, err := tx.NewInsert().Model(&valid).On("CONFLICT (player_id) DO NOTHING").Exec(ctx); err != nil {
				return fmt.Errorf("failed to insert players: %w", err)
			}
		}
	}

	if len(seriesMap) > 0 {
		existingSeries := make(map[int64]types.Series)
		seriesIDs := make([]int64, 0, len(seriesMap))
		for id := range seriesMap {
			seriesIDs = append(seriesIDs, id)
		}

		if len(seriesIDs) > 0 {
			var existing []types.Series
			err := tx.NewSelect().
				Model(&existing).
				Where("series_id IN (?)", bun.In(seriesIDs)).
				Scan(ctx)
			if err != nil {
				return fmt.Errorf("failed to fetch existing series: %w", err)
			}

			for _, s := range existing {
				existingSeries[s.SeriesID] = s
			}
		}

		sSlice := make([]types.Series, 0, len(seriesMap))
		for id, s := range seriesMap {
			if err := validator.ValidateSeries(s); err != nil {
				continue
			}

			if existing, exists := existingSeries[id]; exists {
				s.TeamAID = existing.TeamAID
				s.TeamBID = existing.TeamBID
				s.StartTime = existing.StartTime
			}

			sSlice = append(sSlice, s)
		}

		if _, err := tx.NewInsert().
			Model(&sSlice).
			On("CONFLICT (series_id) DO NOTHING").
			Exec(ctx); err != nil {
			return fmt.Errorf("failed to insert series: %w", err)
		}
	}

	return nil
}

func insertBatch(ctx context.Context, tx bun.Tx, matches []types.Match, metadata []types.MatchMetadata, seriesMatches []types.SeriesMatch) error {
	validCount, _, _ := validator.ValidateBatch(matches, metadata)
	if validCount == 0 {
		return nil
	}

	if _, err := tx.NewInsert().Model(&matches).On("CONFLICT (match_id) DO NOTHING").Exec(ctx); err != nil {
		return fmt.Errorf("failed to insert matches: %w", err)
	}

	if _, err := tx.NewInsert().Model(&metadata).On("CONFLICT (match_id) DO NOTHING").Exec(ctx); err != nil {
		return fmt.Errorf("failed to insert match metadata: %w", err)
	}

	if len(seriesMatches) > 0 {
		if _, err := tx.NewInsert().Model(&seriesMatches).On("CONFLICT (series_id, match_id) DO NOTHING").Exec(ctx); err != nil {
			return fmt.Errorf("failed to insert series matches: %w", err)
		}
	}

	return nil
}

func calculateSeriesScores(ctx context.Context, tx bun.Tx, odMatches []types.ODMatch, scores map[int64]types.SeriesScore) error {
	seriesIDs := make([]int64, 0, len(odMatches))
	seriesSet := make(map[int64]bool)
	for _, m := range odMatches {
		if m.SeriesID > 0 && !seriesSet[m.SeriesID] {
			seriesIDs = append(seriesIDs, m.SeriesID)
			seriesSet[m.SeriesID] = true
		}
	}

	existingSeries := make(map[int64]types.Series)
	if len(seriesIDs) > 0 {
		var series []types.Series
		err := tx.NewSelect().
			Model(&series).
			Where("series_id IN (?)", bun.In(seriesIDs)).
			Scan(ctx)
		if err != nil {
			return fmt.Errorf("failed to fetch existing series for score calculation: %w", err)
		}

		for _, s := range series {
			existingSeries[s.SeriesID] = s
		}
	}

	for _, m := range odMatches {
		if m.SeriesID == 0 {
			continue
		}

		score, exists := scores[m.SeriesID]
		if !exists {
			score = types.SeriesScore{SeriesID: m.SeriesID}
		}

		var winningTeamID int64
		if m.RadiantWin {
			winningTeamID = m.RadiantTeam.ID
		} else {
			winningTeamID = m.DireTeam.ID
		}

		if series, exists := existingSeries[m.SeriesID]; exists {
			switch winningTeamID {
			case series.TeamAID:
				score.TeamAWins++
			case series.TeamBID:
				score.TeamBWins++
			}
		} else {
			switch winningTeamID {
			case m.RadiantTeam.ID:
				score.TeamAWins++
			case m.DireTeam.ID:
				score.TeamBWins++
			}
		}

		scores[m.SeriesID] = score
	}

	return nil
}

func updateSeriesScores(ctx context.Context, tx bun.Tx, scores map[int64]types.SeriesScore) error {
	if len(scores) == 0 {
		return nil
	}

	for seriesID, score := range scores {
		_, err := tx.NewUpdate().
			Model(&types.Series{}).
			Set("team_a_score = team_a_score + ?", score.TeamAWins).
			Set("team_b_score = team_b_score + ?", score.TeamBWins).
			Where("series_id = ?", seriesID).
			Exec(ctx)
		if err != nil {
			return fmt.Errorf("failed to update series score for series_id %d: %w", seriesID, err)
		}
	}

	return nil
}

func processBatch(ctx context.Context, rawBatch []json.RawMessage, db *bun.DB, bp *BatchProcessor, matchesInserted *int, errorCount *int) error {
	odMatches, err := parseRawMatches(rawBatch, bp.odMatches)
	if err != nil {
		return fmt.Errorf("failed to parse raw matches: %w", err)
	}

	extractRelatedEntities(odMatches, bp.leagues, bp.teams, bp.players, bp.seriesMap, bp.seriesInfo)

	bp.validMatches = bp.validMatches[:0]
	bp.validMetadata = bp.validMetadata[:0]
	bp.validSeriesMatches = bp.validSeriesMatches[:0]

	for _, om := range odMatches {
		if err := validator.ValidateODMatch(om); err != nil {
			continue
		}
		m, md, sm := buildMatchEntities(om, bp.players)
		bp.validMatches = append(bp.validMatches, m)
		bp.validMetadata = append(bp.validMetadata, md)
		if sm.SeriesID > 0 {
			bp.validSeriesMatches = append(bp.validSeriesMatches, sm)
		}
	}

	if len(bp.validMatches) == 0 {
		log.Warn().Int("batch_size", len(odMatches)).Msg("no valid matches in batch, skipping")
		return nil
	}

	err = db.RunInTx(ctx, nil, func(ctx context.Context, tx bun.Tx) error {
		if err := insertRelatedEntities(ctx, tx, bp.leagues, bp.teams, bp.players, bp.seriesMap, bp.seriesInfo); err != nil {
			return err
		}

		if err := insertBatch(ctx, tx, bp.validMatches, bp.validMetadata, bp.validSeriesMatches); err != nil {
			return err
		}

		if err := calculateSeriesScores(ctx, tx, odMatches, bp.seriesScores); err != nil {
			return err
		}
		if err := updateSeriesScores(ctx, tx, bp.seriesScores); err != nil {
			return err
		}

		return nil
	})

	for k := range bp.seriesScores {
		delete(bp.seriesScores, k)
	}

	return err
}

func mapsToSlice[K comparable, V any](m map[K]V) []V {
	s := make([]V, 0, len(m))
	for _, v := range m {
		s = append(s, v)
	}
	return s
}

package main

import (
	"dotapro/types"
	"fmt"
	"time"

	"github.com/rs/zerolog/log"
)

type ValidationError struct {
	Field   string
	Value   interface{}
	Message string
}

func (e *ValidationError) Error() string {
	return fmt.Sprintf("validation error on field '%s': %s (value: %v)", e.Field, e.Message, e.Value)
}

type Validator struct {
	MinMatchDuration int
	MaxMatchDuration int
	ValidTiers       []string
}

func NewValidator() *Validator {
	return &Validator{
		MinMatchDuration: 300,
		MaxMatchDuration: 7200,
		ValidTiers:       []string{"premium", "professional", "amateur", "unknown"},
	}
}

func (v *Validator) ValidateMatch(m types.Match) error {
	if m.MatchID <= 0 {
		return &ValidationError{Field: "match_id", Value: m.MatchID, Message: "must be positive"}
	}
	if m.Duration < v.MinMatchDuration || m.Duration > v.MaxMatchDuration {
		return &ValidationError{Field: "duration", Value: m.Duration, Message: fmt.Sprintf("must be between %d and %d seconds", v.MinMatchDuration, v.MaxMatchDuration)}
	}
	if m.StartTime.After(time.Now().Add(5 * time.Minute)) {
		return &ValidationError{Field: "start_time", Value: m.StartTime, Message: "cannot be in the future"}
	}
	if m.StartTime.Before(time.Now().AddDate(-1, 0, 0)) {
		log.Warn().Int64("match_id", m.MatchID).Time("start_time", m.StartTime).Msg("match start time is very old")
	}
	if m.RadiantTeamID < 0 {
		return &ValidationError{Field: "radiant_team_id", Value: m.RadiantTeamID, Message: "cannot be negative"}
	}
	if m.DireTeamID < 0 {
		return &ValidationError{Field: "dire_team_id", Value: m.DireTeamID, Message: "cannot be negative"}
	}
	if m.LeagueID < 0 {
		return &ValidationError{Field: "league_id", Value: m.LeagueID, Message: "cannot be negative"}
	}
	if len(m.RadiantHeroes) > 5 {
		return &ValidationError{Field: "radiant_heroes", Value: len(m.RadiantHeroes), Message: "cannot have more than 5 heroes"}
	}
	if len(m.DireHeroes) > 5 {
		return &ValidationError{Field: "dire_heroes", Value: len(m.DireHeroes), Message: "cannot have more than 5 heroes"}
	}
	if len(m.RadiantPlayers) > 5 {
		return &ValidationError{Field: "radiant_players", Value: len(m.RadiantPlayers), Message: "cannot have more than 5 players"}
	}
	if len(m.DirePlayers) > 5 {
		return &ValidationError{Field: "dire_players", Value: len(m.DirePlayers), Message: "cannot have more than 5 players"}
	}
	return nil
}

func (v *Validator) ValidateMatchMetadata(md types.MatchMetadata) error {
	if md.MatchID <= 0 {
		return &ValidationError{Field: "match_id", Value: md.MatchID, Message: "must be positive"}
	}
	if md.RadiantScore < 0 || md.RadiantScore > 100 {
		return &ValidationError{Field: "radiant_score", Value: md.RadiantScore, Message: "must be between 0 and 100"}
	}
	if md.DireScore < 0 || md.DireScore > 100 {
		return &ValidationError{Field: "dire_score", Value: md.DireScore, Message: "must be between 0 and 100"}
	}
	if md.Version < 0 {
		return &ValidationError{Field: "version", Value: md.Version, Message: "cannot be negative"}
	}
	if md.RadiantCaptain != nil && *md.RadiantCaptain <= 0 {
		return &ValidationError{Field: "radiant_captain", Value: *md.RadiantCaptain, Message: "must be positive"}
	}
	if md.DireCaptain != nil && *md.DireCaptain <= 0 {
		return &ValidationError{Field: "dire_captain", Value: *md.DireCaptain, Message: "must be positive"}
	}
	return nil
}

func (v *Validator) ValidateLeague(l types.League) error {
	if l.LeagueID <= 0 {
		return &ValidationError{Field: "league_id", Value: l.LeagueID, Message: "must be positive"}
	}
	if l.Name == "" {
		return &ValidationError{Field: "name", Value: l.Name, Message: "cannot be empty"}
	}
	if l.Tier != "" {
		valid := false
		for _, t := range v.ValidTiers {
			if l.Tier == t {
				valid = true
				break
			}
		}
		if !valid {
			log.Warn().Int64("league_id", l.LeagueID).Str("tier", l.Tier).Msg("unusual league tier")
		}
	}
	return nil
}

func (v *Validator) ValidateTeam(t types.Team) error {
	if t.TeamID <= 0 {
		return &ValidationError{Field: "team_id", Value: t.TeamID, Message: "must be positive"}
	}
	if t.Name == "" {
		return &ValidationError{Field: "name", Value: t.Name, Message: "cannot be empty"}
	}
	return nil
}

func (v *Validator) ValidatePlayer(p types.Player) error {
	if p.PlayerID <= 0 {
		return &ValidationError{Field: "player_id", Value: p.PlayerID, Message: "must be positive"}
	}
	if p.Name == "" {
		return &ValidationError{Field: "name", Value: p.Name, Message: "cannot be empty"}
	}
	return nil
}

func (v *Validator) ValidateSeries(s types.Series) error {
	if s.SeriesID <= 0 {
		return &ValidationError{Field: "series_id", Value: s.SeriesID, Message: "must be positive"}
	}
	if s.StartTime.After(time.Now().Add(5 * time.Minute)) {
		return &ValidationError{Field: "start_time", Value: s.StartTime, Message: "cannot be in the future"}
	}
	if s.TeamAScore < 0 || s.TeamAScore > 10 {
		return &ValidationError{Field: "team_a_score", Value: s.TeamAScore, Message: "must be between 0 and 10"}
	}
	if s.TeamBScore < 0 || s.TeamBScore > 10 {
		return &ValidationError{Field: "team_b_score", Value: s.TeamBScore, Message: "must be between 0 and 10"}
	}
	return nil
}

func (v *Validator) ValidateODMatch(m types.ODMatch) error {
	if m.MatchID <= 0 {
		return &ValidationError{Field: "match_id", Value: m.MatchID, Message: "must be positive"}
	}
	if m.Duration < v.MinMatchDuration || m.Duration > v.MaxMatchDuration {
		return &ValidationError{Field: "duration", Value: m.Duration, Message: fmt.Sprintf("must be between %d and %d seconds", v.MinMatchDuration, v.MaxMatchDuration)}
	}
	if m.League.ID < 0 {
		return &ValidationError{Field: "league.id", Value: m.League.ID, Message: "cannot be negative"}
	}
	if m.RadiantTeam.ID < 0 {
		return &ValidationError{Field: "radiant_team.id", Value: m.RadiantTeam.ID, Message: "cannot be negative"}
	}
	if m.DireTeam.ID < 0 {
		return &ValidationError{Field: "dire_team.id", Value: m.DireTeam.ID, Message: "cannot be negative"}
	}
	if m.RadiantTeam.Score < 0 || m.RadiantTeam.Score > 100 {
		return &ValidationError{Field: "radiant_team.score", Value: m.RadiantTeam.Score, Message: "must be between 0 and 100"}
	}
	if m.DireTeam.Score < 0 || m.DireTeam.Score > 100 {
		return &ValidationError{Field: "dire_team.score", Value: m.DireTeam.Score, Message: "must be between 0 and 100"}
	}
	return nil
}

func (v *Validator) ValidateBatch(matches []types.Match, metadata []types.MatchMetadata) (validCount int, invalidCount int, errors []error) {
	if len(matches) != len(metadata) {
		errors = append(errors, fmt.Errorf("matches and metadata slices have different lengths"))
		return 0, 0, errors
	}
	for i := range matches {
		if err := v.ValidateMatch(matches[i]); err != nil {
			invalidCount++
			errors = append(errors, fmt.Errorf("match %d: %w", matches[i].MatchID, err))
			continue
		}
		if err := v.ValidateMatchMetadata(metadata[i]); err != nil {
			invalidCount++
			errors = append(errors, fmt.Errorf("match metadata %d: %w", metadata[i].MatchID, err))
			continue
		}
		validCount++
	}
	return validCount, invalidCount, errors
}

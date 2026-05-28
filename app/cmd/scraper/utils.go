package main

import (
	"context"
	"dotapro/types"
	"fmt"

	"github.com/rs/zerolog/log"
	"github.com/uptrace/bun"
)

func fetchLastID(db *bun.DB) (int64, error) {
	var res int64
	err := db.QueryRow("SELECT last_fetched_match_id FROM scraper_metadata WHERE id = 1").Scan(&res)
	if err != nil {
		return -1, fmt.Errorf("failed to fetch last match ID: %w", err)
	}
	return res, nil
}

func fetchAllowedTeamIDs(db *bun.DB) ([]int64, error) {
	rows, err := db.DB.Query("SELECT team_id FROM allowed_teams LIMIT 500")
	if err != nil {
		return nil, fmt.Errorf("failed to fetch allowed team IDs: %w", err)
	}
	defer rows.Close()

	var ids []int64
	for rows.Next() {
		var id int64
		if err := rows.Scan(&id); err != nil {
			return nil, fmt.Errorf("failed to scan allowed team ID: %w", err)
		}
		ids = append(ids, id)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("rows error fetching allowed team IDs: %w", err)
	}
	return ids, nil
}

func updateLastID(ctx context.Context, db *bun.DB, matchID int64) error {
	result, err := db.NewUpdate().
		Model(&types.ScraperMetadata{ID: 1}).
		Set("last_fetched_match_id = ?", matchID).
		Where("id = ?", 1).
		Exec(ctx)
	if err != nil {
		return fmt.Errorf("failed to update last match ID: %w", err)
	}
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}
	if rowsAffected == 0 {
		log.Warn().Int64("match_id", matchID).Msg("no rows updated when updating last fetched match ID")
	}
	return nil
}

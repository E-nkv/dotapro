package main

import (
	"fmt"
	"strconv"
	"strings"
)

const (
	TierPremium      = "premium"
	TierProfessional = "professional"
	TierAmateur      = "amateur"
	TierUnknown      = "unknown"
)

type QueryBuilder struct{}

func (b *QueryBuilder) GetIds(lastFetchedMatchID int64, limit int, allowedTeamIDs []int64) string {
	teamFilter := ""
	if len(allowedTeamIDs) > 0 {
		ids := b.stringifyMatchIDs(allowedTeamIDs)
		teamFilter = fmt.Sprintf("AND (m.radiant_team_id IN (%s) OR m.dire_team_id IN (%s))", ids, ids)
	}
	return fmt.Sprintf(`
		SELECT m.match_id
		FROM matches m
		LEFT JOIN leagues l ON m.leagueid = l.leagueid
		LEFT JOIN teams rt ON m.radiant_team_id = rt.team_id
		LEFT JOIN teams dt ON m.dire_team_id = dt.team_id
		WHERE l.tier IN ('%s', '%s')
			%s
			AND m.match_id > %d
			AND m.series_id != 0
			AND m.radiant_team_id IS NOT NULL
			AND m.dire_team_id IS NOT NULL
			AND rt.name IS NOT NULL
			AND rt.name != ''
			AND dt.name IS NOT NULL
			AND dt.name != ''
		ORDER BY m.match_id ASC
		LIMIT %d;
	`, TierPremium, TierProfessional, teamFilter, lastFetchedMatchID, limit)
}

func (b *QueryBuilder) GetMatches(matchIDs []int64) string {
	stringified := b.stringifyMatchIDs(matchIDs)
	return fmt.Sprintf(`
		SELECT
			m.match_id,
			m.radiant_win,
			m.start_time AS start_time,
			m.duration,
			m.version,
			mp.patch,
			JSON_BUILD_OBJECT(
				'id', m.leagueid,
				'name', l.name,
				'tier', l.tier
			) AS league,
			JSON_BUILD_OBJECT(
				'id', m.radiant_team_id,
				'name', rt.name,
				'tag', rt.tag,
				'logo_url', rt.logo_url,
				'score', m.radiant_score,
				'captain', m.radiant_captain
			) AS radiant_team,
			JSON_BUILD_OBJECT(
				'id', m.dire_team_id,
				'name', dt.name,
				'tag', dt.tag,
				'logo_url', dt.logo_url,
				'score', m.dire_score,
				'captain', m.dire_captain
			) AS dire_team,
			m.radiant_gold_adv,
			m.radiant_xp_adv,
			m.series_id,
			(
				SELECT JSON_AGG(
					JSON_BUILD_OBJECT(
						'hero_id', pm.hero_id,
						'player_id', pm.account_id,
						'player_slot', pm.player_slot,
						'kills', pm.kills,
						'deaths', pm.deaths,
						'assists', pm.assists,
						'gold_per_min', pm.gold_per_min,
						'xp_per_min', pm.xp_per_min,
						'last_hits', pm.last_hits,
						'denies', pm.denies,
						'level', pm.level,
						'item_0', pm.item_0,
						'item_1', pm.item_1,
						'item_2', pm.item_2,
						'item_3', pm.item_3,
						'item_4', pm.item_4,
						'item_5', pm.item_5,
						'item_neutral', pm.item_neutral,
						'backpack_0', pm.backpack_0,
						'backpack_1', pm.backpack_1,
						'backpack_2', pm.backpack_2,
						'net_worth', pm.net_worth,
						'is_radiant', (pm.player_slot < 128),
						'name', np.name,
						'facet', pm.hero_variant
					)
					ORDER BY pm.player_slot
				)
				FROM player_matches pm
				LEFT JOIN notable_players np ON np.account_id = pm.account_id
				WHERE pm.match_id = m.match_id
			) AS players,
			(
				SELECT JSON_AGG(
					JSON_BUILD_OBJECT(
						'hero_id', pb.hero_id,
						'is_pick', pb.is_pick,
						'order', pb.ord,
						'team', pb.team
					)
					ORDER BY pb.ord
				)
				FROM picks_bans pb
				WHERE pb.match_id = m.match_id
			) AS picks_bans
		FROM matches m
		LEFT JOIN leagues l ON m.leagueid = l.leagueid
		LEFT JOIN teams rt ON m.radiant_team_id = rt.team_id
		LEFT JOIN teams dt ON m.dire_team_id = dt.team_id
		LEFT JOIN match_patch mp ON m.match_id = mp.match_id
		WHERE m.match_id IN (%s)
	`, stringified)
}

func (b *QueryBuilder) stringifyMatchIDs(ids []int64) string {
	if len(ids) == 0 {
		return ""
	}

	var sb strings.Builder
	sb.Grow(len(ids) * 20)

	for i, id := range ids {
		if i > 0 {
			sb.WriteByte(',')
		}
		sb.WriteString(strconv.FormatInt(id, 10))
	}
	return sb.String()
}

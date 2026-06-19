--query to run against opendota.com/explorer
SELECT 
    l.leagueid,
    l.name,
    l.tier,
    count(m.match_id) as match_count
FROM matches m
JOIN leagues l ON m.leagueid = l.leagueid
WHERE m.start_time > (extract(epoch from now()) - 1296000) -- Last 15 days (15 * 24 * 60 * 60)
AND l.tier IN ('professional', 'premium') -- Filter for Pro/Premium tiers
GROUP BY l.leagueid, l.name, l.tier
ORDER BY match_count DESC
LIMIT 10
package utils

import "dotapro/types"

type CursorExtractor[T any] func(T) int64

func ProcessPagination[T any](results []T, limit int, extractCursor CursorExtractor[T]) ([]T, types.PaginationData) {
	if limit <= 0 {
		limit = 20
	}

	var nextCursor *int64
	hasMore := false

	if len(results) > limit {
		hasMore = true
		results = results[:limit]

		if len(results) > 0 {
			lastID := extractCursor(results[len(results)-1])
			nextCursor = &lastID
		}
	}

	return results, types.PaginationData{
		NextCursor: nextCursor,
		HasMore:    hasMore,
	}
}

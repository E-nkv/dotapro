package db

import "strings"

func EscapeFTS5Query(query string) string {
	escaped := strings.ReplaceAll(strings.TrimSpace(query), `"`, `""`)
	if escaped == "" {
		return ""
	}
	return `"` + escaped + `"*`
}

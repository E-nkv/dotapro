package db

import (
	"database/sql"
	"fmt"
	"strings"

	"github.com/uptrace/bun"
	"github.com/uptrace/bun/dialect/sqlitedialect"
	_ "modernc.org/sqlite"
)

func SqliteDSN(dbPath string) string {
	sep := "?"
	if strings.Contains(dbPath, "?") {
		sep = "&"
	}
	return dbPath + sep +
		"_pragma=journal_mode(WAL)" +
		"&_pragma=busy_timeout(5000)" +
		"&_pragma=foreign_keys(on)" +
		"&_pragma=synchronous(NORMAL)"
}

func openSQLite(dsn string) (*sql.DB, error) {
	sqldb, err := sql.Open("sqlite", dsn)
	if err != nil {
		return nil, err
	}
	sqldb.SetMaxOpenConns(1)
	if err := sqldb.Ping(); err != nil {
		_ = sqldb.Close()
		return nil, err
	}
	return sqldb, nil
}

func New(dbPath string) (*bun.DB, error) {
	sqldb, err := openSQLite(SqliteDSN(dbPath))
	if err != nil {
		return nil, fmt.Errorf("open sqlite: %w", err)
	}
	return bun.NewDB(sqldb, sqlitedialect.New()), nil
}

func OpenRaw(dsn string) (*sql.DB, error) {
	return openSQLite(dsn)
}

package main

import (
	"context"
	"fmt"
	"os"

	"dotapro/cmd/scraper/config"
	"dotapro/db"
	"dotapro/utils"

	"github.com/rs/zerolog/log"
)

func main() {
	if err := config.LoadEnvs(); err != nil {
		panic(fmt.Errorf("failed to load environment variables: %w", err))
	}
	if err := config.Validate(); err != nil {
		panic(fmt.Errorf("configuration validation failed: %w", err))
	}

	utils.InitLogger(config.CONFIG.LogLevel, config.CONFIG.PrettyPrint)

	database, err := db.New(config.CONFIG.DatabaseURL)
	if err != nil {
		panic(fmt.Errorf("failed to connect to database: %w", err))
	}
	defer func() {
		if err := database.Close(); err != nil {
			log.Error().Err(err).Msg("error closing database")
		}
	}()

	if err := ScrapeMatches(context.Background(), database, config.CONFIG.MaxBatches); err != nil {
		log.Error().Err(err).Msg("scrape failed")
		os.Exit(1)
	}
}

package config

import (
	"errors"
	"strings"
	"time"

	"github.com/ilyakaznacheev/cleanenv"
)

var CONFIG = &Config{}

type Config struct {
	DatabaseURL string        `env:"DATABASE_URL" env-default:"./dev.db"`
	LogLevel    string        `env:"LOG_LEVEL" env-default:"info"`
	MaxBatches  int           `env:"MAX_BATCHES" env-default:"50"`
	BatchSize   int           `env:"BATCH_SIZE" env-default:"200"`
	MaxRetries  int           `env:"MAX_RETRIES" env-default:"3"`
	HTTPTimeout time.Duration `env:"HTTP_TIMEOUT" env-default:"30s"`
	PrettyPrint int           `env:"PRETTY_PRINT" env-default:"0"`
}

func LoadEnvs() error {
	return cleanenv.ReadEnv(CONFIG)
}

func Validate() error {
	if strings.TrimSpace(CONFIG.DatabaseURL) == "" {
		return errors.New("DATABASE_URL is required")
	}
	if CONFIG.PrettyPrint != 0 && CONFIG.PrettyPrint != 1 {
		return errors.New("PRETTY_PRINT should be either 1 or 0")
	}
	return nil
}

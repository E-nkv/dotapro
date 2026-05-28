package config

import (
	"errors"
	"strings"

	"github.com/ilyakaznacheev/cleanenv"
)

var CONFIG = &Config{}

type Config struct {
	DatabaseURL string `env:"DATABASE_URL" env-default:"./dev.db"`
	LogLevel    string `env:"LOG_LEVEL" env-default:"info"`
}

func LoadEnvs() error {
	return cleanenv.ReadEnv(CONFIG)
}

func Validate() error {
	if strings.TrimSpace(CONFIG.DatabaseURL) == "" {
		return errors.New("DATABASE_URL is required")
	}
	return nil
}

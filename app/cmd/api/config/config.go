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
	Addr        string `env:"ADDR" env-default:":8080"`
	PrettyPrint int    `env:"PRETTY_PRINT" env-default:"0"`
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
	if CONFIG.Addr == "" {
		CONFIG.Addr = ":8080"
	}
	return nil
}

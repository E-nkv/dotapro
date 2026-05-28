package utils

import (
	"os"
	"strings"

	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
)

func InitLogger(logLevel string, prettyPrint int) {
	level, err := zerolog.ParseLevel(strings.ToLower(logLevel))
	if err != nil {
		level = zerolog.InfoLevel
	}
	zerolog.SetGlobalLevel(level)

	if prettyPrint == 1 {
		log.Logger = log.Output(zerolog.ConsoleWriter{Out: os.Stdout})
	}
}

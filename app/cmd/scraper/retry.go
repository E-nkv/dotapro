package main

import (
	"context"
	"fmt"
	"math"
	"time"

	"github.com/rs/zerolog/log"
)

type RetryConfig struct {
	MaxAttempts int
	BaseDelay   time.Duration
	MaxDelay    time.Duration
	Multiplier  float64
}

func DefaultRetryConfig() RetryConfig {
	return RetryConfig{
		MaxAttempts: 3,
		BaseDelay:   500 * time.Millisecond,
		MaxDelay:    10 * time.Second,
		Multiplier:  2.0,
	}
}

type RetryableFunc func(ctx context.Context) error

func RetryWithBackoff(ctx context.Context, config RetryConfig, fn RetryableFunc) error {
	var lastErr error

	for attempt := 1; attempt <= config.MaxAttempts; attempt++ {
		select {
		case <-ctx.Done():
			return fmt.Errorf("operation cancelled: %w", ctx.Err())
		default:
		}

		err := fn(ctx)
		if err == nil {
			return nil
		}

		lastErr = err

		if attempt == config.MaxAttempts {
			break
		}

		delay := time.Duration(float64(config.BaseDelay) * math.Pow(config.Multiplier, float64(attempt-1)))
		if delay > config.MaxDelay {
			delay = config.MaxDelay
		}

		log.Warn().
			Int("attempt", attempt).
			Int("max_attempts", config.MaxAttempts).
			Dur("delay", delay).
			Err(err).
			Msg("operation failed, retrying")

		select {
		case <-time.After(delay):
		case <-ctx.Done():
			return fmt.Errorf("operation cancelled during backoff: %w", ctx.Err())
		}
	}

	return fmt.Errorf("operation failed after %d attempts: %w", config.MaxAttempts, lastErr)
}

func IsRetryableError(err error) bool {
	if err == nil {
		return false
	}
	return err != context.Canceled && err != context.DeadlineExceeded
}

package constants

import "time"

const (
	DefaultRequestTimeout = 10 * time.Second
	ShortRequestTimeout   = 5 * time.Second
	DefaultLimit          = 20
	MaxLimit              = 100
	SearchLimit           = 10
	CORSMaxAge            = 300
)

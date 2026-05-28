package utils

import (
	"fmt"
	"net/http"
	"net/url"
	"strconv"
)

func ParseInt64Param(params url.Values, key string) (*int64, error) {
	value := params.Get(key)
	if value == "" {
		return nil, nil
	}
	parsed, err := strconv.ParseInt(value, 10, 64)
	if err != nil {
		return nil, fmt.Errorf("invalid %s: %w", key, err)
	}
	return &parsed, nil
}

func ParseIntParam(params url.Values, key string) (int, error) {
	value := params.Get(key)
	if value == "" {
		return 0, nil
	}
	parsed, err := strconv.Atoi(value)
	if err != nil {
		return 0, fmt.Errorf("invalid %s: %w", key, err)
	}
	return parsed, nil
}

func ParseRequiredInt64Param(params url.Values, key string) (int64, error) {
	value := params.Get(key)
	if value == "" {
		return 0, fmt.Errorf("missing required parameter: %s", key)
	}
	parsed, err := strconv.ParseInt(value, 10, 64)
	if err != nil {
		return 0, fmt.Errorf("invalid %s: %w", key, err)
	}
	return parsed, nil
}

func ParseStringParam(params url.Values, key string) string {
	return params.Get(key)
}

func ParseRequiredStringParam(params url.Values, key string) (string, error) {
	value := params.Get(key)
	if value == "" {
		return "", fmt.Errorf("missing required parameter: %s", key)
	}
	return value, nil
}

func WriteParamError(w http.ResponseWriter, paramName string, err error) {
	http.Error(w, fmt.Sprintf("invalid %s: %v", paramName, err), http.StatusBadRequest)
}

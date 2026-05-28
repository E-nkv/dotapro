package errs

import (
	"errors"
	"fmt"
	"net/http"
)

var (
	ErrUnimplemented = errors.New("unimplemented")
	ErrNotFound      = errors.New("not found")
)

type AppError struct {
	Err        error
	StatusCode int
	Message    string
}

func (e *AppError) Error() string {
	if e.Message != "" {
		return e.Message
	}
	if e.Err != nil {
		return e.Err.Error()
	}
	return "unknown error"
}

func (e *AppError) Unwrap() error {
	return e.Err
}

func NewAppError(err error, statusCode int, message string) *AppError {
	return &AppError{Err: err, StatusCode: statusCode, Message: message}
}

func NewBadRequestError(message string) *AppError {
	return &AppError{StatusCode: http.StatusBadRequest, Message: message}
}

func NewNotFoundError(message string) *AppError {
	return &AppError{StatusCode: http.StatusNotFound, Message: message}
}

func NewInternalServerError(err error, message string) *AppError {
	return &AppError{Err: err, StatusCode: http.StatusInternalServerError, Message: message}
}

func NewGatewayTimeoutError(message string) *AppError {
	return &AppError{StatusCode: http.StatusGatewayTimeout, Message: message}
}

func WrapError(err error, message string) error {
	if err == nil {
		return nil
	}
	return fmt.Errorf("%s: %w", message, err)
}

func IsNotFound(err error) bool {
	return errors.Is(err, ErrNotFound)
}

func IsAppError(err error) bool {
	var appErr *AppError
	return errors.As(err, &appErr)
}

func GetStatusCode(err error) int {
	if appErr, ok := err.(*AppError); ok {
		return appErr.StatusCode
	}
	return http.StatusInternalServerError
}

package main

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"strings"
	"syscall"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"

	"dotapro/cmd/api/config"
	"dotapro/cmd/api/filtersmetadata"
	"dotapro/cmd/api/matches"
	"dotapro/cmd/api/series"
	"dotapro/db"
	"dotapro/utils"

	"github.com/uptrace/bun"
)

type App struct {
	db                        *bun.DB
	matchModel                *matches.Model
	seriesModel               *series.Model
	filtersMetadataModel      *filtersmetadata.Model
	matchController           *matches.Controller
	seriesController          *series.Controller
	filtersMetadataController *filtersmetadata.Controller
}

func NewApp() (*App, error) {
	bunDB, err := db.New(config.CONFIG.DatabaseURL)
	if err != nil {
		return nil, fmt.Errorf("failed to setup database: %w", err)
	}

	matchModel := matches.NewModel(bunDB)
	seriesModel := series.NewModel(bunDB)
	filtersMetadataModel := filtersmetadata.NewModel(bunDB)

	return &App{
		db:                        bunDB,
		matchModel:                matchModel,
		seriesModel:               seriesModel,
		filtersMetadataModel:      filtersMetadataModel,
		matchController:           matches.NewController(matchModel),
		seriesController:          series.NewController(seriesModel),
		filtersMetadataController: filtersmetadata.NewController(filtersMetadataModel),
	}, nil
}

func (a *App) Close() error {
	if a.db != nil {
		return a.db.Close()
	}
	return nil
}

func (a *App) setupRouter() *chi.Mux {
	r := chi.NewRouter()

	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token", "Origin"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: false,
		MaxAge:           300,
	}))

	if strings.EqualFold(config.CONFIG.LogLevel, "debug") {
		r.Use(middleware.Logger)
	}

	r.Use(middleware.Recoverer)
	r.Get("/", handleHome)
	r.Get("/matches", a.matchController.GetMany)
	r.Get("/matches/{id}", a.matchController.GetOne)
	r.Get("/series", a.seriesController.GetMany)
	r.Get("/series/{id}", a.seriesController.GetOne)
	a.filtersMetadataController.RegisterRoutes(r)

	return r
}

func main() {
	if err := config.LoadEnvs(); err != nil {
		panic(fmt.Errorf("failed to load environment variables: %w", err))
	}
	if err := config.Validate(); err != nil {
		panic(fmt.Errorf("invalid configuration: %w", err))
	}

	utils.InitLogger(config.CONFIG.LogLevel, config.CONFIG.PrettyPrint)

	app, err := NewApp()
	if err != nil {
		panic(fmt.Errorf("failed to initialize application: %w", err))
	}
	defer func() { _ = app.Close() }()

	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()

	r := app.setupRouter()
	srv := &http.Server{Addr: config.CONFIG.Addr, Handler: r}

	go func() {
		fmt.Println("started server on", config.CONFIG.Addr)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			panic(fmt.Errorf("failed to start server: %w", err))
		}
	}()

	<-ctx.Done()
	stop()

	fmt.Println("shutting down...")
	if shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second); shutdownCtx != nil {
		defer cancel()
		if err := srv.Shutdown(shutdownCtx); err != nil {
			fmt.Fprintf(os.Stderr, "shutdown error: %v\n", err)
		}
	}
}

func handleHome(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(map[string]string{
		"status":  "ok",
		"message": "DotaPro API is running",
	})
}

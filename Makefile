.PHONY: build run-api run-scraper run-ui app-tidy

build:
	@mkdir -p .build

	cd app && GOOS=linux GOARCH=amd64 go build -o ../.build/api ./cmd/api
	cd app && GOOS=linux GOARCH=amd64 go build -o ../.build/scraper ./cmd/scraper

run-api:
	cd app && go run ./cmd/api

run-scraper:
	cd app && go run ./cmd/scraper

run-ui:
	cd ui && pnpm dev

app-tidy:
	cd app && go mod tidy


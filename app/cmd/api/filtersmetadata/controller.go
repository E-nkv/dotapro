package filtersmetadata

import (
	"context"
	"net/http"

	"dotapro/cmd/api/errs"
	"dotapro/cmd/api/utils"
	"dotapro/constants"

	"github.com/go-chi/chi/v5"
)

type Controller struct {
	model *Model
}

func NewController(model *Model) *Controller {
	return &Controller{model}
}

func (c *Controller) SearchTeams(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), constants.ShortRequestTimeout)
	defer cancel()

	query, err := utils.ParseRequiredStringParam(r.URL.Query(), "q")
	if err != nil {
		utils.WriteError(w, err.Error(), http.StatusBadRequest)
		return
	}

	teams, err := c.model.SearchTeams(ctx, query)
	if err != nil {
		if err == context.Canceled {
			return
		}
		if err == context.DeadlineExceeded {
			utils.WriteError(w, context.DeadlineExceeded.Error(), http.StatusGatewayTimeout)
			return
		}
		utils.WriteError(w, err.Error(), http.StatusInternalServerError)
		return
	}

	utils.WriteResponse(w, teams, http.StatusOK)
}

func (c *Controller) SearchLeagues(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), constants.ShortRequestTimeout)
	defer cancel()

	query, err := utils.ParseRequiredStringParam(r.URL.Query(), "q")
	if err != nil {
		utils.WriteError(w, err.Error(), http.StatusBadRequest)
		return
	}

	leagues, err := c.model.SearchLeagues(ctx, query)
	if err != nil {
		if err == context.Canceled {
			return
		}
		if err == context.DeadlineExceeded {
			utils.WriteError(w, context.DeadlineExceeded.Error(), http.StatusGatewayTimeout)
			return
		}
		utils.WriteError(w, err.Error(), http.StatusInternalServerError)
		return
	}

	utils.WriteResponse(w, leagues, http.StatusOK)
}

func (c *Controller) SearchPlayers(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), constants.ShortRequestTimeout)
	defer cancel()

	query, err := utils.ParseRequiredStringParam(r.URL.Query(), "q")
	if err != nil {
		utils.WriteError(w, err.Error(), http.StatusBadRequest)
		return
	}

	players, err := c.model.SearchPlayers(ctx, query)
	if err != nil {
		if err == context.Canceled {
			return
		}
		if err == context.DeadlineExceeded {
			utils.WriteError(w, context.DeadlineExceeded.Error(), http.StatusGatewayTimeout)
			return
		}
		utils.WriteError(w, err.Error(), http.StatusInternalServerError)
		return
	}

	utils.WriteResponse(w, players, http.StatusOK)
}

func (c *Controller) GetTeamName(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), constants.ShortRequestTimeout)
	defer cancel()

	id, err := utils.ParseRequiredInt64Param(r.URL.Query(), "id")
	if err != nil {
		utils.WriteError(w, err.Error(), http.StatusBadRequest)
		return
	}

	name, err := c.model.GetTeamName(ctx, id)
	if err != nil {
		if err == context.Canceled {
			return
		}
		if err == context.DeadlineExceeded {
			utils.WriteError(w, context.DeadlineExceeded.Error(), http.StatusGatewayTimeout)
			return
		}
		if err == errs.ErrNotFound {
			utils.WriteError(w, err.Error(), http.StatusNotFound)
			return
		}
		utils.WriteError(w, err.Error(), http.StatusInternalServerError)
		return
	}

	utils.WriteResponse(w, name, http.StatusOK)
}

func (c *Controller) GetLeagueName(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), constants.ShortRequestTimeout)
	defer cancel()

	id, err := utils.ParseRequiredInt64Param(r.URL.Query(), "id")
	if err != nil {
		utils.WriteError(w, err.Error(), http.StatusBadRequest)
		return
	}

	name, err := c.model.GetLeagueName(ctx, id)
	if err != nil {
		if err == context.Canceled {
			return
		}
		if err == context.DeadlineExceeded {
			utils.WriteError(w, context.DeadlineExceeded.Error(), http.StatusGatewayTimeout)
			return
		}
		if err == errs.ErrNotFound {
			utils.WriteError(w, err.Error(), http.StatusNotFound)
			return
		}
		utils.WriteError(w, err.Error(), http.StatusInternalServerError)
		return
	}

	utils.WriteResponse(w, name, http.StatusOK)
}

func (c *Controller) GetPlayerName(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), constants.ShortRequestTimeout)
	defer cancel()

	id, err := utils.ParseRequiredInt64Param(r.URL.Query(), "id")
	if err != nil {
		utils.WriteError(w, err.Error(), http.StatusBadRequest)
		return
	}

	name, err := c.model.GetPlayerName(ctx, id)
	if err != nil {
		if err == context.Canceled {
			return
		}
		if err == context.DeadlineExceeded {
			utils.WriteError(w, context.DeadlineExceeded.Error(), http.StatusGatewayTimeout)
			return
		}
		if err == errs.ErrNotFound {
			utils.WriteError(w, err.Error(), http.StatusNotFound)
			return
		}
		utils.WriteError(w, err.Error(), http.StatusInternalServerError)
		return
	}

	utils.WriteResponse(w, name, http.StatusOK)
}

func (c *Controller) RegisterRoutes(r *chi.Mux) {
	r.Get("/filtersmetadata/teams", c.SearchTeams)
	r.Get("/filtersmetadata/leagues", c.SearchLeagues)
	r.Get("/filtersmetadata/players", c.SearchPlayers)
	r.Get("/filtersmetadata/team", c.GetTeamName)
	r.Get("/filtersmetadata/league", c.GetLeagueName)
	r.Get("/filtersmetadata/player", c.GetPlayerName)
}

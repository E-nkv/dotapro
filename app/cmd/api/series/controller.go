package series

import (
	"context"
	"fmt"
	"net/http"
	"strconv"

	"dotapro/cmd/api/errs"
	"dotapro/cmd/api/utils"
	"dotapro/constants"
	"dotapro/types"

	"github.com/go-chi/chi/v5"
)

type Controller struct {
	model *Model
}

type GetManyResp struct {
	Series     []types.SeriesSummary `json:"series"`
	Pagination types.PaginationData  `json:"pagination"`
}

func NewController(model *Model) *Controller {
	return &Controller{model}
}

func (c *Controller) GetMany(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), constants.ShortRequestTimeout)
	defer cancel()

	filter := types.GetSeriesFilter{}
	params := r.URL.Query()

	if leagueID, err := utils.ParseInt64Param(params, "league"); err != nil {
		utils.WriteParamError(w, "league_id", err)
		return
	} else {
		filter.LeagueID = leagueID
	}

	if teamID, err := utils.ParseInt64Param(params, "team"); err != nil {
		utils.WriteParamError(w, "team_id", err)
		return
	} else {
		filter.TeamID = teamID
	}

	filter.Sort = utils.ParseStringParam(params, "sort")

	if limit, err := utils.ParseIntParam(params, "limit"); err != nil {
		utils.WriteParamError(w, "limit", err)
		return
	} else {
		filter.Limit = limit
	}

	if cursor, err := utils.ParseInt64Param(params, "c"); err != nil {
		utils.WriteParamError(w, "cursor", err)
		return
	} else {
		filter.Cursor = cursor
	}

	series, paginationData, err := c.model.GetMany(ctx, filter)
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

	resp := GetManyResp{Series: series, Pagination: paginationData}
	utils.WriteResponse(w, resp, http.StatusOK)
}

func (c *Controller) GetOne(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	if idStr == "" {
		utils.WriteError(w, "missing id parameter", http.StatusBadRequest)
		return
	}
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		utils.WriteError(w, fmt.Sprintf("invalid id: %v", err), http.StatusBadRequest)
		return
	}
	series, err := c.model.GetOne(r.Context(), id)
	if err != nil {
		if err == context.Canceled || err == context.DeadlineExceeded {
			return
		}
		switch err {
		case errs.ErrNotFound:
			utils.WriteError(w, err.Error(), http.StatusNotFound)
		default:
			utils.WriteError(w, err.Error(), http.StatusInternalServerError)
		}
		return
	}
	utils.WriteResponse(w, series, http.StatusOK)
}

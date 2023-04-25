package backend

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type DistributedNetworkData struct {
	Name        string  `json:"name"`
	AuthorName  string  `json:"authorName"`
	Description *string `json:"description,omitempty"`
	Computers   []struct {
		Name               string `json:"name"`
		WorkloadThreshold  uint   `json:"workloadThreshold"`
		RequestThreshold   uint   `json:"requestThreshold"`
		ProcessCoefficient uint   `json:"processCoefficient"`
	}
}

func SetupDatabaseRequests(app *gin.Engine) {
	app.POST("/network/new", func(ctx *gin.Context) {
		var data DistributedNetworkData
		if err := ctx.BindJSON(&data); err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{
				"error": "Failed to parse JSON data",
			})
			return
		}
		if err := saveNetwork(&data); err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to save your data",
			})
			return
		}
		ctx.Status(http.StatusCreated)
	})

	// TODO: get a whole HTML gallery
	// TODO: get just one by id
}

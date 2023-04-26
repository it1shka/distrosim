package backend

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type NetworkDataScheme struct {
	Network struct {
		Name        string  `json:"name"`
		AuthorName  string  `json:"authorName"`
		Description *string `json:"description,omitempty"`
	} `json:"network"`

	Computers []struct {
		Name               string `json:"name"`
		ComputerType       string `json:"computerType"`
		WorkloadThreshold  uint   `json:"workloadThreshold"`
		RequestThreshold   uint   `json:"requestThreshold"`
		ProcessCoefficient uint   `json:"processCoefficient"`
	} `json:"computers"`

	Connections []struct {
		FirstIndex  uint `json:"firstIndex"`
		SecondIndex uint `json:"secondIndex"`
	} `json:"connections"`
}

func SetupDatabaseRequests(app *gin.Engine) {

	app.POST("/network/new", func(ctx *gin.Context) {
		var scheme NetworkDataScheme
		if err := ctx.BindJSON(&scheme); err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{
				"error": "Failed to parse JSON",
			})
			return
		}
		if err := saveNetwork(&scheme); err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to save your network",
			})
			return
		}
		ctx.Status(http.StatusCreated)
	})

	app.GET("/gallery", func(ctx *gin.Context) {
		page, err := getPage(0)
		if err != nil {
			ctx.HTML(http.StatusInternalServerError, "error.html", gin.H{
				"name":  "Error 500: Internal Server Error",
				"error": "$ error --code=500 --description=\"Internal Server Error: failed to load your gallery\"",
			})
			return
		}
		ctx.HTML(http.StatusOK, "gallery.html", gin.H{
			"page": page,
		})
	})

	app.GET("/network/:id", func(ctx *gin.Context) {
		// TODO:
	})

}

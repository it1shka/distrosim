package backend

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type NetworkInformationScheme struct {
	Name        string  `json:"name" binding:"required,min=3,max=20"`
	AuthorName  string  `json:"authorName" binding:"required,min=3,max=20"`
	Description *string `json:"description,omitempty" binding:"max=100"`
}

type ComputerScheme struct {
	Name               string `json:"name"`
	ComputerType       string `json:"computerType"`
	WorkloadThreshold  uint   `json:"workloadThreshold"`
	RequestThreshold   uint   `json:"requestThreshold"`
	ProcessCoefficient uint   `json:"processCoefficient"`
}

type ConnectionScheme struct {
	FirstIndex  uint `json:"firstIndex"`
	SecondIndex uint `json:"secondIndex"`
}

type NetworkDataScheme struct {
	Network     NetworkInformationScheme `json:"network"`
	Computers   []ComputerScheme         `json:"computers"`
	Connections []ConnectionScheme       `json:"connections"`
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

	app.GET("/network/:id", func(ctx *gin.Context) {
		idStr := ctx.Param("id")
		id, err := strconv.ParseUint(idStr, 10, 32)
		if err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{
				"error": "\"id\" is not an unsigned integer",
			})
			return
		}
		network, err := getNetworkById(uint(id))
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{
				"error": "failed retrieve your network",
			})
			return
		}
		ctx.JSON(http.StatusOK, network)
	})

	app.GET("/network/page/:page", func(ctx *gin.Context) {
		pageStr := ctx.Param("page")
		page, err := strconv.Atoi(pageStr)
		if err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{
				"error": "\"page\" parameter is not an integer",
			})
			return
		}
		pageContent, err := getPage(page)
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to retrieve page content",
			})
			return
		}
		ctx.JSON(http.StatusOK, pageContent)
	})

	app.GET("/gallery", func(ctx *gin.Context) {
		page, err := getPage(1)
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

}

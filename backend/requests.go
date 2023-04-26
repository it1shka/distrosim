package backend

import (
	"github.com/gin-gonic/gin"
)

func SetupDatabaseRequests(app *gin.Engine) {

	app.POST("/network/new", func(ctx *gin.Context) {
		// TODO:
	})

	app.GET("/gallery", func(ctx *gin.Context) {
		// TODO:
	})

	app.GET("/network/:id", func(ctx *gin.Context) {
		// TODO:
	})

}

package main

import (
	"fmt"
	"it1shka/distrosim/backend"
	"log"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func setupEnvironment(defaultEnv map[string]string) {
	if err := godotenv.Load(); err != nil {
		fmt.Println("Failed to load .env file. Setting up default env:")
		for key, value := range defaultEnv {
			fmt.Printf("%s=%s\n", key, value)
			os.Setenv(key, value)
		}
	}
}

func setupServer(server *gin.Engine) {
	server.Static("/assets", "./assets")
	server.Static("/images", "./images")
	server.LoadHTMLGlob("html/*.html")
	server.GET("/", func(ctx *gin.Context) {
		ctx.HTML(http.StatusOK, "index.html", nil)
	})
	server.GET("/menu", func(ctx *gin.Context) {
		ctx.HTML(http.StatusOK, "menu.html", nil)
	})
	backend.SetupDatabaseRequests(server)
	server.NoRoute(func(ctx *gin.Context) {
		ctx.HTML(http.StatusNotFound, "error.html", gin.H{
			"name":  "Error 404: Page Not Found",
			"error": "$ error --code=404 --description=\"Page Not Found\"",
		})
	})
}

func main() {
	setupEnvironment(map[string]string{
		"GIN_MODE": "debug",
		"PORT":     ":3000",
		"DB_FILE":  "database.db",
	})

	dbFile := os.Getenv("DB_FILE")
	if err := backend.DatabaseConnect(dbFile); err != nil {
		log.Fatal(err)
		return
	}

	gin.SetMode(os.Getenv("GIN_MODE"))
	server := gin.New()
	setupServer(server)

	port := os.Getenv("PORT")
	fmt.Printf("Listening on port %s...\n", port)
	log.Fatal(server.Run(port))
}

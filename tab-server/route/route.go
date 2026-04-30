package route

import (
	"strconv"
	"tab-server/configs"
	"tab-server/logs"
	"tab-server/middlewares"
	"tab-server/service"

	"github.com/gin-gonic/gin"
)

func Run() {
	engine := gin.Default()
	// 接口耗时监控
	engine.Use(middlewares.HandleEndpointLantency())
	engine.Use(middlewares.Cors())

	engine.GET("/ping", service.Ping)
	engine.POST("/signup", service.SignUp)
	engine.POST("/signin", service.SignIn)
	engine.GET("/refresh", middlewares.RefreshAuth(), service.RefreshToken)
	engine.GET("/refreshjwt", middlewares.JWTAuth(), service.RefreshJWT)

	auth := engine.Group("/auth", middlewares.JWTAuth())
	{
		auth.DELETE("/logout", service.LogOut)
		bookmarks := auth.Group("/bookmarks")
		{
			bookmarks.GET("/find/:updateAt", service.FindBookmarks)
			bookmarks.POST("/push/:index", service.PushBookmark)
			bookmarks.PUT("/update/:index/:target", service.UpdateBookmark)
			bookmarks.PUT("/move/:index/:target", service.MoveBookmark)
			bookmarks.PUT("/swap/:index", service.SwapBookmark)
			bookmarks.DELETE("/:rowIndex/:colIndex", service.RemoveBookmark)
			bookmarks.DELETE("/page", service.ClearBookmarkRows)
		}
	}

	err := engine.Run(":" + strconv.Itoa(configs.Config.Port))
	if err != nil {
		logs.Logger.Fatal(err)
	}

}

package route

import (
	"strconv"
	"tab-server/configs"
	"tab-server/logs"

	"github.com/gin-gonic/gin"
)

func Run() {
	engine := gin.Default()

	err := engine.Run(":" + strconv.Itoa(configs.Config.Port))
	if err != nil {
		logs.Logger.Fatal(err)
	}

}

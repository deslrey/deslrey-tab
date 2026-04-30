package main

import (
	"tab-server/configs"
	"tab-server/dao"
	"tab-server/logs"
	"tab-server/middlewares"
	"tab-server/route"
)

func main() {
	if err := configs.Init(); err != nil {
		panic("无法加载配置: " + err.Error())
	}

	logs.Init()
	if err := dao.Init(); err != nil {
		logs.Logger.Fatal(err)
	}
	logs.Logger.Infof("Version:%s", middlewares.VERSION)
	route.Run()

	logs.Logger.Info("系统已退出")
}

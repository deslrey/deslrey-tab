package main

import (
	"log"
	"tab-server/configs"
	"tab-server/logs"
)

func main() {
	if err := configs.Init(); err != nil {
		log.Fatalf("无法加载配置: %v", err)
	}

	logs.Init()

	logs.Logger.Info("系统启动成功")
}

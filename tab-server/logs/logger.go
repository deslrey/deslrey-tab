package logs

import (
	"fmt"
	"io"
	"os"
	"tab-server/configs"
	"time"

	"github.com/charmbracelet/log"
	"github.com/natefinch/lumberjack/v3"
)

var Logger *log.Logger

func Init() {
	if configs.Config.Debug {
		Logger = log.NewWithOptions(os.Stderr, log.Options{
			Level:           log.DebugLevel,
			ReportCaller:    true,
			ReportTimestamp: true,
		})
	} else {
		jackLogger, err := lumberjack.NewRoller("./logs/log", 500*1024*1024, &lumberjack.Options{
			MaxBackups: 3,
			MaxAge:     28 * 24 * time.Hour,
			Compress:   true,
		})

		if err != nil {
			fmt.Printf("failed to init logger: %v\n", err)
			os.Exit(1)
		}

		multiWriter := io.MultiWriter(os.Stderr, jackLogger)

		Logger = log.NewWithOptions(multiWriter, log.Options{
			Level:           log.WarnLevel,
			ReportTimestamp: true,
		})
	}
}

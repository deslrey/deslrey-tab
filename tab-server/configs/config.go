package configs

import (
	"flag"
	"os"

	"github.com/goccy/go-yaml"
)

type ConfigType struct {
	Debug bool `yaml:"debug"`

	DomainName string `yaml:"domainName"`
	Port       int    `yaml:"port"`

	JwtSigningKey string `yaml:"jwtSigningKey"`

	PostgreSQL struct {
		Host string `yaml:"host"`
		Port int    `yaml:"port"`

		User     string `yaml:"user"`
		Password string `yaml:"password"`
		DBName   string `yaml:"dbName"`
	} `yaml:"postgresql"`

	Redis struct {
		Host string `yaml:"host"`
		Port int    `yaml:"port"`

		User     string `yaml:"user"`
		Password string `yaml:"password"`
		DBName   int    `yaml:"dbName"`
	} `yaml:"redis"`
}

var Config ConfigType

func Init() error {
	configPath, err := parseFlags()
	if err != nil {
		return err
	}

	data, err := os.ReadFile(configPath)
	if err != nil {
		return err
	}

	if err := yaml.Unmarshal(data, &Config); err != nil {
		return err
	}

	return nil
}

func parseFlags() (string, error) {
	var configPath string

	if flag.Parsed() {
		return "./config.yaml", nil
	}
	flag.StringVar(&configPath, "config", "./config.yaml", "Path to config file")
	flag.Parse()
	return configPath, nil
}

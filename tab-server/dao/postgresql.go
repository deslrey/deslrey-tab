package dao

import (
	"errors"
	"fmt"
	"regexp"
	"strconv"
	"tab-server/configs"
	"tab-server/models"
	"time"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var postgresqlDB *gorm.DB

func initPostgresql() error {
	if err := ensureDatabaseExists(); err != nil {
		return err
	}

	dsn := "host=" + configs.Config.PostgreSQL.Host +
		" user=" + configs.Config.PostgreSQL.User +
		" password=" + configs.Config.PostgreSQL.Password +
		" dbname=" + configs.Config.PostgreSQL.DBName +
		" port=" + strconv.Itoa(configs.Config.PostgreSQL.Port) +
		" sslmode=disable TimeZone=Asia/Shanghai"
	var err error
	postgresqlDB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		return err
	}
	return postgresqlDB.AutoMigrate(&models.User{}, &models.Bookmarks{})
}

func ensureDatabaseExists() error {
	dbName := configs.Config.PostgreSQL.DBName
	if !regexp.MustCompile(`^[a-zA-Z0-9_]+$`).MatchString(dbName) {
		return fmt.Errorf("invalid postgresql db name: %s", dbName)
	}

	adminDSN := "host=" + configs.Config.PostgreSQL.Host +
		" user=" + configs.Config.PostgreSQL.User +
		" password=" + configs.Config.PostgreSQL.Password +
		" dbname=postgres" +
		" port=" + strconv.Itoa(configs.Config.PostgreSQL.Port) +
		" sslmode=disable TimeZone=Asia/Shanghai"

	adminDB, err := gorm.Open(postgres.Open(adminDSN), &gorm.Config{})
	if err != nil {
		return err
	}

	var exists bool
	if err = adminDB.Raw("SELECT EXISTS(SELECT 1 FROM pg_database WHERE datname = ?)", dbName).Scan(&exists).Error; err != nil {
		return err
	}
	if exists {
		return nil
	}

	return adminDB.Exec(`CREATE DATABASE "` + dbName + `"`).Error
}

func AddUser(user *models.User) error {
	return postgresqlDB.Create(user).Error
}

func FindUserByEmail(email string) (*models.User, error) {
	var user models.User
	err := postgresqlDB.Where("email = ?", email).First(&user).Error
	return &user, err
}

func CreateDefaultBookmarks(userID uint) error {
	seed := models.Bookmarks{
		UserID:         userID,
		UpdateAt:       time.Now().Unix(),
		ArrayBookmarks: [][]models.Item{{}},
	}
	return postgresqlDB.Create(&seed).Error
}

func FindBookmarks(userID uint) (*models.Bookmarks, error) {
	var doc models.Bookmarks
	err := postgresqlDB.Where("user_id = ?", userID).First(&doc).Error
	return &doc, err
}

func SaveBookmarks(doc *models.Bookmarks) error {
	doc.UpdateAt = time.Now().Unix()
	return postgresqlDB.Save(doc).Error
}

func EnsureRow(doc *models.Bookmarks, row int) {
	for len(doc.ArrayBookmarks) <= row {
		doc.ArrayBookmarks = append(doc.ArrayBookmarks, []models.Item{})
	}
}

func CheckBookmarkVersion(userID uint, version int64) (bool, error) {
	doc, err := FindBookmarks(userID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return false, nil
		}
		return false, err
	}
	return doc.UpdateAt == version, nil
}

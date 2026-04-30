package dao

import (
	"context"
	"encoding/json"
	"strconv"
	"tab-server/configs"
	"tab-server/models"
	"time"

	"github.com/google/uuid"
	"github.com/redis/go-redis/v9"
)

var redisDB *redis.Client

const tokenExpire = 30 * 24 * time.Hour

func initRedis() error {
	redisDB = redis.NewClient(&redis.Options{
		Addr:     configs.Config.Redis.Host + ":" + strconv.Itoa(configs.Config.Redis.Port),
		Username: configs.Config.Redis.User,
		Password: configs.Config.Redis.Password,
		DB:       configs.Config.Redis.DBName,
	})
	return redisDB.Ping(context.Background()).Err()
}

func tokenKey(userID uint) string {
	return "refresh_auth:" + strconv.Itoa(int(userID))
}

func blacklistKey(token string) string {
	return "token_blacklist:" + token
}

func AddDevice(userID uint, userAgent, clientIP string) (*models.TokenInfo, error) {
	now := time.Now()
	info := models.DeviceInfo{
		Token:      uuid.NewString(),
		ExpireUnix: now.Add(tokenExpire).Unix(),
		LoginTime:  now.Unix(),
		UserAgent:  userAgent,
		ClientIP:   clientIP,
	}
	raw, err := json.Marshal(info)
	if err != nil {
		return nil, err
	}
	key := tokenKey(userID)
	if err = redisDB.HSet(context.Background(), key, info.Token, raw).Err(); err != nil {
		return nil, err
	}
	if err = redisDB.Expire(context.Background(), key, tokenExpire).Err(); err != nil {
		return nil, err
	}
	return &models.TokenInfo{Token: info.Token, ExpireUnix: info.ExpireUnix}, nil
}

func GetDevice(userID uint, token string) (*models.DeviceInfo, error) {
	raw, err := redisDB.HGet(context.Background(), tokenKey(userID), token).Result()
	if err != nil {
		return nil, err
	}
	var info models.DeviceInfo
	if err = json.Unmarshal([]byte(raw), &info); err != nil {
		return nil, err
	}
	return &info, nil
}

func ReplaceDevice(userID uint, oldToken string) (*models.TokenInfo, error) {
	info, err := AddDevice(userID, "", "")
	if err != nil {
		return nil, err
	}
	if oldToken != "" {
		_ = redisDB.HDel(context.Background(), tokenKey(userID), oldToken).Err()
	}
	return info, nil
}

func RemoveDevice(userID uint, token string) error {
	if token == "" {
		return nil
	}
	if err := redisDB.HDel(context.Background(), tokenKey(userID), token).Err(); err != nil {
		return err
	}
	return redisDB.Set(context.Background(), blacklistKey(token), 1, tokenExpire).Err()
}

func IsBlacklisted(token string) bool {
	if token == "" {
		return false
	}
	n, err := redisDB.Exists(context.Background(), blacklistKey(token)).Result()
	if err != nil {
		return false
	}
	return n > 0
}

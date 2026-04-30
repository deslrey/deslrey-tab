package utils

import (
	"errors"
	"tab-server/configs"
	"tab-server/models"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

const jwtExpire = 24 * time.Hour

type Claims struct {
	models.JWTClaims
	jwt.RegisteredClaims
}

func GenerateJWT(userID uint, email string, tokenInfo *models.TokenInfo) (string, error) {
	now := time.Now()
	claims := Claims{
		JWTClaims: models.JWTClaims{
			ID:    userID,
			Email: email,
			Token: *tokenInfo,
		},
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(now.Add(jwtExpire)),
			IssuedAt:  jwt.NewNumericDate(now),
		},
	}
	t := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return t.SignedString([]byte(configs.Config.JwtSigningKey))
}

func ParseJWT(token string) (*Claims, error) {
	claims := &Claims{}
	parsed, err := jwt.ParseWithClaims(token, claims, func(token *jwt.Token) (any, error) {
		return []byte(configs.Config.JwtSigningKey), nil
	})
	if err != nil {
		return claims, err
	}
	if !parsed.Valid {
		return nil, errors.New("invalid jwt")
	}
	return claims, nil
}

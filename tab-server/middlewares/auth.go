package middlewares

import (
	"errors"
	"net/http"
	"tab-server/dao"
	"tab-server/utils"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

func JWTAuth() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		token := ctx.GetHeader("x-jwt")
		if token == "" {
			ctx.JSON(http.StatusUnauthorized, gin.H{"error": "jwt token missing"})
			ctx.Abort()
			return
		}
		claims, err := utils.ParseJWT(token)
		if err != nil {
			if errors.Is(err, jwt.ErrTokenExpired) {
				ctx.JSON(http.StatusUnauthorized, gin.H{"error": "jwt expired, please refresh"})
				ctx.Abort()
				return
			}
			ctx.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			ctx.Abort()
			return
		}
		if dao.IsBlacklisted(claims.JWTClaims.Token.Token) {
			ctx.JSON(http.StatusUnauthorized, gin.H{"error": "token invalid"})
			ctx.Abort()
			return
		}
		ctx.Set("claims", claims)
		ctx.Next()
	}
}

func RefreshAuth() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		token := ctx.GetHeader("x-jwt")
		if token == "" {
			ctx.JSON(http.StatusUnauthorized, gin.H{"error": "jwt token missing"})
			ctx.Abort()
			return
		}
		claims, err := utils.ParseJWT(token)
		if err != nil && !errors.Is(err, jwt.ErrTokenExpired) {
			ctx.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			ctx.Abort()
			return
		}
		if dao.IsBlacklisted(claims.JWTClaims.Token.Token) {
			ctx.JSON(http.StatusUnauthorized, gin.H{"error": "token invalid"})
			ctx.Abort()
			return
		}
		ctx.Set("claims", claims)
		ctx.Next()
	}
}

package service

import (
	"errors"
	"net/http"
	"tab-server/dao"
	"tab-server/models"
	"tab-server/utils"

	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
	"gorm.io/gorm"
)

func Ping(ctx *gin.Context) {
	ctx.JSON(http.StatusOK, gin.H{"data": "pong"})
}

func SignUp(ctx *gin.Context) {
	var req models.RegisterUser
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "参数错误"})
		return
	}
	if _, err := dao.FindUserByEmail(req.Email); err == nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "邮箱已注册"})
		return
	} else if !errors.Is(err, gorm.ErrRecordNotFound) {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "服务器错误"})
		return
	}

	hashed, err := utils.HashPassword(req.Password)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "服务器错误"})
		return
	}
	user := &models.User{Email: req.Email, Password: hashed}
	if err = dao.AddUser(user); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "注册失败"})
		return
	}
	if err = dao.CreateDefaultBookmarks(user.ID); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "初始化书签失败"})
		return
	}
	ctx.JSON(http.StatusOK, gin.H{"data": gin.H{"message": "注册成功", "userId": user.ID}})
}

func SignIn(ctx *gin.Context) {
	var req models.LoginUser
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "参数错误"})
		return
	}
	user, err := dao.FindUserByEmail(req.Email)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "用户不存在"})
			return
		}
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "服务器错误"})
		return
	}
	if err = utils.ComparePassword(user.Password, req.Password); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "邮箱或密码错误"})
		return
	}
	tokenInfo, err := dao.AddDevice(user.ID, ctx.GetHeader("User-Agent"), ctx.ClientIP())
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "登录状态写入失败"})
		return
	}
	j, err := utils.GenerateJWT(user.ID, user.Email, tokenInfo)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "签发令牌失败"})
		return
	}
	ctx.JSON(http.StatusOK, gin.H{"data": gin.H{
		"token": j,
		"userInfo": gin.H{
			"id":    user.ID,
			"email": user.Email,
		},
	}})
}

func RefreshToken(ctx *gin.Context) {
	claims, err := utils.GetClaims(ctx)
	if err != nil {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "鉴权失败"})
		return
	}
	info, err := dao.GetDevice(claims.JWTClaims.ID, claims.JWTClaims.Token.Token)
	if err != nil {
		if errors.Is(err, redis.Nil) {
			ctx.JSON(http.StatusUnauthorized, gin.H{"error": "登录态失效"})
			return
		}
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "服务器错误"})
		return
	}
	newTokenInfo := &models.TokenInfo{Token: info.Token, ExpireUnix: info.ExpireUnix}
	j, err := utils.GenerateJWT(claims.JWTClaims.ID, claims.JWTClaims.Email, newTokenInfo)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "签发令牌失败"})
		return
	}
	ctx.JSON(http.StatusOK, gin.H{"data": gin.H{"token": j}})
}

func RefreshJWT(ctx *gin.Context) {
	RefreshToken(ctx)
}

func LogOut(ctx *gin.Context) {
	claims, err := utils.GetClaims(ctx)
	if err != nil {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "鉴权失败"})
		return
	}
	if err = dao.RemoveDevice(claims.JWTClaims.ID, claims.JWTClaims.Token.Token); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "退出失败"})
		return
	}
	ctx.Status(http.StatusNoContent)
}

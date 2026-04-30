package utils

import (
	"errors"

	"github.com/gin-gonic/gin"
)

func GetClaims(ctx *gin.Context) (*Claims, error) {
	v, ok := ctx.Get("claims")
	if !ok {
		return nil, errors.New("claims not found")
	}
	claims, ok := v.(*Claims)
	if !ok {
		return nil, errors.New("claims type mismatch")
	}
	return claims, nil
}

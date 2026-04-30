package service

import (
	"net/http"
	"slices"
	"strconv"
	"tab-server/dao"
	"tab-server/models"
	"tab-server/utils"

	"github.com/gin-gonic/gin"
)

func FindBookmarks(ctx *gin.Context) {
	claims, err := utils.GetClaims(ctx)
	if err != nil {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "鉴权失败"})
		return
	}
	updateAt := ctx.Param("updateAt")
	if updateAt != "0" {
		v, convErr := strconv.ParseInt(updateAt, 10, 64)
		if convErr != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "非法参数"})
			return
		}
		same, checkErr := dao.CheckBookmarkVersion(claims.JWTClaims.ID, v)
		if checkErr == nil && same {
			ctx.Status(http.StatusNoContent)
			return
		}
	}
	doc, err := dao.FindBookmarks(claims.JWTClaims.ID)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "未找到书签数据"})
		return
	}
	ctx.JSON(http.StatusOK, gin.H{"data": doc})
}

func PushBookmark(ctx *gin.Context) {
	row, err := strconv.Atoi(ctx.Param("index"))
	if err != nil || row < 0 {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "非法参数"})
		return
	}
	claims, err := utils.GetClaims(ctx)
	if err != nil {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "鉴权失败"})
		return
	}
	var item models.Item
	if err = ctx.ShouldBindJSON(&item); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "字段错误"})
		return
	}
	doc, err := dao.FindBookmarks(claims.JWTClaims.ID)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "未找到书签数据"})
		return
	}
	dao.EnsureRow(doc, row)
	doc.ArrayBookmarks[row] = append(doc.ArrayBookmarks[row], item)
	if err = dao.SaveBookmarks(doc); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "添加失败"})
		return
	}
	ctx.JSON(http.StatusOK, gin.H{"updateAt": doc.UpdateAt, "data": item})
}

func UpdateBookmark(ctx *gin.Context) {
	row, err := strconv.Atoi(ctx.Param("index"))
	if err != nil || row < 0 {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "非法参数"})
		return
	}
	col, err := strconv.Atoi(ctx.Param("target"))
	if err != nil || col < 0 {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "非法参数"})
		return
	}
	claims, err := utils.GetClaims(ctx)
	if err != nil {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "鉴权失败"})
		return
	}
	var item models.Item
	if err = ctx.ShouldBindJSON(&item); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "字段错误"})
		return
	}
	doc, err := dao.FindBookmarks(claims.JWTClaims.ID)
	if err != nil || row >= len(doc.ArrayBookmarks) || col >= len(doc.ArrayBookmarks[row]) {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "书签不存在"})
		return
	}
	doc.ArrayBookmarks[row][col] = item
	if err = dao.SaveBookmarks(doc); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "更新失败"})
		return
	}
	ctx.JSON(http.StatusOK, gin.H{"updateAt": doc.UpdateAt, "data": item})
}

func MoveBookmark(ctx *gin.Context) {
	srcRow, err := strconv.Atoi(ctx.Param("index"))
	if err != nil || srcRow < 0 {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "非法参数"})
		return
	}
	srcCol, err := strconv.Atoi(ctx.Param("target"))
	if err != nil || srcCol < 0 {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "非法参数"})
		return
	}
	var req models.MoveItem
	if err = ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "字段错误"})
		return
	}
	claims, err := utils.GetClaims(ctx)
	if err != nil {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "鉴权失败"})
		return
	}
	doc, err := dao.FindBookmarks(claims.JWTClaims.ID)
	if err != nil || srcRow >= len(doc.ArrayBookmarks) || srcCol >= len(doc.ArrayBookmarks[srcRow]) {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "书签不存在"})
		return
	}
	item := doc.ArrayBookmarks[srcRow][srcCol]
	doc.ArrayBookmarks[srcRow] = append(doc.ArrayBookmarks[srcRow][:srcCol], doc.ArrayBookmarks[srcRow][srcCol+1:]...)
	dao.EnsureRow(doc, int(req.NewRowIndex))
	dst := doc.ArrayBookmarks[req.NewRowIndex]
	pos := int(req.NewColIndex)
	if pos < 0 || pos > len(dst) {
		pos = len(dst)
	}
	dst = append(dst, models.Item{})
	copy(dst[pos+1:], dst[pos:])
	dst[pos] = item
	doc.ArrayBookmarks[req.NewRowIndex] = dst
	if err = dao.SaveBookmarks(doc); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "移动失败"})
		return
	}
	ctx.JSON(http.StatusOK, gin.H{"updateAt": doc.UpdateAt, "data": item})
}

func SwapBookmark(ctx *gin.Context) {
	row, err := strconv.Atoi(ctx.Param("index"))
	if err != nil || row < 0 {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "非法参数"})
		return
	}
	claims, err := utils.GetClaims(ctx)
	if err != nil {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "鉴权失败"})
		return
	}
	var req map[uint]models.Item
	if err = ctx.ShouldBindJSON(&req); err != nil || len(req) != 2 {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "字段错误"})
		return
	}
	doc, err := dao.FindBookmarks(claims.JWTClaims.ID)
	if err != nil || row >= len(doc.ArrayBookmarks) {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "书签不存在"})
		return
	}
	keys := make([]uint, 0, 2)
	for k := range req {
		keys = append(keys, k)
	}
	slices.Sort(keys)
	a, b := int(keys[0]), int(keys[1])
	if a < 0 || b < 0 || a >= len(doc.ArrayBookmarks[row]) || b >= len(doc.ArrayBookmarks[row]) {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "索引越界"})
		return
	}
	doc.ArrayBookmarks[row][a], doc.ArrayBookmarks[row][b] = doc.ArrayBookmarks[row][b], doc.ArrayBookmarks[row][a]
	if err = dao.SaveBookmarks(doc); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "交换失败"})
		return
	}
	ctx.JSON(http.StatusOK, gin.H{"updateAt": doc.UpdateAt})
}

func RemoveBookmark(ctx *gin.Context) {
	row, err := strconv.Atoi(ctx.Param("rowIndex"))
	if err != nil || row < 0 {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "非法参数"})
		return
	}
	col, err := strconv.Atoi(ctx.Param("colIndex"))
	if err != nil || col < 0 {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "非法参数"})
		return
	}
	claims, err := utils.GetClaims(ctx)
	if err != nil {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "鉴权失败"})
		return
	}
	doc, err := dao.FindBookmarks(claims.JWTClaims.ID)
	if err != nil || row >= len(doc.ArrayBookmarks) || col >= len(doc.ArrayBookmarks[row]) {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "书签不存在"})
		return
	}
	doc.ArrayBookmarks[row] = append(doc.ArrayBookmarks[row][:col], doc.ArrayBookmarks[row][col+1:]...)
	if err = dao.SaveBookmarks(doc); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "删除失败"})
		return
	}
	ctx.JSON(http.StatusOK, gin.H{"updateAt": doc.UpdateAt})
}

func ClearBookmarkRows(ctx *gin.Context) {
	var rows []uint
	if err := ctx.ShouldBindJSON(&rows); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "字段错误"})
		return
	}
	claims, err := utils.GetClaims(ctx)
	if err != nil {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "鉴权失败"})
		return
	}
	doc, err := dao.FindBookmarks(claims.JWTClaims.ID)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "未找到书签数据"})
		return
	}
	slices.SortFunc(rows, func(a, b uint) int { return int(b) - int(a) })
	for _, r := range rows {
		i := int(r)
		if i >= 0 && i < len(doc.ArrayBookmarks) {
			doc.ArrayBookmarks = append(doc.ArrayBookmarks[:i], doc.ArrayBookmarks[i+1:]...)
		}
	}
	if len(doc.ArrayBookmarks) == 0 {
		doc.ArrayBookmarks = [][]models.Item{{}}
	}
	if err = dao.SaveBookmarks(doc); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "删除失败"})
		return
	}
	ctx.JSON(http.StatusOK, gin.H{"updateAt": doc.UpdateAt})
}

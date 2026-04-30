package models

import "database/sql"

type Item struct {
	URL      string `json:"url" binding:"required"`
	Title    string `json:"title"`
	Icon     string `json:"icon"`
	IsSvg    bool   `json:"isSvg"`
	Turn     bool   `json:"turn"`
	Color    string `json:"color,omitempty"`
	IconSize string `json:"iconSize,omitempty"`
}

type MoveItem struct {
	Item        Item `json:"item"`
	NewRowIndex uint `json:"newRowIndex"`
	NewColIndex uint `json:"newColIndex"`
}

type Bookmarks struct {
	ID             uint         `json:"-" gorm:"primarykey"`
	CreatedAt      int64        `json:"-" gorm:"autoCreateTime"`
	UpdatedAt      int64        `json:"-" gorm:"autoUpdateTime"`
	DeletedAt      sql.NullTime `json:"-" gorm:"index"`
	UserID         uint         `json:"userId" gorm:"uniqueIndex;not null"`
	UpdateAt       int64        `json:"updateAt" gorm:"not null"`
	ArrayBookmarks [][]Item     `json:"arrayBookmarks" gorm:"serializer:json;type:jsonb"`
}

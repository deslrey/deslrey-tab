package models

import "database/sql"

type User struct {
	ID        uint         `json:"id" gorm:"primarykey"`
	CreatedAt int64        `json:"createdAt" gorm:"autoCreateTime"`
	UpdatedAt int64        `json:"updatedAt" gorm:"autoUpdateTime"`
	DeletedAt sql.NullTime `json:"-" gorm:"index"`

	Email    string `json:"email" binding:"required,email" gorm:"uniqueIndex;not null"`
	Password string `json:"-" binding:"required" gorm:"not null"`
}

type RegisterUser struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type LoginUser struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

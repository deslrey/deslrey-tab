package models

type TokenInfo struct {
	Token      string `json:"token"`
	ExpireUnix int64  `json:"expireUnix"`
}

type DeviceInfo struct {
	Token      string `json:"token"`
	ExpireUnix int64  `json:"expireUnix"`
	LoginTime  int64  `json:"loginTime"`
	UserAgent  string `json:"userAgent"`
	ClientIP   string `json:"clientIp"`
}

type JWTClaims struct {
	ID    uint      `json:"id"`
	Email string    `json:"email"`
	Token TokenInfo `json:"tokenInfo"`
}

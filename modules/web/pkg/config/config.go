package config

type Config struct {
	ServerTime int64  `json:"serverTime"`
	UserAgent  string `json:"userAgent"`
	Version    string `json:"version"`
}

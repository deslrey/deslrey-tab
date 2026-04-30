package dao

func Init() error {
	if err := initPostgresql(); err != nil {
		return err
	}
	if err := initRedis(); err != nil {
		return err
	}
	return nil
}

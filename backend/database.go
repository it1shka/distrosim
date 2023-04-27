package backend

import (
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var database *gorm.DB

func DatabaseConnect(databaseFileName string) error {
	db, err := gorm.Open(sqlite.Open(databaseFileName), &gorm.Config{})
	if err != nil {
		return err
	}
	database = db
	db.AutoMigrate(&DistributedNetworkModel{}, &ComputerModel{}, &ConnectionModel{})
	return nil
}

// MODELS:

type DistributedNetworkModel struct {
	ID          uint    `gorm:"primaryKey;autoIncrement" json:"id"`
	Name        string  `gorm:"size:20" json:"name"`
	AuthorName  string  `gorm:"size:20" json:"authorName"`
	Description *string `gorm:"size:100" json:"description"`
}

type ComputerModel struct {
	NetworkID          uint `gorm:"index"`
	Index              uint
	ComputerType       string
	Name               string
	WorkloadThreshold  uint
	RequestThreshold   uint
	ProcessCoefficient uint
	PositionX          float64
	PositionY          float64
}

type ConnectionModel struct {
	NetworkID   uint `gorm:"index"`
	FirstIndex  uint
	SecondIndex uint
}

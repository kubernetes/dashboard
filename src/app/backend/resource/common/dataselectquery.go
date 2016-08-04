package common

import "log"

type DataSelectQuery struct {
	PaginationQuery *PaginationQuery
	SortQuery       *SortQuery
	//	Filter     *FilterQuery
}
// sort query will be in format - a,name,d,age,...   which means sort ascending name, later descending age, ...
type SortQuery struct {
	SortByList []SortBy

}

type SortBy struct {
	Property  string
	Ascending bool
}


func NewSortQuery(sortByListRaw []string) (*SortQuery) {
	if sortByListRaw == nil || len(sortByListRaw)%2 == 1{
		return NoSort
	}
	sortByList := []SortBy{}
	for i:=0; i+1 < len(sortByListRaw); i+=2 {
		// parse order option
		var ascending bool
		orderOption := sortByListRaw[i]
		if sortByListRaw[i] == "a" {
			ascending = true
		} else if sortByListRaw[i] == "d" {
			ascending = false
		} else {
			log.Print(`Invalid order option. Only ascending (a), descending (d) options are supported. Found "%s".`, orderOption)
			return NoSort
		}

		// parse variable name. sortByListRaw cant be odd so following index will never fail.
		variableName := sortByListRaw[i+1]
		sortBy := SortBy{
			Property: variableName,
			Ascending: ascending,
		}
		sortByList = append(sortByList, sortBy)
	}
	return &SortQuery{
		SortByList: sortByList,
	}
}


func NewDataSelect(paginationQuery *PaginationQuery, sortQuery *SortQuery) (*DataSelectQuery) {
	return &DataSelectQuery{
		PaginationQuery: paginationQuery,
		SortQuery:       sortQuery,
	}
}
var NoSort = &SortQuery{
	SortByList: []SortBy{},
}


package common

import (
	"time"
	"strings"
	"sort"
	"log"
)

type DataSelectQuery struct {
	PaginationQuery *PaginationQuery
	SortQuery       *SortQuery
//	Filter     *FilterQuery
}

type SelectableInterface interface {
	// Returns length of the collection
	Len() int
	// Returns slice of the collection (just like slice in go with start, end indexes)
	Slice(int, int) SelectableInterface

	// swaps 2 elements of the collection
	Swap(int, int)
	// GetPropertyAtIndex returns the value of the property at this index.
	// value has a Compare method which allows to compare it to other property
	GetPropertyAtIndex(string, int) ComparableValueInterface

}

type ComparableValueInterface interface {
	Compare(ComparableValueInterface) int
}

// here I am using a trick to be able to use built in sort function (sort.Sort) for sorting
// The aim is to implement sort.Interface - it is to define 3 methods:
// Len, Swap and Less
type SortableSelectableInterface struct {
	SelectableInterface SelectableInterface
	SortQuery *SortQuery
}
// 2 easy functions, just wrap
func (self SortableSelectableInterface) Len() int {return self.SelectableInterface.Len()}
func (self SortableSelectableInterface) Swap(i, j int) {self.SelectableInterface.Swap(i, j)}

// Now more complicated one, implement less! Here we have to be careful because value of less depends on SortQuery
func (self SortableSelectableInterface) Less(i, j int) bool {
	for _, sortBy := range (*self.SortQuery).SortByList {
		a := self.SelectableInterface.GetPropertyAtIndex(sortBy.Property, i)
		b := self.SelectableInterface.GetPropertyAtIndex(sortBy.Property, j)
		cmp := a.Compare(b)
		if cmp == 0 { // values are the same. Just continue to next sortBy
			continue
		} else {  // values different
			return (cmp==-1 && sortBy.Ascending) || (cmp==1 && !sortBy.Ascending)
		}
	}
	return false
}


// sort qury will be in format - a,name,d,age,...   which means sort ascending name, later descending age, ...
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



func GenericDataSelect(dataList SelectableInterface, dsQuery *DataSelectQuery) (SelectableInterface){
	log.Print("Welcome to the generics!")
	// Simple pipeline:
	// First sort
	dataList = GenericSort(dataList, dsQuery.SortQuery)
	// Afterwards paginate
	return GenericPaginate(dataList, dsQuery.PaginationQuery)
}


func GenericSort(dataList SelectableInterface, sQuery *SortQuery) (SelectableInterface) {
	sort.Sort(SortableSelectableInterface{SelectableInterface: dataList, SortQuery: sQuery})
	return dataList
}

func GenericPaginate(dataList SelectableInterface, pQuery *PaginationQuery) (SelectableInterface) {
	startIndex, endIndex := pQuery.GetPaginationSettings(dataList.Len())

	// Return all items if provided settings do not meet requirements
	if !pQuery.CanPaginate(dataList.Len(), startIndex) {
		return dataList
	}
	return dataList.Slice(startIndex, endIndex)
}

func intsCompare(a, b int) int {
	if a > b {
		return 1
	} else if a == b {
		return 0
	}
	return -1
}

func ints64Compare(a, b int64) int {
	if a > b {
		return 1
	} else if a == b {
		return 0
	}
	return -1
}
// ----------------------- Standard Comparable Types ------------------------
// These types specify how given value should be compared
// They all implement ComparableValueInterface
// You can convert basic types to these types to supprt auto sorting etc.
// If you cant find your type compare here you will have to implement it yourself :)


type StdComparableInt int

func (self StdComparableInt) Compare(otherV ComparableValueInterface) int {
	other := otherV.(StdComparableInt)
	return intsCompare(int(self), int(other))
}


type StdComparableString string

func (self StdComparableString) Compare(otherV ComparableValueInterface) int {
	other := otherV.(StdComparableString)
	return strings.Compare(string(self), string(other))
}


type StdComparableRFC3339Timestamp string

func (self StdComparableRFC3339Timestamp) Compare(otherV ComparableValueInterface) int {
	other := otherV.(StdComparableRFC3339Timestamp)
	// try to compare as timestamp (earlier = smaller)
	selfTime, err1 := time.Parse(time.RFC3339, string(self))
        otherTime, err2 := time.Parse(time.RFC3339, string(other))

	if err1!=nil || err2!=nil {
		// in case of timestamp parsing failure just compare as strings
		return strings.Compare(string(self), string(other))
	} else {
		return ints64Compare(selfTime.Unix(), otherTime.Unix())
	}
}

type StdComparableTime time.Time

func (self StdComparableTime) Compare(otherV ComparableValueInterface) int {
	other := otherV.(StdComparableTime)
	return ints64Compare(time.Time(self).Unix(), time.Time(other).Unix())
}

package common

import (
	"time"
	"strings"
	"sort"
)



type GenericDataCell interface {
	// GetPropertyAtIndex returns the property of this data cell
	GetProperty(string) ComparableValue
}

type ComparableValue interface {
	Compare(ComparableValue) int
}


type SelectableDataList struct {
	GenericDataList []GenericDataCell
	DataSelectQuery *DataSelectQuery
}

// here I am using a trick to be able to use built in sort function (sort.Sort) for sorting
// The aim is to implement sort.Interface - it is to define 3 methods:
// Len, Swap and Less

// 2 easy functions, just wrap
func (self SelectableDataList) Len() int {return len(self.GenericDataList)}
func (self SelectableDataList) Swap(i, j int) {self.GenericDataList[i], self.GenericDataList[j] = self.GenericDataList[j], self.GenericDataList[i]}

// Now more complicated one, implement less! Here we have to be careful because value of less depends on SortQuery
func (self SelectableDataList) Less(i, j int) bool {
	for _, sortBy := range (*self.DataSelectQuery.SortQuery).SortByList {
		a := self.GenericDataList[i].GetProperty(sortBy.Property)
		b := self.GenericDataList[j].GetProperty(sortBy.Property)
		cmp := a.Compare(b)
		if cmp == 0 { // values are the same. Just continue to next sortBy
			continue
		} else {  // values different
			return (cmp==-1 && sortBy.Ascending) || (cmp==1 && !sortBy.Ascending)
		}
	}
	return false
}

func (self SelectableDataList) Select() []GenericDataCell {
	sort.Sort(self)
	return GenericPaginate(self.GenericDataList, self.DataSelectQuery.PaginationQuery)
}

func GenericPaginate(dataList []GenericDataCell, pQuery *PaginationQuery) ([]GenericDataCell) {
	startIndex, endIndex := pQuery.GetPaginationSettings(len(dataList))

	// Return all items if provided settings do not meet requirements
	if !pQuery.CanPaginate(len(dataList), startIndex) {
		return dataList
	}
	return dataList[startIndex:endIndex]
}

func GenericDataSelect(dataList []GenericDataCell, dsQuery *DataSelectQuery) ([]GenericDataCell){
	selectableDataList := SelectableDataList{
		GenericDataList: dataList,
		DataSelectQuery: dsQuery,
	}
	return selectableDataList.Select()
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

func (self StdComparableInt) Compare(otherV ComparableValue) int {
	other := otherV.(StdComparableInt)
	return intsCompare(int(self), int(other))
}


type StdComparableString string

func (self StdComparableString) Compare(otherV ComparableValue) int {
	other := otherV.(StdComparableString)
	return strings.Compare(string(self), string(other))
}


type StdComparableRFC3339Timestamp string

func (self StdComparableRFC3339Timestamp) Compare(otherV ComparableValue) int {
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

func (self StdComparableTime) Compare(otherV ComparableValue) int {
	other := otherV.(StdComparableTime)
	return ints64Compare(time.Time(self).Unix(), time.Time(other).Unix())
}

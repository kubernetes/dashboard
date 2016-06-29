package common

// By default backend pagination will not be applied.
var NO_PAGINATION = NewPaginationQuery(-1, -1)

// PaginationQuery structure represents pagination settings
type PaginationQuery struct {
	// How many items per page should be returned
	ItemsPerPage int
	// Number of page that should be returned when pagination is applied to the list
	Page int
}

// NewPaginationQuery return pagination query structure based on given parameters
func NewPaginationQuery(itemsPerPage, page int) *PaginationQuery {
	return &PaginationQuery{itemsPerPage, page}
}

// CanPaginate returns true if pagination can be applied to the list, false otherwise
func (p *PaginationQuery) CanPaginate(itemsCount, startingIndex int) bool {
	return p.ItemsPerPage > 0 && p.Page >= 0 && itemsCount > startingIndex
}

// GetPaginationSettings based on number of items and pagination query parameters returns start
// and end index that can be used to return paginated list of items.
func (p *PaginationQuery) GetPaginationSettings(itemsCount int) (startIndex int, endIndex int) {
	startIndex = p.ItemsPerPage * p.Page
	endIndex = startIndex + p.ItemsPerPage

	if endIndex > itemsCount {
		endIndex = itemsCount
	}

	return startIndex, endIndex
}

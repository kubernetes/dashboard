package common

var NO_PAGINATION = NewPaginationQuery(-1, -1)

type PaginationQuery struct {
	ItemsPerPage int
	Page int
}

func NewPaginationQuery(itemsPerPage, page int) *PaginationQuery {
	return &PaginationQuery{itemsPerPage, page}
}

func (p *PaginationQuery) CanPaginate(itemsCount, startingIndex int) bool {
	return p.ItemsPerPage > 0 && p.Page >= 0 && itemsCount > startingIndex
}

func (p *PaginationQuery) GetPaginationSettings(itemsCount int) (startIndex int, endIndex int) {
	startIndex = p.ItemsPerPage * p.Page
	endIndex = startIndex + p.ItemsPerPage

	if endIndex > itemsCount {
		endIndex = itemsCount
	}

	return startIndex, endIndex
}

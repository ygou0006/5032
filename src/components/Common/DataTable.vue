<template>
    <div class="data-table-component">
        <!-- 搜索和过滤 -->
        <div class="row mb-3">
            <div class="col-md-6">
                <div class="input-group">
                    <span class="input-group-text">
                        <i class="fas fa-search"></i>
                    </span>
                    <input type="text" class="form-control" placeholder="Search..." v-model="searchQuery"
                        @input="filterData">
                </div>
            </div>
            <div class="col-md-6 text-end">
                <div class="btn-group">
                    <button v-for="column in columns" :key="column.key" class="btn btn-outline-success btn-sm"
                        :class="{ active: sortColumn === column.key }" @click="sortBy(column.key)">
                        {{ column.label }}
                        <i v-if="sortColumn === column.key"
                            :class="sortDirection === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down'"></i>
                    </button>
                </div>
            </div>
        </div>

        <!-- 表格 -->
        <div class="table-responsive">
            <table class="table table-striped table-hover">
                <thead class="table-success">
                    <tr>
                        <th v-for="column in columns" :key="column.key" :style="column.style || ''">
                            {{ column.label }}
                        </th>
                        <th v-if="hasActions">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="item in paginatedData" :key="item.id">
                        <td v-for="column in columns" :key="column.key">
                            <template v-if="column.formatter">
                                {{ column.formatter(item[column.key], item) }}
                            </template>
                            <template v-else>
                                {{ item[column.key] }}
                            </template>
                        </td>
                        <td v-if="hasActions">
                            <div class="btn-group btn-group-sm">
                                <button v-if="actions.includes('view')" class="btn btn-outline-primary"
                                    @click="$emit('view', item)">
                                    <i class="fas fa-eye"></i>
                                </button>
                                <button v-if="actions.includes('edit')" class="btn btn-outline-success"
                                    @click="$emit('edit', item)">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button v-if="actions.includes('delete')" class="btn btn-outline-danger"
                                    @click="$emit('delete', item)">
                                    <i class="fas fa-trash"></i>
                                </button>
                                <button v-if="actions.includes('export')" class="btn btn-outline-info"
                                    @click="$emit('export', item)">
                                    <i class="fas fa-download"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                    <tr v-if="filteredData.length === 0">
                        <td :colspan="columns.length + (hasActions ? 1 : 0)" class="text-center py-4">
                            <i class="fas fa-inbox display-4 text-muted mb-2"></i>
                            <p class="text-muted">No data found</p>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- 分页 -->
        <div class="row align-items-center mt-3">
            <div class="col-md-6">
                <div class="d-flex align-items-center">
                    <span class="me-2 small">Show</span>
                    <select v-model="pageSize" class="form-select form-select-sm w-auto" @change="updatePagination">
                        <option value="5">5</option>
                        <option value="10">10</option>
                        <option value="25">25</option>
                        <option value="50">50</option>
                    </select>
                    <span class="ms-2 small">entries per page</span>
                </div>
            </div>
            <div class="col-md-6">
                <nav aria-label="Table navigation">
                    <ul class="pagination justify-content-end mb-0">
                        <li class="page-item" :class="{ disabled: currentPage === 1 }">
                            <button class="page-link" @click="changePage(currentPage - 1)">
                                <i class="fas fa-chevron-left"></i>
                            </button>
                        </li>

                        <li v-for="page in visiblePages" :key="page" class="page-item"
                            :class="{ active: page === currentPage }">
                            <button class="page-link" @click="changePage(page)">
                                {{ page }}
                            </button>
                        </li>

                        <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                            <button class="page-link" @click="changePage(currentPage + 1)">
                                <i class="fas fa-chevron-right"></i>
                            </button>
                        </li>
                    </ul>
                </nav>
            </div>
        </div>

        <!-- 表格信息 -->
        <div class="row mt-2">
            <div class="col-12">
                <p class="small text-muted mb-0">
                    Showing {{ startIndex + 1 }} to {{ endIndex }} of {{ filteredData.length }} entries
                </p>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'DataTable',
    props: {
        data: {
            type: Array,
            required: true
        },
        columns: {
            type: Array,
            required: true
        },
        actions: {
            type: Array,
            default: () => []
        },
        searchable: {
            type: Boolean,
            default: true
        },
        sortable: {
            type: Boolean,
            default: true
        },
        paginate: {
            type: Boolean,
            default: true
        },
        initialPageSize: {
            type: Number,
            default: 10
        }
    },
    data() {
        return {
            searchQuery: '',
            sortColumn: '',
            sortDirection: 'asc',
            currentPage: 1,
            pageSize: this.initialPageSize,
            filteredData: []
        }
    },
    computed: {
        hasActions() {
            return this.actions.length > 0
        },
        totalPages() {
            return Math.ceil(this.filteredData.length / this.pageSize)
        },
        paginatedData() {
            if (!this.paginate) {
                return this.filteredData
            }

            const start = (this.currentPage - 1) * this.pageSize
            const end = start + this.pageSize
            return this.filteredData.slice(start, end)
        },
        startIndex() {
            return (this.currentPage - 1) * this.pageSize
        },
        endIndex() {
            const end = this.startIndex + this.pageSize
            return end > this.filteredData.length ? this.filteredData.length : end
        },
        visiblePages() {
            const pages = []
            const maxVisible = 5
            let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2))
            let end = Math.min(this.totalPages, start + maxVisible - 1)

            if (end - start + 1 < maxVisible) {
                start = Math.max(1, end - maxVisible + 1)
            }

            for (let i = start; i <= end; i++) {
                pages.push(i)
            }

            return pages
        }
    },
    watch: {
        data: {
            handler(newData) {
                this.filteredData = [...newData]
                this.applySorting()
            },
            deep: true,
            immediate: true
        }
    },
    methods: {
        filterData() {
            if (!this.searchQuery.trim()) {
                this.filteredData = [...this.data]
            } else {
                const query = this.searchQuery.toLowerCase()
                this.filteredData = this.data.filter(item => {
                    return this.columns.some(column => {
                        const value = item[column.key]
                        return value && value.toString().toLowerCase().includes(query)
                    })
                })
            }

            this.currentPage = 1
            this.applySorting()
        },

        sortBy(column) {
            if (!this.sortable) return

            if (this.sortColumn === column) {
                this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc'
            } else {
                this.sortColumn = column
                this.sortDirection = 'asc'
            }

            this.applySorting()
        },

        applySorting() {
            if (!this.sortColumn) return

            this.filteredData.sort((a, b) => {
                let aValue = a[this.sortColumn]
                let bValue = b[this.sortColumn]

                // 处理不同类型的排序
                if (typeof aValue === 'string') {
                    aValue = aValue.toLowerCase()
                    bValue = bValue.toLowerCase()
                }

                if (aValue < bValue) return this.sortDirection === 'asc' ? -1 : 1
                if (aValue > bValue) return this.sortDirection === 'asc' ? 1 : -1
                return 0
            })
        },

        changePage(page) {
            if (page >= 1 && page <= this.totalPages) {
                this.currentPage = page
            }
        },

        updatePagination() {
            this.currentPage = 1
        },

        exportToCSV() {
            const headers = this.columns.map(col => col.label).join(',')
            const rows = this.filteredData.map(item =>
                this.columns.map(col => {
                    const value = item[col.key]
                    return `"${value}"` // 用引号包裹以防止逗号问题
                }).join(',')
            ).join('\n')

            const csv = `${headers}\n${rows}`
            const blob = new Blob([csv], { type: 'text/csv' })
            const url = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = 'data.csv'
            link.click()
            window.URL.revokeObjectURL(url)
        }
    }
}
</script>

<style scoped>
.data-table-component {
    background: white;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.table th {
    border-top: none;
    font-weight: 600;
    font-size: 0.9rem;
}

.pagination .page-link {
    color: #222;
    border-color: #dee2e6;
}

.pagination .page-item.active .page-link {
    background-color: #28a745;
    border-color: #28a745;
}

.pagination .page-link:hover {
    color: #28a745;
}

.btn-group .btn {
    border-radius: 4px;
}
</style>
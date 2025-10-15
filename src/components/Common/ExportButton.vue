<template>
    <button class="export-button" :class="buttonClass" @click="handleExport" :disabled="!data || data.length === 0">
        <i class="fas fa-download me-2"></i>
        {{ buttonText }}
    </button>
</template>

<script>
import { exportToCSV } from '@/utils/helpers'

export default {
    name: 'ExportButton',
    props: {
        data: {
            type: Array,
            required: true
        },
        columns: {
            type: Array,
            default: () => []
        },
        filename: {
            type: String,
            default: 'export'
        },
        format: {
            type: String,
            default: 'csv',
            validator: (value) => ['csv', 'json', 'pdf'].includes(value)
        },
        buttonText: {
            type: String,
            default: 'Export Data'
        },
        buttonClass: {
            type: String,
            default: 'btn btn-success'
        }
    },
    methods: {
        handleExport() {
            if (!this.data || this.data.length === 0) {
                alert('No data available to export')
                return
            }

            try {
                switch (this.format) {
                    case 'csv':
                        this.exportToCSV()
                        break
                    case 'json':
                        this.exportToJSON()
                        break
                    case 'pdf':
                        this.exportToPDF()
                        break
                    default:
                        this.exportToCSV()
                }

                this.$emit('exported', {
                    format: this.format,
                    count: this.data.length,
                    filename: this.filename
                })
            } catch (error) {
                console.error('Export error:', error)
                alert('Error exporting data. Please try again.')
            }
        },

        exportToCSV() {
            exportToCSV(this.data, `${this.filename}.csv`)
        },

        exportToJSON() {
            const dataStr = JSON.stringify(this.data, null, 2)
            const dataBlob = new Blob([dataStr], { type: 'application/json' })
            this.downloadFile(dataBlob, `${this.filename}.json`)
        },

        exportToPDF() {
            // 简化版PDF导出 - 实际项目中可以使用jsPDF等库
            const content = this.generatePDFContent()
            const printWindow = window.open('', '_blank')
            printWindow.document.write(`
          <html>
            <head>
              <title>${this.filename}</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #28a745; color: white; }
                h1 { color: #28a745; }
              </style>
            </head>
            <body>
              <h1>Nutrition Education Export</h1>
              <p>Generated on: ${new Date().toLocaleDateString()}</p>
              ${content}
            </body>
          </html>
        `)
            printWindow.document.close()
            printWindow.print()
        },

        generatePDFContent() {
            if (this.columns.length > 0) {
                return `
            <table>
              <thead>
                <tr>
                  ${this.columns.map(col => `<th>${col.label}</th>`).join('')}
                </tr>
              </thead>
              <tbody>
                ${this.data.map(row => `
                  <tr>
                    ${this.columns.map(col => `<td>${row[col.key] || ''}</td>`).join('')}
                  </tr>
                `).join('')}
              </tbody>
            </table>
          `
            } else {
                return `
            <table>
              <thead>
                <tr>
                  ${Object.keys(this.data[0]).map(key => `<th>${key}</th>`).join('')}
                </tr>
              </thead>
              <tbody>
                ${this.data.map(row => `
                  <tr>
                    ${Object.values(row).map(value => `<td>${value}</td>`).join('')}
                  </tr>
                `).join('')}
              </tbody>
            </table>
          `
            }
        },

        downloadFile(blob, filename) {
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = filename
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            URL.revokeObjectURL(url)
        }
    }
}
</script>

<style scoped>
.export-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}
</style>
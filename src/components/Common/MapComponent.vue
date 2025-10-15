<template>
    <div class="map-component">
        <!-- 地图控制 -->
        <div class="map-controls mb-3">
            <div class="row">
                <div class="col-md-6">
                    <div class="input-group">
                        <input type="text" class="form-control" placeholder="Search for places..." v-model="searchQuery"
                            @keyup.enter="searchPlaces">
                        <button class="btn btn-success" @click="searchPlaces">
                            <i class="fas fa-search"></i>
                        </button>
                    </div>
                </div>
                <div class="col-md-6 text-end">
                    <div class="btn-group">
                        <button v-if="features.includes('navigation')" class="btn btn-outline-success btn-sm"
                            @click="toggleNavigation">
                            <i class="fas fa-route"></i> Navigation
                        </button>
                        <button v-if="features.includes('search')" class="btn btn-outline-success btn-sm"
                            @click="showSearchPanel = !showSearchPanel">
                            <i class="fas fa-map-marker-alt"></i> Points of Interest
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- 搜索面板 -->
        <div v-if="showSearchPanel" class="search-panel card mb-3">
            <div class="card-body">
                <h6 class="card-title">Points of Interest</h6>
                <div class="row">
                    <div class="col-md-4" v-for="category in poiCategories" :key="category.id">
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" :value="category.id"
                                v-model="selectedCategories" @change="updatePOIs">
                            <label class="form-check-label small">
                                {{ category.name }}
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 地图容器 -->
        <div ref="mapContainer" class="map-container"></div>

        <!-- 路线信息 -->
        <div v-if="routeInfo && features.includes('navigation')" class="route-info card mt-3">
            <div class="card-body">
                <h6 class="card-title">Route Information</h6>
                <div class="row">
                    <div class="col-md-3">
                        <small class="text-muted">Distance</small>
                        <p class="mb-0 fw-bold">{{ routeInfo.distance }}</p>
                    </div>
                    <div class="col-md-3">
                        <small class="text-muted">Duration</small>
                        <p class="mb-0 fw-bold">{{ routeInfo.duration }}</p>
                    </div>
                    <div class="col-md-6">
                        <small class="text-muted">Instructions</small>
                        <p class="mb-0 small">{{ routeInfo.instructions }}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
// 导入 Leaflet 库
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

export default {
    name: 'MapComponent',
    props: {
        features: {
            type: Array,
            default: () => ['search']
        },
        initialCenter: {
            type: Object,
            default: () => ({ lng: 144.9631, lat: -37.8136 }) // Melbourne
        },
        initialZoom: {
            type: Number,
            default: 12
        }
    },
    data() {
        return {
            map: null,
            searchQuery: '',
            showSearchPanel: false,
            selectedCategories: [],
            routeInfo: null,
            markers: [],
            directions: null,
            poiCategories: [
                { id: 'nutrition', name: 'Nutrition Centers' },
                { id: 'health', name: 'Health Clinics' },
                { id: 'fitness', name: 'Fitness Centers' },
                { id: 'organic', name: 'Organic Markets' },
                { id: 'hospital', name: 'Hospitals' },
                { id: 'pharmacy', name: 'Pharmacies' }
            ]
        }
    },
    mounted() {
        this.initializeMap()
        this.loadInitialPOIs()


        const attribution = document.querySelector('.leaflet-control-attribution.leaflet-control');
        if (attribution) {
            attribution.style.display = 'none';
        }

    },
    beforeUnmount() {
        if (this.map) {
            this.map.remove()
        }
    },
    methods: {
        initializeMap() {
            // 检查 Leaflet 是否已加载
            if (typeof L === 'undefined') {
                console.error('Leaflet library is not loaded')
                return
            }

            try {
                // 使用 OpenStreetMap
                this.map = L.map(this.$refs.mapContainer).setView(
                    [this.initialCenter.lat, this.initialCenter.lng],
                    this.initialZoom
                )

                // 定义多种地图图层
                const baseLayers = {
                    "OpenStreetMap": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                        maxZoom: 19
                    }),

                    "OpenStreetMap Hot": L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
                        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Tiles style by <a href="https://www.hotosm.org/" target="_blank">Humanitarian OpenStreetMap Team</a>',
                        maxZoom: 19
                    }),

                    "CartoDB Positron": L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
                        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
                        subdomains: 'abcd',
                        maxZoom: 20
                    }),

                    "CartoDB Dark": L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
                        subdomains: 'abcd',
                        maxZoom: 20
                    }),

                    "Stamen Terrain": L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}{r}.{ext}', {
                        attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                        subdomains: 'abcd',
                        ext: 'png',
                        maxZoom: 18
                    }),

                    "Esri WorldStreetMap": L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
                        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012',
                        maxZoom: 19
                    })
                }

                // 添加 OpenStreetMap 图层
                /*
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                }).addTo(this.map)
                */
                baseLayers["Esri WorldStreetMap"].addTo(this.map)

                // 添加点击事件
                this.map.on('click', this.handleMapClick)

                console.log('Map initialized successfully')
            } catch (error) {
                console.error('Error initializing map:', error)
            }
        },

        handleMapClick(e) {
            const { lat, lng } = e.latlng
            console.log('Map clicked:', { lat, lng })

            // 添加标记
            const marker = L.marker([lat, lng])
                .addTo(this.map)
                .bindPopup(`Selected Location<br>Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`)
                .openPopup()

            this.markers.push(marker)
            this.$emit('location-selected', { lat, lng, marker })
        },

        async searchPlaces() {
            if (!this.searchQuery.trim()) return

            try {
                // 使用 Nominatim 进行地理编码（OpenStreetMap）
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(this.searchQuery)}&limit=5`
                )
                const results = await response.json()

                // 清除旧标记
                this.clearMarkers()

                // 添加新标记
                results.forEach(place => {
                    const marker = L.marker([place.lat, place.lon])
                        .addTo(this.map)
                        .bindPopup(`
                <strong>${place.display_name}</strong><br>
                <small>Type: ${place.type}</small>
              `)

                    this.markers.push(marker)
                })

                // 调整地图视图
                if (results.length > 0) {
                    const group = new L.featureGroup(this.markers)
                    this.map.fitBounds(group.getBounds().pad(0.1))
                }

            } catch (error) {
                console.error('Error searching places:', error)
                alert('Error searching for places. Please try again.')
            }
        },

        loadInitialPOIs() {
            // 加载初始的兴趣点（模拟数据）
            const initialPOIs = [
                {
                    id: 1,
                    name: 'Melbourne Health Nutrition Center',
                    lat: -37.8136,
                    lng: 144.9631,
                    type: 'nutrition',
                    description: 'Comprehensive nutrition counseling and education'
                },
                {
                    id: 2,
                    name: 'CBD Organic Market',
                    lat: -37.815,
                    lng: 144.965,
                    type: 'organic',
                    description: 'Fresh organic produce and health foods'
                },
                {
                    id: 3,
                    name: 'City Fitness Center',
                    lat: -37.814,
                    lng: 144.967,
                    type: 'fitness',
                    description: 'Fitness training with nutrition guidance'
                }
            ]

            this.addPOIsToMap(initialPOIs)
        },

        addPOIsToMap(pois) {
            pois.forEach(poi => {
                const icon = this.getIconForType(poi.type)

                const marker = L.marker([poi.lat, poi.lng], { icon })
                    .addTo(this.map)
                    .bindPopup(`
              <strong>${poi.name}</strong><br>
              <small>${poi.description}</small><br>
              <button class="btn btn-sm btn-success mt-1" onclick="this.getDirections(${poi.lat}, ${poi.lng})">
                Get Directions
              </button>
            `)

                this.markers.push(marker)
            })
        },

        getIconForType1(type) {
            const iconColors = {
                nutrition: 'green',
                health: 'red',
                fitness: 'blue',
                organic: 'orange',
                hospital: 'red',
                pharmacy: 'purple'
            }

            const color = iconColors[type] || 'gray'

            return L.divIcon({
                className: 'custom-div-icon',
                html: `<div style="background-color: ${color}; width: 22px; height: 22px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
                iconSize: [16, 16],
                iconAnchor: [8, 8]
            })
        },

        getIconForType(type) {
            const iconConfig = {
                nutrition: {
                    icon: 'fa-apple-alt',
                    color: '#28a745',
                    bgColor: '#28a745'
                },
                health: {
                    icon: 'fa-heartbeat',
                    color: '#dc3545',
                    bgColor: '#dc3545'
                },
                fitness: {
                    icon: 'fa-dumbbell',
                    color: '#007bff',
                    bgColor: '#007bff'
                },
                organic: {
                    icon: 'fa-leaf',
                    color: '#fd7e14',
                    bgColor: '#fd7e14'
                },
                hospital: {
                    icon: 'fa-hospital',
                    color: '#dc3545',
                    bgColor: '#dc3545'
                },
                pharmacy: {
                    icon: 'fa-prescription-bottle',
                    color: '#6f42c1',
                    bgColor: '#6f42c1'
                }
            }

            const config = iconConfig[type] || {
                icon: 'fa-map-marker-alt',
                color: '#6c757d',
                bgColor: '#6c757d'
            }

            return L.divIcon({
                className: `custom-marker-icon ${type}-marker`,
                html: `
            <div class="marker-container" style="
                background-color: ${config.bgColor};
                width: 40px;
                height: 40px;
                border-radius: 50%;
                border: 3px solid white;
                box-shadow: 0 3px 10px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
            ">
                <i class="fas ${config.icon}" style="
                    color: white; 
                    font-size: 16px;
                "></i>
            </div>
        `,
                iconSize: [46, 46],      // 图标容器大小
                iconAnchor: [23, 23],    // 图标锚点（中心）
                popupAnchor: [0, -23]    // 弹出框相对于图标的位置
            })
        },

        updatePOIs() {
            // 根据选择的类别更新POIs
            this.clearMarkers()

            // 这里应该根据selectedCategories从API加载数据
            // 现在使用模拟数据
            const filteredPOIs = this.getMockPOIs().filter(poi =>
                this.selectedCategories.includes(poi.type)
            )

            this.addPOIsToMap(filteredPOIs)
        },

        getMockPOIs() {
            return [
                {
                    id: 1,
                    name: 'Central Nutrition Clinic',
                    lat: -37.8136,
                    lng: 144.9631,
                    type: 'nutrition',
                    description: 'Professional nutrition counseling'
                },
                {
                    id: 2,
                    name: 'Healthy Living Pharmacy',
                    lat: -37.815,
                    lng: 144.965,
                    type: 'pharmacy',
                    description: 'Health supplements and consultations'
                },
                {
                    id: 3,
                    name: 'Royal Melbourne Hospital',
                    lat: -37.800,
                    lng: 144.955,
                    type: 'hospital',
                    description: 'Public hospital with nutrition services'
                },
                {
                    id: 4,
                    name: 'Organic Food Market',
                    lat: -37.810,
                    lng: 144.963,
                    type: 'organic',
                    description: 'Fresh organic fruits and vegetables'
                }
            ]
        },

        toggleNavigation() {
            // 简化版的导航功能
            if (this.features.includes('navigation')) {
                alert('Navigation feature would be implemented here. For now, you can search for places and click on markers.')
            }
        },

        getDirections(lat, lng) {
            // 简化版的获取路线功能
            if (this.features.includes('navigation')) {
                alert(`Directions to: ${lat}, ${lng}\n\nThis would open a navigation interface in a full implementation.`)

                // 在实际实现中，这里会调用路由功能
                this.routeInfo = {
                    distance: '2.5 km',
                    duration: '15 min',
                    instructions: 'Head north on Health Street, turn right on Wellness Avenue'
                }
            }
        },

        clearMarkers() {
            this.markers.forEach(marker => {
                this.map.removeLayer(marker)
            })
            this.markers = []
        }
    }
}
</script>

<style scoped>
.leaflet-control-attribution {
    display: none;
}

.map-component {
    height: 100%;
}

.map-container {
    height: calc(100% - 50px);
    border-radius: 8px;
    overflow: hidden;
    background-color: #f8f9fa;
    border: 1px solid #dee2e6;
}

.search-panel {
    background: white;
    border: 1px solid #dee2e6;
}

.route-info {
    background: #f8f9fa;
    border-left: 4px solid #28a745;
}

/* Leaflet 地图样式覆盖 */
:deep(.leaflet-container) {
    font-family: inherit;
    background: #f8f9fa;
}

:deep(.leaflet-popup-content-wrapper) {
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

:deep(.leaflet-popup-content) {
    margin: 12px 16px;
    line-height: 1.4;
}

:deep(.leaflet-popup-content button) {
    background-color: #28a745;
    color: white;
    border: none;
    padding: 6px 12px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.875rem;
}

:deep(.leaflet-popup-content button:hover) {
    background-color: #218838;
}

:deep(.custom-div-icon) {
    background: transparent;
    border: none;
}
</style>
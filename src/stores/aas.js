import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { aasService } from '@/services/aasService'

export const useAasStore = defineStore('aas', () => {
  // State
  const aasList = ref([])
  const submodelsList = ref([])
  const conceptDescriptionsList = ref([])
  const selectedAas = ref(null)
  const selectedSubmodel = ref(null)
  const isLoading = ref(false)
  const error = ref(null)

  // Pagination state
  const pagination = ref({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    pageSize: 60,
    hasMore: true
  })

  // Search state
  const searchFilters = ref({
    filterType: '',
    filterValue: '',
    keyword: ''
  })

  // Statistics
  const statistics = ref({
    totalAas: 0,
    totalSubmodels: 0,
    totalConcepts: 0
  })

  // Getters
  const hasData = computed(() => aasList.value.length > 0)
  const isSearching = computed(() => !!searchFilters.value.filterValue || !!searchFilters.value.keyword)

  const filteredAasList = computed(() => {
    if (!searchFilters.value.filterValue) return aasList.value

    const searchTerm = searchFilters.value.filterValue.toLowerCase()
    return aasList.value.filter(aas => {
      const idShort = aas.idShort?.toLowerCase() || ''
      const id = aas.id?.toLowerCase() || ''
      return idShort.includes(searchTerm) || id.includes(searchTerm)
    })
  })

  // Actions
  const fetchAllAAS = async (page = 1, keyword = null) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await aasService.getAllAAS(page, keyword)

      if (page === 1) {
        aasList.value = response.message || []
      } else {
        aasList.value = [...aasList.value, ...(response.message || [])]
      }

      // Update pagination
      pagination.value = {
        currentPage: page,
        totalCount: response.totalCount || 0,
        totalPages: Math.ceil((response.totalCount || 0) / pagination.value.pageSize),
        pageSize: pagination.value.pageSize,
        hasMore: response.message?.length >= pagination.value.pageSize
      }

      return response
    } catch (err) {
      error.value = err.message || 'Failed to fetch AAS data'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const fetchAASByKeyword = async (keyword, page = 1) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await aasService.searchAASByKeyword(keyword, page)

      if (page === 1) {
        aasList.value = response.message || []
      } else {
        aasList.value = [...aasList.value, ...(response.message || [])]
      }

      return response
    } catch (err) {
      error.value = err.message || 'Failed to fetch AAS by keyword'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const fetchAllSubmodels = async () => {
    isLoading.value = true
    error.value = null

    try {
      const response = await aasService.getAllSubmodels()
      submodelsList.value = response.message || []
      return response
    } catch (err) {
      error.value = err.message || 'Failed to fetch submodels'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const fetchSubmodelsByAASId = async (aasId) => {
    try {
      const response = await aasService.getSubmodelsByAASId(aasId)
      return response.message || []
    } catch (err) {
      console.error('Failed to fetch submodels for AAS:', err)
      return []
    }
  }

  const fetchAllConceptDescriptions = async (page = 1) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await aasService.getAllConceptDescriptions(page)
      conceptDescriptionsList.value = response.message || []
      return response
    } catch (err) {
      error.value = err.message || 'Failed to fetch concept descriptions'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const searchByFilter = async (filterType, value) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await aasService.searchByFilter(filterType, value)
      aasList.value = response.message || []
      return response
    } catch (err) {
      error.value = err.message || 'Search failed'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const searchByKeyword = async (entityType, keyword, page = 1) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await aasService.searchByKeyword(entityType, keyword, page)

      if (entityType === 'aas') {
        if (page === 1) {
          aasList.value = response.message || []
        } else {
          aasList.value = [...aasList.value, ...(response.message || [])]
        }
      } else if (entityType === 'submodel') {
        submodelsList.value = response.message || []
      } else if (entityType === 'conceptdescription') {
        conceptDescriptionsList.value = response.message || []
      }

      return response
    } catch (err) {
      error.value = err.message || 'Keyword search failed'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const fetchDashboardStatistics = async () => {
    try {
      const [aasResponse, submodelResponse, conceptResponse] = await Promise.all([
        aasService.getAllAAS(1),
        aasService.getAllSubmodels(),
        aasService.getAllConceptDescriptions(1)
      ])

      statistics.value = {
        totalAas: aasResponse.totalCount || 0,
        totalSubmodels: submodelResponse.totalCount || 0,
        totalConcepts: conceptResponse.totalCount || 0
      }

      return statistics.value
    } catch (err) {
      console.error('Failed to fetch dashboard statistics:', err)
      return statistics.value
    }
  }

  const selectAAS = (aas) => {
    selectedAas.value = aas
  }

  const selectSubmodel = (submodel) => {
    selectedSubmodel.value = submodel
  }

  const clearSelection = () => {
    selectedAas.value = null
    selectedSubmodel.value = null
  }

  const clearSearch = () => {
    searchFilters.value = {
      filterType: '',
      filterValue: '',
      keyword: ''
    }
    aasList.value = []
    pagination.value.currentPage = 1
  }

  const loadMore = async () => {
    if (!pagination.value.hasMore || isLoading.value) return

    const nextPage = pagination.value.currentPage + 1

    if (searchFilters.value.keyword) {
      await fetchAASByKeyword(searchFilters.value.keyword, nextPage)
    } else {
      await fetchAllAAS(nextPage)
    }
  }

  return {
    // State
    aasList,
    submodelsList,
    conceptDescriptionsList,
    selectedAas,
    selectedSubmodel,
    isLoading,
    error,
    pagination,
    searchFilters,
    statistics,

    // Getters
    hasData,
    isSearching,
    filteredAasList,

    // Actions
    fetchAllAAS,
    fetchAASByKeyword,
    fetchAllSubmodels,
    fetchSubmodelsByAASId,
    fetchAllConceptDescriptions,
    searchByFilter,
    searchByKeyword,
    fetchDashboardStatistics,
    selectAAS,
    selectSubmodel,
    clearSelection,
    clearSearch,
    loadMore
  }
})

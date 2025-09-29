import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useUiStore = defineStore('ui', () => {
  // State
  const sidebarOpen = ref(true)
  const mobileMenuOpen = ref(false)
  const activeCategory = ref('equipment')
  const currentMenu = ref('TIG')
  const mobileView = ref('tree') // 'tree' or 'detail'
  const isMobile = ref(false)

  // Modal states
  const modals = ref({
    login: false,
    signup: false,
    userManagement: false
  })

  // Loading states
  const globalLoading = ref(false)
  const loadingMessage = ref('')

  // Notification state
  const notifications = ref([])
  const notificationIdCounter = ref(0)

  // Getters
  const showSidebar = computed(() => {
    const categoriesWithSubmenu = ['equipment', 'material', 'process']
    return categoriesWithSubmenu.includes(activeCategory.value)
  })

  const isAnyModalOpen = computed(() => {
    return Object.values(modals.value).some(isOpen => isOpen)
  })

  // Actions
  const toggleSidebar = () => {
    sidebarOpen.value = !sidebarOpen.value
  }

  const closeSidebar = () => {
    sidebarOpen.value = false
  }

  const openSidebar = () => {
    sidebarOpen.value = true
  }

  const toggleMobileMenu = () => {
    mobileMenuOpen.value = !mobileMenuOpen.value
  }

  const setActiveCategory = (category) => {
    activeCategory.value = category
  }

  const setCurrentMenu = (menu) => {
    currentMenu.value = menu
  }

  const setMobileView = (view) => {
    if (['tree', 'detail'].includes(view)) {
      mobileView.value = view
    }
  }

  const checkScreenSize = () => {
    const wasMobile = isMobile.value
    isMobile.value = window.innerWidth <= 768

    // 데스크톱으로 전환 시 사이드바 열기
    if (wasMobile && !isMobile.value) {
      sidebarOpen.value = true
    }
    // 모바일로 전환 시 사이드바 닫기
    else if (!wasMobile && isMobile.value) {
      sidebarOpen.value = false
    }
  }

  // Modal actions
  const openModal = (modalName) => {
    if (Object.prototype.hasOwnProperty.call(modals.value, modalName)) {
      modals.value[modalName] = true
    }
  }

  const closeModal = (modalName) => {
    if (Object.prototype.hasOwnProperty.call(modals.value, modalName)) {
      modals.value[modalName] = false
    }
  }

  const closeAllModals = () => {
    Object.keys(modals.value).forEach(modalName => {
      modals.value[modalName] = false
    })
  }

  // Loading actions
  const showGlobalLoading = (message = 'Loading...') => {
    globalLoading.value = true
    loadingMessage.value = message
  }

  const hideGlobalLoading = () => {
    globalLoading.value = false
    loadingMessage.value = ''
  }

  // Notification actions
  const addNotification = (notification) => {
    const id = ++notificationIdCounter.value
    const newNotification = {
      id,
      type: 'info', // 'success', 'error', 'warning', 'info'
      title: '',
      message: '',
      duration: 5000,
      ...notification
    }

    notifications.value.push(newNotification)

    // Auto remove after duration
    if (newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id)
      }, newNotification.duration)
    }

    return id
  }

  const removeNotification = (id) => {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index > -1) {
      notifications.value.splice(index, 1)
    }
  }

  const clearNotifications = () => {
    notifications.value = []
  }

  // Success notification helper
  const showSuccess = (message, title = 'Success') => {
    return addNotification({
      type: 'success',
      title,
      message
    })
  }

  // Error notification helper
  const showError = (message, title = 'Error') => {
    return addNotification({
      type: 'error',
      title,
      message,
      duration: 0 // Don't auto-hide errors
    })
  }

  // Warning notification helper
  const showWarning = (message, title = 'Warning') => {
    return addNotification({
      type: 'warning',
      title,
      message
    })
  }

  // Info notification helper
  const showInfo = (message, title = 'Info') => {
    return addNotification({
      type: 'info',
      title,
      message
    })
  }

  // Initialize screen size check
  const initializeUi = () => {
    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
  }

  // Cleanup
  const cleanupUi = () => {
    window.removeEventListener('resize', checkScreenSize)
  }

  return {
    // State
    sidebarOpen,
    mobileMenuOpen,
    activeCategory,
    currentMenu,
    mobileView,
    isMobile,
    modals,
    globalLoading,
    loadingMessage,
    notifications,

    // Getters
    showSidebar,
    isAnyModalOpen,

    // Actions
    toggleSidebar,
    closeSidebar,
    openSidebar,
    toggleMobileMenu,
    setActiveCategory,
    setCurrentMenu,
    setMobileView,
    checkScreenSize,
    openModal,
    closeModal,
    closeAllModals,
    showGlobalLoading,
    hideGlobalLoading,
    addNotification,
    removeNotification,
    clearNotifications,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    initializeUi,
    cleanupUi
  }
})

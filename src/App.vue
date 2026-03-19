<template>
  <div class="min-h-screen px-6 py-8 md:px-10">
    <header class="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 class="text-3xl font-semibold text-ink md:text-4xl">Personal Resource Hub</h1>
        <p class="mt-2 max-w-2xl text-sm text-dusk/80">
          A curated dashboard for articles, tools, and references. Keep it intentionally small,
          fast, and actionable.
        </p>
      </div>
      <SearchBar v-model="query" />
    </header>

    <div class="relative grid gap-6 md:grid-cols-[240px_1fr]">
      <aside class="rounded-2xl bg-white/70 p-4 shadow-card">
        <Sidebar
          :categories="categories"
          :active-category="activeCategory"
          @select="handleCategorySelect"
        />
      </aside>

      <main class="rounded-2xl bg-white/80 p-6 shadow-card">
        <div class="mb-4 flex items-center justify-between">
          <div>
            <h2 class="text-xl font-semibold">Resource Shelf</h2>
            <p class="text-sm text-dusk/70">{{ filteredResources.length }} items</p>
          </div>
          <div class="text-xs uppercase tracking-[0.25em] text-dusk/50">{{ activeCategory }}</div>
        </div>

        <!-- Empty State -->
        <div
          v-if="filteredResources.length === 0"
          class="flex flex-col items-center justify-center py-16 text-center"
          role="status"
          aria-live="polite"
        >
          <div class="mb-4 text-5xl">📚</div>
          <h3 class="mb-2 text-lg font-semibold text-ink">No resources found</h3>
          <p class="max-w-sm text-sm text-dusk/70">
            <template v-if="query">
              No results for "<span class="font-medium">{{ query }}</span>". Try a different search term or category.
            </template>
            <template v-else>
              No resources in this category. Try selecting "All" to see everything.
            </template>
          </p>
          <button
            v-if="activeCategory !== 'All' || query"
            class="mt-4 rounded-full bg-ink/10 px-4 py-2 text-sm font-medium text-ink transition hover:bg-ink/20"
            @click="resetFilters"
          >
            Clear filters
          </button>
        </div>

        <!-- Resource Grid -->
        <div v-else class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <ResourceCard v-for="item in filteredResources" :key="item.id" :item="item" />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue'
import SearchBar from './components/SearchBar.vue'
import Sidebar from './components/Sidebar.vue'
import ResourceCard from './components/ResourceCard.vue'
import { mockResources } from './data/mockData'
import { useLocalStorage } from './hooks/useLocalStorage'
import type { ResourceItem } from './types/resource'

const resources = ref<ResourceItem[]>(mockResources)
const query = ref('')

const { storedValue: persistedCategory } = useLocalStorage<string>('hub-category', 'All')
const activeCategory = ref(persistedCategory.value)

const categories = computed(() => {
  const base = new Set<string>()
  resources.value.forEach((item) => item.tags.forEach((tag) => base.add(tag)))
  return ['All', ...Array.from(base)]
})

// Fixed: Use activeCategory.value directly inside computed for reactivity
const filteredResources = computed(() => {
  const searchTerm = query.value.toLowerCase().trim()
  
  // First filter by category
  let result = resources.value
  if (activeCategory.value !== 'All') {
    result = result.filter((item) => item.tags.includes(activeCategory.value))
  }
  
  // Then filter by search query
  if (searchTerm) {
    result = result.filter((item) => {
      const titleMatch = item.title.toLowerCase().includes(searchTerm)
      const tagMatch = item.tags.some((tag) => tag.toLowerCase().includes(searchTerm))
      const descMatch = item.description?.toLowerCase().includes(searchTerm) ?? false
      return titleMatch || tagMatch || descMatch
    })
  }
  
  return result
})

const handleCategorySelect = (category: string) => {
  activeCategory.value = category
  persistedCategory.value = category
}

const resetFilters = () => {
  query.value = ''
  activeCategory.value = 'All'
  persistedCategory.value = 'All'
}

// Reset to 'All' if current category no longer exists
watchEffect(() => {
  if (!categories.value.includes(activeCategory.value)) {
    activeCategory.value = 'All'
    persistedCategory.value = 'All'
  }
})
</script>

<template>
  <nav aria-label="Resource categories">
    <p id="categories-label" class="mb-3 text-xs uppercase tracking-[0.35em] text-dusk/50">Categories</p>
    <ul class="space-y-2" role="listbox" aria-labelledby="categories-label">
      <li v-for="category in categories" :key="category">
        <button
          class="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/50 focus-visible:ring-offset-2"
          :class="
            category === activeCategory
              ? 'bg-ink text-sand'
              : 'bg-sand/70 text-ink hover:bg-clay/60'
          "
          role="option"
          :aria-selected="category === activeCategory"
          :aria-pressed="category === activeCategory"
          @click="emit('select', category)"
        >
          <span>{{ category }}</span>
          <span class="text-xs opacity-70" aria-hidden="true">›</span>
        </button>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
const props = defineProps<{
  categories: string[]
  activeCategory: string
}>()

const emit = defineEmits<{
  (event: 'select', category: string): void
}>()
</script>

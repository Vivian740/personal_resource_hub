<template>
  <article class="fade-in group flex h-full flex-col justify-between rounded-2xl border border-dusk/10 bg-white p-4" :aria-labelledby="'title-' + item.id">
    <div>
      <div class="flex items-center justify-between">
        <time class="text-xs uppercase tracking-[0.3em] text-dusk/50" :datetime="item.addedAt">
          {{ item.addedAt }}
        </time>
        <span class="rounded-full bg-ember/15 px-2 py-1 text-xs text-ember" aria-label="Status: Saved">Saved</span>
      </div>
      <h3 :id="'title-' + item.id" class="mt-3 text-lg font-semibold text-ink">{{ item.title }}</h3>
      <p class="mt-2 text-sm text-dusk/80">
        {{ item.description || 'Curated resource for your learning backlog.' }}
      </p>
    </div>
    <div class="mt-4 flex flex-wrap gap-2" role="list" aria-label="Resource tags">
      <span
        v-for="tag in item.tags"
        :key="tag"
        class="rounded-full bg-sand px-3 py-1 text-xs text-dusk/70"
        role="listitem"
      >
        #{{ tag }}
      </span>
    </div>
    <a
      class="mt-4 inline-flex items-center text-sm font-medium text-moss transition group-hover:translate-x-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-moss/50 focus-visible:ring-offset-2"
      :href="item.url"
      target="_blank"
      rel="noopener noreferrer"
      :aria-label="'Open ' + item.title + ' in a new tab'"
    >
      Open resource
      <span aria-hidden="true"> →</span>
    </a>
  </article>
</template>

<script setup lang="ts">
import type { ResourceItem } from '../types/resource'

defineProps<{
  item: ResourceItem
}>()
</script>

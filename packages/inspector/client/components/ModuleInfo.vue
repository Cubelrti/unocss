<script setup lang="ts">
import attributifyPreset from '@unocss/preset-attributify'
import { fetchModule } from '../composables/fetch'
import { useScrollStyle } from '../composables/useScrollStyle'

const props = defineProps<{ id: string }>()
const { data: mod } = fetchModule(toRef(props, 'id'))
const mode = props.id.split(/\./g).pop()
const status = ref(null)
const style = useScrollStyle(status, 'module-scrolls')

function openEditor() {
  fetch(`/__open-in-editor?file=${encodeURIComponent(props.id)}`)
}

const { extractors } = attributifyPreset({ strict: true })
const unmatchedClasses = asyncComputed(async () => {
  const set = new Set<string>()
  if (extractors) {
    const context = { code: mod.value?.code || '' } as any
    for (const extractor of extractors) {
      const result = await extractor.extract(context)
      result?.forEach(t => set.add(t))
    }
  }
  return Array.from(set)
    .filter(i => !i.startsWith('['))
    .filter(i => !mod.value?.matched.includes(i))
})
</script>

<template>
  <div v-if="mod" h-full of-hidden>
    <StatusBar ref="status" grid="~ cols-3 gap-4">
      <div>
        <div op50>
          Module
        </div>
        <a cursor-pointer op80 hover:op100 @click="openEditor">
          <ModuleId :id="mod.id" mr-1 />
          <div i-carbon-launch />
        </a>
      </div>
      <div>
        <div op50>
          Matched Rules
        </div>
        {{ mod.matched.length }}
      </div>
      <div>
        <div op50>
          CSS Size
        </div>
        {{ ((mod?.gzipSize || 0) / 1024).toFixed(2) }} KiB <span op50>gzipped</span>
      </div>
      <div v-if="unmatchedClasses.length" row-span-3>
        <div op50>
          Potentially Unmatched
        </div>
        <code>
          {{ unmatchedClasses.join(', ') }}
        </code>
      </div>
    </StatusBar>
    <div h-full of-hidden grid grid-cols-2>
      <CodeMirror
        h-full
        :model-value="mod.code"
        :read-only="true"
        :mode="mode"
        :matched="mod.matched"
        class="scrolls module-scrolls"
        :style="style"
      />
      <CodeMirror
        h-full
        b="l main"
        :model-value="mod.css"
        :read-only="true"
        mode="css"
        class="scrolls module-scrolls"
        :style="style"
      />
    </div>
  </div>
</template>

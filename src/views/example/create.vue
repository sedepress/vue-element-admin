<template>
  <temp-detail :is-edit="false" />
</template>

<script>
import TempDetail from './components/TempDetail'

export default {
  name: 'CreateTemp',
  components: { TempDetail }
}
</script>


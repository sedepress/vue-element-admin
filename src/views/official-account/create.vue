<template>
  <official-detail :is-edit="false" />
</template>

<script>
import OfficialDetail from './components/OfficialDetail'

export default {
  name: 'CreateOfficial',
  components: { OfficialDetail }
}
</script>


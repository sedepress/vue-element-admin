<template>
  <article-detail :is-edit="false" />
</template>

<script>
import ArticleDetail from './components/TempDetail'

export default {
  name: 'CreateTemp',
  components: { ArticleDetail }
}
</script>


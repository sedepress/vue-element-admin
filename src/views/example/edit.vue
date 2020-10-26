<template>
  <article-detail :is-edit="true" />
</template>

<script>
import ArticleDetail from './components/TempDetail'

export default {
  name: 'EditForm',
  components: { ArticleDetail }
}
</script>


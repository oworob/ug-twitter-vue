<template>
  <div id="Search">
    <SideProfile />

    <div id="middle">
      <p id="title" v-if="this.$route.query.q">Here are the results for <span>{{ this.$route.query.q }}</span> </p>
      <p id="title" v-else="!this.$route.query.q">Invalid search query</p>
      <div id="posts" v-if="this.$route.query.q">
        <Post v-for="id in this.Posts" :postId="id" :key="id"/>
        <p id="end" >No more posts</p>
      </div>
    </div>

    <SideFollowing />


  </div>
  
</template>

<script>
  import DataService from "@/DataService.js"
  
  import Nav from "@/components/Widgets/Nav.vue"
  import Post from "@/components/Widgets/Post.vue"
  import SideFollowing from "@/components/Widgets/SideFollowing.vue"
  import SideProfile from "@/components/Widgets/SideProfile.vue"

  export default {
  
  components: {
    Nav,
    Post,
    SideFollowing,
    SideProfile,
  },

  data() {
    return {
      Posts: [],
    }
  },

  mounted() {
    this.GetSearchResults()
  },

  methods: {
    async GetSearchResults() {
      if (this.$route.query.q) {
        try {
          this.Posts = await DataService.Search(this.$route.query.q)
        } catch (e) {
          console.error(e)
          this.$router.push({ name: 'NetworkError' })
        }
      }
    }
  },

  watch: {
    '$route.query'() {
      this.GetSearchResults()
    }
  },
}

</script>

<style lang="scss">

@import '@/variables.scss';

#Search {
  display: grid;
  grid-template-columns: 2fr 5fr 2fr;
  gap: 30px;
  padding: 30px;
}

#title>span {
  font-weight: bold;
}

#middle {
  #posts {
    display: flex;
    flex-direction: column;
    gap: 20px;
    #end {
      color: $border;
      font-size: 80%;
    }
  }
}

</style>
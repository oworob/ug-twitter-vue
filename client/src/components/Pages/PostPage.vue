
<template>
  <div id="PostPage">
    <SideProfile />

    <div id="middle">
        <Post :key=this.$route.params.id :postId=this.$route.params.id :disabledlink="true" :visitorid="this.$store.state.UserData.userid"/>

        <form id="postform" @submit.prevent="CreateReply">
          <textarea class="textfield" placeholder="Post your reply" ref="textarea" v-model="replycontent" @input="ResizeTextArea()"></textarea>
          <button type="submit" class="button">Reply</button>
        </form>

        <div id="posts">
          <Post v-for="id in Replies" :key="id" :postId="id" :hidePrev="true"/>
        </div>
       
    </div>
    
    <SideFollowing />

  </div>

</template>

<style lang="scss">
  @import '@/variables.scss';

  #PostPage {
    display: grid;
    grid-template-columns: 2fr 5fr 2fr;
    gap: 30px;
    padding: 30px;
  }

</style>


<script>
  import DataService from "@/DataService.js"

  import Nav from "@/components/Widgets/Nav.vue"
  import SideFollowing from "@/components/Widgets/SideFollowing.vue"
  import SideProfile from "@/components/Widgets/SideProfile.vue"
  import Post from "@/components/Widgets/Post.vue"



  export default {
    data() {
        return {
          Replies: [],
          replycontent: "",
        }
    },

    components: {
      Nav,
      SideFollowing,
      SideProfile,
      Post,
    },

     watch: {
        $route(to, from) {
          if (to.params.id !== from.params.id) {
            this.GetReplies()
          }
        },
      },

    mounted() {
      this.GetReplies()
    },

    methods: {
      async CreateReply() {
        if (this.replycontent.length > 0) { // prevent empty posts
          const reply = {userid: this.$store.state.UserData.userid, content: this.replycontent, previd: this.$route.params.id}
          try {
            await DataService.CreateReply(reply)
            this.GetReplies()
            this.replycontent = ""
          } catch (e) {
            console.error(e)
            this.$router.push({ name: 'NetworkError' })
          }
        }
      },

    async GetReplies() {
      try {
        this.Replies = await DataService.GetPostReplies(this.$route.params.id)
      } catch (e) {
        console.error(e)
        this.$router.push({ name: 'NetworkError' })
      }
    },

    ResizeTextArea() {
      let element = this.$refs["textarea"]
      element.style.height = "auto"
      element.style.height = `calc(${element.scrollHeight}px - 30px`
    },
  },
}
</script>
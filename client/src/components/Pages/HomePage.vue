<template>
  <div id="Home">
    <SideProfile />

    <div id="middle">
      <div id="newposts-wrapper">
        <div v-if="this.newposts > 0" class="button" id="newposts" @click="LoadNewPosts">Show {{ this.newposts }} new post{{ this.newposts > 1 ? 's' : '' }}</div>
      </div>
    
      <form id="postform" @submit.prevent="CreatePost">
        <textarea class="textfield" placeholder="What's up?" ref="textarea" v-model="newpostcontent" @input="ResizeTextArea()"></textarea>
        <button type="submit" class="button">Post</button>
      </form>
      <div id="posts">
        <Post v-for="id in Posts" :postId="id" :key="id"/>
        <p v-if="this.allpostsfetched" id="end">No more posts</p>
      </div>

      <div id="loadbox" ref="loadbox" v-if="!this.allpostsfetched">
        Loading more posts..
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
      newpostcontent: "",
      postbatchsize: 3,
      loadedposts: 3,
      newposts: 0,
      allpostsfetched: false,
    }
  },

  props: ["UserData"],

  mounted() {
    if (this.$store.state.UserData.userid) {
      this.GetHomePosts()

      this.$store.state.socket.on('post', (data) => {
        this.newposts = this.newposts + 1
      });

      const loadbox = this.$refs.loadbox;
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.LoadMorePosts();
          }
        });
      });
      observer.observe(loadbox);
      
    } else {
      this.$router.push({path: "/login"})
    }
  },

  methods: {
    async GetHomePosts() {
      try {
        this.Posts = await DataService.GetHomePosts(this.$store.state.UserData.userid, this.postbatchsize)
      } catch (e) {
        console.error(e)
        this.$router.push({ name: 'NetworkError' })
      }
    },

    async CreatePost() {
      if (this.newpostcontent.length > 0) { // prevent empty posts
        const post = {userid: this.$store.state.UserData.userid, content:this.newpostcontent}
        try {
          await DataService.CreatePost(post)
          this.GetHomePosts()
          this.newpostcontent = ""
        } catch (e) {
          console.error(e)
          this.$router.push({ name: 'NetworkError' })
        }
      }
    },

    ResizeTextArea() {
      let element = this.$refs["textarea"]
      element.style.height = "auto"
      element.style.height = `calc(${element.scrollHeight}px - 30px`
    },

    async LoadMorePosts() {
      try {
        const newposts = await DataService.GetHomePosts(this.$store.state.UserData.userid, this.postbatchsize, this.loadedposts+this.newposts)
        if (newposts.length < this.postbatchsize) {
          this.allpostsfetched = true
        }
        this.Posts.push(...newposts)
        this.loadedposts = this.loadedposts + this.postbatchsize
        
      } catch (e) {
        console.error(e)
        this.$router.push({ name: 'NetworkError' })
      }
    },

    async LoadNewPosts() {
      try {
        const newposts = await DataService.GetHomePosts(this.$store.state.UserData.userid, this.newposts)
        this.Posts.unshift(...newposts)
        this.loadedposts = this.loadedposts + newposts.length
        this.newposts = 0
        this.$store.commit('ClearNotifications')

      } catch (e) {
        console.error(e)
        this.$router.push({ name: 'NetworkError' })
      }
    },
  },
}
</script>

<style lang="scss">

@import '@/variables.scss';

#Home {
  display: grid;
  grid-template-columns: 2fr 5fr 2fr;
  gap: 30px;
  padding: 30px;
}

#middle {
  display: flex;
  flex-direction: column;
  gap: 20px;
  #posts {
    display: flex;
    flex-direction: column;
    gap: 20px;
    #end {
      color: $border;
      font-size: 80%;
    }
  }
  #newposts-wrapper {
    display: flex;
    justify-content: center;
    background: none;
    #newposts {
      cursor: pointer;
      position: absolute;
      text-align: center;
      display: flex;
      justify-content: center;
      margin: 0;
    }
  }
  
  #postform {
    margin-top: 10px;
      button {
        margin-top: 10px;
        width: 30%;
      }
      
    }
  #loadbox {
    font-size: 80%;
    color: $border;
    margin: 30px;
  }
}

</style>
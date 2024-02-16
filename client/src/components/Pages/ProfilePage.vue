<template>
  <div id="Profile" v-if="this.ProfileData">
    <SideProfile />

    <div id="middle">

      <div id="header">
        <div id="pfp" :style="{backgroundImage: this.ProfileData.pfp ? 'url(' + this.ProfileData.pfp + ')' : '' }">
          <button v-if="!editingpfp && this.$route.params.id == this.$store.state.UserData.userid" id='icon' class="fa fa-pencil button" @click="this.editingpfp = true; pfpcontent = this.$store.state.UserData.pfp"></button>
        </div>
        

        <button id="followbutton" class="button" v-if="this.userfollows == false && this.$route.params.id != this.$store.state.UserData.userid" @click="Follow">Follow</button>
        <button id="unfollowbutton" class="button" v-if="this.userfollows == true" @mouseover="this.hovering = true" @mouseleave="this.hovering = false" @click="Unfollow">{{ unfollowbuttontext }}</button>
      </div>

      <form id="pfpsection" v-if="editingpfp" @submit.prevent="UpdateProfilePicture">
        <input type="text" v-model="pfpcontent">
        <button id='icon' class="fa fa-check button"></button>
      </form>
      
      <div id="data">
        <h2 id="name">{{ ProfileData.name }}</h2>

        <div id="biosection">
          <p id="bio" v-if="!editingbio">{{ ProfileData.bio }}</p>
          <textarea v-else class="textfield" ref="textarea" v-model="this.biocontent" @input="ResizeTextArea()"></textarea>

          <button v-if="!editingbio && this.$route.params.id == this.$store.state.UserData.userid" id='icon' class="fa fa-pencil button" @click="this.editingbio = true; this.biocontent = this.ProfileData.bio"></button>
          <button v-if="editingbio" id='icon' class="fa fa-check button" @click="UpdateProfileBio"></button>
        </div>

          <div id="stats">
            <p><span>{{ ProfileData.followingcount }}</span> Following</p>
            <p><span>{{ ProfileData.followerscount }}</span> Followers</p>
            <p><span>{{ ProfileData.posts.length }}</span> Posts</p>
          </div>
      </div>
     

      <h3 id="poststitle">Posts</h3>
      <div id="posts">
        <Post v-for="id in ProfileData.posts" :key="id" :postId="id"/>
      </div>

    </div>


    <SideFollowing />

  </div>
</template>

<script>
import DataService from "@/DataService.js"

import Nav from "@/components/Widgets/Nav.vue"
import SideFollowing from "@/components/Widgets/SideFollowing.vue"
import SideProfile from "@/components/Widgets/SideProfile.vue"
import Post from "@/components/Widgets/Post.vue"


export default {
  data() {
    return {
      ProfileData: null,
      editingbio: false,
      editingpfp: false,
      biocontent: "",
      pfpcontent: "",
      hovering: false,
      userfollows: false,
    }
  },

  components: {
    Nav,
    Post,
    SideFollowing,
    SideProfile,
  },

  mounted() {
    this.GetProfileData()
    this.SetUserFollows()
  },

  watch: {
    $route(to, from) {
      if (to.params.id !== from.params.id) {
        this.editingbio = false
        this.editingpfp = false
        this.GetProfileData()
      }
    },
  },

  computed: {
    unfollowbuttontext() {
      return this.hovering ? 'Unfollow' : 'Following'
    },
  },

  methods: {
    ResizeTextArea() {
      let element = this.$refs["textarea"]
      element.style.height = "auto"
      element.style.height = `calc(${element.scrollHeight}px - 30px`
    },

    async GetProfileData() {
      const profileid = this.$route.params.id
      try {
        this.ProfileData = await DataService.GetProfileData(profileid)
      } catch (e) {
        console.error(e)
        this.$router.push({ name: 'NetworkError' })
      }
    },

    async UpdateProfileBio() {
      this.editingbio = false
      const data = {userid: this.$store.state.UserData.userid, content: this.biocontent}
      try {
        this.ProfileData.bio = this.biocontent
        await DataService.UpdateProfileBio(this.$store.state.UserData.userid, data)
      } catch (e) {
        console.error(e)
        this.$router.push({ name: 'NetworkError' })
      }
    },

    async UpdateProfilePicture() {
      this.editingpfp = false
      const data = {userid: this.$store.state.UserData.userid, pfp: this.pfpcontent}
      try {
        await DataService.UpdateProfilePicture(this.$store.state.UserData.userid, data)
        this.$store.state.UserData.pfp = this.pfpcontent
        this.ProfileData.pfp = this.pfpcontent
      } catch (e) {
        console.error(e)
        this.$router.push({ name: 'NetworkError' })
      }
    },

    SetUserFollows() {
      this.userfollows = this.$store.state.UserData.following.some(u => u.userid == this.$route.params.id)
    },

    async Follow() {
      const ids = {userid: this.$store.state.UserData.userid, profileid: this.$route.params.id}
      try {
        await DataService.FollowUser(ids)
        const follower = {userid: parseInt(this.$route.params.id), username: this.ProfileData.name, pfp: this.ProfileData.pfp}
        this.$store.commit('FollowUser', follower)
        this.SetUserFollows()
      } catch (e) {
        console.error(e)
        this.$router.push({ name: 'NetworkError' })
      }
    },

    async Unfollow() {
      const ids = {userid: this.$store.state.UserData.userid, profileid: this.$route.params.id }
      try {
        await DataService.UnfollowUser(ids)
        this.$store.commit('UnfollowUser', this.$route.params.id)
        this.SetUserFollows()
      } catch (e) {
        console.error(e)
        this.$router.push({ name: 'NetworkError' })
      }
    },
  }
}
</script>


<style lang="scss">
@import '@/variables.scss';

#Profile {
  display: grid;
  grid-template-columns: 2fr 5fr 2fr;
  gap: 30px;
  padding: 30px;
  >p {
    margin: 0;
  }
  
  #middle {
    >#header {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      margin: 0px 20px;
      
      #pfp {
        width: 150px;
        height: 150px;
        border: 6px solid $theme;
        #icon {
          margin: 110px;
        }
      }
      #followbutton, #unfollowbutton {
        min-width: 150px;
      }      
      #unfollowbutton:hover { 
        content: "Unfollow";
      }
    }
    #pfpsection {
        display: flex;
        gap: 10px;
        width: 100%;
        justify-content: space-between;
        input {
         width: 100%
        }
        #icon {
          margin-right: 20px;
        }
      }
    #poststitle {
      border-top: 1px solid $border;
      padding-top: 20px;
    }

    #data {
      margin-top: 20px;
      text-align: left;
       #biosection {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin: 20px 0;
        gap: 10px;
        p {
          margin: 0;
        }
        #icon {
          height: min-content;
          margin-right: 20px;
        }
      }
    }
  
    #stats {
      color: $border;
      display: flex;
      gap: 25px;
      margin-top: 20px;
      span {
        color: white;
        font-weight: bold;
      }
    }
  }
}

</style>
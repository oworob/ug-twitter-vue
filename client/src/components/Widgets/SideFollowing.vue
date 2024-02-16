<template>
    <div id="SideFollowing">
        <p id="header">Following</p>
        <div id="following">
            <router-link :to="{ name: 'ProfilePage', params: { id: user.userid } }" v-for="user in this.$store.state.UserData.following" class="colortext">
              <div id="user">
                <div id="pfp" :style="{ backgroundImage: user.pfp ? 'url(' + user.pfp + ')' : '' }"></div>
                {{ user.username }}
              </div>
            </router-link>
          </div>
        </div>
</template>


<style lang="scss">
@import '@/variables.scss';

#SideFollowing {
  position: sticky;
  top: 35px;
  align-self: start;
  z-index: 3;
  #header {
    font-size: 110%;
    background-color: $panel;
    padding: 8px;
    border-radius: 10px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
    font-weight: bold;
  }
  #following {
    display: flex;
    flex-direction: column;
    gap: 10px;
    #user {
      display: grid;
      grid-template-columns: 0.8fr 1fr;
      text-align: left;
      align-items: center;
      gap: 10px;
      #pfp {
        justify-self: right;
        height: 20px;
        width: 20px;
      }
    }
  }
}

</style>
<template>
    <div id="SideProfile">
          <p id="header">Profile</p>
          <p v-if="this.$store.state.UserData.userid == null">Loading</p>
          <router-link v-else :to="{ name: 'ProfilePage', params: { id: this.$store.state.UserData.userid } }">
            <div id="profile" class="colortext">
                <div id="pfp" :style="{ backgroundImage: this.$store.state.UserData.pfp ? 'url(' + this.$store.state.UserData.pfp + ')' : '' }"></div>
                <h4>{{ this.$store.state.UserData.name }}</h4>
            </div>
          </router-link>
        </div>
</template>

<style lang="scss">
@import '@/variables.scss';

#SideProfile {
  position: sticky;
  top: 35px;
  align-self: start;
  #header {
    font-size: 110%;
    background-color: $panel;
    padding: 8px;
    border-radius: 10px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
    font-weight: bold;
  }
  #profile {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 0 20px;
    #pfp {
      width: 50px;
      height: 50px;
      background-color: $textcolor;
      border: 3px solid $theme;
    }
  }
}

</style>
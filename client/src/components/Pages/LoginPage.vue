<template>
  <div id="Login">
    <img src="@/../public/logo.png" id="logo" alt="logo">
    <h2 id="title">Log in</h2>
    <form  id="loginform" @submit.prevent="Login">
      <div id="field">
        <label for="username">Username</label>
        <input type="text" v-model="username" id="username" required @input="this.errorcontent = ''">
      </div>
      <div id="field">
        <label for="password">Password</label>
        <input type="password" v-model="password" id="password" required @input="this.errorcontent = ''">
      </div>
      <p id="error">{{ this.errorcontent }}</p>
      <button class="button" type="submit" id="loginbutton">Log in</button>
    </form>
    <p>or</p>
    <router-link :to="{ name: 'Register' }" class="colortext">Create account</router-link>
  </div>
</template>

<script>

import DataService from "@/DataService.js"

export default {

  data() {
    return {
      username: '',
      password: '',
      errorcontent: '',
    }
  },

  methods: {
    async Login() {
       if (!this.username) {
        this.errorcontent = "Please enter username!"
      } else if (!this.password) {
        this.errorcontent = "Please enter password!"
      } else {
        const user = {username: this.username, password: this.password}
        try {
          await DataService.Login(user)
          window.location.href = "/"
        } catch (e) {
          console.error(e)
          if (e.response && e.response.status === 401) {
            this.errorcontent = "Incorrect username or password!"
          }
        }
      }
    }
  }
}
</script>

<style lang="scss">
@import '@/variables.scss';

#Login {
  padding: 60px;
  #logo {
    margin-bottom: 40px;
    height: 100px;
  }

  #title {
    margin-bottom: 40px;
    font-weight: bold;
  }

  #loginform {
    display: flex;
    flex-direction: column;
    gap: 20px;
    align-items: center;
    #field {
      label {
        font-weight: bold;
      }
      display: flex;
      flex-direction: column;
      gap: 10px;
      width: 40%;
    }
  }

}


</style>
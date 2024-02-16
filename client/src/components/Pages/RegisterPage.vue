<template>
  <div id="Register">
    <img src="@/../public/logo.png" id="logo" alt="logo">
    <h2 id="title">Create Account</h2>
    <form id="registerform" @submit.prevent="CreateUser">
      <div id="field">
        <label for="username">Username</label>
        <input type="text" v-model="username" id="username" required @input="this.errorcontent = ''">
      </div>
      <div id="field">
        <label for="password">Password</label>
        <input type="password" v-model="password" id="password" required @input="this.errorcontent = ''">
      </div>
      <p id="error">{{this.errorcontent}}</p>
      <button class="button" type="submit" id="registerbutton">Create account</button>
    </form>
    <p>or</p>
    <router-link :to="{ name: 'Login' }" class="colortext">Login</router-link>
  </div>
</template>





<script>
  import bcryptjs from 'bcryptjs'
  import DataService from "@/DataService.js"

  export default {
    data() {
      return {
        username: '',
        password: '',
        errorcontent: ''
      }
    },
    methods: {
      async CreateUser() {
        if (this.username.length < 4) {
          this.errorcontent = "Username must be at least 4 characters long!"
        } else if (this.password.length < 4) {
          this.errorcontent = "Password must be at least 4 characters long!"
        } else {
          const user = { username: this.username, password: bcryptjs.hashSync(this.password, 8) }
          try {
            await DataService.CreateUser(user)
            this.$router.push({ name: 'Login' })
          } catch (e) {
            console.error(e)
            if (e.response && e.response.status === 400) {
              this.errorcontent = "This username is taken!"
            } else {
              this.$router.push({ name: 'NetworkError' })
            }
          }
        }
      },
    },
  };
</script>

<style lang="scss">
@import '@/variables.scss';

#Register {
  padding: 60px;
  #logo {
    margin-bottom: 40px;
    height: 100px;
  }

  #title {
    margin-bottom: 40px;
    font-weight: bold;
  }

  #registerform {
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
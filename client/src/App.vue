<template>
  <Nav/>
    <router-view></router-view>
</template>

<script>

  import Nav from './components/Widgets/Nav.vue';

  export default {
    components: {
      Nav
    }
  }
</script>


<style lang="scss">

@import 'variables.scss';

body {
  background-color: $bc;
  margin: 0;
  h1, h2, h3, h4 {
    margin: 0;
  }
}

#app {
  font-family: Helvetica;
  text-align: center;
  color: $textcolor;
  background-color: $bc;
}

#error {
  font-weight: bold;
  color: rgb(255, 77, 77);
}

a {
  color: $textcolor;
  text-decoration: none;
}

.line {
    border-bottom: 1px solid $border;
    border-radius: 10px;
}

.colortext {
  transition: 0.3s;
  &:hover {
    color: $theme;
  }
}

input {
  padding: 8px;
  outline: none;
  font-family: inherit;
  background-color: $bc;
  color: white;
  border: 1px solid $border;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
  border-radius: 10px;
  transition: 0.3s;
  font-size: 90%;
  &:focus {
    background-color: $panel;
    border-color: $theme;
  }
}

#pfp {
  border-radius: 50%;
  background-color: $textcolor;
  background-size: cover;
  background-position: center;
  border: 2px solid $theme;
  background-image: url('../public/placeholderpfp.jpg');
}

.button {
  padding: 8px 30px;
  font-size: 100%;
  border-radius: 30px;
  cursor: pointer;
  background-color: $theme;
  color: $textcolor;
  outline: none;
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
  transition: 0.3s;
  font-weight: bold;
  &:hover {
    background-color: $themedark;
  }
  &#icon {
    padding: 8px 10px;
  }
}

 .textfield {
        font-family: inherit;
        background-color: $bc;
        color: $textcolor;
        outline: none;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
        padding: 15px;
        resize: none;
        overflow: hidden;
        border-radius: 10px;
        width: calc(100% - 30px);
        transition: 0.3s;
        min-height: 60px;
        border: 1px solid $border;
        font-size: 90%;
        &:focus {
            background-color: $panel;
            border-color: $theme;
        }
    }

::-webkit-scrollbar {
  width:10px;
}
::-webkit-scrollbar-track {
  background-color: $bc;

}
::-webkit-scrollbar-thumb {
  background-color: $theme; 
  border-radius: 5px;
}

</style>

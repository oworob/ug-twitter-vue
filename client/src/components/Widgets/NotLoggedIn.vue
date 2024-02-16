<template>
    <div id="NotLoggedIn">
        <h1>Access Denied</h1>
        <p id="msg">You must be logged in to access this page.</p>
        <router-link :to="{ name: 'Login' }" class="colortext">Log in</router-link>
        <p>or</p>
        <router-link :to="{ name: 'Register' }" class="colortext">Create an account</router-link>
    </div>
</template>

<style lang="scss">
@import '@/variables.scss';

#NotLoggedIn {
    padding: 50px;
    #msg {
        margin-bottom: 50px;
    }
    p {
        color: $border;
    }
}

</style>
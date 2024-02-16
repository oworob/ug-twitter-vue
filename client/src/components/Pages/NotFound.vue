<template>
    <div id="NotFound">
        <h1>Error 404</h1>
        <p>This page does not exist.</p>
        <router-link :to="{ name: 'Home' }" class="colortext">Return Home</router-link>
    </div>
</template>

<style lang="scss">
@import '@/variables.scss';

#NotFound {
    padding: 50px;
    p {
        color: $border;
        margin-bottom: 50px;
    }
}

</style>
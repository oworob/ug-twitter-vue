<template>
    <div id="NetworkError">
        <h1>Network Error</h1>
        <p>Something went wrong.</p>
        <router-link :to="{ name: 'Home' }" class="colortext">Return Home</router-link>
    </div>
</template>

<style lang="scss">
@import '@/variables.scss';

#NetworkError {
    padding: 50px;
    p {
        color: $border;
        margin-bottom: 50px;
    }
}

</style>
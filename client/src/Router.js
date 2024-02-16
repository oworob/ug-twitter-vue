import { createRouter, createWebHistory } from 'vue-router'

import NotFound from './components/Pages/NotFound.vue'
import NetworkError from './components/Pages/NetworkError.vue'
import HomePage from './components/Pages/HomePage.vue'
import Login from './components/Pages/LoginPage.vue'
import Register from './components/Pages/RegisterPage.vue'
import ProfilePage from './components/Pages/ProfilePage.vue'
import PostPage from './components/Pages/PostPage.vue'
import SearchPage from './components/Pages/SearchPage.vue'


const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomePage,
    meta: {
      title: 'Home'
    }
  },

  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: {
      title: 'Log in'
    }
  },

  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: {
      title: 'Create account'
    }
  },

  {
    path: '/user/:id',
    name: 'ProfilePage',
    component: ProfilePage,
    meta: {
      title: 'Profile'
    }
  },


  {
    path: '/post/:id',
    name: 'PostPage',
    component: PostPage,
    meta: {
      title: 'Post'
    }
  },

  {
    path: '/search',
    name: 'SearchPage',
    component: SearchPage,
    meta: {
      title: 'Search'
    }
  },

  {
    path: '/404',
    name: 'NotFound',
    component: NotFound,
    meta: {
      title: '404'
    }
  },

  {
    path: '/:404(.*)',
    name: 'NotFound',
    component: NotFound,
    meta: {
      title: '404'
    }
  },

  {
    path: '/networkerror',
    name: 'NetworkError',
    component: NetworkError,
    meta: {
      title: 'Network Error'
    }
  },


]

const router = createRouter({ history: createWebHistory(process.env.BASE_URL), routes })

router.beforeEach((to, from, next) => {
  document.title = "Y | "+ (to.meta.title || 'Unknown')
  next()
})

export default router



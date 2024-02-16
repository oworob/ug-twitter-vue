<template>

    <nav id="Nav" v-if="this.$store.state.UserData.userid">
        <div id="left">
            <img src="@/../public/logo.png" id="logo" alt="logo">
            <router-link :to="{ name: 'Home' }" class="colortext">Home</router-link>
            <router-link :to="{ name: 'ProfilePage', params: { id: $store.state.UserData.userid } }" class="colortext">Profile</router-link>
        </div>
        <form id="search" @submit.prevent="Search">
            <input type="text" v-model="searchcontent" placeholder="Search" id="searchbar">
        </form>
        <div id="right">
            <div class="fa fa-bell colortext" id="notificationbutton" @click="ToggleNotifications">
                <div id="count" v-if="Object.keys(this.$store.state.notifications).length > 0 && !this.notificationsopen">{{ Object.keys(this.$store.state.notifications).length }}</div>
            </div>

            <div id="notifications" v-if="this.notificationsopen" @mouseleave="ToggleNotifications">
                <p id="title">Notifications</p>
                <div id="notification" v-if="Object.keys(this.$store.state.notifications).length > 0" v-for="(username) in Object.keys(this.$store.state.notifications)">
                    <!-- <span id="time">{{ n.time }}</span> -->
                    <router-link :to="{ name: 'ProfilePage', params: { id: this.$store.state.notifications[username][0].userid } }" class="colortext" @click="ClearNotification(username)">{{username}}</router-link>
                    has added {{ this.$store.state.notifications[username].length }} posts.
                </div>
                <p id="clearbutton" v-if="this.$store.state.notifications.length > 0" @click="this.$store.commit('ClearNotifications')" >Clear all notifications</p>
                <div v-else id="emptymessage">
                    There are no new notifications.
                </div>
            </div>
            <div @click="Logout" id="logoutbutton" class="colortext">Log out</div>
        </div>
    </nav>
    
</template>

<script>

import DataService from "@/DataService.js"

export default {
    data() {
        return {
            searchcontent: "",
            notificationsopen: false,
        }
    },

    mounted() {
        if (this.$store.state.UserData.userid) {
            this.$store.state.socket.on('post', (data) => {
                this.$store.commit('AddNewNotification',data)
            });
        }
    },

    methods: {
        Search() {
            if (this.searchcontent != "") {
                this.$router.push({ path: "/search", query: { q: this.searchcontent } })
            }
            
        },
        async Logout() {
            try {
                await DataService.Logout()
                this.$router.push({ name: 'LoginPage' })
            } catch (e) {
                console.error(e)
            }
        },
        ToggleNotifications() {
            this.notificationsopen = !this.notificationsopen;
        },
        ClearNotification(username) {
            this.$store.commit('ClearNotification', username)
        }
    }
}

</script>


<style lang="scss">

@import '@/variables.scss';

#Nav {
    background-color: $panel;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    padding: 5px 20px;
    align-items: center;
    justify-content: space-between;
    position: sticky;
    top: 0;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
    font-weight: bold;
    z-index: 5;
    #left {
        display: flex;
        gap: 20px;
        align-items: center;
        #logo {
            max-height: 25px;
        }
    }
    #right {
        display: flex;
        gap: 20px;
        justify-content: flex-end;
        align-items: center;
        #logoutbutton {
            cursor: pointer;
        }
        #notificationbutton {
            font-size: 150%;
            cursor: pointer;
            position: relative;
            #count {
                font-size: 50%;
                font-weight: bold;
                position: absolute;
                top: -3px;
                right: -3px;
                background-color: red;
                padding: 2px 4px;
                border-radius: 50%;
                color: white;
            }
        }
         #notifications {
            p {
                margin: 0;
                &#title {
                    padding-bottom: 10px;
                    border-bottom: 1px solid $border;
                    margin-bottom: 10px;
                }
                &#clearbutton {
                    padding-top: 10px;
                    border-top: 1px solid $border;
                    margin-top: 10px;
                    font-weight: normal;
                    color: $border;
                    font-size: 80%;
                    cursor: pointer;
                    transition: 0.3s;
                    &:hover {
                        color: $theme;
                    }
                }               
            }
            #time {
                    color: $border;
                    font-size: 80%;
                    margin: 0 10px;
                }
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
            width: 20%;
            display: flex;
            flex-direction: column;
            gap: 8px;
            background-color: $panel;
            position: absolute;
            top: 50px;
            padding: 20px;
            border-radius: 10px;
            #notification, #emptymessage {
                font-weight: normal;
                a {
                    font-weight: bold;
                }
            }
            #emptymessage {
                color: $border;
                font-size: 80%;
            }
        }
    }
    #searchbar {
        width: 80%;
    }

}

</style>
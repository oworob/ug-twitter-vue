import { createStore } from 'vuex';
import DataService from "@/DataService.js"

import io from 'socket.io-client'
const socket = io(`http://${window.location.hostname}:3000`, { withCredentials: true })


export default createStore({

    state: {
        UserData: await DataService.GetUserData(),
        socket: socket,
        notifications: {}
    },

    mutations: {
        UpdateData(state, newdata) {
            state.UserData = newdata;
        },

        FollowUser(state, newfollower) {
            state.UserData.following.push(new Proxy(newfollower,{}))
        },

        UnfollowUser(state, userid) {
            state.UserData.following = state.UserData.following.filter(f => f.userid != parseInt(userid))
        },

        ClearNotifications(state) {
            for (const v in state.notifications) delete state.notifications[v];
        },

        ClearNotification(state, username) {
            delete state.notifications[username];
        },

        AddNewNotification(state,data) {
            if (data.username in state.notifications) {
                state.notifications[data.username].unshift(data)
            } else {
                state.notifications[data.username] = [data]
            }
        }

        
    },

});

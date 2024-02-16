import axios from 'axios'

const Server = axios.create({
    baseURL: `http://${window.location.hostname}:3000/api`,
    withCredentials: true,
    headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
    }
})

export default {
    async CreateUser(user) {
        await Server.post(`/register`, user)
    },

    async Login(user) {
        await Server.post(`/login`, user)
    },

    async Logout() {
        await Server.get(`/logout`)
        window.location.href = '/login'
    },


    async GetUserData() { // used in router
        try {
            const res = await Server.get(`/userdata`)
            const res2 = await Server.get(`/following`)
            res.data.following = res2.data
            console.log("Fetched UserData")
            return res.data
        }
        catch (e) {
            console.error(e)
            return {}    
        }
    },

    async GetHomePosts(userid, limit, skip) {
        const res = await Server.get(`/homeposts/${userid}/${limit}/${skip || 0}`)
        return res.data
    },

    async CreatePost(post) {
        await Server.post(`/newpost`, post)
    },

    async GetPost(postid) {
        const res = await Server.get(`/post/${postid}`)
        return res.data
    },

    async DeletePost(postid) {
        await Server.delete(`/deletepost/${postid}`)
    },

    async CreateReply(reply) {
        await Server.post(`/newreply`, reply)
    },

    async GetPostReplies(postid) {
        const res = await Server.get(`/replies/${postid}`)
        return res.data
    },

    async Search(query) {
        const res = await Server.get(`/search/${query}`)
        return res.data
    },

    async GetProfileData(profileid) {
        const res = await Server.get(`/user/${profileid}`)
        return res.data
    },

    async FollowUser(ids) {
        await Server.post(`/follow`, ids)
    },

    async UnfollowUser(ids) {
        await Server.put(`/unfollow`, ids)
    },

    async UpdateProfileBio(userid, data) {
        await Server.patch(`/updatebio/${userid}`, data)
    },

    async UpdateProfilePicture(userid, data) {
        await Server.patch(`/updatepfp/${userid}`, data)
    },

}

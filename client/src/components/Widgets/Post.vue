<template>
  
    <div id="Post">
    	<div v-if="!PostData"></div>

        <div v-else>
            <router-link :to="this.disabledlink ? '' : { name: 'PostPage', params: { id: PostData.Post.postid } }">
            <div id="post" :class="{ 'disabled': this.disabledlink }">
                
                <div id="header">
                     <router-link :to="{ name: 'ProfilePage', params: { id: PostData.Post.userid } }" class="colortext" id="userlink">
                        <div id="user">
                            <div id="pfp" :style="{ backgroundImage: PostData.Post.pfp ? 'url(' + PostData.Post.pfp + ')' : '' }"></div>
                            <h4>{{ PostData.Post.username }}</h4>
                        </div>
                    </router-link>
                    
                     <div id="right" v-if="PostData.Post.userid == this.visitorid">
                        <button id='icon' class="fa fa-trash button" @click="DeletePost"></button>
                    </div>
                </div>


                <p id="content">
                    <span v-for="part in SplitMessage(PostData.Post.content)" :key="part.index">
                    <router-link v-if="part.charAt(0) == '#' " :to="{ path: '/search', query: { q: part.slice(1) } }" id="tag">{{ part }}</router-link>
                    <span v-else>{{ part }}</span>
                    </span>
                </p>

                <router-link v-if="PostData.PrevPost && !hidePrev" :to="{ name: 'PostPage', params: { id: PostData.PrevPost.postid } }">
                    <div id="previous">
                        <div id="header">
                            <router-link :to="{ name: 'ProfilePage', params: { id: PostData.PrevPost.userid } }" id="userlink" class="colortext">
                                <div id="user">
                                    <div id="pfp" :style="{ backgroundImage: PostData.PrevPost.pfp ? 'url(' + PostData.PrevPost.pfp + ')' : '' }"></div>
                                    <h4>{{ PostData.PrevPost.username }}</h4>
                                </div>
                            </router-link>
                        </div>
                        <!-- <p id="content">{{ PostData.PrevPost.content }}</p> -->
                         <p id="content">
                            <span v-for="part in SplitMessage(PostData.PrevPost.content)" :key="part.index">
                            <router-link v-if="part.charAt(0) == '#'" :to="{ path: '/search', query: { q: part.slice(1) } }" id="tag">{{ part }}</router-link>
                            <span v-else>{{ part }}</span>
                            </span>
                        </p>
                       
                    </div>
                </router-link>

                <p id="date">{{ PostData.Post.date }}</p>
            </div>
            </router-link>
        </div>
    </div>
</template>
  
<script>
    import DataService from "@/DataService.js"
  
    export default {
        data() {
            return {
                PostData: null
            }
        },

        props: [ 'postId', 'hidePrev', 'disabledlink', 'visitorid'],

        mounted() {
           this.GetPost()
        },

        methods: {
            async GetPost() {
                try {
                    this.PostData = await DataService.GetPost(this.postId)
                } catch (e) {
                    console.error(e)
                    this.$router.push({ name: 'NotFound' })
                }
            },
            async DeletePost() {
                try {
                    await DataService.DeletePost(this.postId)
                    this.$router.push({ name: 'Home' })
                } catch (e) {
                    console.error(e)
                    this.$router.push({ name: 'NetworkError' })
                }
            },

            SplitMessage(content) {
                const regex = /#(\w+)/g;
                const result = [];
                let lastIndex = 0;
                let match;
                while ((match = regex.exec(content)) !== null) {
                    result.push(content.substring(lastIndex, match.index));
                    result.push(match[0]);
                    lastIndex = match.index + match[0].length;
                }
                result.push(content.substring(lastIndex));
                return result;
            }
        }
    }


  </script>
  
<style lang="scss">

@import '@/variables.scss';


#Post {
	#post {
        background-color: $panel;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
        border-radius: 10px;
        padding: 15px 20px;
        #header {
            font-weight: bold;
            #userlink {
                width: fit-content;
                display: block;
                #user {
                    padding-right: 20px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    #pfp {
                        width: 30px;
                        height: 30px;
                        background-color: $textcolor;
                        border-radius: 50%;
                    }
                }
                
            }
            
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 15px;
        }
        #content {
            text-align: left;
            #tag {
                transition: 0.3s;
                color: $theme;
                &:hover {
                    color: $themedark;
                }
            }
        }

        transition: 0.3s;
        &:hover:not(.disabled) {
            background-color: $paneldark;
        }
        &:has(#previous:hover) {
            background-color: $panel;
        }
        &.disabled {
            cursor: default;
        }

        #previous {
            border: 1px solid $border;
            background-color: $panel;
            border-radius: 10px;
            padding: 15px;
            margin-bottom: 15px;
            #header {
                gap: 5px;
            }
            #pfp {
                width: 20px;
                height: 20px;
            }
            p {
                margin: 4px 0;
            }
            transition: 0.3s;
            &:hover {
                background-color: $paneldark;
            }
        }

        #date {
            color: $border;
            font-size: 70%;
            margin: 0;
            text-align: left;
        }
	}
}

</style>
  

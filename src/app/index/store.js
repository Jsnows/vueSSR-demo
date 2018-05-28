import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'

// 这里改成你自己的ip!!!!
let url = 'http://10.216.98.70:8081/'

Vue.use(Vuex)
// dispatch执行actions里面的方法
let actions = {
    GET_LIST_DATA:function({commit}){
        return new Promise((resolve, reject) => {
            // 调用我们的假接口，可在server.js查看
            // /home接口
            axios.get(`${url}home?page=1`).then((data)=>{
                commit('SET_DATA',data.data)
                resolve()
            })
        })
    },
    GET_ARTICLE:function({commit},name){
        return new Promise((resolve, reject) => {
            // 调用我们的假接口，可在server.js查看
            // /text接口
            axios.get(`${url}text?file_name=${encodeURI(name)}`).then((data)=>{
                commit('SET_TEXT',data.data)
                resolve()
            }).catch((err)=>{
                reject(err)
            })
        })
    }
}

// commit执行mutations里面的方法
let mutations = {
    SET_DATA:(state,{data}) => {
        state.data = data
    },
    SET_TEXT:(state,{data}) => {
        state.text = data
    }
}
let state = {
    data:{},
    text:''
}
export function createStore() {
    return new Vuex.Store({
        state,
        actions,
        mutations
    })
}



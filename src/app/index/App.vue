<template>
    <div id="app">
        <Row type="flex" class="head-bar">
            <Col type="flex" justify="center" align="middle" class="item" span="2" offset="2">
                我的blog
            </Col>
            <Col type="flex" justify="center" class="item" align="middle" span="4">
            </Col>
            <Col align="middle" span="12" offset="2">
                <Menu mode="horizontal" theme="light">
                    <router-link :to="{ name: 'home'}">
                        <Menu-item key="1" name="1">
                            <Icon type="ios-paper"></Icon>
                            文章列表
                        </Menu-item>
                    </router-link>
                    <router-link :to="{ name: 'aboutMe'}">
                        <Menu-item key="2" name="2">
                            <Icon type="person"></Icon>
                            about me
                        </Menu-item>
                    </router-link>
                </Menu>
            </Col>
        </Row>
        <br/>
        <router-view></router-view>
        <Row class="content" type="flex" justify="center">
            <Col span="18" align="middle" style="padding:10px;font-size:12px;">
                Copyright © 2016 - 2018 jsnows All rights reserved.
            </Col>
        </Row>
    </div>
</template>

<script>

    // 组件实例对象

    export default {
        components: {

        },
        data: function() {
            return {

            }
        },
        computed: {

        },
        methods: {

        },
        beforeCreate() {

        },
        created() {

        }

    }


</script>

<style src="../../../node_modules/iview/dist/styles/iview.css"></style>
<style src="../../../node_modules/highlight.js/styles/github.css"></style>
<style src="static/index.css"></style>
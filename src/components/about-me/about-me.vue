<template>
<div>
    <Row class="content" type="flex" justify="center">
        <Col span="18" style="padding:20px;font-size:18px;box-shadow: 0px 2px 2px #888888;">
            <div class="headImgBox">
                <img src="https://jsnows-images.oss-cn-beijing.aliyuncs.com/20510811.jpeg" class="headImg">
                <p class="holderImg">图片加载中...</p>
            </div>
            <p style="text-indent:0rem;margin-bottom:10px;">
                <a style="background:#4ab122;" class="tags">nodeJS</a>
                <a style="background:#39a97e;" class="tags">Vue</a>
                <a style="background:#4cadc9;" class="tags">React</a>
                <a style="background:#0cbdb7;" class="tags">React Native</a>
                <a style="background:#bc0214;" class="tags">HTML5</a>
                <a style="background:#07ac97;" class="tags">Electron</a>
                <a style="background:#666666;" class="tags">Express</a>
                <a style="background:#3c3c3c;" class="tags">Github</a>
            </p>
            <p>hi，我是一名前端攻城狮（目前就职于<a target="view_window" href="http://www.doumi.com">斗米</a>），极其喜欢前端开发（涉猎不仅限于前端），专注于研究前端高效开发、模块化开发、前后端分离、跨平台开发方案。热爱开源，我的开源markdown编辑器（<a target="view_window" href="https://github.com/Jsnows/mgd">MGD</a>）基于<a target="view_window" href="https://cn.vuejs.org/">vue</a>、<a target="view_window" href="https://electronjs.org/">electron(跨平台桌面应用开发方案)</a>实现,欢迎<a target="view_window" href="https://github.com/Jsnows/mgd">star</a>。</p>
            <p style="font-size:14px;text-indent:0rem;">E-Mail : qiongxuecui@163.com</p>
            <p style="font-size:14px;text-indent:0rem;">QQ : 2643145092（非技术交流勿扰）</p>
            <p style="font-size:14px;text-indent:0rem;">Github : <a target="view_window" href="https://github.com/Jsnows">https://github.com/Jsnows</a></p>
        </Col>
    </Row>
</div>
</template>

<script>
    export default {
        components: {
            
        },
        data: function() {
            return {
                holder:true
            }
        },
        methods: {
            
        },
        created () {
            
        }
    }

    
</script>
<style>
    .tags{
        padding:5px 12px 5px;
        border-radius:5px;
        color:#fff;
        font-size: 12px;
        margin-right: 5px;
    }
    .tags:hover{
        color:#fff;
    }
    .headImgBox{
        width:200px;
        height:200px;
        border-radius:100px;
        float:left;
        margin-right:20px;
        background:#e0e0e0;
        color:#bbbbbb;
    }
    .headImg{
        width:200px;
        border-radius:100px;
        float:left;
        margin-right:20px;
        position:absolute;
        z-index:1;
    }
    .holderImg{
        position:absolute;
        left:8%;
        top:43%;
    }
</style>



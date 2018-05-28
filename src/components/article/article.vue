<template>
    <Row class="content" type="flex" justify="center">
        <Col span="18" style="padding:20px;font-size:18px;box-shadow: 0px 2px 2px #888888;" v-html="text">
        </Col>
    </Row>
</template>

<script>

    export default {
        asyncData:({store,route})=>{
            return store.dispatch('GET_ARTICLE',route.query.name)
        },
        components: {
           
        },
        data: function() {
            return {
                R:'',
                textMark:this.$store.state.text
            }
        },
        computed: {
            text(){
                let self = this;
                return self.textMark;
            }
        },
        methods: {
           
        },
        created () {
            
        }
    }

    
</script>


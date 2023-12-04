export default {
    data(){
        return {
            appName : '',
            appSubtitle : '',
            appLogo : null,
            appMenuLogo : null,
        }
    },
    mounted(){
        this.setAppMeta();
    },
    methods : {
        setAppMeta(){
            this.appName=this.queryMeta('app:name');
            this.appSubtitle=this.queryMeta('app:subtitle');
            this.appLogo=this.queryMeta('app:logo');
            this.appMenuLogo=this.queryMeta('app:menu_logo');
        },
        queryMeta(name){
            const sel=document.querySelector("meta[name='"+name+"']");
            if(sel){
                return sel.getAttribute("content");
            }else{
                return '';
            }
        }
    }
}
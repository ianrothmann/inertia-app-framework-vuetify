export default {
    props : {
      pageTitle : {type:String}
    },
    methods: {
        setDocumentTitle() {
            const title=this.pageTitle || this.$page.props.$title;
            if(title){
                document.title = title + ' :: ' + this.appName;
            }
        },
        watchTitle(){
            this.setDocumentTitle();
            this.$watch('$page.props.$title',()=>{
                this.setDocumentTitle();
            });
            this.$watch('pageTitle',()=>{
                this.setDocumentTitle();
            });
        }
    },
    mounted() {
        this.watchTitle();
    }
}

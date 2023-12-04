export default {
    props : {
        items : Array
    },
    data: () => ({
        openGroups: {}
    }),
    computed : {

    },
    methods: {
        navigate(menuItem) {
            if(menuItem.back){
                window.history.back();
            }
            else if(menuItem.url){
                if(menuItem.target==='_blank'){
                    window.open(menuItem.url, '_blank');
                }else{
                    document.location.href=menuItem.url;
                }
            }else if(menuItem.route){
                this.$inertia.visit(this.$route(menuItem.route,menuItem.route_params), {
                    onFinish: _ => {
                        this.setOpenGroups();
                    }
                });
            }
        },
        getKey(menuItem){
            let url = menuItem.url;
            if(!url){
                url=this.$route(menuItem.route,menuItem.route_params)
            }
            const l = document.createElement("a");
            l.href = url;
            return l.pathname;
        },
        hasChildSelected(menuItem){
            if(menuItem.items){
                for(let item of menuItem.items){
                    if(this.currentRoute() === this.getKey(item)){
                        return true;
                    }
                }
            }
            return false;
        },
        currentRoute(){
            return window.location.pathname;
        },
        setOpenGroups() {
            this.items.forEach((item, itemIndex) => {
                if(item.items !== undefined) {
                    this.$set(this.openGroups, itemIndex, this.hasChildSelected(item));
                }
            });
        }
    }
}

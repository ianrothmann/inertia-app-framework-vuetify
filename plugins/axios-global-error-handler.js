//TODO: Passing custom config does not work in axios 0.19, follow https://github.com/axios/axios/issues/2295 and update if fixed


function errorResponseHandler(error) {
    if(error.config && error.config.hasOwnProperty('errorHandle') && error.config.errorHandle === false ) {
        return Promise.reject(error);
    }

    if (error.response) {
        this.onError(error);
    }

    return Promise.reject(error);
}

function createErrorResponseHandler(axios,onError){
    axios.interceptors.response.use(
        response => response,
        errorResponseHandler.bind({onError})
    );
}

export {createErrorResponseHandler,createDefaultFrameworkErrorResponseInterceptor};

function createDefaultFrameworkErrorResponseInterceptor(axios, snackbarFn, dialogFn){
    createErrorResponseHandler(axios,(error)=>{
        if(error.response.status===422 || error.response.status===429){
            return;
        }

        if(process.env.NODE_ENV==='production'){
            snackbarFn('An error has occurred.','error');
        }else{
            setTimeout(()=>{
                let response = error.response.data;
                if(typeof error.response.data === 'object'){
                    response='<table>';
                    for(let key of Object.keys(error.response.data)){
                        let val = error.response.data[key];
                        if(typeof val === 'object'){
                            val = JSON.stringify(val, null, 2);
                            response+=`<tr valign="top"><td><b>${key}</b></td><td><code>${val}</code></td></tr>`;
                        } else {
                            response+=`<tr><td><b>${key}</b></td><td>${val}</td></tr>`;
                        }
                    }
                    response+='</table>';
                }

                const url=error.response.config.url['return'];
                const data=JSON.stringify(!!error.response.config.data ? JSON.parse(error.response.config.data) : {}, null, 2);
                const title=error.response.statusText + ' - '+ error.response.status;
                const content=`
                <span class="title">URL</span><br><code>${url}</code><br>
                <span class="title">Data sent</span><br><code>${data}</code><br>
                <span class="title">Response</span><br>${response}
            `;

                dialogFn({title,content, width:'80%', persistent:false});
            },200);
        }
    });
}

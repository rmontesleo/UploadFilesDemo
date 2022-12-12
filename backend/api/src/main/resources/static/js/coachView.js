var view = this;

/**
 * 
 * @param {*} fileElementId 
 * @returns 
 */
function getSimpleFile(fileElementId) {
    const file = document.getElementById(fileElementId).files[0];  
    console.log(`the file is  ${file}` );
    return file;
}

/**
 * 
 * @param {*} fileElementId 
 * @param {*} appendedFileName 
 * @returns 
 */
function getFormData(fileElementId, appendedFileName) {
    const userFile = getSimpleFile(fileElementId);
    const formData = new FormData();
    formData.append(appendedFileName, userFile, userFile.name);
    return formData;
}

/**
 * 
 * @param {*} file 
 * @returns 
 */
async function getBase64FromFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const base64String = reader.result
                .replace('data', '')
                .replace(/^.+,/, '');
            resolve(base64String);
        };
        reader.onerror = error => reject(error);
    });
}


/**
 * 
 * @param {*} file 
 * @param {*} chunkSize 
 * @returns 
 */
async function getChuncksFromBase64(file, chunkSize) {
    try {
        const stringBase64 = await getBase64FromFile(file);
        return stringBase64.match(new RegExp('.{1,' + chunkSize + '}', 'g'));
    } catch (error) {
        console.error(error);
    }
}


async function clickToUploadInChunks( writeBase64ContentService, concatenatedNames  ) {

    try {
        const userFile = getSimpleFile('userFile');
        const chunkArray = await getChuncksFromBase64(userFile, 250000);        
        console.log(`size is ${chunkArray.length}`);
        console.table(chunkArray);
        const fileNameArray = [];
               

        const uploadPromiseArray = chunkArray.map( (stringBase64, index) => {
                            
            const fileName = `demoFileBase64Chunk_${index}.txt`;
            fileNameArray.push(fileName);
            const body = JSON.stringify({ "base64Content": stringBase64,  "fileName": fileName });
                                    
            return new Promise( (resolve, reject)=>{                
                writeBase64ContentService({
                    params: body,
                    load: response => resolve(response.isCreated),
                    error: error =>  reject(error)
                });
            });
            
        });       
        
        console.log( uploadPromiseArray );
        console.log("### -> allSettled ")
                

        const size = await Promise.allSettled( uploadPromiseArray )
        .then( values => {        
            const promiseLength = values.length;
            console.log(`promise Size is ${promiseLength}`  );                
            console.table(values);
            
            const rejectedArray = values.filter( current =>  current.status === "rejected"  );
            console.log(`rejected length is ${rejectedArray.length}`);

            console.log( "concatenatedNames value then " + concatenatedNames);
            //concatenatedNames.set("value", fileNameArray.join(",") );
            //console.log( "concatenatedNames value now" + concatenatedNames.get('value') );
            
            console.log("done");

            return rejectedArray.length;
        });

        console.log(`size is ${size}`);
        if( size > 0 ){
            return false;
        }

        concatenatedNames.set("value", fileNameArray.join(",") );
        console.log( "concatenatedNames value now" + concatenatedNames.get('value') );

        return true;
        
    } catch (error) {
        console.log(error);
    }
}




this.uploadDocument = async function(){
    console.log("#######################################");
    var writeBase64ContentService = this.context.options.writeBase64ContentService;
    var concatenatedNames = this.context.options.concatenatedNames;
    
    const areChucksUploaded =await clickToUploadInChunks( writeBase64ContentService, concatenatedNames );  
    console.log(`are chunks uploaded ${areChucksUploaded}`);
    console.log("----------------------------------------");

}


this.invokeJoinChunck = function(){
    var concatenatedNames = this.context.options.concatenatedNames.get("value");
    var input = JSON.stringify( {"fileName": "JoinedDemoCunkFile.txt", "concatenatedNames": concatenatedNames} );
    var serviceArgs = {
        params : input,
        load: function (response){
            console.log( response );
            console.log( response.result );          
            alert("Chunks are joined");
        },
        error: function(e){
            console.error();
        }
    }   
    this.context.options.joinChunksService(serviceArgs);
}


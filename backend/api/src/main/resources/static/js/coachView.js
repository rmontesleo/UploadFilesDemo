var view = this;
var _this  = this;

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


async function clickToUploadInChunks( writeBase64ContentService, fileNameArray, chunkSize, chunkFileName ) {

    try {
        const userFile = getSimpleFile('userFile');
        const chunkArray = await getChuncksFromBase64(userFile, chunkSize );        
        console.log(`size is ${chunkArray.length}`);
        console.table(chunkArray);               

        const uploadPromiseArray = chunkArray.map( (stringBase64, index) => {
                            
            const fileName = `${chunkFileName}_${index}.txt`;
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
        console.log("### -> allSettled ");                

        const size = await Promise.allSettled( uploadPromiseArray )
        .then( values => {        
            const promiseLength = values.length;
            console.log(`promise Size is ${promiseLength}`  );                
            console.table(values);            
            const rejectedArray = values.filter( current =>  current.status === "rejected"  );
            console.log(`rejected length is ${rejectedArray.length}`);
            console.log("done");
            return rejectedArray.length;
        });

        console.log(`size is ${size}`);
        if( size > 0 ){
            return false;
        }       

        return true;
        
    } catch (error) {
        console.log(error);
    }
}


async function invokeJoinChuncks (concatenatedNames, joinChunksService, joinedFileName ) {   
    
    console.log( `concatenatedNames for JSON ${concatenatedNames}` );

    var input = JSON.stringify( {"fileName": joinedFileName, "concatenatedNames": concatenatedNames} );  

    var joinPromise = new Promise( (resolve, reject)=>{
        joinChunksService({
            params : input,
            load: response => resolve(response.result),
            error: e => reject(e)
        });
    });


    try {
        var result = await joinPromise;   
        console.log('result is ' + result );     
        return result;
    }catch (error){
        return false;
    }
}


function getFormatedDate() {
    var now  =  new Date();   
    
    var year    =  now.getFullYear(); 
    var month   =  now.getMonth() + 1;
    var day     =  now.getDate();    
    var hour   =  String( now.getHours() ).padStart(2, '0');   
    var minutes =  String( now.getMinutes() ).padStart(2, '0');    
    var seconds =  String( now.getSeconds() ).padStart(2, '0');
    var milisecs = String( now.getMilliseconds() ).padStart(3, '0');

    return "" + year + month + day + hour + minutes + seconds + milisecs;

}


this.uploadDocument = async function(){
    console.log("#######################################");
    var writeBase64ContentService = this.context.options.writeBase64ContentService;
    var fileNameArray = [];    
    var chunkSize = this.context.options.chunkSize.get("value");
    var applicationId = this.context.options.applicationId.get("value");
    var processId = this.context.options.processId.get("value");    

    var chunkFileName =  getFormatedDate() + "_chunk_" +  applicationId + "_" + processId;    
     
    //start loader

    const areChucksUploaded = await clickToUploadInChunks( writeBase64ContentService, fileNameArray, chunkSize, chunkFileName );  
    console.log(`are chunks uploaded ${areChucksUploaded}` );

    if( areChucksUploaded ){        
        var concatenatedNames = fileNameArray.join(",");
        var joinChunksService = this.context.options.joinChunksService; 
        var joinedFileName =  "Joined_" + chunkFileName + "_File.txt";

        var areJoined = await invokeJoinChuncks( concatenatedNames, joinChunksService, joinedFileName );
        console.log(`===== areJoined: ${areJoined}`)
    }else{
        //end the loader
        //send the error alert
    }

    console.log("----------------------------------------");

}

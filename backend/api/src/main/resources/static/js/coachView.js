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

async function clickToUploadInChunks( writeBase64ContentService  ) {
    try {
        const userFile = getSimpleFile('userFile');
        const chunkArray = await getChuncksFromBase64(userFile, 250000);        
        console.log(`size is ${chunkArray.length}`);
        console.table(chunkArray);              

        const uploadPromiseArray = chunkArray.map( (stringBase64, index) => {
                            
            const body = JSON.stringify({ "base64Content": stringBase64,  fileName: `demoFileBase64Chunk_${index}.txt`});
                                    
            return new Promise( (resolve, reject)=>{                
                writeBase64ContentService({
                    params: body,
                    load: function(response){
                        resolve(response.isCreated)                                                        
                    },
                    error: function(error){
                        reject(error)
                    }
                });
            });
            
        });       
        
        console.log( uploadPromiseArray );
        console.log("### -> allSettled ")
        let isContinue = false;        

        Promise.allSettled( uploadPromiseArray )
        .then( values => {                        
            console.table(values);
            values.forEach( current => console.log( current ) );
            isContinue = true;
            console.log("done");
        });

        console.log(`isContinue ${isContinue}`)
        
    } catch (error) {
        console.log(error);
    }
}

function innerHello(){
	alert('HELLO');
}


this.uploadDocument = async function(){
    console.log("#######################################");
    var writeBase64ContentService = this.context.options.writeBase64ContentService;
    
	clickToUploadInChunks( writeBase64ContentService );	
	console.log("----------------------------------------");

}


this.sayHello = function(){
   console.log('start');
   innerHello();
   console.log('end');
}


this.invokeDemoWrite = function(){
	var input = JSON.stringify( {fileName: "demoCouch.txt"} );
	var serviceArgs = {
		params : input,
		load: function (response){
			console.log( response );
			console.log( response.isCreated );			
		},
		error: function(e){			
		}
	}	
	this.context.options.demoWriteFile(serviceArgs);
}




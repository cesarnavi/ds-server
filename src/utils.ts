import { Response } from "express";

export const createSlug = (str="") => str.normalize('NFD')
.replace(/[\u0300-\u036f]/g, '')
.trim().
toLowerCase()
.replace(" ","-")

export const onError = (res: Response, msg: string) => {
    return res.status(400).send({ message: msg });
};

export const isYoutubeLink =(link:string)=>{
    const reg = /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube(-nocookie)?\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?$/
    return reg.test(link);
}

export const base64ToArrayBuffer = (base64:any, dir:any, name:any) => {
	const allowFormatts = ['jpg', 'jpeg', 'png', 'pdf', "plain", "webp"];
	let [header, base64Image] = base64.split(';base64,');
	let [_, MIME] = header.split('/')

	let extension = MIME;
	if (!allowFormatts.includes(extension))
		return [true, 'invalid format']

	if(extension == "plain"){
		extension = "txt"
	}
	

	try{
        //Creamos folder si no existe
        if (!require("fs").existsSync(dir)) {
            require("fs").mkdirSync(dir, { recursive: true })
        }

        let filename=`${name}.${extension}`;
		let i =1;
		while(require("fs").existsSync(`${dir}/${filename}`)){
            filename = `${name}_${i}.${extension}`
			i++;
		}

		require("fs").writeFileSync(`${dir}/${filename}`, base64Image, { encoding: 'base64' });
		return [false, filename, extension]
	} catch (error) {
        console.log(error)
		return [true, 'error']
	}
}

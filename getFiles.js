const fs = require("fs");
const dir = "./songs/";
const folder = "./songs_name.txt";

fs.readdir(dir, (err, files)=> {
    if (err) throw err;
    else {
        saveFilesName(files);
    }
})

function saveFilesName(files) {
    console.log(typeof files);
    fs.writeFile(folder, files, (err)=>{
        if (err) throw err;
        else {
            console.log(`Saved songs name into the ${folder} folder.`);
        }
    });
}
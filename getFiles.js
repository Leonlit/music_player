const fs = require("fs");

const dir = "songs/";
const file = "./songs_name.txt";

//get all the filenames from the songs directoy
fs.readdir(dir, (err, files)=> {
    if (err) throw err;
    else {
        saveFilesName(files.toString());
    }
})

//saving all the names (separated by a comma) into the songs_name.txt file
function saveFilesName(files) {
    fs.writeFile(file, files, (err)=>{
        if (err) throw err;
        else {
            console.log(`Saved songs name into the ${file} folder.`);
        }
    });
}
"use strict";

// import * as zip from "https://deno.land/x/zipjs/index.js";
// import "../../../libraries/browserfs.min.js";

// BrowserFS.install(window);

// BrowserFS.configure({
//     fs: "MountableFileSystem",
// });

// zip.configure({
//     useWebWorkers: true
// });

// const zipfile = new zip.fs.FS();

// const xhr = new XMLHttpRequest();
// xhr.open("GET", "./src/save/world.zip", true);
// xhr.responseType = "blob";

// xhr.onload = function () {
//     if (this.status === 200) {
//         const blob = this.response;
//         console.log(blob);
//         zipfile.importBlob(blob, () => {
//             const rootFS = zip.getRootFS(() => {
//                 BrowserFS.mkdir("/save");
//                 BrowserFS.mount(rootFS, { root: "/zip" }, function() {
//                   });
//             });
//         });
//     }
// };

// xhr.send();


class Save {

}

export default Save;
import { CARviewer} from './MKViewer.js';
function _(elm){return document.getElementById(elm)}

let mouseX = 0;
let mouseY = 0;
const windowHalfX = window.innerWidth / 2;
const windowHalfY = window.innerHeight / 2;
function onDocumentMouseMove( event ) {
    mouseX = ( event.clientX - windowHalfX );
    mouseY = ( event.clientY - windowHalfY );
}
document.addEventListener( 'mousemove', onDocumentMouseMove );
let Viewer = new CARviewer(elm)
Viewer.initScene()
Viewer.animate()
// Viewer.render = function () {
   
// }

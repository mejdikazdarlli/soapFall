import * as THREE from './THREE/three.module.js';
import { OrbitControls } from './THREE/OrbitControls.js';
import { RGBELoader } from './THREE/RGBELoader.js';
import { GLTFLoader } from './THREE/GLTFLoader.js';
import { DRACOLoader } from './THREE/DRACOLoader.js';

function _(elm) { return document.getElementById(elm) }
export class CARviewer {
    constructor(container, camera, scene, orbit, renderer,)
        {
        this.container = container;
        this.camera = camera;
        this.scene = scene;
        this.orbit = orbit;
        this.renderer = renderer;
        }
   async initScene() {
        this.scene = new THREE.Scene();
        this.scene.name = "CAR-scene"
        // let fogColor = new THREE.Color(0xff0000);
        // this.scene.fog = new THREE.Fog(fogColor, 50, 70);
        //document.body.appendChild(container);
        const size = 100;
        const divisions = 20;
        const gridHelper = new THREE.GridHelper(size, divisions);
        //this.scene.add( gridHelper );
        const fov = 80;
        const near = 1;
        const far = 10000000;
        this.camera = new THREE.PerspectiveCamera(fov, this.container.innerWidth / this.container.innerHeight, near, far);
        this.camera.name = "CAR-camera"
        this.camera.position.set(0,-40,0)
        this.camera.zoom = 1;
        this.camera.aspect = this.container.offsetWidth / this.container.offsetHeight;
        this.camera.updateProjectionMatrix();
        this.camera.lookAt(new THREE.Vector3(0,0,0));
        this.scene.add(this.camera);

        this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true});
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(this.container.offsetWidth, this.container.offsetHeight);
        this.container.appendChild(this.renderer.domElement);
        this.renderer.toneMappingExposure =1.0;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.physicallyCorrectLights = true;
        this.renderer.shadowMap.enabled = false;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.CustomToneMapping;
        THREE.ShaderChunk.tonemapping_pars_fragment = THREE.ShaderChunk.tonemapping_pars_fragment.replace(
            'vec3 CustomToneMapping( vec3 color ) { return color; }',
            `#define Uncharted2Helper( x ) max( ( ( x * ( 0.15 * x + 0.10 * 0.50 ) + 0.20 * 0.02 ) / ( x * ( 0.15 * x + 0.50 ) + 0.20 * 0.30 ) ) - 0.02 / 0.30, vec3( 0.0 ) )
            float toneMappingWhitePoint = 0.0;
            float contrast(float mValue, float mScale, float mMidPoint) {return clamp( (mValue - mMidPoint) * mScale + mMidPoint, 0.0, 1.0);}
            float contrast(float mValue, float mScale) {return contrast(mValue,  mScale, .5);}
            vec3 contrast(vec3 mValue, float mScale, float mMidPoint) {return vec3( contrast(mValue.r, mScale, mMidPoint), contrast(mValue.g, mScale, mMidPoint), contrast(mValue.b, mScale, mMidPoint) );}
            vec3 contrast(vec3 mValue, float mScale) {return contrast(mValue, mScale, .5);}
            vec3 CustomToneMapping( vec3 color ) {
                    vec3 memcolor = color;
                    vec3 linear = toneMappingExposure * color;
                    const mat3 ACESInputMat = mat3(vec3( 0.59719, 0.07600, 0.02840 ),vec3( 0.35458, 0.90834, 0.13383 ),vec3( 0.04823, 0.01566, 0.83777 ));
                    const mat3 ACESOutputMat = mat3(vec3(  1.60475, -0.10208, -0.00327 ),vec3( -0.53108,  1.10813, -0.07276 ),vec3( -0.07367, -0.00605,  1.07602 ));
                    color *= toneMappingExposure / 1.0;
                    color = ACESInputMat * color;
                    // Apply RRT and ODT
                    color = RRTAndODTFit( color );
                    color = ACESOutputMat * color;
                    vec3 film =  color ;
                    float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));
                    gray = clamp(gray,0.0,1.0);
                    //return clamp(contrast((1.0-gray)*linear + gray*film,1.1,.0),0.0,1.0);
                    return (film+linear)*1.2;
                    //return clamp((1.0-gray)*linear + gray*film,0.0,1.0);
                    //return linear;
                    //return clamp(film,0.0,1.0);
            }`
    );
 
        //await LoadModel('soap.glb', this.scene);
        await Particules('soap.glb', this.scene) 
        await loadEnvironmentHDR(this.renderer, this.scene, 'env.hdr');
        this.orbit = new OrbitControls(this.camera, this.renderer.domElement);
        this.orbit.minDistance=40;
        this.orbit.maxDistance=40;
        // this.orbit.maxPolarAngle = Math.PI/2.1
        // this.orbit.minPolarAngle = Math.PI/2.5
        this.orbit.target.set(0,0,0);
        this.orbit.autoRotate = false;
        this.orbit.autoRotateSpeed = 1.9;
        this.orbit.enablePan = true;
        this.orbit.screenSpacePanning = false;
        this.orbit.update();

        this.orbit.addEventListener('change', this.render.bind(this));

        window.addEventListener('resize', this.onWindowResize.bind(this), false);


       const ambientLight = new THREE.AmbientLight(0xaa54f0, 2);

       const directionalLight1 = new THREE.DirectionalLight(0xffffff, 1);
       directionalLight1.position.set(-2, 2, 5);

       const directionalLight2 = new THREE.DirectionalLight(0xfff000, 1);
       directionalLight2.position.set(-2, 4, 4);

       this.scene.add(ambientLight, directionalLight1, directionalLight2);

    }
    animate() {
        delta += clock.getDelta();
        requestAnimationFrame(this.animate.bind(this));

        var timer = 0.0001 * Date.now();
        if (delta > interval) {
            //this.orbit.update();

            if(particleSystem)
            {for (var i = 0, il = particleSystem.length; i < il; i++) {

                var particle = particleSystem[i];

                particle.position.x = 100 * Math.cos(timer + i* 1.08);
                particle.position.y = 100 * Math.sin(timer + i );
                // particle.position.z = 100 * Math.sin(timer - i * 1.01);

            }
            for (const particle of particleSystem) {
                particle.rotation.x += Math.random() * 0.01;
                particle.rotation.y += Math.random() * 0.02;
                particle.rotation.z += Math.random() * 0.03;


            }}
                this.render();
            delta = delta % interval;
        }
    }
    onWindowResize() {
        this.camera.aspect = this.container.offsetWidth / this.container.offsetHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.container.offsetWidth, this.container.offsetHeight);
        this.render();
    }
    render() {this.renderer.render(this.scene, this.camera);}
}

const generateTexture = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 2;
    canvas.height = 2;
  
    const context = canvas.getContext("2d");
    context.fillStyle = "white";
    context.fillRect(0, 1, 2, 1);
  
    return canvas;
  };
  const bubbleTexture = new THREE.CanvasTexture(generateTexture());


let interval = 1 / 45, delta = 0, clock = new THREE.Clock();
var loader = new GLTFLoader( FNmanager());
var loaderDRACO = new DRACOLoader();
loaderDRACO.setDecoderPath('./js/decoder/');
loader.setDRACOLoader(loaderDRACO);

// export async function LoadModel(model, _thisScene) {
//     _("loader_spiner").style.display = "block";

//     return loader.load('asset/' + model, function (object) {
//         var SceneGLB = object.scene;
//         SceneGLB.name = String(model)
//         SceneGLB.position.set(0,0,0)
//         SceneGLB.traverse(async function (child) {
//             if (child.isMesh)
//             {
//                 child.castShadow = true;
//                 child.receiveShadow= true;
//                 if(child.name ==="bubble"){
//                     child.material = new THREE.MeshPhysicalMaterial({
//                         color: 0x21024f,
//                         metalness: 0,
//                         roughness: 0,
//                         alphaMap: bubbleTexture,
//                         alphaTest: 0.5,
//                         envMapIntensity: 2,
//                         depthWrite: false,
//                         transmission: 0,
//                         opacity:0.7,
//                         transparent: true,
//                         blending: THREE.AdditiveBlending,
//                         side:THREE.BackSide
//                       });
//                 }
//             }
//         })
//         _thisScene.add(SceneGLB)
//     })
// }
    let particleSystem
    export async function Particules(model, _thisScene) {
        _("loader_spiner").style.display = "block";
        return loader.load('asset/' + model, function (object) {
            var SceneGLB = object.scene;
            SceneGLB.name = String(model)
            SceneGLB.traverse(async function (child) {
                if (child.isMesh)
                {
                    child.castShadow = true;
                    child.receiveShadow= true;
                    if(child.name ==="bubble-exter"){
                        child.material = new THREE.MeshPhysicalMaterial({
                            color: 0x21024f,
                            metalness: 0,
                            roughness: 0,
                            alphaMap: bubbleTexture,
                            alphaTest: 0.5,
                            envMapIntensity: 5,
                            depthWrite: false,
                            transmission: 0,
                            opacity:0.85,
                            transparent: true,
                            blending: THREE.AdditiveBlending,
                            side:THREE.BackSide
                        });
                    }
                    if(child.name ==="bubble-inter"){
                        child.material = new THREE.MeshPhysicalMaterial({
                            color: 0x21024f,
                            metalness: 0,
                            roughness: 0,
                            alphaMap: bubbleTexture,
                            alphaTest: 0.5,
                            envMapIntensity: 5,
                            depthWrite: false,
                            transmission: 0,
                            opacity:.65,
                            transparent: true,
                            blending: THREE.AdditiveBlending,
                            side:THREE.BackSide
                        });
                    }
                }
            })
            const particlesCount = 100; // Number of particles
            const particles = [];
            for (let i = 0; i < particlesCount; i++) {
                const instance = SceneGLB.clone();
                instance.position.set(Math.random() * 600 - 300,Math.random() * 600 - 300,Math.random() * 600 - 300)
                instance.scale.x = instance.scale.y = instance.scale.z = Math.random() * 2.5 + .1;
                if (instance.getObjectByName("Soap") && Math.random() < 0.5) {
                    instance.getObjectByName("Soap").visible = false;
                }
                particles.push(instance);
                _thisScene.add(instance);
            }
            particleSystem = particles;
        })
    }

export function FNmanager() {
    var manager = new THREE.LoadingManager();
    manager.onLoad = async function () { //console.log("loaded");
    _("loader_spiner").style.display = "none";
};
    manager.onProgress = function (url, itemsLoaded, itemsTotal) {
        _("loader_spiner").style.display = "block";
        // let percentComplete = itemsLoaded / itemsTotal * 100;
        // _("loadertxt").innerText =Math.round( percentComplete, 2 )+'%';
        // console.log("chargement terminer : " + url, "--->", itemsLoaded, "/", itemsTotal);
    };
    manager.onError = function (url) {
        console.error("--->Erreur de chargement :--->");
        console.log(url);
    };
    return manager
}
async function loadEnvironmentHDR(renderer, scene, hdr) {
    var loaderhdr = new RGBELoader().setDataType(THREE.UnsignedByteType).setPath('./img/env/').load(hdr, function (texture) {
        const pmremGenerator = new THREE.PMREMGenerator(renderer);
        var envMap_hdr = pmremGenerator.fromEquirectangular(loaderhdr);
        pmremGenerator.compileEquirectangularShader();
        texture.dispose();
        pmremGenerator.dispose();
        scene.environment = envMap_hdr.texture;
        //scene.background = envMap_hdr.texture;
    });
}

export function LoadTextures(texture, repeat) {
    var tex = new THREE.TextureLoader(FNmanager()).load('img/' + texture, function (img) {
        //console.log( 'Texture dimensions: %sx%s', img.image.width, img.image.height );
        //console.log( 'image source: ', img.image.src);
        //imgSrc = img.image.src
        //  console.log( 'image source: '+ imgSrc);
    });
    tex.encoding = THREE.sRGBEncoding;
    tex.flipY = false;
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.x = tex.repeat.y = repeat
    tex.center.set(.5, .5);
    return tex
}
export async function textureLoader(url,mat) {
    return new Promise((resolve, reject) => {
        const texture = new THREE.TextureLoader().load( url,
        async function (texture) {
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.flipY = false;
            texture.repeat.set( 1,1 );
            mat.alphaMap = texture;
            mat.transparent = true;
        resolve()
    }
        ,
        xhr => {
          console.log(`parts ${Math.floor((xhr.loaded / xhr.total) * 100)}% loaded`);
        },
        err => {
          reject(new Error(err));
        }
      );
    });
  }

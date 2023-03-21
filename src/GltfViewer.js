import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';
import { InteractionManager } from 'three.interactive';

function GLBViewer({ src, frontText, backText, qrCodeValue }) {
    const containerRef = useRef(null);
    const canvasRef = useRef(null);
    var photoMesh
    useEffect(() => {
        if (!src) return;

        let group, textMesh1, textMesh2, textMaterial;

        // Create a new Three.js renderer and attach it to the canvas element
        const renderer = new THREE.WebGLRenderer({
            canvas: canvasRef.current,
            alpha: true,
        });
        renderer.setSize(
            containerRef.current.clientWidth,
            containerRef.current.clientHeight
        );
        renderer.setPixelRatio(containerRef.current.offsetWidth / containerRef.current.offsetHeight);
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.outputEncoding = THREE.sRGBEncoding;

        // Create a new Three.js scene
        const pmremGenerator = new THREE.PMREMGenerator(renderer);
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xf0f0f0);
        scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;

        // Create a new Three.js camera
        const camera = new THREE.PerspectiveCamera(
            30,
            containerRef.current.offsetWidth / containerRef.current.offsetHeight,
            30,
            5000
        );
        camera.position.set(300, 0, 200);

        const videoRef = document.getElementById('video');
        videoRef.src = 'models/lighting.mp4';
        var isPlaying = videoRef.currentTime > 0 && !videoRef.paused && !videoRef.ended
            && videoRef.readyState > videoRef.HAVE_CURRENT_DATA;
        if (!isPlaying)
            videoRef.play();

        const texture = new THREE.VideoTexture(videoRef);

        const material = new THREE.MeshMatcapMaterial({ map: texture });

        const interactionManager = new InteractionManager(
            renderer,
            camera,
            renderer.domElement
        );

        // Load the glTF file using the GLTFLoader from Three.js
        const loader = new GLTFLoader();
        loader.load(src, (gltf) => {
            // Add the loaded model to the scene
            // const parrotPosition = new THREE.Vector3(0, 0, 0);
            var allMesh;
            gltf.parser.getDependencies('mesh').then((mesh) => {
                allMesh = mesh
                console.log(mesh.map(item => item.name))
                mesh.find(item => item.name === "video_back001").material = material
                mesh.find(item => item.name === "video_front001").material = material
                // material.opa
                textMaterial = mesh.find(item => item.name === "qr001").material.clone();

                mesh.find(item => item.name == 'text001').visible = false;
                // change avatar from a image
                var map = new THREE.TextureLoader().load("sprite.jpg");
                var mapMaterial = new THREE.MeshBasicMaterial({ map: map });
                // find photo mesh
                photoMesh = mesh.find(item => item.name === "photo001")

                mapMaterial.transparent = false;
                mapMaterial.blending = THREE.NormalBlending
                // replace material 
                photoMesh.material = mapMaterial

                var logoMesh = mesh.find(item => item.name === 'nft_frame001');

                mesh.find(item => item.name === 'qr001').visible = false
                createText();

                interactionManager.add(logoMesh);

                logoMesh.addEventListener('mousedown', (event) => { alert('test') })
                // window.removeEventListener('click', onDocumentMouseDown, false)
            })

            const model = gltf.scene.children[0]
            model.scale.set(10, 10, 10);

            var box = new THREE.Box3().setFromObject(model)

            const vector = new THREE.Vector3();
            box.getCenter(vector);
            model.position.set(-vector.x, -vector.y, -vector.z)
            group = new THREE.Group();
            scene.add(group);
            // interactionManager.update();
            // group.rotation.y = Math.PI / 2
            group.add(model)
            animate(model)

            // add svg file
            addQRCode();
        });

        function addQRCode() {
            const loader = new SVGLoader();

            // load qr code svg resource;
            loader.load(
                // `http://localhost:4000/api/qrcode/${qrCodeValue}`, function (data) {
                `/models/qr1.svg`, function (data) {
                    console.log({ data })
                    const paths = data.paths;

                    const qrGroup1 = new THREE.Group();

                    for (let i = 0; i < paths.length; i++) {
                        // if()
                        const path = paths[i];
                        if (path.userData.node.nodeName === 'path') {
                            const shapes = SVGLoader.createShapes(path);

                            for (let j = 0; j < shapes.length; j++) {

                                const shape = shapes[j];
                                // const geometry = new THREE.ShapeGeometry(shape);
                                const geometry = new THREE.ExtrudeGeometry(shape, {
                                    depth: 20,
                                    bevelEnabled: false
                                })
                                const mesh = new THREE.Mesh(geometry, textMaterial);
                                mesh.scale.set(0.05, 0.05, 0.05)
                                // // let measure = new THREE.Vector3();
                                // // const box = mesh.getSize(measure);
                                // // console.log(measure)
                                mesh.rotation.x = Math.PI

                                mesh.position.z = 2.2
                                mesh.position.x = 18
                                mesh.position.y = -30
                                mesh.name = 'qr-1'
                                qrGroup1.add(mesh);
                                qrGroup1.name = 'qr-1'
                            }
                        }
                    }

                    // scene.add(group);
                    group.add(qrGroup1)
                }
            )

            // load qr code svg resource;
            loader.load(
                '/models/qr2-1.svg', function (data) {
                    const paths = data.paths;
                    console.log({ data })
                    const qrGroup1 = new THREE.Group();

                    for (let i = 0; i < paths.length; i++) {

                        const path = paths[i];

                        const shapes = SVGLoader.createShapes(path);

                        for (let j = 0; j < shapes.length; j++) {

                            const shape = shapes[j];

                            const geometry = new THREE.ExtrudeGeometry(shape, {
                                depth: 20,
                                bevelEnabled: false
                            })
                            const mesh = new THREE.Mesh(geometry, textMaterial);
                            mesh.scale.set(0.03, 0.03, 0.02)

                            mesh.rotation.z = Math.PI

                            mesh.position.z = -2.2
                            mesh.position.x = -12
                            mesh.position.y = -29

                            qrGroup1.add(mesh);

                        }

                    }

                    // scene.add(group);
                    group.add(qrGroup1)
                }
            )

            // load qr code svg resource;
            loader.load(
                `http://localhost:4000/api/qrcode/${qrCodeValue}`, function (data) {
                    console.log({ data })
                    const paths = data.paths;

                    const qrGroup = new THREE.Group();

                    for (let i = 0; i < paths.length; i++) {
                        // if()
                        const path = paths[i];
                        if (path.userData.node.nodeName === 'path') {
                            const shapes = SVGLoader.createShapes(path);

                            for (let j = 0; j < shapes.length; j++) {

                                const shape = shapes[j];
                                // const geometry = new THREE.ShapeGeometry(shape);
                                const geometry = new THREE.ExtrudeGeometry(shape, {
                                    depth: 20,
                                    bevelEnabled: false
                                })
                                const mesh = new THREE.Mesh(geometry, textMaterial);
                                mesh.scale.set(0.05, 0.05, 0.05)
                                // // let measure = new THREE.Vector3();
                                // // const box = mesh.getSize(measure);
                                // // console.log(measure)
                                mesh.rotation.z = Math.PI

                                mesh.position.z = -2.2
                                mesh.position.x = -14.25
                                mesh.position.y = -30
                                mesh.name = 'qr-3'
                                qrGroup.add(mesh);
                            }
                        }
                    }

                    // scene.add(group);
                    group.add(qrGroup)
                }
            )
        }

        function createText() {
            group.remove(textMesh1)
            group.remove(textMesh2)
            const loader = new FontLoader();
            loader.load('fonts/optimer_bold.typeface.json', function (font) {
                let textGeo = new TextGeometry(frontText, {

                    font: font,

                    size: 2,
                    height: 2.1,

                    bevelThickness: 2,

                });

                // Create a material with the desired color
                const textMaterial1 = new THREE.MeshBasicMaterial({ color: 0x000000 });
                console.log({ textMaterial })
                textMesh1 = new THREE.Mesh(textGeo, textMaterial1);
                textGeo.computeBoundingBox();

                textMesh1.position.x = -30;
                textMesh1.position.y = -33;
                textMesh1.position.z = 0;

                // create back side text mesh
                textGeo = new TextGeometry(backText, {

                    font: font,

                    size: 2,
                    height: 2.1,

                    bevelThickness: 2,

                });

                const textMaterial2 = new THREE.MeshBasicMaterial({ color: 0x000000 });

                textMesh2 = new THREE.Mesh(textGeo, textMaterial2);

                textMesh2.rotation.x = Math.PI
                textMesh2.rotation.y = Math.PI * 2
                textMesh2.rotation.z = Math.PI

                textMesh2.position.x = 30;
                textMesh2.position.y = -33;
                textMesh2.position.z = 0

                group.add(textMesh1)
                group.add(textMesh2)
            })

        }

        function animate() {
            requestAnimationFrame(() => animate());
            // group.rotateY(0.01)

            renderer.render(scene, camera)
            interactionManager.update();
        }

        // Add some lights to the scene
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight.position.set(10, 10, 10);
        scene.add(directionalLight);

        // Set the camera position and look at the center of the scene
        camera.position.z = 5;
        camera.lookAt(new THREE.Vector3(0, 0, 0));

        new OrbitControls(camera, containerRef.current)

        // Clean up Three.js objects on unmount
        return () => {
            renderer.dispose();
            // interactionManager.update();
            //   loader.dispose();
            //   scene.dispose();
        };
    }, [src, frontText, backText, qrCodeValue]);

    const onChangeHandle = (e) => {
        console.log(e)
        var userImage = e.target.files[0];

        var userImageUrl = URL.createObjectURL(userImage);

        var loader = new THREE.TextureLoader();
        loader.setCrossOrigin("");
        // var texture = loader.load(userImageURL);

        var map = new THREE.TextureLoader().load(userImageUrl);
        var mapMaterial = new THREE.MeshBasicMaterial({ map: map });
        // find photo mesh
        // photoMesh = mesh.find(item => item.name === "photo001")

        mapMaterial.transparent = false;
        mapMaterial.blending = THREE.NormalBlending
        // replace material 
        photoMesh.material = mapMaterial
    }

    return (
        <>
            <input type={"file"} accept=".jpg,.png" onChange={onChangeHandle} />
            <div ref={containerRef} style={{ width: '100vw', height: '100vh' }}>
                <canvas ref={canvasRef} />
            </div>
        </>
    );
}

export default GLBViewer;

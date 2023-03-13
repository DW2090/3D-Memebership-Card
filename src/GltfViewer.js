import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
// import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';

function GLBViewer({ src, frontText, backText }) {
    const containerRef = useRef(null);
    const canvasRef = useRef(null);

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
        camera.position.set(-300, 0, 200);

        const videoRef = document.getElementById('video');
        videoRef.src = 'models/lighting.mp4';
        videoRef.play();

        const texture = new THREE.VideoTexture(videoRef);

        const material = new THREE.MeshMatcapMaterial({ map: texture });


        // Load the glTF file using the GLTFLoader from Three.js
        const loader = new GLTFLoader();
        loader.load(src, (gltf) => {
            // Add the loaded model to the scene
            // const parrotPosition = new THREE.Vector3(0, 0, 0);

            gltf.parser.getDependencies('mesh').then((mesh) => {
                mesh.find(item => item.name === "video_back_1").material = material
                mesh.find(item => item.name === "video_front_1").material = material
                // material.opa
                textMaterial = mesh.find(item => item.name === "qr_1").material;
                mesh[7].visible = false;
                mesh.find(item => item.name === 'qr_1').visible = false
                createText();
            })

            const model = gltf.scene.children[0]
            model.scale.set(10, 10, 10);

            var box = new THREE.Box3().setFromObject(model)

            const vector = new THREE.Vector3();
            box.getCenter(vector);
            model.position.set(-vector.x, -vector.y, -vector.z)
            group = new THREE.Group();
            scene.add(group);
            group.add(model)
            animate(model)

            // add svg file
            addQRCode();
        });

        function addQRCode() {
            const loader = new SVGLoader();

            // load qr code svg resource;
            loader.load(
                '/models/qr1.svg', function (data) {
                    const paths = data.paths;

                    const qrGroup1 = new THREE.Group();

                    for (let i = 0; i < paths.length; i++) {

                        const path = paths[i];

                        const shapes = SVGLoader.createShapes(path);

                        for (let j = 0; j < shapes.length; j++) {

                            const shape = shapes[j];
                            // const geometry = new THREE.ShapeGeometry(shape);
                            const geometry = new THREE.ExtrudeGeometry(shape, {
                                depth: 20,
                                bevelEnabled: false
                            })
                            const mesh = new THREE.Mesh(geometry, textMaterial);
                            mesh.scale.set(0.03, 0.03, 0.02)
                            // let measure = new THREE.Vector3();
                            // const box = mesh.getSize(measure);
                            // console.log(measure)
                            mesh.position.z = 1.7
                            mesh.position.x = 13
                            mesh.position.y = -45
                            // mesh.name = 'qr-1'
                            qrGroup1.add(mesh);
                            qrGroup1.name = 'qr-1' 
                        }

                    }

                    // scene.add(group);
                    group.add(qrGroup1)
                }
            )

            // load qr code svg resource;
            loader.load(
                '/models/qr2.svg', function (data) {
                    const paths = data.paths;

                    const qrGroup1 = new THREE.Group();

                    for (let i = 0; i < paths.length; i++) {

                        const path = paths[i];

                        const shapes = SVGLoader.createShapes(path);

                        for (let j = 0; j < shapes.length; j++) {

                            const shape = shapes[j];
                            // const geometry = new THREE.ShapeGeometry(shape);
                            const geometry = new THREE.ExtrudeGeometry(shape, {
                                depth: 20,
                                bevelEnabled: false
                            })
                            const mesh = new THREE.Mesh(geometry, textMaterial);
                            mesh.scale.set(0.03, 0.03, 0.02)
                            // Reverse object to show back side
                            // mesh.rotation.x = Math.PI
                            // mesh.rotation.y = Math.PI * 2
                            mesh.rotation.z = Math.PI

                            mesh.position.z = -2.1
                            mesh.position.x = -12
                            mesh.position.y = -29

                            qrGroup1.add(mesh);

                        }

                    }

                    // scene.add(group);
                    group.add(qrGroup1)
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
                    height: 2,

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
                    height: 2,

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
            group.rotateY(0.01)

            renderer.render(scene, camera)
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

        // const control = new OrbitControls(camera, containerRef.current)

        // Clean up Three.js objects on unmount
        return () => {
            renderer.dispose();
            //   loader.dispose();
            //   scene.dispose();
        };
    }, [src, frontText, backText]);

    return (
        <div ref={containerRef} style={{ width: '100vw', height: '100vh' }}>
            <canvas ref={canvasRef} />
        </div>
    );
}

export default GLBViewer;

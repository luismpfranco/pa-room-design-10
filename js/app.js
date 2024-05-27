document.addEventListener('DOMContentLoaded', () => {
    const objectSelect = document.getElementById('primitiveSelect');
    const addPrimitiveButton = document.getElementById('addPrimitive');
    const addModelButton = document.getElementById('addModel');
    const removeObjectButton = document.getElementById('removeObject');
    const translateObjectButton = document.getElementById('translateObject');
    const resizeObjectButton = document.getElementById('resizeObject');
    const changeColorButton = document.getElementById('changeColor');
    const rotateObjectButton = document.getElementById('rotateObject');
    const addLightButton = document.getElementById('addLight');

    addPrimitiveButton.addEventListener('click', addPrimitive);
    addModelButton.addEventListener('click', addModel);
    removeObjectButton.addEventListener('click', removeObject);
    translateObjectButton.addEventListener('click', translateObject);
    resizeObjectButton.addEventListener('click', resizeObject);
    changeColorButton.addEventListener('click', changeColor);
    rotateObjectButton.addEventListener('click', rotateObject);
    addLightButton.addEventListener('click', addLight);

    if (!objectSelect) {
        console.error('Element with id "primitiveSelect" not found.');
        return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(800, 800);
    renderer.setClearColor(0xffffff, 1);
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    const objects = [];

    const maxPrimitives = 10;
    let currentPrimitives = 0;
    let currentModels = 0;
    const cubeSize = 2;

    camera.position.set(5, 0, 1);
    camera.lookAt(0, 0, 0);

    function createMesh(color) {
        const material = new THREE.MeshBasicMaterial({ color: color });
        const vertices = new Float32Array([
            -2, -2,  2, // 0
            2, -2,  2, // 1
            2, -2, -2, // 2
            -2, -2, -2, // 3
            -2,  2, -2, // 4
            2,  2, -2, // 5
            -2,  2,  2, // 6,
        ]);
        const indices = [
            0, 1, 2,
            0, 2, 3,
            3, 2, 5,
            3, 5, 4,
            0, 3, 4,
            0, 4, 6
        ];
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
        geometry.setIndex(indices);
        geometry.computeVertexNormals();
        const mesh = new THREE.Mesh(geometry, material);
        const cubeEdges = new THREE.EdgesGeometry(geometry);
        const cubeLineMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
        const cubeLineSegments = new THREE.LineSegments(cubeEdges, cubeLineMaterial);
        mesh.add(cubeLineSegments);
        mesh.rotation.y = Math.PI / 2.5;
        return mesh;
    }

    function createBox(width, height, depth, color) {
        const geometry = new THREE.BoxGeometry(width, height, depth);
        const material = new THREE.MeshBasicMaterial({ color: color });
        const box = new THREE.Mesh(geometry, material);

        const edges = new THREE.EdgesGeometry(geometry);
        const lineMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
        const lineSegments = new THREE.LineSegments(edges, lineMaterial);
        box.add(lineSegments);
        box.rotation.y = Math.PI / 2.5;

        return box;
    }

    function createParallelepiped(width, height, depth, color) {
        const geometry = new THREE.BoxGeometry(width, height, depth);
        geometry.computeVertexNormals();
        const material = new THREE.MeshLambertMaterial({ color: color });
        const parallelepiped = new THREE.Mesh(geometry, material);

        const edges = new THREE.EdgesGeometry(geometry);
        const lineMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
        const lineSegments = new THREE.LineSegments(edges, lineMaterial);
        parallelepiped.add(lineSegments);

        return parallelepiped;
    }

    function clampPosition(position, width, height, depth) {
        const halfWidth = width / 2;
        const halfHeight = height / 2;
        const halfDepth = depth / 2;

        const minPosition = {
            x: -cubeSize / 2 + halfWidth,
            y: -cubeSize / 2 + halfHeight,
            z: -cubeSize / 2 + halfDepth
        };

        const maxPosition = {
            x: cubeSize / 2 - halfWidth,
            y: cubeSize / 2 - halfHeight,
            z: cubeSize / 2 - halfDepth
        };

        return {
            x: Math.min(Math.max(position.x, minPosition.x), maxPosition.x),
            y: Math.min(Math.max(position.y, minPosition.y), maxPosition.y),
            z: Math.min(Math.max(position.z, minPosition.z), maxPosition.z)
        };
    }

    let selectedObject = null;

    function addPrimitive() {
        if (currentPrimitives >= maxPrimitives) {
            alert('Maximum primitives');
            return;
        }

        const type = document.getElementById('primitiveType').value;
        const width = parseFloat(document.getElementById('width').value) || 1;
        const height = parseFloat(document.getElementById('height').value) || 1;
        const depth = parseFloat(document.getElementById('depth').value) || 1;
        const color = document.getElementById('exampleColorInput').value;
        const posX = parseFloat(document.getElementById('posX').value) || 0;
        const posY = parseFloat(document.getElementById('posY').value) || 0;
        const posZ = parseFloat(document.getElementById('posZ').value) || 0;
        const rotX = parseFloat(document.getElementById('rotX').value) || 0;
        const rotY = parseFloat(document.getElementById('rotY').value) || 0;
        const rotZ = parseFloat(document.getElementById('rotZ').value) || 0;

        const position = clampPosition({ x: posX, y: posY, z: posZ }, width, height, depth);

        let primitive;
        if (type === 'cube') {
            primitive = createBox(width, height, depth, color);
        } else if (type === 'parallelepiped') {
            primitive = createParallelepiped(width, height, depth, color);
        }

        primitive.position.set(position.x, position.y, position.z);
        primitive.rotation.set(rotX, rotY, rotZ);

        const boundingBox = new THREE.Box3().setFromObject(primitive);
        if (!boundingBox.intersectsBox(new THREE.Box3().setFromObject(mesh))) {
            alert('Primitive out of bounds');
            return;
        }

        scene.add(primitive);
        objects.push(primitive);
        currentPrimitives++;

        const option = document.createElement('option');
        option.value = primitive.id;
        if(type === 'cube'){
            option.textContent = `Cub${primitive.id}`;
        }
        else if(type === 'parallelepiped'){
            option.textContent = `Par${primitive.id}`;
        }
        objectSelect.appendChild(option);
    }

    let mesh = createMesh(0x808080);
    let meshGroup = new THREE.Group();
    meshGroup.add(mesh);
    scene.add(meshGroup);
    objects.push(mesh);

    async function addModel() {
        if (currentModels >= 5) {
            alert('Maximum models reached');
            return;
        }

        const fileInput = document.getElementById('file');
        const file = fileInput.files[0];
        const fileName = file.name.split('.')[0];

        if (!file) {
            alert('Please select a file');
            return;
        }

        let image = new Image();
        const objText = await loadObjResource('../modelos/' + fileName + ".obj");
        const geometryData = parseOBJ(objText);
        let texture;
        await loadImage('../modelos/' + file.name).then((loadedImage) => {
            image = loadedImage;
            texture = configureTexture(image);
        }).catch((error) => {
            console.error('Error loading image:', error);
        });

        const geometry = new THREE.BufferGeometry();

        geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(geometryData.position), 3));
        geometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(geometryData.texcoord), 2));
        geometry.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(geometryData.normal), 3));

        const material = new THREE.MeshBasicMaterial({ map: texture });

        const obj = new THREE.Mesh(geometry, material);

        const posX = parseFloat(document.getElementById('posXModel').value) || 0;
        const posY = parseFloat(document.getElementById('posYModel').value) || 0;
        const posZ = parseFloat(document.getElementById('posZModel').value) || 0;

        const rotX = parseFloat(document.getElementById('rotXModel').value) || 0;
        const rotY = parseFloat(document.getElementById('rotYModel').value) || 0;
        const rotZ = parseFloat(document.getElementById('rotZModel').value) || 0;

        obj.position.set(posX, posY, posZ);
        obj.rotation.set(rotX, rotY, rotZ);

        switch(fileName){
            case "tiger":
                obj.scale.set(0.0005, 0.0005, 0.0005);
                break;
            case "Astronaut":
                obj.scale.set(0.3, 0.3, 0.3);
                break;
            case "trophy":
                obj.scale.set(0.03, 0.03, 0.03);
                break;
            case "bird":
                obj.scale.set(0.01, 0.01, 0.01);
                break;
            case "pig":
                obj.scale.set(0.01, 0.01, 0.01);
                break;
            case "cat":
                obj.scale.set(0.02, 0.02, 0.02);
                break;
        }
        scene.add(obj);
        objects.push(obj);
        currentModels++;

        const option = document.createElement('option');
        option.value = obj.id;
        option.textContent = `Mod${obj.id}`;
        objectSelect.appendChild(option);
    }

    function removeObject() {
        const selectedId = objectSelect.value;
        if(selectedId && selectedId !== mesh.id){
            const selectedObject = scene.getObjectById(parseInt(selectedId));
            scene.remove(selectedObject);
            objectSelect.remove(objectSelect.selectedIndex);
            currentPrimitives--;
        }
    }

    function translateObject() {
        const selectedId = objectSelect.value;
        if (selectedId && selectedId !== mesh.id) {
            const selectedObject = scene.getObjectById(parseInt(selectedId));
            const x = parseFloat(document.getElementById('changeX').value) || 0;
            const y = parseFloat(document.getElementById('changeY').value) || 0;
            const z = parseFloat(document.getElementById('changeZ').value) || 0;

            selectedObject.position.x += x;
            selectedObject.position.y += y;
            selectedObject.position.z += z;
        }
    }

    function resizeObject() {
        const selectedId = objectSelect.value;
        if (selectedId && selectedId !== mesh.id) {
            const selectedObject = scene.getObjectById(parseInt(selectedId));
            const width = parseFloat(document.getElementById('changeWidth').value) || 1;
            const height = parseFloat(document.getElementById('changeHeight').value) || 1;
            const depth = parseFloat(document.getElementById('changeDepth').value) || 1;
            selectedObject.scale.set(width, height, depth);
        }
    }

    function changeColor(){
        const selectedId = objectSelect.value;
        if(selectedId && selectedId !== mesh.id){
            const selectedObject = scene.getObjectById(parseInt(selectedId));
            const newColor = document.getElementById('changeColorInput').value;
            selectedObject.material.color.set(newColor);
        }
    }

    function rotateObject() {
        const selectedId = objectSelect.value;
        if (selectedId && selectedId !== mesh.id) {
            const selectedObject = scene.getObjectById(parseInt(selectedId));
            const rotX = parseFloat(document.getElementById('changeRotX').value) || 0;
            const rotY = parseFloat(document.getElementById('changeRotY').value) || 0;
            const rotZ = parseFloat(document.getElementById('changeRotZ').value) || 0;
            selectedObject.rotation.set(rotX, rotY, rotZ);
        }
    }

    const lightTypeSelect = document.getElementById('lightType');
    const illuminationTypeSelect = document.getElementById('illuminationType');

    function addLight(){
        const lightType = lightTypeSelect.value;
        const illuminationType = illuminationTypeSelect.value

        const dirX = parseFloat(document.getElementById('lightDirX').value) || 0;
        const dirY = parseFloat(document.getElementById('lightDirY').value) || 0;
        const dirZ = parseFloat(document.getElementById('lightDirZ').value) || 0;
        const colorR = parseInt(document.getElementById('lightColorR').value) || 251;
        const colorG = parseInt(document.getElementById('lightColorG').value) || 255;
        const colorB = parseInt(document.getElementById('lightColorB').value) || 0;

        const lightColor = new THREE.Color(`rgb(${colorR}, ${colorG}, ${colorB})`);
        let light;

        if (lightType === 'ambient') {
            light = new THREE.AmbientLight(lightColor);
        } else if (lightType === 'directional') {
            light = new THREE.DirectionalLight(lightColor);
            light.position.set(
                parseFloat(document.getElementById('lightPosX').value) || 0,
                parseFloat(document.getElementById('lightPosY').value) || 0,
                parseFloat(document.getElementById('lightPosZ').value) || 0
            );
            const target = new THREE.Object3D();
            target.position.set(dirX, dirY, dirZ);
            light.target = target;
        }

        scene.add(light);
        applyIlluminationType(illuminationType);
    }

    function applyIlluminationType(type) {
        switch (type) {
            case 'phong':
                objects.forEach(object => {
                    object.material = new THREE.MeshPhongMaterial({ color: object.material.color });
                });
                break;
            case 'ambient':
                scene.add(new THREE.AmbientLight(0xffffff, 0.5));
                break;
            case 'diffuse':
                objects.forEach(object => {
                    object.material = new THREE.MeshLambertMaterial({ color: object.material.color });
                });
                break;
            case 'specular':
                objects.forEach(object => {
                    object.material = new THREE.MeshPhongMaterial({ color: object.material.color, specular: 0x555555 });
                });
                break;
            default:
                console.error('Unknown illumination type:', type);
        }
    }

    renderer.domElement.addEventListener('click', onClick, false);
    renderer.domElement.addEventListener('mousedown', onClick, false);
    function onClick(event) {
        event.preventDefault();

        const mouse = new THREE.Vector2();
        mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
        mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;

        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, camera);

        const intersects = raycaster.intersectObjects(scene.children, true);

        if (intersects.length > 0) {
            selectedObject = intersects[0].object;

            if (selectedObject instanceof THREE.LineSegments && selectedObject !== mesh) {
                selectedObject = selectedObject.parent;
            }

            const boundingBox = new THREE.Box3().setFromObject(mesh);
            if (!boundingBox.containsPoint(selectedObject.position)) {
                selectedObject = null;
            }
        } else {
            selectedObject = null;
        }
    }

    function handleKeyPress(event) {
        const moveDistance = 0.1;

        if (selectedObject && selectedObject !== mesh) {
            switch (event.key) {
                case "ArrowLeft":
                    selectedObject.position.x -= moveDistance;
                    break;
                case "ArrowUp":
                    selectedObject.position.z += moveDistance;
                    break;
                case "ArrowRight":
                    selectedObject.position.x += moveDistance;
                    break;
                case "ArrowDown":
                    selectedObject.position.z -= moveDistance;
                    break;
                case "9":
                    selectedObject.position.y += moveDistance;
                    break;
                case "3":
                    selectedObject.position.y -= moveDistance;
                    break;
            }
        } else {
            switch (event.key) {
                case "ArrowLeft":
                case "a":
                case "A":
                    moveCamera(-moveDistance, 0, 0);
                    break;
                case "ArrowRight":
                case "d":
                case "D":
                    moveCamera(moveDistance, 0, 0);
                    break;
                case "ArrowUp":
                case "w":
                case "W":
                    moveCamera(0, 0, -moveDistance);
                    break;
                case "ArrowDown":
                case "s":
                case "S":
                    moveCamera(0, 0, moveDistance);
                    break;
                case "q":
                case "Q":
                    moveCamera(0, moveDistance, 0);
                    break;
                case "r":
                case "R":
                    moveCamera(0, -moveDistance, 0);
                    break;
            }
        }
    }

    function moveCamera(x, y, z) {
        camera.position.x += x;
        camera.position.y += y;
        camera.position.z += z;
        camera.lookAt(scene.position.x, scene.position.y, scene.position.z);
    }

    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableZoom = true;

    document.addEventListener('keydown', function (event) {
        switch (event.key) {
            case 'w':
            case 'W':
                camera.position.z -= 0.1;
                break;
            case 's':
            case 'S':
                camera.position.z += 0.1;
                break;
            case 'a':
            case 'A':
                camera.position.x -= 0.1;
                break;
            case 'd':
            case 'D':
                camera.position.x += 0.1;
                break;
        }
    });

    document.addEventListener('keydown', handleKeyPress);

    function render(){
        requestAnimationFrame(render);
        renderer.render(scene, camera);
    }
    render();

    async function loadObjResource(location){
        const response = await fetch(location);
        return await response.text();
    }

    function loadImage(location) {
        return new Promise((resolve, reject) => {
            const image = new Image();
            image.onload = function () {
                resolve(image);
            }
            image.onerror = function (error) {
                reject(error);
            }
            image.src = location;
        });
    }

    function parseOBJ(text) {
        const objPositions = [[0, 0, 0]];
        const objTextureCoords = [[0, 0]];
        const objNormals = [[0, 0, 0]];

        const objVertexData = [
            objPositions,
            objTextureCoords,
            objNormals,
        ];

        let webglVertexData = [
            [],   // positions
            [],   // texture coords
            [],   // normals
        ];

        function addVertex(vert) {
            const ptn = vert.split('/');
            ptn.forEach((objIndexStr, i) => {
                if (!objIndexStr) {
                    return;
                }
                const objIndex = parseInt(objIndexStr);
                const index = objIndex + (objIndex >= 0 ? 0 : objVertexData[i].length);
                webglVertexData[i].push(...objVertexData[i][index]);
            });
        }

        const keywords = {
            v(parts) {
                objPositions.push(parts.map(parseFloat));
            },
            vn(parts) {
                objNormals.push(parts.map(parseFloat));
            },
            vt(parts) {
                objTextureCoords.push(parts.map(parseFloat));
            },
            f(parts) {
                const numTriangles = parts.length - 2;
                for (let tri = 0; tri < numTriangles; ++tri) {
                    addVertex(parts[0]);
                    addVertex(parts[tri + 1]);
                    addVertex(parts[tri + 2]);
                }
            },
        };

        const keywordRE = /(\w*)(?: )*(.*)/;
        const lines = text.split('\n');
        for (let lineNo = 0; lineNo < lines.length; ++lineNo) {
            const line = lines[lineNo].trim();
            if (line === '' || line.startsWith('#')) {
                continue;
            }
            const m = keywordRE.exec(line);
            if (!m) {
                continue;
            }
            const [, keyword, unparsedArgs] = m;
            const parts = line.split(/\s+/).slice(1);
            const handler = keywords[keyword];
            if (!handler) {
                console.warn('unhandled keyword:', keyword);
                continue;
            }
            handler(parts, unparsedArgs);
        }

        return {
            position: webglVertexData[0],
            texcoord: webglVertexData[1],
            normal: webglVertexData[2],
        };
    }

    function configureTexture(image) {
        const texture = new THREE.Texture();

        texture.flipY = false;
        texture.image = image;
        texture.generateMipmaps = true;
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        texture.magFilter = THREE.NearestFilter;
        texture.needsUpdate = true;

        return texture;
    }
});

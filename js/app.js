document.addEventListener('DOMContentLoaded', () => {
    const objectSelect = document.getElementById('primitiveSelect');
    const addPrimitiveButton = document.getElementById('addPrimitive');
    const addModelButton = document.getElementById('addModel');
    const removeObjectButton = document.getElementById('removeObject');
    const translateObjectButton = document.getElementById('translateObject');
    const resizeObjectButton = document.getElementById('resizeObject');
    const changeColorButton = document.getElementById('changeColor');
    const rotateObjectButton = document.getElementById('rotateObject');

    if (!objectSelect) {
        console.error('Element with id "primitiveSelect" not found.');
        return;
    }

    addPrimitiveButton.addEventListener('click', addPrimitive);
    removeObjectButton.addEventListener('click', removeObject);
    translateObjectButton.addEventListener('click', translateObject);
    resizeObjectButton.addEventListener('click', resizeObject);
    changeColorButton.addEventListener('click', changeColor);
    rotateObjectButton.addEventListener('click', rotateObject);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(800, 800);
    renderer.setClearColor(0xffffff, 1);
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    const maxPrimitives = 10;
    let currentPrimitives = 0;
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

        return box;
    }

    function createParallelepiped(width, height, depth, color) {
        const geometry = new THREE.BoxGeometry(width, height, depth);
        const material = new THREE.MeshBasicMaterial({ color: color });
        const parallelepiped = new THREE.Mesh(geometry, material);

        const edges = new THREE.EdgesGeometry(geometry);
        const lineMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
        const lineSegments = new THREE.LineSegments(edges, lineMaterial);
        parallelepiped.add(lineSegments);

        return parallelepiped;
    }

    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);

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
            alert('Número máximo de primitivas atingido');
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
        const meshBoundingBox = new THREE.Box3().setFromObject(mesh);

        if (!meshBoundingBox.containsBox(boundingBox)) {
            alert('Primitiva fora do cubo maior');
            return;
        }

        scene.add(primitive);
        currentPrimitives++;

        if(!objectSelect){
            console.log('objectSelect', objectSelect);
        }

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
    let parallelepiped = createParallelepiped(1.5, 1, 0.5, 0x0000ff);
    scene.add(parallelepiped);

    function removeObject() {
        const selectedId = objectSelect.value;
        if(selectedId && selectedId !== mesh.id){
            const selectedObject = scene.getObjectById(parseInt(selectedId));
            scene.remove(selectedObject);
            objectSelect.remove(objectSelect.selectedIndex);
            currentPrimitives--;
        }
    }

    function translateObject(){
        const selectedId = objectSelect.value;
        if(selectedId && selectedId !== mesh.id){
            const selectedObject = scene.getObjectById(parseInt(selectedId));
            const x = parseFloat(document.getElementById('changeX').value) || 0;
            const y = parseFloat(document.getElementById('changeY').value) || 0;
            const z = parseFloat(document.getElementById('changeZ').value) || 0;
            selectedObject.position.set(x, y, z);
        }
    }

    function resizeObjects(){
        const selectedId = objectSelect.value;
        if(selectedId && selectedId !== mesh.id){
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
            const color = document.getElementById('changeColorInput').value;
            selectedObject.material.color.set(color);
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

    renderer.domElement.addEventListener('click', onClick, false);

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
        camera.lookAt(scene.position);
    }

    document.addEventListener('keydown', handleKeyPress);

    function render(){
        requestAnimationFrame(render);
        renderer.render(scene, camera);
    }
    render();
});

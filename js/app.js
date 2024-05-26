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
    const material = new THREE.MeshBasicMaterial({ color });
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
    scene.add(mesh);
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
}

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

let mesh = createMesh(0x808080);
parallelepiped = createParallelepiped(1.5, 1, 0.5, 0x0000ff);
scene.add(parallelepiped);
animate();


let selectedObject = null;

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

        if (selectedObject instanceof THREE.LineSegments) {
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

function removeObject() {
    if (selectedObject && selectedObject !== mesh) {
        scene.remove(selectedObject);
        selectedObject = null;
    }
}

function changeColor() {
    if (selectedObject && selectedObject !== mesh) {
        const selectedColor = document.getElementById('colorPicker').value;
        const newColor = new THREE.Color(selectedColor);
        selectedObject.material.color = newColor;
    }
}

function resizeObject() {
    let isResizing = false;

    document.getElementById('resizeObject').addEventListener('click', function() {
        isResizing = true;
    });

    renderer.domElement.addEventListener('click', function(event) {
        if (isResizing && selectedObject) {
            const direction = new THREE.Vector3().subVectors(mousePosition, selectedObject.position).normalize();

            const newPosition = new THREE.Vector3().copy(selectedObject.position).addScaledVector(direction, 0.1);

            const cubeSize = 2;
            const minPosition = new THREE.Vector3(-cubeSize / 2, -cubeSize / 2, -cubeSize / 2);
            const maxPosition = new THREE.Vector3(cubeSize / 2, cubeSize / 2, cubeSize / 2);
            newPosition.clamp(minPosition, maxPosition);

            selectedObject.position.copy(newPosition);
        }
    });

    renderer.domElement.addEventListener('mousemove', function(event) {
        if (isResizing) {
            const mouse = new THREE.Vector2();
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

            const raycaster = new THREE.Raycaster();
            raycaster.setFromCamera(mouse, camera);

            const intersection = raycaster.intersectObjects(scene.children, true)[0];
            if (intersection) {
                mousePosition.copy(intersection.point);
            }
        }
    });
}

function handleKeyPress(event) {
    if (!selectedObject) return;

    switch (event.keyCode) {
        case 37:
            selectedObject.position.x -= 0.1;
            break;
        case 38:
            selectedObject.position.y += 0.1;
            break;
        case 39:
            selectedObject.position.x += 0.1;
            break;
        case 40:
            selectedObject.position.y -= 0.1;
            break;
        case 33:
            selectedObject.position.z += 0.1;
            break;
        case 34:
            selectedObject.position.z -= 0.1;
            break;
    }
}

document.addEventListener('keydown', handleKeyPress);

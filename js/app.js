const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xffffff, 1);
document.body.appendChild(renderer.domElement);

// Adicionar chão e paredes
const material = new THREE.MeshBasicMaterial({ color: 0x808080 });
const vertices = new Float32Array([
    -2, -2,  2, // 0
    2, -2,  2, // 1
    2, -2, -2, // 2
    -2, -2, -2, // 3
    -2,  2, -2, // 4
    2,  2, -2, // 5
    -2,  2,  2, // 6
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

camera.position.set(6, 0, 0);
camera.lookAt(0, 0, 0);

let paralelepiped;
let paralelepipedEdges;

function createParallelepiped(width, height, depth, position, color) {
    const halfHeight = height / 2;
    const halfWidth = width / 2;
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

    const clampedPosition = {
        x: Math.min(Math.max(position.x, minPosition.x), maxPosition.x),
        y: Math.min(Math.max(position.y, minPosition.y), maxPosition.y),
        z: Math.min(Math.max(position.z, minPosition.z), maxPosition.z)
    };

    const geometry = new THREE.BoxGeometry(width, height, depth);
    const material = new THREE.MeshBasicMaterial({ color: color });
    const parallelepiped = new THREE.Mesh(geometry, material);
    parallelepiped.position.set(clampedPosition.x, clampedPosition.y + halfHeight, clampedPosition.z);
    scene.add(parallelepiped);

    // Adicionando bordas
    const edges = new THREE.EdgesGeometry(geometry);
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
    const lineSegments = new THREE.LineSegments(edges, lineMaterial);
    parallelepiped.add(lineSegments);

    return { parallelepiped, lineSegments };
}

const cubeSize = 2;
({ parallelepiped, lineSegments: paralelepipedEdges } = createParallelepiped(1.5, 1, 0.5, { x: 0, y: -2, z: -cubeSize + 0.5 / 2 + 0.01 }, 0x0000ff));

animate();

let selectedObject = null;

renderer.domElement.addEventListener('click', onClick, false);

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

function onClick(event) {
    event.preventDefault();

    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
        selectedObject = intersects[0].object;
    } else {
        selectedObject = null;
    }
}

function removeObject() {
    if (selectedObject && selectedObject !== mesh && selectedObject !== cubeLineSegments) {
        scene.remove(selectedObject);
        selectedObject = null;
    }
}

function changeColor() {
    let objectToChange = selectedObject;

    if (selectedObject instanceof THREE.LineSegments) {
        objectToChange = selectedObject.parent;
    }

    if (objectToChange && objectToChange !== mesh){
        const selectedColor = document.getElementById('colorPicker').value;
        const newColor = new THREE.Color(selectedColor);
        objectToChange.material.color = newColor;
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
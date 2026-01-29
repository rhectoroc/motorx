import { useEffect, useRef } from "react";
import * as THREE from "three";

const ThreeBackground = () => {
    const mountRef = useRef(null);

    useEffect(() => {
        if (!mountRef.current) return;

        // Scene Setup
        const scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x000000, 0.002);

        const camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        camera.position.z = 20;

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        mountRef.current.appendChild(renderer.domElement);

        // Particles
        const particleCount = 100;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const velocities = [];

        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 50; // x
            positions[i * 3 + 1] = (Math.random() - 0.5) * 30; // y
            positions[i * 3 + 2] = (Math.random() - 0.5) * 20; // z

            velocities.push({
                x: (Math.random() - 0.5) * 0.05,
                y: (Math.random() - 0.5) * 0.05,
                z: (Math.random() - 0.5) * 0.05,
            });
        }

        geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
        const material = new THREE.PointsMaterial({
            color: 0xcc0000, // Red tint
            size: 0.2,
            transparent: true,
            opacity: 0.8,
        });
        const particles = new THREE.Points(geometry, material);
        scene.add(particles);

        // Lines connecting particles
        const lineMaterial = new THREE.LineBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.15,
        });
        const lineGeometry = new THREE.BufferGeometry();
        const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
        scene.add(lines);

        // Mouse interaction
        const mouse = new THREE.Vector2();
        const target = new THREE.Vector2();
        const windowHalfX = window.innerWidth / 2;
        const windowHalfY = window.innerHeight / 2;

        const onDocumentMouseMove = (event) => {
            mouse.x = (event.clientX - windowHalfX);
            mouse.y = (event.clientY - windowHalfY);
        };

        document.addEventListener("mousemove", onDocumentMouseMove);

        // Animation Loop
        const animate = () => {
            requestAnimationFrame(animate);

            target.x = mouse.x * 0.001;
            target.y = mouse.y * 0.001;

            // Gentle rotation based on mouse
            scene.rotation.y += 0.05 * (target.x - scene.rotation.y);
            scene.rotation.x += 0.05 * (target.y - scene.rotation.x);

            // Update particle positions
            const posAttribute = geometry.attributes.position;
            const currentPositions = posAttribute.array;

            for (let i = 0; i < particleCount; i++) {
                // Apply velocity
                currentPositions[i * 3] += velocities[i].x;
                currentPositions[i * 3 + 1] += velocities[i].y;
                currentPositions[i * 3 + 2] += velocities[i].z;

                // Bounce off bounds
                if (Math.abs(currentPositions[i * 3]) > 25) velocities[i].x *= -1;
                if (Math.abs(currentPositions[i * 3 + 1]) > 15) velocities[i].y *= -1;
                if (Math.abs(currentPositions[i * 3 + 2]) > 10) velocities[i].z *= -1;
            }
            posAttribute.needsUpdate = true;

            // Update Lines
            const linePositions = [];
            const connectDistance = 8;

            for (let i = 0; i < particleCount; i++) {
                for (let j = i + 1; j < particleCount; j++) {
                    const x1 = currentPositions[i * 3];
                    const y1 = currentPositions[i * 3 + 1];
                    const z1 = currentPositions[i * 3 + 2];

                    const x2 = currentPositions[j * 3];
                    const y2 = currentPositions[j * 3 + 1];
                    const z2 = currentPositions[j * 3 + 2];

                    const dist = Math.sqrt(
                        Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2) + Math.pow(z1 - z2, 2)
                    );

                    if (dist < connectDistance) {
                        linePositions.push(x1, y1, z1);
                        linePositions.push(x2, y2, z2);
                    }
                }
            }

            lineGeometry.setAttribute(
                "position",
                new THREE.Float32BufferAttribute(linePositions, 3)
            );

            renderer.render(scene, camera);
        };

        animate();

        const handleResize = () => {
            if (!mountRef.current) return;
            const width = window.innerWidth;
            const height = window.innerHeight;
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
        };

        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
            document.removeEventListener("mousemove", onDocumentMouseMove);
            if (mountRef.current && renderer.domElement) {
                mountRef.current.removeChild(renderer.domElement);
            }
            geometry.dispose();
            material.dispose();
            lineGeometry.dispose();
            lineMaterial.dispose();
            renderer.dispose();
        };
    }, []);

    return <div ref={mountRef} className="absolute inset-0 w-full h-full z-0 pointer-events-none" />;
};

export default ThreeBackground;

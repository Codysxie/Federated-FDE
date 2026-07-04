"use client";

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Rocket } from 'lucide-react';

const cn = (...classes) => classes.filter(Boolean).join(' ');

export const StarfieldCanvas = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let animationFrameId;
        let stars = [];
        const numStars = 800;
        let speed = 0.75; // no mouse: edge speed

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        class Star {
            constructor() {
                this.x = Math.random() * canvas.width - canvas.width / 2;
                this.y = Math.random() * canvas.height - canvas.height / 2;
                this.z = Math.random() * canvas.width;
                this.pz = this.z;
            }

            update() {
                this.z = this.z - speed;
                if (this.z < 1) {
                    this.z = canvas.width;
                    this.x = Math.random() * canvas.width - canvas.width / 2;
                    this.y = Math.random() * canvas.height - canvas.height / 2;
                    this.pz = this.z;
                }
            }

            draw() {
                const sx = (this.x / this.z) * canvas.width / 2 + canvas.width / 2;
                const sy = (this.y / this.z) * canvas.height / 2 + canvas.height / 2;

                const r = Math.max(0.1, (1 - this.z / canvas.width) * 2.5);

                const px = (this.x / this.pz) * canvas.width / 2 + canvas.width / 2;
                const py = (this.y / this.pz) * canvas.height / 2 + canvas.height / 2;

                this.pz = this.z;

                ctx.beginPath();
                ctx.moveTo(px, py);
                ctx.lineTo(sx, sy);
                ctx.lineWidth = r * 2;
                ctx.strokeStyle = `rgba(255, 255, 255, ${1 - this.z / canvas.width})`;
                ctx.stroke();
            }
        }

        const init = () => {
            stars = [];
            for (let i = 0; i < numStars; i++) {
                stars.push(new Star());
            }
        };

        const animate = () => {
            // Fade to slate-900 to preserve the section background color
            ctx.fillStyle = 'rgba(15, 23, 42, 0.2)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            stars.forEach(star => {
                star.update();
                star.draw();
            });

            animationFrameId = requestAnimationFrame(animate);
        };

        const handleMouseMove = (event) => {
            const centerX = window.innerWidth / 2;
            const dist = Math.abs(event.clientX - centerX);
            const maxDist = window.innerWidth / 2;
            // Closer to center → slower (near stop), edge → noticeably faster
            speed = 0.15 + (dist / maxDist) * 0.6;
        };

        window.addEventListener('resize', resizeCanvas);
        window.addEventListener('mousemove', handleMouseMove);

        resizeCanvas();
        init();
        animate();

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', resizeCanvas);
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    return <canvas ref={canvasRef} className="absolute inset-0 z-0 w-full h-full" />;
};

export default function HyperdriveHero() {
    const fadeUpVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: (i) => ({
            opacity: 1,
            y: 0,
            transition: {
                delay: i * 0.2 + 0.5,
                duration: 0.8,
                ease: "easeInOut",
            },
        }),
    };

    return (
        <div
            className="relative h-screen w-full bg-black flex flex-col items-center justify-center overflow-hidden"
        >
            <StarfieldCanvas />

            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black z-10"></div>

            <div className="relative z-20 text-center p-6">
                <motion.div
                    custom={0} variants={fadeUpVariants} initial="hidden" animate="visible"
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-6 backdrop-blur-sm"
                >
                    <Rocket className="h-4 w-4 text-indigo-300" />
                    <span className="text-sm font-medium text-gray-200">
                        Next-Generation Deployment Platform
                    </span>
                </motion.div>

                <motion.h1
                    custom={1} variants={fadeUpVariants} initial="hidden" animate="visible"
                    className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400"
                >
                    Hyperdrive
                </motion.h1>

                <motion.p
                    custom={2} variants={fadeUpVariants} initial="hidden" animate="visible"
                    className="max-w-2xl mx-auto text-lg text-gray-400 mb-10"
                >
                    Launch your applications at the speed of light. Our platform provides the infrastructure to build, scale, and deploy globally in seconds.
                </motion.p>

                <motion.div
                    custom={3} variants={fadeUpVariants} initial="hidden" animate="visible"
                >
                    <button className="px-8 py-4 bg-white text-black font-semibold rounded-lg shadow-lg hover:bg-gray-200 transition-colors duration-300 flex items-center gap-2 mx-auto">
                        Engage Thrusters
                        <ArrowRight className="h-5 w-5" />
                    </button>
                </motion.div>
            </div>
        </div>
    );
}

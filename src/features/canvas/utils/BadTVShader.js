/**
 * BadTVShader
 * Custom GLSL shader for retro TV effects
 * Inspired by classic BadTV and Digital Glitch shaders
 */
export const BadTVShader = {
    uniforms: {
        tDiffuse: { value: null },
        time: { value: 0.0 },
        distortion: { value: 3.0 },
        distortion2: { value: 5.0 },
        speed: { value: 0.2 },
        rollSpeed: { value: 0.1 },
        staticAmount: { value: 0.2 },
        scanlineAmount: { value: 0.3 },
        rgbShift: { value: 0.005 }
    },

    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,

    fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform float time;
        uniform float distortion;
        uniform float distortion2;
        uniform float speed;
        uniform float rollSpeed;
        uniform float staticAmount;
        uniform float scanlineAmount;
        uniform float rgbShift;
        varying vec2 vUv;

        // Psuedo-random function for noise
        float random(vec2 co) {
            return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
        }

        void main() {
            vec2 uv = vUv;
            
            // Vertical rolling effect
            float roll = fract(time * rollSpeed);
            
            // Horizontal distortion
            float ty = uv.y + time * speed;
            float off = sin(ty * 10.0 + sin(ty * 20.0)) * 0.005 * distortion;
            off += (random(vec2(ty * 0.1, time)) - 0.5) * 0.01 * distortion2;
            
            // RGB Shift (Chromatic Aberration)
            vec4 col;
            col.r = texture2D(tDiffuse, vec2(uv.x + off + rgbShift, uv.y)).r;
            col.g = texture2D(tDiffuse, vec2(uv.x + off, uv.y)).g;
            col.b = texture2D(tDiffuse, vec2(uv.x + off - rgbShift, uv.y)).b;
            col.a = 1.0;

            // Scanlines
            float scanline = sin(uv.y * 800.0) * 0.1 * scanlineAmount;
            col.rgb -= scanline;

            // Static / Noise
            float noise = random(uv + time) * staticAmount;
            col.rgb += noise - (staticAmount * 0.5);

            // Vignette (simple)
            float vig = 1.0 - smoothstep(0.4, 1.2, length(uv - 0.5) * 2.0);
            col.rgb *= mix(1.0, vig, 0.4);

            gl_FragColor = col;
        }
    `
};

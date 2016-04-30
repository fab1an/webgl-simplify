import {Logger} from "util/logging/Logger";
import Three from "three";

const L = Logger.getLogger("WebGLSqSeqDist");

export default class WebGLSqDist {

    constructor() {
        this.data = new Float32Array(2 * 3);
        this.texture = new Three.DataTexture(this.data, 2, 1, Three.RGBFormat, Three.FloatType);
        this.output = new Float32Array(4);
        this.prepare(1, 1, this.texture, require("raw!fragmentSqDist.glsl"));
    }

    getSqDist(p1, p2) {

        /* data */
        this.data[0] = p1.x * 100;
        this.data[1] = p1.y * 100;
        this.data[2] = 0;
        this.data[3] = p2.x * 100;
        this.data[4] = p2.y * 100;
        this.data[5] = 0;
        this.texture.needsUpdate = true;

        /* render into texture */
        this.renderer.render(this.scene, this.camera, this.bufferTexture);

        /* read back pixels */
        const gl = this.renderer.context;
        gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.FLOAT, this.output);

        return this.output[0] / 10000;
    }

    prepare(width, height, texture, shader) {
        /* shader material */
        let material =
            new Three.ShaderMaterial({
                uniforms: {
                    u_sourceData: {
                        type: "t",
                        value: texture
                    }
                },
                vertexShader: require("raw!vertex.glsl"),
                fragmentShader: shader
            });

        /* cube and mesh */
        const geom = new Three.BoxBufferGeometry(width, height, 0);
        const mesh = new Three.Mesh(geom, material);

        /* scene and camera */
        this.scene = new Three.Scene();
        this.scene.add(mesh);

        this.camera = new Three.OrthographicCamera(width / -2, width / 2, height / -2, height / 2, 0, 0.1);
        this.scene.add(this.camera);

        /* render */
        this.renderer = new Three.WebGLRenderer();
        this.renderer.setSize(width, height);

        this.bufferTexture = new Three.WebGLRenderTarget(width, height, {
            type: Three.FloatType
        });
    }
}

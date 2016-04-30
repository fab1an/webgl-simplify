import {Logger} from "util/logging/Logger";
import Three from "three";

const L = Logger.getLogger("WebGLMultiSqSeqDist");

export default class WebGLMultiSqSeqDist {

    constructor() {
        this.renderer = new Three.WebGLRenderer();
        this.uniforms = {};
        this.material =
            new Three.ShaderMaterial({
                uniforms: this.uniforms,
                vertexShader: require("raw!vertex.glsl"),
                fragmentShader: require("raw!fragmentMultiSqSegDist.glsl")
            });

        this.width = 0;
        this.scene = new Three.Scene();
        this.camera = new Three.OrthographicCamera(1 / -2, 1 / 2, 1 / -2, 1 / 2, 0, 0.1);
        this.scene.add(this.camera);
    }

    update(requiredWidth) {
        const height = 1;
        if (this.width < requiredWidth) {
            let newWidth = 2;

            /* power of two */
            // while (newWidth < requiredWidth) {
            //     newWidth = newWidth * 2;
            // }

            newWidth = requiredWidth;

            L.info("required ", requiredWidth, ": changing", this.width, " -> ", newWidth);
            this.width = newWidth;
            this.data = new Float32Array(this.width * 3);
            this.texture = new Three.DataTexture(this.data, this.width, 1, Three.RGBFormat, Three.FloatType);
            this.uniforms.u_sourceData = {
                type: "t",
                value: this.texture
            }

            /* cube and mesh */
            if (exists(this.mesh)) {
                this.scene.remove(this.mesh);
            }

            const geom = new Three.BoxBufferGeometry(this.width, 1, 0);
            this.mesh = new Three.Mesh(geom, this.material);
            this.scene.add(this.mesh);

            /* scene and camera */
            this.mesh.position.x = this.width / 2;
            this.camera.right = this.width;
            this.camera.left = 0;

            this.camera.updateProjectionMatrix();

            /* render into texture */
            if (exists(this.bufferTexture)) {
                this.bufferTexture.dispose();
            }
            this.bufferTexture = new Three.WebGLRenderTarget(this.width, height, {
                type: Three.FloatType
            });

            /* read back pixels */
            this.output = new Float32Array(4 * this.width);
        }
    }

    getMultiSqSegDist(points, first, last, sqTolerance, debug = false) {
        const renderLength = last - first - 1,
            p1 = points[first],
            p2 = points[last]

        debug && L.info("renderLength, p1, p2", renderLength, p1, p2);

        /* resize it */
        this.update(renderLength);

        /* clear data */
        // for (let i = 0; i < this.data.length; i++) {
        //     this.data[i] = 0;
        // }

        /* set data */
        for (let i = 0; i < renderLength; i++) {
            debug && L.info("points[first + 1 + i]", points[first + 1 + i]);
            this.data[(this.width * 3) - (i * 3) - 3] = points[first + 1 + i].x;
            this.data[(this.width * 3) - (i * 3) - 2] = points[first + 1 + i].y;
        }
        debug && L.info("data", this.data);

        this.texture.needsUpdate = true;
        this.uniforms.p1 = {
            type: "3fv",
            value: new Three.Vector3(p1.x, p1.y, 0)
        }
        this.uniforms.p2 = {
            type: "3fv",
            value: new Three.Vector3(p2.x, p2.y, 0)
        }

        /* set buffertexture size */
        // this.bufferTexture.setSize(renderLength, 1);
        // this.camera.right = renderLength;
        // this.camera.updateProjectionMatrix();

        this.renderer.render(this.scene, this.camera, this.bufferTexture);

        /* clear output buffer */
        // for (let i = 0; i < this.output.length; i++) {
        //     this.output[i] = 0;
        // }

        debug && L.info("output", this.output);
        const gl = this.renderer.context;
        gl.readPixels(0, 0, renderLength, 1, gl.RGBA, gl.FLOAT, this.output);
        debug && L.info("output", this.output);

        let index = -1, max = sqTolerance;
        for (let i = 0; i < renderLength; i++) {
            let d = this.output[i * 4];
            debug && L.info("i, d", i, d);
            if (d > max) {
                max = d;
                index = i;
            }
        }
        if (index !== -1) {
            return index + first + 1;

        } else {
            return index
        }
    }
}

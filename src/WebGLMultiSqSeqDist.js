import {Logger} from "util/logging/Logger";
import {checkState} from "util/Preconditions";
import Three from "three";
import _ from "lodash";

const L = Logger.getLogger("WebGLMultiSqSeqDist");

export default class WebGLMultiSqSeqDist {

    constructor() {
        this.renderer = new Three.WebGLRenderer();
        this.uniforms = {};
        this.material =
            new Three.ShaderMaterial({
                uniforms: this.uniforms,
                vertexShader: require("raw!vertex.glsl"),
                fragmentShader: require("raw!fragmentSimplifyDP.glsl")
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
 //                newWidth = newWidth * 2;
 //            }

            newWidth = requiredWidth;

            L.info("required ", requiredWidth, ": changing", this.width, " -> ", newWidth);
            this.width = newWidth;

            /* points */
            this.pointData = new Float32Array(this.width * 3);
            this.pointTexture = new Three.DataTexture(this.pointData, this.width, 1, Three.RGBFormat, Three.FloatType);
            this.uniforms.u_points = {
                type: "t",
                value: this.pointTexture
            }

            this.refPointData = new Float32Array(this.width * 4);
            this.refPointTexture = new Three.DataTexture(this.refPointData, this.width, 1, Three.RGBAFormat, Three.FloatType);
            this.uniforms.u_refpoints = {
                type: "t",
                value: this.refPointTexture
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
            this.outDistances = new Float32Array(4 * this.width);
        }
    }

    setChosen(idx, marker) {
        this.pointData[idx * 3 + 2] = marker;
    }

    getChosen(idx) {
        return this.pointData[idx * 3 + 2];
    }

    simplify(points, sqTolerance, debug) {
        sqTolerance = sqTolerance * sqTolerance;
        this.update(points.length);

        /* fill in points */
        for (let i = 0; i < points.length; i++) {
            debug && L.info("points[i]", points[i]);
            this.pointData[i * 3] = points[i].x;
            this.pointData[i * 3 + 1] = points[i].y;
        }
        debug && L.info("pointData", this.pointData);
        this.pointTexture.needsUpdate = true;

        /* set seqLength */
        this.uniforms.seqLength = {
            type: "f",
            value: points.length
        }

        /* clear chosen */
        for (let i = 0; i < points.length; i++) {
            this.setChosen(i, 0);
        }
        /* chose first and last point */
        this.setChosen(0, 1);
        this.setChosen((points.length - 1), 1);

        let hasZeros = true;
        while (hasZeros) {
            hasZeros = false;

            /* left to right: set p1 */
            let idx_p1 = 0;
            for (let i = 0; i < points.length; i++) {
                const marker = this.getChosen(i);
                debug && L.info("chosen[i]", marker);
                if (marker === 0) {
                    hasZeros = true;
                    const p1 = points[idx_p1]
                    this.refPointData[i * 4] = p1.x;
                    this.refPointData[i * 4 + 1] = p1.y;
                } else if (marker === 1) {
                    idx_p1 = i;
                }
            }
            /* and back right to left: set p2 */
            let idx_p2 = points.length - 1;
            for (let i = (points.length - 1); i >= 0; i--) {
                const marker = this.getChosen(i);
                if (marker === 0) {
                    const p2 = points[idx_p2]
                    this.refPointData[i * 4 + 2] = p2.x;
                    this.refPointData[i * 4 + 3] = p2.y;
                } else if (marker === 1) {
                    idx_p2 = i;
                }
            }
            debug && L.info("refPointData", this.refPointData);

            /* render */
            this.refPointTexture.needsUpdate = true;
            this.renderer.render(this.scene, this.camera, this.bufferTexture);

            /* output texture */
            debug && L.info("output", this.outDistances);
            const gl = this.renderer.context;
            gl.readPixels(0, 0, this.width, 1, gl.RGBA, gl.FLOAT, this.outDistances);
            debug && L.info("output", this.outDistances);

            /* walk through result */
            let curSelect = -1;
            let curMax = sqTolerance;
            let groupStart = 0;
            for (let i = 0; i < points.length; i++) {
                const marker = this.getChosen(i);
                if (marker === 1) {
                    if (curSelect === -1) {
                        for (let k = (groupStart + 1); k < i; k++) {
                            this.setChosen(k, -1);
                        }
                    } else {
                        this.setChosen(curSelect, 1);
                    }
                    curSelect = -1;
                    curMax = sqTolerance;
                    groupStart = i;

                } else if (marker === 0) {
                    const d = this.outDistances[(this.width * 4) - (i + 1) * 4];
                    if (d > curMax) {
                        curMax = d;
                        curSelect = i;
                    }
                }
            }
        }

        let simplified = [];
        for (let i = 0; i < points.length; i++) {
            if (this.getChosen(i) === 1) {
                simplified.push(points[i]);
            }
        }

        return simplified;
    }
}

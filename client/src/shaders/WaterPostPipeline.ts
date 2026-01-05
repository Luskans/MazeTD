// export class WaterPostPipeline extends Phaser.Renderer.WebGL.Pipelines.PostFXPipeline {
//     private time: number = 0;

//     constructor(game: Phaser.Game) {
//         super({
//             game,
//             name: 'WaterPostPipeline'
//         });
//     }

//     // C'est ici que l'on définit le code GLSL pour les versions récentes
//     static getFrag() {
//         return `
//             precision mediump float;
//             uniform sampler2D uMainSampler;
//             uniform float uTime;
//             varying vec2 outTexCoord;

//             void main() {
//                 vec2 uv = outTexCoord;
                
//                 // Distortion sinus / cosinus
//                 float distortion = sin(uv.y * 20.0 + uTime) * 0.005;
//                 vec2 distortedUV = vec2(uv.x + distortion, uv.y + distortion);
                
//                 vec4 color = texture2D(uMainSampler, distortedUV);

//                 // Ajout d'éclats spéculaires (scintillement)
//                 float specular = pow(max(0.0, sin(uv.x * 25.0 + uv.y * 15.0 + uTime * 1.5)), 30.0);
//                 color.rgb += specular * 0.5;

//                 gl_FragColor = color;
//             }
//         `;
//     }

//     onPreRender() {
//         this.time += 0.01;
//         this.set1f('uTime', this.time);
//     }
// }



export class WaterPostPipeline extends Phaser.Renderer.WebGL.Pipelines.PostFXPipeline {
    private time: number = 0;

    constructor(game: Phaser.Game) {
        super({
            game,
            name: 'WaterPostPipeline',
        });
    }

    // C'est ici qu'on injecte le shader dans Phaser 3
    onPreRender() {
        this.time += 0.01;
        this.set1f('uTime', this.time);
    }

    // Le code GLSL doit être retourné ou défini ici
    static getFrag() {
        return `
        precision mediump float;
        uniform sampler2D uMainSampler;
        uniform float uTime;
        varying vec2 outTexCoord;

        void main() {
            vec2 uv = outTexCoord;
            
            // Calcul des vagues (Sinus combinés pour plus de réalisme)
            float speed = uTime * 2.0;
            float distortion = sin(uv.y * 12.0 + speed) * 0.004;
            distortion += cos(uv.x * 8.0 + speed) * 0.003;

            vec2 distortedUV = uv + vec2(distortion, distortion);
            vec4 color = texture2D(uMainSampler, distortedUV);

            // Reflets de lumière (specular)
            float shine = pow(max(0.0, sin((distortedUV.x + distortedUV.y) * 20.0 + speed)), 25.0);
            color.rgb += shine * 0.3;

            // Teinte légèrement bleue/cyan
            color.rgb = mix(color.rgb, vec3(0.0, 0.4, 0.8), 0.1);

            gl_FragColor = color;
        }
        `;
    }
}
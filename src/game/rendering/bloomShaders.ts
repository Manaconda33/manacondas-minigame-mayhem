export const fullscreenVertex = `varying vec2 vUv;
void main() { vUv = position.xy * 0.5 + 0.5; gl_Position = vec4(position.xy, 0.0, 1.0); }`;
export const filterFragment = `uniform sampler2D source; uniform vec2 stepSize; varying vec2 vUv;
void main() {
 vec3 color = texture2D(source,vUv).rgb * 13.0;
 color += (texture2D(source,vUv-stepSize).rgb + texture2D(source,vUv+stepSize).rgb)*10.0;
 color += (texture2D(source,vUv-stepSize*2.0).rgb + texture2D(source,vUv+stepSize*2.0).rgb)*7.0;
 color += (texture2D(source,vUv-stepSize*3.0).rgb + texture2D(source,vUv+stepSize*3.0).rgb)*4.0;
 color += texture2D(source,vUv-stepSize*4.0).rgb + texture2D(source,vUv+stepSize*4.0).rgb;
 gl_FragColor = vec4(color/57.0,1.0);
}`;
export const compositeFragment = `uniform sampler2D source; uniform float gain; varying vec2 vUv;
void main() {
 gl_FragColor = vec4(texture2D(source,vUv).rgb * gain,1.0);
 #include <colorspace_fragment>
}`;

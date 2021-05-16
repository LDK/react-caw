import React from 'react';
import ReactDOM from 'react-dom';
import "./caw.scss";
import { Config } from './config.js';
import EditorUI from './EditorUI.js';

class App extends React.Component {
	constructor(props) {
		super(props);
		this.state = {

		};
		this.restingFace = 'Smug 1';
		this.initCanvas = this.initCanvas.bind(this);
		this.loadSkeleton = this.loadSkeleton.bind(this);
		this.loadFigure = this.loadFigure.bind(this);
		this.renderFigure = this.renderFigure.bind(this);
		this.setSlotColor = this.setSlotColor.bind(this);
		this.setPartColor = this.setPartColor.bind(this);
		this.setPartStyle = this.setPartStyle.bind(this);
		this.setAnimation = this.setAnimation.bind(this);
		this.setFace = this.setFace.bind(this);
		this.queueAnimation = this.queueAnimation.bind(this);
		this.cycleAnimation = this.cycleAnimation.bind(this);
		this.calculateSetupPoseBounds = this.calculateSetupPoseBounds.bind(this);
		this.mvp = new spine.webgl.Matrix4();
	}
	initCanvas () {
		// Setup canvas and WebGL context. We pass alpha: false to canvas.getContext() so we don't use premultiplied alpha when
		// loading textures. That is handled separately by PolygonBatcher.
		this.canvas = document.getElementById("canvas");
		this.canvas.width = window.innerWidth;
		this.canvas.height = window.innerHeight;
		var config = { alpha: true };
		this.gl = this.canvas.getContext("webgl", config) || this.canvas.getContext("experimental-webgl", config);
		if (!this.gl) {
			alert('WebGL is unavailable.');
			return;
		}

		// Create a simple shader, mesh, model-view-projection matrix, SkeletonRenderer, and AssetManager.
		this.shader = spine.webgl.Shader.newTwoColoredTextured(this.gl);
		this.batcher = new spine.webgl.PolygonBatcher(this.gl);
		this.mvp.ortho2d(0, 0, this.canvas.width - 1, this.canvas.height - 1);
		this.skeletonRenderer = new spine.webgl.SkeletonRenderer(this.gl);
		this.assetManager = new spine.webgl.AssetManager(this.gl);

		// Tell AssetManager to load the resources for each skeleton, including the exported .skel file, the .atlas file and the .png
		// file for the atlas. We then wait until all resources are loaded in the load() method.
		this.assetManager.loadBinary(Config.spineAsset.skelFile);
		this.assetManager.loadTextureAtlas(Config.spineAsset.atlasFile);
		requestAnimationFrame(this.loadSkeleton);
	}
	resize () {
		var w = this.canvas.clientWidth;
		var h = this.canvas.clientHeight;
		if (this.canvas.width != w || this.canvas.height != h) {
			this.canvas.width = w;
			this.canvas.height = h;
		}

		// Calculations to center the skeleton in the canvas.
		var bounds = this.figure.bounds;
		var centerX = bounds.offset.x + bounds.size.x / 2;
		var centerY = bounds.offset.y + bounds.size.y / 2;
		var scaleX = bounds.size.x / this.canvas.width;
		var scaleY = bounds.size.y / this.canvas.height;
		var scale = Math.max(scaleX, scaleY) * 1.2;
		if (scale < 1) scale = 1;
		var width = this.canvas.width * scale;
		var height = this.canvas.height * scale;

		this.mvp.ortho2d(centerX - width / 2, centerY - height / 2, width, height);
		this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
	}
	renderFigure () {
		var now = Date.now() / 1000;
		var delta = now - this.lastFrameTime;
		this.lastFrameTime = now;

		// Update the MVP matrix to adjust for canvas size changes
		this.resize();

		this.gl.clearColor(0.3, 0.3, 0.3, .4);
		this.gl.clear(this.gl.COLOR_BUFFER_BIT);

		// Apply the animation state based on the delta time.
		this.skeleton = this.figure.skeleton;
		var state = this.figure.state;
		var premultipliedAlpha = this.figure.premultipliedAlpha;
		state.update(delta);
		state.apply(this.skeleton);
		this.skeleton.updateWorldTransform();

		// Bind the shader and set the texture and model-view-projection matrix.
		this.shader.bind();
		this.shader.setUniformi(spine.webgl.Shader.SAMPLER, 0);
		this.shader.setUniform4x4f(spine.webgl.Shader.MVP_MATRIX, this.mvp.values);

		// Start the batch and tell the SkeletonRenderer to render the active skeleton.
		this.batcher.begin(this.shader);
		this.skeletonRenderer.premultipliedAlpha = premultipliedAlpha;
		this.skeletonRenderer.draw(this.batcher, this.skeleton);
		this.batcher.end();

		this.shader.unbind();

		requestAnimationFrame(this.renderFigure);
	}
	calculateSetupPoseBounds () {
		this.skeleton.setToSetupPose();
		this.skeleton.updateWorldTransform();
		var offset = new spine.Vector2();
		var size = new spine.Vector2();
		this.skeleton.getBounds(offset, size, []);
		return { offset: offset, size: size };
	}
	spineEventHandler(eventName, trackIndex) {
		if (eventName.indexOf('Face:') !== -1) {
			var tmp = eventName.split(': ');
			var faceName = tmp[1];
			this.setFace(faceName);
		}
		else {
			switch (eventName) {
				case 'Reset Face':
					this.setFace(this.restingFace);
				break;
			}
		}
		
	}
	loadSkeleton () {
		// Wait until the AssetManager has loaded all resources, then load the skeletons.
		if (this.assetManager.isLoadingComplete()) {
			this.figure = this.loadFigure(Config.spineAsset.defaultAnim, true);
			this.skeleton = this.figure.skeleton;
			var app = this;
			this.figure.state.addListener({
				event: function( trackIndex, event ){
					app.spineEventHandler(event.data.name, trackIndex);
				},
				complete: function( trackIndex, loopCount ){
					app.cycleAnimation();
				},
				start: function( trackIndex ){

				},
				end: function( trackIndex ){

				}
			})
			// this.setPartColor('skin',{ r: .75, g: .6, b: .5, a: 1});
			var editor = this.editor;
			for (var part in editor.parts) {
				var defaults = editor.parts[part];
				this.setPartColor(part,defaults.color);
				if (!!defaults.attachment) {
					this.setPartStyle(part,defaults.attachment);
				}
			}
			for (var part in editor.transforms) {
				var boneData = this.skeleton.findBone(part).data;
				for (var transform in editor.transforms[part]) {
					if (!!boneData[transform] && boneData[transform] != editor.transforms[part][transform]) {
						boneData[transform] = editor.transforms[part][transform];
					}
				}
			}
			this.lastFrameTime = Date.now() / 1000;
			requestAnimationFrame(this.renderFigure); // Loading is done, call render every frame.
		} else {
			requestAnimationFrame(this.loadSkeleton);
		}
	}
	loadFigure (initialAnimation, premultipliedAlpha) {
		// Load the texture atlas from the AssetManager.
		var atlas = this.assetManager.get(Config.spineAsset.atlasFile);

		// Create a AtlasAttachmentLoader that resolves region, mesh, boundingbox and path attachments
		var atlasLoader = new spine.AtlasAttachmentLoader(atlas);

		// Create a SkeletonBinary instance for parsing the .skel file.
		var skeletonBinary = new spine.SkeletonBinary(atlasLoader);

		// Set the scale to apply during parsing, parse the file, and create a new skeleton.
		skeletonBinary.scale = 1;
		var skeletonData = skeletonBinary.readSkeletonData(this.assetManager.get(Config.spineAsset.skelFile));
		if (!initialAnimation) {
			initialAnimation = skeletonData.animations[0].name;
		}
		var skeleton = new spine.Skeleton(skeletonData);
		if (Config.spineAsset.skin) {
			skeleton.setSkinByName(Config.spineAsset.skin);
		}
		this.skeleton = skeleton;
		var bounds = this.calculateSetupPoseBounds(this.skeleton);

		// Create an AnimationState, and set the initial animation in looping mode.
		var animationStateData = new spine.AnimationStateData(this.skeleton.data);
		var animationState = new spine.AnimationState(animationStateData);

		animationState.setAnimation(0, initialAnimation, true);
		animationState.setAnimation(1, 'Face: Smug 1', false);

		// Pack everything up and return to caller.
		return { skeleton: this.skeleton, state: animationState, bounds: bounds, premultipliedAlpha: premultipliedAlpha };
	}
	cycleAnimation () {
		this.animIndex = this.animIndex || 0;
		this.animIndex++;
		if (this.animIndex >= Config.animationLoop.length) {
			this.animIndex = 0;
		}
		var current = this.figure.state.getCurrent(0).animation.name;
		if (Config.animationLoop[this.animIndex] != current) {
			this.queueAnimation(Config.animationLoop[this.animIndex],true);
		}
	}
	setFace(faceName) {
		var current = this.figure.state.getCurrent(1).animation.name;
		if ('Face: '+faceName != current) {
			this.figure.state.setAnimation(1, 'Face: '+faceName, false);
		}
	}
	setSlotColor (slotName,color) {
		var slotColor = this.skeleton.findSlot(slotName).color;
		slotColor.r = color.r;
		slotColor.g = color.g;
		slotColor.b = color.b;
		slotColor.a = color.a;
	}
	setPartColor(part,color) {
		if (!!part && !!Config.slotGroups[part]) {
			for (var i in Config.slotGroups[part]) {
				this.setSlotColor(Config.slotGroups[part][i],color);
			}
			if (!!this.editor && !!this.editor.parts) {
				this.editor.parts[part].color = color;
			}
		}
	}
	setAnimation(animation) {
		this.figure.state.setAnimation(0, animation, true);
	}
	queueAnimation(animation,loop) {
		loop = !!loop || false;
		this.figure.state.addAnimation(0, animation, loop, 0);
	}
	setPartStyle(part,attachment) {
		if (!!part && !!Config.slotGroups[part]) {
			for (var i in Config.slotGroups[part]) {
				this.skeleton.setAttachment(Config.slotGroups[part][i],attachment);
			}
			if (!!this.editor && !!this.editor.parts) {
				this.editor.parts[part].attachment = attachment;
			}
		}
		else {
			// console.log('something missing',part,Config.slotGroups[part]);
		}
	}
	render() {
		return (
			<div>
				<EditorUI app={this} />
			</div>
		);
	}
}


ReactDOM.render(
	<App />,
	document.getElementById('root')
);

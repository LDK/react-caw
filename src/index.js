import React from 'react';
import ReactDOM from 'react-dom';
import "./caw.scss";

class App extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			buttonText: 'CLICK ME'
		};
		this.initCanvas = this.initCanvas.bind(this);
		this.loadSkeleton = this.loadSkeleton.bind(this);
		this.loadFigure = this.loadFigure.bind(this);
		this.renderFigure = this.renderFigure.bind(this);
		this.setSlotColor = this.setSlotColor.bind(this);
		this.setSkinColor = this.setSkinColor.bind(this);
		this.calculateSetupPoseBounds = this.calculateSetupPoseBounds.bind(this);
		this.mvp = new spine.webgl.Matrix4();
		this.character = {
			defaultAnim: 'idle',
			skelFile: "assets/Wrestler-pro.skel",
			atlasFile: "assets/Wrestler-pma.atlas",
			skin: 'Male Wrestler'
		};
		this.skinSlots = ["Head","Nose","arm_upper_far","arm_lower_far","hand_far","leg_upper_far","leg_lower_far","Far Shin","waist","torso","neck","Right Ear","leg_upper_near","leg_lower_near","Near Shin","foot_near","arm_upper_near","arm_lower_near","hand_near"];
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
		this.assetManager.loadBinary(this.character.skelFile);
		this.assetManager.loadTextureAtlas(this.character.atlasFile);
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
	loadSkeleton () {
		// Wait until the AssetManager has loaded all resources, then load the skeletons.
		if (this.assetManager.isLoadingComplete()) {
			this.figure = this.loadFigure(this.character.defaultAnim, true);
			this.setSkinColor({ r: .75, g: .6, b: .5, a: 1});
			this.lastFrameTime = Date.now() / 1000;
			requestAnimationFrame(this.renderFigure); // Loading is done, call render every frame.
		} else {
			requestAnimationFrame(this.loadSkeleton);
		}
	}
	loadFigure (initialAnimation, premultipliedAlpha) {
		// Load the texture atlas from the AssetManager.
		var atlas = this.assetManager.get(this.character.atlasFile);

		// Create a AtlasAttachmentLoader that resolves region, mesh, boundingbox and path attachments
		var atlasLoader = new spine.AtlasAttachmentLoader(atlas);

		// Create a SkeletonBinary instance for parsing the .skel file.
		var skeletonBinary = new spine.SkeletonBinary(atlasLoader);

		// Set the scale to apply during parsing, parse the file, and create a new skeleton.
		skeletonBinary.scale = 1;
		var skeletonData = skeletonBinary.readSkeletonData(this.assetManager.get(this.character.skelFile));
		console.log('animations',skeletonData.animations);
		if (!initialAnimation) {
			initialAnimation = skeletonData.animations[0].name;
		}
		this.skeleton = new spine.Skeleton(skeletonData);
		if (this.character.skin) {
			this.skeleton.setSkinByName(this.character.skin);
		}
		var bounds = this.calculateSetupPoseBounds(this.skeleton);

		// Create an AnimationState, and set the initial animation in looping mode.
		var animationStateData = new spine.AnimationStateData(this.skeleton.data);
		var animationState = new spine.AnimationState(animationStateData);
		animationState.setAnimation(0, initialAnimation, true);
	

		// Pack everything up and return to caller.
		return { skeleton: this.skeleton, state: animationState, bounds: bounds, premultipliedAlpha: premultipliedAlpha };
	}
	setSlotColor (slotName,color) {
		var slotColor = this.skeleton.findSlot(slotName).color;
		slotColor.r = color.r;
		slotColor.g = color.g;
		slotColor.b = color.b;
		slotColor.a = color.a;
	}
	setSkinColor(color) {
		for (var i in this.skinSlots) {
			this.setSlotColor(this.skinSlots[i],color);
		}
	}
	componentDidMount() {
		this.initCanvas();
	}
	render() {
		return <button onClick={() => this.setSkinColor({r: .2, g: .2, b: .1, a: 1})}>{this.state.buttonText}</button>;
	}
}


ReactDOM.render(
	<App />,
	document.getElementById('root')
);

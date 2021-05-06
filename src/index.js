import React from 'react';
import ReactDOM from 'react-dom';
import "./caw.scss";
import { SketchPicker } from 'react-color';

function ColorSwatch(props) {
	var bgColor = null;
	if (!!props && !!props.color) {
		var r,g,b;
		r = props.color.r * 255;
		g = props.color.g * 255;
		b = props.color.b * 255;
		bgColor = 'rgb('+r+','+g+','+b+')';
	}
	return (
		<div className="colorSwatch" data-part={props.part} style={{ backgroundColor: bgColor }} onClick={props.onClick || null}>
		</div>
	);
}

function ColorPicker(props) {
	if (!props.editor.state.colorPickerOpen) {
		return null;
	}
	return <SketchPicker color={props.color || null} onChange={props.onChange || null} />;
}

function rgb(r,g,b) {
	return { r: r, g: g, b: b, a: 1 };
}

function rgb255(rgb) {
	return { r: rgb.r * 255, g: rgb.g * 255, b: rgb.b * 255, a: 100 };
}

const DEFAULT_COLORS = {
	'Shirt Body': rgb(1,1,1),
	'Shirt Sleeves': rgb(1,1,1),
	'trunks': rgb(0,0,0)
};
class EditorPanel extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			selectedPart: 'skin',
			selectedPanel: 'general',
			selectedSubpanel: false,
			colorPickerOpen: false
		};
		this.parts = {
			skin: {
				color: { r: .4, g: .33, b: .2, a: 1 }
			},
			'Shirt Body': {
				attachment: 'None',
				color: DEFAULT_COLORS['Shirt Body']
			},
			'Shirt Sleeves': {
				attachment: 'None',
				color: DEFAULT_COLORS['Shirt Sleeves']
			}
		};
		this.handleColorChange = this.handleColorChange.bind(this);
		this.handleStyleChange = this.handleStyleChange.bind(this);
		this.openColorPicker = this.openColorPicker.bind(this);
		this.openPanel = this.openPanel.bind(this);
		this.openSubpanel = this.openSubpanel.bind(this);
		this.closeColorPicker = this.closeColorPicker.bind(this);
		this.props.app.editor = this;
	}
	handleColorChange(color,event) {
		var r, g, b;
		r = color.rgb.r / 255;
		g = color.rgb.g / 255;
		b = color.rgb.b / 255;
		var newColor = { r: r, g: g, b: b, a: 1 };
		this.props.app.setPartColor(this.state.selectedPart,newColor);
	}
	openPanel(panelName) {
		this.setState({ selectedPanel: panelName, colorPickerOpen: false, subpanel: false });
	}
	openColorPicker(event) {
		var part = event.target.attributes['data-part'].value;
		this.setState({
			colorPickerOpen: true,
			selectedPart: part
		});
	}
	closeColorPicker() {
		this.setState({
			colorPickerOpen: false
		});
	}
	openSubpanel(panel) {
		this.setState({ colorPickerOpen: false, subpanel: panel });
	}
	handleStyleChange(event) {
		var partName = event.target.attributes.rel.value;
		var attachment = event.target.value;
		if (!this.parts[partName]) {
			this.parts[partName] = {};
		}
		this.props.app.setPartStyle(partName,attachment);
		this.setState({ selectedPart: partName })
	}
	render() {
		var openPanel;
		if (!this.state.colorPickerOpen) {
			switch (this.state.selectedPanel) {
				case 'general':
					openPanel = (
						<div id="general-panel">
							<label>Name</label>
						<input type="text" width="24"></input>
						</div>
					);
				break;
				case 'physical':
					openPanel = (
						<div id="physical-panel">
							<label>Skin Color</label>
							<ColorSwatch part="skin" color={this.parts.skin.color} onClick={this.openColorPicker} />
						</div>
					);
				break;
				case 'gear':
					switch (this.state.subpanel) {
						case 'clothing':
							console.log('parts in clothing',this.parts);
							openPanel = (
								<div id="clothing-panel">
									<a className="d-block arrow-link-back" onClick={() => this.openSubpanel(false)}>Back to Gear</a>
									<div className="row no-gutters partRow my-2">
										<div className="col-9">
											<label>Shirt Base</label>
											<select className="stylePicker" id="shirt-base" value={this.parts['Shirt Body'].attachment || "None"} onChange={this.handleStyleChange} rel="Shirt Body">
												<option value="None">None</option>
												<option value="Style 1">Style 1</option>
												<option value="Bodysuit">Bodysuit</option>
											</select>
										</div>
										<div className="col-3">
											<label>Color</label>
											<ColorSwatch color={this.parts['Shirt Body'].color} part="Shirt Body" editor={this} onClick={this.openColorPicker} />
										</div>
									</div>
									<div className="row no-gutters partRow my-2">
										<div className="col-9">
											<label>Shirt Sleeves</label>
											<select className="stylePicker" id="shirt-Sleeves" value={this.parts['Shirt Sleeves'].attachment || "None"} onChange={this.handleStyleChange} rel="Shirt Sleeves">
												<option value="None">None</option>
												<option value="Style 1">Style 1</option>
												<option value="Bodysuit">Bodysuit</option>
											</select>
										</div>
										<div className="col-3">
											<label>Color</label>
											<ColorSwatch color={this.parts['Shirt Sleeves'].color} part="Shirt Sleeves" editor={this} onClick={this.openColorPicker} />
										</div>
									</div>
								</div>
							);
						break;
						default:
							openPanel = (
								<div id="gear-panel">
									<a className="d-block arrow-link" onClick={() => this.openSubpanel('clothing')}>Clothing</a>
								</div>
							);
						break;
					}
				break;
			}
		}
		else {
			openPanel = (<ColorPicker onChange={ this.handleColorChange } editor={this} color={ rgb255(this.parts[this.state.selectedPart].color) } />);
		}
		return (
			<div id="editorPanel">
				{openPanel}
				<ul className="tabs">
					<li className={(this.state.selectedPanel == 'general') ? ' selected' : '' }><a onClick={() => this.openPanel('general')} className="d-block">General</a></li>
					<li className={(this.state.selectedPanel == 'physical') ? ' selected' : '' }><a onClick={() => this.openPanel('physical')} className="d-block">Physical</a></li>
					<li className={(this.state.selectedPanel == 'gear') ? ' selected' : '' }><a onClick={() => this.openPanel('gear')} className="d-block">Gear</a></li>
				</ul>
			</div>
		);
	}
}

class App extends React.Component {
	constructor(props) {
		super(props);
		this.state = {

		};
		this.initCanvas = this.initCanvas.bind(this);
		this.loadSkeleton = this.loadSkeleton.bind(this);
		this.loadFigure = this.loadFigure.bind(this);
		this.renderFigure = this.renderFigure.bind(this);
		this.setSlotColor = this.setSlotColor.bind(this);
		this.setPartColor = this.setPartColor.bind(this);
		this.setPartStyle = this.setPartStyle.bind(this);
		this.calculateSetupPoseBounds = this.calculateSetupPoseBounds.bind(this);
		this.mvp = new spine.webgl.Matrix4();
		this.spineAsset = {
			defaultAnim: 'idle',
			skelFile: "assets/Wrestler-pro.skel",
			atlasFile: "assets/Wrestler-pma.atlas",
			skin: 'Male Wrestler'
		};
		this.slotGroups = {}
		this.slotGroups.skin = ["Head","Nose","arm_upper_far","arm_lower_far","hand_far","leg_upper_far","leg_lower_far","waist","torso","neck","Right Ear","leg_upper_near","leg_lower_near","foot_near","arm_upper_near","arm_lower_near","hand_near"];
		this.slotGroups.pantLegs = ["Far Upper Pant Leg","Near Upper Pant Leg","Far Lower Pant Leg","Near Lower Pant Leg"];
		this.slotGroups.shoes = ["shoe_far","shoe_near"];
		this.slotGroups.shins = ["Far Shin","Near Shin"];
		this.slotGroups['Shirt Body'] = ['Shirt Body'];
		this.slotGroups['Shirt Sleeves'] = ["Shirt Far Upper Sleeve","Shirt Near Upper Sleeve","Shirt Far Lower Sleeve","Shirt Near Lower Sleeve"];
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
		this.assetManager.loadBinary(this.spineAsset.skelFile);
		this.assetManager.loadTextureAtlas(this.spineAsset.atlasFile);
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
			this.figure = this.loadFigure(this.spineAsset.defaultAnim, true);
			this.setPartColor('skin',{ r: .75, g: .6, b: .5, a: 1});
			this.lastFrameTime = Date.now() / 1000;
			requestAnimationFrame(this.renderFigure); // Loading is done, call render every frame.
		} else {
			requestAnimationFrame(this.loadSkeleton);
		}
	}
	loadFigure (initialAnimation, premultipliedAlpha) {
		// Load the texture atlas from the AssetManager.
		var atlas = this.assetManager.get(this.spineAsset.atlasFile);

		// Create a AtlasAttachmentLoader that resolves region, mesh, boundingbox and path attachments
		var atlasLoader = new spine.AtlasAttachmentLoader(atlas);

		// Create a SkeletonBinary instance for parsing the .skel file.
		var skeletonBinary = new spine.SkeletonBinary(atlasLoader);

		// Set the scale to apply during parsing, parse the file, and create a new skeleton.
		skeletonBinary.scale = 1;
		var skeletonData = skeletonBinary.readSkeletonData(this.assetManager.get(this.spineAsset.skelFile));
		if (!initialAnimation) {
			initialAnimation = skeletonData.animations[0].name;
		}
		this.skeleton = new spine.Skeleton(skeletonData);
		console.log('skel',this.skeleton);
		if (this.spineAsset.skin) {
			this.skeleton.setSkinByName(this.spineAsset.skin);
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
	setPartColor(part,color) {
		if (!!part && !!this.slotGroups[part]) {
			for (var i in this.slotGroups[part]) {
				this.setSlotColor(this.slotGroups[part][i],color);
			}
			if (!!this.editor && !!this.editor.parts) {
				this.editor.parts[part].color = color;
			}
		}
	}
	setPartStyle(part,attachment) {
		if (!!part && !!this.slotGroups[part]) {
			for (var i in this.slotGroups[part]) {
				this.skeleton.setAttachment(this.slotGroups[part][i],attachment);
			}
			if (!!this.editor && !!this.editor.parts) {
				this.editor.parts[part].attachment = attachment;
			}
		}
	}
	componentDidMount() {
		this.initCanvas();
	}
	render() {
		return (
			<div>
				<EditorPanel app={this} />
			</div>
		);
	}
}


ReactDOM.render(
	<App />,
	document.getElementById('root')
);

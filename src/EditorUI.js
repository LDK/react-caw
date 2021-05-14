import React, { Component } from 'react';
import { Config } from './config.js';
import Range from './Range.js';
import { SketchPicker } from 'react-color';

function ucfirst(text) {
	return text.charAt(0).toUpperCase() + text.slice(1);
}
function ColorPicker(props) {
	if (!props.editor.state.colorPickerOpen) {
		return null;
	}
	return <SketchPicker color={props.color || null} onChange={props.onChange || null} />;
}
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
function PartRow(props) {
	var part = props.part;
	var editor = props.editor;
	var styleValue = editor.parts[part].attachment || Config.DEFAULT_STYLES[part];
	var options = [];
	for (var i in Config.PART_STYLES[part]) {
		var style = Config.PART_STYLES[part][i];
		options.push(<option key={i} value={style}>{style}</option>);
	}
	return (
		<div className="row no-gutters partRow my-2">
			<div className="col-9">
				<label>{ucfirst(part)}</label>
				<select className="stylePicker" id={part} value={styleValue} onChange={editor.handleStyleChange} rel={part}>
					{options}
				</select>
			</div>
			<div className="col-3">
				<label>Color</label>
				<ColorSwatch color={editor.parts[part].color} part={part} editor={editor} onClick={editor.openColorPicker} />
			</div>
		</div>
	);
}
class EditorUI extends React.Component {
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
				attachment: Config.DEFAULT_STYLES['Shirt Body'],
				color: Config.DEFAULT_COLORS['Shirt Body']
			},
			'trunks': {
				attachment: Config.DEFAULT_STYLES['trunks'],
				color: Config.DEFAULT_COLORS['trunks']
			},
			'wrist': {
				attachment: Config.DEFAULT_STYLES['wrist'],
				color: Config.DEFAULT_COLORS['wrist']
			},
			'Shirt Sleeves': {
				attachment: Config.DEFAULT_STYLES['Shirt Sleeves'],
				color: Config.DEFAULT_COLORS['Shirt Sleeves']
			},
			'Pant Legs': {
				attachment: Config.DEFAULT_STYLES['Pant Legs'],
				color: Config.DEFAULT_COLORS['Pant Legs']
			},
			'shoes': {
				attachment: Config.DEFAULT_STYLES['shoes'],
				color: Config.DEFAULT_COLORS['shoes']
			},
			'Hair Front': {
				attachment: Config.DEFAULT_STYLES['Hair Front'],
				color: Config.DEFAULT_COLORS['Hair Front']
			},
			'Hair Back': {
				attachment: Config.DEFAULT_STYLES['Hair Back'],
				color: Config.DEFAULT_COLORS['Hair Back']
			},
			'Facial Hair': {
				attachment: Config.DEFAULT_STYLES['Facial Hair'],
				color: Config.DEFAULT_COLORS['Facial Hair']
			},
			'shins': {
				attachment: Config.DEFAULT_STYLES['shins'],
				color: Config.DEFAULT_COLORS['shins']
			},
			'laces': {
				attachment: Config.DEFAULT_STYLES['laces'],
				color: Config.DEFAULT_COLORS['laces']
			},
			'Knee Pads': {
				attachment: Config.DEFAULT_STYLES['Knee Pads'],
				color: Config.DEFAULT_COLORS['Knee Pads']
			},
			'Elbow Pads': {
				attachment: Config.DEFAULT_STYLES['Elbow Pads'],
				color: Config.DEFAULT_COLORS['Elbow Pads']
			}
		};
		this.transforms = {
			torso: {
				scaleX: 1.2,
				scaleY: 1.15
			},
			Head: {
				scaleX: 1,
				scaleY: 1
			},
			arm_upper_near: {
				scaleX: 1.1,
				scaleY: 1.1
			},
			arm_upper_far: {
				scaleX: 1.1,
				scaleY: 1.1
			},
			arm_lower_near: {
				scaleX: 1.1,
				scaleY: 1.1
			},
			arm_lower_far: {
				scaleX: 1.1,
				scaleY: 1.1
			},
			leg_upper_near: {
				scaleX: 1.1,
				scaleY: 1.1
			},
			leg_upper_far: {
				scaleX: 1.1,
				scaleY: 1.1
			},
			leg_lower_near: {
				scaleX: 1.1,
				scaleY: 1.1
			},
			leg_lower_far: {
				scaleX: 1.1,
				scaleY: 1.1
			},
			hand_near: {
				scaleX: 1.1,
				scaleY: 1.1
			},
			hand_far: {
				scaleX: 1.1,
				scaleY: 1.1
			}
		};
		this.handleColorChange = this.handleColorChange.bind(this);
		this.handleStyleChange = this.handleStyleChange.bind(this);
		this.openColorPicker = this.openColorPicker.bind(this);
		this.openPanel = this.openPanel.bind(this);
		this.openSubpanel = this.openSubpanel.bind(this);
		this.updateTransform = this.updateTransform.bind(this);
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
	updateTransform(part,transform,value) {
		if (typeof part == 'object') {
			for (var i in part) {
				if (typeof transform == 'object') {
					for (var j in transform) {
						this.transforms[part[i]][transform[j]] = value;
						this.props.app.skeleton.findBone(part[i]).data[transform[j]] = value;
					}
				}
				else {
					this.transforms[part[i]][transform] = value;
					this.props.app.skeleton.findBone(part[i]).data[transform] = value;
				}
			}
		}
		else {
			if (typeof transform == 'object') {
				for (var j in transform) {
					this.transforms[part][transform[j]] = value;
					this.props.app.skeleton.findBone(part).data[transform[j]] = value;
				}
			}
			else {
				this.transforms[part][transform] = value;
				this.props.app.skeleton.findBone(part).data[transform] = value;
			}
		}
		this.setState({ updated: Date.now });
	}
	componentDidMount() {
		this.props.app.initCanvas();
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
					switch (this.state.subpanel) {
						case 'body':
							openPanel = (
								<div id="body-panel" className="row">
									<a className="d-block arrow-link-back col-12" onClick={() => this.openSubpanel(false)}>Back to Physical</a>
									<div className="part-group col-6 p-3" rel="torso">
										<Range label="Torso Length" inputClass="torso-scaleX col-10 px-0 mx-auto" meterClass="pl-2 d-none" callback={() => { this.updateTransform('torso','scaleX',event.target.value) }} min="1.1" max="1.45" step=".05" value={this.transforms.torso.scaleX} />
										<Range label="Torso Width" inputClass="torso-scaleY col-10 px-0 mx-auto" meterClass="pl-2 d-none" callback={() => { this.updateTransform('torso','scaleY',event.target.value) }} min=".9" max="1.6" step=".05" value={this.transforms.torso.scaleY} />
									</div>
									<div className="part-group col-6 p-3" rel="arms">
										<Range label="Arm Length" inputClass="arms-scaleX col-10 px-0 mx-auto" meterClass="pl-2 d-none" callback={() => { this.updateTransform(['arm_upper_near','arm_upper_far','arm_lower_near','arm_lower_far'],'scaleX',event.target.value) }} min=".95" max="1.3" step=".05" value={this.transforms.arm_upper_near.scaleX} />
										<Range label="Arm Width" inputClass="arms-scaleY col-10 px-0 mx-auto" meterClass="pl-2 d-none" callback={() => { this.updateTransform(['arm_upper_far','arm_upper_near'],'scaleY',event.target.value) }} min="1" max="1.25" step=".05" value={this.transforms.arm_upper_near.scaleY} />
										<Range label="Hand Size" inputClass="hands-scale col-10 px-0 mx-auto" meterClass="pl-2 d-none" callback={() => { this.updateTransform(['hand_far','hand_near'],['scaleY','scaleX'],event.target.value) }} min="1" max="1.15" step=".01" value={this.transforms.hand_far.scaleY} />
									</div>
								</div>
							);
						break;
						case 'head':
							openPanel = (
								<div id="head-panel">
									<a className="d-block arrow-link-back" onClick={() => this.openSubpanel(false)}>Back to Physical</a>									<Range label="Head Length" inputClass="Head-scaleX col-8 px-0 mx-auto" meterClass="pl-2 d-none" callback={() => { this.updateTransform('Head','scaleX',event.target.value) }} min=".9" max="1.1" step=".01" value={this.transforms.Head.scaleX} />
									<Range label="Head Width" inputClass="Head-scaleY col-8 px-0 mx-auto" meterClass="pl-2 d-none" callback={() => { this.updateTransform('Head','scaleY',event.target.value) }} min=".95" max="1.05" step=".01" value={this.transforms.Head.scaleY} />
									<PartRow part="Hair Front" label="Hair (Front)" editor={this} />
									<PartRow part="Hair Back" label="Hair (Back)" editor={this} />
									<PartRow part="Facial Hair" editor={this} />
								</div>
							);
						break;
						case 'legs':
							openPanel = (
								<div id="legs-panel">
									<a className="d-block arrow-link-back" onClick={() => this.openSubpanel(false)}>Back to Physical</a>
									<Range label="Leg Length" inputClass="legs-scaleX col-8 px-0 mx-auto" meterClass="pl-2 d-none" callback={() => { this.updateTransform(['leg_upper_near','leg_upper_far','leg_lower_near','leg_lower_far'],'scaleX',event.target.value) }} min=".95" max="1.3" step=".05" value={this.transforms.leg_upper_near.scaleX} />
									<Range label="Leg Width" inputClass="legs-scaleY col-8 px-0 mx-auto" meterClass="pl-2 d-none" callback={() => { this.updateTransform(['leg_upper_far','leg_upper_near'],'scaleY',event.target.value) }} min="1" max="1.4" step=".04" value={this.transforms.leg_upper_near.scaleY} />
								</div>
							);
						break;
						default:
							openPanel = (
								<div id="physical-panel">
									<label>Skin Color</label>
									<ColorSwatch part="skin" color={this.parts.skin.color} onClick={this.openColorPicker} />
									<a className="d-block arrow-link" onClick={() => this.openSubpanel('head')}>Head</a>
									<a className="d-block arrow-link" onClick={() => this.openSubpanel('body')}>Body</a>
									<a className="d-block arrow-link" onClick={() => this.openSubpanel('legs')}>Legs</a>
								</div>
							);
						break;
					}
				break;
				case 'gear':
					switch (this.state.subpanel) {
						case 'clothing':
							openPanel = (
								<div id="clothing-panel">
									<a className="d-block arrow-link-back" onClick={() => this.openSubpanel(false)}>Back to Gear</a>
									<PartRow part="trunks" editor={this} />
									<PartRow part="Pant Legs" editor={this} />
									<PartRow part="Shirt Body" label="Shirt Base" editor={this} />
									<PartRow part="Shirt Sleeves" editor={this} />
								</div>
							);
						break;
						case 'footwear':
							openPanel = (
								<div id="footwear-panel">
									<a className="d-block arrow-link-back" onClick={() => this.openSubpanel(false)}>Back to Gear</a>
									<PartRow part="shoes" editor={this} />
									<PartRow part="shins" editor={this} />
									<PartRow part="laces" editor={this} />
								</div>
							);
						break;
						case 'accessories':
							openPanel = (
								<div id="accessories-panel">
									<a className="d-block arrow-link-back" onClick={() => this.openSubpanel(false)}>Back to Gear</a>
									<PartRow part="Knee Pads" editor={this} />
									<PartRow part="Elbow Pads" editor={this} />
									<PartRow part="wrist" editor={this} />
								</div>
							);
						break;
						default:
							openPanel = (
								<div id="gear-panel">
									<a className="d-block arrow-link" onClick={() => this.openSubpanel('clothing')}>Clothing</a>
									<a className="d-block arrow-link" onClick={() => this.openSubpanel('footwear')}>Footwear</a>
									<a className="d-block arrow-link" onClick={() => this.openSubpanel('accessories')}>Accessories</a>
								</div>
							);
						break;
					}
				break;
			}
		}
		else {
			function rgb255(rgb) {
				return { r: rgb.r * 255, g: rgb.g * 255, b: rgb.b * 255, a: 100 };
			}
			openPanel = (<ColorPicker onChange={ this.handleColorChange } editor={this} color={ rgb255(this.parts[this.state.selectedPart].color) } />);
		}
		return (
			<div id="editorUI">
				<ul className="tabs">
					<li className={(this.state.selectedPanel == 'general') ? ' selected' : '' }><a onClick={() => this.openPanel('general')} className="d-block">General</a></li>
					<li className={(this.state.selectedPanel == 'physical') ? ' selected' : '' }><a onClick={() => this.openPanel('physical')} className="d-block">Physical</a></li>
					<li className={(this.state.selectedPanel == 'gear') ? ' selected' : '' }><a onClick={() => this.openPanel('gear')} className="d-block">Gear</a></li>
				</ul>
				{openPanel}
			</div>
		);
	}
}

export default EditorUI;
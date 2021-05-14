import React, { Component } from 'react';
import ReactDOM from 'react-dom';

class Range extends React.Component {
	constructor(props) {
		super(props);
		this.callback = this.callback.bind(this);
		this.toggleMode = this.toggleMode.bind(this);
		this.state = {
			value: props.value || 0,
			mode: props.mode || 'range',
			displayValue: props.displayValue || null
		};
	}
	callback(event) {
		this.setState({ value: event.target.value });
		this.props.callback(event.target.value,this.props.params || {});
	}
	toggleMode() {
		var mode = (this.state.mode == 'range') ? 'text' : 'range';
		this.setState({mode: mode});
	}
	renderRange() {
		var label = null;
		if (!!this.props.label) {
			label = <label>{this.props.label}</label>;
		}
		return (
			<div className={"meter " + (this.props.className || '')}>
				{label}
				<input className={this.props.inputClass || ''} type="range"
					value={this.props.value || 0}
					orient={this.props.orient || 'horizontal'}
					min={this.props.min || 0}
					max={this.props.max || 100}
					step={this.props.step || 1}
					name={this.props.inputName}
					onChange={this.callback}
					tabIndex="-1" >
				</input>
				<span 
					onClick={this.toggleMode} 
					className={'meter-display ' + (this.props.inputClass || '') + ' ' + (this.props.meterClass || '')}>{this.props.value || 0}</span>
			</div>
		);
	}
	renderText() {
		return (
			<div className={"meter " + (this.props.className || '')}>
				<input className={this.props.inputClass || ''} type="range"
					value={this.props.value || 0}
					orient={this.props.orient || 'horizontal'}
					min={this.props.min || 0}
					max={this.props.max || 100}
					step={this.props.step || 1}
					name={this.props.inputName}
					onChange={this.callback}
					tabIndex="-1" >
				</input>
				<input type="text" 
					onChange={this.callback} 
					className={this.props.textInputClass || 'meter-display col-4 px-0 mx-2'}
					value={this.state.value || 0} 
					name={this.props.inputName} 
					onBlur={this.toggleMode} 
				/>
			</div>
		);
	}
	render() {
		switch (this.state.mode) {
			case 'text':
				var output = this.renderText();
				break;
			case 'range':
			default:
				var output = this.renderRange();
				break;
		}
		return output;
	}
}
// ========================================

export default Range;

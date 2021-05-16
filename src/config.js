//Config.js
function rgb(r,g,b) {
	return { r: r, g: g, b: b, a: 1 };
}
var slotGroups = {}
slotGroups.skin = ["Head","Nose","arm_upper_far","arm_lower_far","hand_far","leg_upper_far","leg_lower_far","waist","torso","neck","Right Ear","leg_upper_near","leg_lower_near","foot_near","arm_upper_near","arm_lower_near","hand_near"];
slotGroups['Pant Legs'] = ["Far Upper Pant Leg","Near Upper Pant Leg","Far Lower Pant Leg","Near Lower Pant Leg"];
slotGroups.shoes = ["shoe_far","shoe_near"];
slotGroups.shins = ["Far Shin","Near Shin"];
slotGroups.laces = ["Far Laces","Near Laces"];
slotGroups.wrist = ["Far Wrist Accessory", "Near Wrist Accessory"];
slotGroups.trunks = ["trunks"];
slotGroups['Shirt Body'] = ['Shirt Body'];
slotGroups['Hair Front'] = ['Hair Front'];
slotGroups['Hair Back'] = ['Hair Back'];
slotGroups['Facial Hair'] = ['Facial Hair'];
slotGroups['Facial Hair'] = ['Facial Hair'];
slotGroups['Shirt Sleeves'] = ["Shirt Far Upper Sleeve","Shirt Near Upper Sleeve","Shirt Far Lower Sleeve","Shirt Near Lower Sleeve"];
slotGroups['Elbow Pads'] = ["Near Lower Elbow Pad", "Near Upper Elbow Pad", "Shirt Far Lower Elbow Pad", "Shirt Far Upper Elbow Pad"];
slotGroups['Knee Pads'] = ["Near Lower Knee Pad", "Near Upper Knee Pad", "Far Lower Knee Pad", "Far Upper Knee Pad"];
slotGroups['Eyebrows'] = ['Left Eyebrow'];

export const Config = {
	slotGroups: slotGroups,
	spineAsset: {
		defaultAnim: 'idle',
		skelFile: "assets/Wrestler.skel",
		atlasFile: "assets/Wrestler.atlas.txt",
		skin: 'Male Wrestler'
	},
	animationLoop: ['idle','idle','idle','idle','idle','idle','idle','idle','walk','walk','walk','walk','walk2','walk2','walk2','walk2','run','run','run','run','run','run','punch1','punch3','punch2','Quick Headbutt'],
	PART_STYLES: {
		'Shirt Body': ['None','Style 1','Bodysuit'],
		'Shirt Sleeves': ['None','Style 1','Bodysuit'],
		'trunks': ['Style 1','Style 2'],
		'wrist': ['None','Tape 1'],
		'Pant Legs': ['None','Tights 1'],
		'shoes': ['Style 1'],
		'shins': ['None', 'Boot Top 1'],
		'laces': ['None','Style 1'],
		'Hair Front': ['None','Style 1','Style 2','Style 3','Style 4'],
		'Hair Back': ['None','Style 1','Style 4'],
		'Facial Hair': ['None','Style 1','Style 2','Style 3','Style 4','Style 5','Style 6','Style 7','Style 8'],
		'Elbow Pads': ['None','Style 1'],
		'Knee Pads': ['None','Style 1']
	},
	DEFAULT_TRANSFORMS: {
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
			},
			'Left Eyebrow': {
				scaleX: .95,
				scaleY: .95,
				y: -120.7,
				x: 68.25
			},
			'Right Eyebrow': {
				scaleX: .95,
				scaleY: .95,
				y: -83.15,
				x: 77.4
			}
		},
	DEFAULT_COLORS : {
		'Shirt Body': rgb(1,1,1),
		'Shirt Sleeves': rgb(1,1,1),
		'trunks': rgb(0,0,0),
		'wrist': rgb(1,1,1),
		'Pant Legs': rgb(0,0,0),
		'shoes': rgb(0,0,0),
		'shins': rgb(0,0,0),
		'laces': rgb(1,1,1),
		'Hair Front': rgb(0,0,0),
		'Hair Back': rgb(0,0,0),
		'Facial Hair': rgb(0,0,0),
		'Elbow Pads': rgb(0,0,0),
		'Knee Pads': rgb(0,0,0)
	},
	DEFAULT_STYLES: {
		'Shirt Body': 'None',
		'Shirt Sleeves': 'None',
		'trunks': 'Style 1',
		'wrist': 'None',
		'shoes': 'Style 1',
		'shins': 'Boot Top 1',
		'laces': 'Style 1',
		'Pant Legs': 'None',
		'Hair Front': 'None',
		'Hair Back': 'None',
		'Facial Hair': 'None',
		'Elbow Pads': 'Style 1',
		'Knee Pads': 'Style 1'
	}
};

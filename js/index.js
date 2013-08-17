//*****
//
//This is your seaquence. click 'Init' to apply.
//
//*****
var defaultData = 
{"values":[{"p":5000,"order":0,"active":false,"valueId":1376619604782,"x":0,"y":0,"z":-4443,"rx":87,"rz":-179,"s":"0.19"},{"p":3360,"order":3,"active":false,"valueId":1376625201152,"x":0,"y":105,"z":1915,"rx":92,"rz":-180,"s":"1.18"},{"p":6970,"order":4,"active":true,"valueId":1376647798076,"x":0,"y":105,"z":1915,"rx":91,"rz":-180,"s":"1.18"},{"p":2190,"order":5,"active":false,"valueId":1376625239792,"x":0,"y":95,"z":1202,"rx":88,"rz":-29,"s":"1.18"},{"p":5760,"order":6,"active":false,"valueId":1376625299042,"x":0,"y":80,"z":1915,"rx":133,"rz":140,"s":"1.18"},{"p":5000,"order":7,"active":false,"valueId":1376625340258,"x":0,"y":25,"z":1915,"rx":35,"rz":228,"s":"0.20"},{"p":5000,"order":8,"active":false,"valueId":1376639687450,"x":-265,"y":230,"z":1915,"rx":35,"rz":228,"s":"0.20"},{"p":5000,"order":9,"active":false,"valueId":1376639740459,"x":210,"y":-130,"z":1915,"rx":35,"rz":228,"s":"0.20"},{"p":5000,"order":10,"active":false,"valueId":1376625419137,"x":0,"y":25,"z":-2750,"rx":88,"rz":180,"s":"1.00"},{"p":4240,"order":11,"active":false,"valueId":1376647762906,"x":0,"y":25,"z":-4781,"rx":88,"rz":180,"s":"1.00"},{"p":1910,"order":12,"active":false,"valueId":1376625468717,"x":0,"y":25,"z":4013,"rx":88,"rz":180,"s":"1.05"}],"setting":{"duration":"14","timingFunction":"ease-out"}}

var lastValue;
var vendarPrefix;
function getDefaultValues(){
	return defaultData.values;
}

function getDefaultAnimationSetting(){
	return defaultData.setting;
}

function loadValues(){
	var values;
	var savedValues = window.localStorage.getItem('values');
	if( savedValues == null ){
		values = getDefaultValues();
		window.localStorage.setItem('values', JSON.stringify(values));
	}else{
		values = JSON.parse(savedValues);
	}
	return values;
}

function transform(){
	var outline = document.getElementById("outline");
	var item = getHandleValues();
	outline.style.setProperty(vendarPrefix + "transform", makeTransformString(item));
}

function resetHandleValue(){
	var values = getInitialHandleValues();
	setHandleValue(values);
}

function setHandleValue(value){
	
	var rc = $('#rotationController');
	var sc = $('#scaleController');
	var pc = $('#perspectiveController');
	var xc = $('#xController');	
	var zc = $('#zController');		
	
	var rx, ry, sy, py, x, y, z;
	
	var documentW = $(document).width();
	var documentH = $(document).height();
	
	var hW = documentW / 2;
	var hH = documentH / 2;
	
	x = value.x / getRateX() * hW + hW;
	xc.css('left', x +'px');
	
	y = value.y / getRateY() * hH + hH;
	xc.css('top', y +'px');

	z = value.z / getRateZ() * hH + hH;
	zc.css('top', z +'px');

	sy = value.s / getRateS() * hH + hH;
	sc.css('top', sy + 'px');
	
	py = value.p / 10;
	pc.css('top', py + 'px');
	
	rx = value.rz / getRateR() * hW + hW;
	ry = value.rx / getRateR() * hH + hH;
	rc.css('left', rx + 'px');
	rc.css('top', ry + 'px');
	
	lastValue = value;
	
	var outline = document.getElementById("outline");
	outline.style.setProperty(vendarPrefix + "transform", makeTransformString(value));

}

function getHandleValues(){
	
	var r = $('#rotationController');
	var s = $('#scaleController');
	var p = $('#perspectiveController');	
	var xc = $('#xController');
	var zc = $('#zController');		
	
	rx = parseInt(r.css('left'));
	ry = parseInt(r.css('top'));	
	sy = parseInt(s.css('top'));
	py = parseInt(p.css('top'));
	x = parseInt(xc.css('left'));
	y = parseInt(xc.css('top'));	
	z = parseInt(zc.css('top'));		
	
	if(py < 0){
		py = 0;
	}
	if(rx == null){
		rx = 0;	
	}
	if(ry == null){
		ry = 0;	
	}	
	if(sy == null){
		sy = 1;	
	}
	if(rx == null){
		py = 0;	
	}
	
	var documentW = $(document).width();
	var documentH = $(document).height();
	
	var hW = documentW / 2;
	var hH = documentH / 2;
	
	var valueZ = Math.round( getRateR() * Math.round(rx - hW)/hW );
	var valueX = Math.round( getRateR() * Math.round(ry - hH)/hH );
	
	var valueS = ( (Math.round(sy - hH)/hH) * getRateS() ).toFixed(2);
	
	var valueP = py*10;

	var transX = Math.round( (getRateX()*Math.round(x - hW)/hW) );
	var transY = Math.round( (getRateY()*Math.round(y - hH)/hH) );
	var transZ = Math.round( (getRateZ()*Math.round(z - hH)/hH) );
	
	var values = {
		x:transX,
		y:transY,
		z:transZ,
		rx:valueX,
		rz:valueZ,
		s:valueS,
		p:valueP,
		valueId:generateId()
	}
	
	lastValue = values;
	
	return values;
}

function getInitialHandleValues(){
	var values = {
		x:0,
		y:0,
		z:0,
		rx:0,
		rz:0,
		s:1,
		p:5000
	}
	return values;
}

function generateId(){
	return +new Date();
}

function loadAnimationSetting(){
	var settingValue;
	var setting = window.localStorage.getItem('animationSetting');
	if( setting == null ){
		settingValue = getDefaultAnimationSetting();
		window.localStorage.setItem('animationSetting', JSON.stringify(settingValue));
	}else{
		settingValue = JSON.parse(setting);
	}
	return settingValue;

}

function getAnimationValue(){
	return {
		duration: $('#duration').val(),
		timingFunction: $('#timingFunction').val()
	};
}

function getRateX(){
	return 2000;
}

function getRateY(){
	return 2000;
}

function getRateZ(){
	return 5000;
}

function getRateS(){
	return 5;
}

function getRateR(){
	return 360;
}

function makeTransformString(values){
	
	$('#rotationController input').val(values.rx+"deg"+" "+values.rz+"deg");
	$('#scaleController input').val(values.s);
	$('#perspectiveController input').val(values.p+ "px");	
	$('#xController input').val(values.x+"px" + " " + values.y+"px");
	$('#zController input').val(values.z+"px");		
	vendarPrefix=getVendorPrefix();
 	var outline = document.getElementById("outline");
	
	var str = generateCSSValueString(values);

	$('#translate').text(str);	
	return str;
}

function generateCSSValueString(values){
	var mode = $("input:radio[name='mode']:checked").val();
	var str;
	if( mode == 0 ){
		str =	'perspective(' + values.p+"px" +')' +' ' + 
				'translate3d(' + values.x+"px" + ',' + values.y+"px" + ',' + values.z+"px" + ')' + ' ' + 
				'rotateX(' + values.rx+"deg" + ')' + ' ' + 
				'rotateZ(' + values.rz+"deg" + ')' +' ' +
				'scale3d(' + values.s + ',' + values.s + ',' + values.s + ')';
	}else{
		str =	'perspective(' + values.p+"px" +')' +' ' + 
				'rotateX(' + values.rx+"deg" + ')' + ' ' + 
				'rotateZ(' + values.rz+"deg" + ')' +' ' +
				'translate3d(' + values.x+"px" + ',' + values.y+"px" + ',' + values.z+"px" + ')' + ' ' + 
				'scale3d(' + values.s + ',' + values.s + ',' + values.s + ')';
	}
	
	return str;
}

function rounded(value){
	var round1 = value*100;
	var round2 = Math.round(round1);
	var round3 = round2/100;
	return round3
}

function removeUnit(value){
	return value.replace(/(px|deg)/g, '');
}

function getVendorPrefix(){
	return (/(Firefox|WebKit|Opera|MSIE)/.test( navigator.userAgent ) )
		? ({
			'Firefox' : '-moz-',
			'WebKit' : '-webkit-',
			'Opera' : '-o-',
			'MSIE' : '-ms-'
		})[ RegExp.$1 ]
		: '';
}

var CSSPropertyTemplate = "\n\t\t{0}:{1};";
var KeyFrameCSSTemplate = "\t{0}{{1}\n\t}\n";
var KeyFramesCSSTemplate = "@{0}keyframes anim{\n{1}}\n";
var StyleTagTemplate = '<style id="animationStyle" type="text/css">{0}</style>';
var AnimationStyleTemplate = "{0}{\n\t{1}\n\t}\n";

function generateKeyframesCSSOfValues(values){
	var keyframesCSS = "";
	var count = values.length;
	
	var keyframeNames = [];
	if( count == 0 ){
		return keyframesCSS;
	}else if( count == 1 ){
		keyframeNames.push('100%');
	}else{
		var step = 100 / (count - 1);
		for( var i = 0; i < count - 1; i++ ){
			var keyframeName = Math.round(step * i);
			keyframeName = keyframeName + "%";
			keyframeNames.push(keyframeName);
		}
		
		keyframeNames.push('100%');
	}
	
	var keyframesCSSBody = "";
	values.forEach(function(value, index){
		var cssValue = generateCSSValueString(value);
		var keyframeName = keyframeNames[index];
		
		var translateName = vendarPrefix + "transform";
		var cssProperty = substitute(CSSPropertyTemplate, [translateName, cssValue]);
		var keyframeCSS = substitute(KeyFrameCSSTemplate, [keyframeName, cssProperty]);
		
		keyframesCSSBody += keyframeCSS;
	});
	
	keyframesCSS = substitute(KeyFramesCSSTemplate, [vendarPrefix, keyframesCSSBody]);
	
	return keyframesCSS;
}

function generateAnimationCSS(option){
	var animationStyle;
	var animationBody = "";
	
	animationBody += vendarPrefix + "animation-name:anim;\n";
	animationBody += vendarPrefix + "animation-iteration-count:infinite;\n";
	animationBody += vendarPrefix + "animation-fill-mode:forwards;\n";
	if( option != null && option.duration != undefined ){
		animationBody += vendarPrefix + "animation-duration:"+ option.duration +"s;\n";
	}else{
		animationBody += vendarPrefix + "animation-duration:5s;\n";
	}
	if( option != null && option.timingFunction != undefined ){
		animationBody += vendarPrefix + "animation-timing-function:"+ option.timingFunction +";\n";
	}else{
		animationBody += vendarPrefix + "animation-timing-function:linear;\n";
	}
	
	animationStyle = substitute(AnimationStyleTemplate, ['#outline', animationBody]);
	
	return animationStyle;
}

//Utils

function clone(obj){
	var jsonObj = JSON.stringify(obj);
	return JSON.parse(jsonObj);
}

function substitute(str, arr){
	var i, pattern, re, n = arr.length;
	for (i = 0; i < n; i++) {
		pattern = "\\{" + i + "\\}";
		re = new RegExp(pattern, "g");
		str = str.replace(re, arr[i]);
	}
	return str; 
}

//Init

$(function(){
	
	vendarPrefix = getVendorPrefix();
	
	var handle = $('#rotationController');
	handle.draggable({
		scroll: false,
		refreshPositions: true,
		drag: function(event, ui){transform();}
	});

	var handle = $('#xController');
	handle.draggable({
		scroll: false,
		refreshPositions: true,
		drag: function(event, ui){transform();}
	});

	var handle = $('#zController, #scaleController, #perspectiveController');
	handle.draggable({
		scroll: false,
		axis: "y",
		refreshPositions: true,
		drag: function(event, ui){transform();}
	});
	
	$('.controllers input').change(function(){
		var inputValue = removeUnit( $(this).val() );
		
		var value = getHandleValues();
		switch($(this).attr('id')){
			case 'xText':
				var values = inputValue.split(' ');
				value.x = values[0];
				value.y = values[1];

			break;
			case 'zText':
				value.z = inputValue;
			break;
			
			case 'rText':
				var values = inputValue.split(' ');
				value.rx = values[0];
				value.rz = values[1];
			break;
			
			case 'sText':
				value.s = inputValue;
			break;
			
			case 'pText':
				values.p = inputValue;
			break;
			
		}
		
		setHandleValue(value);
		
	});
	
	$(window).resize(function(){
		setHandleValue(lastValue);
	});
	
	$("input:radio[name='mode']").change(function(){
		setHandleValue(getHandleValues());
	});
	
	//var exportContainer = '<script type="text/x-handlebars" data-template-name="export"></script>';
	//$('body').append(exportContainer);
	//$('#exportContainer').innerHTML = 'aaa';
	
	resetHandleValue();
});